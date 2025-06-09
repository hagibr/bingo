document.addEventListener('DOMContentLoaded', () => {
  const desfazerBtn = document.getElementById('desfazerBtn');
  const bingoTableBody = document.getElementById('bingoTableBody');
  const numerosSorteadosLista = document.getElementById('numerosSorteadosLista');
  const contadorNumerosSorteados = document.getElementById('contadorNumerosSorteados');
  const contadorNumerosRestantes = document.getElementById('contadorNumerosRestantes');
  

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
  
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const githubPagesDomain = '.github.io'; // O sufixo comum para domínios do GitHub Pages

  let isGitHubPages = false;
  let githubRepoUrl = '';

  // Verifica se o hostname termina com '.github.io'
  if (hostname.endsWith(githubPagesDomain)) {
    isGitHubPages = true;

    // URL de projeto (e.g., hagibr.github.io/meu-projeto)
    if (pathname.length > 1) { // Verifica se há algo além de '/' no caminho
      const repoName = pathname.split('/')[1]; // Pega a primeira parte após a barra inicial
      const usernameOrOrg = hostname.substring(0, hostname.indexOf(githubPagesDomain));
      githubRepoUrl = `https://github.com/${usernameOrOrg}/${repoName}`;
    }
  }

  // Se estiver no GitHub Pages e tivermos a URL do repositório
  if (isGitHubPages && githubRepoUrl) {
    const githubLinkContainer = document.getElementById('github-repo-link-container'); // Um elemento HTML onde você quer adicionar o link

    if (githubLinkContainer) {
      const link = document.createElement('a');
      link.href = githubRepoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // *** CÓDIGO SVG INLINE AQUI ***
      // Crie um elemento div temporário para "parsear" a string SVG em elementos DOM
      const svgContainer = document.createElement('div');
      // Cole o código SVG do GitHub dentro das crases (template literal)
      svgContainer.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="1em" height="1em" fill="currentColor">
                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-2.4-5.6-5.7 0-2.9 2.3-5.2 5.6-5.2 3 0 5.2 2.3 5.2 5.2zm-3.3 40.7c-.3 2.7-3 4.9-6.3 4.9-3.6 0-5.9-2.2-6.2-4.9-.3-2.9 2.4-5.2 5.2-5.2 3.5.2 6.2 2.4 6.3 5.2zm-33.3 22.1c-.5 2.7-3.2 4.9-6.6 4.9-3.6 0-6.3-2.2-6.6-4.9-.3-2.9 2.4-5.2 5.2-5.2 3.6.3 6.4 2.5 6.6 5.2zm-30.8-37.3c-1.1 2.7-3.9 4.9-7.2 4.9-3.9 0-6.9-2.2-7.1-5.2-.5-2.9 2.2-5.5 5.2-5.5 3.1.3 5.9 2.5 6.4 5.5zm-33.1 33.1c-.6 2.7-4.1 4.9-7.6 4.9-4.2 0-7.1-2.2-7.5-5.2-.3-2.9 2.5-5.5 5.5-5.5 3.3.3 6.4 2.5 7 5.5zM388.6 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-2.4-5.6-5.7 0-2.9 2.3-5.2 5.6-5.2 3 0 5.2 2.3 5.2 5.2zm-3.3 40.7c-.3 2.7-3 4.9-6.3 4.9-3.6 0-5.9-2.2-6.2-4.9-.3-2.9 2.4-5.2 5.2-5.2 3.5.2 6.2 2.4 6.3 5.2zm-33.3 22.1c-.5 2.7-3.2 4.9-6.6 4.9-3.6 0-6.3-2.2-6.6-4.9-.3-2.9 2.4-5.2 5.2-5.2 3.6.3 6.4 2.5 6.6 5.2zm-30.8-37.3c-1.1 2.7-3.9 4.9-7.2 4.9-3.9 0-6.9-2.2-7.1-5.2-.5-2.9 2.2-5.5 5.2-5.5 3.1.3 5.9 2.5 6.4 5.5zm-33.1 33.1c-.6 2.7-4.1 4.9-7.6 4.9-4.2 0-7.1-2.2-7.5-5.2-.3-2.9 2.5-5.5 5.5-5.5 3.3.3 6.4 2.5 7 5.5zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.8 496 252 496 113.3 389.9 8 251.2 8h-6.4z"/>
                </svg>
            `;
      const svgElement = svgContainer.querySelector('svg'); // Pega o elemento SVG real

      // Opcional: Adicionar estilos diretamente ao SVG para tamanho e cor
      svgElement.style.width = '1em'; // Para que ele se ajuste ao tamanho da fonte do texto
      svgElement.style.height = '1em';
      svgElement.style.marginRight = '8px';
      svgElement.style.verticalAlign = 'middle'; // Para alinhar melhor com o texto
      svgElement.style.fill = 'currentColor'; // Faz com que o SVG herde a cor do texto do link

      // Criar o elemento de texto
      const textSpan = document.createElement('span');
      textSpan.textContent = 'Ver no GitHub';

      // Adicionar o ícone SVG e o texto ao link
      link.appendChild(svgElement);
      link.appendChild(textSpan);

      // Estilização básica (continua como antes)
      link.style.display = 'inline-flex';
      link.style.alignItems = 'center';
      link.style.marginTop = '20px';
      link.style.padding = '10px 15px';
      link.style.backgroundColor = '#212529';
      link.style.color = 'white';
      link.style.textDecoration = 'none';
      link.style.borderRadius = '5px';
      link.style.textAlign = 'center';
      link.style.fontSize = '1em';

      githubLinkContainer.appendChild(link);
    } else {
      console.warn("Elemento com ID 'github-repo-link-container' não encontrado.");
    }
  }

  // --- Funções Auxiliares ---
  function formatNumberTwoDigits(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function generateBingoTable() {
    bingoTableBody.innerHTML = '';
    // 5 rows
    for (let i = 0; i < 5; i++) {
      const row = document.createElement('tr');
      const letterCell = document.createElement('td');
      // One of the letters B-I-N-G-O at the beginning of the row
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
          // Ignora ação quando já sorteou este número
          if(numerosSorteados.includes(numero))
          {
            return;
          }
                  
          if (!currentSerieName) {
            alert('Por favor, defina um nome para esta série de bingo antes de sortear o primeiro número.');
            serieNameInput.focus();
            openSidebar();
            return;
          }

          //if (!confirm(`Confirmar sorteio do número ${formatNumberTwoDigits(numero)}?`)) {
          //  return;
          //}

          highlightNumber(numero);
          numerosSorteados.push(numero);
          updateDrawnList();
        });
        row.appendChild(cell);
      }
      // One of the letters B-I-N-G-O at the end of the row
      const letterCell2 = document.createElement('td');
      letterCell2.textContent = letrasBingo[i];
      letterCell2.classList.add('bingo-letter');
      row.appendChild(letterCell2);
      
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
    contadorNumerosRestantes.textContent = `(${75-numerosSorteados.length})`;
    

    hasDrawnNumbers = numerosSorteados.length > 0;

    saveCurrentSerie();
    // Atualiza o destaque do último número SEMPRE que a lista muda
    updateLastDrawnStyle(); // CHAME AQUI!
  }

  function updatePageTitle() {
    if (currentSerieName) {
      pageTitle.textContent = `Bingo - ${currentSerieName}`;
      headTitle.textContent = `Bingo - ${currentSerieName}`;
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

    if (!currentSerieName) {
      savedSeriesSelect.innerHTML = '<option value="">-- Crie uma série --</option>';
    }
    else {
      savedSeriesSelect.innerHTML = '';
    }
    
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