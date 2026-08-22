---
data: 2026-08-22
tipo: [regra-de-negocio, arquitetura]
tags: [campusflow, rnf, sqlite, persistencia, offline]
---

# RNF02 — Persistência Estritamente Local

## Visão Geral

O **RNF02** define que a totalidade dos dados da aplicação deve ser armazenada **exclusivamente na memória local do dispositivo** utilizando SQLite ([[EsquemaBanco]]). Não há armazenamento remoto ou espelhamento não solicitado pelo estudante.

---

## 1. Princípios e Garantias

1. **Armazenamento no Aparelho (`campusflow.db`):**
   - Todos os cadastros de disciplinas, grades de horário, registros de faltas, avaliações, notas, tarefas e configurações são gravados em arquivo SQLite local.
2. **Integridade Relacional (Foreign Keys):**
   - Cascata configurada (`ON DELETE CASCADE`) para garantir que a exclusão de uma disciplina remova automaticamente seus horários, faltas e avaliações associadas sem deixar registros órfãos.
3. **Desempenho com WAL e Índices:**
   - Modo `PRAGMA journal_mode = WAL;` e índices secundários para pesquisas rápidas por data e disciplina.
4. **Resiliência a Reinicializações:**
   - O aplicativo restaura o estado instantaneamente na reabertura sem necessidade de carregamento por rede.

---

## 2. Componentes e Entidades Relacionadas

- **[[EsquemaBanco]]:** DDL de todas as 8 tabelas e índices relacionais.
- **[[GerenciadorBancoDados]]:** Motor de inicialização e migrações SQLite.
- **[[PersistenciaService]]:** Serviço de diagnóstico e integridade da base local.
- **[[BackupService]]:** Portabilidade manual através de exportação JSON dos dados locais.
