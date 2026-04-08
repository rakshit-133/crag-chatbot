from .web_search import search_web
from .scraper import scrape_urls
from .web_ingest import build_vectorstore


def main():
    query = "What is attention mechanism in transformers?"

    # Step 1: Web Search
    urls = search_web(query)

    print("\nURLs:")
    for u in urls:
        print(u)

    # Step 2: Scrape
    docs = scrape_urls(urls)
    print(f"\nScraped {len(docs)} documents")

    # Step 3: Build Vector DB
    db = build_vectorstore(docs)

    # Step 4: Retrieve with scores
    docs_and_scores = db.similarity_search_with_score(query, k=5)

    print("\nTop Results with Scores:\n")

    filtered_docs = []

    THRESHOLD = 0.6  #stricter threshold

    for i, (doc, score) in enumerate(docs_and_scores):
        print(f"Result {i+1} | Score: {score}")
        print(doc.page_content[:300])
        print()

        # lower score = better (FAISS distance)
        if score < THRESHOLD:
            filtered_docs.append((doc, score))

    # Step 5: Sort best results
    filtered_docs = sorted(filtered_docs, key=lambda x: x[1])

    print("\nFiltered Best Results:\n")

    for i, (doc, score) in enumerate(filtered_docs[:3]):
        print(f"Result {i+1} | Score: {score}")
        print(doc.page_content[:300])
        print()

    # Step 6: CRAG-style evaluation
    if len(filtered_docs) < 2:
        print("\nRetrieval is WEAK (not enough strong chunks)")
    else:
        print(f"\nRetrieval is STRONG ({len(filtered_docs)} good chunks)")


if __name__ == "__main__":
    main()