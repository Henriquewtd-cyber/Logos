import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import repository
from app.auth.models import Usuario
from app.auth.schemas import LoginRequest, TokenResponse, UsuarioCreate


JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


def gerar_hash(senha: str) -> str:
    return bcrypt.hashpw(
        senha.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            senha.encode("utf-8"),
            senha_hash.encode("utf-8"),
        )
    except ValueError:
        return False


def criar_token(usuario: Usuario) -> str:
    secret = os.getenv("JWT_SECRET_KEY")

    if not secret:
        raise RuntimeError(
            "A variável de ambiente JWT_SECRET_KEY não está configurada."
        )

    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(usuario.id),
        "is_admin": usuario.is_admin,
        "exp": expira_em,
    }

    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def criar_usuario(
    db: Session,
    dados: UsuarioCreate,
    is_admin: bool = False,
) -> Usuario:
    email = dados.email.lower()

    if repository.obter_por_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado.",
        )

    usuario = Usuario(
        nome=dados.nome.strip(),
        email=email,
        senha_hash=gerar_hash(dados.senha),
        is_admin=is_admin,
    )

    try:
        return repository.criar(db, usuario)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado.",
        )


def login(db: Session, dados: LoginRequest) -> TokenResponse:
    usuario = repository.obter_por_email(db, dados.email.lower())

    if (
        usuario is None
        or not usuario.ativo
        or not verificar_senha(dados.senha, usuario.senha_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(access_token=criar_token(usuario))


def get_usuario(db: Session, usuario_id: int) -> Usuario:
    usuario = repository.obter(db, usuario_id)

    if usuario is None or not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    return usuario