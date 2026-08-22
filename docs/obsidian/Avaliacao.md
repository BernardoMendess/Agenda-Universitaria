---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, modelo, avaliacao, notas]
---

# Avaliacao

A entidade **Avaliacao** representa uma atividade acadêmica avaliativa (prova, trabalho, teste, seminário, etc.) vinculada a uma [[Disciplina]]. É o núcleo do módulo de gestão de notas do RF06.

## Estrutura da Entidade

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` (UUID) | Sim | Identificador único da avaliação |
| `disciplinaId` | `string` | Sim | FK para a [[Disciplina]] vinculada |
| `titulo` | `string` | Sim | Título da avaliação (mínimo 2 caracteres) |
| `tipo` | `enum TipoAvaliacao` | Sim | `PROVA`, `TRABALHO`, `TESTE`, `SEMINARIO`, `OUTRO` |
| `data` | `string` (YYYY-MM-DD) | Sim | Data agendada para a avaliação |
| `horario` | `string` (HH:mm) | Não | Horário da avaliação |
| `peso` | `number` ($\ge 0$) | Sim | Peso na média ponderada (padrão 1) |
| `notaMaxima` | `number` ($> 0$) | Sim | Nota máxima possível (padrão 10.0) |
| `nota` | `number \| null` | Não | Nota obtida; `null` = pendente |
| `descricao` | `string` | Não | Conteúdo cobrado, instruções |
| `dataCriacao` | `string` (ISO) | Sim | Data e hora de cadastro |
| `dataAtualizacao` | `string` (ISO) | Sim | Data e hora da última modificação |

## DTOs

- `CriarAvaliacaoDTO` — Campos necessários para criar, excluindo `id`, `nota`, timestamps.
- `AtualizarAvaliacaoDTO` — Campos opcionais para edição (exceto `disciplinaId`).
- `LancarNotaDTO` — `{ nota: number | null }` para lançamento/remoção de nota.

## Resumo de Desempenho

A interface `ResumoDesempenhoDisciplina` é calculada pelo [[AvaliacaoService]] e contém:
- `mediaAtual` — Média aritmética ou ponderada das notas lançadas.
- `projecaoNotaNecessaria` — Nota media necessária nas avaliações pendentes para atingir a meta.
- `statusAprovacao` — `APROVADO`, `EM_CURSO`, `EM_RISCO`, `REPROVADO_POR_NOTA`.
- `mensagemProjecao` — Texto explicativo para exibição na UI.

## Regras de Negócio e Serviços Associados

- [[Regra - Calculo de Media e Projecao]]
- [[AvaliacaoService]]
- [[Disciplina]]
