const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'app.js'), 'utf8');

test('interface contém todos os oito módulos', () => {
    ['dashboard','selection','generator','filters','checker','statistics','scanner','backtest'].forEach(id => assert.match(html, new RegExp(`id="${id}"`)));
});

test('interface contém os treze grupos de filtros', () => {
    ['paridadeOptions','somaOptions','repetidasOptions','baixasOptions','primosOptions','fibonacciOptions','molduraOptions','multiplos3Options','multiplos4Options','linhasVaziasOptions','colunasVaziasOptions','adjacenciasOptions','maiorSequenciaOptions'].forEach(id => assert.match(html, new RegExp(`id="${id}"`)));
});

test('gerador possui alternativa para falha do Worker', () => {
    assert.match(app, /function generateInMainThread\(/);
    assert.match(app, /worker\.onerror/);
});

test('avisos da geração são visíveis no módulo Gerador', () => {
    const generatorStart = html.indexOf('id="generator"');
    const status = html.indexOf('id="generationStatus"');
    const filtersStart = html.indexOf('id="filters"');
    assert.ok(generatorStart < status && status < filtersStart);
});

test('TXT exporta somente as dezenas, sem numeração dos jogos', () => {
    assert.match(app, /const lines = state\.games\.map\(game => game\.map\(pad\)\.join\(' '\)\);/);
    assert.doesNotMatch(app, /const lines = state\.games\.map\(\(game, index\) =>/);
});

test('conferência permite baixar relatório somente após apuração válida', () => {
    assert.match(html, /id="exportCheckResultsButton"[^>]*disabled/);
    assert.match(app, /exportCheckResultsButton.*addEventListener\('click', exportCheckResults\)/);
    assert.match(app, /state\.lastCheck = \{ draw, results, counts \}/);
    assert.match(app, /obm-lotofacil-resultado-conferencia-/);
});
