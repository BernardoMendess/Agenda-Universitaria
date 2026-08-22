---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, grade-horaria, horarios, regras]
---

# Regra - Grade Horária

Especificação das regras de negócio aplicadas à montagem, validação e manipulação dos blocos de horário e grade semanal.

## Diretrizes
1. **Padrão de Horário:** Formato de 24 horas (`HH:mm`, ex: `07:30`, `19:00`).
2. **Consistência Cronológica:**
   $$\text{horarioInicio} < \text{horarioFim}$$
3. **Detecção de Conflitos e Sobreposições:**
   - Dois blocos $A$ e $B$ no mesmo dia da semana colidem se:
     $$\max(\text{inicio}_A, \text{inicio}_B) < \min(\text{fim}_A, \text{fim}_B)$$
   - O sistema impede o agendamento de disciplinas distintas no mesmo intervalo de horário.
4. **Múltiplos Blocos por Disciplina:**
   - Uma disciplina pode ter múltiplos horários no mesmo dia (sem colisão interna) ou em dias distintos da semana.
5. **Ordenação Cronológica:**
   - Em todas as visualizações (diária ou semanal), as aulas de cada dia são ordenadas crescentemente por `horarioInicio`.
6. **Exclusão em Cascata:**
   - Ao excluir uma disciplina do sistema, todos os seus blocos de horário vinculados são removidos automaticamente.

## Wikilinks
- [[GradeHoraria]]
- [[GradeHorariaService]]
- [[Disciplina]]
- [[DisciplinaService]]
