
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.incidentes.router import router as incidentes_router
from app.auth.router import router as auth_router

app = FastAPI(
    title="Logos API",
    description="Mission-critical delivery logistics platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidentes_router)
app.include_router(auth_router)