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