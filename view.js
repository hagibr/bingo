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
  const patternNameDisplay = document.getElementById('pattern-name-display');

  if (typeof firebaseConfig === 'undefined') {
    eventTitle.textContent = "Erro: Configuração ausente";
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  let currentRef = null;

  let appState = null;
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

  const updateUI = () => {
    if (!appState) return;

    document.getElementById('event-title').textContent = appState.eventName;
    document.title = "Bingo: " + appState.eventName;
    document.getElementById('event-icon').src = appState.eventIcon;
    document.getElementById('current-round-label').textContent = "Rodada " + appState.currentRound;

    const currentRoundData = appState.rounds[appState.currentRound];
    if (!currentRoundData) return;

    document.getElementById('prize-label').textContent = currentRoundData.prize || `Prêmio da Rodada ${appState.currentRound}`;

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
  };

  const initGrid = () => {
    const grid = document.getElementById('pattern-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.classList.add('pattern-cell');
      grid.appendChild(cell);
    }
  };

  const updateGridUI = (indices) => {
    const cells = document.querySelectorAll('.pattern-cell');
    cells.forEach((cell, i) => {
      cell.classList.toggle('active', indices.includes(i));
    });
  };

  const startAnimation = () => {
    setInterval(() => {
      if (!appState) return;
      const rd = appState.rounds[appState.currentRound];
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

  const connectToSession = (id) => {
    if (!id) return;

    // Remove listener anterior se existir
    if (currentRef) currentRef.off();

    currentRef = db.ref('sessions/' + id);
    currentRef.on('value', (snapshot) => {
      const data = snapshot.val();
      // Agora esperamos sessionsData, então buscamos a sessão ativa dentro dela
      if (data && data.sessions && data.activeSessionName) {
        appState = data.sessions[data.activeSessionName];
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

  const closeQrModal = () => {
    qrModal.classList.add('hidden');
  };

  // Lógica de Entrada Manual
  joinSessionButton.addEventListener('click', () => {
    const id = manualIdInput.value.trim().toUpperCase();
    if (id.length === 6) {
      sessionId = id;
      connectToSession(id);
    } else {
      alert("Por favor, digite um código válido de 6 caracteres.");
    }
  });

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
  });

  closeQrModalX.addEventListener('click', closeQrModal);
  closeQrModalButton.addEventListener('click', closeQrModal);

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