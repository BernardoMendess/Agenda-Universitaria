---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, regras, notificacoes, alarmes, offline]
---

# Regra - Notificações Locais (AlarmManager / Local Notifications)

Especificação das regras de negócio de disparo e antecedência para os alertas do CampusFlow (**RF10**).

## 1. Lembretes de Aulas

* **Origem:** [[HorarioAula]] cadastrados na grade semanal.
* **Gatilho:** Horário de início da aula menos os minutos de antecedência configurados (padrão: 15 minutos).
* **Fórmula de Disparo:**
  $$\text{Horário Disparo} = \text{Horário Início} - \text{Antecedência (min)}$$
* **Comportamento:** Se as aulas forem desativadas nas configurações, todos os lembretes de aula são removidos.

## 2. Lembretes de Provas, Avaliações e Entregas

* **Origem:** [[Avaliacao]] pendentes (sem nota lançada) e [[Tarefa]] pendentes (`concluida: false`) com data limite.
* **Antecedências Múltiplas:** Suporte a múltiplos avisos (padrão: 24h e 2h antes).
* **Cancelamento Automático:**
  * Ao lançar nota em uma avaliação, os lembretes dela são cancelados.
  * Ao marcar uma tarefa como concluída, os lembretes dela são cancelados.

## 3. Alerta Crítico Imediato de Limite de Faltas

* **Condição:** Quando $\text{faltasRestantes} = 0$ ou $\text{reprovadoPorFalta} = \text{true}$ em disciplina com presença obrigatória ($\text{limite} \ge 0$).
* **Ação Imediata:**
  1. Vibração de alerta tátil (`Vibration.vibrate([0, 500, 200, 500])`).
  2. Registro de notificação com prioridade `CRITICA`.
  3. Exibição do `ModalAlertaFaltasCritico` na interface com orientações sobre justificativas de faltas.

## 4. Requisitos Não Funcionais

* **Zero Conectividade (RNF01):** Todo o cálculo e agendamento ocorrem localmente no dispositivo sem serviços de push em nuvem.
* **Eficiência Energética (RNF04):** Uso exclusivo de alarmes agendados do SO sem serviços rodando em background consumindo bateria.
* **Privacidade Total (RNF05):** Nenhuma informação acadêmica sai do dispositivo.
