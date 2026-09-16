const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { console, Set, Map, Array, Number, Object, String, Math };
context.self = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'core.js'), 'utf8'), context);
const core = context.OBMLotofacilCore;

test('aceita jogos válidos de 15 a 20 dezenas', () => {
    for (let size = 15; size <= 20; size++) assert.equal(core.isValidGame(Array.from({ length: size }, (_, i) => i + 1)), true);
});

test('rejeita tamanho, duplicidade e faixa inválidos', () => {
    assert.equal(core.isValidGame(Array.from({ length: 14 }, (_, i) => i + 1)), false);
    assert.equal(core.isValidGame([...Array.from({ length: 14 }, (_, i) => i + 1), 14]), false);
    assert.equal(core.isValidGame([...Array.from({ length: 14 }, (_, i) => i + 1), 26]), false);
});

test('calcula linhas e colunas no volante 5 por 5', () => {
    const metrics = core.rawMetrics([1,2,3,4,5,6,7,8,9,10,11,12,16,21,25]);
    assert.equal(metrics.emptyRows, 0);
    assert.equal(metrics.emptyColumns, 0);
});

test('calcula adjacências e maior sequência corretamente', () => {
    const metrics = core.rawMetrics([1,2,3,5,7,9,11,13,15,17,19,21,23,24,25]);
    assert.equal(metrics.consecutiveAdjacencies, 4);
    assert.equal(metrics.longestRun, 3);
});

test('calcula repetição com o concurso anterior', () => {
    const previous = Array.from({ length: 15 }, (_, i) => i + 1);
    const current = Array.from({ length: 15 }, (_, i) => i + 6);
    assert.equal(core.rawMetrics(current, previous).repeated, 10);
});

test('aplica faixas recomendadas ao equivalente de 15 dezenas', () => {
    const game = Array.from({ length: 20 }, (_, i) => i + 1);
    const config = { somaOptions: ['150-170'], paridadeOptions: ['8'] };
    assert.equal(core.applyFilters(game, config, []), true);
    assert.equal(core.applyFilters(game, { somaOptions: ['100-120'] }, []), false);
});

test('contagem combinatória é exata', () => {
    assert.equal(core.combinationCount(25, 15), 3268760);
    assert.equal(core.combinationCount(20, 15), 15504);
});

test('normaliza sequências de jogos maiores ao equivalente de 15 dezenas', () => {
    assert.equal(core.normalizeAdjacenciesTo15(15, 20), 8);
    assert.equal(core.normalizeLongestRunTo15(12, 20), 7);
});

test('importador rejeita linhas inválidas e jogos duplicados', () => {
    const valid = Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0')).join(' ');
    const parsed = core.parseGames(`001: ${valid}\n${valid}\n01 01 02 03 04 05 06 07 08 09 10 11 12 13 14\n`);
    assert.equal(parsed.games.length, 1);
    assert.equal(parsed.report.duplicates, 1);
    assert.equal(parsed.report.invalid, 1);
});

test('gera relatório completo da conferência com resumo e identificação dos jogos', () => {
    const draw = Array.from({ length: 15 }, (_, i) => i + 1);
    const results = [
        { index: 0, game: draw, hits: 15 },
        { index: 1, game: Array.from({ length: 15 }, (_, i) => i + 6), hits: 10 }
    ];
    const report = core.buildCheckReport(draw, results, '16/09/2026 21:00:00');
    assert.match(report, /Dezenas sorteadas: 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15/);
    assert.match(report, /15 acertos: 1/);
    assert.match(report, /Abaixo de 11 acertos: 1/);
    assert.match(report, /Jogo 1 \| 15 acertos \| 01 02 03/);
    assert.match(report, /Jogo 2 \| 10 acertos \| 06 07 08/);
});
