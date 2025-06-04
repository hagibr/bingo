document.addEventListener('DOMContentLoaded', () => {
  const numeroSorteadoInput = document.getElementById('numeroSorteado');
  const sortearBtn = document.getElementById('sortearBtn');
  const desfazerBtn = document.getElementById('desfazerBtn');
  const bingoTableBody = document.getElementById('bingoTableBody');
  const numerosSorteadosLista = document.getElementById('numerosSorteadosLista');
  const contadorNumerosSorteados = document.getElementById('contadorNumerosSorteados');

  const serieNameInput = document.getElementById('serieName');
  const newSerieBtn = document.getElementById('newSerieBtn');
  const savedSeriesSelect = document.getElementById('savedSeriesSelect');
  const deleteCurrentSerieBtn = document.getElementById('deleteCurrentSerieBtn');
  const deleteAllSeriesBtn = document.getElementById('deleteAllSeriesBtn');

  const exportSeriesBtn = document.getElementById('exportSeriesBtn');
  const importSeriesBtn = document.getElementById('importSeriesBtn');
  const importFile = document.getElementById('importFile');

  // Elemento para o tema removido

  const sidebar = document.getElementById('sidebar');
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const content = document.querySelector('.content');
  const pageTitle = document.getElementById('pageTitle');
  const headTitle = document.getElementById('headTitle');

  let numerosSorteados = [];
  const letrasBingo = ['B', 'I', 'N', 'G', 'O'];
  let hasDrawnNumbers = false;
  let currentSerieName = '';

  const SERIES_KEY = 'bingo_saved_series';
  const SERIE_DATA_PREFIX = 'bingo_serie_';
  // Chave para o tema removida

  // --- Funções Auxiliares ---
  function formatNumberTwoDigits(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function generateBingoTable() {
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
        numeroSpan.textContent = formatNumberTwoDigits(numero);
        numeroSpan.classList.add('bingo-number-circle'); // Adiciona uma classe para estilização
        cell.appendChild(numeroSpan);

        cell.dataset.numeroOriginal = numero; // Mantém o dataset para identificação
        cell.addEventListener('click', () => {
          if (!currentSerieName) {
            alert('Por favor, defina um nome para esta série de bingo antes de sortear o primeiro número.');
            serieNameInput.focus();
            openSidebar();
            return;
          }

          if (numerosSorteados.includes(numero)) {
            alert(`O número ${formatNumberTwoDigits(numero)} já foi sorteado.`);
            return;
          }

          if (!confirm(`Confirmar sorteio do número ${formatNumberTwoDigits(numero)}?`)) {
            return;
          }

          highlightNumber(numero);
          numerosSorteados.push(numero);
          updateDrawnList();
          numeroSorteadoInput.value = '';
          numeroSorteadoInput.focus();
        });
        row.appendChild(cell);
      }
      bingoTableBody.appendChild(row);
    }
  }

  function highlightNumber(numero) {
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

  function removeHighlightNumber(numero) {
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

  function updateDrawnList() {
    const numerosEmOrdemInversa = [...numerosSorteados].reverse();
    const numerosParaExibirFormatados = numerosEmOrdemInversa.map(num => formatNumberTwoDigits(num));

    numerosSorteadosLista.value = numerosParaExibirFormatados.join(' - ');
    contadorNumerosSorteados.textContent = `(${numerosSorteados.length})`;

    hasDrawnNumbers = numerosSorteados.length > 0;

    saveCurrentSerie();
    // Atualiza o destaque do último número SEMPRE que a lista muda
    updateLastDrawnStyle(); // CHAME AQUI!
  }

  function updatePageTitle() {
    if (currentSerieName) {
      pageTitle.textContent = `Bingo - Série ${currentSerieName}`;
      headTitle.textContent = `Bingo - Série ${currentSerieName}`;
    } else {
      pageTitle.textContent = 'Bingo - Sem Série';
      headTitle.textContent = 'Bingo - Sem Série';
    }
  }

  // --- Funções de Gerenciamento de Sessão (localStorage) ---
  function saveCurrentSerie() {
    if (!currentSerieName) {
      updateSavedSeriesList();
      return;
    }

    const serieData = {
      numbers: numerosSorteados,
      timestamp: new Date().toLocaleString()
    };
    localStorage.setItem(SERIE_DATA_PREFIX + currentSerieName, JSON.stringify(serieData));

    let savedSeries = JSON.parse(localStorage.getItem(SERIES_KEY) || '[]');
    savedSeries = [...new Set(savedSeries)];
    if (!savedSeries.includes(currentSerieName)) {
      savedSeries.push(currentSerieName);
      localStorage.setItem(SERIES_KEY, JSON.stringify(savedSeries));
    }
    updateSavedSeriesList();
  }

  function loadSerie(serieName) {
    const serieData = JSON.parse(localStorage.getItem(SERIE_DATA_PREFIX + serieName));
    if (serieData) {
      numerosSorteados.forEach(num => removeHighlightNumber(num));

      numerosSorteados = serieData.numbers;
      currentSerieName = serieName;
      serieNameInput.value = '';

      numerosSorteados.forEach(num => highlightNumber(num));
      updateDrawnList();
      updatePageTitle();
      //alert(`Série "${serieName}" carregada com sucesso!`);
      closeSidebar();
    } else {
      alert(`Erro: Série "${serieName}" não encontrada.`);
    }
  }

  function updateSavedSeriesList() {
    let savedSeries = JSON.parse(localStorage.getItem(SERIES_KEY) || '[]');
    savedSeries = [...new Set(savedSeries)];

    savedSeriesSelect.innerHTML = '<option value="">-- Selecione uma série --</option>';
    savedSeries.forEach(serie => {
      const option = document.createElement('option');
      option.value = serie;
      option.textContent = serie;
      savedSeriesSelect.appendChild(option);
    });
    if (currentSerieName) {
      savedSeriesSelect.value = currentSerieName;
    }
  }

  function startNewSerie() {
    const newName = serieNameInput.value.trim();
    if (newName && newName !== currentSerieName) {
      numerosSorteados.forEach(num => removeHighlightNumber(num));
      numerosSorteados = [];
      currentSerieName = newName;
      serieNameInput.value = '';
      saveCurrentSerie();
      updateDrawnList();
      updatePageTitle();
      updateSavedSeriesList();
      alert('Nova série iniciada.');
      serieNameInput.focus();
      openSidebar();
    }
  }

  function deleteCurrentSerie() {
    if (!currentSerieName) {
      alert('Não há uma série atual para apagar.');
      return;
    }

    if (confirm(`Tem certeza que deseja APAGAR a série "${currentSerieName}" do histórico? Esta ação é irreversível.`)) {
      localStorage.removeItem(SERIE_DATA_PREFIX + currentSerieName);

      let savedSeries = JSON.parse(localStorage.getItem(SERIES_KEY) || '[]');
      savedSeries = savedSeries.filter(name => name !== currentSerieName);
      localStorage.setItem(SERIES_KEY, JSON.stringify(savedSeries));

      numerosSorteados.forEach(num => removeHighlightNumber(num));
      numerosSorteados = [];
      erasedSerieName = currentSerieName;
      currentSerieName = '';
      serieNameInput.value = '';
      updateDrawnList();
      updatePageTitle();
      updateSavedSeriesList();
      alert(`Série "${erasedSerieName}" apagada com sucesso.`);
      //closeSidebar();
    }
  }

  function deleteAllSavedSeries() {
    if (confirm('ATENÇÃO: Tem certeza que deseja APAGAR TODAS as séries salvas? Esta ação é irreversível.')) {
      localStorage.clear();
      numerosSorteados.forEach(num => removeHighlightNumber(num));
      numerosSorteados = [];
      currentSerieName = '';
      serieNameInput.value = '';
      updateDrawnList();
      updatePageTitle();
      updateSavedSeriesList();
      alert('Todas as séries salvas foram apagadas.');
      closeSidebar();
    }
  }

  // --- Funções de Exportar/Importar ---
  function exportAllSeries() {
    let allData = {};
    const savedSeries = JSON.parse(localStorage.getItem(SERIES_KEY) || '[]');

    savedSeries.forEach(serieName => {
      const serieData = localStorage.getItem(SERIE_DATA_PREFIX + serieName);
      if (serieData) {
        allData[serieName] = JSON.parse(serieData);
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
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);

        if (!confirm('Ao importar, as séries existentes com o mesmo nome serão sobrescritas. Tem certeza que deseja continuar?')) {
          importFile.value = '';
          return;
        }

        let seriesAdded = 0;
        let seriesOverwritten = 0;
        let invalidData = 0;

        let savedSeries = JSON.parse(localStorage.getItem(SERIES_KEY) || '[]');
        savedSeries = [...new Set(savedSeries)];

        for (const serieName in importedData) {
          if (importedData.hasOwnProperty(serieName)) {
            const serieData = importedData[serieName];
            if (serieData && Array.isArray(serieData.numbers)) {
              const localStorageKey = SERIE_DATA_PREFIX + serieName;
              if (localStorage.getItem(localStorageKey)) {
                seriesOverwritten++;
              } else {
                seriesAdded++;
              }
              localStorage.setItem(localStorageKey, JSON.stringify(serieData));

              if (!savedSeries.includes(serieName)) {
                savedSeries.push(serieName);
              }
            } else {
              invalidData++;
              console.warn(`Dados inválidos para a série: ${serieName}`);
            }
          }
        }
        localStorage.setItem(SERIES_KEY, JSON.stringify(savedSeries));

        numerosSorteados.forEach(num => removeHighlightNumber(num));
        numerosSorteados = [];
        currentSerieName = '';
        serieNameInput.value = '';
        updateDrawnList();
        updatePageTitle();

        let importMessage = `Importação concluída!\n`;
        if (seriesAdded > 0) importMessage += `- ${seriesAdded} séries adicionadas.\n`;
        if (seriesOverwritten > 0) importMessage += `- ${seriesOverwritten} séries sobrescritas.\n`;
        if (invalidData > 0) importMessage += `- ${invalidData} entradas ignoradas devido a dados inválidos.\n`;
        if (seriesAdded === 0 && seriesOverwritten === 0 && invalidData === 0) {
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

  // --- Event Listeners ---
  sortearBtn.addEventListener('click', () => {
    if (!currentSerieName) {
      alert('Por favor, defina um nome para esta série de bingo antes de sortear o primeiro número.');
      serieNameInput.focus();
      openSidebar();
      return;
    }

    const numero = parseInt(numeroSorteadoInput.value);

    if (isNaN(numero) || numero < 1 || numero > 75) {
      alert('Por favor, insira um número válido entre 1 e 75.');
      return;
    }

    if (numerosSorteados.includes(numero)) {
      alert(`O número ${formatNumberTwoDigits(numero)} já foi sorteado.`);
      return;
    }

    if (!confirm(`Confirmar sorteio do número ${formatNumberTwoDigits(numero)}?`)) {
      return;
    }

    highlightNumber(numero);
    numerosSorteados.push(numero);
    updateDrawnList();
    numeroSorteadoInput.value = '';
    numeroSorteadoInput.focus();
  });

  desfazerBtn.addEventListener('click', () => {
    if (numerosSorteados.length === 0) {
      alert('Não há jogada para desfazer.');
      return;
    }

    const numeroADesfazer = numerosSorteados[numerosSorteados.length - 1];

    if (confirm(`Tem certeza que deseja desfazer a jogada do número ${formatNumberTwoDigits(numeroADesfazer)}?`)) {
      removeHighlightNumber(numeroADesfazer);
      numerosSorteados.pop();
      updateDrawnList();
    }
  });

  numeroSorteadoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sortearBtn.click();
    }
  });

  newSerieBtn.addEventListener('click', startNewSerie);
  deleteCurrentSerieBtn.addEventListener('click', deleteCurrentSerie);
  deleteAllSeriesBtn.addEventListener('click', deleteAllSavedSeries);

  savedSeriesSelect.addEventListener('change', () => {
    const selectedSerie = savedSeriesSelect.value;
    if (selectedSerie) {
      loadSerie(selectedSerie);
    }
  });

  openSidebarBtn.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);

  exportSeriesBtn.addEventListener('click', exportAllSeries);
  importSeriesBtn.addEventListener('click', () => {
    importFile.click();
  });
  importFile.addEventListener('change', handleImportFile);

  // Event listener para o botão de tema removido

  // --- Inicialização ---
  generateBingoTable();
  updateSavedSeriesList();
  updateDrawnList();
  updatePageTitle();

});