const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadWorker() {
    const messages = [];
    const context = { console, Math, Set, Map, Array, Number, Object, String, postMessage: message => messages.push(message) };
    context.self = context;
    context.globalThis = context;
    context.importScripts = () => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'core.js'), 'utf8'), context);
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'workers', 'generator-worker.js'), 'utf8'), context);
    return { context, messages };
}

test('Worker gera carteira completa, única e filtrada', () => {
    const { context, messages } = loadWorker();
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const options = {
        paridadeOptions: ['6','7','8','9','10'], somaOptions: ['161-228'],
        repetidasOptions: ['7','8','9','10','11'], linhasVaziasOptions: ['0'], colunasVaziasOptions: ['0']
    };
    const lastDraw = [2,3,4,5,6,7,10,11,12,14,15,17,20,23,24];
    context.self.onmessage({ data: { numbers, size: 15, count: 100, maxAttempts: 100000, options, lastDraw } });
    const done = messages.find(message => message.type === 'done');
    assert.equal(done.games.length, 100);
    assert.equal(new Set(done.games.map(game => game.join(','))).size, 100);
    done.games.forEach(game => assert.equal(context.OBMLotofacilCore.applyFilters(game, options, lastDraw), true));
});

test('Worker equilibra a presença das dezenas', () => {
    const { context, messages } = loadWorker();
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    context.self.onmessage({ data: { numbers, size: 15, count: 100, maxAttempts: 60000, options: {}, lastDraw: [] } });
    const done = messages.find(message => message.type === 'done');
    const values = numbers.map(n => done.frequencies[n]);
    assert.equal(done.games.length, 100);
    assert.ok(Math.max(...values) - Math.min(...values) <= 12);
});

test('Worker gera jogos de 15 a 20 dezenas com filtros recomendados', () => {
    for (let size = 15; size <= 20; size++) {
        const { context, messages } = loadWorker();
        vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'config.js'), 'utf8'), context);
        const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
        const lastDraw = [2,3,4,5,6,7,10,11,12,14,15,17,20,23,24];
        context.self.onmessage({ data: { numbers, size, count: 20, maxAttempts: 80000, options: context.OBM_LOTOFACIL_RECOMMENDED, lastDraw } });
        const done = messages.find(message => message.type === 'done');
        assert.equal(done.games.length, 20, `falha para ${size} dezenas`);
        done.games.forEach(game => assert.equal(context.OBMLotofacilCore.applyFilters(game, context.OBM_LOTOFACIL_RECOMMENDED, lastDraw), true));
    }
});
