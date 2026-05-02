// Inicializa a aplicação assim que o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos do DOM ---
  const eventIcon = document.getElementById('event-icon');
  const eventTitle = document.getElementById('event-title');
  const configButton = document.getElementById('config-button');
  const roundSelector = document.getElementById('round-selector');
  const prizeLabel = document.getElementById('prize-label');
  const drawnNumbersList = document.getElementById('drawn-numbers-list');
  const toggleSortButton = document.getElementById('toggle-sort-button');
  const roundCompletedCheckbox = document.getElementById('round-completed-checkbox');
  const manualNumberInput = document.getElementById('manual-number-input');
  const confirmNumberButton = document.getElementById('confirm-number-button');
  const undoLastButton = document.getElementById('undo-last-button');
  const manualDrawControls = document.getElementById('manual-draw-controls');
  const autoDrawControls = document.getElementById('auto-draw-controls');
  const drawRandomButton = document.getElementById('draw-random-button');
  const numbersCountSpan = document.getElementById('numbers-count');
  const closeModalX = document.getElementById('close-modal-x');
  const patternGrid = document.getElementById('pattern-grid');
  const patternSelect = document.getElementById('pattern-select');
  const configSessionSelector = document.getElementById('config-session-selector');
  const newSessionButton = document.getElementById('new-session-button');
  const deleteSessionButton = document.getElementById('delete-session-button');
  const configSessionId = document.getElementById('config-session-id');
  const regenerateIdButton = document.getElementById('regenerate-id-button');
  const copyLinkButton = document.getElementById('copy-link-button');
  const headerQrButton = document.getElementById('header-qr-button');
  const showQrButton = document.getElementById('show-qr-button');
  const qrModal = document.getElementById('qr-modal');
  const qrcodeLarge = document.getElementById('qrcode-large');
  const closeQrModalX = document.getElementById('close-qr-modal-x');
  const closeQrModalButton = document.getElementById('close-qr-modal-button');
  const qrLinkDisplay = document.getElementById('qr-link-display');
  const loadFromFirebaseButton = document.getElementById('load-from-firebase-button');

  // --- Definições de Padrões ---
  const BINGO_PATTERNS = [
    { name: "Personalizado", sequences: [] },
    { name: "Linha", sequences: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]] },
    { name: "Coluna", sequences: [[0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24]] },
    { name: "Linha+Coluna", sequences: [[0, 1, 2, 3, 4, 6, 11, 16, 21], [5, 6, 7, 8, 9, 3, 13, 18, 23], [10, 11, 12, 13, 14, 4, 9, 19, 24], [15, 16, 17, 18, 19, 0, 5, 10, 20], [20, 21, 22, 23, 24, 2, 7, 12, 17]] },
    { name: "Diagonal", sequences: [[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]] },
    { name: "7 Pedras", sequences: [[18, 7, 24, 14, 9, 16, 4], [5, 3, 7, 19, 21, 18, 4], [3, 8, 10, 1, 24, 21, 13], [21, 14, 16, 10, 17, 4, 18], [22, 4, 0, 23, 21, 2, 6]] },
    { name: "Cartela Cheia", sequences: [Array.from({ length: 25 }, (_, i) => i)] }
  ];

  let animationStep = 0;
  let animationPhase = true; // true = cor, false = vazio

  // Popular o seletor de padrões
  BINGO_PATTERNS.forEach((p, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = p.name;
    patternSelect.appendChild(option);
  });

  // --- Elementos do Modal de Configuração ---
  const configModal = document.getElementById('config-modal');
  const closeConfigButton = document.getElementById('close-config-button');
  const configEventName = document.getElementById('config-event-name');
  const configNumRounds = document.getElementById('config-num-rounds');
  const configMaxNumber = document.getElementById('config-max-number');
  const configDrawMode = document.getElementById('config-draw-mode');
  const configIconUpload = document.getElementById('config-icon-upload');
  const configIconRemove = document.getElementById('config-icon-remove');
  const configFirebaseWriteToken = document.getElementById('config-firebase-write-token');
  const configIconPreview = document.getElementById('config-icon-preview');
  const exportSessionButton = document.getElementById('export-session-button');
  const importSessionButton = document.getElementById('import-session-button');
  const importSessionInput = document.getElementById('import-session-input');

  /**
   * Gera uma string aleatória de 6 caracteres (excluindo I e O) para identificação da sessão.
   * @param {number} length - Tamanho do ID a ser gerado.
   */
  const generateRandomId = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXY'; // Somente letras maiúsculas, sem I e O para evitar ambiguidade com 1 e 0
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // --- Estado da Aplicação ---
  let sessionsData = {
    sessionId: generateRandomId(),
    firebaseWriteToken: "",
    activeSessionName: "Sessão Padrão",
    sessions: {}
  };
  let appState = {};

  /**
   * Cria um objeto de estado inicial para uma nova sessão de bingo com rodadas padrão.
   * @param {string} name - Nome da sessão a ser criada.
   */
  const createDefaultSessionState = (name) => {
    const newState = {
      eventName: name,
      eventIcon: "default-icon.png",
      maxNumber: 75,
      numRounds: 1,
      currentRound: 1,
      drawMode: "manual",
      rounds: {},
      isSortedAscending: false
    };
    for (let i = 1; i <= newState.numRounds; i++) {
      newState.rounds[i] = { prize: `Prêmio da Rodada ${i}`, drawnNumbers: [], lastDrawn: null, pattern: [], patternIndex: 0, isCompleted: false };
    }
    return newState;
  };

  /**
   * INFORMAÇÕES DE SEGURANÇA DO FIREBASE (MODO SIMPLES):
   *
   * Neste modo, não usamos Firebase Auth. Usamos uma regra de validação que compara
   * o campo 'firebaseWriteToken' enviado com uma string fixa nas regras do Banco.
   *
   * Passos para configurar no Console do Firebase (Realtime Database -> Regras):
   * 1. Vá na aba "Rules" (Regras) do seu Realtime Database.
   * 2. Cole as seguintes regras (substitua 'MINHA_SENHA_MESTRA' pela sua senha):
   *
   * {
   *   "rules": {
   *     "sessions": {
   *       "$session_id": {
   *         ".read": true,
   *         ".write": "newData.child('firebaseWriteToken').val() === 'MINHA_SENHA_MESTRA'",
   *         "firebaseWriteToken": {
   *           ".read": false // Protege o token para que espectadores não o vejam
   *         }
   *       }
   *     }
   *   }
   * }
   */

  let syncTimeout = null;
  /**
   * Sincroniza o objeto sessionsData completo com o Firebase Realtime Database.
   * @param {boolean} immediate - Se verdadeiro, ignora o debounce e executa a sincronização na hora.
   */
  const syncToFirebase = (immediate = false) => {
    const performSync = () => {
      // Não sincroniza nada com o Firebase enquanto o menu de configuração estiver aberto.
      // Isso garante que a restauração de dados e edições de ID/Token não causem conflitos ou sobrescritas acidentais.
      if (configModal && !configModal.classList.contains('hidden')) return;

      if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && sessionsData && sessionsData.sessionId) {
        // Enviamos o sessionsData que já contém o campo firebaseWriteToken na raiz.
        firebase.database().ref('sessions/' + sessionsData.sessionId).set(sessionsData)
          .catch(err => {
            console.error("Erro ao sincronizar Firebase:", err.code, err.message);
          });
      }
    };

    if (syncTimeout) clearTimeout(syncTimeout);

    if (immediate) {
      performSync();
    } else {
      syncTimeout = setTimeout(performSync, 1000); // Debounce de 1 segundo para digitação
    }
  };

  /**
   * Salva o estado atual no localStorage do navegador e agenda a sincronização com o Firebase.
   * @param {boolean} immediate - Define se a sincronização com o Firebase deve ser imediata.
   */
  const saveState = (immediate = false) => {
    localStorage.setItem('bingoSessionsData', JSON.stringify(sessionsData));
    syncToFirebase(immediate);
  };

  /**
   * Recupera os dados salvos no localStorage ou realiza a migração de dados de versões antigas.
   * Inicializa a sessão ativa e configura o Firebase.
   */
  const loadState = () => {
    const storedData = localStorage.getItem('bingoSessionsData');
    if (storedData) {
      sessionsData = JSON.parse(storedData);

      // Migração: se os campos não estiverem na raiz, busca da sessão ativa
      if (!sessionsData.sessionId) {
        const current = sessionsData.sessions[sessionsData.activeSessionName];
        sessionsData.sessionId = current?.sessionId || generateRandomId();
        sessionsData.firebaseWriteToken = current?.firebaseWriteToken || "";
      }

      appState = sessionsData.sessions[sessionsData.activeSessionName];
    } else {
      // Migração de dados do formato antigo ou inicialização limpa
      const legacyState = localStorage.getItem('bingoAppState');
      if (legacyState) {
        const parsedLegacy = JSON.parse(legacyState);
        const name = parsedLegacy.eventName || "Sessão Antiga";
        sessionsData.sessionId = parsedLegacy.sessionId || generateRandomId();
        sessionsData.firebaseWriteToken = parsedLegacy.firebaseWriteToken || "";
        sessionsData.sessions[name] = parsedLegacy;
        sessionsData.activeSessionName = name;
      } else {
        sessionsData.sessionId = generateRandomId();
        const defaultName = "Sessão Padrão";
        sessionsData.sessions[defaultName] = createDefaultSessionState(defaultName);
        sessionsData.activeSessionName = defaultName;
      }
      appState = sessionsData.sessions[sessionsData.activeSessionName];
    }

    // Inicializa Firebase se a configuração estiver disponível
    if (typeof firebaseConfig !== 'undefined' && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    updateUI(true);
  };

  /**
   * Atualiza todos os elementos visuais da interface (textos, listas, seletores e modais) com base no estado atual.
   * @param {boolean} immediateSync - Define se as alterações devem ser salvas no Firebase imediatamente.
   */
  const updateUI = (immediateSync = false) => {
    // Header
    eventTitle.textContent = appState.eventName;
    document.title = appState.eventName;
    eventIcon.src = appState.eventIcon;
    configIconPreview.src = appState.eventIcon; // Atualiza a prévia no modal

    // Round Selector
    updateRoundSelector();
    roundSelector.value = appState.currentRound;

    // Checkbox de Conclusão
    const currentRoundData = appState.rounds[appState.currentRound];
    roundCompletedCheckbox.checked = !!currentRoundData.isCompleted;

    // Desabilita controles se a rodada estiver concluída
    const isLocked = !!currentRoundData.isCompleted;
    manualNumberInput.disabled = isLocked;
    confirmNumberButton.disabled = isLocked;
    drawRandomButton.disabled = isLocked;
    undoLastButton.disabled = isLocked;

    // Prize Label
    prizeLabel.textContent = appState.rounds[appState.currentRound].prize;
    if (prizeLabel.textContent.trim() === '') {
      prizeLabel.textContent = `Prêmio da Rodada ${appState.currentRound}`;
    }

    // Drawn Numbers
    displayDrawnNumbers();

    // Padrão da Rodada
    initPatternGrid();
    patternSelect.value = appState.rounds[appState.currentRound].patternIndex || 0;

    // Placeholder Dinâmico
    manualNumberInput.placeholder = `01-${appState.maxNumber.toString().padStart(2, '0')}`;
    manualNumberInput.max = appState.maxNumber;

    // Control Section (Manual/Automatic)
    if (appState.drawMode === "manual") {
      manualDrawControls.classList.remove('hidden');
      autoDrawControls.classList.add('hidden');
    } else {
      manualDrawControls.classList.add('hidden');
      autoDrawControls.classList.remove('hidden');
    }

    // Config Modal
    configEventName.value = appState.eventName;
    configNumRounds.value = appState.numRounds;
    configMaxNumber.value = appState.maxNumber;
    configDrawMode.value = appState.drawMode;
    configFirebaseWriteToken.value = sessionsData.firebaseWriteToken || '';
    configSessionId.value = sessionsData.sessionId || '';
    updateSessionSelector();

    // Botão de Ordenação
    toggleSortButton.textContent = appState.isSortedAscending ? "Ordem: Crescente" : "Ordem: Sorteio";

    // Link de Compartilhamento
    const configShareLink = document.getElementById('config-share-link');
    if (configShareLink) {
      // Usamos href.split para evitar erros com window.location.origin sendo 'null' em arquivos locais
      const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('index.html', '');
      configShareLink.value = `${baseUrl}view.html?id=${sessionsData.sessionId}`;
    }

    saveState(immediateSync);
  };

  /**
   * Preenche o menu suspenso de escolha de sessões dentro do modal de configurações.
   */
  const updateSessionSelector = () => {
    configSessionSelector.innerHTML = '';
    Object.keys(sessionsData.sessions).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      if (name === sessionsData.activeSessionName) option.selected = true;
      configSessionSelector.appendChild(option);
    });
  };

  /**
   * Atualiza as opções do seletor de rodadas na interface principal.
   */
  const updateRoundSelector = () => {
    roundSelector.innerHTML = ''; // Limpa opções existentes
    for (let i = 1; i <= appState.numRounds; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Rodada ${i}`;
      roundSelector.appendChild(option);
    }
  };

  /**
   * Gera a grade 5x5 de células para a definição manual do padrão da rodada.
   */
  const initPatternGrid = () => {
    patternGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.classList.add('pattern-cell');
      // Adiciona evento para alternar a marcação da célula no padrão manual
      cell.addEventListener('click', () => togglePatternCell(i));
      patternGrid.appendChild(cell);
    }
  };

  /**
   * Altera a aparência das células da grade de padrão para refletir quais estão ativas.
   * @param {number[]} activeIndices - Lista de índices (0-24) que devem ser destacados.
   */
  const updatePatternGridUI = (activeIndices) => {
    const cells = patternGrid.querySelectorAll('.pattern-cell');
    cells.forEach((cell, i) => {
      if (activeIndices.includes(i)) {
        cell.classList.add('active');
      } else {
        cell.classList.remove('active');
      }
    });
  };

  /**
   * Inicia o loop de animação da grade de padrão, alternando entre quadros para criar o efeito visual.
   */
  const startAnimationLoop = () => {
    const run = () => {
      const currentRoundData = appState.rounds[appState.currentRound];
      if (!currentRoundData) return setTimeout(run, 1000);

      const pIdx = currentRoundData.patternIndex || 0;
      patternGrid.title = `Padrão: ${BINGO_PATTERNS[pIdx].name}`;

      if (pIdx === 0) {
        // Modo Animado para um padrão próprio
        if (animationPhase) {
          updatePatternGridUI(currentRoundData.pattern || []);
        } else {
          updatePatternGridUI([]);
        }
        animationPhase = !animationPhase;
      } else {
        // Modo Animado
        const pattern = BINGO_PATTERNS[pIdx];
        if (animationPhase) {
          const seq = pattern.sequences[animationStep % pattern.sequences.length];
          updatePatternGridUI(seq);
          animationStep++;
        } else {
          updatePatternGridUI([]);
        }
        animationPhase = !animationPhase;
      }
      setTimeout(run, 1000);
    };
    run();
  };

  /**
   * Adiciona ou remove um índice da lista de padrão personalizado da rodada ativa ao clicar na grade.
   * @param {number} index - O índice da célula clicada (0-24).
   */
  const togglePatternCell = (index) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.patternIndex = 0; // Muda para personalizado ao clicar
    if (!currentRoundData.pattern) currentRoundData.pattern = [];
    const pos = currentRoundData.pattern.indexOf(index);
    if (pos > -1) {
      currentRoundData.pattern.splice(pos, 1);
    } else {
      currentRoundData.pattern.push(index);
    }
    patternSelect.value = 0; // Volta visualmente para "Personalizado"
    saveState(true);
  };

  /**
   * Renderiza a lista de números sorteados na tela, aplicando destaques e ordenação.
   */
  const displayDrawnNumbers = () => {
    drawnNumbersList.innerHTML = '';
    const currentRoundData = appState.rounds[appState.currentRound];
    if (!currentRoundData) return;
    let numbersToDisplay = [...(currentRoundData.drawnNumbers || [])];

    numbersCountSpan.textContent = `(${numbersToDisplay.length})`;

    if (appState.isSortedAscending) {
      numbersToDisplay.sort((a, b) => a - b);
    } else {
      numbersToDisplay.reverse(); // Ordem inversa de sorteio
    }

    numbersToDisplay.forEach(num => {
      const numElement = document.createElement('div');
      numElement.classList.add('drawn-number-item');
      numElement.textContent = num.toString().padStart(2, '0');
      if (num === currentRoundData.lastDrawn) {
        numElement.classList.add('last-drawn');
      }
      drawnNumbersList.appendChild(numElement);
    });
  };

  /**
   * Valida e registra um novo número sorteado na rodada atual.
   * @param {number} number - O número digitado ou sorteado aleatoriamente.
   */
  const addDrawnNumber = (number) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    if (currentRoundData.isCompleted) {
      alert("Esta rodada está marcada como concluída. Desmarque para alterar.");
      return;
    }
    if (!currentRoundData.drawnNumbers) currentRoundData.drawnNumbers = [];
    if (number < 1 || number > appState.maxNumber || isNaN(number)) {
      alert(`Por favor, digite um número válido entre 01 e ${appState.maxNumber.toString().padStart(2, '0')}.`);
      return;
    }
    if (currentRoundData.drawnNumbers.includes(number)) {
      alert(`O número ${number.toString().padStart(2, '0')} já foi sorteado nesta rodada.`);
      return;
    }

    currentRoundData.drawnNumbers.push(number);
    currentRoundData.lastDrawn = number;
    manualNumberInput.value = ''; // Limpa o input
    updateUI(true);
    manualNumberInput.focus();
  };

  /**
   * Remove o último número sorteado da lista da rodada atual, após confirmação.
   */
  const undoLastDrawnNumber = () => {
    const currentRoundData = appState.rounds[appState.currentRound];
    if (currentRoundData.isCompleted) {
      alert("Esta rodada está marcada como concluída. Desmarque para alterar.");
      return;
    }
    if (currentRoundData && currentRoundData.drawnNumbers && currentRoundData.drawnNumbers.length > 0) {
      if (confirm("Tem certeza que deseja desfazer o último número sorteado?")) {
        currentRoundData.drawnNumbers.pop(); // Remove o último
        currentRoundData.lastDrawn = currentRoundData.drawnNumbers.length > 0 ?
          currentRoundData.drawnNumbers[currentRoundData.drawnNumbers.length - 1] :
          null;
        updateUI(true);
      }
      manualNumberInput.focus();
    }
  };

  /**
   * Seleciona um número aleatório ainda não sorteado dentro do intervalo definido (1-MaxNumber).
   */
  const drawRandomNumber = () => {
    const currentRoundData = appState.rounds[appState.currentRound];
    if (currentRoundData.isCompleted) {
      alert("Esta rodada está marcada como concluída. Desmarque para alterar.");
      return;
    }
    if (!currentRoundData.drawnNumbers) currentRoundData.drawnNumbers = [];
    const availableNumbers = [];
    for (let i = 1; i <= appState.maxNumber; i++) {
      if (!currentRoundData.drawnNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      alert("Todos os números já foram sorteados nesta rodada!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const drawn = availableNumbers[randomIndex];
    addDrawnNumber(drawn);
  };

  // --- Event Listeners ---
  // Abre o modal de configurações do evento
  configButton.addEventListener('click', () => {
    configModal.classList.remove('hidden');
  });

  /**
   * Fecha o modal de configurações e atualiza a interface.
   */
  const closeModal = () => {
    configModal.classList.add('hidden');
    updateUI(); // Atualiza a UI principal caso algo tenha sido alterado
  };

  /**
   * Fecha o modal de exibição do QR Code.
   */
  const closeQrModal = () => {
    qrModal.classList.add('hidden');
  };

  // Fecha o modal de configurações ao clicar no botão "Fechar"
  closeConfigButton.addEventListener('click', closeModal);
  // Fecha o modal de configurações ao clicar no "X"
  closeModalX.addEventListener('click', closeModal);

  // Atalhos de teclado (Escape para fechar modais)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !configModal.classList.contains('hidden')) {
      closeModal();
    }
    if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
      closeQrModal();
    }
  });

  // Altera a rodada ativa quando o usuário seleciona outra no menu suspenso
  roundSelector.addEventListener('change', (e) => {
    appState.currentRound = parseInt(e.target.value);
    updateUI(true);
  });

  // Marca ou desmarca a rodada como concluída
  roundCompletedCheckbox.addEventListener('change', (e) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.isCompleted = e.target.checked;
    updateUI(true);
  });

  // Salva o nome do prêmio quando o usuário para de editar o campo
  prizeLabel.addEventListener('blur', (e) => {
    if (e.target.textContent.trim() === '') {
      e.target.textContent = `Prêmio da Rodada ${appState.currentRound}`;
    }
    appState.rounds[appState.currentRound].prize = e.target.textContent;
    saveState(true);
  });

  // Confirma a adição manual de um número digitado
  confirmNumberButton.addEventListener('click', () => {
    const number = parseInt(manualNumberInput.value);
    addDrawnNumber(number);
  });

  // Permite adicionar número manual pressionando a tecla Enter
  manualNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmNumberButton.click();
    }
  });

  // Desfaz o último número sorteado
  undoLastButton.addEventListener('click', undoLastDrawnNumber);

  // Alterna entre ordem de sorteio e ordem crescente na exibição
  toggleSortButton.addEventListener('click', () => {
    appState.isSortedAscending = !appState.isSortedAscending;
    updateUI(true);
  });

  // Sorteia um número aleatório (disponível no modo automático)
  drawRandomButton.addEventListener('click', drawRandomNumber);

  // Altera o padrão visual da rodada (Linha, Coluna, etc.)
  patternSelect.addEventListener('change', (e) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.patternIndex = parseInt(e.target.value);
    animationStep = 0;
    animationPhase = true;
    saveState(true);
  });

  // Config Modal Event Listeners
  // Troca a sessão ativa dentro do modal de configurações
  configSessionSelector.addEventListener('change', (e) => {
    sessionsData.activeSessionName = e.target.value;
    appState = sessionsData.sessions[sessionsData.activeSessionName];
    updateUI(true);
  });

  // Sincroniza o ID da sessão pública conforme o usuário digita
  configSessionId.addEventListener('input', (e) => {
    sessionsData.sessionId = e.target.value.toUpperCase();
    updateUI(false); // Sincronização em segundo plano enquanto digita
  });

  // Gera um novo ID de sessão aleatório
  regenerateIdButton.addEventListener('click', () => {
    sessionsData.sessionId = generateRandomId();
    updateUI(true);
  });

  // Copia o link de visualização para a área de transferência
  copyLinkButton.addEventListener('click', () => {
    const shareLink = document.getElementById('config-share-link');
    navigator.clipboard.writeText(shareLink.value).then(() => {
      const originalText = copyLinkButton.textContent;
      copyLinkButton.textContent = '✅';
      setTimeout(() => copyLinkButton.textContent = originalText, 2000);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      alert('Não foi possível copiar o link automaticamente.');
    });
  });

  /**
   * Gera o QR Code para o link de visualização e abre o modal correspondente.
   */
  const openQrModal = () => {
    const shareLink = document.getElementById('config-share-link');

    qrcodeLarge.innerHTML = ""; // Limpa QR anterior
    new QRCode(qrcodeLarge, {
      text: shareLink.value,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    qrModal.classList.remove('hidden');
    qrLinkDisplay.textContent = shareLink.value; // Exibe o link abaixo do QR Code
  };

  // Abre o modal de QR Code a partir do botão no cabeçalho
  if (headerQrButton) headerQrButton.addEventListener('click', openQrModal);
  // Abre o modal de QR Code a partir do botão no modal de configurações
  showQrButton.addEventListener('click', openQrModal);

  // Fecha o modal de QR Code ao clicar no "X"
  closeQrModalX.addEventListener('click', closeQrModal);
  // Fecha o modal de QR Code ao clicar no botão "Fechar"
  closeQrModalButton.addEventListener('click', closeQrModal);

  // Busca dados de uma sessão existente no Firebase usando ID e Token
  loadFromFirebaseButton.addEventListener('click', async () => {
    let id = configSessionId.value.trim().toUpperCase();
    if (id.length !== 6) {
      id = prompt("Digite o Código da Sessão (ID Público) para retomar:", id)?.toUpperCase().trim();
    }
    if (!id || id.length !== 6) return;

    let token = configFirebaseWriteToken.value.trim();
    if (!token) {
      token = prompt("Digite o Token Secreto (Senha de Escrita) para esta sessão:");
    }
    if (!token) return;

    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
      alert("Firebase não configurado corretamente.");
      return;
    }

    try {
      const snapshot = await firebase.database().ref('sessions/' + id).once('value');
      const data = snapshot.val();

      if (data) {
        // Injetamos o token manual pois o Firebase não o retorna na leitura
        data.firebaseWriteToken = token;
        sessionsData = data;
        appState = sessionsData.sessions[sessionsData.activeSessionName];

        updateUI(true);
        alert("Sessão retomada da nuvem com sucesso!");
      } else {
        alert("Sessão não encontrada no servidor com este ID.");
      }
    } catch (error) {
      console.error("Erro ao retomar da nuvem:", error);
      alert("Erro ao acessar a nuvem: " + error.message);
    }
  });

  // Atualiza o token de escrita conforme o usuário digita
  configFirebaseWriteToken.addEventListener('input', (e) => {
    sessionsData.firebaseWriteToken = e.target.value;
    saveState(false); // Sincronização em segundo plano enquanto digita
  });

  // Cria uma nova sessão no projeto atual
  newSessionButton.addEventListener('click', () => {
    const name = prompt("Nome da nova sessão:");
    if (name && name.trim() !== "") {
      if (sessionsData.sessions[name]) {
        alert("Já existe uma sessão com este nome.");
        return;
      }
      sessionsData.sessions[name] = createDefaultSessionState(name);
      sessionsData.activeSessionName = name;
      appState = sessionsData.sessions[name];
      updateUI(true);
    }
  });

  // Exclui a sessão ativa atual
  deleteSessionButton.addEventListener('click', () => {
    const names = Object.keys(sessionsData.sessions);
    const currentName = sessionsData.activeSessionName;

    if (names.length <= 1) {
      if (confirm(`Esta é a única sessão existente. Deseja resetá-la para o estado inicial?`)) {
        delete sessionsData.sessions[currentName];
        const defaultName = "Sessão Padrão";
        sessionsData.sessions[defaultName] = createDefaultSessionState(defaultName);
        sessionsData.activeSessionName = defaultName;
        appState = sessionsData.sessions[defaultName];
        updateUI(true);
      }
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a sessão "${currentName}"?`)) {
      delete sessionsData.sessions[currentName];
      sessionsData.activeSessionName = Object.keys(sessionsData.sessions)[0];
      appState = sessionsData.sessions[sessionsData.activeSessionName];
      updateUI(true);
    }
  });

  // Renomeia o evento e sincroniza com a chave da sessão
  configEventName.addEventListener('input', (e) => {
    const newName = e.target.value;
    const oldName = sessionsData.activeSessionName;
    if (newName === oldName || !newName) return;

    // Renomeia a chave no objeto de sessões
    sessionsData.sessions[newName] = sessionsData.sessions[oldName];
    delete sessionsData.sessions[oldName];
    sessionsData.activeSessionName = newName;
    appState.eventName = newName;
    updateUI(false); // Sincronização em segundo plano enquanto digita
  });

  // Altera a quantidade de rodadas do evento
  configNumRounds.addEventListener('change', (e) => {
    const newNumRounds = parseInt(e.target.value);
    if (newNumRounds < 1) {
      alert("O número de rodadas deve ser pelo menos 1.");
      configNumRounds.value = appState.numRounds; // Reverte para o valor anterior
      return;
    }
    // Adicionar ou remover rodadas conforme necessário
    if (newNumRounds > appState.numRounds) {
      for (let i = appState.numRounds + 1; i <= newNumRounds; i++) {
        appState.rounds[i] = { prize: `Prêmio da Rodada ${i}`, drawnNumbers: [], lastDrawn: null, pattern: [], patternIndex: 0, isCompleted: false };
      }
    } else if (newNumRounds < appState.numRounds) {
      // Remover rodadas extras (cuidado para não perder dados se já houver sorteios)
      if (confirm(`Tem certeza que deseja reduzir o número de rodadas para ${newNumRounds}? Dados das rodadas ${newNumRounds + 1} em diante serão perdidos.`)) {
        for (let i = appState.numRounds; i > newNumRounds; i--) {
          delete appState.rounds[i];
        }
        if (appState.currentRound > newNumRounds) {
          appState.currentRound = newNumRounds; // Ajusta a rodada atual se ela for removida
        }
      } else {
        configNumRounds.value = appState.numRounds; // Reverte
        return;
      }
    }
    appState.numRounds = newNumRounds;
    updateUI(true);
  });

  // Altera o limite máximo de números para o bingo (ex: 75 ou 90)
  configMaxNumber.addEventListener('change', (e) => {
    const newMax = parseInt(e.target.value);
    if (isNaN(newMax) || newMax < 1 || newMax > 90) {
      alert("O número máximo deve ser entre 1 e 90.");
      configMaxNumber.value = appState.maxNumber;
      return;
    }

    // Verifica se algum número sorteado em qualquer rodada excede o novo limite
    let invalidNumber = null;
    for (const roundId in appState.rounds) {
      const drawn = appState.rounds[roundId].drawnNumbers || [];
      invalidNumber = drawn.find(n => n > newMax);
      if (invalidNumber) break;
    }

    if (invalidNumber) {
      alert(`Não é possível reduzir o limite para ${newMax}, pois o número ${invalidNumber.toString().padStart(2, '0')} já foi sorteado em uma das rodadas.`);
      configMaxNumber.value = appState.maxNumber;
      return;
    }

    appState.maxNumber = newMax;
    saveState(true);
  });

  // Altera entre modo de sorteio manual (input) ou automático (botão)
  configDrawMode.addEventListener('change', (e) => {
    appState.drawMode = e.target.value;
    updateUI(true);
  });

  // Processa o upload de uma imagem personalizada para o ícone do evento
  configIconUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        appState.eventIcon = event.target.result; // Base64 string
        eventIcon.src = appState.eventIcon; // Atualiza imediatamente
        configIconPreview.src = appState.eventIcon; // Atualiza a prévia
        saveState(true);
      };
      reader.readAsDataURL(file); // Converte a imagem para Base64
    }
  });

  // Restaura o ícone padrão do evento
  configIconRemove.addEventListener('click', () => {
    // Se o ícone já for o padrão, não faz nada
    if (appState.eventIcon === "default-icon.png") return;

    appState.eventIcon = "default-icon.png";
    eventIcon.src = appState.eventIcon;
    configIconPreview.src = appState.eventIcon;
    configIconUpload.value = ''; // Limpa o campo de upload
    saveState(true);
    alert("Ícone padrão restaurado.");
  });


  // Gera e baixa um arquivo JSON com todos os dados do projeto
  exportSessionButton.addEventListener('click', () => {
    // Criamos uma cópia para processar a exportação sem alterar o estado em memória
    const stateToExport = JSON.parse(JSON.stringify(appState));

    // Se a imagem for muito grande, quebramos em um array de strings (fatias de 5k caracteres)
    if (typeof stateToExport.eventIcon === 'string' && stateToExport.eventIcon.length > 5000) {
      stateToExport.eventIcon = stateToExport.eventIcon.match(/.{1,5000}/g);
    }

    const dataStr = JSON.stringify(stateToExport, null, 2); // Formata para leitura
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFileName = appState.eventName.replace(/\s+/g, '_');
    a.download = `${safeFileName}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Gatilho para o seletor de arquivo de importação
  importSessionButton.addEventListener('click', () => {
    importSessionInput.click(); // Dispara o clique no input de arquivo escondido
  });

  // Lê e processa o arquivo JSON selecionado para importar dados
  importSessionInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedState = JSON.parse(event.target.result);
          // Validação básica para garantir que é um estado de bingo válido
          if (importedState && importedState.eventName && importedState.rounds) {

            // Se o ícone foi exportado como array (múltiplas linhas), juntamos novamente
            if (Array.isArray(importedState.eventIcon)) {
              importedState.eventIcon = importedState.eventIcon.join('');
            }

            // Garante um ID se o arquivo importado for de uma versão anterior
            if (!importedState.sessionId) importedState.sessionId = generateRandomId();

            sessionsData.sessions[importedState.eventName] = importedState;
            sessionsData.activeSessionName = importedState.eventName;
            appState = sessionsData.sessions[importedState.eventName];
            updateUI(true);
            alert("Sessão importada com sucesso!");
          } else {
            alert("Arquivo JSON inválido para sessão de bingo.");
          }
        } catch (error) {
          alert("Erro ao ler o arquivo JSON: " + error.message);
        }
      };
      reader.readAsText(file);
    }
  });


  // --- Inicialização ---
  loadState(); // Carrega o estado salvo ao iniciar
  startAnimationLoop();
});
