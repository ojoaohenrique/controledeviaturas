from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from .base import Base


class SaidaViatura(Base):
    __tablename__ = "saidas_viaturas"

    id = Column(UUID(as_uuid=True), primary_key=True)
    viatura_id = Column(UUID(as_uuid=True), ForeignKey("viaturas.id"), nullable=False)
    motorista = Column(String, nullable=False)
    patrulheiro = Column(String, nullable=False)
    inspetor = Column(String, nullable=False)
    km_saida = Column(Numeric, nullable=False)
    data_saida = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    km_chegada = Column(Numeric, nullable=True)
    km_rodado = Column(Numeric, nullable=True)
    protocolo = Column(String, nullable=True)
    observacoes = Column(String, nullable=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

