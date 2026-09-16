const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'lotofacil.json'), 'utf8'));

test('base histórica possui 3.768 concursos consecutivos', () => {
    assert.equal(data.quantidade, 3768);
    assert.equal(data.concursos.length, 3768);
    data.concursos.forEach((draw, index) => assert.equal(draw.numero, index + 1));
});

test('todos os concursos têm 15 dezenas únicas entre 01 e 25', () => {
    data.concursos.forEach(draw => {
        assert.equal(draw.listaDezenas.length, 15);
        assert.equal(new Set(draw.listaDezenas).size, 15);
        assert.equal(draw.listaDezenas.every(n => Number.isInteger(n) && n >= 1 && n <= 25), true);
    });
});

test('último concurso corresponde à planilha anexada', () => {
    const latest = data.concursos.at(-1);
    assert.equal(latest.numero, 3768);
    assert.equal(latest.dataApuracao, '21/08/2026');
    assert.deepEqual(latest.listaDezenas, [2,3,4,5,6,7,10,11,12,14,15,17,20,23,24]);
});
