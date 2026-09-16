(function (global) {
    'use strict';

    function normalizeDraw(draw) {
        return {
            numero: Number(draw.numero),
            dataApuracao: draw.dataApuracao || '',
            listaDezenas: (draw.listaDezenas || []).map(Number).sort((a, b) => a - b)
        };
    }

    function numberStatistics(draws) {
        const ordered = [...draws].map(normalizeDraw).sort((a, b) => b.numero - a.numero);
        const stats = Array.from({ length: 25 }, (_, index) => ({ number: index + 1, frequency: 0, delay: ordered.length }));
        ordered.forEach((draw, drawIndex) => {
            draw.listaDezenas.forEach(n => {
                stats[n - 1].frequency++;
                if (stats[n - 1].delay === ordered.length) stats[n - 1].delay = drawIndex;
            });
        });
        return stats;
    }

    function patternSummary(draws) {
        const ordered = [...draws].map(normalizeDraw).sort((a, b) => a.numero - b.numero);
        const keys = [
            'odd', 'sum', 'low', 'primes', 'fibonacci', 'frame', 'multiples3',
            'multiples4', 'emptyRows', 'emptyColumns', 'consecutiveAdjacencies', 'longestRun', 'repeated'
        ];
        const counters = Object.fromEntries(keys.map(key => [key, {}]));
        ordered.forEach((draw, index) => {
            const previous = index ? ordered[index - 1].listaDezenas : [];
            const metrics = OBMLotofacilCore.rawMetrics(draw.listaDezenas, previous);
            keys.forEach(key => {
                if (metrics[key] === null) return;
                counters[key][metrics[key]] = (counters[key][metrics[key]] || 0) + 1;
            });
        });
        return counters;
    }

    function coverage(draws, predicate) {
        if (!draws.length) return 0;
        return draws.filter(predicate).length / draws.length;
    }

    function recommendedCoverage(draws) {
        const ordered = [...draws].map(normalizeDraw).sort((a, b) => a.numero - b.numero);
        let accepted = 0;
        for (let i = 0; i < ordered.length; i++) {
            const previous = i ? ordered[i - 1].listaDezenas : [];
            if (OBMLotofacilCore.applyFilters(ordered[i].listaDezenas, global.OBM_LOTOFACIL_RECOMMENDED, previous)) accepted++;
        }
        return accepted / ordered.length;
    }

    function hotColdWalkForward(draws, windowSize = 100) {
        const ordered = [...draws].map(normalizeDraw).sort((a, b) => a.numero - b.numero);
        if (ordered.length <= windowSize) return null;
        let hotHits = 0;
        let coldHits = 0;
        let tests = 0;
        for (let i = windowSize; i < ordered.length; i++) {
            const frequencies = Array(26).fill(0);
            ordered.slice(i - windowSize, i).forEach(draw => draw.listaDezenas.forEach(n => frequencies[n]++));
            const ranking = Array.from({ length: 25 }, (_, idx) => idx + 1).sort((a, b) => frequencies[b] - frequencies[a] || a - b);
            const hot = new Set(ranking.slice(0, 15));
            const cold = new Set(ranking.slice(-15));
            const actual = ordered[i].listaDezenas;
            hotHits += actual.filter(n => hot.has(n)).length;
            coldHits += actual.filter(n => cold.has(n)).length;
            tests++;
        }
        return {
            tests,
            windowSize,
            hotAverage: hotHits / tests,
            coldAverage: coldHits / tests,
            randomExpectation: 9
        };
    }

    global.OBMLotofacilStatistics = {
        normalizeDraw, numberStatistics, patternSummary, coverage,
        recommendedCoverage, hotColdWalkForward
    };
})(typeof self !== 'undefined' ? self : globalThis);
