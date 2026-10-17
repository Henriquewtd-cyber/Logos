

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# Tabela de incidentes 
class Incidente(Base):
    __tablename__ = "incidentes"

    id: Mapped[int] = mapped_column(primary_key=True)
    categoria: Mapped[str] = mapped_column(String(255))
    criticidade: Mapped[str] = mapped_column(String(255))
    descricao: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(255))