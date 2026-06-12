from fastapi import FastAPI
from rag_carbon import calculate_with_rag

app = FastAPI()

@app.post("/api/ai/footprint/calculate")
async def calculate_footprint(user_input: dict):
    result = calculate_with_rag(user_input)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)