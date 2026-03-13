from sqlalchemy import Column, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from .base import Base


class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id = Column(UUID(as_uuid=True), primary_key=True)
    viatura_id = Column(UUID(as_uuid=True), ForeignKey("viaturas.id"), nullable=False)
    km_abastecimento = Column(Numeric, nullable=False)
    km_atual = Column(Numeric, nullable=False)
    litros = Column(Numeric, nullable=False)
    km_rodado = Column(Numeric, nullable=False)
    media = Column(Numeric, nullable=False)
    data_abastecimento = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

