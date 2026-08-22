---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, servico, calendario, regras, mobile]
---

# CalendarioService

Camada de Serviço responsável pela inteligência de datas, unificação polimórfica de fontes de dados e geração das estruturas de exibição do **Calendário Integrado** (RF09).

## 1. Responsabilidades

1. **Unificação de Fontes:** Consolida em uma lista de `ItemCalendario`:
   - `Avaliacao`: Provas, trabalhos, testes e seminários com datas, notas e horários.
   - `Tarefa`: Entregas e pendências com `dataLimite`, `horarioLimite` e status de conclusão.
   - `GradeSemanal`: Expande os blocos recorrentes de aulas da semana (`SEGUNDA` a `DOMINGO`) em datas de calendário reais para o intervalo requisitado.
   - `EventoAcademico`: Eventos avulsos e especiais com datas e locais específicos.
2. **Geração de Matriz Mensal:** Calcula as 35 a 42 células do grid mensal incluindo dias do mês anterior e próximo para fechamento de semanas completas (Domingo a Sábado).
3. **Geração de Estrutura Semanal:** Gera os 7 dias da semana ativa com cabeçalhos e rótulo do período.
4. **Agrupamento e Ordenação:** Agrupa itens por data (`YYYY-MM-DD`) e ordena cronologicamente por horário de início e categoria de relevância.
5. **Filtragem Dinâmica:** Filtra itens por categoria (`TODOS`, `PROVAS`, `ENTREGAS`, `AULAS`, `EVENTOS`) e por matéria (`disciplinaId`).

## 2. Principais Métodos

```typescript
// Unificação de dados
unificarEventos(avaliacoes, tarefas, gradeSemanal, eventosAcademicos, dataInicioStr, dataFimStr, disciplinas): ItemCalendario[]

// Agrupamento por data
agruparEventosPorData(itens: ItemCalendario[]): Record<string, ItemCalendario[]>

// Filtragem
filtrarEventos(itens, filtroCategoria, disciplinaId): ItemCalendario[]

// Matriz do mês
gerarMatrizMes(ano, mes, eventosPorData, dataHoje): DiaCalendario[]

// Estrutura semanal
gerarSemana(dataReferencia, eventosPorData, dataHoje): SemanaCalendario

// Estatísticas
calcularEstatisticas(itens): EstatisticasCalendario
```

## 3. Wikilinks

- [[Regra - Calendario Integrado]]
- [[EventoAcademico]]
- [[AvaliacaoService]]
- [[TarefaService]]
- [[GradeHorariaService]]
- [[DashboardService]]
