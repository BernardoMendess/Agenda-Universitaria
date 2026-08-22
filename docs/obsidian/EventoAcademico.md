---
data: 2026-08-22
tipo: entidade
tags: [campusflow, entidade, calendario, eventos, mobile]
---

# EventoAcademico

Entidade representativa de **Eventos Acadêmicos** avulsos ou especiais no **CampusFlow** (RF09).

## 1. Descrição

Permite o registro e acompanhamento de marcos acadêmicos que não são restritos a uma avaliação ou aula semanal, como:
- Feira de Carreiras e Estágios
- Semanas Acadêmicas e Palestras
- Início e Término do Semestre Letivo
- Feriados, Recessos e Pontos Facultativos
- Prazos de Matrícula e Trancamento

## 2. Atributos da Entidade

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` | Sim | Identificador único (`eve_...`) |
| `titulo` | `string` | Sim | Nome descritivo do evento |
| `data` | `string` | Sim | Data no formato `YYYY-MM-DD` |
| `horarioInicio` | `string` | Não | Horário no formato `HH:mm` |
| `horarioFim` | `string` | Não | Horário no formato `HH:mm` |
| `disciplinaId` | `string` | Não | ID da matéria (quando vinculado) |
| `local` | `string` | Não | Sala, auditório, campus ou link virtual |
| `descricao` | `string` | Não | Detalhes adicionais e anotações |
| `cor` | `string` | Não | Cor de destaque visual no calendário |
| `dataCriacao` | `string` | Sim | Timestamp ISO de criação |
| `dataAtualizacao`| `string` | Sim | Timestamp ISO da última edição |

## 3. Wikilinks

- [[CalendarioService]]
- [[Regra - Calendario Integrado]]
- [[Disciplina]]
- [[Avaliacao]]
- [[Tarefa]]
