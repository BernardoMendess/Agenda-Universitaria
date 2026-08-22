---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, mobile, servicos, grade-horaria, clean-code]
---

# GradeHorariaService

O **GradeHorariaService** gerencia a persistência, validação temporal, detecção de conflitos de horários e agregação da grade horária semanal no CampusFlow.

## Responsabilidades
- Validar formato de horários (padrão HH:mm entre 00:00 e 23:59).
- Validar consistência cronológica (`horarioInicio < horarioFim`).
- Detectar sobreposição e conflitos de horários entre diferentes disciplinas no mesmo dia da semana.
- Prover métodos de agregação semanal (`obterGradeSemanal`, `obterAulasDoDia`, `obterAulasDeHoje`).
- Executar substituição em lote dos blocos de horário de uma disciplina (`definirHorariosDisciplina`).

## Wikilinks
- [[GradeHoraria]]
- [[Regra - Grade Horaria]]
- [[Disciplina]]
- [[DisciplinaService]]
- [[Stack Tecnológica]]
