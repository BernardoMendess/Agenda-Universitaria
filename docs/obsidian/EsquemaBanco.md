---
data: 2026-08-22
tipo: [arquitetura, entidade]
tags: [campusflow, sqlite, ddl, banco-de-dados]
---

# EsquemaBanco (SQLite DDL)

## Visão Geral

O arquivo **`EsquemaBanco.ts`** centraliza a definição de todas as tabelas, tipos e índices relacionais do banco SQLite local (`campusflow.db`), atendendo ao [[RNF02 - Persistência Estritamente Local]].

---

## 1. Tabelas Principais

| Tabela | Chave Primária | Relacionamentos |
| :--- | :--- | :--- |
| `disciplinas` | `id` | Entidade raiz |
| `horarios_aula` | `id` | `disciplina_id` $\rightarrow$ `disciplinas(id)` (CASCADE) |
| `faltas` | `id` | `disciplina_id` $\rightarrow$ `disciplinas(id)` (CASCADE) |
| `avaliacoes` | `id` | `disciplina_id` $\rightarrow$ `disciplinas(id)` (CASCADE) |
| `tarefas` | `id` | `disciplina_id` $\rightarrow$ `disciplinas(id)` (SET NULL) |
| `eventos_academicos` | `id` | `disciplina_id` $\rightarrow$ `disciplinas(id)` (SET NULL) |
| `configuracoes_notificacao` | `id` | Tabela de configuração do usuário |
| `notificacoes_agendadas` | `id` | Fila de alarmes e lembretes locais |

---

## 2. Índices de Performance

- `idx_horarios_disciplina`, `idx_horarios_dia`
- `idx_faltas_disciplina`, `idx_faltas_data`
- `idx_avaliacoes_disciplina`, `idx_avaliacoes_data`
- `idx_tarefas_disciplina`, `idx_tarefas_data_limite`
- `idx_eventos_data_inicio`
- `idx_notificacoes_disparo`
