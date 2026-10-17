
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.incidentes.schemas import (
    IncidenteCreate,
    IncidenteUpdate,
    IncidenteResponse,
)
from app.incidentes import service
from app.auth.dependencies import get_usuario_logado
from app.auth.models import Usuario

router = APIRouter(
    prefix="/incidentes",
    tags=["Incidentes"],
)


@router.post("/", response_model=IncidenteResponse, status_code=201)
def criar_incidente(
    dados: IncidenteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_logado),
):
    return service.criar_incidente(db, dados)


@router.get("/", response_model=list[IncidenteResponse])
def listar_incidentes(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_logado),):
    return service.listar_incidentes(db)


@router.patch("/{incidente_id}", response_model=IncidenteResponse)
def atualizar_incidente(
    incidente_id: int,
    dados: IncidenteUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_logado),
):
    try:
        return service.atualizar_incidente(db, incidente_id, dados)
    except LookupError as erro:
        raise HTTPException(status_code=404, detail=str(erro))


@router.delete("/{incidente_id}", status_code=204)
def deletar_incidente(
    incidente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_logado),
):
    try:
        service.deletar_incidente(db, incidente_id)
    except LookupError as erro:
        raise HTTPException(status_code=404, detail=str(erro))
