---
data: 2026-08-22
tipo: [regra-de-negocio, arquitetura]
tags: [campusflow, rnf, eficiencia-energetica, bateria, alarmes-nativos, offline]
---

# RNF04 — Eficiência Energética

## Visão Geral

O **RNF04** estabelece que o **CampusFlow** deve apresentar **consumo mínimo de bateria**, evitando rotinas contínuas ou serviços em segundo plano que drene recursos do dispositivo do estudante universitário.

Toda a infraestrutura de lembretes e alarmes baseia-se exclusivamente no **uso de agendadores nativos de alarmes locais** do sistema operacional (`AlarmManager` no Android e `UNUserNotificationCenter` no iOS).

---

## 1. Princípios Arquiteturais de Eficiência

1. **Zero Processamento em Segundo Plano (`0 Background Daemons`):**
   - O aplicativo não instancia serviços em primeiro plano com notificações persistentes desnecessárias nem loops contínuos de verificação em background.
2. **Processamento Orientado a Eventos (`Event-Driven`):**
   - As notificações e alarmes são calculados e registrados de forma determinística no instante exato da criação ou alteração de uma disciplina, horário de aula, prova ou tarefa.
   - Concluído o agendamento no driver local (`[[NotificadorLocalDriver]]`), a aplicação entra em suspensão total (**Idle**), não consumindo ciclos de CPU.
3. **Agendamento Nativo do Sistema Operacional:**
   - O sistema operacional é o encarregado de despertar o dispositivo e emitir a notificação no momento preciso, liberando o app da necessidade de vigília ativa.
4. **Sem Chamadas Periódicas de Rádio / Rede:**
   - Como o app é 100% offline ([[RNF01 - Zero Conectividade]]), não há ativação de antenas 4G/5G ou Wi-Fi para sincronizações em nuvem.

---

## 2. Componentes e Serviços Envolvidos

- **[[EficienciaEnergeticaService]]:** Serviço responsável pela auditoria, monitoramento e diagnóstico do impacto energético.
- **[[NotificadorLocalDriver]]:** Driver de interface nativa de alarmes e feedback tátil.
- **[[NotificacaoService]]:** Orquestrador de agendamento em lote e por evento.
- **[[CardEficienciaEnergetica]]:** Componente visual exibido na tela de Ajustes (`TelaAjustes`), atestando ao usuário a inexistência de processos em segundo plano.

---

## 3. Garantias Auditadas (#bateria #performance)

- **Rotinas ativas em 2º plano:** `0`
- **Uso de WakeLocks:** `0`
- **Tipo de agendamento:** `Agendador Nativo do SO`
- **Impacto estimado na bateria:** `< 0.1% ao dia (Mínimo / Quase Nulo)`
