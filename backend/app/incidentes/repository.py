
# Funções de acesso ao banco de dados para a entidade Incidente
from sqlalchemy import select, update
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


class ConflitoConcorrenciaError(Exception):
    """O incidente foi alterado por outro usuário."""


def editar(
    db: Session,
    incidente_id: int,
    dados: IncidenteUpdate,
) -> Incidente | None:
    atualizacoes = dados.model_dump(
        exclude_unset=True,
        exclude={"versao"},
    )

    versao_esperada = dados.versao

    try:
        resultado = db.execute(
            update(Incidente)
            .where(
                Incidente.id == incidente_id,
                Incidente.versao == versao_esperada,
            )
            .values(
                **atualizacoes,
                versao=Incidente.versao + 1,
            )
        )

        if resultado.rowcount == 0:
            db.rollback()

            incidente_existe = db.get(Incidente, incidente_id)

            if incidente_existe is None:
                return None

            raise ConflitoConcorrenciaError(
                "O incidente foi alterado por outro usuário. "
                "Atualize os dados antes de tentar novamente."
            )

        db.commit()

        return db.scalar(
            select(Incidente)
            .where(Incidente.id == incidente_id)
            .execution_options(populate_existing=True)
        )

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
