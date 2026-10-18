from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.schemas import LoginRequest, TokenResponse, UsuarioCreate, UsuarioRead
from app.auth import service
from app.auth.dependencies import get_usuario_logado
from app.auth.models import Usuario

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

# Login endpoint
@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db),) -> TokenResponse:
    return service.login(db, dados)

# User read endpoint
@router.get("/me", response_model=UsuarioRead)
def obter_usuario_logado(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_logado)) -> UsuarioRead:
    return service.get_usuario(db, usuario.id)

#