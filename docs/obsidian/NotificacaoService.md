---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, mobile, servico, notificacoes, offline]
---

# NotificacaoService

Serviço central de lógica de negócio e agendamento de lembretes e alarmes locais (**RF10**). Funciona no modelo **100% Offline** (RNF01, RNF04, RNF05).

## Responsabilidades

* Gerenciar preferências do usuário via [[ConfiguracaoNotificacaoRepositorio]].
* Calcular horários de disparo de lembretes de aulas da [[GradeHorariaService]] com antecedência configurada.
* Calcular múltiplos lembretes locais para [[Avaliacao]] (provas, trabalhos) e [[Tarefa]] pendente.
* Avaliar instantaneamente a frequência e emitir alerta crítico sonoro e tátil quando o limite de faltas é atingido ([[Regra - Limite de Faltas]]).
* Sincronizar todos os alarmes em lote (`sincronizarTodasNotificacoes`).

## Principais Métodos

* `obterConfiguracao()`: Retorna as opções salvas de antecedência e flags ativas.
* `atualizarConfiguracao(dados)`: Salva novas preferências.
* `agendarLembretesAulas(horarios, disciplinas, antecedenciaMinutos)`: Agenda alarmes semanais de aulas.
* `agendarLembretesAvaliacao(avaliacao, disciplinaNome, cor, horas)`: Agenda alertas para avaliações pendentes.
* `agendarLembretesTarefa(tarefa, disciplinaNome, cor, horas)`: Agenda alertas para tarefas com prazo.
* `verificarEDispararAlertaFaltas(disciplina, resumo)`: Emite alerta tátil e cria notificação de emergência ao zerar saldo de faltas ou reprovar.
* `cancelarLembretesPorReferencia(referenciaId)`: Remove agendamentos ao concluir ou excluir item.
* `sincronizarTodasNotificacoes(disciplinas, horarios, avaliacoes, tarefas)`: Recalcula e sincroniza todo o ecossistema.
