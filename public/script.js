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
  const mainSessionSelector = document.getElementById('main-session-selector');
  const configSessionSelector = document.getElementById('config-session-selector');
  const moveSessionUpButton = document.getElementById('move-session-up-button');
  const moveSessionDownButton = document.getElementById('move-session-down-button');
  const renameSessionButton = document.getElementById('rename-session-button');
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
  const copyQrLinkButton = document.getElementById('copy-qr-link-button');

  // Elementos do Gerenciador de Eventos
  const eventsMgrButton = document.getElementById('events-mgr-button');
  const eventsMgrModal = document.getElementById('events-mgr-modal');
  const closeEventsMgrX = document.getElementById('close-events-mgr-x');
  const closeEventsMgrButton = document.getElementById('close-events-mgr-button');
  const mgrNewEventButton = document.getElementById('mgr-new-event-button');
  const sessionsListContainer = document.getElementById('events-list-container');

  // Elementos de Autenticação
  const adminHeader = document.getElementById('admin-header');
  const adminMain = document.getElementById('admin-main');
  const googleLoginButton = document.getElementById('google-login-button');
  const logoutButton = document.getElementById('logout-button');

  const userProfileArea = document.getElementById('user-profile-area');
  const userPhoto = document.getElementById('user-photo');
  const userDropdownMenu = document.getElementById('user-dropdown-menu');
  const userNameDisplay = document.getElementById('user-name-display');

  const qrLinkDisplay = document.getElementById('qr-link-display');

  // Elementos do novo Modal de ID e Toasts
  const idOptionsModal = document.getElementById('id-options-modal');
  const idOptionsMessage = document.getElementById('id-options-message');
  const idOptReplace = document.getElementById('id-opt-replace');
  const idOptCopy = document.getElementById('id-opt-copy');
  const idOptCancel = document.getElementById('id-opt-cancel');
  const toastContainer = document.getElementById('toast-container');

  let activeRemoteRef = null;

  /**
   * Exibe uma notificação tipo toast na tela.
   * @param {string} message - Mensagem a ser exibida.
   */
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span><span style="margin-left:10px; opacity:0.6;">&times;</span>`;

    const removeToast = () => {
      if (toast.parentNode) {
        toast.style.animation = 'toastFadeOut 0.2s forwards';
        setTimeout(() => toast.remove(), 200);
      }
    };

    toast.onclick = removeToast;
    toastContainer.appendChild(toast);
    setTimeout(removeToast, 3000);
  };

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
  const configEventTitle = document.getElementById('config-event-name');
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
    const user = firebase.auth().currentUser;
    if (!navigator.onLine || !user || typeof firebase === 'undefined' || firebase.apps.length === 0) return false;
    const snapshot = await firebase.database().ref('evt/' + id).once('value');
    return snapshot.exists();
  };

  /**
   * Realiza a sincronização direta do objeto eventData com o Firebase Realtime Database.
   * Esta função ignora as verificações de debounce e modais abertos, sendo usada para
   * operações críticas que exigem sincronização imediata.
   * @param {object} dataToSync - O objeto eventData completo a ser sincronizado.
   * @param {string|boolean} syncLevel - Nível de sincronização: 'full', 'session', ou 'numbers' (padrão).
   */
  const _performFirebaseSync = (dataToSync, syncLevel = 'numbers') => {
    const user = firebase.auth().currentUser;
    if (!user || !navigator.onLine || !dataToSync?.eventid) return; // Só sincroniza se estiver logado, online e com ID

    // Bloqueio de segurança local: não tenta gravar se o proprietário do dado for outro usuário
    if (dataToSync.ownerUid && dataToSync.ownerUid !== user.uid) {
      console.warn("Sincronização abortada: O usuário atual não é o proprietário deste evento.");
      return;
    }

    // Se a sessão não tem dono, o usuário logado assume a propriedade
    if (!dataToSync.ownerUid) {
      dataToSync.ownerUid = user.uid;
    }

    const eventId = dataToSync.eventid;
    const updates = {};
    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const isFull = (syncLevel === 'full' || syncLevel === true);
    const isSession = (syncLevel === 'session');

    // CRÍTICO: Sempre atualizamos o timestamp na raiz do evento 'evt/ID'.
    // Isso garante que o listener em outras máquinas seja disparado mesmo quando
    // apenas os números (que ficam em outro nó 'nums/ID') forem alterados.
    updates[`evt/${eventId}/last`] = timestamp;

    if (isFull) {
      // Sincronização estrutural: Metadados da Raiz + Todas as Sessões
      updates[`evt/${eventId}/name`] = dataToSync.eventName || "Novo Evento de Bingo";
      updates[`evt/${eventId}/icon`] = dataToSync.eventIcon || "default-icon.png";
      updates[`evt/${eventId}/sIdx`] = dataToSync.activeSessionIndex;
      updates[`evt/${eventId}/ouid`] = dataToSync.ownerUid || user.uid;

      const sessionsClone = JSON.parse(JSON.stringify(dataToSync.sessions));
      const ssToUpload = sessionsClone.map((s, sIdx) => {
        if (!s) return null;
        const ssUpdate = {
          snm: s.sessionName,
          max: s.maxNumber,
          nrd: s.numRounds,
          crnd: s.currentRound,
          mode: s.drawMode,
          asc: !!s.isSortedAscending,
          last: timestamp,
          rds: {}
        };

        Object.keys(s.rounds).forEach(rId => {
          if (s.rounds[rId]) {
            updates[`nums/${eventId}/${sIdx}/${rId}`] = {
              dns: s.rounds[rId].drawnNumbers || []
            };
            ssUpdate.rds[rId] = {
              prz: s.rounds[rId].prize || "",
              ptrn: s.rounds[rId].pattern || [],
              pidx: s.rounds[rId].patternIndex || 0,
              done: !!s.rounds[rId].isCompleted
            };
          }
        });
        return ssUpdate;
      });
      updates[`evt/${eventId}/ss`] = ssToUpload;
    } else if (dataToSync.activeSessionIndex !== null && dataToSync.sessions[dataToSync.activeSessionIndex]) {
      const idx = dataToSync.activeSessionIndex;
      const session = dataToSync.sessions[idx];
      const rIdx = session.currentRound;

      // 1. Sincroniza APENAS os números da rodada ativa no nó /numbers (Nível 'numbers' ou 'session')
      if (session.rounds && session.rounds[rIdx]) {
        updates[`nums/${eventId}/${idx}/${rIdx}`] = {
          dns: session.rounds[rIdx].drawnNumbers || []
        };
      }

      // 2. Se for nível 'session', sincroniza metadados voláteis (Round, Prize, Pattern, etc.)
      if (isSession) {
        updates[`evt/${eventId}/ss/${idx}/crnd`] = session.currentRound;
        updates[`evt/${eventId}/ss/${idx}/asc`] = !!session.isSortedAscending;

        if (session.rounds[rIdx]) {
          const r = session.rounds[rIdx];
          updates[`evt/${eventId}/ss/${idx}/rds/${rIdx}/prz`] = r.prize || "";
          updates[`evt/${eventId}/ss/${idx}/rds/${rIdx}/ptrn`] = r.pattern || [];
          updates[`evt/${eventId}/ss/${idx}/rds/${rIdx}/pidx`] = r.patternIndex || 0;
          updates[`evt/${eventId}/ss/${idx}/rds/${rIdx}/done`] = !!r.isCompleted;
        }
      }
    }

    firebase.database().ref().update(updates)
      .catch(err => {
        console.error("Erro ao sincronizar Firebase:", err.code, err.message);
        if (err.code === 'PERMISSION_DENIED') {
          showToast("Erro: Você não tem permissão para este código.");
        }
      });
  };

  /**
   * Configura ouvintes em tempo real para sincronizar mudanças feitas em outros dispositivos
   * logados na mesma conta de organizador.
   */
  const setupRemoteSyncListener = (id) => {
    if (!id || !navigator.onLine) return;
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (activeRemoteRef) activeRemoteRef.off();
    activeRemoteRef = firebase.database().ref('evt/' + id);

    activeRemoteRef.on('value', async (snapshot) => {
      const remoteData = snapshot.val();
      // Só processa se os dados existirem e forem mais recentes que os locais
      if (!remoteData || (remoteData.last && remoteData.last <= eventData.lastModified)) return;

      // Verifica se somos o proprietário antes de aplicar a mudança
      if (remoteData.ouid !== user.uid) return;

      const numsSnap = await firebase.database().ref('nums/' + id).once('value');
      const remoteNums = numsSnap.val();

      // Mapeamento inverso: do formato Firebase para o formato interno eventData
      eventData.eventName = remoteData.name || eventData.eventName;
      eventData.eventIcon = remoteData.icon || eventData.eventIcon;
      eventData.activeSessionIndex = (remoteData.sIdx !== undefined) ? remoteData.sIdx : eventData.activeSessionIndex;
      eventData.lastModified = remoteData.last;
      eventData.ownerUid = remoteData.ouid;

      if (Array.isArray(remoteData.ss)) {
        eventData.sessions = remoteData.ss.map((s, sIdx) => ({
          sessionName: s.snm,
          maxNumber: s.max,
          numRounds: s.nrd,
          currentRound: s.crnd,
          drawMode: s.mode,
          isSortedAscending: s.asc,
          rounds: Object.keys(s.rds || {}).reduce((acc, rId) => {
            const r = s.rds[rId];
            acc[rId] = { prize: r.prz, pattern: r.ptrn, patternIndex: r.pidx, isCompleted: r.done, drawnNumbers: remoteNums?.[sIdx]?.[rId]?.dns || [] };
            return acc;
          }, {})
        }));
      }
      if (eventData.activeSessionIndex !== null && eventData.sessions[eventData.activeSessionIndex]) {
        appState = eventData.sessions[eventData.activeSessionIndex];
      }
      updateUI(false, 'none'); // Atualiza a tela sem reenviar para o servidor
      showToast("Sincronizado com a nuvem.");
    });
  };

  /**
   * Busca todos os eventos pertencentes ao usuário no Firebase e atualiza o registro local.
   * Isso garante que eventos removidos localmente, mas que ainda existem na nuvem, reapareçam após o login.
   * @param {string} uid - UID do usuário logado.
   */
  const syncRegistryWithFirebase = async (uid) => {
    if (!navigator.onLine || !uid) return;

    try {
      const snapshot = await firebase.database().ref('evt').orderByChild('ouid').equalTo(uid).once('value');
      const data = snapshot.val();

      if (data) {
        const registry = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
        Object.entries(data).forEach(([id, event]) => {
          registry[id] = {
            name: event.name || "Evento sem nome",
            sessions: (event.ss || []).map(s => s.snm || "Sessão")
          };
        });
        localStorage.setItem('bingoUserEvents', JSON.stringify(registry));
        renderEventsList(); // Sempre re-renderiza a lista interna se houver dados novos
      }
    } catch (error) {
      console.error("Erro ao sincronizar lista de eventos:", error);
    }
  };

  /**
   * Gerencia a alteração do ID da sessão com lógica de substituir ou copiar.
   * @param {string} newId - O novo código desejado.
   * @param {string} oldId - O código atual.
   * @param {boolean} forceRename - Se verdadeiro, ignora o modal de opções e força a criação de um novo ID (usado para resolução de conflito).
   */
  const processIdChange = async (newId, oldId, forceRename = false) => {
    if (!newId || newId === oldId) return;
    const user = firebase.auth().currentUser;

    let choice;
    if (forceRename) {
      // Em caso de conflito de posse detectado no login ou ao carregar, tratamos como uma renomeação local forçada (cópia)
      choice = '2';
    } else {
      // Mostra o modal customizado (sempre, mesmo offline)
      idOptionsMessage.textContent = `O que deseja fazer com o código "${newId}"? (Atual: ${oldId})`;
      idOptionsModal.classList.remove('hidden');

      choice = await new Promise((resolve) => {
        const handleChoice = (val) => {
          idOptReplace.onclick = null;
          idOptCopy.onclick = null;
          idOptCancel.onclick = null;
          idOptionsModal.classList.add('hidden');
          resolve(val);
        };
        idOptReplace.onclick = () => handleChoice('1');
        idOptCopy.onclick = () => handleChoice('2');
        idOptCancel.onclick = () => handleChoice('0');
        idOptionsModal.onclick = (e) => { if (e.target === idOptionsModal) handleChoice('0'); };
      });
    }

    if (choice === '1') {
      // SUBSTITUIR
      // Só tenta validar e remover no Firebase se estiver online e logado
      if (user && navigator.onLine) {
        try {
          const snapshot = await firebase.database().ref('evt/' + newId).once('value');
          const existingData = snapshot.val();
          if (existingData && existingData.ouid && existingData.ouid !== user.uid) {
            showToast(`Código "${newId}" já em uso por outro organizador. Não foi possível substituir.`);
            configSessionId.value = oldId;
            return;
          }
          if (oldId) {
            await firebase.database().ref('evt/' + oldId).remove();
            const registry = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
            delete registry[oldId];
            localStorage.setItem('bingoUserEvents', JSON.stringify(registry));
          }
        } catch (error) {
          console.error("Erro ao processar substituição no Firebase:", error);
          showToast("Erro na nuvem. ID alterado apenas localmente.");
        }
      }
      eventData.eventid = newId;
      if (user && navigator.onLine) _performFirebaseSync(eventData, 'full');
      updateUI(false);
      setupRemoteSyncListener(newId);
      const status = (user && navigator.onLine) ? ' (Sincronizado)' : ' (Local)';
      showToast(`Código alterado para: ${newId}${status}`);
    } else if (choice === '2') {
      // COPIAR
      if (user && navigator.onLine) {
        try {
          const snapshot = await firebase.database().ref('evt/' + newId).once('value');
          const existingData = snapshot.val();
          if (existingData && existingData.ouid && existingData.ouid !== user.uid) {
            showToast(`Código "${newId}" já em uso. Não foi possível criar cópia.`);
            configSessionId.value = oldId;
            return;
          }
        } catch (error) {
          console.error("Erro ao validar cópia no Firebase:", error);
        }
      }
      eventData.eventid = newId;
      if (user && navigator.onLine) _performFirebaseSync(eventData, 'full');
      updateUI(false);
      setupRemoteSyncListener(newId);
      const status = (user && navigator.onLine) ? ' (Sincronizada)' : ' (Local)';
      showToast(`Cópia criada no código: ${newId}${status}`);
    } else {
      configSessionId.value = oldId;
      showToast("Alteração de código cancelada.");
    }
  };

  // --- Estado da Aplicação ---
  let eventData = {
    eventid: generateRandomId(),
    eventName: "Novo Evento de Bingo",
    eventIcon: "default-icon.png",
    ownerUid: null, // Armazena o UID do criador
    activeSessionIndex: 0,
    sessions: []
  };
  let appState = {};

  /**
   * Cria um objeto de estado inicial para uma nova sessão de bingo (game).
   * @param {string} name - Nome da sessão de bingo.
   */
  const createDefaultSessionState = (name) => {
    const newState = {
      sessionName: name, // Renamed from eventName to sessionName
      maxNumber: 75,
      numRounds: 1,
      currentRound: 1,
      drawMode: "manual",
      rounds: {},
      isSortedAscending: false
    };
    for (let i = 1; i <= newState.numRounds; i++) {
      newState.rounds[i] = { prize: `Prêmio da Rodada ${i}`, drawnNumbers: [], pattern: [], patternIndex: 0, isCompleted: false };
    }
    return newState;
  };

  let syncTimeout = null;
  /**
   * Sincroniza o objeto eventData completo com o Firebase Realtime Database.
   * @param {boolean} immediate - Se verdadeiro, ignora o debounce e executa a sincronização na hora.
   * @param {string|boolean} syncLevel - Nível de sincronização: 'full', 'session', ou 'numbers' (padrão).
   */
  const syncToFirebase = (immediate = false, syncLevel = 'numbers') => {
    const performSyncWithChecks = (level) => {
      // Não sincroniza nada com o Firebase enquanto o menu de configuração estiver aberto.
      // Isso garante que a restauração de dados e edições de ID não causem conflitos.
      const isConfigOpen = configModal && !configModal.classList.contains('hidden');
      const isMgrOpen = eventsMgrModal && !eventsMgrModal.classList.contains('hidden');
      if (isConfigOpen || isMgrOpen || !eventData.sessions.length) return;

      _performFirebaseSync(eventData, level);
    };

    if (syncTimeout) clearTimeout(syncTimeout);

    if (immediate) {
      performSyncWithChecks(syncLevel);
    } else {
      syncTimeout = setTimeout(() => performSyncWithChecks(syncLevel), 1000);
    }
  };

  /**
   * Recupera os dados salvos no localStorage ou realiza a migração de dados de versões antigas.
   * Inicializa a sessão ativa e configura o Firebase.
   */
  const loadState = () => {
    const storedData = localStorage.getItem('bingoEventData');
    if (storedData) {
      eventData = JSON.parse(storedData);

      // Migração: Converte sessões de Objeto para Array e renomeia a propriedade de índice ativo
      if (eventData.sessions && !Array.isArray(eventData.sessions)) {
        const sessionNames = eventData.sessionOrder || Object.keys(eventData.sessions);
        const oldActiveName = eventData.activeBingoSessionName || eventData.activeSessionName;

        const sessionsArray = sessionNames.map(name => {
          const s = eventData.sessions[name];
          if (s && !s.sessionName) s.sessionName = name;
          return s;
        }).filter(s => !!s);

        eventData.activeSessionIndex = Math.max(0, sessionNames.indexOf(oldActiveName));
        eventData.sessions = sessionsArray;
        delete eventData.activeBingoSessionName;
        delete eventData.activeSessionName;
        delete eventData.sessionOrder;
      }

      // Migração: move o ícone da sessão para o nível do evento se necessário
      if (!eventData.eventIcon) {
        eventData.eventIcon = eventData.sessions[eventData.activeSessionIndex]?.eventIcon || "default-icon.png";
      }

      // Compatibilidade: garante que as propriedades renomeadas existam
      if (eventData.sessionId) { eventData.eventid = eventData.sessionId; delete eventData.sessionId; }
      eventData.hasActiveEvent = true; // Marca que um evento foi carregado

      appState = eventData.sessions[eventData.activeSessionIndex];
      if (!eventData.eventName && appState) eventData.eventName = appState.sessionName; // Fallback for overall event name
    } else {
      // Migração de dados do formato antigo (bingoAppState)
      const legacyState = localStorage.getItem('bingoAppState');
      if (legacyState) {
        const parsedLegacy = JSON.parse(legacyState);
        const name = parsedLegacy.eventName || "Sessão Antiga";
        eventData.eventid = parsedLegacy.sessionId || generateRandomId();
        eventData.eventName = parsedLegacy.eventName || "Bingo";
        eventData.sessions = [{ ...parsedLegacy, sessionName: name }];
        eventData.activeSessionIndex = 0;
        eventData.hasActiveEvent = true; // Marca que um evento foi carregado
      } else {
        // NENHUMA CRIAÇÃO DE EVENTO PADRÃO AQUI.
        // A aplicação iniciará sem um evento ativo,
        // e o modal do gerenciador de eventos será exibido após o login.
        eventData = {
          eventid: null, // Nenhum ID de evento ativo inicialmente
          eventName: "Nenhum Evento Ativo",
          eventIcon: "default-icon.png",
          ownerUid: null,
          sessions: [],
          activeSessionIndex: null,
          hasActiveEvent: false // Flag para indicar que não há evento ativo
        };
        appState = null; // Nenhum appState ativo
      }

      // Garante que o appState esteja vinculado à sessão ativa carregada
      if (eventData.hasActiveEvent && eventData.activeSessionIndex !== null) {
        appState = eventData.sessions[eventData.activeSessionIndex];
      }
    }

    // Inicializa Firebase e Monitora Autenticação
    if (typeof firebaseConfig !== 'undefined' && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();

    // Monitor de estado de login
    auth.onAuthStateChanged(async user => {
      if (user) {
        // Usuário logado
        googleLoginButton.classList.add('hidden');
        userProfileArea.classList.remove('hidden');

        if (user.photoURL) {
          userPhoto.src = user.photoURL;
          userPhoto.onerror = () => {
            userPhoto.src = 'default-icon.png';
            userPhoto.onerror = null; // Evita loop infinito se o ícone padrão também falhar
          };
        } else {
          userPhoto.src = 'default-icon.png';
        }

        if (userNameDisplay) userNameDisplay.textContent = user.displayName || user.email;

        // Resolução de propriedade ao logar
        if (eventData.eventid && navigator.onLine) {
          try {
            const [evtSnap, numsSnap] = await Promise.all([
              firebase.database().ref('evt/' + eventData.eventid).once('value'),
              firebase.database().ref('nums/' + eventData.eventid).once('value')
            ]);
            const remoteData = evtSnap.val();
            const remoteNums = numsSnap.val();

            if (remoteData && remoteData.ouid && remoteData.ouid !== user.uid) {
              // Conflito de posse: O ID que você está usando localmente pertence a outra conta no servidor.
              if (confirm(`O código "${eventData.eventid}" já está em uso por outro organizador.\n\nDeseja gerar um novo código para este evento para poder salvá-lo na nuvem?`)) {
                const newId = generateRandomId();
                // Forçamos a mudança para um novo ID aleatório para permitir sincronização na sua conta
                await processIdChange(newId, eventData.eventid, true);
              } else {
                showToast("Sincronização ignorada. O evento permanecerá apenas local.");
              }
            } else if (!remoteData && eventData.eventid) {
              // Evento criado offline que não existe no servidor
              if (confirm(`O evento "${eventData.eventName}" está apenas no seu dispositivo.\n\nDeseja salvá-lo no servidor para permitir o acesso de outros jogadores?`)) {
                eventData.ownerUid = user.uid;
                saveState(true, 'full');
                showToast("Evento enviado para a nuvem com sucesso!");
              }
            } else {
              // Lógica de Sincronização Automática (Merge)
              if (remoteData) {
                eventData.eventName = remoteData.name || eventData.eventName;
                eventData.eventIcon = remoteData.icon || eventData.eventIcon;
                eventData.activeSessionIndex = (remoteData.sIdx !== undefined) ? remoteData.sIdx : eventData.activeSessionIndex;
                eventData.ownerUid = remoteData.ouid || eventData.ownerUid;

                if (Array.isArray(remoteData.ss)) {
                  eventData.sessions = remoteData.ss.map((s, sIdx) => ({
                    sessionName: s.snm,
                    maxNumber: s.max,
                    numRounds: s.nrd,
                    currentRound: s.crnd,
                    drawMode: s.mode,
                    isSortedAscending: s.asc,
                    rounds: Object.keys(s.rds || {}).reduce((acc, rId) => {
                      acc[rId] = {
                        prize: s.rds[rId].prz,
                        pattern: s.rds[rId].ptrn,
                        patternIndex: s.rds[rId].pidx,
                        isCompleted: s.rds[rId].done,
                        drawnNumbers: remoteNums?.[sIdx]?.[rId]?.dns || []
                      };
                      return acc;
                    }, {})
                  }));
                }

                // Atualiza a referência do estado ativo para os novos dados carregados
                if (eventData.activeSessionIndex !== null && eventData.sessions[eventData.activeSessionIndex]) {
                  appState = eventData.sessions[eventData.activeSessionIndex];
                }
              }

              // Assumir propriedade caso não tenha e subir dados (Upload/Merge)
              if (!eventData.ownerUid) eventData.ownerUid = user.uid;
              saveState(true, 'full');
              setupRemoteSyncListener(eventData.eventid);
              if (remoteData) showToast("Dados sincronizados com a nuvem.");
            }
          } catch (e) {
            console.error("Erro na verificação de posse ao logar:", e);
          }
        }

        // Sincroniza a lista de todos os eventos do usuário para restaurar "atalhos" removidos localmente
        showToast("Sincronizando seus eventos...");
        await syncRegistryWithFirebase(user.uid);
        if (!eventsMgrModal.classList.contains('hidden')) renderEventsList();
      } else {
        // Usuário deslogado
        googleLoginButton.classList.remove('hidden');
        userProfileArea.classList.add('hidden');
        userDropdownMenu.classList.add('hidden');
      }

      // A aplicação SEMPRE carrega os dados locais, logado ou não
      if (eventData.hasActiveEvent && appState) {
        updateUI(false);
      } else {
        openEventsMgr();
      }
    });
  };

  // Handlers de Autenticação
  googleLoginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(error => {
      showToast("Erro ao logar: " + error.message);
    });
  });

  // Alternar Menu do Usuário
  if (userPhoto) {
    userPhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('hidden');
    });
  }

  logoutButton.addEventListener('click', () => {
    if (confirm("Deseja realmente sair?")) {
      firebase.auth().signOut();
    }
  });

  /**
   * Busca os dados completos de um evento no Firebase e o torna a sessão ativa.
   * @param {string} id - O ID do evento a ser carregado.
   */
  const openEventById = async (id) => {
    if (!id || !navigator.onLine) {
      if (!navigator.onLine) showToast("Você precisa estar online para carregar eventos.");
      return;
    }

    showToast("Baixando dados do evento...");
    try {
      const [evtSnap, numsSnap] = await Promise.all([
        firebase.database().ref('evt/' + id).once('value'),
        firebase.database().ref('nums/' + id).once('value')
      ]);
      const data = evtSnap.val();
      const numsData = numsSnap.val();

      if (data) {
        eventData.eventid = id;
        eventData.eventName = data.name || "Sem Nome";
        eventData.eventIcon = data.icon || "default-icon.png";
        eventData.activeSessionIndex = data.sIdx || 0;
        eventData.ownerUid = data.ouid;
        eventData.sessions = (data.ss || []).map((s, sIdx) => ({
          sessionName: s.snm,
          maxNumber: s.max,
          numRounds: s.nrd,
          currentRound: s.crnd,
          drawMode: s.mode,
          isSortedAscending: s.asc,
          rounds: Object.keys(s.rds || {}).reduce((acc, rId) => {
            const r = s.rds[rId];
            acc[rId] = {
              prize: r.prz,
              pattern: r.ptrn,
              patternIndex: r.pidx,
              isCompleted: r.done,
              drawnNumbers: numsData?.[sIdx]?.[rId]?.dns || []
            };
            return acc;
          }, {})
        }));

        eventData.hasActiveEvent = true;

        // Define o índice da sessão de bingo ativa
        if (eventData.activeSessionIndex === undefined || !eventData.sessions[eventData.activeSessionIndex]) {
          eventData.activeSessionIndex = 0;
        }

        appState = eventData.sessions[eventData.activeSessionIndex];

        // Atualiza a interface e exibe o painel de controle
        setupRemoteSyncListener(id);
        updateUI(false);
        showToast(`Evento "${eventData.eventName}" carregado com sucesso!`);
      } else {
        showToast("Erro: Evento não encontrado no servidor.");
      }
    } catch (error) {
      console.error("Erro ao abrir evento:", error);
      showToast("Erro de permissão ou rede ao carregar.");
    }
  };

  /**
   * Atualiza todos os elementos visuais da interface (textos, listas, seletores e modais) com base no estado atual.
   * @param {boolean} immediateSync - Define se as alterações devem ser salvas no Firebase imediatamente.
   * @param {string|boolean} syncLevel - Nível de sincronização ('full', 'session', 'numbers', ou 'none' para não salvar).
   */
  const updateUI = (immediateSync = false, syncLevel = 'numbers') => {
    // Se não houver evento ativo, atualiza o cabeçalho e oculta o conteúdo principal
    if (!appState || !eventData.eventid || eventData.activeSessionIndex === null) {
      eventTitle.textContent = eventData.eventName || "Nenhum Evento Ativo";
      document.title = eventData.eventName || "Bingo";
      eventIcon.src = "default-icon.png"; // Ícone de placeholder
      adminMain.classList.add('hidden'); // Garante que o conteúdo principal esteja oculto
      // Também oculta o modal de configuração se estiver aberto e não houver evento ativo
      configModal.classList.add('hidden');
      return;
    }

    // Garante que o conteúdo principal esteja visível após o carregamento
    adminMain.classList.remove('hidden');

    // Header
    eventTitle.textContent = eventData.eventName || appState.sessionName; // Use sessionName here
    document.title = eventData.eventName || appState.eventName;
    eventIcon.src = eventData.eventIcon || "default-icon.png";
    configIconPreview.src = eventData.eventIcon || "default-icon.png"; // Atualiza a prévia no modal

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
    if (configSessionName) configSessionName.value = appState.sessionName || ''; // Use sessionName here
    configNumRounds.value = appState.numRounds;
    configMaxNumber.value = appState.maxNumber;
    configDrawMode.value = appState.drawMode;
    configSessionId.value = eventData.eventid || '';
    updateSessionSelector(); // Agora atualiza o seletor principal do header

    // Desabilita botões de reordenação se necessário
    const activeIdx = eventData.activeSessionIndex;
    if (moveSessionUpButton) moveSessionUpButton.disabled = activeIdx <= 0;
    if (moveSessionDownButton) moveSessionDownButton.disabled = activeIdx >= eventData.sessions.length - 1;

    // Botão de Ordenação
    toggleSortButton.textContent = appState.isSortedAscending ? "Ordem: Crescente" : "Ordem: Sorteio";

    // Link de Compartilhamento
    const configShareLink = document.getElementById('config-share-link');
    if (configShareLink) {
      // Usamos href.split para evitar erros com window.location.origin sendo 'null' em arquivos locais
      const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('control.html', '').replace('index.html', '');
      configShareLink.value = `${baseUrl}view.html?id=${eventData.eventid}`;
    }

    if (syncLevel !== 'none') saveState(immediateSync, syncLevel);
  };

  /**
   * Preenche os menus suspensos de escolha de sessões (Header e Configurações).
   */
  const updateSessionSelector = () => {
    [mainSessionSelector, configSessionSelector].forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      eventData.sessions.forEach((session, index) => {
        if (!session) return;
        const name = session.sessionName || `Sessão ${index + 1}`;
        const option = document.createElement('option');
        option.value = index;
        option.textContent = name;
        if (index === eventData.activeSessionIndex) option.selected = true;
        sel.appendChild(option);
      });
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
      let sessionNames = (data && data.sessions) ? data.sessions : [];

      if (data && typeof data === 'object') eventName = data.name || "Evento sem nome";

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
          openEventById(id);
          closeEventsMgr();
        };
        actions.appendChild(selectBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Remover';
        deleteBtn.classList.add('undo-button');
        deleteBtn.style.padding = '5px 10px'; deleteBtn.style.fontSize = '0.8em';
        deleteBtn.onclick = async () => { // Tornar a função assíncrona
          const user = firebase.auth().currentUser;
          const isOnline = navigator.onLine;

          let confirmMessage = `Remover o evento "${eventName}" (Código: ${id}) da sua lista local?`;
          if (user && isOnline) {
            confirmMessage += `\n\nATENÇÃO: Isso também o removerá do Firebase (nuvem) se você for o proprietário.`;
          } else {
            confirmMessage += `\n\nVocê está offline ou não logado. A remoção será apenas local.`;
          }

          if (confirm(confirmMessage)) {
            if (user && isOnline) {
              try {
                await firebase.database().ref('sessions/' + id).remove();
                showToast(`Evento "${eventName}" removido do Firebase e localmente.`);
              } catch (error) {
                console.error("Erro ao remover evento do Firebase:", error);
                if (error.code === 'PERMISSION_DENIED') {
                  showToast(`Erro: Você não tem permissão para remover "${eventName}" do Firebase. Removendo apenas localmente.`);
                } else {
                  showToast(`Erro ao remover do Firebase: ${error.message}. Removendo apenas localmente.`);
                }
              }
            } else {
              showToast(`Evento "${eventName}" removido localmente.`);
            }

            const reg = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
            delete reg[id];
            localStorage.setItem('bingoUserEvents', JSON.stringify(reg));
            renderEventsList();
          }
        };
        actions.appendChild(deleteBtn);
      }

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
      // Cláusula de guarda para quando nenhum appState é carregado
      if (!appState || !appState.rounds || !appState.rounds[appState.currentRound]) {
        return setTimeout(run, 1000);
      }

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

    const rawNumbers = currentRoundData.drawnNumbers || [];
    let numbersToDisplay = [...rawNumbers];
    const lastDrawn = rawNumbers.length > 0 ? rawNumbers[rawNumbers.length - 1] : null;

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
      if (num === lastDrawn) {
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
      showToast("Rodada concluída. Desmarque para alterar.");
      return;
    }
    if (!currentRoundData.drawnNumbers) currentRoundData.drawnNumbers = [];
    if (number < 1 || number > appState.maxNumber || isNaN(number)) {
      showToast(`Digite um número válido (01-${appState.maxNumber.toString().padStart(2, '0')})`);
      return;
    }
    if (currentRoundData.drawnNumbers.includes(number)) {
      showToast(`Número ${number.toString().padStart(2, '0')} já sorteado.`);
      return;
    }

    currentRoundData.drawnNumbers.push(number);
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
      showToast("Rodada concluída. Desmarque para alterar.");
      return;
    }
    if (currentRoundData && currentRoundData.drawnNumbers && currentRoundData.drawnNumbers.length > 0) {
      if (confirm("Tem certeza que deseja desfazer o último número sorteado?")) {
        currentRoundData.drawnNumbers.pop(); // Remove o último
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
      showToast("Rodada concluída. Desmarque para alterar.");
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
      showToast("Todos os números já sorteados!");
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
    updateUI(true, 'full'); // Força sincronização imediata ao fechar o modal
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
    updateUI(true, 'full'); // Força sincronização imediata ao fechar o gerenciador
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
    if (e.key === 'Escape' && !idOptionsModal.classList.contains('hidden')) {
      idOptCancel.click();
    }
  });

  // Fechar dropdown ao clicar fora
  window.addEventListener('click', () => {
    if (userDropdownMenu) userDropdownMenu.classList.add('hidden');
  });

  // Altera a rodada ativa quando o usuário seleciona outra no menu suspenso
  roundSelector.addEventListener('change', (e) => {
    appState.currentRound = parseInt(e.target.value);
    updateUI(true, 'session');
  });

  // Marca ou desmarca a rodada como concluída
  roundCompletedCheckbox.addEventListener('change', (e) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.isCompleted = e.target.checked;
    updateUI(true, 'session');
  });

  // Salva o nome do prêmio quando o usuário para de editar o campo
  prizeLabel.addEventListener('blur', (e) => {
    if (e.target.textContent.trim() === '') {
      e.target.textContent = `Prêmio da Rodada ${appState.currentRound}`;
    }
    appState.rounds[appState.currentRound].prize = e.target.textContent;
    saveState(true, 'session');
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
    updateUI(true, 'session');
  });

  // Sorteia um número aleatório (disponível no modo automático)
  drawRandomButton.addEventListener('click', drawRandomNumber);

  // Altera o padrão visual da rodada (Linha, Coluna, etc.)
  patternSelect.addEventListener('change', (e) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.patternIndex = parseInt(e.target.value);
    animationStep = 0;
    animationPhase = true;
    saveState(true, 'session');
  });

  // Config Modal Event Listeners
  // Troca a sessão ativa (tanto no cabeçalho quanto no modal)
  [mainSessionSelector, configSessionSelector].forEach(sel => {
    if (sel) {
      sel.addEventListener('change', (e) => {
        eventData.activeSessionIndex = parseInt(e.target.value);
        appState = eventData.sessions[eventData.activeSessionIndex];
        updateUI(true, 'full'); // Troca de sessão é uma mudança estrutural (raiz)
      });
    }
  });

  /**
   * Altera a ordem da sessão ativa na lista de sessões.
   * @param {number} direction - -1 para subir, 1 para descer.
   */
  const moveSession = (direction) => {
    const currentIndex = eventData.activeSessionIndex;
    if (currentIndex === null) return;
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= eventData.sessions.length) return;

    // Troca de posição no array
    const temp = eventData.sessions[currentIndex];
    eventData.sessions[currentIndex] = eventData.sessions[newIndex];
    eventData.sessions[newIndex] = temp;

    // Atualiza o índice ativo para acompanhar o item movido
    eventData.activeSessionIndex = newIndex;
    // Reatribui appState para a nova posição
    appState = eventData.sessions[eventData.activeSessionIndex];

    updateUI(true, 'full');
  };

  // Listener para mover sessão para cima
  if (moveSessionUpButton) {
    moveSessionUpButton.addEventListener('click', () => moveSession(-1));
  }

  // Listener para mover sessão para baixo
  if (moveSessionDownButton) {
    moveSessionDownButton.addEventListener('click', () => moveSession(1));
  }

  // Garante que o ID digitado manualmente siga as regras de maiúsculas e caracteres alfanuméricos
  configSessionId.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  // Altera o ID da sessão via input manual
  configSessionId.addEventListener('change', async (e) => {
    const newId = e.target.value.toUpperCase().trim();
    await processIdChange(newId, eventData.eventid);
  });

  // Gera um novo ID de sessão aleatório
  regenerateIdButton.addEventListener('click', async () => {
    let newId = generateRandomId();
    const user = firebase.auth().currentUser; // Verifica se o usuário está logado

    if (user && navigator.onLine) { // Só checa o Firebase se o usuário estiver online
      let isTaken = await checkIdExists(newId);
      // Tenta gerar um novo ID até encontrar um que não esteja em uso (limite de 5 tentativas)
      let attempts = 0;
      while (isTaken && attempts < 5) {
        newId = generateRandomId();
        isTaken = await checkIdExists(newId);
        attempts++;
      }
    }
    await processIdChange(newId, eventData.eventid); // Usa a nova lógica de processamento
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
      showToast('Erro ao copiar o link.');
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

  // Copia a URL de visualização de dentro do modal de QR Code
  if (copyQrLinkButton) {
    copyQrLinkButton.addEventListener('click', () => {
      const url = qrLinkDisplay.textContent;
      navigator.clipboard.writeText(url).then(() => {
        const originalText = copyQrLinkButton.textContent;
        copyQrLinkButton.textContent = 'Copiado! ✅';
        setTimeout(() => copyQrLinkButton.textContent = originalText, 2000);
      });
    });
  }

  // --- Event Listeners do Gerenciador de Sessões ---
  if (eventsMgrButton) eventsMgrButton.addEventListener('click', openEventsMgr);
  if (closeEventsMgrX) closeEventsMgrX.addEventListener('click', closeEventsMgr);
  if (closeEventsMgrButton) closeEventsMgrButton.addEventListener('click', closeEventsMgr);

  if (mgrNewEventButton) {
    mgrNewEventButton.addEventListener('click', () => {
      if (!confirm("Isso criará um Evento totalmente novo com um novo Código ID. Deseja continuar?")) return;

      const defaultName = "Novo Evento de Bingo";
      eventData.eventid = generateRandomId();
      eventData.eventName = defaultName;
      eventData.eventIcon = "default-icon.png";
      eventData.sessions = [createDefaultSessionState(defaultName)];
      eventData.activeSessionIndex = 0;
      eventData.hasActiveEvent = true; // Marca que um evento está agora ativo
      appState = eventData.sessions[0];
      updateUI(true, 'full');
      closeEventsMgr();
    });
  }

  // Fecha o modal de sessões ao clicar no overlay (fora do conteúdo)
  if (eventsMgrModal) {
    eventsMgrModal.addEventListener('click', (e) => { if (e.target === eventsMgrModal) closeEventsMgr(); });
  }

  // Cria uma nova sessão no projeto atual
  newSessionButton.addEventListener('click', () => {
    const name = prompt("Nome da nova sessão:");
    if (name && name.trim() !== "") {
      if (eventData.sessions.some(s => s.sessionName === name)) {
        showToast("Já existe uma sessão com este nome.");
        return;
      }
      eventData.sessions.push(createDefaultSessionState(name));
      eventData.activeSessionIndex = eventData.sessions.length - 1;
      appState = eventData.sessions[eventData.activeSessionIndex];
      updateUI(true, 'full');
    }
  });

  // Listener para Renomear a Sessão Selecionada via botão
  if (renameSessionButton) {
    renameSessionButton.addEventListener('click', () => {
      const oldName = appState.sessionName;
      const newName = prompt("Novo nome para a sessão:", oldName);

      if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
        const cleanName = newName.trim();
        if (eventData.sessions.some(s => s.sessionName === cleanName)) {
          showToast("Já existe uma sessão com este nome.");
          return;
        }

        const sessionIdx = eventData.activeSessionIndex;
        eventData.sessions[sessionIdx].sessionName = cleanName;
        appState = eventData.sessions[sessionIdx];
        appState.sessionName = cleanName; // Update sessionName
        updateUI(true, 'full');
      }
    });
  }

  // Exclui a sessão ativa atual
  deleteSessionButton.addEventListener('click', () => {
    const currentName = appState.sessionName;

    if (eventData.sessions.length <= 1) {
      if (confirm(`Esta é a única sessão existente. Deseja resetá-la para o estado inicial?`)) {
        const defaultName = "Sessão Padrão";
        eventData.sessions = [createDefaultSessionState(defaultName)];
        eventData.activeSessionIndex = 0;
        appState = eventData.sessions[0];
        updateUI(true, 'full');
      }
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a sessão "${currentName}"?`)) {
      const idxToRemove = eventData.activeSessionIndex;
      eventData.sessions.splice(idxToRemove, 1);
      eventData.activeSessionIndex = 0;
      appState = eventData.sessions[0];
      updateUI(true, 'full');
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
      const oldName = appState.sessionName;
      if (!newName || newName === oldName) return;

      if (eventData.sessions.some(s => s.sessionName === newName)) {
        showToast("Já existe uma sessão com este nome.");
        e.target.value = oldName;
        return;
      }

      const idx = eventData.activeSessionIndex;
      eventData.sessions[idx].sessionName = newName;
      appState = eventData.sessions[idx];
      appState.sessionName = newName; // Update sessionName
      updateUI(true, 'full');
    });
  }

  // Altera a quantidade de rodadas do evento
  configNumRounds.addEventListener('change', (e) => {
    const newNumRounds = parseInt(e.target.value);
    if (newNumRounds < 1) {
      showToast("Mínimo de 1 rodada.");
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
    updateUI(true, 'session');
  });

  // Altera o limite máximo de números para o bingo (ex: 75 ou 90)
  configMaxNumber.addEventListener('change', (e) => {
    const newMax = parseInt(e.target.value);
    if (isNaN(newMax) || newMax < 1 || newMax > 90) {
      showToast("Máximo deve ser entre 1 e 90.");
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
      showToast(`Erro: Número ${invalidNumber} já sorteado.`);
      configMaxNumber.value = appState.maxNumber;
      return;
    }

    appState.maxNumber = newMax;
    saveState(true, 'session');
  });

  // Altera entre modo de sorteio manual (input) ou automático (botão)
  configDrawMode.addEventListener('change', (e) => {
    appState.drawMode = e.target.value;
    updateUI(true, 'session');
  });

  // Processa o upload de uma imagem personalizada para o ícone do evento
  configIconUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        eventData.eventIcon = event.target.result; // Base64 string
        eventIcon.src = eventData.eventIcon; // Atualiza imediatamente
        configIconPreview.src = eventData.eventIcon; // Atualiza a prévia
        saveState(true, 'full');
      };
      reader.readAsDataURL(file); // Converte a imagem para Base64
    }
  });

  // Restaura o ícone padrão do evento
  configIconRemove.addEventListener('click', () => {
    // Se o ícone já for o padrão, não faz nada
    if (eventData.eventIcon === "default-icon.png") return;

    eventData.eventIcon = "default-icon.png";
    eventIcon.src = eventData.eventIcon;
    configIconPreview.src = eventData.eventIcon;
    configIconUpload.value = ''; // Limpa o campo de upload
    saveState(true, 'full');
    showToast("Ícone padrão restaurado.");
  });


  // Gera e baixa um arquivo JSON com todos os dados do projeto
  exportSessionButton.addEventListener('click', () => {
    // Criamos uma cópia para processar a exportação sem alterar o estado em memória
    const stateToExport = JSON.parse(JSON.stringify(appState));
    stateToExport.eventIcon = eventData.eventIcon;

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
          if (importedState && (importedState.eventName || importedState.sessionName) && importedState.rounds) {

            // Se o ícone foi exportado como array (múltiplas linhas), juntamos novamente
            if (Array.isArray(importedState.eventIcon)) {
              importedState.eventIcon = importedState.eventIcon.join('');
            }
            eventData.eventIcon = importedState.eventIcon || "default-icon.png";

            // Garante um ID se o arquivo importado for de uma versão anterior
            if (!importedState.eventid) importedState.eventid = importedState.sessionId || generateRandomId();
            // Garante um ID se o arquivo importado não possuir um
            if (!importedState.eventid) importedState.eventid = generateRandomId();

            // Ensure sessionName is set, using eventName as fallback for older exports
            importedState.sessionName = importedState.sessionName || importedState.eventName;

            eventData.sessions.push(importedState);
            eventData.activeSessionIndex = eventData.sessions.length - 1;
            appState = eventData.sessions[eventData.activeSessionIndex];
            updateUI(true, 'full');
            showToast("Sessão importada!");
          } else {
            showToast("JSON inválido.");
          }
        } catch (error) {
          showToast("Erro ao ler JSON.");
        }
      };
      reader.readAsText(file);
    }
  });


  /**
   * Registra o evento atual na lista de eventos conhecidos pelo usuário no localStorage.
   */
  const registerEventLocally = () => {
    if (!eventData.eventid) return; // Guarda contra nenhum evento ativo
    const registry = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
    // Armazena o nome principal e a lista de todas as sessões para visualização no gerenciador
    registry[eventData.eventid] = {
      name: eventData.eventName || "Evento sem nome",
      sessions: (eventData.sessions || []).map(s => s.sessionName || "Sessão")
    };
    localStorage.setItem('bingoUserEvents', JSON.stringify(registry));
  };

  /**
   * Salva o estado atual no localStorage e agenda a sincronização.
   * @param {boolean} immediate - Define se a sincronização com o Firebase deve ser imediata.
   * @param {string|boolean} syncLevel - Nível de sincronização ('full', 'session', 'numbers').
   */
  const saveState = (immediate = false, syncLevel = 'numbers') => {
    if (!eventData.eventid) return; // Guarda contra nenhum evento ativo
    // Atualiza o timestamp local para persistência e controle de versão
    eventData.lastModified = Date.now();
    localStorage.setItem('bingoEventData', JSON.stringify(eventData));
    registerEventLocally();
    syncToFirebase(immediate, syncLevel);
  };

  // --- Inicialização ---
  loadState(); // Carrega o estado salvo ao iniciar
  startAnimationLoop();
});
