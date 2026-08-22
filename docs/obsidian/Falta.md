---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, modelo, falta, frequencia]
---

# Falta

A entidade **Falta** representa um registro de ausência individual do estudante em uma determinada matéria acadêmica ([[Disciplina]]).

## Estrutura da Entidade

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` (UUID) | Sim | Identificador único do registro de falta |
| `disciplinaId` | `string` (UUID) | Sim | Chave estrangeira referenciando a [[Disciplina]] |
| `data` | `string` (`YYYY-MM-DD`) | Sim | Data em que a falta ocorreu |
| `horario` | `string` (`HH:mm`) | Sim | Horário em que a falta foi registrada |
| `justificativa` | `string` | Não | Motivo opcional (atestado médico, consulta, imprevisto) |
| `dataCriacao` | `string` (ISO) | Sim | Carimbo de data/hora do cadastro |

## Resumo de Frequência

O cálculo reativo de faltas agrega as ausências de uma disciplina em um objeto `ResumoFrequencia`:

- `totalFaltas`: Quantidade de faltas computadas.
- `limiteMaximoFaltas`: Limite máximo configurado na disciplina (`null` se a presença não for obrigatória).
- `presencaObrigatoria`: Booleano (`false` se a disciplina não tiver limite de faltas).
- `faltasRestantes`: Saldo restante (`null` se a presença for facultativa).
- `percentualConsumido`: Porcentagem do limite já consumida (`0` se a presença for facultativa).
- `status`: Classificação visual (`SEGURO`, `MODERADO`, `ALERTA`, `CRITICO`).
- `reprovadoPorFalta`: Booleano que indica se o limite foi atingido/excedido (sempre `false` se a presença for facultativa).

## Wikilinks
- [[Disciplina]]
- [[FrequenciaService]]
- [[Regra - Limite de Faltas]]
- [[Stack Tecnológica]]
