# Relatório de Análise Exploratória — Lotofácil

## 1. Escopo e integridade da base

Arquivo analisado: `Lotofácil (1).xlsx`.

- 3.768 concursos válidos e consecutivos, do concurso 1 ao 3768.
- Período registrado: 29/09/2003 a 21/08/2026.
- Cada concurso contém 15 dezenas únicas entre 01 e 25.
- Não foram encontradas lacunas, concursos duplicados, dezenas ausentes ou resultados inválidos.
- Universo combinatório exato: C(25,15) = 3.268.760 combinações.

Todas as distribuições estruturais foram comparadas com a enumeração completa das 3.268.760 combinações possíveis. Portanto, a referência teórica não depende de simulação aleatória.

## 2. Conclusão principal

Os padrões mais frequentes observados no histórico são quase idênticos aos padrões esperados pela matemática combinatória. As diferenças entre frequência histórica e frequência teórica geralmente ficam abaixo de 1 ponto percentual.

Isso significa que os filtros são úteis para:

- Evitar combinações estruturalmente raras.
- Padronizar uma estratégia.
- Equilibrar a carteira.
- Reduzir repetição excessiva entre os próprios jogos.
- Tornar o processo auditável e reproduzível.

Os filtros não tornam uma combinação individual mais provável. Ao eliminar 49% do universo combinatório, também se elimina aproximadamente 49% dos resultados que poderiam ser sorteados.

## 3. Padrões selecionados

| Indicador | Faixa recomendada | Histórico | Teórico exato | Diferença |
|---|---:|---:|---:|---:|
| Ímpares | 6 a 10 | 95,86% | 95,86% | 0,00 p.p. |
| Soma | 161 a 228 | 95,06% | 94,16% | +0,90 p.p. |
| Repetidas do concurso anterior | 7 a 11 | 96,68% | 96,56% | +0,12 p.p. |
| Baixas, de 01 a 13 | 6 a 10 | 96,63% | 95,86% | +0,77 p.p. |
| Primos | 4 a 7 | 91,30% | 91,28% | +0,02 p.p. |
| Fibonacci | 3 a 6 | 92,44% | 92,48% | −0,04 p.p. |
| Moldura | 8 a 11 | 90,74% | 91,28% | −0,54 p.p. |
| Múltiplos de 3 | 3 a 6 | 90,76% | 91,25% | −0,48 p.p. |
| Múltiplos de 4 | 2 a 5 | 95,28% | 94,92% | +0,36 p.p. |
| Linhas vazias | 0 | 97,77% | 97,63% | +0,14 p.p. |
| Colunas vazias | 0 | 97,88% | 97,63% | +0,25 p.p. |
| Adjacências consecutivas | 7 a 10 | 90,63% | 90,08% | +0,55 p.p. |
| Maior sequência consecutiva | 3 a 7 | 94,37% | 93,18% | +1,19 p.p. |

Aplicados simultaneamente, os treze filtros aceitaram 49,81% dos concursos históricos. No universo teórico, os mesmos filtros aceitam 50,58% das combinações. Essa proximidade reforça que as regras capturam a estrutura natural da Lotofácil, e não um viés preditivo comprovado.

## 4. Soma das dezenas

- Menor intervalo histórico com cobertura de pelo menos 90%: 164 a 222, cobrindo 90,13%.
- Intervalo histórico com cobertura de pelo menos 95%: 161 a 228, cobrindo 95,06%.
- Intervalo teórico de 90%: 163 a 222, cobrindo 90,01%.
- Intervalo teórico de 95%: 158 a 228, cobrindo 95,10%.

Foi adotado 161 a 228 como padrão recomendado por conservar aproximadamente 95% do histórico e evitar um corte excessivamente estreito.

## 5. Paridade e distribuição baixa/alta

As faixas de 6 a 10 ímpares e de 6 a 10 dezenas baixas apresentam cobertura superior a 95%. A coincidência praticamente exata entre histórico e teoria mostra que esses padrões derivam principalmente da composição do universo de 25 dezenas.

## 6. Repetição do concurso anterior

Duas apostas de 15 dezenas escolhidas no mesmo universo de 25 precisam compartilhar pelo menos cinco dezenas. A concentração entre 7 e 11 repetidas é consequência direta dessa sobreposição elevada.

