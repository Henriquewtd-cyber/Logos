
# Aqui vão as resgras de negócio da aplicação.

from sqlalchemy.orm import Session

from app.incidentes import repository
from app.incidentes.schemas import (
    IncidenteCreate,
    IncidenteUpdate,
    IncidenteFilter,
)


def criar_incidente(db: Session, dados: IncidenteCreate):
    return repository.criar(db, dados)


def listar_incidentes(
    db: Session,
    filtros: IncidenteFilter | None = None,
):
    return repository.listar(db, filtros)

# Função de edição geral, vou usar para atualizar o status e outros campos do incidente caso necessário
def atualizar_incidente(
    db: Session,
    incidente_id: int,
    dados: IncidenteUpdate,
):
    incidente = repository.editar(db, incidente_id, dados)

    if incidente is None:
        raise LookupError("Incidente não encontrado")

    return incidente


def deletar_incidente(db: Session, incidente_id: int):
    sucesso = repository.deletar(db, incidente_id)

    if not sucesso:
        raise LookupError("Incidente não encontrado")

    return {"mensagem": "Incidente deletado com sucesso"}
