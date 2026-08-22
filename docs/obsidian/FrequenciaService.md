---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, backend, mobile, servicos, frequencia]
---

# FrequenciaService

O **FrequenciaService** é o serviço responsável por encapsular todas as regras de negócio de cálculo de frequência, dedução de faltas, validação de limites e gestão do histórico local de ausências (Offline-First).

## Métodos Disponíveis

### `incrementarFalta(disciplinaId: string, justificativa?: string)`
Registra rapidamente uma falta (+1) com data e horário atuais (ou fornecidos) e retorna a falta e o resumo atualizado.

### `decrementarFalta(disciplinaId: string)`
Remove a falta mais recente registrada da disciplina (-1). Impede que o contador de faltas fique negativo.

### `registrarFaltaDetalhada(dados: CriarFaltaDTO)`
Valida formatos de data (`AAAA-MM-DD`) e horário (`HH:mm`), adicionando uma falta com justificativa customizada.

### `removerFaltaPorId(id: string, disciplinaId: string)`
Remove uma falta específica selecionada no histórico da matéria e recalcula o saldo restante.

### `obterHistorico(disciplinaId: string)`
Retorna o histórico ordenado decrescente por data e horário.

### `calcularResumoFrequencia(disciplinaId: string)`
Calcula o saldo restante e classifica o status de acordo com [[Regra - Limite de Faltas]].

## Wikilinks
- [[Falta]]
- [[Disciplina]]
- [[Regra - Limite de Faltas]]
- [[DisciplinaService]]
- [[Stack Tecnológica]]
