document.addEventListener('DOMContentLoaded', () => {
    const bingoGrid = document.getElementById('bingoGrid');
    const largeLastDrawnNumber = document.getElementById('largeLastDrawnNumber');
    const drawnNumbersDisplay = document.getElementById('drawnNumbersDisplay');
    const undoButton = document.getElementById('undoButton');
    const bingoTitle = document.getElementById('bingoTitle');

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const seriesListDiv = document.getElementById('seriesList');
    const newSeriesButton = document.getElementById('newSeriesButton');
    const importSeriesButton = document.getElementById('importSeriesButton');
    const exportSeriesButton = document.getElementById('exportSeriesButton');
    const importFileInput = document.getElementById('importFileInput');
    const deleteCurrentSeriesButton = document.getElementById('deleteCurrentSeriesButton');
    const deleteAllSeriesButton = document.getElementById('deleteAllSeriesButton');
    const mainContainer = document.querySelector('.container'); // Get the main container


    let currentSeries = null; // Stores the currently active series object
    let allSeries = loadSeriesFromLocalStorage(); // All series stored locally

    // --- Bingo Game Logic ---

    // Function to initialize or reset the bingo grid
    function initializeBingoGrid() {
        bingoGrid.innerHTML = ''; // Clear existing grid

        const letters = ['B', 'I', 'N', 'G', 'O'];

        // Create number rows (5 rows, 16 columns including the letter column)
        for (let row = 0; row < 5; row++) {
            const tr = bingoGrid.insertRow();
            // First cell for the letter
            const letterCell = tr.insertCell();
            letterCell.textContent = letters[row];
            letterCell.classList.add('bingo-letter-header'); // Add a class for styling if needed

            // Populate numbers for each column
            for (let col = 0; col < 15; col++) { // 15 numbers per letter, 75 total
                const cell = tr.insertCell();
                const number = (row * 15) + col + 1; // Distributes numbers 1-75 across 15 columns, 5 rows

                if (number >= 1 && number <= 75) {
                    cell.textContent = String(number).padStart(2, '0'); // Format to 2 digits
                    cell.dataset.number = number; // Store number in data attribute
                    cell.addEventListener('click', () => confirmAndDrawNumber(number));
                }
            }
        }
        updateGridDisplay();
    }

    // Update the visual state of the grid based on drawn numbers
    function updateGridDisplay() {
        const allCells = bingoGrid.querySelectorAll('td[data-number]');
        allCells.forEach(cell => {
            const num = parseInt(cell.dataset.number);
            cell.classList.remove('drawn', 'last-drawn');
            if (currentSeries && currentSeries.drawnNumbers.includes(num)) {
                cell.classList.add('drawn');
                if (num === currentSeries.lastDrawnNumber) {
                    cell.classList.add('last-drawn');
                }
            }
        });
        updateLastDrawnDisplay();
        updateDrawnNumbersList();
    }

    // Update the large display of the last drawn number
    function updateLastDrawnDisplay() {
        largeLastDrawnNumber.textContent = currentSeries && currentSeries.lastDrawnNumber !== null ? String(currentSeries.lastDrawnNumber).padStart(2, '0') : '--';
    }

    // Update the list of drawn numbers
    function updateDrawnNumbersList() {
        if (currentSeries) {
            drawnNumbersDisplay.textContent = currentSeries.drawnNumbers.map(n => String(n).padStart(2, '0')).join(' - ');
        } else {
            drawnNumbersDisplay.textContent = 'Nenhum número sorteado.';
        }
    }

    // Sorts a number
    function drawNumber(num) {
        if (!currentSeries) {
            alert('Por favor, selecione ou crie uma série antes de sortear números.');
            return false;
        }

        num = parseInt(num);

        if (isNaN(num) || num < 1 || num > 75) {
            alert('Por favor, insira um número válido entre 1 e 75.'); // Esta mensagem só aparecerá se o usuário tentar importar um número inválido
            return false;
        }

        if (currentSeries.drawnNumbers.includes(num)) {
            alert(`O número ${String(num).padStart(2, '0')} já foi sorteado!`);
            return false;
        }

        currentSeries.drawnNumbers.unshift(num); // Add to the beginning for reverse order
        currentSeries.lastDrawnNumber = num;
        saveSeriesToLocalStorage(); // Save current series to local storage
        updateGridDisplay();
        return true;
    }

    // Confirm and draw a number
    function confirmAndDrawNumber(num) {
        if (!currentSeries) {
            alert('Por favor, selecione ou crie uma série antes de sortear números.');
            return;
        }
        if (currentSeries.drawnNumbers.includes(num)) {
            alert(`O número ${String(num).padStart(2, '0')} já foi sorteado!`);
            return;
        }
        const confirmation = confirm(`Tem certeza que deseja sortear o número ${String(num).padStart(2, '0')}?`);
        if (confirmation) {
            drawNumber(num);
        }
    }

    // Event listener for undo button
    undoButton.addEventListener('click', () => {
        if (!currentSeries || currentSeries.drawnNumbers.length === 0) {
            alert('Não há números para desfazer.');
            return;
        }
        const confirmation = confirm('Tem certeza que deseja desfazer a última jogada?');
        if (confirmation) {
            currentSeries.drawnNumbers.shift(); // Remove the last drawn (first in array)
            currentSeries.lastDrawnNumber = currentSeries.drawnNumbers.length > 0 ? currentSeries.drawnNumbers[0] : null;
            saveSeriesToLocalStorage();
            updateGridDisplay();
        }
    });

    // --- Sidebar and Series Management Logic ---

    // Toggle sidebar visibility
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        const sidebarWidth = sidebar.offsetWidth; // Get computed width
        if (sidebar.classList.contains('active')) {
            mainContainer.style.marginLeft = `${sidebarWidth + 20}px`; // Push main content
        } else {
            mainContainer.style.marginLeft = '0'; // Bring main content back
        }
    });


    // Load series from local storage
    function loadSeriesFromLocalStorage() {
        const seriesData = localStorage.getItem('bingoSeries');
        return seriesData ? JSON.parse(seriesData) : {};
    }

    // Save all series to local storage
    function saveSeriesToLocalStorage() {
        if (currentSeries) {
            allSeries[currentSeries.id] = currentSeries;
        }
        localStorage.setItem('bingoSeries', JSON.stringify(allSeries));
        renderSeriesList();
    }

    // Render the list of series in the sidebar
    function renderSeriesList() {
        seriesListDiv.innerHTML = '';
        if (Object.keys(allSeries).length === 0) {
            seriesListDiv.textContent = 'Nenhuma série criada.';
            currentSeries = null;
            updateTitle();
            updateGridDisplay();
            disableGameControls(true); // Disable game controls if no series
            return;
        }

        disableGameControls(false); // Enable game controls if there are series

        Object.values(allSeries).forEach(series => {
            const seriesItem = document.createElement('div');
            seriesItem.textContent = series.name;
            seriesItem.dataset.id = series.id;
            if (currentSeries && series.id === currentSeries.id) {
                seriesItem.classList.add('active-series');
            }
            seriesItem.addEventListener('click', () => selectSeries(series.id));
            seriesListDiv.appendChild(seriesItem);
        });

        // If no current series is selected but there are series, select the first one
        if (!currentSeries && Object.keys(allSeries).length > 0) {
            selectSeries(Object.keys(allSeries)[0]);
        }
    }

    // Select a series from the list
    function selectSeries(id) {
        if (currentSeries && currentSeries.id === id) return; // Already selected

        currentSeries = allSeries[id];
        updateTitle();
        initializeBingoGrid(); // Re-initialize grid for the new series
        updateGridDisplay();
        renderSeriesList(); // Re-render to highlight active series
    }

    // Create a new series
    newSeriesButton.addEventListener('click', () => {
        const seriesName = prompt('Digite o nome da nova série:');
        if (seriesName) {
            const newId = `series_${Date.now()}`;
            allSeries[newId] = {
                id: newId,
                name: seriesName,
                drawnNumbers: [],
                lastDrawnNumber: null
            };
            selectSeries(newId);
            saveSeriesToLocalStorage();
        }
    });

    // Update the main title with the current series
    function updateTitle() {
        if (currentSeries) {
            document.title = `Bingo - Série ${currentSeries.name}`;
            bingoTitle.textContent = `Bingo - Série ${currentSeries.name}`;
        } else {
            document.title = 'Bingo - Sem Série';
            bingoTitle.textContent = 'Bingo - Sem Série';
        }
    }

    // Import series from JSON file
    importSeriesButton.addEventListener('click', () => {
        importFileInput.click(); // Trigger file input click
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    // Basic validation for imported data structure and numbers
                    if (typeof importedData === 'object' && importedData !== null) {
                        let validImport = true;
                        for (const key in importedData) {
                            if (importedData.hasOwnProperty(key)) {
                                const series = importedData[key];
                                if (!series.id || !series.name || !Array.isArray(series.drawnNumbers) || series.lastDrawnNumber === undefined) {
                                    validImport = false;
                                    break;
                                }
                                for (const num of series.drawnNumbers) {
                                    if (num < 1 || num > 75) {
                                        validImport = false;
                                        break;
                                    }
                                }
                                if (!validImport) break;
                            }
                        }

                        if (validImport) {
                            const confirmation = confirm('Ao importar, as séries existentes serão substituídas. Deseja continuar?');
                            if (confirmation) {
                                allSeries = importedData;
                                saveSeriesToLocalStorage(); // This will also re-render the list
                                // Attempt to select a current series if it existed in the imported data
                                if (currentSeries && allSeries[currentSeries.id]) {
                                    selectSeries(currentSeries.id);
                                } else if (Object.keys(allSeries).length > 0) {
                                    selectSeries(Object.keys(allSeries)[0]);
                                } else {
                                    currentSeries = null;
                                    updateTitle();
                                    initializeBingoGrid();
                                    updateGridDisplay();
                                }
                                alert('Séries importadas com sucesso!');
                            }
                        } else {
                            alert('Formato de arquivo JSON inválido ou contém números fora do intervalo (1-75).');
                        }
                    } else {
                        alert('Formato de arquivo JSON inválido.');
                    }
                } catch (error) {
                    alert('Erro ao ler o arquivo JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    // Export series to JSON file
    exportSeriesButton.addEventListener('click', () => {
        if (Object.keys(allSeries).length === 0) {
            alert('Não há séries para exportar.');
            return;
        }

        const dataStr = JSON.stringify(allSeries, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const now = new Date(); // Corrected line: removed the extra 'new'
        const defaultFileName = `bingo_serie_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}_${now.getMinutes().toString().padStart(2, '0')}_${now.getSeconds().toString().padStart(2, '0')}.json`;

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
    });

    // Delete current series
    deleteCurrentSeriesButton.addEventListener('click', () => {
        if (!currentSeries) {
            alert('Nenhuma série selecionada para excluir.');
            return;
        }
        const confirmation = confirm(`Tem certeza que deseja excluir a série "${currentSeries.name}"? Esta ação é irreversível.`);
        if (confirmation) {
            delete allSeries[currentSeries.id];
            currentSeries = null; // Deselect current series
            saveSeriesToLocalStorage(); // Re-save and re-render
            alert('Série excluída com sucesso.');
        }
    });

    // Delete all series
    deleteAllSeriesButton.addEventListener('click', () => {
        if (Object.keys(allSeries).length === 0) {
            alert('Não há séries para excluir.');
            return;
        }
        const confirmation = confirm('Tem certeza que deseja excluir TODAS as séries? Esta ação é irreversível.');
        if (confirmation) {
            allSeries = {}; // Clear all series
            currentSeries = null; // Deselect current series
            saveSeriesToLocalStorage(); // Re-save and re-render
            alert('Todas as séries foram excluídas.');
        }
    });

    // Function to enable/disable game controls (draw buttons, undo)
    function disableGameControls(isDisabled) {
        undoButton.disabled = isDisabled;
        // Also disable clicks on grid cells if no series is selected
        const allCells = bingoGrid.querySelectorAll('td[data-number]');
        allCells.forEach(cell => {
            if (isDisabled) {
                cell.style.pointerEvents = 'none';
                cell.style.opacity = '0.7';
            } else {
                cell.style.pointerEvents = 'auto';
                cell.style.opacity = '1';
            }
        });
    }

    // Initial setup
    renderSeriesList(); // Load and display series from local storage on page load
    initializeBingoGrid();
    updateTitle();
    updateGridDisplay(); // Ensure display reflects initial state (empty or loaded series)
});