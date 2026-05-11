# CRAG - Corrective Retrieval Augmented Generation

**A self-correcting RAG pipeline that evaluates retrieval quality, triggers intelligent actions, and refines knowledge before generating answers.**

[Overview](#overview) | [Features](#key-features) | [Architecture](#architecture) | [Installation](#installation) | [Usage](#usage)

## Overview

Traditional Retrieval-Augmented Generation (RAG) systems blindly trust retrieved documents. When retrieval fails, the system hallucinates. **CRAG solves this** by introducing a rigorous **retrieval evaluator** that assesses document quality and dictates the next steps:

* **[CORRECT]** -> Refines retrieved documents with precise sentence-level filtering.

* **[AMBIGUOUS]** -> Combines internal context with a fresh external web search.

* **[INCORRECT]** -> Discards bad results, rewrites the query, and searches the web again.

### The CRAG Solution

```text
Query -> Retrieve -> Evaluate -> Action Trigger
                                      |
                ---------------------------------------------
                |                     |                     |
            CORRECT               AMBIGUOUS             INCORRECT
        (Refine strips)      (Internal + Web)      (Rewrite + Search)
                |                     |                     |
                ---------------------------------------------
                                      |
                             Generate Final Answer
```

## Key Features

### Intelligent Retrieval Evaluation

* **Zero-Shot Evaluator:** Utilizes LLaMA-3.1-8b to score each retrieved chunk on a scale of 0.0 to 1.0.

* **Dynamic Action Triggers:** Strict dual-threshold system (Upper: 0.7, Lower: 0.3) completely prevents hallucinations caused by poor data.

### Deep Knowledge Refinement

* **NLP Decomposition:** Leverages `spaCy` to intelligently split documents into granular, sentence-level strips.

* **Algorithmic Filtering:** Re-evaluates each strip individually and discards irrelevant noise.

* **Recomposition:** Concatenates only the highest-scoring strips for perfectly constrained generation.

### Web-First Ingestion & Vector Search

* **Live Scraping:** Uses BeautifulSoup4 and the Tavily API to fetch real-time data instead of relying on a static corpus.

* **Dense Embeddings:** Utilizes `sentence-transformers` (all-MiniLM-L6-v2) to encode text.

* **In-Memory Vector DB:** Implements `FAISS` for lightning-fast semantic similarity searches.

### Streaming Backend & Modern Frontend

* **FastAPI Backend:** Fully asynchronous API featuring Server-Sent Events (SSE) to stream pipeline progress and actions in real-time.

* **React Interface:** Smooth, responsive dark/light theme utilizing Framer Motion for pipeline visualization.

## Architecture

```text
---------------------------------------------------------------
                      PIPELINE EXECUTION                       
---------------------------------------------------------------

1. WEB SEARCH       -> Tavily API fetches high-quality URLs
   |
2. SCRAPE & CHUNK   -> BeautifulSoup extracts text; FAISS creates vector store
   |
3. EVALUATE         -> Groq LLaMA scores chunks (0.0 to 1.0)
   |
4. ACTION TRIGGER   -> Routing based on score:
   |- Score >= 0.7  -> Action: CORRECT
   |- Score < 0.3   -> Action: INCORRECT
   |- 0.3 to 0.7    -> Action: AMBIGUOUS
   |
5. REFINE & SEARCH  -> spaCy strips noise; rewrites query if needed
   |
6. GENERATE         -> LLaMA-3.1 synthesizes final constrained answer
```

## Installation

### Prerequisites

* Python 3.9+
* Node.js 16+
* API Keys: Groq and Tavily

### Backend Setup

```bash
# 1. Clone repository
git clone [https://github.com/rakshit-133/crag-chatbot.git](https://github.com/rakshit-133/crag-chatbot.git)
cd crag-chatbot/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download spaCy NLP model
python -m spacy download en_core_web_sm

# 5. Configure environment variables
cat > .env << EOF
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
EOF

# 6. Start the FastAPI server
uvicorn app.api:app --reload --port 8000
```

### Frontend Setup

```bash
cd ../frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

## Usage

Once both servers are running:

1. Navigate to `http://localhost:5173` in your browser.
2. Enter a complex or highly specific query in the search bar.
3. Watch the real-time event stream as the system searches, scores, triggers actions, and refines the data.
4. Review the final generated answer and the verified source URLs.

## Project Structure

```text
crag-chatbot/
|-- backend/
|   |-- app/
|   |   |-- api.py                # FastAPI routing and SSE streaming
|   |   |-- evaluator.py          # LLM scoring logic
|   |   |-- knowledge_refine.py   # spaCy decomposition and filtering
|   |   |-- llm.py                # Final answer generation
|   |   |-- main.py               # Core pipeline orchestration
|   |   |-- query_rewrite.py      # Keyword extraction
|   |   |-- scraper.py            # URL scraping
|   |   |-- web_ingest.py         # FAISS vector store build
|   |   |-- web_search.py         # Tavily integration
|   |-- .env                      
|   |-- requirements.txt
|
|-- frontend/
|   |-- src/
|   |   |-- App.jsx               # React UI and SSE event handling
|   |-- package.json
|
|-- .gitignore
|-- LICENSE
|-- README.md
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

* **Original Paper:** Corrective Retrieval Augmented Generation (Yan et al.)
* **Inference:** Groq API
* **Web Search:** Tavily
* **Embeddings & NLP:** HuggingFace, FAISS, and spaCy

---
Author: Rakshit Aggarwal