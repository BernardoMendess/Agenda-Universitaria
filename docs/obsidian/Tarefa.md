---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, modelo, tarefas, todo]
---

# Tarefa

A entidade **Tarefa** representa uma atividade, compromisso acadêmico ou pendência pessoal do estudante (ex: leituras, resolução de listas, entregas de relatórios). É o núcleo do módulo de To-Do List do RF07.

## Estrutura da Entidade

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` (UUID) | Sim | Identificador único da tarefa |
| `disciplinaId` | `string \| undefined` | Não | FK para a [[Disciplina]] vinculada; `undefined` para avulsa |
| `titulo` | `string` | Sim | Título da tarefa (mínimo 2, máximo 150 caracteres) |
| `descricao` | `string` | Não | Detalhes, observações ou links complementares |
| `concluida` | `boolean` | Sim | `true` se concluída; `false` se pendente |
| `dataLimite` | `string` (YYYY-MM-DD) | Não | Data limite para conclusão |
| `horarioLimite` | `string` (HH:mm) | Não | Horário limite para entrega/conclusão |
| `prioridade` | `enum PrioridadeTarefa` | Sim | `BAIXA`, `MEDIA`, `ALTA` |
| `dataConclusao` | `string` (ISO) | Não | Timestamp de quando a tarefa foi concluída |
| `dataCriacao` | `string` (ISO) | Sim | Timestamp de criação |
| `dataAtualizacao` | `string` (ISO) | Sim | Timestamp da última modificação |

## DTOs

- `CriarTarefaDTO` — Dados necessários para cadastro (título, descrição, prioridade, prazos e matéria).
- `AtualizarTarefaDTO` — Campos opcionais para edição parcial.
- `FiltroTarefasDTO` — Parâmetros de consulta (disciplina, status `PENDENTES`/`CONCLUIDAS`, `hoje`, `atrasadas`).
- `EstatisticasTarefas` — Contadores de total, pendentes, concluídas, atrasadas e taxa percentual de progresso.
- `TarefaComDisciplina` — Entidade enriquecida com nome e cor da [[Disciplina]] e status de prazo calculado (`HOJE`, `AMANHA`, `ATRASADA`, `EM_DIA`, `SEM_PRAZO`).

## Regras e Serviços Associados

- [[Regra - Gestao de Tarefas]]
- [[TarefaService]]
- [[Disciplina]]
