---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, modelo, grade-horaria, horarios]
---

# GradeHoraria / HorarioAula

A entidade **HorarioAula** representa um bloco semanal de horário de uma aula associada a uma [[Disciplina]]. Permite múltiplos blocos de horários por disciplina em dias distintos da semana.

## Estrutura da Entidade

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` (UUID) | Sim | Identificador único do bloco de horário |
| `disciplinaId` | `string` (UUID) | Sim | Chave estrangeira para a [[Disciplina]] |
| `diaSemana` | `enum` | Sim | `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA`, `SABADO`, `DOMINGO` |
| `horarioInicio` | `string` (HH:mm) | Sim | Horário de início da aula (ex: `"08:00"`) |
| `horarioFim` | `string` (HH:mm) | Sim | Horário de término da aula (ex: `"09:40"`) |
| `localSala` | `string` | Não | Local ou sala específica deste bloco de aula |

## Regras de Negócio Associadas
- [[Regra - Grade Horaria]]
- [[GradeHorariaService]]
- [[Disciplina]]
- [[Stack Tecnológica]]
