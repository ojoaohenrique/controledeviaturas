from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Dict, List

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.abastecimento import Abastecimento
from backend.models.saida_viatura import SaidaViatura
from backend.models.viatura import Viatura


def obter_dashboard(db: Session) -> Dict:
    """Calcula os indicadores principais para o dashboard."""

    # Viaturas em operação: saídas sem km_chegada
    em_operacao = (
        db.query(func.count(SaidaViatura.id))
        .filter(SaidaViatura.km_chegada.is_(None))
        .scalar()
    )

    # Km rodado no dia (considera data_saida do dia atual, em UTC)
    hoje = date.today()
    inicio = datetime(hoje.year, hoje.month, hoje.day, tzinfo=timezone.utc)
    fim = datetime(hoje.year, hoje.month, hoje.day, 23, 59, 59, tzinfo=timezone.utc)

    km_rodado_hoje = (
        db.query(func.coalesce(func.sum(SaidaViatura.km_rodado), 0))
        .filter(SaidaViatura.data_saida >= inicio, SaidaViatura.data_saida <= fim)
        .scalar()
    )

    # Consumo médio (km/l) geral
    consumo_medio = (
        db.query(
            func.coalesce(
                func.sum(Abastecimento.km_rodado) / func.nullif(func.sum(Abastecimento.litros), 0),
                0,
            )
        )
        .scalar()
    )

    # Viatura mais utilizada (maior km_rodado acumulado)
    sub = (
        db.query(
            SaidaViatura.viatura_id,
            func.coalesce(func.sum(SaidaViatura.km_rodado), 0).label("km_total"),
        )
        .group_by(SaidaViatura.viatura_id)
        )
    sub = sub.subquery()

    mais_usada = (
        db.query(Viatura.prefixo, sub.c.km_total)
        .join(Viatura, Viatura.id == sub.c.viatura_id)
        .order_by(sub.c.km_total.desc())
        .first()
    )

    viatura_mais_utilizada = {
        "prefixo": mais_usada[0],
        "km_total": float(mais_usada[1]),
    } if mais_usada else None

    # Série km rodado por viatura (para gráfico)
    serie_rows: List = (
        db.query(Viatura.prefixo, func.coalesce(func.sum(SaidaViatura.km_rodado), 0).label("km_total"))
        .join(Viatura, Viatura.id == SaidaViatura.viatura_id)
        .group_by(Viatura.prefixo)
        .order_by(Viatura.prefixo)
        .all()
    )

    km_por_viatura = {
        "labels": [row[0] for row in serie_rows],
        "data": [float(row[1]) for row in serie_rows],
    }

    return {
        "viaturas_em_operacao": int(em_operacao or 0),
        "km_rodado_hoje": float(km_rodado_hoje or 0),
        "consumo_medio": float(consumo_medio or 0),
        "viatura_mais_utilizada": viatura_mais_utilizada,
        "km_por_viatura": km_por_viatura,
    }

