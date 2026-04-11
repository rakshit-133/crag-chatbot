import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def evaluate_document(query, document):
    prompt = f"""
You are a retrieval evaluator.

Task:
Determine if the document contains useful information to answer the query.

Query:
{query}

Document:
{document}

Answer ONLY in this format:
Score: <number between 0 and 1>

Guidelines:
- 1.0 → highly relevant, directly answers query
- 0.5 → partially relevant
- 0.0 → irrelevant
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        output = response.choices[0].message.content.strip()

        # Extract score safely
        import re
        match = re.search(r"([0-1]\.\d+|1\.0|0\.0)", output)

        if match:
            return float(match.group(1))
        else:
            return 0.0

    except Exception as e:
        print(f"Evaluator error: {e}")
        return 0.0