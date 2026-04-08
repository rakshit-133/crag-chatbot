import requests
from bs4 import BeautifulSoup

def extract_text_from_url(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs])

        return text

    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def scrape_urls(urls):
    documents = []

    for url in urls:
        text = extract_text_from_url(url)

        if len(text) > 200:
            documents.append(text)

    return documents