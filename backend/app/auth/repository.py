
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.models import Usuario


def obter(db: Session, usuario_id: int) -> Usuario | None:
    return db.get(Usuario, usuario_id)


def obter_por_email(db: Session, email: str) -> Usuario | None:
    return db.scalar(select(Usuario).where(Usuario.email == email))


def criar(db: Session, usuario: Usuario) -> Usuario:
    db.add(usuario)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    db.refresh(usuario)
    return usuario