- 7 a 11 repetidas: 96,68% no histórico e 96,56% na teoria.
- 8 a 10 repetidas: 78,92% no histórico e 78,93% na teoria.

O intervalo mais amplo, de 7 a 11, foi escolhido para evitar sobreajuste.

## 7. Linhas e colunas

O volante foi tratado como uma matriz 5 × 5:

- Linhas: 01–05, 06–10, 11–15, 16–20 e 21–25.
- Colunas: finais 1/6/11/16/21 até 5/10/15/20/25.

Em 97,77% dos concursos não houve linha vazia. Em 97,88% não houve coluna vazia. O comportamento teórico é 97,63% nos dois casos. Assim, “todas ocupadas” é um filtro amplo e estável, mas não representa vantagem preditiva.

## 8. Sequências consecutivas

Como 15 das 25 dezenas são sorteadas, números consecutivos são normais e numerosos. Rejeitar qualquer sequência seria incompatível com a estrutura da modalidade.

- De 7 a 10 adjacências consecutivas: 90,63% do histórico.
- Maior sequência entre 3 e 7 dezenas: 94,37% do histórico.

O sistema mede “adjacência” como cada ligação n–(n+1). Uma sequência 05–06–07 possui duas adjacências e comprimento máximo igual a três.

## 9. Frequência individual e dezenas quentes

Cada dezena possui probabilidade marginal de 15/25 = 60% por concurso. No histórico:

- Mais frequente: 20, com 2.352 aparições (62,42%).
- Menos frequente: 16, com 2.153 aparições (57,14%).
- Um teste de dispersão que considera a seleção sem reposição das 15 dezenas detecta heterogeneidade no agregado histórico (estatística ajustada 59,20; 24 graus de liberdade; p < 0,001).

Essa diferença agregada não implica previsibilidade. Ela pode refletir flutuação histórica, mudanças de equipamentos, períodos distintos ou outros efeitos acumulados. Uma vantagem real precisa persistir fora da amostra, no concurso seguinte.

No retroteste walk-forward, as 15 dezenas mais frequentes nos 100 concursos anteriores obtiveram média de 9,001 acertos no concurso seguinte. A expectativa aleatória é exatamente 9,000. A diferença é desprezível e não demonstra vantagem para o critério de “dezenas quentes”.

## 10. Estratégia recomendada para melhor aproveitamento

“Melhor aproveitamento” deve ser entendido como melhor organização do orçamento, menor redundância e maior diversidade da carteira, e não como previsão.

1. Usar faixas amplas, próximas de 90% a 97% de cobertura.
2. Evitar filtros estreitos combinados em excesso.
3. Manter frequência equilibrada das dezenas no conjunto de jogos.
4. Reduzir a sobreposição máxima e média entre os jogos da própria carteira.
5. Eliminar jogos duplicados.
6. Registrar a estratégia e os filtros utilizados.
7. Comparar qualquer modelo de pontuação com uma referência aleatória fora da amostra.
8. Definir previamente o orçamento e não aumentá-lo para recuperar perdas.

## 11. Funcionalidades implementadas

- Base histórica local e atualização incremental opcional.
- Seleção de 15 a 25 dezenas.
- Geração de jogos de 15 a 20 dezenas.
- Normalização combinatória das contagens, soma e sequências para jogos de 16 a 20 dezenas, mantendo as faixas comparáveis ao jogo simples de 15.
- Treze filtros macroestruturais.
- Gerador com equilíbrio de frequência e penalização de sobreposição.
- Conferência de 11, 12, 13, 14 e 15 acertos.
- Scanner individual.
- Estatísticas de frequência e atraso.
- Retroteste de dezenas quentes sem informação futura.
- Exportação dos jogos e da auditoria.
- Processamento em segundo plano e gerador alternativo.

## 12. Referências de dados e regras

- Histórico fornecido pelo usuário: `Lotofácil (1).xlsx`.
- Portal oficial das Loterias CAIXA: https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx

## 13. Limitação essencial

A Lotofácil é um jogo de azar. Nenhum padrão histórico, atraso, frequência, associação, filtro ou algoritmo pode garantir premiação. Todos os jogos simples de 15 dezenas possuem a mesma probabilidade de 15 acertos quando o sorteio é uniforme.
