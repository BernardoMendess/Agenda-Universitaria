---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, regras, dashboard, frequencia, notas, mobile]
---

# Regra - Dashboard Inicial

Especificação das regras de negócio aplicadas no **Dashboard Inicial ("Hoje")** (RF08) para centralizar a gestão acadêmica diária do estudante.

## 1. Visão das Aulas do Dia

1. As aulas de hoje são filtradas pelo dia da semana atual (`converterDateParaDiaSemana`).
2. As aulas são ordenadas cronologicamente por `horarioInicio`.
3. Cada aula recebe um status temporal dinâmico:
   - **`EM_ANDAMENTO` (Agora):** Quando $\text{horárioInício} \le \text{horaAtual} \le \text{horárioFim}$.
   - **`PROXIMA`:** Primeira aula futura do dia após as já encerradas/em andamento.
   - **`FUTURA`:** Aulas subsequentes no dia.
   - **`ENCERRADA`:** Quando $\text{horaAtual} > \text{horárioFim}$.

## 2. Critérios para Alerta de Matérias (Faltas ou Notas Baixas)

Uma matéria é incluída na seção de **Diagnóstico Acadêmico / Matérias em Alerta** se atender a pelo menos uma das seguintes condições:

### A. Alerta de Frequência
- **Crítico (Limite Zero com Faltas):** Matéria com `limiteMaximoFaltas === 0` e $\text{totalFaltas} > 0$.
- **Crítico (Limite Atingido/Excedido):** Matéria com `limiteMaximoFaltas > 0` e $\text{totalFaltas} \ge \text{limiteMaximoFaltas}$.
- **Alerta (Consumo $\ge 75\%$):** Matéria com $\text{percentualConsumido} \ge 75\%$ do limite de faltas.

### B. Alerta de Desempenho de Notas
- **Crítico (Reprovado por Nota):** `statusAprovacao === 'REPROVADO_POR_NOTA'` (média final $< \text{meta}$ ou projeção necessária $>$ nota máxima da avaliação).
- **Alerta (Em Risco):** `statusAprovacao === 'EM_RISCO'` (projeção necessária $\ge 75\%$ da nota máxima).
- **Alerta (Média Parcial Abaixo do Mínimo):** $\text{mediaAtual} < \text{notaMinimaAprovacao}$ em matéria com avaliações pendentes.

## 3. Ações em 1 Toque (RNF03)

- **Conclusão de Tarefas:** Checkbox direto no card da tela Home sem abrir modal ou navegar.
- **Registro Rápido de Falta:** Botão `+1 Falta` diretamente no card da aula de hoje.
- **Criação Rápida:** Botão de atalho para abrir o formulário de tarefa diretamente no Dashboard.

## 4. Wikilinks

- [[DashboardService]]
- [[Regra - Limite de Faltas]]
- [[Regra - Calculo de Media e Projecao]]
- [[Regra - Gestao de Tarefas]]
- [[Regra - Grade Horaria]]
