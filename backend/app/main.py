from .web_search import search_web
from .scraper import scrape_urls
from .web_ingest import build_vectorstore
from .query_rewrite import rewrite_query
from .llm import generate_answer
from .evaluator import evaluate_document
from .knowledge_refine import refine_documents

# ── CRAG Thresholds (Section 4.3 of paper) ──────────────────
# We use 0-1 scale (LLM-based evaluator)
UPPER_THRESHOLD = 0.7   # >= this → CORRECT
LOWER_THRESHOLD = 0.3   # <  this → INCORRECT
                        # between → AMBIGUOUS


def determine_action(evaluated_docs):
    """
    Paper's three-action trigger (Section 4.3):
    - CORRECT   → at least one doc scores >= UPPER_THRESHOLD
    - INCORRECT → ALL docs score < LOWER_THRESHOLD
    - AMBIGUOUS → everything in between
    """
    if not evaluated_docs:
        return "INCORRECT"

    scores = [score for _, score in evaluated_docs]

    if max(scores) >= UPPER_THRESHOLD:
        return "CORRECT"

    if max(scores) < LOWER_THRESHOLD:
        return "INCORRECT"

    return "AMBIGUOUS"


def enforce_diversity(results, top_k=5):
    """Keep at most one chunk per source URL."""
    unique_results = []
    seen_sources = set()

    for doc, score in results:
        src = doc.metadata.get("source")

        if src not in seen_sources:
            unique_results.append((doc, score))
            seen_sources.add(src)

        if len(unique_results) >= top_k:
            break

    return unique_results


def retrieve_and_evaluate(query):
    """
    Runs the full retrieval pipeline for a given query.
    Returns (evaluated_docs, action).
    Called separately for original query and rewritten query.
    """
    urls = search_web(query)
    docs = scrape_urls(urls)

    if not docs:
        print("No documents scraped.")
        return [], "INCORRECT"

    db = build_vectorstore(docs)

    retrieved_docs = db.similarity_search(query, k=10)

    evaluated_docs = []
    for doc in retrieved_docs:
        score = evaluate_document(query, doc.page_content)
        evaluated_docs.append((doc, score))

    # Sort: higher score = more relevant
    evaluated_docs = sorted(evaluated_docs, key=lambda x: x[1], reverse=True)

    action = determine_action(evaluated_docs)
    print(f"CRAG Action: {action}")

    return evaluated_docs, action

def run_crag_pipeline(query: str):
    evaluated_docs, action = retrieve_and_evaluate(query)
    
    # Yield the action immediately so the frontend can update the UI
    yield {"action": action}

    contexts = []
    top_docs_for_sources = []

    if action == "CORRECT":
        top_docs_for_sources = enforce_diversity(evaluated_docs, top_k=5)
        contexts = refine_documents(query, top_docs_for_sources, top_k=5)

    elif action == "INCORRECT":
        keyword_query = rewrite_query(query)
        new_docs, _ = retrieve_and_evaluate(keyword_query)

        if not new_docs:
            yield {"answer": "No information found after web search.", "sources": []}
            return

        top_docs_for_sources = enforce_diversity(new_docs, top_k=5)
        contexts = refine_documents(keyword_query, top_docs_for_sources, top_k=5)

    elif action == "AMBIGUOUS":
        top_docs = enforce_diversity(evaluated_docs, top_k=3)
        internal_contexts = refine_documents(query, top_docs, top_k=3)

        keyword_query = rewrite_query(query)
        ext_docs, _ = retrieve_and_evaluate(keyword_query)
        top_ext = enforce_diversity(ext_docs, top_k=3)
        external_contexts = refine_documents(keyword_query, top_ext, top_k=3)

        top_docs_for_sources = top_docs + top_ext
        contexts = internal_contexts + external_contexts

    if not contexts:
        yield {"answer": "No usable context found.", "sources": []}
        return

    # Yield the sources before generation starts
    unique_sources = {}
    for doc, _ in top_docs_for_sources:
        url = doc.metadata.get("source")
        if url and url not in unique_sources:
            unique_sources[url] = {"title": url, "url": url}
            
    yield {"sources": list(unique_sources.values())}

    # Generate and yield the final answer
    answer = generate_answer(query, contexts)
    yield {"answer": answer}

def main():
    """CLI entry point — consumes the generator and prints output."""
    query = "history of clash of clans"
    print(f"\nOriginal Query: {query}")

    for event in run_crag_pipeline(query):
        if event["type"] == "status":
            print(f"  ⏳ {event['message']}")
        elif event["type"] == "action":
            print(f"  🎯 CRAG Action: {event['action']}")
        elif event["type"] == "error":
            print(f"  ❌ {event['message']}")
        elif event["type"] == "answer":
            print("\nFinal Answer:")
            print("=" * 50)
            print(event["content"])


if __name__ == "__main__":
    main()