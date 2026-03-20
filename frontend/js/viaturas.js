(function () {
    'use strict';

    let supabase;

    const VIATURAS = [
        'VTR 0107',
        'VTR 0109',
        'VTR 0110',
        'VTR 0111',
    ];

    const MOTORISTAS = [
        'DUARTE - Saleide Flor Duarte',
        'JACQUES - Sayonara Vanderleia Jacques',
        'ARLON - Arlon Luiz Da Silva',
        'LEANDRO - Leandro de Araújo',
        'LUIZ - Luiz Eduardo Cortegrosso',
        'MAIK - Maik Custódio Agostinho',
        'REIS - Jair Pacheco Dos Reis Junior',
    ];

    const INSPETORES = ['INSP MAIK', 'INSP JUNIOR', 'CHEFE DUARTE'];
    const PATRULHEIROS = [
        'PATROLHEIRA DUARTE',
        'PATROLHEIRA JACQUES',
        'PATROLHEIRO ARLON',
        'PATROLHEIRO LEANDRO',
        'PATROLHEIRO LUIZ',
        'PATROLHEIRO MAIK',
        'PATROLHEIRO REIS',
    ];

    async function initSistema() {
        supabase = getSupabase();

        const formSaida = document.getElementById('saidaViaturaForm');
        const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
        const formAbastecimento = document.getElementById('abastecimentoForm');
        const tabelaAbastecimentoElement = document.getElementById('tabelaAbastecimento');
        const tabelaAbastecimentoBody = tabelaAbastecimentoElement
            ? tabelaAbastecimentoElement.querySelector('tbody')
            : null;
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
        const btnExportarSaidas = document.getElementById('btnExportarSaidasExcel');
        const btnExportarAbastecimento = document.getElementById('btnExportarExcel');

        if (!formSaida || !tabelaSaidasBody) {
            console.warn('Formulário de saída ou tabela não disponível.');
            return;
        }

        preencherCombos();
        await carregarDados();
        atualizarContadores();

        formSaida.addEventListener('submit', function (event) {
            registrarSaida(event, tabelaSaidasBody);
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

        if (modalCancelarBtn) {
            modalCancelarBtn.addEventListener('click', function () {
                voltaModal.style.display = 'none';
            });
        }

        if (voltaModal) {
            voltaModal.addEventListener('click', function (event) {
                if (event.target === voltaModal) {
                    voltaModal.style.display = 'none';
                }
            });
        }

        if (modalSalvarBtn) {
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
        }

        if (formAbastecimento && tabelaAbastecimentoBody) {
            configurarAbastecimento({
                formAbastecimento,
                tabelaAbastecimentoBody,
            });
        }

        if (filtroBuscaInput) {
            filtroBuscaInput.addEventListener('input', filtrarTabela);
        }

        if (btnExportarSaidas) {
            btnExportarSaidas.addEventListener('click', function () {
                exportTableToExcel('tabelaSaidas', 'saidas-viaturas.xlsx');
            });
        }

        if (btnExportarAbastecimento) {
            btnExportarAbastecimento.addEventListener('click', function () {
                exportTableToExcel('tabelaAbastecimento', 'abastecimentos.xlsx');
            });
        }
    }

    function preencherCombos() {
        preencherSelect(document.getElementById('viatura'), VIATURAS);
        preencherSelect(document.getElementById('viatura_abastecimento'), VIATURAS);
        preencherSelect(document.getElementById('motorista'), MOTORISTAS);
        preencherSelect(document.getElementById('motorista_abastecimento'), MOTORISTAS);
        preencherSelect(document.getElementById('inspetor'), INSPETORES);
        preencherSelect(document.getElementById('patrulheiro'), PATRULHEIROS);
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

    function registrarSaida(event, tabelaBody) {
        event.preventDefault();
        const form = event.currentTarget;
        const now = new Date();
        const rowId = 'saida-' + now.getTime();
        const kmSaida = form.km_saida.value || '0';

        const novaLinha = document.createElement('tr');
        novaLinha.id = rowId;

        const dadosSaida = [
            form.viatura.value,
            now.toLocaleString('pt-BR'),
            kmSaida,
            form.motorista.value,
            form.protocolo.value || '-',
        ];

        dadosSaida.forEach(function (valor) {
            const td = document.createElement('td');
            td.textContent = valor;
            novaLinha.appendChild(td);
        });

        ['-', '-', '-'].forEach(function (placeholder) {
            const td = document.createElement('td');
            td.textContent = placeholder;
            novaLinha.appendChild(td);
        });

        const acoesCell = document.createElement('td');
        const btnVolta = document.createElement('button');
        btnVolta.textContent = 'Registrar Volta';
        btnVolta.className = 'btn btn-success btn-volta';
        btnVolta.dataset.rowId = rowId;
        acoesCell.appendChild(btnVolta);
        novaLinha.appendChild(acoesCell);

        tabelaBody.appendChild(novaLinha);
        form.reset();
        salvarDados();
        atualizarContadores();
    }

    function abrirModalVolta(rowId, contexto) {
        const linha = document.getElementById(rowId);
        if (!linha) return;

        const {
            modalViaturaInfo,
            modalRowIdInput,
            modalKmChegadaInput,
            modalErro,
            modalFotoInput,
            modalComentariosInput,
            voltaModal,
        } = contexto;

        const viatura = linha.cells[0]?.textContent;
        const kmSaida = linha.cells[2]?.textContent;

        modalViaturaInfo.textContent = Viatura:  | Km Saída: ;
        modalRowIdInput.value = rowId;
        modalKmChegadaInput.value = '';
        modalKmChegadaInput.min = kmSaida || '0';
        modalErro.style.display = 'none';
        modalFotoInput.value = '';
        modalComentariosInput.value = '';
        voltaModal.style.display = 'flex';
    }

    function registrarVolta(contexto) {
        const {
            modalRowIdInput,
            modalKmChegadaInput,
            modalErro,
            modalFotoInput,
            modalComentariosInput,
            voltaModal,
        } = contexto;

        const rowId = modalRowIdInput.value;
        const linha = document.getElementById(rowId);
        if (!linha) {
            return;
        }

        const kmSaida = parseFloat(linha.cells[2]?.textContent.replace(',', '.'));
        const kmEntrada = parseFloat(modalKmChegadaInput.value);

        if (isNaN(kmEntrada) || kmEntrada < kmSaida) {
            modalErro.textContent = 'ERRO: O Km de Chegada deve ser maior ou igual ao Km de Saída.';
            modalErro.style.display = 'block';
            return;
        }

        const kmRodado = kmEntrada - kmSaida;
        linha.cells[5].textContent = kmEntrada.toFixed(1);
        linha.cells[6].textContent = kmRodado.toFixed(1);

        const fotoCell = linha.cells[7];
        const comentarioCell = linha.cells[8];

        comentarioCell.textContent = modalComentariosInput.value || 'Sem observações';
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

        linha.cells[9].innerHTML = '<button class="btn btn-secondary" disabled>Finalizado</button>';
        linha.classList.add('viagem-finalizada');

        modalFotoInput.value = '';
        modalComentariosInput.value = '';
        modalErro.style.display = 'none';
        voltaModal.style.display = 'none';

        salvarDados();
        atualizarContadores();
    }

    function configurarAbastecimento({ formAbastecimento, tabelaAbastecimentoBody }) {
        const kmAbastecimentoInput = formAbastecimento.km_abastecimento;
        const kmAtualInput = formAbastecimento.km_atual;
        const litrosInput = formAbastecimento.litros;
        const kmRodadoInput = document.getElementById('km_rodado');
        const mediaInput = document.getElementById('media_km_l');

        function calcularValores() {
            const km1 = parseFloat(kmAbastecimentoInput.value);
            const km2 = parseFloat(kmAtualInput.value);
            const litrosVal = parseFloat(litrosInput.value);

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

        [kmAbastecimentoInput, kmAtualInput, litrosInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', calcularValores);
            }
        });

        formAbastecimento.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (!tabelaAbastecimentoBody) return;

            const viatura = formAbastecimento.viatura_abastecimento.value;
            const data = formAbastecimento.data_abastecimento.value;
            const km_abastecimento = parseFloat(kmAbastecimentoInput.value);
            const km_atual = parseFloat(kmAtualInput.value);
            const litros = parseFloat(litrosInput.value);

            if (km_atual < km_abastecimento) {
                alert('O KM atual não pode ser menor que o KM do abastecimento.');
                return;
            }

            if (litros <= 0) {
                alert('A quantidade de litros deve ser maior que zero.');
                return;
            }

            const km_rodado = km_atual - km_abastecimento;
            const media = km_rodado / litros;

            const novoAbastecimento = {
                viatura,
                data,
                km_abastecimento,
                km_atual,
                litros,
                km_rodado,
                media: media.toFixed(2),
            };

            const { data: insertedData, error } = await supabase
                .from('abastecimentos')
                .insert([novoAbastecimento]);

            if (error) {
                console.error('Erro ao salvar abastecimento:', error);
                alert('Não foi possível salvar o abastecimento. Verifique o console para mais detalhes.');
                return;
            }

            const novaLinha = document.createElement('tr');
            const dados = [
                viatura,
                new Date(data).toLocaleDateString('pt-BR'),
                km_abastecimento,
                km_atual,
                litros,
                km_rodado,
                media.toFixed(2),
            ];
            dados.forEach(function (dado) {
                const td = document.createElement('td');
                td.textContent = dado || '-';
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

        if (tabelaSaidasBody) {
            localStorage.setItem('saidasViaturas', tabelaSaidasBody.innerHTML);
        }
    }

    async function carregarDados() {
        const tabelaSaidasBody = document.getElementById('tabelaSaidasBody');
        const tabelaAbastecimentoElement = document.getElementById('tabelaAbastecimento');
        const tabelaAbastecimentoBody = tabelaAbastecimentoElement
            ? tabelaAbastecimentoElement.querySelector('tbody')
            : null;

        const saidasHTML = localStorage.getItem('saidasViaturas');

        if (saidasHTML && tabelaSaidasBody) {
            tabelaSaidasBody.innerHTML = saidasHTML;
        }

        if (tabelaAbastecimentoBody) {
            const { data, error } = await supabase.from('abastecimentos').select('*');

            if (error) {
                console.error('Erro ao carregar abastecimentos:', error);
                return;
            }

            tabelaAbastecimentoBody.innerHTML = '';
            data.forEach(abastecimento => {
                const novaLinha = document.createElement('tr');
                const dados = [
                    abastecimento.viatura,
                    new Date(abastecimento.data).toLocaleDateString('pt-BR'),
                    abastecimento.km_abastecimento,
                    abastecimento.km_atual,
                    abastecimento.litros,
                    abastecimento.km_rodado,
                    abastecimento.media,
                ];
                dados.forEach(function (dado) {
                    const td = document.createElement('td');
                    td.textContent = dado || '-';
                    novaLinha.appendChild(td);
                });
                tabelaAbastecimentoBody.appendChild(novaLinha);
            });
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
            const kmRodado = parseFloat(kmRodadoTexto.replace(',', '.').replace(/[^\d.-]/g, ''));
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

    function exportTableToExcel(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table || !window.XLSX) return;
        const workbook = XLSX.utils.table_to_book(table, { sheet: 'Dados' });
        XLSX.writeFile(workbook, filename);
    }

    window.initSistema = initSistema;
})();
