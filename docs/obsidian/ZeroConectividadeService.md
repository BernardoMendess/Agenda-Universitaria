---
data: 2026-08-22
tipo: [arquitetura, regra-de-negocio]
tags: [campusflow, servico, rnf, seguranca]
---

# ZeroConectividadeService

## Visão Geral

O **`ZeroConectividadeService`** é o serviço responsável por auditar, monitorar e garantir que o aplicativo opere com conformidade estrita ao [[RNF01 - Zero Conectividade]].

---

## 1. Métodos Principais

| Método | Retorno | Descrição |
| :--- | :--- | :--- |
| `obterStatus()` | `StatusConectividade` | Retorna metadados confirmando que o modo é `100% Offline` e a privacidade está garantida. |
| `verificarConformidadeOffline()` | `boolean` | Retorna `true` se todas as condições de isolamento estão satisfeitas. |
| `bloquearChamadaExterna(origem)` | `never` | Intercepta e dispara exceção de segurança caso uma chamada não autorizada seja tentada. |

---

## 2. Modelagem

```typescript
export interface StatusConectividade {
  modo: '100% Offline' | 'Isolado';
  conectividadeExternaPermitida: boolean;
  privacidadeGarantida: boolean;
  protocolo: 'Zero Conectividade (RNF01)';
  dadosArmazenadosLocalmente: boolean;
  timestampVerificacao: string;
}
```

---

## 3. Relacionamentos

- Consumido por: [[BadgeStatusOffline]], [[TelaAjustes]] e testes automatizados.
- Referência: [[RNF01 - Zero Conectividade]].
