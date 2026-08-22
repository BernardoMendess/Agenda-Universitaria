---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, notas, media, projecao, regras]
---

# Regra - Cálculo de Média e Projeção

Especificação dos algoritmos matemáticos utilizados pelo [[AvaliacaoService]] para calcular a média acadêmica atual e projetar a nota necessária nas avaliações restantes.

## 1. Média Aritmética

Aplicada quando `criterioAprovacao === 'ARITMETICA'`:
- O campo de **peso não é obrigatório** no cadastro da avaliação (definido internamente como padrão `1` sem necessidade de preenchimento).
- As notas são normalizadas para a escala padrão 0-10 caso `notaMaxima` seja diferente de 10: $\text{notaNormalizada} = \left(\frac{\text{nota}}{\text{notaMaxima}}\right) \times 10$.

$$\text{Média} = \frac{\sum_{i=1}^{n} \text{notaNormalizada}_i}{n}$$

## 2. Média Ponderada

Aplicada quando `criterioAprovacao === 'PONDERADA'`:
- O campo de **peso é obrigatório** ($> 0$, ex: 2, 3, 0.4, etc.).
- Cada nota lançada é ponderada pelo seu respectivo peso:

$$\text{Média} = \frac{\sum_{i=1}^{n} (\text{notaNormalizada}_i \times \text{peso}_i)}{\sum_{i=1}^{n} \text{peso}_i}$$

## 3. Projeção — Nota Necessária (Aritmética)

$$\text{Projeção} = \frac{\text{meta} \times \text{total} - \sum_{\text{lançadas}} \text{notaNormalizada}_i}{\text{pendentes}}$$

Exemplo: 3 provas, meta 6.0, lançadas 5.0 e 6.0:
$$\text{Projeção} = \frac{6.0 \times 3 - (5.0 + 6.0)}{1} = \frac{18 - 11}{1} = 7.0$$

## 4. Projeção — Nota Necessária (Ponderada)

$$\text{Projeção} = \frac{\text{meta} \times \sum_{\text{todos}} \text{peso}_i - \sum_{\text{lançadas}} (\text{notaNormalizada}_i \times \text{peso}_i)}{\sum_{\text{pendentes}} \text{peso}_i}$$

Se $\text{Projeção} \le 0$, a aprovação já está garantida mesmo tirando 0 nas pendentes.

## 5. Determinação do Status de Aprovação

| Condição | Status |
|---|---|
| Todas as notas lançadas e média $\ge$ meta | `APROVADO` |
| Projeção $\le 0$ (aprovação garantida) | `APROVADO` |
| Todas as notas lançadas e média $<$ meta | `REPROVADO_POR_NOTA` |
| Projeção $> 10.0$ (impossível alcançar a meta) | `REPROVADO_POR_NOTA` |
| Projeção $\ge 7.5$ (precisa de média alta) | `EM_RISCO` |
| Demais casos em andamento | `EM_CURSO` |

## 6. Nota Mínima de Aprovação

- Campo `notaMinimaAprovacao` na [[Disciplina]] (padrão `6.0`, intervalo $[0, 10]$).
- Configurável por matéria para acomodar diferentes regras institucionais (5.0, 6.0, 7.0, etc.).

## Wikilinks

- [[Avaliacao]]
- [[AvaliacaoService]]
- [[Disciplina]]
