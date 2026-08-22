---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, modelo, disciplina]
---

# Disciplina

A entidade **Disciplina** representa uma matéria acadêmica matriculada pelo estudante no semestre. Toda a gestão de frequência, notas, horários e tarefas está vinculada a esta entidade.

## Estrutura da Entidade

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` (UUID) | Sim | Identificador único da disciplina |
| `nome` | `string` | Sim | Nome da matéria (mínimo 2 caracteres) |
| `codigo` | `string` | Não | Código oficial da matéria (ex: CC401) |
| `nomeProfessor` | `string` | Não | Nome do docente |
| `contatoProfessor`| `string` | Não | E-mail ou telefone do docente |
| `localSala` | `string` | Não | Local ou número da sala de aula |
| `anotacoes` | `string` | Não | Links úteis, avisos e notas |
| `corIdentificacao`| `string` (Hex) | Sim | Cor usada em tags e grade horária |
| `limiteMaximoFaltas`| `number` (Int $\ge 0$) | Sim | Limite máximo de faltas permitido |
| `criterioAprovacao` | `enum` | Sim | `ARITMETICA`, `PONDERADA` ou `CUSTOMIZADA` |
| `dataCriacao` | `string` (ISO) | Sim | Data e hora de cadastro |
| `dataAtualizacao` | `string` (ISO) | Sim | Data e hora da última modificação |

## Regras de Negócio Associadas
- [[Regra - Limite de Faltas]]
- [[DisciplinaService]]
- [[Stack Tecnológica]]
