from .web_search import search_web
from .scraper import scrape_urls
from .web_ingest import build_vectorstore
from .query_rewrite import rewrite_query

def evaluate_results(results):
    if not results:
        return "bad"

    scores = [score for _, score in results]

    avg_score = sum(scores) / len(scores)
    best_score = scores[0]  # assumes sorted

    if best_score > 0.7:
        return "bad"

    if avg_score > 0.75:
        return "bad"

    if len(results) < 2:
        return "weak"

    return "good"

def run_pipeline(query):
    urls = search_web(query)
    docs = scrape_urls(urls)

    if not docs:
        print("No documents scraped.")
        return []

    db = build_vectorstore(docs)

    docs_and_scores = db.similarity_search_with_score(query, k=10)

    # sort by score (lower is better)
    docs_and_scores = sorted(docs_and_scores, key=lambda x: x[1])

    thresholds = [0., 0.7, 0.8]   # capped at 0.8
    MIN_RESULTS = 2

    selected = []

    # 🔹 dynamic thresholding
    for t in thresholds:
        filtered = [(doc, score) for doc, score in docs_and_scores if score < t]

        if len(filtered) >= MIN_RESULTS:
            print(f"Using threshold {t} → {len(filtered)} chunks")
            selected = filtered
            break
        else:
            print(f"Threshold {t} too strict → only {len(filtered)} chunks")

    # 🔹 fallback
    if not selected:
        print("Using fallback: top results without filtering")
        selected = docs_and_scores

    # 🔹 enforce source diversity (VERY IMPORTANT)
    unique_results = []
    seen_sources = set()

    for doc, score in selected:
        src = doc.metadata.get("source")

        if src not in seen_sources:
            unique_results.append((doc, score))
            seen_sources.add(src)

    return unique_results[:10]




def main():
    query = "iran vs usa"

    print(f"\nOriginal Query: {query}")

    # First attempt
    results = run_pipeline(query)

    if not results:
        print("\nNo results found in initial attempt.")
        return

    # Evaluate using quality instead of count
    quality = evaluate_results(results)

    if quality in ["bad", "weak"]:
        print(f"\nRetrieval quality is {quality}. Rewriting query...")

        new_query = rewrite_query(query)
        print(f"\nNew Query: {new_query}")

        new_results = run_pipeline(new_query)

        new_quality = evaluate_results(new_results)

    # choose better result
        if new_quality == "good" or new_quality == "weak":
            print("\nUsing improved query results")
            results = new_results
        else:
            print("\nRewrite did not improve results")

    else:
        print("\nInitial retrieval was good")

    # Final Output
    print("\nFinal Results:\n")

    if not results:
        print("No results to display.")
        return

    for i, (doc, score) in enumerate(results[:10]):
        print(f"Result {i+1} | Score: {score}")
        print(f"Source: {doc.metadata.get('source')}")
        print(doc.page_content[:1000])  # limit output
        print()


if __name__ == "__main__":
    main()