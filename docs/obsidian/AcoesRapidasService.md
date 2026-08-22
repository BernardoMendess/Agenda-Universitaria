---
data: 2026-08-22
tipo: [arquitetura, servico]
tags: [campusflow, servico, usabilidade, acoes-rapidas, rnf03]
---

# AcoesRapidasService

## Visão Geral

O **AcoesRapidasService** é a camada de serviço responsável por padronizar, registrar e fornecer inteligência para as ações rápidas executadas em **1 toque** diretamente no Dashboard da aplicação ([[RNF03 - Usabilidade Mobile (Ações em 1 Toque)]]).

---

## 1. Métodos Principais

| Método | Descrição |
|---|---|
| `gerarMensagemFeedbackFalta` | Constrói a mensagem contextual de incremento/decremento com dados de limite |
| `gerarMensagemFeedbackTarefa` | Constrói a mensagem contextual de conclusão/reabertura de tarefa |
| `registrarAcao` | Armazena a ação rápida no topo da pilha de histórico |
| `criarFeedback` | Produz o objeto `FeedbackAcaoRapida` com níveis de severidade (SUCESSO, ALERTA) |
| `obterUltimaAcao` / `desfazerUltimaAcao` | Permite recuperação e desfecho reverso em 1 toque (Undo) |
| `validarConformidadeUsabilidade` | Valida se uma operação seguiu os critérios de usabilidade 1 toque do RNF03 |

---

## 2. Tipos de Ação Rápida

```typescript
type TipoAcaoRapida =
  | 'INCREMENTAR_FALTA'
  | 'DECREMENTAR_FALTA'
  | 'CONCLUIR_TAREFA'
  | 'REABRIR_TAREFA';
```

---

## 3. Relacionamento

- Consumido por: `[[useDashboard]]`
- Renderizado por: `[[BarraAcaoRapidaFeedback]]`, `[[TelaHome]]`
- Referenciado por: `[[RNF03 - Usabilidade Mobile (Ações em 1 Toque)]]`
