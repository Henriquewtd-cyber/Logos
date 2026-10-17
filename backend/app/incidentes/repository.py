
# Funções de acesso ao banco de dados para a entidade Incidente
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.incidentes.models import Incidente
from app.incidentes.schemas import IncidenteCreate, IncidenteUpdate, IncidenteFilter


def criar(db: Session, dados: IncidenteCreate) -> Incidente:
    incidente = Incidente(**dados.model_dump())

    try:
        db.add(incidente)
        db.commit()
        db.refresh(incidente)
        return incidente
    except Exception:
        db.rollback()
        raise


def buscar_por_id(db: Session, incidente_id: int) -> Incidente | None:
    return db.get(Incidente, incidente_id)


def listar(
    db: Session,
    filtros: IncidenteFilter | None = None,
) -> list[Incidente]:
    query = select(Incidente)

    if filtros:
        criterios = filtros.model_dump(exclude_unset=True, exclude_none=True)

        for campo, valor in criterios.items():
            query = query.where(getattr(Incidente, campo) == valor)

    return list(db.scalars(query).all())


def editar(
    db: Session,
    incidente_id: int,
    dados: IncidenteUpdate,
) -> Incidente | None:
    incidente = db.get(Incidente, incidente_id)

    if incidente is None:
        return None

    atualizacoes = dados.model_dump(exclude_unset=True)

    for campo, valor in atualizacoes.items():
        setattr(incidente, campo, valor)

    try:
        db.commit()
        db.refresh(incidente)
        return incidente
    except Exception:
        db.rollback()
        raise


def deletar(db: Session, incidente_id: int) -> bool:
    incidente = db.get(Incidente, incidente_id)

    if incidente is None:
        return False

    try:
        db.delete(incidente)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise
