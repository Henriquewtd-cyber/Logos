"""Cria dois usuários analistas padrão.

Uso (na raiz do backend):
    python analistas_script.py
"""

import os

from fastapi import HTTPException

from app.core.database import SessionLocal
from app.auth import repository, service
from app.auth.schemas import UsuarioCreate

username1 = os.getenv("username1")
email1 = os.getenv("email1")
password1 = os.getenv("password1")
username2 = os.getenv("username2")
email2 = os.getenv("email2")
password2 = os.getenv("password2")

ANALISTAS = [
    UsuarioCreate(
        nome=username1,
        email=email1,
        senha=password1,
    ),
    UsuarioCreate(
        nome=username2,
        email=email2,
        senha=password2,
    ),
]


def main() -> int:
    with SessionLocal() as db:
        for dados in ANALISTAS:
            try:
                existente = repository.obter_por_email(db, dados.email.lower())

                if existente:
                    print(f"Analista já existe: {dados.email}")
                    continue

                usuario = service.criar_usuario(
                    db=db,
                    dados=dados,
                    is_admin=False,
                )

                print(f"Analista criado: {usuario.email} (id {usuario.id})")

            except HTTPException as exc:
                print(f"Erro ao criar {dados.email}: {exc.detail}")
                return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())