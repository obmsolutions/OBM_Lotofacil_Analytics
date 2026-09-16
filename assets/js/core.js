(function (global) {
    'use strict';

    const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
    const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
    const FRAME = new Set(Array.from({ length: 25 }, (_, i) => i + 1).filter(n => {
        const row = Math.floor((n - 1) / 5);
        const col = (n - 1) % 5;
        return row === 0 || row === 4 || col === 0 || col === 4;
    }));
    const FILTER_IDS = [
        'paridadeOptions', 'somaOptions', 'repetidasOptions', 'baixasOptions',
        'primosOptions', 'fibonacciOptions', 'molduraOptions', 'multiplos3Options',
        'multiplos4Options', 'linhasVaziasOptions', 'colunasVaziasOptions',
        'adjacenciasOptions', 'maiorSequenciaOptions'
    ];

    function normalizeCountTo15(count, gameSize) {
        return Math.max(0, Math.min(15, Math.round(count * 15 / gameSize)));
    }

    function normalizeAdjacenciesTo15(count, gameSize) {
        if (gameSize <= 1) return 0;
        return Math.max(0, Math.round(count * 15 * 14 / (gameSize * (gameSize - 1))));
    }

    function normalizeLongestRunTo15(count, gameSize) {
        const recommendedMaximum = { 15: 7, 16: 8, 17: 9, 18: 10, 19: 11, 20: 12 }[gameSize] || 7;
        return Math.max(1, Math.round(count * 7 / recommendedMaximum));
    }

    function consecutiveMetrics(numbers) {
        const sorted = [...numbers].sort((a, b) => a - b);
        let adjacencies = 0;
        let run = 1;
        let longestRun = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                adjacencies++;
                run++;
                longestRun = Math.max(longestRun, run);
            } else {
                run = 1;
            }
        }
        return { adjacencies, longestRun };
    }

    function rawMetrics(combo, lastDraw = []) {
        const numbers = [...combo].map(Number).sort((a, b) => a - b);
        const rows = new Set(numbers.map(n => Math.floor((n - 1) / 5) + 1));
        const columns = new Set(numbers.map(n => ((n - 1) % 5) + 1));
        const consecutive = consecutiveMetrics(numbers);
        return {
            size: numbers.length,
            odd: numbers.filter(n => n % 2 === 1).length,
            even: numbers.filter(n => n % 2 === 0).length,
            sum: numbers.reduce((a, b) => a + b, 0),
            low: numbers.filter(n => n <= 13).length,
            high: numbers.filter(n => n >= 14).length,
            primes: numbers.filter(n => PRIMES.has(n)).length,
            fibonacci: numbers.filter(n => FIBONACCI.has(n)).length,
            frame: numbers.filter(n => FRAME.has(n)).length,
            core: numbers.filter(n => !FRAME.has(n)).length,
            multiples3: numbers.filter(n => n % 3 === 0).length,
            multiples4: numbers.filter(n => n % 4 === 0).length,
            emptyRows: 5 - rows.size,
            emptyColumns: 5 - columns.size,
            consecutiveAdjacencies: consecutive.adjacencies,
            longestRun: consecutive.longestRun,
            repeated: Array.isArray(lastDraw) && lastDraw.length === 15
                ? numbers.filter(n => lastDraw.includes(n)).length
                : null
        };
    }

    function equivalentMetrics(combo, lastDraw = []) {
        const raw = rawMetrics(combo, lastDraw);
        return {
            ...raw,
            equivalentOdd: normalizeCountTo15(raw.odd, raw.size),
            equivalentLow: normalizeCountTo15(raw.low, raw.size),
            equivalentPrimes: normalizeCountTo15(raw.primes, raw.size),
            equivalentFibonacci: normalizeCountTo15(raw.fibonacci, raw.size),
            equivalentFrame: normalizeCountTo15(raw.frame, raw.size),
            equivalentMultiples3: normalizeCountTo15(raw.multiples3, raw.size),
            equivalentMultiples4: normalizeCountTo15(raw.multiples4, raw.size),
            equivalentAdjacencies: normalizeAdjacenciesTo15(raw.consecutiveAdjacencies, raw.size),
            equivalentLongestRun: normalizeLongestRunTo15(raw.longestRun, raw.size),
            equivalentRepeated: raw.repeated === null ? null : normalizeCountTo15(raw.repeated, raw.size),
            equivalentSum: raw.sum * 15 / raw.size
        };
    }

    function selected(options, key) {
        return Array.isArray(options?.[key]) ? options[key].map(String) : [];
    }

    function exact(options, key, value) {
        const opts = selected(options, key);
        return !opts.length || opts.includes(String(value));
    }

    function inSelectedRanges(options, key, value) {
        const opts = selected(options, key);
        if (!opts.length) return true;
        return opts.some(item => {
            const [min, max] = item.split('-').map(Number);
            return Number.isFinite(min) && Number.isFinite(max) && value >= min && value <= max;
        });
    }

    function isValidGame(combo) {
        return Array.isArray(combo)
            && combo.length >= 15
            && combo.length <= 20
            && new Set(combo).size === combo.length
            && combo.every(n => Number.isInteger(n) && n >= 1 && n <= 25);
    }

    function applyFilters(combo, options = {}, lastDraw = []) {
        if (!isValidGame(combo)) return false;
        const m = equivalentMetrics(combo, lastDraw);
        if (!exact(options, 'paridadeOptions', m.equivalentOdd)) return false;
        if (!inSelectedRanges(options, 'somaOptions', m.equivalentSum)) return false;
        if (m.equivalentRepeated !== null && !exact(options, 'repetidasOptions', m.equivalentRepeated)) return false;
        if (!exact(options, 'baixasOptions', m.equivalentLow)) return false;
        if (!exact(options, 'primosOptions', m.equivalentPrimes)) return false;
        if (!exact(options, 'fibonacciOptions', m.equivalentFibonacci)) return false;
        if (!exact(options, 'molduraOptions', m.equivalentFrame)) return false;
        if (!exact(options, 'multiplos3Options', m.equivalentMultiples3)) return false;
        if (!exact(options, 'multiplos4Options', m.equivalentMultiples4)) return false;
        if (!exact(options, 'linhasVaziasOptions', m.emptyRows)) return false;
        if (!exact(options, 'colunasVaziasOptions', m.emptyColumns)) return false;
        if (!exact(options, 'adjacenciasOptions', m.equivalentAdjacencies)) return false;
        if (!inSelectedRanges(options, 'maiorSequenciaOptions', m.equivalentLongestRun)) return false;
        return true;
    }

    function parseGames(content) {
        const games = [];
        const seen = new Set();
        const report = { valid: 0, invalid: 0, duplicates: 0, invalidLines: [] };
        String(content).split(/\r?\n/).forEach((raw, index) => {
            const line = raw.trim();
            if (!line || /^(OBM|LOTOFÁCIL|LOTOFACIL|JOGO|DEZENAS)/i.test(line)) return;
            const contentLine = line.replace(/^\s*\d+\s*:\s*/, '');
            const tokens = contentLine.match(/\d+/g) || [];
            const numbers = tokens.map(Number).filter(n => n >= 1 && n <= 25);
            if (!isValidGame(numbers)) {
                report.invalid++;
                if (report.invalidLines.length < 20) report.invalidLines.push(index + 1);
                return;
            }
            numbers.sort((a, b) => a - b);
            const key = numbers.join(',');
            if (seen.has(key)) {
                report.duplicates++;
                return;
            }
            seen.add(key);
            games.push(numbers);
        });
        report.valid = games.length;
        return { games, report };
    }

    function combinationCount(n, k) {
        if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || n < k) return 0;
        let result = 1;
        for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
        return Math.round(result);
    }

    function overlap(a, b) {
        const set = new Set(a);
        return b.reduce((count, n) => count + Number(set.has(n)), 0);
    }

    function buildCheckReport(draw, results, generatedAt) {
        const pad = number => String(number).padStart(2, '0');
        const counts = Object.fromEntries(Array.from({ length: 16 }, (_, hits) => [hits, 0]));
        results.forEach(result => counts[result.hits]++);
        const belowEleven = Object.entries(counts)
            .filter(([hits]) => Number(hits) < 11)
            .reduce((total, [, count]) => total + count, 0);
        const ordered = [...results].sort((a, b) => b.hits - a.hits || a.index - b.index);
        const lines = [
            'OBM LOTOFÁCIL ANALYTICS v1.0',
            'RELATÓRIO DE CONFERÊNCIA DOS JOGOS',
            `Gerado em: ${generatedAt}`,
            `Dezenas sorteadas: ${draw.map(pad).join(' ')}`,
            `Total de jogos conferidos: ${results.length}`,
            '',
            'RESUMO DA APURAÇÃO',
            `15 acertos: ${counts[15]}`,
            `14 acertos: ${counts[14]}`,
            `13 acertos: ${counts[13]}`,
            `12 acertos: ${counts[12]}`,
            `11 acertos: ${counts[11]}`,
            `Abaixo de 11 acertos: ${belowEleven}`,
            '',
            'RESULTADO DE TODOS OS JOGOS',
            'Formato: número do jogo | quantidade de acertos | dezenas apostadas',
            ''
        ];
        ordered.forEach(result => {
            lines.push(`Jogo ${result.index + 1} | ${result.hits} acertos | ${result.game.map(pad).join(' ')}`);
        });
        return lines.join('\n');
    }

    global.OBMLotofacilCore = {
        version: '1.0.0', PRIMES, FIBONACCI, FRAME, FILTER_IDS,
        normalizeCountTo15, normalizeAdjacenciesTo15, normalizeLongestRunTo15,
        consecutiveMetrics, rawMetrics, equivalentMetrics,
        isValidGame, applyFilters, parseGames, combinationCount, overlap, buildCheckReport
    };
})(typeof self !== 'undefined' ? self : globalThis);
