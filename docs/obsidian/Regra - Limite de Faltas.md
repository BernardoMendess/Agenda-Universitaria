---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, faltas, frequencia, regras]
---

# Regra - Limite de Faltas e Presença Facultativa

Especificação da regra de cálculo e validação do limite de faltas e controle de presença no CampusFlow.

## Diretrizes e Lógica de Negócio

1. **Campo Opcional (Presença Obrigatória vs. Facultativa):**
   - O campo `limiteMaximoFaltas` é **opcional**.
   - Se o campo não for preenchido (ou for `null`/vazio), a **presença não é obrigatória** (presença facultativa / sem limite de faltas).
   - Quando a presença for facultativa:
     - Faltas podem ser registradas a título informativo no histórico.
     - **Nunca** geram status de reprovação por falta nem alertas críticos de limite estourado.
     - O card exibe o badge **"Presença Facultativa"**.

2. **Presença Obrigatória (Limite $> 0$ - RF04 & RF05):**
   - Caso informado um número inteiro $> 0$, o sistema aplica o controle estrito de presença:
   - Saldo restante de faltas:
     $$\text{Faltas Restantes} = \max(0, \text{Limite Máximo} - \text{Faltas Atuais})$$
   - Percentual de consumo:
     $$\text{Percentual} = \left(\frac{\text{Faltas Atuais}}{\text{Limite Máximo}}\right) \times 100$$
   - **Status Seguro (Verde - `#2ea043`):** Consumo $< 50\%$ do limite.
   - **Status Moderado (Azul - `#388bfd`):** Consumo entre $50\%$ e $74\%$ do limite.
   - **Status Alerta (Amarelo - `#d29922`):** Consumo $\ge 75\%$ do limite.
   - **Status Crítico (Vermelho - `#f85149`):** Limite atingido ou ultrapassado ($\ge 100\%$, reprovado por falta).

3. **Registro Rápido e Histórico (RF03):**
   - Incremento/decremento rápido (+1 / -1) em 1 toque diretamente no card da matéria.
   - Decremento bloqueado em zero (sem faltas negativas).
   - Histórico detalhado com data, horário e justificativa opcional.

4. **Exclusão em Cascata:**
   - Ao excluir uma disciplina, todos os registros de faltas associados são excluídos em cascata no repositório local.

## Wikilinks
- [[Disciplina]]
- [[DisciplinaService]]
- [[Falta]]
- [[FrequenciaService]]
- [[Stack Tecnológica]]
