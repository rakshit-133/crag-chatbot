import os
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY not found in .env file")

client = TavilyClient(api_key=TAVILY_API_KEY)


# Block problematic domains (non-text or hard to scrape)
BAD_DOMAINS = ["youtube.com", "youtu.be", "reddit.com"]

def is_valid_url(url):
    if any(domain in url for domain in BAD_DOMAINS):
        return False
    if url.endswith((".pdf", ".jpg", ".png", ".zip")):
        return False
    return True


def search_web(query, max_results=10):
    try:
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced"  # better quality results
        )

        results = response.get("results", [])

        urls = []
        seen = set()

        for r in results:
            url = r.get("url")

            # Filtering
            if not url:
                continue
            if url in seen:
                continue
            if not is_valid_url(url):
                continue

            urls.append(url)
            seen.add(url)

        print(f"\nFound {len(urls)} valid URLs")

        return urls

    except Exception as e:
        print(f"\nSearch error: {e}")
        return []