document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos do DOM ---
  const eventIcon = document.getElementById('event-icon');
  const eventTitle = document.getElementById('event-title');
  const configButton = document.getElementById('config-button');
  const roundSelector = document.getElementById('round-selector');
  const prizeLabel = document.getElementById('prize-label');
  const drawnNumbersList = document.getElementById('drawn-numbers-list');
  const toggleSortButton = document.getElementById('toggle-sort-button');
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

  // Config Modal Elements
  const configModal = document.getElementById('config-modal');
  const closeConfigButton = document.getElementById('close-config-button');
  const configEventName = document.getElementById('config-event-name');
  const configNumRounds = document.getElementById('config-num-rounds');
  const configMaxNumber = document.getElementById('config-max-number');
  const configDrawMode = document.getElementById('config-draw-mode');
  const configIconUpload = document.getElementById('config-icon-upload');
  const configIconPreview = document.getElementById('config-icon-preview');
  const exportSessionButton = document.getElementById('export-session-button');
  const importSessionButton = document.getElementById('import-session-button');
  const importSessionInput = document.getElementById('import-session-input');

  // --- Estado da Aplicação ---
  let appState = {
    eventName: "Bingo do Evento",
    eventIcon: "default-icon.png", // Pode ser um URL ou base64
    maxNumber: 75,
    numRounds: 1,
    currentRound: 1,
    drawMode: "manual", // "manual" ou "automatic"
    rounds: {
      // Exemplo:
      // "1": {
      //     prize: "Um carro!",
      //     drawnNumbers: [10, 25, 30],
      //     lastDrawn: 30
      // }
    },
    isSortedAscending: false // true para ordem crescente, false para ordem de sorteio
  };

  // --- Funções de Persistência (Local Storage) ---
  const saveState = () => {
    localStorage.setItem('bingoAppState', JSON.stringify(appState));
  };

  const loadState = () => {
    const storedState = localStorage.getItem('bingoAppState');
    if (storedState) {
      appState = JSON.parse(storedState);
      // Garantir que a estrutura de rounds esteja completa
      for (let i = 1; i <= appState.numRounds; i++) {
        if (!appState.rounds[i]) {
          appState.rounds[i] = { prize: `Prêmio da Rodada ${i}`, drawnNumbers: [], lastDrawn: null, pattern: [], patternIndex: 0 };
        }
      }
    } else {
      // Inicializar estado padrão se não houver nada salvo
      initializeDefaultState();
    }
    updateUI();
  };

  const initializeDefaultState = () => {
    appState.rounds = {};
    for (let i = 1; i <= appState.numRounds; i++) {
      appState.rounds[i] = { prize: `Prêmio da Rodada ${i}`, drawnNumbers: [], lastDrawn: null, pattern: [], patternIndex: 0 };
    }
  };

  // --- Funções de Atualização da UI ---
  const updateUI = () => {
    // Header
    eventTitle.textContent = appState.eventName;
    eventIcon.src = appState.eventIcon;
    configIconPreview.src = appState.eventIcon; // Atualiza a prévia no modal

    // Round Selector
    updateRoundSelector();
    roundSelector.value = appState.currentRound;

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

    // Botão de Ordenação
    toggleSortButton.textContent = appState.isSortedAscending ? "Ordem: Crescente" : "Ordem: Sorteio";

    saveState();
  };

  const updateRoundSelector = () => {
    roundSelector.innerHTML = ''; // Limpa opções existentes
    for (let i = 1; i <= appState.numRounds; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Rodada ${i}`;
      roundSelector.appendChild(option);
    }
  };

  const initPatternGrid = () => {
    patternGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.classList.add('pattern-cell');
      cell.addEventListener('click', () => togglePatternCell(i));
      patternGrid.appendChild(cell);
    }
  };

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
    saveState();
  };

  const displayDrawnNumbers = () => {
    drawnNumbersList.innerHTML = '';
    const currentRoundData = appState.rounds[appState.currentRound];
    let numbersToDisplay = [...currentRoundData.drawnNumbers];

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

  // --- Funções de Lógica de Bingo ---
  const addDrawnNumber = (number) => {
    const currentRoundData = appState.rounds[appState.currentRound];
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
    updateUI();
  };

  const undoLastDrawnNumber = () => {
    const currentRoundData = appState.rounds[appState.currentRound];
    if (currentRoundData.drawnNumbers.length > 0) {
      currentRoundData.drawnNumbers.pop(); // Remove o último
      currentRoundData.lastDrawn = currentRoundData.drawnNumbers.length > 0 ?
        currentRoundData.drawnNumbers[currentRoundData.drawnNumbers.length - 1] :
        null;
      updateUI();
    }
  };

  const drawRandomNumber = () => {
    const currentRoundData = appState.rounds[appState.currentRound];
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
  configButton.addEventListener('click', () => {
    configModal.classList.remove('hidden');
  });

  const closeModal = () => {
    configModal.classList.add('hidden');
    updateUI(); // Atualiza a UI principal caso algo tenha sido alterado
  };

  closeConfigButton.addEventListener('click', closeModal);
  closeModalX.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !configModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  roundSelector.addEventListener('change', (e) => {
    appState.currentRound = parseInt(e.target.value);
    updateUI();
  });

  prizeLabel.addEventListener('blur', (e) => {
    if (e.target.textContent.trim() === '') {
      e.target.textContent = `Prêmio da Rodada ${appState.currentRound}`;
    }
    appState.rounds[appState.currentRound].prize = e.target.textContent;
    saveState();
  });

  confirmNumberButton.addEventListener('click', () => {
    const number = parseInt(manualNumberInput.value);
    addDrawnNumber(number);
  });

  manualNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmNumberButton.click();
    }
  });

  undoLastButton.addEventListener('click', undoLastDrawnNumber);

  toggleSortButton.addEventListener('click', () => {
    appState.isSortedAscending = !appState.isSortedAscending;
    updateUI();
  });

  drawRandomButton.addEventListener('click', drawRandomNumber);

  patternSelect.addEventListener('change', (e) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.patternIndex = parseInt(e.target.value);
    animationStep = 0;
    animationPhase = true;
    saveState();
  });

  // Config Modal Event Listeners
  configEventName.addEventListener('input', (e) => {
    appState.eventName = e.target.value;
    eventTitle.textContent = appState.eventName; // Atualiza imediatamente
    saveState();
  });

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
        appState.rounds[i] = { prize: `Prêmio da Rodada ${i}`, drawnNumbers: [], lastDrawn: null, pattern: [], patternIndex: 0 };
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
    updateUI();
  });

  configMaxNumber.addEventListener('change', (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax < 1 || newMax > 200) { // Limite arbitrário para max 200
      alert("O número máximo deve ser entre 1 e 200.");
      configMaxNumber.value = appState.maxNumber;
      return;
    }
    // TODO: Adicionar lógica para verificar se números já sorteados excedem o novo maxNumber
    appState.maxNumber = newMax;
    saveState();
  });

  configDrawMode.addEventListener('change', (e) => {
    appState.drawMode = e.target.value;
    updateUI(); // Atualiza a visibilidade dos controles de sorteio
  });

  configIconUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        appState.eventIcon = event.target.result; // Base64 string
        eventIcon.src = appState.eventIcon; // Atualiza imediatamente
        configIconPreview.src = appState.eventIcon; // Atualiza a prévia
        saveState();
      };
      reader.readAsDataURL(file); // Converte a imagem para Base64
    }
  });

  exportSessionButton.addEventListener('click', () => {
    const dataStr = JSON.stringify(appState, null, 2); // Formata para leitura
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

  importSessionButton.addEventListener('click', () => {
    importSessionInput.click(); // Dispara o clique no input de arquivo escondido
  });

  importSessionInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedState = JSON.parse(event.target.result);
          // Validação básica para garantir que é um estado de bingo válido
          if (importedState && importedState.eventName && importedState.rounds) {
            appState = importedState;
            updateUI();
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
