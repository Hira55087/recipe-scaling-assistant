from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = chromadb.Client()
collection = client.get_or_create_collection("recipes")

if collection.count() == 0:
    collection.add(
        documents=[
            "1 cup flour = 120g",
            "1 cup sugar = 200g",
            "1 cup rice = 185g",
            "1 cup water = 240g",
            "1 cup milk = 245g",
            "1 cup butter = 227g",
        ],
        ids=["flour", "sugar", "rice", "water", "milk", "butter"],
    )


class QueryRequest(BaseModel):
    query: str


class ScaleRequest(BaseModel):
    ingredient: str
    quantity: float
    current_servings: int
    desired_servings: int


@app.post("/scale")
def scale_recipe(data: ScaleRequest):
    scaled_quantity = (
        data.quantity *
        data.desired_servings /
        data.current_servings
    )

    return {
        "ingredient": data.ingredient,
        "original_quantity": data.quantity,
        "scaled_quantity": scaled_quantity,
    }


@app.post("/query")
async def query_recipe(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty")

    results = collection.query(query_texts=[request.query], n_results=1)
    documents = results.get("documents", [[]])
    ids = results.get("ids", [[]])

    first_document = documents[0][0] if documents and documents[0] else None
    first_id = ids[0][0] if ids and ids[0] else None

    return {
        "query": request.query,
        "result": first_document,
        "id": first_id,
        "raw": results,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
