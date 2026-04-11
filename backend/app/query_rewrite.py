import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def rewrite_query(query: str) -> str:
    """
    Rewrites the query into short, search-engine-style keywords.
    Mirrors the approach from the CRAG paper (Appendix A).
    """

    prompt = f"""Extract at most three keywords separated by commas from the question below.
These keywords will be used as a web search query, so they should be short and specific.

Examples:
Question: What is Henry Feilden's occupation?
Keywords: Henry Feilden, occupation

Question: In what city was Billy Carlson born?
Keywords: city, Billy Carlson, born

Question: What is the religion of John Gwynn?
Keywords: religion, John Gwynn

Question: {query}
Keywords:"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        rewritten = response.choices[0].message.content.strip()
        # Fallback: if LLM returns something weird, use original
        if not rewritten or len(rewritten) > 200:
            return query
        return rewritten

    except Exception as e:
        print(f"Query rewrite error: {e}")
        return query