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
  const moveSessionUpButton = document.getElementById('move-session-up-button');
  const moveSessionDownButton = document.getElementById('move-session-down-button');
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

  // Elementos do Gerenciador de Eventos
  const eventsMgrButton = document.getElementById('events-mgr-button');
  const eventsMgrModal = document.getElementById('events-mgr-modal');
  const closeEventsMgrX = document.getElementById('close-events-mgr-x');
  const closeEventsMgrButton = document.getElementById('close-events-mgr-button');
  const mgrNewEventButton = document.getElementById('mgr-new-event-button');
  const sessionsListContainer = document.getElementById('sessions-list-container');

  // Elementos de Autenticação
  const loginOverlay = document.getElementById('login-overlay');
  const adminHeader = document.getElementById('admin-header');
  const adminMain = document.getElementById('admin-main');
  const googleLoginButton = document.getElementById('google-login-button');
  const logoutButton = document.getElementById('logout-button');
  const userInfoSpan = document.getElementById('user-info');

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
  const configEventTitle = document.getElementById('config-event-title');
  const configSessionName = document.getElementById('config-session-name');
  const configNumRounds = document.getElementById('config-num-rounds');
  const configMaxNumber = document.getElementById('config-max-number');
  const configDrawMode = document.getElementById('config-draw-mode');
  const configIconUpload = document.getElementById('config-icon-upload');
  const configIconRemove = document.getElementById('config-icon-remove');
  const configIconPreview = document.getElementById('config-icon-preview');
  const exportSessionButton = document.getElementById('export-session-button');
  const importSessionButton = document.getElementById('import-session-button');
  const importSessionInput = document.getElementById('import-session-input');

  /**
   * Gera uma string aleatória de 6 caracteres (excluindo I e O) para identificação da sessão.
   * @param {number} length - Tamanho do ID a ser gerado.
   */
  const generateRandomId = (length = 6) => {
    // Incluímos números (exceto 0 e 1) e removemos I e O para evitar confusão visual
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  /**
   * Verifica no Firebase se um ID de sessão já está em uso.
   * @param {string} id - O ID a ser verificado.
   * @returns {Promise<boolean>} - True se o ID já existir.
   */
  const checkIdExists = async (id) => {
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) return false;
    const snapshot = await firebase.database().ref('sessions/' + id).once('value');
    return snapshot.exists();
  };

  // --- Estado da Aplicação ---
  let eventData = {
    eventid: generateRandomId(),
    eventName: "Novo Evento de Bingo",
    ownerUid: null, // Armazena o UID do criador
    activeBingoSessionName: "Sessão Padrão",
    sessions: {},
    sessionOrder: []
  };
  let appState = {};

  /**
   * Cria um objeto de estado inicial para uma nova sessão de bingo (game).
   * @param {string} name - Nome da sessão de bingo.
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

  let syncTimeout = null;
  /**
   * Sincroniza o objeto eventData completo com o Firebase Realtime Database.
   * @param {boolean} immediate - Se verdadeiro, ignora o debounce e executa a sincronização na hora.
   */
  const syncToFirebase = (immediate = false) => {
    const performSync = () => {
      // Não sincroniza nada com o Firebase enquanto o menu de configuração estiver aberto.
      // Isso garante que a restauração de dados e edições de ID não causem conflitos.
      const isConfigOpen = configModal && !configModal.classList.contains('hidden');
      const isMgrOpen = eventsMgrModal && !eventsMgrModal.classList.contains('hidden');
      if (isConfigOpen || isMgrOpen) return;

      const user = firebase.auth().currentUser;
      if (!user) return; // Só sincroniza se estiver logado

      if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && eventData?.eventid) {
        // Se a sessão não tem dono, o usuário logado assume a propriedade
        if (!eventData.ownerUid) {
          eventData.ownerUid = user.uid;
        }

        firebase.database().ref('sessions/' + eventData.eventid).set(eventData)
          .catch(err => {
            console.error("Erro ao sincronizar Firebase:", err.code, err.message);
            if (err.code === 'PERMISSION_DENIED') {
              alert("Erro de Permissão: Você não é o proprietário deste ID de sessão ou não está autorizado.");
            }
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
   * Registra o evento atual na lista de eventos conhecidos pelo usuário no localStorage.
   */
  const registerEventLocally = () => {
    const registry = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
    // Armazena o nome principal e a lista de todas as sessões para visualização no gerenciador
    registry[eventData.eventid] = {
      name: eventData.eventName || "Evento sem nome",
      sessions: eventData.sessionOrder || []
    };
    localStorage.setItem('bingoUserEvents', JSON.stringify(registry));
  };

  /**
   * Salva o estado atual no localStorage e agenda a sincronização.
   * @param {boolean} immediate - Define se a sincronização com o Firebase deve ser imediata.
   */
  const saveState = (immediate = false) => {
    localStorage.setItem('bingoEventData', JSON.stringify(eventData));
    registerEventLocally();
    syncToFirebase(immediate);
  };

  /**
   * Recupera os dados salvos no localStorage ou realiza a migração de dados de versões antigas.
   * Inicializa a sessão ativa e configura o Firebase.
   */
  const loadState = () => {
    const storedData = localStorage.getItem('bingoEventData');
    if (storedData) {
      eventData = JSON.parse(storedData);

      if (!eventData.eventName) {
        eventData.eventName = eventData.sessions[eventData.activeBingoSessionName]?.eventName || "Evento de Bingo";
      }

      // Compatibilidade: garante que as propriedades renomeadas existam
      if (eventData.sessionId) { eventData.eventid = eventData.sessionId; delete eventData.sessionId; }
      if (eventData.activeSessionName) { eventData.activeBingoSessionName = eventData.activeSessionName; delete eventData.activeSessionName; }
      if (!eventData.sessionOrder) eventData.sessionOrder = Object.keys(eventData.sessions);

      appState = eventData.sessions[eventData.activeBingoSessionName];
    } else {
      // Migração de dados do formato antigo (bingoAppState)
      const legacyState = localStorage.getItem('bingoAppState');
      if (legacyState) {
        const parsedLegacy = JSON.parse(legacyState);
        const name = parsedLegacy.eventName || "Sessão Antiga";
        eventData.eventid = parsedLegacy.sessionId || generateRandomId();
        eventData.eventName = parsedLegacy.eventName || "Bingo";
        eventData.sessions[name] = parsedLegacy;
        eventData.sessionOrder = [name];
        eventData.activeBingoSessionName = name;
      } else {
        eventData.eventid = generateRandomId();
        eventData.eventName = "Bingo";
        const defaultName = "Sessão Padrão";
        eventData.sessions[defaultName] = createDefaultSessionState(defaultName);
        eventData.sessionOrder = [defaultName];
        eventData.activeBingoSessionName = defaultName;
      }
      appState = eventData.sessions[eventData.activeBingoSessionName];
    }

    // Inicializa Firebase e Monitora Autenticação
    if (typeof firebaseConfig !== 'undefined' && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();

    // Monitor de estado de login
    auth.onAuthStateChanged(user => {
      if (user) {
        // Usuário logado
        loginOverlay.classList.add('hidden');
        adminHeader.classList.remove('hidden');
        adminMain.classList.remove('hidden');
        if (userInfoSpan) {
          userInfoSpan.textContent = user.displayName || user.email;
          userInfoSpan.classList.remove('hidden');
        }
        updateUI(true);
      } else {
        // Usuário deslogado
        loginOverlay.classList.remove('hidden');
        adminHeader.classList.add('hidden');
        adminMain.classList.add('hidden');
      }
    });
  };

  // Handlers de Autenticação
  googleLoginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(error => {
      alert("Erro ao logar: " + error.message);
    });
  });

  logoutButton.addEventListener('click', () => {
    if (confirm("Deseja realmente sair?")) {
      firebase.auth().signOut();
    }
  });

  /**
   * Atualiza todos os elementos visuais da interface (textos, listas, seletores e modais) com base no estado atual.
   * @param {boolean} immediateSync - Define se as alterações devem ser salvas no Firebase imediatamente.
   */
  const updateUI = (immediateSync = false) => {
    // Header
    eventTitle.textContent = eventData.eventName || appState.eventName;
    document.title = eventData.eventName || appState.eventName;
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
    if (configEventTitle) configEventTitle.value = eventData.eventName || '';
    if (configSessionName) configSessionName.value = appState.eventName || '';
    configNumRounds.value = appState.numRounds;
    configMaxNumber.value = appState.maxNumber;
    configDrawMode.value = appState.drawMode;
    configSessionId.value = eventData.eventid || '';
    updateSessionSelector();

    // Desabilita botões de reordenação se necessário
    const orderIdx = eventData.sessionOrder.indexOf(eventData.activeBingoSessionName);
    if (moveSessionUpButton) moveSessionUpButton.disabled = orderIdx <= 0;
    if (moveSessionDownButton) moveSessionDownButton.disabled = orderIdx >= eventData.sessionOrder.length - 1;

    // Botão de Ordenação
    toggleSortButton.textContent = appState.isSortedAscending ? "Ordem: Crescente" : "Ordem: Sorteio";

    // Link de Compartilhamento
    const configShareLink = document.getElementById('config-share-link');
    if (configShareLink) {
      // Usamos href.split para evitar erros com window.location.origin sendo 'null' em arquivos locais
      const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('control.html', '').replace('index.html', '');
      configShareLink.value = `${baseUrl}view.html?id=${eventData.eventid}`;
    }

    saveState(immediateSync);
  };

  /**
   * Preenche o menu suspenso de escolha de sessões dentro do modal de configurações.
   */
  const updateSessionSelector = () => {
    configSessionSelector.innerHTML = '';
    eventData.sessionOrder.forEach(name => {
      if (!eventData.sessions[name]) return;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      if (name === eventData.activeBingoSessionName) option.selected = true;
      configSessionSelector.appendChild(option);
    });
  };

  /**
   * Renderiza a lista de Eventos (IDs diferentes) no modal de gerenciamento.
   */
  const renderEventsList = () => {
    if (!sessionsListContainer) return;
    sessionsListContainer.innerHTML = '';

    const registry = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');

    Object.entries(registry).forEach(([id, data]) => {
      const isCurrent = id === eventData.eventid;

      let eventName = "Evento sem nome";
      let sessionNames = [];

      // Lida com dados legados (string) ou novo formato (objeto)
      if (typeof data === 'string') {
        eventName = data;
      } else if (data && typeof data === 'object') {
        eventName = data.name || "Evento sem nome";
        sessionNames = data.sessions || [];
      }

      const item = document.createElement('div');
      item.className = 'event-mgr-item';
      item.style.alignItems = 'flex-start'; // Alinha no topo caso a lista seja grande

      const nameSpan = document.createElement('span');
      const sessionsHtml = sessionNames.length > 0
        ? `<ul style="margin: 5px 0 0 15px; padding: 0; font-size: 0.85em; color: #777; list-style-type: disc;">` +
        sessionNames.map(s => `<li>${s}</li>`).join('') + `</ul>`
        : "";

      nameSpan.innerHTML = `<strong>${eventName}</strong> <br><small style="color: #666">Código: ${id}</small>${sessionsHtml}`;
      if (isCurrent) {
        nameSpan.style.fontWeight = 'bold';
        nameSpan.innerHTML += ' <small style="color: #28a745">(Ativa)</small>';
      }

      const actions = document.createElement('div');
      actions.style.display = 'flex'; actions.style.gap = '5px';

      if (!isCurrent) {
        const selectBtn = document.createElement('button');
        selectBtn.textContent = 'Abrir';
        selectBtn.style.padding = '5px 10px'; selectBtn.style.fontSize = '0.8em';
        selectBtn.onclick = () => {
          configSessionId.value = id;
          loadFromFirebaseButton.click();
          closeEventsMgr();
        };
        actions.appendChild(selectBtn);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Remover da Lista';
      deleteBtn.classList.add('undo-button');
      deleteBtn.style.padding = '5px 10px'; deleteBtn.style.fontSize = '0.8em';
      deleteBtn.onclick = () => {
        if (confirm(`Remover o evento "${name}" da sua lista local?`)) {
          const reg = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
          delete reg[id];
          localStorage.setItem('bingoUserEvents', JSON.stringify(reg));
          renderEventsList();
        }
      };

      actions.appendChild(deleteBtn);
      item.appendChild(nameSpan); item.appendChild(actions);
      sessionsListContainer.appendChild(item);
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
    updateUI(); // Garante que os estados dos botões de reordenação estejam atualizados
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
   * Abre o gerenciador de sessões e renderiza a lista.
   */
  const openEventsMgr = () => {
    renderEventsList();
    eventsMgrModal.classList.remove('hidden');
  };

  /**
   * Fecha o gerenciador de sessões.
   */
  const closeEventsMgr = () => {
    eventsMgrModal.classList.add('hidden');
    updateUI();
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
    if (e.key === 'Escape' && !eventsMgrModal.classList.contains('hidden')) {
      closeEventsMgr();
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
    eventData.activeBingoSessionName = e.target.value;
    appState = eventData.sessions[eventData.activeBingoSessionName];
    updateUI(true);
  });

  /**
   * Altera a ordem da sessão ativa na lista de sessões.
   * @param {number} direction - -1 para subir, 1 para descer.
   */
  const moveSession = (direction) => {
    const name = eventData.activeBingoSessionName;
    const index = eventData.sessionOrder.indexOf(name);
    if (index === -1) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= eventData.sessionOrder.length) return;

    // Troca de posição no array de ordem
    const temp = eventData.sessionOrder[index];
    eventData.sessionOrder[index] = eventData.sessionOrder[newIndex];
    eventData.sessionOrder[newIndex] = temp;

    updateUI(true);
  };

  // Permite que o usuário escolha manualmente o ID da sessão com validação de propriedade
  configSessionId.addEventListener('change', async (e) => {
    const newId = e.target.value.toUpperCase().trim();
    const user = firebase.auth().currentUser;

    if (!newId || newId === eventData.eventid) return;

    // Verifica se o ID já existe e quem é o dono no Firebase
    try {
      const snapshot = await firebase.database().ref('sessions/' + newId).once('value');
      const existingData = snapshot.val();

      if (existingData && existingData.ownerUid && existingData.ownerUid !== user.uid) {
        alert(`O código "${newId}" já está em uso por outro organizador. Por favor, escolha outro.`);
        configSessionId.value = eventData.eventid; // Reverte para o ID anterior no campo
        return;
      }

      // Se o ID estiver livre ou pertencer ao usuário logado, atualiza
      eventData.eventid = newId;
      saveState(true); // Sincroniza imediatamente com o novo ID
      alert(`ID da sessão alterado para: ${newId}`);
    } catch (error) {
      console.error("Erro ao validar novo ID:", error);
      alert("Erro ao verificar disponibilidade do ID. Tente novamente.");
    }
  });


  // Gera um novo ID de sessão aleatório
  regenerateIdButton.addEventListener('click', async () => {
    let newId = generateRandomId();
    let isTaken = await checkIdExists(newId);

    // Tenta gerar um novo ID até encontrar um que não esteja em uso (limite de 5 tentativas)
    let attempts = 0;
    while (isTaken && attempts < 5) {
      newId = generateRandomId();
      isTaken = await checkIdExists(newId);
      attempts++;
    }

    eventData.eventid = newId;
    updateUI(true); // Salva e sincroniza o novo ID
  });

  // Reordenação de sessões
  moveSessionUpButton.addEventListener('click', () => moveSession(-1));
  moveSessionDownButton.addEventListener('click', () => moveSession(1));

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

  // --- Event Listeners do Gerenciador de Sessões ---
  if (eventsMgrButton) eventsMgrButton.addEventListener('click', openEventsMgr);
  if (closeEventsMgrX) closeEventsMgrX.addEventListener('click', closeEventsMgr);
  if (closeEventsMgrButton) closeEventsMgrButton.addEventListener('click', closeEventsMgr);

  if (mgrNewEventButton) {
    mgrNewEventButton.addEventListener('click', () => {
      if (!confirm("Isso criará um Evento totalmente novo com um novo Código ID. Deseja continuar?")) return;

      const defaultName = "Novo Evento de Bingo";
      eventData.eventid = generateRandomId();
      eventData.sessions = {};
      eventData.sessions[defaultName] = createDefaultSessionState(defaultName);
      eventData.sessionOrder = [defaultName];
      eventData.activeBingoSessionName = defaultName;
      appState = eventData.sessions[defaultName];
      updateUI(true);
      closeEventsMgr();
    });
  }

  // Fecha o modal de sessões ao clicar no overlay (fora do conteúdo)
  if (eventsMgrModal) {
    eventsMgrModal.addEventListener('click', (e) => { if (e.target === eventsMgrModal) closeEventsMgr(); });
  }

  // Busca dados de uma sessão existente no Firebase usando ID e Token
  loadFromFirebaseButton.addEventListener('click', async () => {
    let id = configSessionId.value.trim().toUpperCase();
    if (!id || id.length > 16) {
      id = prompt("Digite o Código da Sessão (ID Público) para retomar:")?.toUpperCase().trim();
    }
    if (!id || id.length === 0 || id.length > 16) return;

    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
      alert("Firebase não configurado corretamente.");
      return;
    }

    try {
      const snapshot = await firebase.database().ref('sessions/' + id).once('value');
      const data = snapshot.val();
      const user = firebase.auth().currentUser;

      if (data) {
        if (data.ownerUid && data.ownerUid !== user.uid) {
          alert("Acesso Negado: Esta sessão pertence a outra conta Google.");
          return;
        }

        eventData = data;
        appState = eventData.sessions[eventData.activeBingoSessionName];

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

  // Cria uma nova sessão no projeto atual
  newSessionButton.addEventListener('click', () => {
    const name = prompt("Nome da nova sessão:");
    if (name && name.trim() !== "") {
      if (eventData.sessions[name]) {
        alert("Já existe uma sessão com este nome.");
        return;
      }
      eventData.sessions[name] = createDefaultSessionState(name);
      eventData.sessionOrder.push(name);
      eventData.activeBingoSessionName = name;
      appState = eventData.sessions[name];
      updateUI(true);
    }
  });

  // Exclui a sessão ativa atual
  deleteSessionButton.addEventListener('click', () => {
    const names = Object.keys(eventData.sessions);
    const currentName = eventData.activeBingoSessionName;

    if (names.length <= 1) {
      if (confirm(`Esta é a única sessão existente. Deseja resetá-la para o estado inicial?`)) {
        delete eventData.sessions[currentName];
        const defaultName = "Sessão Padrão";
        eventData.sessions[defaultName] = createDefaultSessionState(defaultName);
        eventData.sessionOrder = [defaultName];
        eventData.activeBingoSessionName = defaultName;
        appState = eventData.sessions[defaultName];
        updateUI(true);
      }
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a sessão "${currentName}"?`)) {
      delete eventData.sessions[currentName];
      eventData.sessionOrder = eventData.sessionOrder.filter(n => n !== currentName);
      eventData.activeBingoSessionName = Object.keys(eventData.sessions)[0];
      appState = eventData.sessions[eventData.activeBingoSessionName];
      updateUI(true);
    }
  });

  // Listener para o Nome do Evento (Título Geral)
  if (configEventTitle) {
    configEventTitle.addEventListener('input', (e) => {
      eventData.eventName = e.target.value;
      updateUI(false);
    });
  }

  // Listener para Renomear a Sessão Selecionada
  if (configSessionName) {
    configSessionName.addEventListener('change', (e) => {
      const newName = e.target.value.trim();
      const oldName = eventData.activeBingoSessionName;
      if (!newName || newName === oldName) return;

      if (eventData.sessions[newName]) {
        alert("Já existe uma sessão com este nome.");
        e.target.value = oldName;
        return;
      }

      eventData.sessions[newName] = eventData.sessions[oldName];
      delete eventData.sessions[oldName];
      const orderIdx = eventData.sessionOrder.indexOf(oldName);
      if (orderIdx !== -1) eventData.sessionOrder[orderIdx] = newName;
      eventData.activeBingoSessionName = newName;
      appState = eventData.sessions[newName];
      appState.eventName = newName;
      updateUI(true);
    });
  }

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
            if (!importedState.eventid) importedState.eventid = importedState.sessionId || generateRandomId();

            eventData.sessions[importedState.eventName] = importedState;
            eventData.activeBingoSessionName = importedState.eventName;
            appState = eventData.sessions[importedState.eventName];
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
