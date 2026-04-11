from langchain_core.documents import Document
from .evaluator import evaluate_document
import spacy

nlp = spacy.load("en_core_web_sm")

# Threshold below which a strip is considered irrelevant and filtered out
STRIP_RELEVANCE_THRESHOLD = 0.4


def split_into_strips(text: str, strip_size: int = 2) -> list[str]:
    """
    Splits a document into fine-grained sentence-level strips.
    Per paper Section 4.4: if text is 1-2 sentences, treat as single strip.
    Otherwise split into small units of a few sentences each.
    """
    doc = nlp(text)
    sentences = [s.text.strip() for s in doc.sents if s.text.strip()]

    if len(sentences) <= 2:
        return [text]

    strips = []
    for i in range(0, len(sentences), strip_size):
        strip = " ".join(sentences[i:i + strip_size])
        if strip:
            strips.append(strip)

    return strips


def refine_documents(query: str, docs_and_scores: list, top_k: int = 5) -> list[str]:
    """
    Implements the CRAG paper's decompose-then-recompose algorithm (Section 4.4).

    Steps:
    1. Decompose each retrieved document into fine-grained strips
    2. Score each strip with the retrieval evaluator
    3. Filter out strips below threshold
    4. Recompose by concatenating relevant strips in order

    Returns a list of refined text strings (internal knowledge) ready for generation.
    """
    all_strips = []

    for doc, _ in docs_and_scores:
        strips = split_into_strips(doc.page_content)
        source = doc.metadata.get("source", "unknown")

        for strip in strips:
            score = evaluate_document(query, strip)
            all_strips.append((strip, score, source))

    # Filter by relevance threshold
    relevant_strips = [
        (strip, score, source)
        for strip, score, source in all_strips
        if score >= STRIP_RELEVANCE_THRESHOLD
    ]

    # Sort by relevance score descending
    relevant_strips.sort(key=lambda x: x[1], reverse=True)

    # Take top_k strips and recompose in original order
    top_strips = relevant_strips[:top_k]

    if not top_strips:
        # Fallback: return raw top doc content if all strips filtered out
        print("Warning: all strips filtered. Using raw top document as fallback.")
        if docs_and_scores:
            return [docs_and_scores[0][0].page_content]
        return []

    # Recompose: concatenate with source attribution
    recomposed = []
    for strip, score, source in top_strips:
        recomposed.append(f"[Source: {source}]\n{strip}")

    return recomposed