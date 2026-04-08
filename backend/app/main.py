from .retrieve import get_retriever

retriever = get_retriever()

query = "What do transformers do?"

docs = retriever.invoke(query)

for i, doc in enumerate(docs):
    print(f"\nResult {i+1}:")
    print(doc.page_content)