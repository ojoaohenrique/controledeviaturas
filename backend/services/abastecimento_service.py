from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from models.abastecimento import Abastecimento


def registrar_abastecimento(
    db: Session,
    *,
    viatura_id: str,
    km_abastecimento: Decimal,
    km_atual: Decimal,
    litros: Decimal,
    usuario_id: str,
) -> Abastecimento:
    if km_atual <= km_abastecimento:
        raise ValueError("KM atual deve ser maior que KM do abastecimento.")
    if litros <= 0:
        raise ValueError("Litros deve ser maior que zero.")

    km_rodado = km_atual - km_abastecimento
    media = km_rodado / litros

    registro = Abastecimento(
        viatura_id=viatura_id,
        km_abastecimento=km_abastecimento,
        km_atual=km_atual,
        litros=litros,
        km_rodado=km_rodado,
        media=media,
        data_abastecimento=datetime.now(timezone.utc),
        usuario_id=usuario_id,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro

