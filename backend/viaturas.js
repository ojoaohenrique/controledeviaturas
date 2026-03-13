// ===============================================================
//  Controle de Viaturas GML
//  - Mantém toda a lógica existente
//  - Organiza em funções reutilizáveis
//  - Persiste dados no localStorage
//  - Usa dados do arquivo dados.js para preencher selects
// ===============================================================

document.addEventListener('DOMContentLoaded', initSistema);

function initSistema() {
    console.log('Sistema de controle de viaturas inicializado.');

    const formSaida = document.getElementById('saidaViaturaForm');
    const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
    const voltaModal = document.getElementById('voltaModal');
    const modalCancelarBtn = document.getElementById('modalCancelarBtn');
    const modalSalvarBtn = document.getElementById('modalSalvarBtn');
    const modalViaturaInfo = document.getElementById('modalViaturaInfo');
    const modalKmChegadaInput = document.getElementById('modalKmChegada');
    const modalRowIdInput = document.getElementById('modalRowId');
    const modalErro = document.getElementById('modalErro');
    const modalFotoInput = document.getElementById('modalFoto');
    const modalComentariosInput = document.getElementById('modalComentarios');
    const filtroBuscaInput = document.getElementById('filtroBusca');

    const formAbastecimento = document.getElementById('abastecimentoForm');
    const tabelaAbastecimentoBody = document
        .getElementById('tabelaAbastecimento')
        .querySelector('tbody');

    if (!formSaida || !tabelaSaidasBody || !voltaModal || !modalFotoInput || !modalComentariosInput) {
        console.error('Elemento essencial não encontrado. Verifique o HTML.');
        return;
    }

    preencherCombos();
    carregarDados();
    atualizarContadores();

    formSaida.addEventListener('submit', function (event) {
        registrarSaida(event, {
            formSaida,
            tabelaSaidasBody,
        });
    });

    tabelaSaidasBody.addEventListener('click', function (event) {
        const btn = event.target.closest('.btn-volta');
        if (!btn) return;

        abrirModalVolta(btn.dataset.rowId, {
            modalViaturaInfo,
            modalRowIdInput,
            modalKmChegadaInput,
            modalErro,
            modalFotoInput,
            modalComentariosInput,
            voltaModal,
        });
    });

    modalCancelarBtn.addEventListener('click', function () {
        voltaModal.style.display = 'none';
    });

    voltaModal.addEventListener('click', function (event) {
        if (event.target === voltaModal) {
            voltaModal.style.display = 'none';
        }
    });

    modalSalvarBtn.addEventListener('click', function () {
        registrarVolta({
            modalRowIdInput,
            modalKmChegadaInput,
            modalErro,
            modalFotoInput,
            modalComentariosInput,
            voltaModal,
        });
    });

    if (formAbastecimento) {
        configurarAbastecimento({
            formAbastecimento,
            tabelaAbastecimentoBody,
        });
    }

    if (filtroBuscaInput) {
        filtroBuscaInput.addEventListener('input', filtrarTabela);
    }
}

function preencherCombos() {
    const viaturaSelectSaida = document.getElementById('viatura');
    const viaturaSelectAbastecimento = document.getElementById('viatura_abastecimento');
    const motoristaSelectSaida = document.getElementById('motorista');
    const motoristaSelectAbastecimento = document.getElementById('motorista_abastecimento');
    const inspetorSelect = document.getElementById('inspetor');
    const patrulheiroSelect = document.getElementById('patrulheiro');

    if (Array.isArray(viaturas)) {
        preencherSelect(viaturaSelectSaida, viaturas);
        preencherSelect(viaturaSelectAbastecimento, viaturas);
    }

    if (Array.isArray(motoristas)) {
        preencherSelect(motoristaSelectSaida, motoristas);
        preencherSelect(motoristaSelectAbastecimento, motoristas);
    }

    if (Array.isArray(inspetores)) {
        preencherSelect(inspetorSelect, inspetores);
    }

    if (Array.isArray(patrulheiros)) {
        preencherSelect(patrulheiroSelect, patrulheiros);
    }
}

