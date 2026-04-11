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


def main():
    query = "history of clash of clans"

    print(f"\nOriginal Query: {query}")

    # ── Step 1: Retrieve and evaluate ───────────────────────
    evaluated_docs, action = retrieve_and_evaluate(query)

    # ── Step 2: Route based on action ───────────────────────

    # CORRECT → refine internal web chunks only
    if action == "CORRECT":
        print("\n[CORRECT] Refining retrieved documents...")
        top_docs = enforce_diversity(evaluated_docs, top_k=5)
        contexts = refine_documents(query, top_docs, top_k=5)

    # INCORRECT → discard, rewrite query, new web search
    elif action == "INCORRECT":
        print("\n[INCORRECT] Discarding results. Rewriting query for new search...")
        keyword_query = rewrite_query(query)
        print(f"Rewritten Query: {keyword_query}")

        new_docs, _ = retrieve_and_evaluate(keyword_query)

        if not new_docs:
            print("Second search also returned nothing.")
            return

        top_docs = enforce_diversity(new_docs, top_k=5)
        contexts = refine_documents(keyword_query, top_docs, top_k=5)

    # AMBIGUOUS → refine internal + new web search, combine both
    elif action == "AMBIGUOUS":
        print("\n[AMBIGUOUS] Combining internal and external knowledge...")

        # Internal: refine current results
        top_docs = enforce_diversity(evaluated_docs, top_k=3)
        internal_contexts = refine_documents(query, top_docs, top_k=3)

        # External: rewrite + new search
        keyword_query = rewrite_query(query)
        print(f"Rewritten Query for web: {keyword_query}")

        ext_docs, _ = retrieve_and_evaluate(keyword_query)
        top_ext = enforce_diversity(ext_docs, top_k=3)
        external_contexts = refine_documents(keyword_query, top_ext, top_k=3)

        # Combine both (paper: k = k_in + k_ex)
        contexts = internal_contexts + external_contexts

    # ── Step 3: Safety check ────────────────────────────────
    if not contexts:
        print("\nNo usable context found. Cannot generate answer.")
        return

    # ── Step 4: Generate final answer ───────────────────────
    print(f"\nTotal context strips: {len(contexts)}")
    print("\nGenerating final answer...\n")

    answer = generate_answer(query, contexts)

    print("\nFinal Answer:")
    print("=" * 50)
    print(answer)


if __name__ == "__main__":
    main()