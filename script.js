document.addEventListener('DOMContentLoaded', () => {
    const numeroSorteadoInput = document.getElementById('numeroSorteado');
    const sortearBtn = document.getElementById('sortearBtn');
    const desfazerBtn = document.getElementById('desfazerBtn');
    const bingoTableBody = document.getElementById('bingoTableBody');
    const numerosSorteadosLista = document.getElementById('numerosSorteadosLista');
    const contadorNumerosSorteados = document.getElementById('contadorNumerosSorteados');

    const sessionNameInput = document.getElementById('sessionName');
    const newSessionBtn = document.getElementById('newSessionBtn');
    const savedSessionsSelect = document.getElementById('savedSessionsSelect');
    const deleteCurrentSessionBtn = document.getElementById('deleteCurrentSessionBtn');
    const deleteAllSessionsBtn = document.getElementById('deleteAllSessionsBtn');

    const exportSessionsBtn = document.getElementById('exportSessionsBtn');
    const importSessionsBtn = document.getElementById('importSessionsBtn');
    const importFile = document.getElementById('importFile');

    // Elemento para o tema removido

    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const content = document.querySelector('.content');
    const pageTitle = document.getElementById('pageTitle');

    let numerosSorteados = [];
    const letrasBingo = ['B', 'I', 'N', 'G', 'O'];
    let hasDrawnNumbers = false;
    let currentSessionName = '';

    const SESSIONS_KEY = 'bingo_saved_sessions';
    const SESSION_DATA_PREFIX = 'bingo_session_';
    // Chave para o tema removida

    // --- Funções Auxiliares ---
    function formatarNumeroDoisDigitos(num) {
        return num < 10 ? '0' + num : String(num);
    }

    function gerarTabelaBingo() {
        bingoTableBody.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const row = document.createElement('tr');
            const letterCell = document.createElement('td');
            letterCell.textContent = letrasBingo[i];
            letterCell.classList.add('bingo-letter');
            row.appendChild(letterCell);
            for (let j = 0; j < 15; j++) {
                const cell = document.createElement('td');
                const numero = (i * 15) + j + 1;
                // Cria um span para o número e o adiciona à célula
                const numeroSpan = document.createElement('span');
                numeroSpan.textContent = formatarNumeroDoisDigitos(numero);
                numeroSpan.classList.add('bingo-number-circle'); // Adiciona uma classe para estilização
                cell.appendChild(numeroSpan);

                cell.dataset.numeroOriginal = numero; // Mantém o dataset para identificação
				cell.addEventListener('click', () => {
					if (!currentSessionName) {
						alert('Por favor, defina um nome para esta série de bingo antes de sortear o primeiro número.');
						sessionNameInput.focus();
						openSidebar();
						return;
					}

					if (numerosSorteados.includes(numero)) {
						alert(`O número ${formatarNumeroDoisDigitos(numero)} já foi sorteado.`);
						return;
					}

					if (!confirm(`Confirmar sorteio do número ${formatarNumeroDoisDigitos(numero)}?`)) {
						return;
					}

					destacarNumero(numero);
					numerosSorteados.push(numero);
					atualizarListaSorteados();
					numeroSorteadoInput.value = '';
					numeroSorteadoInput.focus();
				});
                row.appendChild(cell);
            }
            bingoTableBody.appendChild(row);
        }
    }

    function destacarNumero(numero) {
        const todasAsCelulas = bingoTableBody.querySelectorAll('td');
        for (const celula of todasAsCelulas) {
            if (celula.dataset.numeroOriginal && parseInt(celula.dataset.numeroOriginal) === numero) {
                const numeroSpan = celula.querySelector('.bingo-number-circle');
                if (numeroSpan) {
                    // Antes de destacar um NOVO número, remove o destaque do ANTERIOR último número.
                    const currentLastDrawn = bingoTableBody.querySelector('.last-drawn');
                    if (currentLastDrawn) {
                        currentLastDrawn.classList.remove('last-drawn');
                    }

                    celula.classList.add('highlighted'); // Mantém o destaque normal
                    numeroSpan.classList.add('last-drawn'); // Adiciona a classe para o estilo do último número
                }
                return;
            }
        }
    }

    function removerDestaqueNumero(numero) {
        const todasAsCelulas = bingoTableBody.querySelectorAll('td');
        for (const celula of todasAsCelulas) {
            if (celula.dataset.numeroOriginal && parseInt(celula.dataset.numeroOriginal) === numero) {
                const numeroSpan = celula.querySelector('.bingo-number-circle');
                if (numeroSpan) {
                    celula.classList.remove('highlighted');
                    numeroSpan.classList.remove('last-drawn'); // Remove a classe do número desfeito
                }
                return;
            }
        }
    }

    // Esta função agora será responsável por garantir que APENAS o último número na lista
    // (se houver) tenha a classe 'last-drawn'.
    function updateLastDrawnStyle() {
        // Primeiro, remove a classe 'last-drawn' de qualquer elemento que a tenha.
        const currentLastDrawn = bingoTableBody.querySelector('.last-drawn');
        if (currentLastDrawn) {
            currentLastDrawn.classList.remove('last-drawn');
        }

        // Se houver números sorteados, aplica a classe 'last-drawn' ao último da lista.
        if (numerosSorteados.length > 0) {
            const lastNumber = numerosSorteados[numerosSorteados.length - 1];
            const todasAsCelulas = bingoTableBody.querySelectorAll('td');
            for (const celula of todasAsCelulas) {
                if (celula.dataset.numeroOriginal && parseInt(celula.dataset.numeroOriginal) === lastNumber) {
                    const numeroSpan = celula.querySelector('.bingo-number-circle');
                    if (numeroSpan) {
                        numeroSpan.classList.add('last-drawn');
                    }
                    // Não precisa de 'return' aqui se você quiser continuar a iterar
                    // ou se tiver certeza que só haverá uma célula com esse número.
                    // Mas para otimização, se o número é único, um 'return' é bom.
                    return; // Encontrou e aplicou, pode sair.
                }
            }
        }
    }

    function atualizarListaSorteados() {
        const numerosEmOrdemInversa = [...numerosSorteados].reverse();
        const numerosParaExibirFormatados = numerosEmOrdemInversa.map(num => formatarNumeroDoisDigitos(num));

        numerosSorteadosLista.value = numerosParaExibirFormatados.join(' - ');
        contadorNumerosSorteados.textContent = `(${numerosSorteados.length})`;

        hasDrawnNumbers = numerosSorteados.length > 0;

        saveCurrentSession();
        // Atualiza o destaque do último número SEMPRE que a lista muda
        updateLastDrawnStyle(); // CHAME AQUI!
    }

    function updatePageTitle() {
        if (currentSessionName) {
            pageTitle.textContent = `Bingo - Série ${currentSessionName}`;
        } else {
            pageTitle.textContent = 'Bingo - Sem Série';
        }
    }

    // --- Funções de Gerenciamento de Sessão (localStorage) ---
    function saveCurrentSession() {
        if (!currentSessionName) {
            updateSavedSessionsList();
            return;
        }

        const sessionData = {
            numbers: numerosSorteados,
            timestamp: new Date().toLocaleString()
        };
        localStorage.setItem(SESSION_DATA_PREFIX + currentSessionName, JSON.stringify(sessionData));

        let savedSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
        savedSessions = [...new Set(savedSessions)];
        if (!savedSessions.includes(currentSessionName)) {
            savedSessions.push(currentSessionName);
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(savedSessions));
        }
        updateSavedSessionsList();
    }

    function loadSession(sessionName) {
        const sessionData = JSON.parse(localStorage.getItem(SESSION_DATA_PREFIX + sessionName));
        if (sessionData) {
            numerosSorteados.forEach(num => removerDestaqueNumero(num));

            numerosSorteados = sessionData.numbers;
            currentSessionName = sessionName;
            sessionNameInput.value = sessionName;

            numerosSorteados.forEach(num => destacarNumero(num));
            atualizarListaSorteados();
            updatePageTitle();
            alert(`Série "${sessionName}" carregada com sucesso!`);
            closeSidebar();
        } else {
            alert(`Erro: Série "${sessionName}" não encontrada.`);
        }
    }

    function updateSavedSessionsList() {
        let savedSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
        savedSessions = [...new Set(savedSessions)];

        savedSessionsSelect.innerHTML = '<option value="">-- Selecione uma série --</option>';
        savedSessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session;
            option.textContent = session;
            savedSessionsSelect.appendChild(option);
        });
        if (currentSessionName) {
            savedSessionsSelect.value = currentSessionName;
        }
    }

    function startNewSession() {
        if (hasDrawnNumbers && currentSessionName) {
            if (!confirm(`A série atual "${currentSessionName}" não está vazia. Tem certeza que deseja iniciar uma nova série e perder o progresso não salvo?`)) {
                return;
            }
        } else if (hasDrawnNumbers && !currentSessionName) {
             if (!confirm('Existem números sorteados nesta sessão sem nome. Deseja iniciar uma nova série e perder o progresso?')) {
                return;
            }
        }

        numerosSorteados.forEach(num => removerDestaqueNumero(num));
        numerosSorteados = [];
        currentSessionName = '';
        sessionNameInput.value = '';
        atualizarListaSorteados();
        updatePageTitle();
        updateSavedSessionsList();
        alert('Nova série iniciada.');
        sessionNameInput.focus();
        openSidebar();
    }

    function deleteCurrentSession() {
        if (!currentSessionName) {
            alert('Não há uma série atual para apagar.');
            return;
        }

        if (confirm(`Tem certeza que deseja APAGAR a série "${currentSessionName}" do histórico? Esta ação é irreversível.`)) {
            localStorage.removeItem(SESSION_DATA_PREFIX + currentSessionName);

            let savedSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
            savedSessions = savedSessions.filter(name => name !== currentSessionName);
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(savedSessions));

            numerosSorteados.forEach(num => removerDestaqueNumero(num));
            numerosSorteados = [];
            currentSessionName = '';
            sessionNameInput.value = '';
            atualizarListaSorteados();
            updatePageTitle();
            updateSavedSessionsList();
            alert(`Série "${currentSessionName}" apagada com sucesso.`);
            closeSidebar();
        }
    }

    function deleteAllSavedSessions() {
        if (confirm('ATENÇÃO: Tem certeza que deseja APAGAR TODAS as séries salvas? Esta ação é irreversível.')) {
            localStorage.clear();
            numerosSorteados.forEach(num => removerDestaqueNumero(num));
            numerosSorteados = [];
            currentSessionName = '';
            sessionNameInput.value = '';
            atualizarListaSorteados();
            updatePageTitle();
            updateSavedSessionsList();
            alert('Todas as séries salvas foram apagadas.');
            closeSidebar();
        }
    }

    // --- Funções de Exportar/Importar ---
    function exportAllSessions() {
        let allData = {};
        const savedSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');

        savedSessions.forEach(sessionName => {
            const sessionData = localStorage.getItem(SESSION_DATA_PREFIX + sessionName);
            if (sessionData) {
                allData[sessionName] = JSON.parse(sessionData);
            }
        });

        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const defaultFileName = `bingo_series_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}_${now.getMinutes().toString().padStart(2, '0')}_${now.getSeconds().toString().padStart(2, '0')}.json`;

        // Prompt for filename with default suggestion
        const fileName = prompt('Nome do arquivo para exportar:', defaultFileName);

        if (fileName) { // If user didn't cancel
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        URL.revokeObjectURL(url); // Clean up the object URL
        closeSidebar();
    }

    function handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);

                if (!confirm('Ao importar, as séries existentes com o mesmo nome serão sobrescritas. Tem certeza que deseja continuar?')) {
                    importFile.value = '';
                    return;
                }

                let sessionsAdded = 0;
                let sessionsOverwritten = 0;
                let invalidData = 0;

                let savedSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
                savedSessions = [...new Set(savedSessions)];

                for (const sessionName in importedData) {
                    if (importedData.hasOwnProperty(sessionName)) {
                        const sessionData = importedData[sessionName];
                        if (sessionData && Array.isArray(sessionData.numbers)) {
                            const localStorageKey = SESSION_DATA_PREFIX + sessionName;
                            if (localStorage.getItem(localStorageKey)) {
                                sessionsOverwritten++;
                            } else {
                                sessionsAdded++;
                            }
                            localStorage.setItem(localStorageKey, JSON.stringify(sessionData));

                            if (!savedSessions.includes(sessionName)) {
                                savedSessions.push(sessionName);
                            }
                        } else {
                            invalidData++;
                            console.warn(`Dados inválidos para a série: ${sessionName}`);
                        }
                    }
                }
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(savedSessions));

                numerosSorteados.forEach(num => removerDestaqueNumero(num));
                numerosSorteados = [];
                currentSessionName = '';
                sessionNameInput.value = '';
                atualizarListaSorteados();
                updatePageTitle();

                let importMessage = `Importação concluída!\n`;
                if (sessionsAdded > 0) importMessage += `- ${sessionsAdded} séries adicionadas.\n`;
                if (sessionsOverwritten > 0) importMessage += `- ${sessionsOverwritten} séries sobrescritas.\n`;
                if (invalidData > 0) importMessage += `- ${invalidData} entradas ignoradas devido a dados inválidos.\n`;
                if (sessionsAdded === 0 && sessionsOverwritten === 0 && invalidData === 0) {
                    importMessage += `- Nenhum dado de série válido encontrado no arquivo.`;
                }

                alert(importMessage);
                closeSidebar();

            } catch (e) {
                alert('Erro ao importar arquivo: Formato JSON inválido ou corrompido.');
                console.error(e);
            } finally {
                importFile.value = '';
            }
        };
        reader.readAsText(file);
    }

    // Funções de Tema removidas

    // --- Funções da Sidebar ---
    function openSidebar() {
        sidebar.style.width = '250px';
        content.style.marginLeft = '250px';
        openSidebarBtn.style.left = '270px';
    }

    function closeSidebar() {
        sidebar.style.width = '0';
        content.style.marginLeft = '0';
        openSidebarBtn.style.left = '20px';
    }

    // Adicione esta função auxiliar para remover o destaque do último número
    // quando a página é carregada e múltiplos números já estão sorteados,
    // ou para garantir que apenas o último tenha o estilo especial ao carregar uma sessão.
    function applyLastDrawnStyleOnLoad() {
        // Primeiro, remova qualquer 'last-drawn' existente se a página for recarregada
        const currentLastDrawn = bingoTableBody.querySelector('.last-drawn');
        if (currentLastDrawn) {
            currentLastDrawn.classList.remove('last-drawn');
        }

        if (numerosSorteados.length > 0) {
            const lastNumber = numerosSorteados[numerosSorteados.length - 1];
            const todasAsCelulas = bingoTableBody.querySelectorAll('td');
            for (const celula of todasAsCelulas) {
                if (celula.dataset.numeroOriginal && parseInt(celula.dataset.numeroOriginal) === lastNumber) {
                    const numeroSpan = celula.querySelector('.bingo-number-circle');
                    if (numeroSpan) {
                        numeroSpan.classList.add('last-drawn');
                    }
                    return;
                }
            }
        }
    }

    // --- Event Listeners ---
    sortearBtn.addEventListener('click', () => {
        if (!currentSessionName) {
            alert('Por favor, defina um nome para esta série de bingo antes de sortear o primeiro número.');
            sessionNameInput.focus();
            openSidebar();
            return;
        }

        const numero = parseInt(numeroSorteadoInput.value);

        if (isNaN(numero) || numero < 1 || numero > 75) {
            alert('Por favor, insira um número válido entre 1 e 75.');
            return;
        }

        if (numerosSorteados.includes(numero)) {
            alert(`O número ${formatarNumeroDoisDigitos(numero)} já foi sorteado.`);
            return;
        }

        if (!confirm(`Confirmar sorteio do número ${formatarNumeroDoisDigitos(numero)}?`)) {
            return;
        }

        destacarNumero(numero);
        numerosSorteados.push(numero);
        atualizarListaSorteados();
        numeroSorteadoInput.value = '';
        numeroSorteadoInput.focus();
    });

    desfazerBtn.addEventListener('click', () => {
        if (numerosSorteados.length === 0) {
            alert('Não há jogada para desfazer.');
            return;
        }

        const numeroADesfazer = numerosSorteados[numerosSorteados.length - 1];

        if (confirm(`Tem certeza que deseja desfazer a jogada do número ${formatarNumeroDoisDigitos(numeroADesfazer)}?`)) {
            removerDestaqueNumero(numeroADesfazer);
            numerosSorteados.pop();
            atualizarListaSorteados();
        }
    });

    numeroSorteadoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sortearBtn.click();
        }
    });

    newSessionBtn.addEventListener('click', startNewSession);
    deleteCurrentSessionBtn.addEventListener('click', deleteCurrentSession);
    deleteAllSessionsBtn.addEventListener('click', deleteAllSavedSessions);

    sessionNameInput.addEventListener('change', () => {
        const newName = sessionNameInput.value.trim();
        if (newName && newName !== currentSessionName) {
            currentSessionName = newName;
            saveCurrentSession();
            updatePageTitle();
        } else if (!newName && currentSessionName) {
            if (confirm(`O nome da série foi removido. Deseja apagar a série "${currentSessionName}" do histórico?`)) {
                 localStorage.removeItem(SESSION_DATA_PREFIX + currentSessionName);
                 let savedSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
                 savedSessions = savedSessions.filter(name => name !== currentSessionName);
                 localStorage.setItem(SESSIONS_KEY, JSON.stringify(savedSessions));
            }
            currentSessionName = '';
            updatePageTitle();
            updateSavedSessionsList();
        }
    });

    savedSessionsSelect.addEventListener('change', () => {
        const selectedSession = savedSessionsSelect.value;
        if (selectedSession) {
            loadSession(selectedSession);
        }
    });

    openSidebarBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);

    exportSessionsBtn.addEventListener('click', exportAllSessions);
    importSessionsBtn.addEventListener('click', () => {
        importFile.click();
    });
    importFile.addEventListener('change', handleImportFile);

    // Event listener para o botão de tema removido

    // --- Inicialização ---
    gerarTabelaBingo();
    updateSavedSessionsList();
    // A função atualizarListaSorteados já chamará updateLastDrawnStyle
    atualizarListaSorteados();
    updatePageTitle();
    // A chamada anterior a 'applyLastDrawnStyleOnLoad()' pode ser removida
    // pois 'atualizarListaSorteados()' já a chama.

    
    // loadThemePreference() removido
});

function atualizarListaSorteados() {
    // ... (código existente)

    // Após atualizar a lista e salvar a sessão, aplique o estilo do último número
    applyLastDrawnStyleOnLoad();
}