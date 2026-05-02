// Inicializa a visualização do espectador assim que o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let sessionId = params.get('id');

  const idEntrySection = document.getElementById('id-entry-section');
  const bingoContent = document.getElementById('bingo-content');
  const manualIdInput = document.getElementById('manual-id-input');
  const joinSessionButton = document.getElementById('join-session-button');
  const eventTitle = document.getElementById('event-title');
  const showQrButton = document.getElementById('show-qr-button');
  const qrModal = document.getElementById('qr-modal');
  const qrcodeLarge = document.getElementById('qrcode-large');
  const closeQrModalX = document.getElementById('close-qr-modal-x');
  const closeQrModalButton = document.getElementById('close-qr-modal-button');
  const qrLinkDisplay = document.getElementById('qr-link-display');
  const patternNameDisplay = document.getElementById('pattern-name-display');
  const roundCompletedStatus = document.getElementById('round-completed-status');
  const prevRoundButton = document.getElementById('prev-round');
  const nextRoundButton = document.getElementById('next-round');
  const viewingActiveBadge = document.getElementById('viewing-active-badge');

  if (typeof firebaseConfig === 'undefined') {
    eventTitle.textContent = "Erro: Configuração ausente";
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  let currentRef = null;

  let appState = null;
  let viewedRound = null; // Rodada que o usuário está olhando no momento
  let followActive = true; // Se o usuário está seguindo a rodada ativa do organizador

  const BINGO_PATTERNS = [
    { name: "Personalizado", sequences: [] },
    { name: "Linha", sequences: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]] },
    { name: "Coluna", sequences: [[0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24]] },
    { name: "Linha+Coluna", sequences: [[0, 1, 2, 3, 4, 6, 11, 16, 21], [5, 6, 7, 8, 9, 3, 13, 18, 23], [10, 11, 12, 13, 14, 4, 9, 19, 24], [15, 16, 17, 18, 19, 0, 5, 10, 20], [20, 21, 22, 23, 24, 2, 7, 12, 17]] },
    { name: "Diagonal", sequences: [[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]] },
    { name: "7 Pedras", sequences: [[18, 7, 24, 14, 9, 16, 4], [5, 3, 7, 19, 21, 18, 4], [3, 8, 10, 1, 24, 21, 13], [21, 14, 16, 10, 17, 4, 18], [22, 4, 0, 23, 21, 2, 6]] },
    { name: "Cartela Cheia", sequences: [Array.from({ length: 25 }, (_, i) => i)] }
  ];

  let animationPhase = true;

  /**
   * Atualiza todos os textos e a lista de números sorteados na tela do espectador.
   */
  const updateUI = () => {
    if (!appState) return;

    document.getElementById('event-title').textContent = appState.eventName;
    document.title = "Bingo: " + appState.eventName;
    document.getElementById('event-icon').src = appState.eventIcon;

    const roundToDisplay = viewedRound || appState.currentRound;
    document.getElementById('current-round-label').textContent = "Rodada " + roundToDisplay;

    // Indicador de Rodada Atual
    const isViewingActive = (roundToDisplay === appState.currentRound);
    if (viewingActiveBadge) viewingActiveBadge.classList.toggle('hidden', !isViewingActive);

    const currentRoundData = appState.rounds[roundToDisplay];
    if (!currentRoundData) return;

    // Status de Conclusão
    if (roundCompletedStatus) {
      if (currentRoundData.isCompleted) {
        roundCompletedStatus.classList.remove('hidden');
      } else {
        roundCompletedStatus.classList.add('hidden');
      }
    }

    document.getElementById('prize-label').textContent = currentRoundData.prize || `Prêmio da Rodada ${roundToDisplay}`;

    // Números sorteados
    const list = document.getElementById('drawn-numbers-list');
    list.innerHTML = '';
    let nums = [...(currentRoundData.drawnNumbers || [])];
    document.getElementById('numbers-count').textContent = `(${nums.length})`;

    if (appState.isSortedAscending) nums.sort((a, b) => a - b);
    else nums.reverse();

    nums.forEach(num => {
      const item = document.createElement('div');
      item.classList.add('drawn-number-item');
      item.textContent = num.toString().padStart(2, '0');
      if (num === currentRoundData.lastDrawn) item.classList.add('last-drawn');
      list.appendChild(item);
    });

    // Atualiza estado dos botões de navegação
    prevRoundButton.disabled = roundToDisplay <= 1;
    nextRoundButton.disabled = roundToDisplay >= (appState.numRounds || 1);
  };

  /**
   * Inicializa a grade 5x5 de células de padrão para o espectador.
   */
  const initGrid = () => {
    const grid = document.getElementById('pattern-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.classList.add('pattern-cell');
      grid.appendChild(cell);
    }
  };

  /**
   * Atualiza visualmente o estado das células na grade do espectador.
   * @param {number[]} indices - Índices das células que devem ser destacadas.
   */
  const updateGridUI = (indices) => {
    const cells = document.querySelectorAll('.pattern-cell');
    cells.forEach((cell, i) => {
      cell.classList.toggle('active', indices.includes(i));
    });
  };

  /**
   * Inicia o loop de animação sincronizada do padrão de bingo para o espectador.
   */
  const startAnimation = () => {
    setInterval(() => {
      if (!appState) return;
      const roundToDisplay = viewedRound || appState.currentRound;
      const rd = appState.rounds[roundToDisplay];
      if (!rd) return;
      const pIdx = rd.patternIndex || 0;

      // Atualiza a legenda com o nome do padrão
      if (patternNameDisplay) {
        patternNameDisplay.textContent = BINGO_PATTERNS[pIdx]?.name || "Personalizado";
      }

      if (animationPhase) {
        if (pIdx === 0) updateGridUI(rd.pattern || []);
        else {
          const p = BINGO_PATTERNS[pIdx] || BINGO_PATTERNS[0];
          const seq = p.sequences[Math.floor(Date.now() / 1000) % (p.sequences.length || 1)] || [];
          updateGridUI(seq);
        }
      } else {
        updateGridUI([]);
      }
      animationPhase = !animationPhase;
    }, 1000);
  };

  /**
   * Conecta o Firebase para escutar atualizações em tempo real de uma sessão específica.
   * @param {string} id - Código da sessão (ID Público).
   */
  const connectToSession = (id) => {
    if (!id) return;

    // Remove listener anterior se existir
    if (currentRef) currentRef.off();

    currentRef = db.ref('sessions/' + id);
    currentRef.on('value', (snapshot) => {
      const data = snapshot.val();
      // Agora esperamos sessionsData, então buscamos a sessão ativa dentro dela
      if (data && data.sessions && data.activeSessionName) {
        const newState = data.sessions[data.activeSessionName];

        // Se estiver seguindo a rodada ativa ou for o primeiro carregamento
        if (followActive || viewedRound === null) {
          viewedRound = newState.currentRound;
        }

        appState = newState;
        idEntrySection.classList.add('hidden');
        bingoContent.classList.remove('hidden');
        updateUI();
      } else {
        eventTitle.textContent = "Sessão não encontrada";
        idEntrySection.classList.remove('hidden');
        bingoContent.classList.add('hidden');
      }
    });
  };

  /**
   * Fecha o modal de QR Code na visualização do espectador.
   */
  const closeQrModal = () => {
    qrModal.classList.add('hidden');
  };

  // Tenta conectar a uma sessão ao clicar no botão de entrada manual
  joinSessionButton.addEventListener('click', () => {
    const id = manualIdInput.value.trim().toUpperCase();
    if (id.length === 6) {
      sessionId = id;
      connectToSession(id);
    } else {
      alert("Por favor, digite um código válido de 6 caracteres.");
    }
  });

  // Gera o QR Code de compartilhamento para outros espectadores
  showQrButton.addEventListener('click', () => {
    if (!sessionId) {
      alert("Entre em uma sessão primeiro para compartilhar.");
      return;
    }
    // Constrói a URL de compartilhamento garantindo que o ID esteja nela
    // Usamos href.split para evitar erros com window.location.origin sendo 'null' em arquivos locais
    const url = new URL(window.location.href.split('?')[0].split('#')[0]);
    url.searchParams.set('id', sessionId);

    qrcodeLarge.innerHTML = ""; // Limpa QR anterior
    new QRCode(qrcodeLarge, {
      text: url.toString(),
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    qrModal.classList.remove('hidden');
    qrLinkDisplay.textContent = url.toString(); // Exibe o link abaixo do QR Code
  });

  // Navegação: Rodada Anterior
  prevRoundButton.addEventListener('click', () => {
    viewedRound = Math.max(1, viewedRound - 1);
    followActive = (viewedRound === appState.currentRound);
    updateUI();
  });

  // Navegação: Próxima Rodada
  nextRoundButton.addEventListener('click', () => {
    viewedRound = Math.min(appState.numRounds, viewedRound + 1);
    followActive = (viewedRound === appState.currentRound);
    updateUI();
  });

  // Fecha o modal de QR Code no "X"
  closeQrModalX.addEventListener('click', closeQrModal);
  // Fecha o modal de QR Code no botão "Fechar"
  closeQrModalButton.addEventListener('click', closeQrModal);

  // Atalho para fechar o modal de QR Code com a tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
      closeQrModal();
    }
  });

  // Inicialização
  if (sessionId) {
    connectToSession(sessionId);
  } else {
    eventTitle.textContent = "Aguardando Código";
    idEntrySection.classList.remove('hidden');
  }

  initGrid();
  startAnimation();
});