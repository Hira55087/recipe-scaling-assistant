import chromadb

client = chromadb.Client()

collection = client.create_collection("recipes")

collection.add(
    documents=["1 cup flour = 120g"],
    ids=["1"]
)

results = collection.query(
    query_texts=["flour grams"],
    n_results=1
)

print(results)