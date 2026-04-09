from langchain_core.documents import Document
import requests
from bs4 import BeautifulSoup


def extract_text_from_url(url):
    try:
        response = requests.get(url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0"
        })

        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove unwanted elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        paragraphs = soup.find_all("p")

        text = " ".join([p.get_text().strip() for p in paragraphs])

        # Clean spaces
        text = " ".join(text.split())

        # Skip empty / weak content
        if not text or len(text) < 200:
            return None

        return text

    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None


def scrape_urls(urls):
    documents = []

    for url in urls:
        print(f"Scraping: {url}")

        text = extract_text_from_url(url)

        # Skip bad or empty pages
        if text is None:
            print(f"Skipped (low content): {url}")
            continue

        doc = Document(
            page_content=text,
            metadata={"source": url}
        )

        documents.append(doc)

    print(f"\nTotal valid documents: {len(documents)}")

    return documents