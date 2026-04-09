from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
from langchain.embeddings.base import Embeddings
import spacy
from collections import defaultdict

# Load spaCy model
nlp = spacy.load("en_core_web_sm")


class HFEmbeddings(Embeddings):
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed_documents(self, texts):
        return self.model.encode(texts).tolist()

    def embed_query(self, text):
        return self.model.encode([text])[0].tolist()


def split_into_sentences(text):
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if sent.text.strip()]


def build_vectorstore(documents):
    MAX_CHUNKS_PER_URL = 3
    CHUNK_SIZE = 5  # sentences per chunk

    chunks = []
    source_chunk_count = defaultdict(int)

    for doc in documents:
        source = doc.metadata.get("source", "unknown")

        sentences = split_into_sentences(doc.page_content)

        # Create sentence-based chunks
        for i in range(0, len(sentences), CHUNK_SIZE):
            if source_chunk_count[source] >= MAX_CHUNKS_PER_URL:
                break

            chunk_text = " ".join(sentences[i:i + CHUNK_SIZE])

            chunk = Document(
                page_content=chunk_text,
                metadata={"source": source}
            )

            chunks.append(chunk)
            source_chunk_count[source] += 1

    print(f"Total chunks created: {len(chunks)}")

    if len(chunks) == 0:
        raise ValueError("No valid chunks created. Scraping failed or all URLs invalid.")

    embeddings = HFEmbeddings()
    db = FAISS.from_documents(chunks, embeddings)

    return db