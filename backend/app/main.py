from .web_search import search_web
from .scraper import scrape_urls
from .web_ingest import build_vectorstore

query = "What is attention mechanism in transformers?"

# Step 1: search
urls = search_web(query)

print("\nURLs:")
for u in urls:
    print(u)

# Step 2: scrape
docs = scrape_urls(urls)

print(f"\nScraped {len(docs)} documents")

# Step 3: build vector DB
db = build_vectorstore(docs)

# Step 4: retrieve, added relevance scoring
docs_and_scores = db.similarity_search_with_score(query, k=5)

print("\nTop Results with Scores:\n")

filtered_docs = []

for i, (doc, score) in enumerate(docs_and_scores):
    print(f"Result {i+1} | Score: {score}")
    print(doc.page_content[:300])
    print()

    # lower score = better match (FAISS uses distance)
    if score < 1.0:
        filtered_docs.append(doc)