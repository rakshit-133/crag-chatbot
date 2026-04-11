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

Instructions for your answer:
- Write at least 3 to 4 paragraphs
- Each paragraph should cover a different aspect of the topic
- Each paragraph should be 3 to 5 sentences long
- use bullet points or headers if required
- Write in a clear, informative, and flowing style like you are talking to someone face to face 
- Stay strictly within the provided context, do not add outside knowledge

Question:
{query}

Context:
{context_text}

Answer:
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1024
    )

    return response.choices[0].message.content.strip()