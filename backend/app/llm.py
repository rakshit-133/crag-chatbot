import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_answer(query, contexts):
    """
    query: user query
    contexts: list of retrieved chunks (strings)
    """

    context_text = "\n\n".join(contexts)

    prompt = f"""
You are an intelligent assistant. Answer the question using ONLY the provided context.

If the context is insufficient, say "I don't have enough information."

Question:
{query}

Context:
{context_text}

Answer:
"""

    response = client.chat.completions.create(
        model = "llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content.strip()