function preencherSelect(selectElement, itens) {
    if (!selectElement || !Array.isArray(itens)) return;

    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    itens.forEach(function (item) {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

function registrarSaida(event, contexto) {
    event.preventDefault();

    const { formSaida, tabelaSaidasBody } = contexto;
    const agora = new Date();
    const rowId = 'saida-' + agora.getTime();

    const novaLinha = document.createElement('tr');
    novaLinha.id = rowId;

    const dadosSaida = [
        formSaida.viatura.value,
        agora.toLocaleString('pt-BR'),
        formSaida.km_saida.value,
        formSaida.motorista.value,
        formSaida.protocolo.value,
    ];

    dadosSaida.forEach(function (dado) {
        const td = document.createElement('td');
        td.textContent = dado;
        novaLinha.appendChild(td);
    });

    const kmChegadaCell = document.createElement('td');
    kmChegadaCell.textContent = '-';
    novaLinha.appendChild(kmChegadaCell);

    const kmRodadoCell = document.createElement('td');
    kmRodadoCell.textContent = '-';
    novaLinha.appendChild(kmRodadoCell);

    const fotoCell = document.createElement('td');
    fotoCell.textContent = '-';
    novaLinha.appendChild(fotoCell);

    const comentarioCell = document.createElement('td');
    comentarioCell.textContent = '-';
    novaLinha.appendChild(comentarioCell);

    const acoesCell = document.createElement('td');
    const btnVolta = document.createElement('button');
    btnVolta.textContent = 'Registrar Volta';
    btnVolta.className = 'btn btn-success btn-volta';
    btnVolta.dataset.rowId = rowId;
    acoesCell.appendChild(btnVolta);
    novaLinha.appendChild(acoesCell);

    tabelaSaidasBody.appendChild(novaLinha);
    formSaida.reset();

    salvarDados();
    atualizarContadores();
}

function abrirModalVolta(rowId, contexto) {
    const linha = document.getElementById(rowId);
    if (!linha) return;

    const { modalViaturaInfo, modalRowIdInput, modalKmChegadaInput, modalErro, modalFotoInput, modalComentariosInput, voltaModal } =
        contexto;

    const viatura = linha.cells[0].textContent;
    const kmSaida = linha.cells[2].textContent;

    modalViaturaInfo.textContent = 'Viatura: ' + viatura + ' | Km Saída: ' + kmSaida;
    modalRowIdInput.value = rowId;
    modalKmChegadaInput.value = '';
    modalKmChegadaInput.min = kmSaida;
    modalErro.style.display = 'none';

    modalFotoInput.value = '';
    modalComentariosInput.value = '';

    voltaModal.style.display = 'flex';
}

function registrarVolta(contexto) {
    const { modalRowIdInput, modalKmChegadaInput, modalErro, modalFotoInput, modalComentariosInput, voltaModal } =
        contexto;

    const rowId = modalRowIdInput.value;
    const linha = document.getElementById(rowId);
    if (!linha) return;

    const kmSaida = parseFloat(linha.cells[2].textContent);
    const kmChegada = parseFloat(modalKmChegadaInput.value);

    if (isNaN(kmChegada) || kmChegada < kmSaida) {
        modalErro.textContent =
            'ERRO: O Km de Chegada deve ser maior ou igual ao Km de Saída.';
        modalErro.style.display = 'block';
        return;
    }

    const kmRodado = kmChegada - kmSaida;

    linha.cells[5].textContent = kmChegada;
    linha.cells[6].textContent = kmRodado.toFixed(1);

    const fotoCell = linha.cells[7];
    const comentarioCell = linha.cells[8];

    comentarioCell.textContent =
        modalComentariosInput.value || 'Sem observações';
    comentarioCell.style.whiteSpace = 'normal';

    fotoCell.innerHTML = '';
    fotoCell.style.whiteSpace = 'normal';

    if (modalFotoInput.files.length > 0) {
        Array.prototype.forEach.call(modalFotoInput.files, function (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.objectFit = 'cover';
                img.style.margin = '2px';
                img.style.cursor = 'pointer';
                img.style.border = '1px solid #ddd';
                img.style.borderRadius = '4px';

                const link = document.createElement('a');
                link.href = event.target.result;
                link.target = '_blank';
                link.appendChild(img);

                fotoCell.appendChild(link);
            };

            reader.readAsDataURL(file);
        });
    } else {
        fotoCell.textContent = 'Sem Foto';
    }

    linha.cells[9].innerHTML =
        '<button class="btn btn-secondary" disabled>Finalizado</button>';
    linha.classList.add('viagem-finalizada');

    modalFotoInput.value = '';
    modalComentariosInput.value = '';
    voltaModal.style.display = 'none';

    salvarDados();
    atualizarContadores();
}

function configurarAbastecimento({ formAbastecimento, tabelaAbastecimentoBody }) {
    const kmAbastecimento = document.getElementById('km_abastecimento');
    const kmAtual = document.getElementById('km_atual');
    const litros = document.getElementById('litros');
    const kmRodadoInput = document.getElementById('km_rodado');
    const mediaInput = document.getElementById('media_km_l');

    function calcularValores() {
        const km1 = parseFloat(kmAbastecimento.value);
        const km2 = parseFloat(kmAtual.value);
        const litrosVal = parseFloat(litros.value);

        if (!isNaN(km1) && !isNaN(km2) && km2 > km1) {
            const rodado = km2 - km1;
            kmRodadoInput.value = rodado.toFixed(0);
            if (!isNaN(litrosVal) && litrosVal > 0) {
                mediaInput.value = (rodado / litrosVal).toFixed(2) + ' KM/L';
            } else {
                mediaInput.value = '';
            }
        } else {
            kmRodadoInput.value = '';
            mediaInput.value = '';
        }
    }

    kmAbastecimento.addEventListener('input', calcularValores);
    kmAtual.addEventListener('input', calcularValores);
    litros.addEventListener('input', calcularValores);

    formAbastecimento.addEventListener('submit', function (event) {
        event.preventDefault();

        const novaLinha = document.createElement('tr');
        const dados = [
            formAbastecimento.viatura_abastecimento.value,
            new Date(formAbastecimento.data_abastecimento.value).toLocaleDateString(
                'pt-BR',
                { timeZone: 'UTC' }
            ),
            kmAbastecimento.value,
            kmAtual.value,
            litros.value,
            kmRodadoInput.value,
            mediaInput.value,
        ];

        dados.forEach(function (dado) {
            const td = document.createElement('td');
            td.textContent = dado;
            novaLinha.appendChild(td);
        });

        tabelaAbastecimentoBody.appendChild(novaLinha);
        formAbastecimento.reset();
        kmRodadoInput.value = '';
        mediaInput.value = '';

        salvarDados();
    });
}

function salvarDados() {
    const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
    const tabelaAbastecimentoBody = document
        .getElementById('tabelaAbastecimento')
        .querySelector('tbody');

    if (tabelaSaidasBody) {
        localStorage.setItem('saidasViaturas', tabelaSaidasBody.innerHTML);
    }

    if (tabelaAbastecimentoBody) {
        localStorage.setItem(
            'abastecimentosViaturas',
            tabelaAbastecimentoBody.innerHTML
        );
    }
}

function carregarDados() {
    const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
    const tabelaAbastecimentoBody = document
        .getElementById('tabelaAbastecimento')
        .querySelector('tbody');

    const saidasHTML = localStorage.getItem('saidasViaturas');
    const abastecimentosHTML = localStorage.getItem('abastecimentosViaturas');

    if (saidasHTML && tabelaSaidasBody) {
        tabelaSaidasBody.innerHTML = saidasHTML;
    }

    if (abastecimentosHTML && tabelaAbastecimentoBody) {
        tabelaAbastecimentoBody.innerHTML = abastecimentosHTML;
    }
}

function filtrarTabela() {
    const filtroInput = document.getElementById('filtroBusca');
    const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
    if (!filtroInput || !tabelaSaidasBody) return;

    const termo = filtroInput.value.trim().toLowerCase();
    const linhas = tabelaSaidasBody.querySelectorAll('tr');

    linhas.forEach(function (linha) {
        const viatura = (linha.cells[0]?.textContent || '').toLowerCase();
        const motorista = (linha.cells[3]?.textContent || '').toLowerCase();
        const protocolo = (linha.cells[4]?.textContent || '').toLowerCase();

        const corresponde =
            termo === '' ||
            viatura.includes(termo) ||
            motorista.includes(termo) ||
            protocolo.includes(termo);

        linha.style.display = corresponde ? '' : 'none';
    });
}

function atualizarContadores() {
    const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
    const emOperacaoSpan = document.getElementById('contadorEmOperacao');
    const finalizadasSpan = document.getElementById('contadorFinalizadas');
    const totalKmSpan = document.getElementById('contadorTotalKm');

    if (!tabelaSaidasBody || !emOperacaoSpan || !finalizadasSpan || !totalKmSpan) {
        return;
    }

    const linhas = tabelaSaidasBody.querySelectorAll('tr');
    let emOperacao = 0;
    let finalizadas = 0;
    let totalKm = 0;

    linhas.forEach(function (linha) {
        const kmRodadoTexto = linha.cells[6]?.textContent || '';
        const kmRodado = parseFloat(
            kmRodadoTexto.replace(',', '.').replace(/[^\d.-]/g, '')
        );

        if (linha.classList.contains('viagem-finalizada')) {
            finalizadas += 1;
            if (!isNaN(kmRodado)) {
                totalKm += kmRodado;
            }
        } else {
            emOperacao += 1;
        }
    });

    emOperacaoSpan.textContent = emOperacao;
    finalizadasSpan.textContent = finalizadas;
    totalKmSpan.textContent = totalKm.toFixed(1);
}