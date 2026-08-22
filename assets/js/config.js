(function (global) {
    'use strict';

    global.OBM_LOTOFACIL_RECOMMENDED = {
        paridadeOptions: ['6', '7', '8', '9', '10'],
        somaOptions: ['161-228'],
        repetidasOptions: ['7', '8', '9', '10', '11'],
        baixasOptions: ['6', '7', '8', '9', '10'],
        primosOptions: ['4', '5', '6', '7'],
        fibonacciOptions: ['3', '4', '5', '6'],
        molduraOptions: ['8', '9', '10', '11'],
        multiplos3Options: ['3', '4', '5', '6'],
        multiplos4Options: ['2', '3', '4', '5'],
        linhasVaziasOptions: ['0'],
        colunasVaziasOptions: ['0'],
        adjacenciasOptions: ['7', '8', '9', '10'],
        maiorSequenciaOptions: ['3-7']
    };

    global.OBM_LOTOFACIL_FILTER_META = [
        { id: 'paridadeOptions', label: 'Ímpares', historical: 95.86, theoretical: 95.86 },
        { id: 'somaOptions', label: 'Soma', historical: 95.06, theoretical: 94.16 },
        { id: 'repetidasOptions', label: 'Repetidas do concurso anterior', historical: 96.68, theoretical: 96.56 },
        { id: 'baixasOptions', label: 'Dezenas baixas (01–13)', historical: 96.63, theoretical: 95.86 },
        { id: 'primosOptions', label: 'Primos', historical: 91.30, theoretical: 91.28 },
        { id: 'fibonacciOptions', label: 'Fibonacci', historical: 92.44, theoretical: 92.48 },
        { id: 'molduraOptions', label: 'Moldura', historical: 90.74, theoretical: 91.28 },
        { id: 'multiplos3Options', label: 'Múltiplos de 3', historical: 90.76, theoretical: 91.25 },
        { id: 'multiplos4Options', label: 'Múltiplos de 4', historical: 95.28, theoretical: 94.92 },
        { id: 'linhasVaziasOptions', label: 'Todas as linhas ocupadas', historical: 97.77, theoretical: 97.63 },
        { id: 'colunasVaziasOptions', label: 'Todas as colunas ocupadas', historical: 97.88, theoretical: 97.63 },
        { id: 'adjacenciasOptions', label: 'Adjacências consecutivas', historical: 90.63, theoretical: 90.08 },
        { id: 'maiorSequenciaOptions', label: 'Maior sequência', historical: 94.37, theoretical: 93.18 }
    ];
})(typeof self !== 'undefined' ? self : globalThis);
