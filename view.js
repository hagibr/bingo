document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let sessionId = params.get('id');

  const idEntrySection = document.getElementById('id-entry-section');
  const bingoContent = document.getElementById('bingo-content');
  const manualIdInput = document.getElementById('manual-id-input');
  const joinSessionButton = document.getElementById('join-session-button');
  const eventTitle = document.getElementById('event-title');

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
    { name: "Diagonal", sequences: [[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]] },
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
    document.getElementById('prize-label').textContent = currentRoundData.prize;

    // Números sorteados
    const list = document.getElementById('drawn-numbers-list');
    list.innerHTML = '';
    let nums = [...currentRoundData.drawnNumbers];
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
      const pIdx = rd.patternIndex || 0;

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

  // Lógica de Entrada Manual
  joinSessionButton.addEventListener('click', () => {
    const id = manualIdInput.value.trim();
    if (id.length === 6) {
      connectToSession(id);
    } else {
      alert("Por favor, digite um código válido de 6 caracteres.");
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