---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, mobile, servico, tarefas, todo]
---

# TarefaService

O **TarefaService** centraliza toda a lógica de negócios, validações, cálculos de status de prazo e operações de To-Do List no CampusFlow (RF07).

## Responsabilidades

1. **Validação de Dados:**
   - Garantir obrigatoriedade e tamanho do título (2 a 150 caracteres).
   - Validar formatos de data (`YYYY-MM-DD`) e horário (`HH:mm`).
   - Verificar a existência da [[Disciplina]] quando vinculada.
2. **Cálculo de Status de Prazos:**
   - Classificação dinâmica em `HOJE`, `AMANHA`, `ATRASADA`, `EM_DIA` e `SEM_PRAZO`.
   - Cálculo de dias restantes até o vencimento.
3. **Alternância e Conclusão Rápida:**
   - Alternância em 1 toque (`alternarStatusConclusao`), registrando ou removendo o timestamp `dataConclusao`.
4. **Estatísticas e Resumos:**
   - Cálculo de totais, pendências, atrasos e percentual geral ou filtrado por matéria.
5. **Exclusão e Cascata:**
   - Exclusão individual de tarefas e exclusão em lote quando uma [[Disciplina]] é removida no [[DisciplinaService]].

## Métodos Principais

```typescript
criarTarefa(dados: CriarTarefaDTO): Promise<Tarefa>
atualizarTarefa(id: string, dados: AtualizarTarefaDTO): Promise<Tarefa>
alternarStatusConclusao(id: string): Promise<Tarefa>
marcarComoConcluida(id: string): Promise<Tarefa>
marcarComoPendente(id: string): Promise<Tarefa>
excluirTarefa(id: string): Promise<boolean>
listarComFiltros(filtro?: FiltroTarefasDTO): Promise<TarefaComDisciplina[]>
obterTarefasPendentesProximas(limite?: number): Promise<TarefaComDisciplina[]>
obterEstatisticas(disciplinaId?: string): Promise<EstatisticasTarefas>
excluirTarefasPorDisciplina(disciplinaId: string): Promise<number>
```

## Arquivos Relacionados

- [[Tarefa]]
- [[Regra - Gestao de Tarefas]]
- [[DisciplinaService]]
