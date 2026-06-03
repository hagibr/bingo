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
  const configSessionId = document.getElementById('config-event-id');
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
  const mgrForceSyncButton = document.getElementById('mgr-force-sync-button');
  const eventsMgrButton = document.getElementById('events-mgr-button');
  const eventsMgrModal = document.getElementById('events-mgr-modal');
  const closeEventsMgrX = document.getElementById('close-events-mgr-x');
  const closeEventsMgrButton = document.getElementById('close-events-mgr-button');
  const sessionsListContainer = document.getElementById('events-list-container');
  const mgrNewEventButton = document.getElementById('mgr-new-event-button');
  const mgrImportEventButton = document.getElementById('mgr-import-event-button');
  const mgrImportCodeButton = document.getElementById('mgr-import-code-button');
  const mgrImportEventInput = document.getElementById('mgr-import-event-input');

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

  // Novos elementos de navegação de rodada no painel principal
  const prevRoundMainButton = document.getElementById('prev-round-main');
  const nextRoundMainButton = document.getElementById('next-round-main');
  const currentRoundLabelTrigger = document.getElementById('current-round-label-trigger');

  // Novos elementos de navegação de sessão no painel principal
  const prevSessionMainButton = document.getElementById('prev-session-main');
  const nextSessionMainButton = document.getElementById('next-session-main');
  const currentSessionNameLabel = document.getElementById('current-session-name-label');

  // --- Lógica de Zoom das Bolas ---
  const ballScales = [1, 1.25, 1.5, 1.75, 2];
  let ballZoomIndex = 0;

  /**
   * Cicla o tamanho das bolas e atualiza as variáveis CSS no contêiner.
   */
  const cycleBallZoom = () => {
    ballZoomIndex = (ballZoomIndex + 1) % ballScales.length;
    const scale = ballScales[ballZoomIndex];
    drawnNumbersList.style.setProperty('--ball-zoom', scale);
    drawnNumbersList.style.setProperty('--ball-gap', (10 * scale) + 'px');
    drawnNumbersList.style.setProperty('--ball-padding', (15 * scale) + 'px');
  };

  let activeRemoteRef = null;
  const instanceId = Math.random().toString(36).substring(2, 10);

  let lastToast = null;
  let lastToastTimeout = null;

  /**
   * Exibe uma notificação tipo toast na tela.
   * @param {string} message - Mensagem a ser exibida.
   */
  const showToast = (message) => {
    // Compara o innerHTML para suportar tags de formatação como <strong>
    if (lastToast && lastToast.querySelector('span').innerHTML === message) {
      clearTimeout(lastToastTimeout);
      // Efeito de piscar resetando a animação de entrada
      lastToast.style.animation = 'none';
      void lastToast.offsetWidth; // trigger reflow
      lastToast.style.animation = 'toastFadeIn 0.3s ease';

      const t = lastToast;
      lastToastTimeout = setTimeout(() => {
        if (t.parentNode) {
          t.style.animation = 'toastFadeOut 0.2s forwards';
          setTimeout(() => { if (t.parentNode) t.remove(); }, 200);
        }
        if (lastToast === t) lastToast = null;
      }, 2000);
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
    lastToastTimeout = setTimeout(removeToast, 2000);
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
    const isOrderOnly = (syncLevel === 'order_only');

    // Atualiza o timestamp e o ID da instância apenas se não for uma mudança silenciosa de ordem
    if (!isOrderOnly) {
      updates[`evt/${eventId}/last`] = timestamp;
      updates[`evt/${eventId}/sid`] = instanceId;
    }

    if (isFull || isOrderOnly) {
      // Sincronização estrutural: Metadados da Raiz + Todas as Sessões
      if (isFull) {
        updates[`evt/${eventId}/name`] = dataToSync.eventName || "Novo Evento de Bingo";
        updates[`evt/${eventId}/icon`] = dataToSync.eventIcon || "default-icon.png";
        updates[`evt/${eventId}/sIdx`] = dataToSync.activeSessionIndex;
        updates[`evt/${eventId}/ouid`] = dataToSync.ownerUid || user.uid;
      }
      
      updates[`evt/${eventId}/ord`] = dataToSync.displayOrder || [];

      const sessionsClone = JSON.parse(JSON.stringify(dataToSync.sessions));

      // Registra apenas o ID do evento no índice do usuário para controle de posse
      updates[`uevts/${user.uid}/${eventId}`] = true;

      const ssToUpload = sessionsClone.map((s, sIdx) => {
        if (!s) return null;
        const ssUpdate = {
          snm: s.sessionName,
          max: s.maxNumber,
          nrd: s.numRounds,
          crnd: s.currentRound,
          mode: s.drawMode,
          asc: !!s.isSortedAscending,
          last: s.lastModified || timestamp,
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
      // Ignora se não houver dados, se for um "eco" ou se os dados remotos forem mais antigos que os locais
      if (!remoteData || remoteData.sid === instanceId) return;

      if (remoteData.last && eventData.lastModified && remoteData.last <= eventData.lastModified) return;

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

      if (remoteData.ss) {
        // O Firebase pode retornar um objeto em vez de array se os índices forem manipulados
        const sessionsRaw = Array.isArray(remoteData.ss) ? remoteData.ss : Object.values(remoteData.ss);
        const remoteOrder = remoteData.ord || sessionsRaw.map((_, i) => i);

        eventData.sessions = sessionsRaw.map((s, sIdx) => ({
          sessionName: s.snm,
          maxNumber: s.max,
          numRounds: s.nrd,
          currentRound: s.crnd,
          drawMode: s.mode,
          isSortedAscending: s.asc,
          lastModified: s.last,
          rounds: Object.keys(s.rds || {}).reduce((acc, rId) => {
            const r = s.rds[rId];
            acc[rId] = { prize: r.prz, pattern: r.ptrn, patternIndex: r.pidx, isCompleted: r.done, drawnNumbers: remoteNums?.[sIdx]?.[rId]?.dns || [] };
            return acc;
          }, {})
        }));

        eventData.displayOrder = remoteOrder;

        // Garante que a referência do appState aponte para o objeto dentro do novo array
        if (eventData.activeSessionIndex !== null && eventData.sessions[eventData.activeSessionIndex]) {
          appState = eventData.sessions[eventData.activeSessionIndex];
        }
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

    // Bloqueia o botão para evitar cliques múltiplos durante o processo
    if (mgrForceSyncButton) {
      mgrForceSyncButton.disabled = true;
    }

    try {
      // Agora lemos diretamente do nó indexado pelo UID do usuário
      const snapshot = await firebase.database().ref(`uevts/${uid}`).once('value');
      const cloudIds = snapshot.val() || {};
      const updatedRegistry = {};

      // Busca os detalhes de cada evento (Nome e Sessões) para exibir no gerenciador
      const fetchPromises = Object.keys(cloudIds).map(async (id) => {
        const evtSnap = await firebase.database().ref(`evt/${id}`).once('value');
        const data = evtSnap.val();
        if (data) {
          updatedRegistry[id] = {
            name: data.name || "Sem Nome",
            sessions: (data.ss || [])
              .filter(s => s !== null)
              .map(s => s.snm || "Sessão")
          };
        }
      });

      await Promise.all(fetchPromises);
      localStorage.setItem('bingoUserEvents', JSON.stringify(updatedRegistry));
      renderEventsList();
      showToast("Lista de eventos sincronizada com a nuvem.");
    } catch (error) {
      console.error("Erro ao sincronizar lista de eventos:", error);
      showToast("Erro ao sincronizar com a nuvem.");
    } finally {
      // Garante que o botão seja reabilitado independente de sucesso ou falha
      if (mgrForceSyncButton) {
        mgrForceSyncButton.disabled = false;
      }
    }
  };

  /**
   * Gerencia a alteração do ID da sessão com lógica de substituir ou copiar.
   * @param {string} newId - O novo código desejado.
   * @param {string} oldId - O código atual.
   * @param {string|boolean} forcedChoice - Escolha forçada ('1' para substituir, '2' para cópia) ou true para conflitos.
   */
  const processIdChange = async (newId, oldId, forcedChoice = null) => {
    if (!newId || newId === oldId) return;
    const user = firebase.auth().currentUser;

    let choice;
    if (forcedChoice === '1' || forcedChoice === '2') {
      choice = forcedChoice;
    } else if (forcedChoice === true) {
      // Em caso de conflito de posse detectado no login ou ao carregar, tratamos como uma renomeação local forçada (cópia/2)
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
      if (user) {
        // 1. Validação de posse do novo ID (apenas se online para segurança)
        if (navigator.onLine) {
          try {
            const snapshot = await firebase.database().ref('evt/' + newId).once('value');
            const existingData = snapshot.val();
            if (existingData && existingData.ouid && existingData.ouid !== user.uid) {
              showToast(`Código "${newId}" já em uso por outro organizador. Substituição abortada.`);
              configSessionId.value = oldId;
              return;
            }
          } catch (e) {
            console.warn("Erro ao validar novo ID no servidor:", e);
          }
        }

        // 2. Limpeza do ID antigo no Firebase (O SDK gerencia a fila offline se necessário)
        if (oldId) {
          const cleanupUpdates = {};
          cleanupUpdates[`evt/${oldId}`] = null;
          cleanupUpdates[`nums/${oldId}`] = null;
          cleanupUpdates[`uevts/${user.uid}/${oldId}`] = null;
          firebase.database().ref().update(cleanupUpdates).catch(err => {
            console.error("Erro na limpeza remota do ID antigo:", err);
          });
        }
      }

      // 3. Limpeza Local (Registry no localStorage) - Sempre ocorre para evitar inconsistências
      if (oldId) {
        const registry = JSON.parse(localStorage.getItem('bingoUserEvents') || '{}');
        if (registry[oldId]) {
          delete registry[oldId];
          localStorage.setItem('bingoUserEvents', JSON.stringify(registry));
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
    sessions: [],
    displayOrder: []
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
      lastModified: Date.now(),
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
      const isConfigOrMgrOpen = (configModal && !configModal.classList.contains('hidden')) || (eventsMgrModal && !eventsMgrModal.classList.contains('hidden'));
      // Permite sincronização 'order_only' mesmo com modais abertos, mas bloqueia outros tipos.
      if (isConfigOrMgrOpen && level !== 'order_only') return;
      if (!eventData.sessions.length) return;

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

      // Inicializa a ordem de exibição se não existir ou estiver inconsistente
      if (!eventData.displayOrder || eventData.displayOrder.length !== eventData.sessions.length) {
        eventData.displayOrder = eventData.sessions.map((_, i) => i);
      }

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
    auth.onAuthStateChanged(async (user) => {
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
              const ok = await showDialog({
                title: "Sincronizar Evento",
                message: `O evento "${eventData.eventName}" está apenas no seu dispositivo. Deseja salvá-lo no servidor para permitir o acesso de outros jogadores?`,
                type: "confirm"
              });
              if (ok) {
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

                if (remoteData.ord) eventData.displayOrder = remoteData.ord;
                else if (remoteData.ss) {
                  eventData.displayOrder = (Array.isArray(remoteData.ss) ? remoteData.ss : Object.keys(remoteData.ss)).map((_, i) => i);
                }

                if (remoteData.ss) {
                  const sessionsRaw = Array.isArray(remoteData.ss) ? remoteData.ss : Object.values(remoteData.ss);

                  eventData.sessions = sessionsRaw.map((s, sIdx) => ({
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
              if (!eventData.ownerUid || !remoteData) {
                eventData.ownerUid = user.uid;
                saveState(true, 'full');
              } else {
                // Se já existia no remoto e os dados foram mesclados, 
                // apenas atualizamos o lastModified local sem disparar novo upload
                eventData.lastModified = remoteData.last;
              }
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
        // Usamos 'none' aqui porque acabamos de vir de um processo de 
        // autenticação/sincronização inicial, não há necessidade de salvar novamente.
        updateUI(false, 'none');
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

  logoutButton.addEventListener('click', async () => {
    const ok = await showDialog({
      title: "Sair",
      message: "Deseja realmente sair da sua conta?",
      type: "confirm"
    });
    if (ok) {
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
        eventData.sessions = (data.ss || []).map((s, sIdx) => {
          if (!s) return null;
          return {
            sessionName: s.snm,
            maxNumber: s.max,
            numRounds: s.nrd,
            currentRound: s.crnd,
            drawMode: s.mode,
            isSortedAscending: s.asc,
            lastModified: s.last,
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
          };
        }).filter(s => s !== null);

        eventData.hasActiveEvent = true;
        
        // Carrega ordem remota ou gera padrão
        if (data.ord) eventData.displayOrder = data.ord;
        else eventData.displayOrder = eventData.sessions.map((_, i) => i);


        // Define o índice da sessão de bingo ativa
        if (eventData.activeSessionIndex === undefined || !eventData.sessions[eventData.activeSessionIndex]) {
          eventData.activeSessionIndex = 0;
        }

        appState = eventData.sessions[eventData.activeSessionIndex];

        // Atualiza a interface e exibe o painel de controle
        setupRemoteSyncListener(id);
        updateUI(false, 'none');
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
   * Cria uma cópia completa de um evento existente na nuvem.
   */
  const duplicateEventById = async (id, btnElement = null) => {
    const user = firebase.auth().currentUser;
    if (!user || !navigator.onLine) return showToast("Ação requer login e internet.");

    if (btnElement) btnElement.disabled = true;

    showToast("Duplicando evento...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Artificial delay
    try {
      const [evtSnap, numsSnap] = await Promise.all([
        firebase.database().ref(`evt/${id}`).once('value'),
        firebase.database().ref(`nums/${id}`).once('value')
      ]);

      const data = evtSnap.val();
      const nums = numsSnap.val();
      if (!data) return showToast("Evento não encontrado.");

      const newId = generateRandomId();
      data.ouid = user.uid; // Garante que o usuário atual seja o dono
      data.last = firebase.database.ServerValue.TIMESTAMP;

      const updates = {};
      updates[`evt/${newId}`] = data;
      if (nums) updates[`nums/${newId}`] = nums;
      updates[`uevts/${user.uid}/${newId}`] = true;

      await firebase.database().ref().update(updates);
      await syncRegistryWithFirebase(user.uid);
      showToast(`Evento duplicado! Novo código: ${newId}`);
    } catch (e) {
      showToast("Erro ao duplicar.");
    } finally {
      if (btnElement) btnElement.disabled = false;
    }
  };

  /**
   * Exporta os dados de um evento específico por ID.
   */
  const exportEventById = async (id, btnElement = null) => {
    if (btnElement) btnElement.disabled = true;

    showToast("Preparando exportação...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Artificial delay
    try {
      const [evtSnap, numsSnap] = await Promise.all([
        firebase.database().ref(`evt/${id}`).once('value'),
        firebase.database().ref(`nums/${id}`).once('value')
      ]);

      const data = evtSnap.val();
      const numsData = numsSnap.val();
      if (!data) return showToast("Dados não encontrados.");

      const exportObj = {
        eventName: data.name,
        eventIcon: data.icon,
        sessions: (data.ss || []).map((s, sIdx) => ({
          sessionName: s.snm,
          maxNumber: s.max,
          numRounds: s.nrd,
          currentRound: s.crnd,
          drawMode: s.mode,
          isSortedAscending: s.asc,
          rounds: Object.keys(s.rds || {}).reduce((acc, rId) => {
            const r = s.rds[rId];
            acc[rId] = { prize: r.prz, pattern: r.ptrn, patternIndex: r.pidx, isCompleted: r.done, drawnNumbers: numsData?.[sIdx]?.[rId]?.dns || [] }; // Inclui drawnNumbers
            return acc;
          }, {})
        }))
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const safeName = (data.name || "Bingo").replace(/\s+/g, '_');
      a.download = `${safeName}_${id}_${date}.json`;
      a.click();
    } catch (e) {
      showToast("Erro ao exportar.");
    } finally {
      if (btnElement) btnElement.disabled = false;
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

    // Calcula a posição da sessão ativa na ordem de exibição para controle de navegação
    const activeSessionActualIndex = eventData.activeSessionIndex;
    const activeSessionDisplayPosition = eventData.displayOrder.indexOf(activeSessionActualIndex);

    // Garante que o conteúdo principal esteja visível após o carregamento
    adminMain.classList.remove('hidden');

    // Header
    eventTitle.textContent = eventData.eventName || appState.sessionName;
    document.title = eventData.eventName || appState.eventName;
    eventIcon.src = eventData.eventIcon || "default-icon.png";
    configIconPreview.src = eventData.eventIcon || "default-icon.png"; // Atualiza a prévia no modal

    // Round Selector
    updateRoundSelector();
    roundSelector.value = appState.currentRound;

    if (currentRoundLabelTrigger) {
      currentRoundLabelTrigger.textContent = `Rodada ${appState.currentRound}`;
    }
    if (prevRoundMainButton) prevRoundMainButton.disabled = appState.currentRound <= 1;
    if (nextRoundMainButton) nextRoundMainButton.disabled = appState.currentRound >= appState.numRounds;

    // Session Info (Label e Botões)
    if (currentSessionNameLabel) {
      currentSessionNameLabel.textContent = appState.sessionName || "Sessão";
    }
    if (prevSessionMainButton) prevSessionMainButton.disabled = activeSessionDisplayPosition <= 0;
    if (nextSessionMainButton) nextSessionMainButton.disabled = activeSessionDisplayPosition >= eventData.displayOrder.length - 1;

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

    // Control Section (Manual/Sorteio)
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
    if (moveSessionUpButton) moveSessionUpButton.disabled = activeSessionDisplayPosition <= 0;
    if (moveSessionDownButton) moveSessionDownButton.disabled = activeSessionDisplayPosition >= eventData.displayOrder.length - 1;

    // Botão de Ordenação
    toggleSortButton.textContent = appState.isSortedAscending ? "Ordem: Crescente" : "Ordem: Sorteio";

    // Link de Compartilhamento
    const configShareLink = document.getElementById('config-share-link');
    if (configShareLink) {
      // Usamos href.split para evitar erros com window.location.origin sendo 'null' em arquivos locais
      const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('control.html', '').replace('index.html', '');
      const fullUrl = `${baseUrl}view.html?id=${eventData.eventid}`;
      configShareLink.href = fullUrl;
      configShareLink.textContent = fullUrl;
    }

    saveState(immediateSync, syncLevel);
  };

  /**
   * Preenche os menus suspensos de escolha de sessões (Header e Configurações).
   */
  const updateSessionSelector = () => {
    [mainSessionSelector, configSessionSelector].forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      eventData.displayOrder.forEach((index) => {
        const session = eventData.sessions[index];
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

          const ok = await showDialog({ title: "Remover Evento", message: confirmMessage, type: "confirm" });
          if (ok) {
            if (user && isOnline) {
              try {
                // Remove o evento, os números e o índice do usuário na nuvem
                const updates = {};
                updates[`evt/${id}`] = null;
                updates[`nums/${id}`] = null;
                updates[`uevts/${user.uid}/${id}`] = null;

                await firebase.database().ref().update(updates);
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

    // Adiciona botões de Duplicar e Exportar para cada item
    sessionsListContainer.querySelectorAll('.event-mgr-item').forEach(item => {
      const idMatch = item.innerHTML.match(/Código: ([A-Z0-9]+)/);
      if (!idMatch) return;
      const id = idMatch[1];
      const actions = item.querySelector('div');

      const dupBtn = document.createElement('button');
      dupBtn.textContent = 'Duplicar';
      dupBtn.style.padding = '5px 10px'; dupBtn.style.fontSize = '0.8em';
      dupBtn.style.backgroundColor = '#17a2b8';
      dupBtn.onclick = () => duplicateEventById(id, dupBtn);

      const expBtn = document.createElement('button');
      expBtn.textContent = 'Exportar';
      expBtn.style.padding = '5px 10px'; expBtn.style.fontSize = '0.8em';
      expBtn.style.backgroundColor = '#6c757d';
      expBtn.onclick = () => exportEventById(id, expBtn);

      // Insere o botão de Exportar no início do div 'actions'
      actions.insertBefore(expBtn, actions.firstChild);
      // Insere o botão de Duplicar no início do div 'actions' (ele ficará antes do Exportar)
      actions.insertBefore(dupBtn, actions.firstChild);
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
  const addDrawnNumber = async (number) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    if (currentRoundData.isCompleted) {
      showToast("Rodada concluída. Desmarque para alterar.");
      return;
    }
    if (!currentRoundData.drawnNumbers) currentRoundData.drawnNumbers = [];
    if (number < 1 || number > appState.maxNumber || isNaN(number)) {
      await showDialog({ title: "Número Inválido", message: `Digite um número entre 01 e ${appState.maxNumber.toString().padStart(2, '0')}` });
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
  const undoLastDrawnNumber = async () => {
    const currentRoundData = appState.rounds[appState.currentRound];
    if (currentRoundData.isCompleted) {
      showToast("Rodada concluída. Desmarque para alterar.");
      return;
    }
    if (currentRoundData && currentRoundData.drawnNumbers && currentRoundData.drawnNumbers.length > 0) {
      const ok = await showDialog({ title: "Desfazer", message: "Tem certeza que deseja desfazer o último número sorteado?", type: "confirm" });
      if (ok) {
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
    drawRandomButton.disabled = true;
    setTimeout(() => updateUI(false, 'none'), 1000);
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
    updateUI(false, 'none'); // Apenas atualiza a interface local sem disparar sync
  };

  /**
   * Abre o gerenciador de sessões e renderiza a lista.
   */
  const openEventsMgr = () => {
    const user = firebase.auth().currentUser;
    if (user) syncRegistryWithFirebase(user.uid);
    else renderEventsList();
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

  // Listener para troca de rodada via seletor
  roundSelector.addEventListener('change', (e) => {
    appState.currentRound = parseInt(e.target.value);
    updateUI(true, 'session');
  });

  // Marca ou desmarca a rodada como concluída
  roundCompletedCheckbox.addEventListener('change', (e) => {
    const currentRoundData = appState.rounds[appState.currentRound];
    currentRoundData.isCompleted = e.target.checked;
    updateUI(true, 'session');

    // Bloqueia o toggle por 1 segundo para evitar alterações rápidas
    roundCompletedCheckbox.disabled = true;
    setTimeout(() => { roundCompletedCheckbox.disabled = false; }, 1000);
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

  /**
   * Navega entre as sessões do evento no painel principal.
   * @param {number} direction - -1 para anterior, 1 para próxima.
   */
  const navigateSessionMain = (direction) => {
    const currentPos = eventData.displayOrder.indexOf(eventData.activeSessionIndex);
    const nextPos = currentPos + direction;

    if (nextPos >= 0 && nextPos < eventData.displayOrder.length) {
      eventData.activeSessionIndex = eventData.displayOrder[nextPos];
      appState = eventData.sessions[eventData.activeSessionIndex];
      updateUI(true, 'full');

      // Bloqueia a navegação de sessão por 1 segundo
      if (prevSessionMainButton) prevSessionMainButton.disabled = true;
      if (nextSessionMainButton) nextSessionMainButton.disabled = true;
      setTimeout(() => updateUI(false, 'none'), 1000);
    }
  };

  if (prevSessionMainButton) prevSessionMainButton.addEventListener('click', () => navigateSessionMain(-1));
  if (nextSessionMainButton) nextSessionMainButton.addEventListener('click', () => navigateSessionMain(1));

  /**
   * Navega entre as rodadas da sessão atual no painel principal.
   * @param {number} direction - -1 para anterior, 1 para próxima.
   */
  const navigateRoundMain = (direction) => {
    if (!appState) return;
    const nextRound = appState.currentRound + direction;
    if (nextRound >= 1 && nextRound <= appState.numRounds) {
      appState.currentRound = nextRound;
      updateUI(true, 'session');

      // Bloqueia a navegação de rodada por 1 segundo
      if (prevRoundMainButton) prevRoundMainButton.disabled = true;
      if (nextRoundMainButton) nextRoundMainButton.disabled = true;
      setTimeout(() => updateUI(false, 'none'), 1000);
    }
  };

  if (prevRoundMainButton) prevRoundMainButton.addEventListener('click', () => navigateRoundMain(-1));
  if (nextRoundMainButton) nextRoundMainButton.addEventListener('click', () => navigateRoundMain(1));

  // Desfaz o último número sorteado
  undoLastButton.addEventListener('click', undoLastDrawnNumber);

  // Alterna entre ordem de sorteio e ordem crescente na exibição
  toggleSortButton.addEventListener('click', () => {
    appState.isSortedAscending = !appState.isSortedAscending;
    updateUI(true, 'session');
  });

  // Sorteia um número aleatório (disponível no modo sorteio)
  drawRandomButton.addEventListener('click', drawRandomNumber);

  // Clique em qualquer bola para aumentar o tamanho
  drawnNumbersList.addEventListener('click', (e) => {
    if (e.target.classList.contains('drawn-number-item')) {
      cycleBallZoom();
    }
  });

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
    const currentPos = eventData.displayOrder.indexOf(currentIndex);
    if (currentPos === -1) return;
    
    const nextPos = currentPos + direction;
    if (nextPos < 0 || nextPos >= eventData.displayOrder.length) return;

    // Troca de posição apenas na lista de ordem, não nos dados
    const temp = eventData.displayOrder[currentPos];
    eventData.displayOrder[currentPos] = eventData.displayOrder[nextPos];
    eventData.displayOrder[nextPos] = temp;

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

  // Abre o diálogo para renomear o ID do evento manualmente
  regenerateIdButton.addEventListener('click', async () => {
    const newIdRaw = await showDialog({
      title: "Renomear Código",
      message: "Digite o novo código para este evento (apenas letras e números):",
      type: "prompt",
      defaultValue: eventData.eventid
    });

    if (!newIdRaw) return;
    const newId = newIdRaw.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    
    if (newId && newId !== eventData.eventid) {
      const confirmReplace = await showDialog({
        title: "Confirmar Alteração",
        message: `Deseja substituir o código "${eventData.eventid}" por "${newId}"?\n\nO código antigo deixará de existir no servidor.`,
        type: "confirm"
      });

      if (confirmReplace) {
        await processIdChange(newId, eventData.eventid, '1');
      }
    } else if (newId === eventData.eventid) {
      showToast("O novo código é igual ao atual.");
    }
  });

  // Copia o link de visualização para a área de transferência
  copyLinkButton.addEventListener('click', () => {
    copyLinkButton.disabled = true; // Bloqueia o botão
    const shareLink = document.getElementById('config-share-link');
    navigator.clipboard.writeText(shareLink.href)
      .then(() => showToast("Link copiado com sucesso!"))
      .catch(() => showToast("Erro ao copiar link."))
      .finally(() => setTimeout(() => { copyLinkButton.disabled = false; }, 1000)); // Reabilita após 1 segundo
  });



  /**
   * Gera o QR Code para o link de visualização e abre o modal correspondente.
   */
  const openQrModal = () => {
    const shareLink = document.getElementById('config-share-link');

    qrcodeLarge.innerHTML = ""; // Limpa QR anterior
    new QRCode(qrcodeLarge, {
      text: shareLink.href,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    qrModal.classList.remove('hidden');
    qrLinkDisplay.textContent = shareLink.href;
    qrLinkDisplay.href = shareLink.href;
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
      copyQrLinkButton.disabled = true; // Bloqueia o botão
      const url = qrLinkDisplay.textContent;
      navigator.clipboard.writeText(url)
        .then(() => showToast("Link copiado com sucesso!"))
        .catch(() => showToast("Erro ao copiar link."))
        .finally(() => setTimeout(() => { copyQrLinkButton.disabled = false; }, 1000)); // Reabilita após 1 segundo
    });
  }


  // --- Event Listeners do Gerenciador de Sessões ---
  if (eventsMgrButton) eventsMgrButton.addEventListener('click', openEventsMgr); // Abre o gerenciador de eventos
  if (closeEventsMgrX) closeEventsMgrX.addEventListener('click', closeEventsMgr); // Fecha o gerenciador de eventos (X)
  if (closeEventsMgrButton) closeEventsMgrButton.addEventListener('click', closeEventsMgr); // Fecha o gerenciador de eventos (botão)
  if (mgrForceSyncButton) mgrForceSyncButton.addEventListener('click', () => {
    const user = firebase.auth().currentUser;
    if (!navigator.onLine) return showToast("Você está offline.");
    if (!user) return showToast("Faça login para sincronizar com a nuvem.");

    showToast("Iniciando sincronização...");
    syncRegistryWithFirebase(user.uid);
  });

  if (mgrNewEventButton) {
    mgrNewEventButton.addEventListener('click', async () => {
      const ok = await showDialog({
        title: "Novo Evento",
        message: "Isso criará um Evento totalmente novo com um novo Código ID. Deseja continuar?",
        type: "confirm"
      });
      if (!ok) return;

      const defaultEventName = "Nome do Evento de Bingo";
      const defaultSessionName = "Nome da Sessão";
      
      eventData.eventid = generateRandomId();
      eventData.eventName = defaultEventName;
      eventData.eventIcon = "default-icon.png";
      eventData.sessions = [createDefaultSessionState(defaultSessionName)];
      eventData.displayOrder = [0];
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
  newSessionButton.addEventListener('click', async () => {
    const name = await showDialog({ title: "Nova Sessão", message: "Digite o nome da sessão:", type: "prompt" });
    if (name && name.trim() !== "") {
      if (eventData.sessions.some(s => s.sessionName === name)) {
        showToast("Já existe uma sessão com este nome.");
        return;
      }
      eventData.sessions.push(createDefaultSessionState(name));
      eventData.displayOrder.push(eventData.sessions.length - 1);
      eventData.activeSessionIndex = eventData.sessions.length - 1;
      appState = eventData.sessions[eventData.activeSessionIndex];
      updateUI(true, 'full');
    }
  });

  // Listener para Renomear a Sessão Selecionada via botão
  if (renameSessionButton) {
    renameSessionButton.addEventListener('click', async () => {
      const oldName = appState.sessionName;
      const newName = await showDialog({
        title: "Renomear",
        message: "Novo nome para a sessão:",
        type: "prompt",
        defaultValue: oldName
      });

      if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
        const cleanName = newName.trim();
        if (eventData.sessions.some(s => s.sessionName === cleanName)) {
          showToast("Já existe uma sessão com este nome.");
          return;
        }

        const sessionIdx = eventData.activeSessionIndex;
        eventData.sessions[sessionIdx].sessionName = cleanName;
      eventData.sessions[sessionIdx].lastModified = Date.now();
        appState = eventData.sessions[sessionIdx];
        appState.sessionName = cleanName; // Update sessionName
        updateUI(true, 'full');
      }
    });
  }

  // Exclui a sessão ativa atual
  deleteSessionButton.addEventListener('click', async () => {
    const currentName = appState.sessionName;

    if (eventData.sessions.length <= 1) {
      const ok = await showDialog({
        title: "Resetar Sessão",
        message: "Esta é a única sessão existente. Deseja resetá-la para o estado inicial?",
        type: "confirm"
      });
      if (ok) {
        const defaultName = "Sessão Padrão";
        eventData.sessions = [createDefaultSessionState(defaultName)];
        eventData.displayOrder = [0];
        eventData.activeSessionIndex = 0;
        appState = eventData.sessions[0];
        updateUI(true, 'full');
      }
      return;
    }

    const ok = await showDialog({
      title: "Excluir Sessão",
      message: `Tem certeza que deseja excluir a sessão "${currentName}"?`,
      type: "confirm"
    });
    if (ok) {
      const idxToRemove = eventData.activeSessionIndex;
      eventData.sessions.splice(idxToRemove, 1);
      
      // Ajusta a ordem de exibição removendo o índice e decrementando os superiores
      eventData.displayOrder = eventData.displayOrder
        .filter(i => i !== idxToRemove)
        .map(i => i > idxToRemove ? i - 1 : i);

      eventData.activeSessionIndex = 0;
      appState = eventData.sessions[0];
      updateUI(true, 'full');
    }
  });

  // Listener para o Nome do Evento (Título Geral)
  if (configEventTitle) {
    configEventTitle.addEventListener('input', (e) => {
      eventData.eventName = e.target.value;
      updateUI(false, 'none'); // Atualiza o título no header localmente, sem sync
    });
    configEventTitle.addEventListener('change', (e) => {
      updateUI(true, 'full'); // Sincroniza com o servidor quando o usuário termina a edição
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
  configNumRounds.addEventListener('change', async (e) => {
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
      const ok = await showDialog({
        title: "Reduzir Rodadas",
        message: `Tem certeza que deseja reduzir o número de rodadas para ${newNumRounds}? Dados das rodadas ${newNumRounds + 1} em diante serão perdidos.`,
        type: "confirm"
      });
      if (ok) {
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
    appState.lastModified = Date.now();
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
    appState.lastModified = Date.now();
    saveState(true, 'session');
  });

  // Altera entre modo de sorteio manual (input) ou automático (botão)
  configDrawMode.addEventListener('change', (e) => {
    appState.drawMode = e.target.value;
    appState.lastModified = Date.now();
    updateUI(true, 'session');
  });

  // Dispara o seletor de arquivo ao clicar na prévia do ícone
  configIconPreview.addEventListener('click', () => {
    configIconUpload.click();
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

  // Exporta o evento atual (botão no modal de configurações)
  exportSessionButton.addEventListener('click', () => {
    if (!eventData || !eventData.sessions.length) {
      showToast("Nenhum dado para exportar.");
      return;
    }
    exportEventById(eventData.eventid, exportSessionButton);
  });

  // Gatilhos de Importação no Gerenciador
  if (mgrImportCodeButton) {
    mgrImportCodeButton.addEventListener('click', async () => {
      const code = await showDialog({ title: "Importar Código", message: "Digite o código ID do evento:", type: "prompt" });
      if (code && code.trim() !== "") {
        duplicateEventById(code.trim().toUpperCase(), mgrImportCodeButton);
      }
    });
  }

  if (mgrImportEventButton) mgrImportEventButton.addEventListener('click', () => mgrImportEventInput.click());

  if (mgrImportEventInput) mgrImportEventInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);

          // Caso 1: Importação de Evento Completo (Novo formato)
          if (imported && imported.sessions && Array.isArray(imported.sessions)) {
            const ok = await showDialog({
              title: "Importar Evento",
              message: "Deseja importar este evento? Ele será salvo como um novo código ID na sua conta.",
              type: "confirm"
            });
            if (ok) {
              const user = firebase.auth().currentUser;
              if (!user) {
                showToast("Você precisa estar logado para importar eventos.");
                return;
              }
              const newId = generateRandomId();

              // Constrói eventData no formato legível interno a partir do JSON importado
              eventData = {
                eventid: newId,
                eventName: imported.eventName || "Evento Importado",
                eventIcon: imported.eventIcon || "default-icon.png",
                ownerUid: user.uid, // O importador assume como novo dono
                activeSessionIndex: 0,
                hasActiveEvent: true,
                lastModified: Date.now(),
                displayOrder: imported.sessions.map((_, i) => i),
                sessions: imported.sessions.map(s => {
                  const newSession = {
                    sessionName: s.sessionName,
                    maxNumber: s.maxNumber,
                    numRounds: s.numRounds,
                    currentRound: s.currentRound,
                    drawMode: s.drawMode,
                    isSortedAscending: s.isSortedAscending,
                    lastModified: Date.now(),
                    rounds: {}
                  };
                  Object.keys(s.rounds || {}).forEach(rId => {
                    const r = s.rounds[rId];
                    newSession.rounds[rId] = {
                      prize: r.prize,
                      pattern: r.pattern,
                      patternIndex: r.patternIndex,
                      isCompleted: r.isCompleted,
                      drawnNumbers: r.drawnNumbers || []
                    };
                  });
                  return newSession;
                })
              };

              appState = eventData.sessions[0];
              updateUI(true, 'full');
              showToast(`Evento importado! Novo código gerado: ${newId}`);
              closeEventsMgr(); // Fecha o gerenciador após a importação
            }
          }
          // Caso 2: Importação de Sessão Única (Legado ou exportação parcial)
          else if (imported && (imported.eventName || imported.sessionName) && imported.rounds) {
            // Ajuste de compatibilidade para o ícone
            if (Array.isArray(imported.eventIcon)) imported.eventIcon = imported.eventIcon.join('');

            // Limpa metadados de nível de evento do objeto importado para não sujar a sessão
            delete imported.eventid;
            delete imported.ownerUid;
            delete imported.lastModified;

            imported.sessionName = imported.sessionName || imported.eventName;
            eventData.sessions.push(imported);
            eventData.displayOrder.push(eventData.sessions.length - 1);
            eventData.activeSessionIndex = eventData.sessions.length - 1;
            appState = eventData.sessions[eventData.activeSessionIndex];
            updateUI(true, 'full');
            showToast("Sessão adicionada ao evento atual!");
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
      sessions: (eventData.sessions || []).filter(s => s !== null).map(s => s.sessionName || "Sessão")
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
    if (syncLevel !== 'none') syncToFirebase(immediate, syncLevel);
  };

  // --- Inicialização ---
  loadState(); // Carrega o estado salvo ao iniciar
  startAnimationLoop();
});
