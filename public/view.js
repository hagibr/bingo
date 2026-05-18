// Inicializa a visualização do espectador assim que o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let eventId = params.get('id');

  // Se o ID foi passado via URL, salvamos no storage para persistência 
  // e limpamos a barra de endereços imediatamente.
  if (eventId) {
    sessionStorage.setItem('activeBingoId', eventId);
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // Tenta recuperar do storage caso o usuário dê refresh na página
    eventId = sessionStorage.getItem('activeBingoId');
  }

  const idEntrySection = document.getElementById('id-entry-section');
  const bingoContent = document.getElementById('bingo-content');
  const manualIdInput = document.getElementById('manual-id-input');
  const joinSessionButton = document.getElementById('join-session-button');
  const eventTitle = document.getElementById('event-title');
  const leaveEventButton = document.getElementById('leave-event-button');
  const showQrButton = document.getElementById('show-qr-button');
  const qrModal = document.getElementById('qr-modal');
  const qrcodeLarge = document.getElementById('qrcode-large');
  const closeQrModalX = document.getElementById('close-qr-modal-x');
  const closeQrModalButton = document.getElementById('close-qr-modal-button');
  const copyQrLinkButton = document.getElementById('copy-qr-link-button');
  const qrLinkDisplay = document.getElementById('qr-link-display');
  const patternNameDisplay = document.getElementById('pattern-name-display');
  const roundCompletedStatus = document.getElementById('round-completed-status');
  const prevRoundButton = document.getElementById('prev-round');
  const nextRoundButton = document.getElementById('next-round');
  const prevSessionButton = document.getElementById('prev-session');
  const nextSessionButton = document.getElementById('next-session');
  const viewedSessionNameDisplay = document.getElementById('viewed-session-name');
  const viewingActiveBadge = document.getElementById('viewing-active-badge');
  const toggleSortButton = document.getElementById('toggle-sort-button');
  const autoFollowCheckbox = document.getElementById('auto-follow-checkbox');
  const autoFollowContainer = document.getElementById('auto-follow-container');
  const toastContainer = document.getElementById('toast-container');

  let lastToast = null;
  let lastToastTimeout = null;

  // --- Lógica de Zoom das Bolas ---
  const ballScales = [1, 1.25, 1.5, 1.75, 2];
  let ballZoomIndex = 0;
  const drawnNumbersListContainer = document.getElementById('drawn-numbers-list');

  /**
   * Cicla o tamanho das bolas na tela do espectador.
   */
  const cycleBallZoom = () => {
    ballZoomIndex = (ballZoomIndex + 1) % ballScales.length;
    const scale = ballScales[ballZoomIndex];
    drawnNumbersListContainer.style.setProperty('--ball-zoom', scale);
    drawnNumbersListContainer.style.setProperty('--ball-gap', (10 * scale) + 'px');
    drawnNumbersListContainer.style.setProperty('--ball-padding', (15 * scale) + 'px');
  };

  /**
   * Exibe uma caixa de diálogo personalizada (Substitui alert, confirm e prompt).
   */
  const showDialog = ({ title = "Aviso", message = "", type = "alert", defaultValue = "" }) => {
    return new Promise((resolve) => {
      const modal = document.getElementById('custom-dialog-modal');
      const titleEl = document.getElementById('dialog-title');
      const messageEl = document.getElementById('dialog-message');
      const inputContainer = document.getElementById('dialog-input-container');
      const inputEl = document.getElementById('dialog-input');
      const cancelBtn = document.getElementById('dialog-cancel-btn');
      const confirmBtn = document.getElementById('dialog-confirm-btn');

      // Permitindo somente letras maiúsculas e números
      inputEl.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      });
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      inputEl.value = defaultValue;

      inputContainer.classList.toggle('hidden', type !== 'prompt');
      cancelBtn.classList.toggle('hidden', type === 'alert');
      confirmBtn.textContent = (type === 'alert') ? 'OK' : 'Confirmar';

      modal.classList.remove('hidden');

      const cleanup = (value) => {
        modal.classList.add('hidden');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        resolve(value);
      };

      confirmBtn.onclick = () => cleanup(type === 'prompt' ? inputEl.value : true);
      cancelBtn.onclick = () => cleanup(type === 'prompt' ? null : false);

      if (type === 'prompt') {
        setTimeout(() => inputEl.focus(), 100);
        inputEl.onkeypress = (e) => { if (e.key === 'Enter') confirmBtn.click(); };
      }
    });
  };

  /**
   * Exibe uma notificação tipo toast na tela.
   * @param {string} message - Mensagem a ser exibida.
   */
  const showToast = (message) => {
    if (!toastContainer) return;

    // Se a mensagem for igual à última, pisca o toast atual e reseta o tempo
    if (lastToast && lastToast.querySelector('span').textContent === message) {
      clearTimeout(lastToastTimeout);

      // Reinicia a animação de entrada para dar o efeito de "piscar"
      lastToast.style.animation = 'none';
      void lastToast.offsetWidth; // Trigger reflow para o navegador notar a mudança
      lastToast.style.animation = 'toastFadeIn 0.3s ease';

      const t = lastToast;
      lastToastTimeout = setTimeout(() => {
        if (t.parentNode) {
          t.style.animation = 'toastFadeOut 0.2s forwards';
          setTimeout(() => { if (t.parentNode) t.remove(); }, 200);
        }
        if (lastToast === t) lastToast = null;
      }, 2500);
      return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span><span style="margin-left:10px; opacity:0.6;">&times;</span>`;

    const removeToast = () => {
      if (toast.parentNode) {
        toast.style.animation = 'toastFadeOut 0.2s forwards';
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
          if (lastToast === toast) lastToast = null;
        }, 200);
      }
    };

    toast.onclick = removeToast;
    toastContainer.appendChild(toast);
    lastToast = toast;
    lastToastTimeout = setTimeout(removeToast, 2500);
  };

  if (typeof firebaseConfig === 'undefined') {
    eventTitle.textContent = "Erro: Configuração ausente";
    return;
  }

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();
  let rootRef = null;
  let activeSessionRef = null;
  let activeRoundRef = null;
  let activeNumbersRef = null;

  let fullData = null; // Dados brutos do Firebase (sessionsData)
  let localLastModified = 0; // Controle local da última atualização
  let appState = null;
  let viewedSessionIndex = null; // Índice da sessão sendo visualizada
  let viewedRound = null; // Rodada que o usuário está olhando no momento
  let followActive = true; // Se o usuário está seguindo a rodada ativa do organizador
  let localIsSortedAscending = false; // Controle local de ordenação
  let disconnectTimer = null; // Timer para desconexão programada
  let isOffline = false; // Rastreia o estado da conexão

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
    if (!appState || !fullData) return;

    // Sincroniza o estado de acompanhamento com o checkbox
    if (autoFollowCheckbox) autoFollowCheckbox.checked = followActive;

    // Se estiver em modo automático, força a visualização do que está ativo no servidor
    if (followActive) {
      viewedSessionIndex = fullData.activeSessionIndex;
      appState = fullData.sessions[viewedSessionIndex];
      viewedRound = appState.currentRound;
      localIsSortedAscending = appState.isSortedAscending;
    }

    // Atualiza o nome da sessão visualizada
    if (viewedSessionNameDisplay && appState) viewedSessionNameDisplay.textContent = appState.sessionName;

    document.getElementById('event-title').textContent = fullData.eventName || appState.eventName;
    document.title = "Bingo: " + (fullData.eventName || appState.eventName);
    document.getElementById('event-icon').src = fullData.eventIcon || "default-icon.png";

    const roundToDisplay = viewedRound || appState.currentRound;
    document.getElementById('current-round-label').textContent = "Rodada " + roundToDisplay;

    // O selo "ATUAL" deve aparecer apenas se for a SESSÃO ativa E a RODADA ativa do organizador
    const isAtLiveState = (viewedSessionIndex === fullData.activeSessionIndex && roundToDisplay === appState.currentRound);
    if (viewingActiveBadge) viewingActiveBadge.classList.toggle('hidden', !isAtLiveState);

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
    const rawNumbers = currentRoundData.drawnNumbers || [];
    const lastDrawn = rawNumbers.length > 0 ? rawNumbers[rawNumbers.length - 1] : null;

    document.getElementById('numbers-count').textContent = `(${nums.length})`;

    // Usa o estado local de ordenação em vez do appState vindo do Firebase
    if (localIsSortedAscending) nums.sort((a, b) => a - b);
    else nums.reverse();

    if (toggleSortButton) {
      toggleSortButton.textContent = localIsSortedAscending ? "Ordem: Crescente" : "Ordem: Sorteio";
    }

    nums.forEach(num => {
      const item = document.createElement('div');
      item.classList.add('drawn-number-item');
      item.textContent = num.toString().padStart(2, '0');
      if (num === lastDrawn) item.classList.add('last-drawn');
      list.appendChild(item);
    });

    // Atualiza visibilidade e estado dos botões de navegação
    const isLocked = followActive;

    prevRoundButton.classList.toggle('hidden', isLocked);
    nextRoundButton.classList.toggle('hidden', isLocked);
    prevRoundButton.disabled = roundToDisplay <= 1;
    nextRoundButton.disabled = roundToDisplay >= (appState.numRounds || 1);

    // Atualiza estado dos botões de navegação de sessões
    const sessionsCount = fullData.sessions ? fullData.sessions.length : 0;
    prevSessionButton.classList.toggle('hidden', isLocked);
    nextSessionButton.classList.toggle('hidden', isLocked);
    prevSessionButton.disabled = viewedSessionIndex <= 0;
    nextSessionButton.disabled = viewedSessionIndex >= sessionsCount - 1;

    if (toggleSortButton) toggleSortButton.classList.toggle('hidden', isLocked);
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

    // Limpa ouvintes anteriores para evitar vazamento de memória e tráfego duplicado
    if (rootRef) rootRef.off();
    if (activeSessionRef) activeSessionRef.off();
    if (activeRoundRef) activeRoundRef.off();

    rootRef = db.ref('evt/' + id);

    // 1. Carregamento inicial completo (Uma única vez)
    // Permite que o usuário tenha todos os dados de sessões e rodadas passadas.
    rootRef.once('value').then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Mapeia do formato reduzido do Firebase para o formato descritivo interno
        fullData = {
          eventName: data.name,
          eventIcon: data.icon,
          activeSessionIndex: data.sIdx || 0,
          lastModified: data.last || 0,
          sessions: (data.ss || []).map(s => ({
            sessionName: s.snm,
            maxNumber: s.max,
            numRounds: s.nrd,
            currentRound: s.crnd,
            drawMode: s.mode,
            isSortedAscending: s.asc,
            rounds: Object.keys(s.rds || {}).reduce((acc, rId) => {
              const r = s.rds[rId];
              acc[rId] = { prize: r.prz, pattern: r.ptrn, patternIndex: r.pidx, isCompleted: r.done, drawnNumbers: [] };
              return acc;
            }, {})
          }))
        };

        localLastModified = fullData.lastModified;

        // Inicializa o estado de visualização
        if (followActive || viewedSessionIndex === null) {
          viewedSessionIndex = fullData.activeSessionIndex;
          viewedRound = fullData.sessions[viewedSessionIndex].currentRound;
        }
        appState = fullData.sessions[viewedSessionIndex];

        // Carrega os números sorteados da rodada ativa *antes* de ativar a UI e os listeners
        const initialSessIndex = viewedSessionIndex;
        const initialRoundNum = viewedRound;
        const numsRef = db.ref(`nums/${id}/${initialSessIndex}/${initialRoundNum}`);
        numsRef.once('value').then(numsSnap => {
          if (fullData.sessions[initialSessIndex]?.rounds?.[initialRoundNum]) {
            fullData.sessions[initialSessIndex].rounds[initialRoundNum].drawnNumbers = numsSnap.val()?.dns || [];
          }

          // Ativa interface
          idEntrySection.classList.add('hidden');
          bingoContent.classList.remove('hidden');
          if (autoFollowContainer) autoFollowContainer.classList.remove('hidden');
          if (showQrButton) showQrButton.classList.remove('hidden');
          if (leaveEventButton) leaveEventButton.classList.remove('hidden');

          // 2. Inicia ouvintes granulares para tráfego reduzido em tempo real
          setupGranularListeners(id);
          updateUI(); // Agora updateUI terá os números sorteados iniciais
        }).catch(error => {
          console.error("Erro ao carregar números iniciais:", error);
          handleSessionError();
        });
      } else {
        handleSessionError();
      }
    }).catch(() => handleSessionError());
  };

  const handleSessionError = () => {
    eventTitle.textContent = "Sessão não encontrada";
    idEntrySection.classList.remove('hidden');
    bingoContent.classList.add('hidden');
    if (autoFollowContainer) autoFollowContainer.classList.add('hidden');
    if (showQrButton) showQrButton.classList.add('hidden');
    if (leaveEventButton) leaveEventButton.classList.add('hidden');
  };

  /**
   * Configura ouvintes para apenas campos específicos que mudam durante o sorteio (Economia de Dados).
   */
  const setupGranularListeners = (id) => {
    // Monitora o timestamp global de modificação
    rootRef.child('last').on('value', snap => {
      localLastModified = snap.val() || 0;
    });

    // Escuta mudanças nos metadados globais (raras)
    rootRef.child('sIdx').on('value', snap => {
      if (!fullData) return;
      fullData.activeSessionIndex = snap.val();
      syncLiveSessionListeners(id);
      updateUI();
    });

    rootRef.child('name').on('value', snap => {
      if (fullData) { fullData.eventName = snap.val(); updateUI(); }
    });

    rootRef.child('icon').on('value', snap => {
      if (fullData) { fullData.eventIcon = snap.val(); updateUI(); }
    });

    syncLiveSessionListeners(id);
  };

  const syncLiveSessionListeners = (id) => {
    const activeIndex = fullData.activeSessionIndex;
    if (activeIndex === undefined || !fullData.sessions[activeIndex]) return;

    // Escuta qual a rodada atual da sessão ativa
    if (activeSessionRef) activeSessionRef.off();
    activeSessionRef = db.ref(`evt/${id}/ss/${activeIndex}/crnd`);
    activeSessionRef.on('value', snap => {
      const currentRound = snap.val();
      fullData.sessions[activeIndex].currentRound = currentRound;
      syncLiveRoundDataListener(id, activeIndex, currentRound);
      updateUI();
    });
  };

  const syncLiveRoundDataListener = (id, sessName, roundNum) => {
    // Escuta apenas os dados da rodada que está sendo sorteada
    if (activeRoundRef) activeRoundRef.off();
    activeRoundRef = db.ref(`evt/${id}/ss/${sessName}/rds/${roundNum}`);
    activeRoundRef.on('value', snap => {
      const r = snap.val();
      if (fullData && fullData.sessions[sessName]) {
        if (!fullData.sessions[sessName].rounds) fullData.sessions[sessName].rounds = {};

        const round = fullData.sessions[sessName].rounds[roundNum];
        const existingNumbers = round?.drawnNumbers || [];

        // Mapeia do Firebase para o local
        fullData.sessions[sessName].rounds[roundNum] = {
          prize: r.prz,
          pattern: r.ptrn,
          patternIndex: r.pidx,
          isCompleted: r.done,
          drawnNumbers: existingNumbers
        };
        updateUI();
      }
    });

    // NOVO: Escuta especificamente os números sorteados em /numbers
    if (activeNumbersRef) activeNumbersRef.off();
    activeNumbersRef = db.ref(`nums/${id}/${sessName}/${roundNum}`);
    activeNumbersRef.on('value', snap => {
      const data = snap.val();
      if (fullData && fullData.sessions[sessName]?.rounds?.[roundNum]) {
        const round = fullData.sessions[sessName].rounds[roundNum];
        const newDrawn = data?.dns || [];
        const oldLen = round.drawnNumbers ? round.drawnNumbers.length : 0;

        // Exibe toast se a quantidade de números mudou e o usuário não está visualizando esta rodada/sessão
        const isCurrentlyViewed = (viewedSessionIndex === sessName && viewedRound === roundNum);
        if (newDrawn.length !== oldLen && !isCurrentlyViewed) {
          // Pega os 3 últimos números sorteados e formata com zeros à esquerda
          const nums = newDrawn.slice(-3).reverse().map(n => n.toString().padStart(2, '0'));
          const display = nums.length > 0
            ? `<strong>${nums[0]}</strong>${nums.length > 1 ? ', ' + nums.slice(1).join(', ') : ''}`
            : 'Sorteio limpo';
          showToast(`Rodada ${roundNum}: ${display}`);
        }

        round.drawnNumbers = newDrawn;
        updateUI();
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
    if (id.length >= 1 && id.length <= 16) {
      eventId = id;
      sessionStorage.setItem('activeBingoId', id); // Salva para manter no refresh
      connectToSession(id);
    } else {
      showDialog({ title: "Erro", message: "Digite um código de até 16 caracteres." });
    }
  });

  // Converte automaticamente para maiúsculas e remove caracteres que não sejam A-Z ou 0-9
  manualIdInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  // Permite entrar na sessão ao pressionar a tecla Enter no campo de input
  manualIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      joinSessionButton.click();
    }
  });

  // Botão para sair do evento atual e retornar à tela de entrada
  leaveEventButton.addEventListener('click', async () => {
    const ok = await showDialog({
      title: "Sair do Bingo",
      message: "Deseja realmente sair desta sessão de bingo?",
      type: "confirm"
    });
    if (ok) {
      sessionStorage.removeItem('activeBingoId');
      eventId = null;
      manualIdInput.value = '';

      // Remove todos os listeners do Firebase para economizar tráfego
      if (rootRef) rootRef.off();
      if (activeSessionRef) activeSessionRef.off();
      if (activeRoundRef) activeRoundRef.off();

      fullData = null;
      appState = null;

      handleSessionError(); // Esconde o conteúdo e mostra a entrada manual
      eventTitle.textContent = "Aguardando Código";
      document.title = "Visualização - Bingo";
    }
  });

  // Gera o QR Code de compartilhamento para outros espectadores
  showQrButton.addEventListener('click', () => {
    if (!eventId) {
      showDialog({ title: "Aviso", message: "Entre em uma sessão primeiro para compartilhar." });
      return;
    }
    // Constrói a URL de compartilhamento garantindo que o ID esteja nela
    // Usamos href.split para evitar erros com window.location.origin sendo 'null' em arquivos locais
    const url = new URL(window.location.href.split('?')[0].split('#')[0]);
    url.searchParams.set('id', eventId);

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
    qrLinkDisplay.textContent = url.toString();
    qrLinkDisplay.href = url.toString();
  });

  // Alterna o modo de acompanhamento automático
  autoFollowCheckbox.addEventListener('change', (e) => {
    followActive = e.target.checked;
    updateUI();
  });

  // Navegação de Sessões
  const navigateSession = (direction) => {
    const currentIndex = viewedSessionIndex;
    const nextIndex = currentIndex + direction;

    if (fullData.sessions && nextIndex >= 0 && nextIndex < fullData.sessions.length) {
      viewedSessionIndex = nextIndex;
      appState = fullData.sessions[viewedSessionIndex];
      // Ao mudar de sessão, foca na primeira rodada dela ou na atual se for a ativa
      viewedRound = (viewedSessionIndex === fullData.activeSessionIndex) ? appState.currentRound : 1;
      followActive = false; // Navegação manual desativa o acompanhamento automático
      animationPhase = true;
      updateUI();
    }
  };

  prevSessionButton.addEventListener('click', () => navigateSession(-1));
  nextSessionButton.addEventListener('click', () => navigateSession(1));

  // Navegação: Rodada Anterior
  prevRoundButton.addEventListener('click', () => {
    viewedRound = Math.max(1, viewedRound - 1);
    followActive = false; // Navegação manual desativa o acompanhamento automático
    animationPhase = true; // Reseta a fase da animação para garantir visibilidade na troca
    updateUI();
  });

  // Navegação: Próxima Rodada
  nextRoundButton.addEventListener('click', () => {
    viewedRound = Math.min(appState.numRounds, viewedRound + 1);
    followActive = false; // Navegação manual desativa o acompanhamento automático
    animationPhase = true; // Reseta a fase da animação para garantir visibilidade na troca
    updateUI();
  });

  // Alterna entre ordem de sorteio e ordem crescente localmente na visualização
  toggleSortButton.addEventListener('click', () => {
    localIsSortedAscending = !localIsSortedAscending;
    updateUI();
  });

  // Clique em qualquer bola para aumentar o tamanho
  drawnNumbersListContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('drawn-number-item')) {
      cycleBallZoom();
    }
  });

  // Fecha o modal de QR Code no "X"
  closeQrModalX.addEventListener('click', closeQrModal);
  // Fecha o modal de QR Code no botão "Fechar"
  closeQrModalButton.addEventListener('click', closeQrModal);

  // Copia a URL de visualização de dentro do modal de QR Code
  if (copyQrLinkButton) {
    copyQrLinkButton.addEventListener('click', () => {
      const url = qrLinkDisplay.textContent;
      copyQrLinkButton.disabled = true; // Bloqueia o botão
      navigator.clipboard.writeText(url)
        .then(() => showToast("Link copiado com sucesso!"))
        .catch(() => showToast("Erro ao copiar link."))
        .finally(() => setTimeout(() => { copyQrLinkButton.disabled = false; }, 1000)); // Reabilita após 1 segundo
    });
  }

  // Atalho para fechar o modal de QR Code com a tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const customDialog = document.getElementById('custom-dialog-modal');
      if (customDialog && !customDialog.classList.contains('hidden')) {
        const cancelBtn = document.getElementById('dialog-cancel-btn');
        const confirmBtn = document.getElementById('dialog-confirm-btn');
        if (cancelBtn && !cancelBtn.classList.contains('hidden')) cancelBtn.click();
        else if (confirmBtn) confirmBtn.click();
        return;
      }
    }
    if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
      closeQrModal();
    }
  });

  // Inicialização
  if (eventId) {
    connectToSession(eventId);
  } else {
    eventTitle.textContent = "Aguardando Código";
    idEntrySection.classList.remove('hidden');
  }

  // Redução de conexão quando não está aberto
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Programa a desconexão para daqui a 1 minuto (60000ms)
      disconnectTimer = setTimeout(() => {
        db.goOffline();
        isOffline = true;
        console.log("Desconectado do Firebase por inatividade.");
      }, 60000);
    } else {
      // Se o usuário voltou antes de 1 minuto, cancela a desconexão programada
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }

      // Só reconecta se realmente tiver chegado a desconectar
      if (isOffline) {
        db.goOnline();
        isOffline = false;
        // O Firebase RTDB recupera os listeners (.on) automaticamente ao voltar a ficar online.
      }
    }
  });

  initGrid();
  startAnimation();
});
