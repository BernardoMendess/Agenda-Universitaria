---
data: 2026-08-22
tipo: [arquitetura, regra-de-negocio]
tags: [campusflow, servico, sqlite, rnf]
---

# PersistenciaService

## Visão Geral

O **`PersistenciaService`** centraliza o controle de diagnóstico, inicialização e auditoria quantitativa da persistência SQLite local, validando o [[RNF02 - Persistência Estritamente Local]].

---

## 1. Métodos Principais

| Método | Retorno | Descrição |
| :--- | :--- | :--- |
| `inicializarPersistencia()` | `Promise<boolean>` | Executa a criação de tabelas e índices via `GerenciadorBancoDados`. |
| `contarRegistrosLocais()` | `Promise<EstatisticasRegistrosLocais>` | Contabiliza o número de entidades salvas no aparelho. |
| `obterStatusPersistencia()` | `Promise<StatusPersistenciaCompleto>` | Retorna relatório consolidado de integridade, motor e registros. |
| `verificarIntegridadeLocal()` | `Promise<boolean>` | Valida se o banco está íntegro e sem dependências externas. |

---

## 2. Relacionamentos

- Consome: [[EsquemaBanco]], `GerenciadorBancoDados` e repositórios locais.
- Interface visual: [[TelaAjustes]].
