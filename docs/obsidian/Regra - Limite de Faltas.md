---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, faltas, frequencia, regras]
---

# Regra - Limite de Faltas

Especificação da regra de cálculo e validação do limite máximo de faltas permitidas nas disciplinas do CampusFlow.

## Diretrizes
1. **Obrigatoriedade:** Todo cadastro de disciplina deve possuir um limite máximo de faltas numérico inteiro $\ge 0$.
2. **Limite Zero (Tolerância Zero):**
   - Caso `limiteMaximoFaltas === 0`, qualquer falta registrada coloca a matéria imediatamente em status crítico / reprovado por falta.
3. **Limite Maior que Zero ($> 0$):**
   - O saldo restante de faltas é calculado como:
     $$\text{Faltas Restantes} = \text{Limite Máximo} - \text{Faltas Atuais}$$
   - **Status Seguro (Verde):** Consumo $< 50\%$ do limite.
   - **Status Alerta (Amarelo):** Consumo $\ge 75\%$ do limite.
   - **Status Crítico (Vermelho):** Limite atingido ou excedido.

## Wikilinks
- [[Disciplina]]
- [[DisciplinaService]]
