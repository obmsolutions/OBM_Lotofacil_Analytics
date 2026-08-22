(function () {
    'use strict';

    const state = {
        selectedNumbers: Array.from({ length: 25 }, (_, i) => i + 1),
        games: [],
        importedGames: [],
        draws: [],
        lastDraw: [],
        frequencyChart: null,
        lastGeneration: null
    };

    document.addEventListener('DOMContentLoaded', initialize);

    function initialize() {
        buildAutomaticFilterOptions();
        bindTabs();
        bindControls();
        renderNumberGrid();
        restoreRecommendedFilters(false);
        loadHistoricalData();
    }

    function bindTabs() {
        document.querySelectorAll('.tab').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.tab).classList.add('active');
                if (button.dataset.tab === 'statistics') renderStatistics();
            });
        });
    }

    function bindControls() {
        document.getElementById('selectAllButton').addEventListener('click', () => setSelection(Array.from({ length: 25 }, (_, i) => i + 1)));
        document.getElementById('clearSelectionButton').addEventListener('click', () => setSelection([]));
        document.getElementById('randomSelectionButton').addEventListener('click', randomSelection);
        document.getElementById('generateButton').addEventListener('click', generateGames);
        document.getElementById('clearGamesButton').addEventListener('click', clearGames);
        document.getElementById('exportGamesButton').addEventListener('click', exportGames);
        document.getElementById('exportAuditButton').addEventListener('click', exportAudit);
        document.getElementById('restoreFiltersButton').addEventListener('click', () => restoreRecommendedFilters(true));
        document.getElementById('disableFiltersButton').addEventListener('click', disableFilters);
        document.getElementById('gamesFile').addEventListener('change', importGamesFile);
        document.getElementById('checkGamesButton').addEventListener('click', checkGames);
        document.getElementById('statsWindow').addEventListener('change', renderStatistics);
        document.getElementById('scanButton').addEventListener('click', scanGame);
        document.getElementById('syncButton').addEventListener('click', synchronizeData);
        document.querySelectorAll('.filter-options').forEach(container => {
            container.addEventListener('click', event => {
                const button = event.target.closest('.filter-option');
                if (!button) return;
                button.classList.toggle('selected');
                updateActiveFilterSummary();
            });
        });
    }

    function buildAutomaticFilterOptions() {
        document.querySelectorAll('.filter-options[data-values]').forEach(container => {
            const values = container.dataset.values.split(',').map(value => value.trim()).filter(Boolean);
            container.innerHTML = values.map(value => `<button class="filter-option" data-value="${value}">${value}</button>`).join('');
        });
    }

    function showAlert(message, type = 'success') {
        const alert = document.getElementById('alertContainer');
        alert.textContent = message;
        alert.className = `alert ${type}`;
        clearTimeout(showAlert.timer);
        showAlert.timer = setTimeout(() => alert.classList.add('hidden'), type === 'error' ? 7000 : 4000);
    }

    function setGenerationStatus(message, type = '') {
        const status = document.getElementById('generationStatus');
        status.textContent = message;
        status.className = `status-box${type ? ` ${type}` : ''}`;
    }

    function setSelection(numbers) {
        state.selectedNumbers = [...new Set(numbers)].filter(n => n >= 1 && n <= 25).sort((a, b) => a - b);
        renderNumberGrid();
    }

    function renderNumberGrid() {
        const grid = document.getElementById('numberGrid');
        grid.innerHTML = Array.from({ length: 25 }, (_, index) => {
            const number = index + 1;
            return `<button class="number-button${state.selectedNumbers.includes(number) ? ' selected' : ''}" data-number="${number}" aria-pressed="${state.selectedNumbers.includes(number)}">${String(number).padStart(2, '0')}</button>`;
        }).join('');
        grid.querySelectorAll('.number-button').forEach(button => {
            button.addEventListener('click', () => {
                const number = Number(button.dataset.number);
                if (state.selectedNumbers.includes(number)) setSelection(state.selectedNumbers.filter(n => n !== number));
                else setSelection([...state.selectedNumbers, number]);
            });
        });
        document.getElementById('selectedCount').textContent = state.selectedNumbers.length;
        document.getElementById('selectedNumbers').textContent = state.selectedNumbers.map(pad).join(' • ');
    }

    function randomSelection() {
        const size = Math.max(15, Math.min(25, Number(prompt('Quantas dezenas deseja selecionar? Informe de 15 a 25.', '20')) || 20));
        const shuffled = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - .5);
        setSelection(shuffled.slice(0, size));
        showAlert(`${size} dezenas selecionadas aleatoriamente.`);
    }

    async function loadHistoricalData() {
        state.draws = OBMLotofacilDataStore.all();
        if (!state.draws.length) {
            showAlert('A base histórica local não pôde ser carregada.', 'error');
            return;
        }
        state.lastDraw = state.draws.at(-1).listaDezenas;
        renderDashboard();
        renderStatistics();
        renderBacktest();
    }

    function renderDashboard() {
        const first = state.draws[0];
        const latest = state.draws.at(-1);
        document.getElementById('drawCount').textContent = state.draws.length.toLocaleString('pt-BR');
        document.getElementById('drawRange').textContent = `Concursos ${first.numero} a ${latest.numero}`;
        document.getElementById('latestContest').textContent = latest.numero;
        document.getElementById('latestDate').textContent = latest.dataApuracao;
        document.getElementById('latestBalls').innerHTML = latest.listaDezenas.map(ball).join('');
        document.getElementById('dataStatus').textContent = `Base local íntegra até o concurso ${latest.numero}, sorteado em ${latest.dataApuracao}.`;
        const joint = OBMLotofacilStatistics.recommendedCoverage(state.draws);
        document.getElementById('recommendedCoverage').textContent = `${(joint * 100).toFixed(2).replace('.', ',')}%`;
        document.getElementById('strongPatterns').innerHTML = `
            <table><thead><tr><th>Padrão recomendado</th><th>Histórico</th><th>Teórico exato</th><th>Diferença</th></tr></thead><tbody>
            ${OBM_LOTOFACIL_FILTER_META.map(item => `<tr><td>${item.label}</td><td>${formatPct(item.historical)}</td><td>${formatPct(item.theoretical)}</td><td>${formatSigned(item.historical - item.theoretical)} p.p.</td></tr>`).join('')}
            </tbody></table>`;
    }

    async function synchronizeData() {
        const button = document.getElementById('syncButton');
        const original = button.textContent;
        button.disabled = true;
        button.textContent = 'Atualizando...';
        try {
            const result = await OBMLotofacilDataStore.synchronize(progress => {
                button.textContent = `${progress.contest}/${progress.latest}`;
            });
            state.draws = result.draws;
            state.lastDraw = state.draws.at(-1).listaDezenas;
            renderDashboard();
            renderStatistics();
            renderBacktest();
            showAlert(result.added ? `${result.added} novo(s) concurso(s) adicionado(s).` : 'A base já está atualizada.');
        } catch (error) {
            showAlert(`Não foi possível atualizar: ${error.message} A base local foi preservada.`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = original;
        }
    }

    function getFilterConfig() {
        return Object.fromEntries(OBMLotofacilCore.FILTER_IDS.map(id => [
            id,
            [...document.querySelectorAll(`#${id} .filter-option.selected`)].map(button => button.dataset.value)
        ]));
    }

    function restoreRecommendedFilters(notify) {
        document.querySelectorAll('.filter-option').forEach(button => button.classList.remove('selected'));
        Object.entries(OBM_LOTOFACIL_RECOMMENDED).forEach(([id, values]) => {
            document.querySelectorAll(`#${id} .filter-option`).forEach(button => {
                if (values.includes(button.dataset.value)) button.classList.add('selected');
            });
        });
        updateActiveFilterSummary();
        if (notify) showAlert('Faixas recomendadas restauradas.');
    }

    function disableFilters() {
        document.querySelectorAll('.filter-option').forEach(button => button.classList.remove('selected'));
        updateActiveFilterSummary();
        showAlert('Todos os filtros foram desativados.');
    }

    function updateActiveFilterSummary() {
        const config = getFilterConfig();
        const active = Object.values(config).filter(values => values.length).length;
        document.getElementById('activeFilterSummary').textContent = active
            ? `${active} de ${OBMLotofacilCore.FILTER_IDS.length} grupos de filtros estão ativos para a próxima geração.`
            : 'Nenhum filtro estrutural está ativo. A geração considerará somente equilíbrio e diversidade.';
    }

    function weightedCandidate(numbers, size, frequencies) {
        const remaining = [...numbers];
        const result = [];
        while (result.length < size) {
            const weights = remaining.map(n => 1 / (1 + frequencies[n]));
            const total = weights.reduce((a, b) => a + b, 0);
            let target = Math.random() * total;
            let index = weights.length - 1;
            for (let i = 0; i < weights.length; i++) {
                target -= weights[i];
                if (target <= 0) { index = i; break; }
            }
            result.push(remaining.splice(index, 1)[0]);
        }
        return result.sort((a, b) => a - b);
    }

    function candidateScore(combo, games, frequencies, target) {
        const selected = new Set(combo);
        const frequencyPenalty = Object.keys(frequencies).reduce((sum, value) => {
            const number = Number(value);
            const projected = frequencies[number] + Number(selected.has(number));
            return sum + Math.pow(projected - target, 2);
        }, 0);
        if (!games.length) return frequencyPenalty;
        const overlaps = games.map(game => OBMLotofacilCore.overlap(combo, game));
        return frequencyPenalty + Math.max(...overlaps) * 12 + overlaps.reduce((a, b) => a + b, 0) * 2 / overlaps.length;
    }

    function generateInMainThread(numbers, size, count, maxAttempts, options, onProgress) {
        return new Promise((resolve, reject) => {
            const frequencies = Object.fromEntries(numbers.map(n => [n, 0]));
            const games = [];
            const seen = new Set();
            let attempts = 0;
            function batch() {
                try {
                    const batchEnd = Math.min(maxAttempts, attempts + 1500);
                    while (games.length < count && attempts < batchEnd) {
                        let best = null;
                        let bestScore = Infinity;
                        const target = ((games.length + 1) * size) / numbers.length;
                        for (let sample = 0; sample < 20 && attempts < batchEnd; sample++) {
                            const combo = weightedCandidate(numbers, size, frequencies);
                            const key = combo.join(',');
                            attempts++;
                            if (seen.has(key) || !OBMLotofacilCore.applyFilters(combo, options, state.lastDraw)) continue;
                            const score = candidateScore(combo, games, frequencies, target);
                            if (score < bestScore) { best = combo; bestScore = score; }
                        }
                        if (best) {
                            seen.add(best.join(','));
                            games.push(best);
                            best.forEach(n => frequencies[n]++);
                        }
                    }
                    onProgress({ generated: games.length, attempts });
                    if (games.length >= count || attempts >= maxAttempts) resolve({ games, attempts, frequencies, fallback: true });
                    else setTimeout(batch, 0);
                } catch (error) { reject(error); }
            }
            batch();
        });
    }

    function runGenerator(numbers, size, count, maxAttempts, options, onProgress) {
        if (typeof Worker === 'undefined') return generateInMainThread(numbers, size, count, maxAttempts, options, onProgress);
        return new Promise((resolve, reject) => {
            let finished = false;
            let worker;
            const fallback = () => {
                if (finished) return;
                finished = true;
                worker?.terminate();
                generateInMainThread(numbers, size, count, maxAttempts, options, onProgress).then(resolve, reject);
            };
            try {
                worker = new Worker(new URL('assets/workers/generator-worker.js', window.location.href));
            } catch (_) { fallback(); return; }
            worker.onmessage = event => {
                if (event.data.type === 'progress') onProgress(event.data);
                if (event.data.type === 'done' && !finished) {
                    finished = true;
                    worker.terminate();
                    resolve(event.data);
                }
            };
            worker.onerror = event => { event.preventDefault?.(); fallback(); };
            worker.postMessage({ numbers, size, count, maxAttempts, options, lastDraw: state.lastDraw });
        });
    }

    async function generateGames() {
        const button = document.getElementById('generateButton');
        const original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>Gerando...';
        setGenerationStatus('Validando universo e filtros...');
        try {
            const count = Number(document.getElementById('gameCount').value);
            const size = Number(document.getElementById('gameSize').value);
            if (!Number.isInteger(count) || count < 1 || count > 1000) throw new Error('Informe de 1 a 1.000 jogos.');
            if (!Number.isInteger(size) || size < 15 || size > 20) throw new Error('Informe de 15 a 20 dezenas por jogo.');
            if (state.selectedNumbers.length < size) throw new Error(`Selecione pelo menos ${size} dezenas na aba Seleção.`);
            const maximum = OBMLotofacilCore.combinationCount(state.selectedNumbers.length, size);
            if (count > maximum) throw new Error(`O universo selecionado permite no máximo ${maximum.toLocaleString('pt-BR')} combinações únicas.`);
            const options = getFilterConfig();
            const maxAttempts = Math.max(40000, count * 1500);
            const result = await runGenerator(state.selectedNumbers, size, count, maxAttempts, options, progress => {
                button.innerHTML = `<span class="loading"></span>${progress.generated}/${count}`;
                setGenerationStatus(`Gerando ${progress.generated} de ${count} jogos • ${progress.attempts.toLocaleString('pt-BR')} tentativas`);
            });
            state.games = result.games;
            state.lastGeneration = { requested: count, size, attempts: result.attempts, options, fallback: Boolean(result.fallback) };
            renderGames();
            renderGenerationAudit();
            if (!state.games.length) {
                setGenerationStatus('Nenhuma combinação atende à configuração atual. Flexibilize alguns filtros.', 'error');
            } else if (state.games.length < count) {
                setGenerationStatus(`Geração parcial: ${state.games.length} de ${count} jogos. Flexibilize os filtros para completar a carteira.`, 'error');
            } else {
                setGenerationStatus(`${state.games.length} jogos gerados, filtrados e diversificados com sucesso.`, 'success');
            }
        } catch (error) {
            setGenerationStatus(error.message, 'error');
            showAlert(error.message, 'error');
        } finally {
            button.disabled = false;
            button.innerHTML = original;
        }
    }

    function renderGames() {
        document.getElementById('generatedCount').textContent = state.games.length;
        document.getElementById('gameResults').innerHTML = state.games.map((game, index) => `
            <div class="game-row"><span class="game-index">Jogo ${String(index + 1).padStart(3, '0')}</span><div class="game-balls">${game.map(n => ball(n, true)).join('')}</div></div>`).join('');
    }

    function portfolioMetrics(games) {
        const frequencies = Array(26).fill(0);
        games.forEach(game => game.forEach(n => frequencies[n]++));
        const overlaps = [];
        for (let i = 0; i < games.length; i++) {
            for (let j = i + 1; j < games.length; j++) overlaps.push(OBMLotofacilCore.overlap(games[i], games[j]));
        }
        const active = state.selectedNumbers.map(n => frequencies[n]);
        return {
            frequencies,
            minFrequency: active.length ? Math.min(...active) : 0,
            maxFrequency: active.length ? Math.max(...active) : 0,
            averageOverlap: overlaps.length ? overlaps.reduce((a, b) => a + b, 0) / overlaps.length : 0,
            maxOverlap: overlaps.length ? Math.max(...overlaps) : 0,
            duplicates: games.length - new Set(games.map(game => game.join(','))).size
        };
    }

    function renderGenerationAudit() {
        if (!state.games.length) { document.getElementById('generationAudit').innerHTML = ''; return; }
        const m = portfolioMetrics(state.games);
        document.getElementById('generationAudit').innerHTML = `
            <div class="summary-grid">
                <article class="summary-card"><span>Frequência mínima</span><strong>${m.minFrequency}</strong><small>entre dezenas selecionadas</small></article>
                <article class="summary-card"><span>Frequência máxima</span><strong>${m.maxFrequency}</strong><small>entre dezenas selecionadas</small></article>
                <article class="summary-card"><span>Sobreposição média</span><strong>${m.averageOverlap.toFixed(2).replace('.', ',')}</strong><small>dezenas comuns entre jogos</small></article>
                <article class="summary-card"><span>Duplicidades</span><strong>${m.duplicates}</strong><small>deve permanecer zero</small></article>
            </div>`;
    }

    function clearGames() {
        state.games = [];
        state.lastGeneration = null;
        renderGames();
        document.getElementById('generationAudit').innerHTML = '';
        setGenerationStatus('Aguardando a geração das combinações.');
    }

    function exportGames() {
        if (!state.games.length) return showAlert('Gere uma carteira antes de exportar.', 'error');
        const header = ['OBM LOTOFÁCIL ANALYTICS v1.0', `Jogos: ${state.games.length}`, `Dezenas por jogo: ${state.games[0].length}`, ''];
        const lines = state.games.map(game => game.map(pad).join(' '));
        downloadText(`obm-lotofacil-jogos-${dateStamp()}.txt`, [...header, ...lines].join('\n'));
    }

    function exportAudit() {
        if (!state.games.length) return showAlert('Gere uma carteira antes de exportar a auditoria.', 'error');
        const m = portfolioMetrics(state.games);
        const lines = [
            'OBM LOTOFÁCIL ANALYTICS v1.0 — AUDITORIA',
            `Data: ${new Date().toLocaleString('pt-BR')}`,
            `Jogos: ${state.games.length}`,
            `Dezenas por jogo: ${state.games[0].length}`,
            `Universo: ${state.selectedNumbers.map(pad).join(' ')}`,
            `Tentativas: ${state.lastGeneration?.attempts || 0}`,
            `Duplicidades: ${m.duplicates}`,
            `Sobreposição média: ${m.averageOverlap.toFixed(3)}`,
            `Sobreposição máxima: ${m.maxOverlap}`,
            '', 'FREQUÊNCIAS REAIS',
            ...state.selectedNumbers.map(n => `${pad(n)}: ${m.frequencies[n]}`),
            '', 'FILTROS ATIVOS',
            ...Object.entries(getFilterConfig()).map(([key, values]) => `${key}: ${values.length ? values.join(', ') : 'desativado'}`)
        ];
        downloadText(`obm-lotofacil-auditoria-${dateStamp()}.txt`, lines.join('\n'));
    }

    async function importGamesFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const parsed = OBMLotofacilCore.parseGames(await file.text());
        state.importedGames = parsed.games;
        document.getElementById('fileReport').textContent = `${parsed.report.valid} jogos válidos • ${parsed.report.invalid} linhas inválidas • ${parsed.report.duplicates} duplicadas.`;
        if (!parsed.games.length) showAlert('Nenhum jogo válido foi encontrado no arquivo.', 'error');
    }

    function parseNumberInput(value, expectedMin, expectedMax) {
        const numbers = (String(value).match(/\d+/g) || []).map(Number);
        if (numbers.length < expectedMin || numbers.length > expectedMax || new Set(numbers).size !== numbers.length || numbers.some(n => n < 1 || n > 25)) {
            throw new Error(`Informe ${expectedMin === expectedMax ? expectedMin : `${expectedMin} a ${expectedMax}`} dezenas únicas entre 01 e 25.`);
        }
        return numbers.sort((a, b) => a - b);
    }

    function checkGames() {
        try {
            const draw = parseNumberInput(document.getElementById('drawInput').value, 15, 15);
            const games = state.importedGames.length ? state.importedGames : state.games;
            if (!games.length) throw new Error('Carregue um TXT ou gere uma carteira antes de conferir.');
            const results = games.map((game, index) => ({ index, game, hits: OBMLotofacilCore.overlap(game, draw) }));
            const counts = Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, 0]));
            results.forEach(result => counts[result.hits]++);
            document.getElementById('checkSummary').innerHTML = `
                <div class="summary-grid">
                    ${[15, 14, 13, 12].map(hits => `<article class="summary-card"><span>${hits} acertos</span><strong>${counts[hits]}</strong><small>jogos</small></article>`).join('')}
                </div>
                <div class="status-box">11 acertos: <strong>${counts[11]}</strong> • Abaixo de 11: <strong>${Object.entries(counts).filter(([hits]) => Number(hits) < 11).reduce((sum, [, count]) => sum + count, 0)}</strong></div>`;
            document.getElementById('checkDetails').innerHTML = results.sort((a, b) => b.hits - a.hits).map(result => `
                <div class="game-row"><span class="game-index">Jogo ${result.index + 1}<br><strong>${result.hits} acertos</strong></span><div class="game-balls">${result.game.map(n => `<span class="ball small" style="${draw.includes(n) ? '' : 'background:#aeb8c5'}">${pad(n)}</span>`).join('')}</div></div>`).join('');
        } catch (error) { showAlert(error.message, 'error'); }
    }

    function renderStatistics() {
        if (!state.draws.length) return;
        const selectedWindow = document.getElementById('statsWindow').value;
        const draws = selectedWindow === 'all' ? state.draws : state.draws.slice(-Number(selectedWindow));
        const stats = OBMLotofacilStatistics.numberStatistics(draws);
        const labels = stats.map(item => pad(item.number));
        const values = stats.map(item => item.frequency);
        const canvas = document.getElementById('frequencyChart');
        state.frequencyChart?.destroy();
        state.frequencyChart = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets: [{ label: `Frequência em ${draws.length} concursos`, data: values, backgroundColor: '#075fca', borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } }, plugins: { legend: { display: true } } }
        });
        const ordered = [...stats].sort((a, b) => b.frequency - a.frequency || a.number - b.number);
        document.getElementById('numberRanking').innerHTML = `<table><thead><tr><th>Posição</th><th>Dezena</th><th>Frequência</th><th>Percentual</th><th>Atraso</th></tr></thead><tbody>${ordered.map((item, index) => `<tr><td>${index + 1}</td><td>${pad(item.number)}</td><td>${item.frequency}</td><td>${(item.frequency / draws.length * 100).toFixed(2).replace('.', ',')}%</td><td>${item.delay}</td></tr>`).join('')}</tbody></table>`;
    }

    function scanGame() {
        try {
            const game = parseNumberInput(document.getElementById('scannerInput').value, 15, 20);
            const m = OBMLotofacilCore.equivalentMetrics(game, state.lastDraw);
            const config = OBM_LOTOFACIL_RECOMMENDED;
            const checks = [
                ['Ímpares', m.equivalentOdd, config.paridadeOptions.includes(String(m.equivalentOdd))],
                ['Soma equivalente', m.equivalentSum.toFixed(1), m.equivalentSum >= 161 && m.equivalentSum <= 228],
                ['Repetidas do último', m.equivalentRepeated, config.repetidasOptions.includes(String(m.equivalentRepeated))],
                ['Baixas 01–13', m.equivalentLow, config.baixasOptions.includes(String(m.equivalentLow))],
                ['Primos', m.equivalentPrimes, config.primosOptions.includes(String(m.equivalentPrimes))],
                ['Fibonacci', m.equivalentFibonacci, config.fibonacciOptions.includes(String(m.equivalentFibonacci))],
                ['Moldura', m.equivalentFrame, config.molduraOptions.includes(String(m.equivalentFrame))],
                ['Múltiplos de 3', m.equivalentMultiples3, config.multiplos3Options.includes(String(m.equivalentMultiples3))],
                ['Múltiplos de 4', m.equivalentMultiples4, config.multiplos4Options.includes(String(m.equivalentMultiples4))],
                ['Linhas vazias', m.emptyRows, m.emptyRows === 0],
                ['Colunas vazias', m.emptyColumns, m.emptyColumns === 0],
                ['Adjacências', m.equivalentAdjacencies, config.adjacenciasOptions.includes(String(m.equivalentAdjacencies))],
                ['Maior sequência equivalente', m.equivalentLongestRun, m.equivalentLongestRun >= 3 && m.equivalentLongestRun <= 7]
            ];
            const passed = checks.filter(item => item[2]).length;
            document.getElementById('scannerResult').innerHTML = `
                <div class="status-box ${passed === checks.length ? 'success' : ''}">${passed} de ${checks.length} padrões recomendados atendidos.</div>
                <div class="table-wrap"><table><thead><tr><th>Indicador</th><th>Resultado</th><th>Avaliação</th></tr></thead><tbody>${checks.map(([label, value, ok]) => `<tr><td>${label}</td><td>${value ?? 'N/D'}</td><td class="${ok ? 'metric-pass' : 'metric-fail'}">${ok ? 'Atende' : 'Fora da faixa'}</td></tr>`).join('')}</tbody></table></div>`;
        } catch (error) { showAlert(error.message, 'error'); }
    }

    function renderBacktest() {
        if (!state.draws.length) return;
        const result = OBMLotofacilStatistics.hotColdWalkForward(state.draws, 100);
        if (!result) return;
        document.getElementById('hotBacktest').textContent = result.hotAverage.toFixed(3).replace('.', ',');
        const difference = result.hotAverage - result.randomExpectation;
        document.getElementById('backtestExplanation').textContent = `Em ${result.tests.toLocaleString('pt-BR')} testes, as 15 dezenas mais frequentes nos 100 concursos anteriores obtiveram média de ${result.hotAverage.toFixed(3).replace('.', ',')} acertos no concurso seguinte. A referência combinatória aleatória é 9,000. A diferença de ${Math.abs(difference).toFixed(3).replace('.', ',')} é desprezível e não sustenta vantagem preditiva para dezenas “quentes”.`;
    }

    function downloadText(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function ball(number, small = false) { return `<span class="ball${small ? ' small' : ''}">${pad(number)}</span>`; }
    function pad(number) { return String(number).padStart(2, '0'); }
    function formatPct(value) { return `${value.toFixed(2).replace('.', ',')}%`; }
    function formatSigned(value) { return `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}`; }
    function dateStamp() { return new Date().toISOString().slice(0, 10); }
})();
