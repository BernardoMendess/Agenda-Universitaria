---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, notificacoes, alarmes, offline]
---

# Notificacao

Entidade responsável pela representação de lembretes locais e alarmes do CampusFlow (**RF10**), bem como as configurações personalizadas do usuário.

## Estrutura da Entidade

```typescript
export type TipoNotificacao = 'AULA' | 'AVALIACAO' | 'TAREFA' | 'LIMITE_FALTAS';
export type PrioridadeNotificacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface NotificacaoAgendada {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  referenciaId: string;
  disciplinaId?: string;
  disciplinaNome?: string;
  disciplinaCor?: string;
  dataHoraDisparo?: string;
  diaSemana?: DiaSemana;
  horarioInicio?: string;
  antecedenciaMinutos?: number;
  antecedenciaHoras?: number;
  prioridade: PrioridadeNotificacao;
  ativa: boolean;
  dataCriacao: string;
}
```

## Configurações do Usuário (`ConfiguracaoNotificacao`)

* `aulasAtivas`: `boolean` (padrão `true`)
* `antecedenciaAulaMinutos`: `number` (padrão `15` minutos)
* `avaliacoesAtivas`: `boolean` (padrão `true`)
* `antecedenciaAvaliacoesHoras`: `number[]` (padrão `[24, 2]` - 24h e 2h antes)
* `tarefasAtivas`: `boolean` (padrão `true`)
* `antecedenciaTarefasHoras`: `number[]` (padrão `[24, 2]` - 24h e 2h antes)
* `alertaFaltasAtivo`: `boolean` (padrão `true`)
* `somHabilitado`: `boolean` (padrão `true`)
* `vibracaoHabilitada`: `boolean` (padrão `true`)

## Relacionamentos

* Vincula-se a [[Disciplina]], [[HorarioAula]], [[Avaliacao]] e [[Tarefa]].
* Gerenciado pelo [[NotificacaoService]].
