async function initDashboard() {
    try {
        const dados = await apiGet("/dashboard");

        document.getElementById("dashViaturasEmOperacao").textContent =
            dados.viaturas_em_operacao ?? 0;
        document.getElementById("dashKmRodadoHoje").textContent =
            (dados.km_rodado_hoje ?? 0).toFixed(1);
        document.getElementById("dashConsumoMedio").textContent =
            (dados.consumo_medio ?? 0).toFixed(2);

        const mais = dados.viatura_mais_utilizada;
        document.getElementById("dashViaturaMaisUtilizada").textContent = mais
            ? `${mais.prefixo} (${mais.km_total.toFixed(1)} km)`
            : "-";

        renderGraficoKmPorViatura(dados.km_por_viatura);
    } catch (e) {
        console.error(e);
        alert("Erro ao carregar dashboard: " + e.message);
    }
}

function renderGraficoKmPorViatura(serie) {
    const ctx = document.getElementById("graficoKmPorViatura");
    if (!ctx || !serie) return;

    const labels = serie.labels || [];
    const data = serie.data || [];

    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "KM rodado",
                    data,
                    backgroundColor: "rgba(0, 86, 179, 0.6)",
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

