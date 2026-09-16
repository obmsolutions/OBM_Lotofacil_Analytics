(function (global) {
    'use strict';

    const CACHE_KEY = 'obm-lotofacil-incremental-v1';
    const API = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';

    function normalize(draw) {
        return {
            numero: Number(draw.numero),
            dataApuracao: draw.dataApuracao || '',
            listaDezenas: (draw.listaDezenas || []).map(Number).sort((a, b) => a - b)
        };
    }

    function baseDraws() {
        return (global.OBM_LOTOFACIL_DATA?.concursos || []).map(normalize);
    }

    function cachedDraws() {
        try {
            return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]').map(normalize);
        } catch (_) {
            return [];
        }
    }

    function all() {
        const map = new Map();
        [...baseDraws(), ...cachedDraws()].forEach(draw => {
            if (draw.numero && draw.listaDezenas.length === 15) map.set(draw.numero, draw);
        });
        return [...map.values()].sort((a, b) => a.numero - b.numero);
    }

    async function fetchContest(number = '') {
        const response = await fetch(number ? `${API}/${number}` : API, { cache: 'no-store' });
        if (!response.ok) throw new Error(`API da Caixa respondeu com status ${response.status}.`);
        const draw = normalize(await response.json());
        if (!draw.numero || draw.listaDezenas.length !== 15 || new Set(draw.listaDezenas).size !== 15) {
            throw new Error('A API retornou um concurso incompleto ou inválido.');
        }
        return draw;
    }

    async function synchronize(onProgress) {
        const current = all();
        const latestLocal = current.at(-1)?.numero || 0;
        const latestRemote = await fetchContest();
        if (latestRemote.numero <= latestLocal) {
            return { added: 0, latest: latestLocal, draws: current };
        }

        const additions = [];
        for (let contest = latestLocal + 1; contest <= latestRemote.numero; contest++) {
            try {
                const draw = contest === latestRemote.numero ? latestRemote : await fetchContest(contest);
                additions.push(draw);
                onProgress?.({ contest, latest: latestRemote.numero });
            } catch (error) {
                throw new Error(`Falha ao obter o concurso ${contest}: ${error.message}`);
            }
        }
        const existingCache = cachedDraws();
        const map = new Map([...existingCache, ...additions].map(draw => [draw.numero, draw]));
        localStorage.setItem(CACHE_KEY, JSON.stringify([...map.values()]));
        return { added: additions.length, latest: latestRemote.numero, draws: all() };
    }

    global.OBMLotofacilDataStore = { all, synchronize, fetchContest };
})(typeof self !== 'undefined' ? self : globalThis);
