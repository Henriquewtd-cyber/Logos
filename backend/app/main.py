
from fastapi import FastAPI

app = FastAPI(
    title="Logos API",
    description="Mission-critical delivery logistics platform",
    version="0.1.0",
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "Logos API"}
