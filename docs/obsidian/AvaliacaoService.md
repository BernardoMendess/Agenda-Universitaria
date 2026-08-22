---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, backend, servico, avaliacoes, notas]
---

# AvaliacaoService

Serviço responsável pela lógica de negócio do módulo de avaliações e notas (RF06). Implementa os algoritmos de cálculo de médias e projeção de nota necessária para aprovação.

## Métodos Públicos

| Método | Retorno | Descrição |
|---|---|---|
| `criarAvaliacao(dados)` | `Avaliacao` | Valida e cadastra nova avaliação |
| `atualizarAvaliacao(id, dados)` | `Avaliacao` | Atualiza dados de avaliação existente |
| `lancarNota(id, nota)` | `{ avaliacao, resumo }` | Lança nota e recalcula o desempenho |
| `removerNota(id)` | `{ avaliacao, resumo }` | Remove nota (seta `null`) |
| `excluirAvaliacao(id)` | `boolean` | Exclui a avaliação |
| `listarPorDisciplina(disciplinaId)` | `Avaliacao[]` | Lista em ordem cronológica |
| `obterProximasAvaliacoes(limite?)` | `Avaliacao & { disciplinaNome, corIdentificacao }[]` | Próximas avaliações futuras pendentes |
| `calcularDesempenho(disciplinaId)` | `ResumoDesempenhoDisciplina` | Resumo de notas de uma disciplina |
| `calcularDesempenhosEmLote(disciplinas)` | `Record<string, ResumoDesempenho>` | Resumos em lote para renderização de listas |

## Dependências (Injeção via Construtor)

- `IAvaliacaoRepositorio` — Persistência das avaliações.
- `IDisciplinaRepositorio` — Busca de dados da disciplina (critério de aprovação e nota mínima).

## Regras Implementadas

- Validação de título (mínimo 2 chars), data (AAAA-MM-DD), horário (HH:mm), peso ($\ge 0$) e nota máxima ($> 0$).
- Nota lançada deve ser $\in [0, notaMaxima]$.
- Cálculo delegado a `computarDesempenho()` com dispatch para média aritmética ou ponderada conforme `criterioAprovacao`.

## Wikilinks

- [[Regra - Calculo de Media e Projecao]]
- [[Avaliacao]]
- [[Disciplina]]
- [[Stack Tecnológica]]
