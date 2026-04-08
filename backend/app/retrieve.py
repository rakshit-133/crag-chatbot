from langchain_community.vectorstores import FAISS
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings


class HFEmbeddings(Embeddings):
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def embed_documents(self, texts):
        return self.model.encode(texts).tolist()

    def embed_query(self, text):
        return self.model.encode([text])[0].tolist()


def get_retriever():
    embeddings = HFEmbeddings()
    db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    return db.as_retriever(search_kwargs={"k": 3})