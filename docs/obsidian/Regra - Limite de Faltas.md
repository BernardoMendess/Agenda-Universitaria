---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, faltas, frequencia, regras]
---

# Regra - Limite de Faltas

Especificação da regra de cálculo e validação do limite máximo de faltas permitidas nas disciplinas do CampusFlow.

## Diretrizes e Lógica de Negócio

1. **Obrigatoriedade e Validação:**
   - Todo cadastro de disciplina deve possuir um limite máximo de faltas numérico inteiro $\ge 0$.

2. **Limite Zero (Tolerância Zero - RF04):**
   - Caso `limiteMaximoFaltas === 0`, qualquer falta registrada coloca a matéria imediatamente em status crítico / reprovado por falta.
   - `0 faltas`: Status Seguro, não reprovado.
   - $\ge 1$ `falta`: Status Crítico (`#f85149`), reprovado por falta.

3. **Limite Maior que Zero ($> 0$ - RF04 & RF05):**
   - O saldo restante de faltas é calculado como:
     $$\text{Faltas Restantes} = \max(0, \text{Limite Máximo} - \text{Faltas Atuais})$$
   - Percentual de consumo:
     $$\text{Percentual} = \left(\frac{\text{Faltas Atuais}}{\text{Limite Máximo}}\right) \times 100$$
   - **Status Seguro (Verde - `#2ea043`):** Consumo $< 50\%$ do limite.
   - **Status Moderado (Azul/Neutro):** Consumo entre $50\%$ e $74\%$ do limite.
   - **Status Alerta (Amarelo - `#d29922`):** Consumo $\ge 75\%$ do limite.
   - **Status Crítico (Vermelho - `#f85149`):** Limite atingido ou ultrapassado ($\ge 100\%$).

4. **Registro Rápido e Histórico (RF03):**
   - Incremento/decremento rápido (+1 / -1) em 1 toque diretamente no card da disciplina.
   - Decremento bloqueado em zero (sem faltas negativas).
   - Histórico detalhado com data, horário e justificativa opcional.

5. **Exclusão em Cascata:**
   - Ao excluir uma disciplina, todos os registros de faltas associados são excluídos permanentemente do banco local.

## Wikilinks
- [[Disciplina]]
- [[DisciplinaService]]
- [[Falta]]
- [[FrequenciaService]]
- [[Stack Tecnológica]]
