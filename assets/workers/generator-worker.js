importScripts('../js/core.js');

function weightedCandidate(numbers, size, frequencies) {
    const remaining = [...numbers];
    const result = [];
    while (result.length < size && remaining.length) {
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

function candidateScore(combo, games, frequencies, targetFrequency) {
    const selected = new Set(combo);
    const frequencyPenalty = Object.keys(frequencies).reduce((sum, value) => {
        const number = Number(value);
        const projected = frequencies[number] + Number(selected.has(number));
        return sum + Math.pow(projected - targetFrequency, 2);
    }, 0);
    if (!games.length) return frequencyPenalty;
    const overlaps = games.map(game => OBMLotofacilCore.overlap(combo, game));
    const maxOverlap = Math.max(...overlaps);
    const averageOverlap = overlaps.reduce((a, b) => a + b, 0) / overlaps.length;
    return frequencyPenalty + maxOverlap * 12 + averageOverlap * 2;
}

self.onmessage = function (event) {
    const { numbers, size, count, maxAttempts, options, lastDraw } = event.data;
    const frequencies = Object.fromEntries(numbers.map(n => [n, 0]));
    const seen = new Set();
    const games = [];
    let attempts = 0;

    while (games.length < count && attempts < maxAttempts) {
        let best = null;
        let bestScore = Infinity;
        const targetFrequency = ((games.length + 1) * size) / numbers.length;

        for (let sample = 0; sample < 30 && attempts < maxAttempts; sample++) {
            const combo = weightedCandidate(numbers, size, frequencies);
            const key = combo.join(',');
            attempts++;
            if (seen.has(key) || !OBMLotofacilCore.applyFilters(combo, options, lastDraw)) continue;
            const score = candidateScore(combo, games, frequencies, targetFrequency);
            if (score < bestScore) {
                best = combo;
                bestScore = score;
            }
        }

        if (best) {
            const key = best.join(',');
            seen.add(key);
            games.push(best);
            best.forEach(n => frequencies[n]++);
        }

        if (attempts % 3000 < 30) {
            postMessage({ type: 'progress', generated: games.length, attempts });
        }
    }

    postMessage({ type: 'done', games, attempts, frequencies });
};
