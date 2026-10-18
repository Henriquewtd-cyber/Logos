
from pydantic import BaseModel, ConfigDict


class IncidenteBase(BaseModel):
    versao: int
    categoria: str
    criticidade: str
    descricao: str
    status: str


# Dados necessários para criar
class IncidenteCreate(IncidenteBase):
    pass


# Campos opcionais para atualização parcial
class IncidenteUpdate(BaseModel):
    versao: int | None = None
    categoria: str | None = None
    criticidade: str | None = None
    descricao: str | None = None
    status: str | None = None


# Dados devolvidos pela API
class IncidenteResponse(IncidenteBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Filtros opcionais
class IncidenteFilter(BaseModel):
    categoria: str | None = None
    criticidade: str | None = None
    status: str | None = None
