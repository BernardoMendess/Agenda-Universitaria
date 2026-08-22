---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, notas, media, projecao, regras]
---

# Regra - Cálculo de Média e Projeção

Especificação dos algoritmos matemáticos utilizados pelo [[AvaliacaoService]] para calcular a média acadêmica atual e projetar a nota necessária nas avaliações restantes.

## 1. Média Aritmética

Aplicada quando `criterioAprovacao === 'ARITMETICA'`:

$$\text{Média} = \frac{\sum_{i=1}^{n} \text{nota}_i}{n}$$

Onde $n$ é o número de avaliações com nota lançada.

## 2. Média Ponderada

Aplicada quando `criterioAprovacao === 'PONDERADA'`:

$$\text{Média} = \frac{\sum_{i=1}^{n} \text{nota}_i \times \text{peso}_i}{\sum_{i=1}^{n} \text{peso}_i}$$

## 3. Projeção — Nota Necessária (Aritmética)

$$\text{Projeção} = \frac{\text{meta} \times \text{total} - \sum_{\text{lançadas}} \text{nota}_i}{\text{pendentes}}$$

Exemplo: 3 provas, meta 6.0, lançadas 5.0 e 6.0:
$$\text{Projeção} = \frac{6.0 \times 3 - (5.0 + 6.0)}{1} = \frac{18 - 11}{1} = 7.0$$

## 4. Projeção — Nota Necessária (Ponderada)

$$\text{Projeção} = \frac{\text{meta} \times \sum_{\text{todos}} \text{peso}_i - \sum_{\text{lançadas}} (\text{nota}_i \times \text{peso}_i)}{\sum_{\text{pendentes}} \text{peso}_i}$$

## 5. Determinação do Status de Aprovação

| Condição | Status |
|---|---|
| Todas as notas lançadas e média $\ge$ meta | `APROVADO` |
| Projeção $\le 0$ (aprovação já garantida) | `APROVADO` |
| Todas as notas lançadas e média $<$ meta | `REPROVADO_POR_NOTA` |
| Projeção $>$ nota máxima da pendente | `REPROVADO_POR_NOTA` |
| Projeção $\ge 75\%$ da nota máxima | `EM_RISCO` |
| Demais casos | `EM_CURSO` |

## 6. Nota Mínima de Aprovação

- Campo `notaMinimaAprovacao` na [[Disciplina]] (padrão `6.0`, intervalo $[0, 10]$).
- Configurável por matéria para acomodar diferentes regras institucionais.

## Wikilinks

- [[Avaliacao]]
- [[AvaliacaoService]]
- [[Disciplina]]
