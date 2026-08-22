---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, mobile, dashboard, servico, solid]
---

# DashboardService

Serviço responsável pela lógica de agregação, diagnóstico e consolidação de informações exibidas na tela principal ([[TelaHome]]) do aplicativo mobile **CampusFlow**.

## 1. Responsabilidades

- **Status Temporal de Aulas:** Cálculo dinâmico do status do momento da aula (`EM_ANDAMENTO`, `PROXIMA`, `ENCERRADA`, `FUTURA`) com base no horário atual do dispositivo.
- **Diagnóstico de Matérias em Alerta:** Avaliação combinada de faltas ([[FrequenciaService]]) e notas ([[AvaliacaoService]]) para identificar disciplinas em situação de risco ou atenção (`CRITICO` / `ALERTA`).
- **Métricas Consolidadas:** Agregação de contadores para o painel de resumo do Dashboard (aulas do dia, tarefas pendentes, tarefas atrasadas, matérias em risco e total de disciplinas).
- **Formatação de Data:** Formatação amigável da data atual em português por extenso.

## 2. Métodos Principais

| Método | Descrição |
|---|---|
| `calcularStatusMomentoAula(inicio, fim, ref?)` | Avalia se a aula está em andamento, encerrada ou futura em relação ao horário de referência. |
| `processarAulasDeHoje(aulas, ref?)` | Ordena as aulas cronologicamente e destaca a próxima aula imediata. |
| `identificarMateriasEmAlerta(disciplinas, freq, notas)` | Varre as matérias e detecta alertas de frequência e notas baixas com justificativas textuais. |
| `calcularMetricasDashboard(...)` | Consolida os indicadores para o topo da tela Home. |
| `formatarDataExtenso(data?)` | Retorna a data no formato "DiaDaSemana, DD de Mês". |

## 3. Wikilinks

- [[Regra - Dashboard Inicial]]
- [[FrequenciaService]]
- [[AvaliacaoService]]
- [[GradeHorariaService]]
- [[TarefaService]]
- [[Disciplina]]
