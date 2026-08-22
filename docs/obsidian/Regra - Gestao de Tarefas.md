---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, regras, tarefas, todo, prazos]
---

# Regra — Gestão de Tarefas e To-Do List

Regras de negócio e usabilidade que regem a criação, classificação, prazos e conclusão de tarefas no CampusFlow (RF07 e RNF03).

## 1. Vinculação de Disciplinas

- Uma tarefa pode ser **vinculada** a uma matéria cadastrada ou ser **avulsa** (`disciplinaId = undefined`).
- Quando vinculada, a tarefa herda visualmente o nome e a tag de cor da [[Disciplina]].
- Se a [[Disciplina]] for excluída do sistema, todas as suas tarefas vinculadas são removidas automaticamente em cascata (mantendo as avulsas intactas).

## 2. Ações Rápidas em 1 Toque (RNF03)

- O usuário pode marcar ou desmarcar a conclusão da tarefa com um único toque no checkbox diretamente:
  - Na tela inicial (**Dashboard / Home**).
  - Na aba dedicada de **Tarefas**.
  - Na aba de **Tarefas** dentro dos detalhes da matéria.
- Tarefas concluídas recebem estilo riscado e opacidade reduzida, atualizando instantaneamente os contadores e gráficos de progresso.

## 3. Classificação e Prazos

O status do prazo de tarefas pendentes é avaliado dinamicamente com base na data do dispositivo:

| Status | Condição | Cor do Indicador |
|---|---|---|
| `ATRASADA` | `dataLimite < hoje` | Vermelho (`#f85149`) |
| `HOJE` | `dataLimite == hoje` | Amarelo / Âmbar (`#d29922`) |
| `AMANHA` | `dataLimite == hoje + 1` | Amarelo / Âmbar (`#d29922`) |
| `EM_DIA` | `dataLimite > hoje + 1` | Neutro / Secundário (`#8b949e`) |
| `SEM_PRAZO` | Sem `dataLimite` definida | Neutro / Secundário (`#8b949e`) |

## 4. Prioridades

- **Alta:** Vermelho (`#f85149`) — Atividades críticas com entrega imediata ou alto impacto na nota.
- **Média:** Âmbar (`#d29922`) — Atividades padrão de rotina de estudo (padrão ao criar).
- **Baixa:** Azul (`#3b82f6`) — Leituras complementares e tarefas sem urgência.

## Arquivos Relacionados

- [[Tarefa]]
- [[TarefaService]]
- [[Disciplina]]
