from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class Viatura(Base):
    __tablename__ = "viaturas"

    id = Column(UUID(as_uuid=True), primary_key=True)
    prefixo = Column(String, nullable=False)
    modelo = Column(String, nullable=True)
    ativo = Column(Boolean, nullable=False, default=True)

