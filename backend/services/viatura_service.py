from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from models.saida_viatura import SaidaViatura
from models.viatura import Viatura


def listar_viaturas_ativas(db: Session) -> List[Viatura]:
    return db.query(Viatura).filter(Viatura.ativo.is_(True)).order_by(Viatura.prefixo).all()


def registrar_saida(
    db: Session,
    *,
    viatura_id: str,
    motorista: str,
    patrulheiro: str,
    inspetor: str,
    km_saida: Decimal,
    protocolo: Optional[str],
    observacoes: Optional[str],
    usuario_id: str,
) -> SaidaViatura:
    saida = SaidaViatura(
        viatura_id=viatura_id,
        motorista=motorista,
        patrulheiro=patrulheiro,
        inspetor=inspetor,
        km_saida=km_saida,
        data_saida=datetime.now(timezone.utc),
        protocolo=protocolo,
        observacoes=observacoes,
        usuario_id=usuario_id,
    )
    db.add(saida)
    db.commit()
    db.refresh(saida)
    return saida


def registrar_volta(
    db: Session,
    *,
    saida_id: str,
    km_chegada: Decimal,
    observacoes: Optional[str],
) -> SaidaViatura:
    saida: SaidaViatura = db.query(SaidaViatura).filter(SaidaViatura.id == saida_id).one()
    if km_chegada < saida.km_saida:
        raise ValueError("Km de chegada deve ser maior ou igual ao km de saída.")

    km_rodado = km_chegada - saida.km_saida
    saida.km_chegada = km_chegada
    saida.km_rodado = km_rodado

    if observacoes:
        if saida.observacoes:
            saida.observacoes = f"{saida.observacoes}\n{observacoes}"
        else:
            saida.observacoes = observacoes

    db.commit()
    db.refresh(saida)
    return saida

