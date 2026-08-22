---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, mobile, servicos, clean-code]
---

# DisciplinaService

O **DisciplinaService** encapsula a lógica de negócio e validação referente ao ciclo de vida das matérias no CampusFlow.

## Responsabilidades
- Validar integridade dos dados de entrada (nome obrigatório $\ge 2$ caracteres, limite de faltas inteiro $\ge 0$).
- Prover métodos de CRUD (`criarDisciplina`, `buscarPorId`, `listarTodas`, `atualizarDisciplina`, `excluirDisciplina`).
- Garantir isolamento 100% offline através da interface `IDisciplinaRepositorio`.

## Wikilinks
- [[Disciplina]]
- [[Regra - Limite de Faltas]]
- [[Stack Tecnológica]]
