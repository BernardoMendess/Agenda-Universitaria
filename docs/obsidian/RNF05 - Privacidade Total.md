---
data: 2026-08-22
tipo: [regra-de-negocio, arquitetura]
tags: [campusflow, rnf, privacidade, seguranca, sandbox, sqlite, offline]
---

# RNF05 — Privacidade Total

## Visão Geral

O **RNF05** assegura a **Privacidade Absoluta e Soberania dos Dados** do estudante universitário. Nenhum dado acadêmico, pessoal, cadastral, horário de rotina ou estatística sai do dispositivo móvel do usuário.

A aplicação adota uma política de isolamento total de rede, ausência de bibliotecas de telemetria e confinamento dos registros na sandbox do sistema operacional (`campusflow.db` SQLite).

---

## 1. Princípios Arquiteturais de Privacidade

1. **Zero Exfiltração de Dados (`0 Bytes Transmitted`):**
   - Nenhuma informação transita por redes externas, servidores ou serviços de nuvem sem a ação explícita de exportação manual do arquivo de backup pelo usuário ([[BackupService]] / [[Regra - Portabilidade e Backup]]).
2. **Zero Telemetria e Analytics (`0 Tracking SDKs`):**
   - Não há integração com Google Analytics, Firebase Analytics, Facebook SDK, Sentry remoto ou provedores de publicidade/rastreamento.
3. **Isolamento em Sandbox Protegida:**
   - O banco de dados relacional SQLite (`campusflow.db`) é criado no diretório de armazenamento privado da aplicação no sistema operacional móvel, inacessível a outros aplicativos.
4. **Sem Coleta de Identificadores Pessoais ou de Dispositivo:**
   - Não são coletados Device IDs, MAC Addresses, números de telefone, emails ou impressões digitais de hardware.
5. **Auditoria Transparente e Certificação:**
   - O aplicativo disponibiliza um **Certificado de Privacidade Total** auditável diretamente na interface ([[ModalCertificadoPrivacidade]]), detalhando o quantitativo de registros confinados localmente.

---

## 2. Inventário de Dados na Sandbox Local

| Categoria | Tabela SQLite | Descrição | Compartilhamento |
|---|---|---|---|
| `DISCIPLINAS` | `disciplinas` | Nomes, salas, contatos de professores e critérios | **Local (0%)** |
| `GRADE_HORARIA` | `horarios_aulas` | Dias da semana e horários de aulas | **Local (0%)** |
| `FALTAS_FREQUENCIA` | `faltas` | Histórico de faltas, datas e justificativas | **Local (0%)** |
| `AVALIACOES_NOTAS` | `avaliacoes` | Provas, trabalhos, notas e pesos | **Local (0%)** |
| `TAREFAS` | `tarefas` | Afazeres, prazos e status | **Local (0%)** |
| `CONFIGURACOES` | `configuracoes_notificacao` | Preferências de alarmes e antecedência | **Local (0%)** |
| `NOTIFICACOES_LOCAIS` | `notificacoes_agendadas` | Fila de alarmes no agendador nativo | **Local (0%)** |

---

## 3. Componentes e Serviços Envolvidos

- **[[PrivacidadeService]]:** Serviço responsável pela auditoria, geração do inventário de dados e emissão do certificado de privacidade.
- **[[CardPrivacidadeTotal]]:** Card de transparência e garantias na tela de Ajustes (`TelaAjustes`).
- **[[ModalCertificadoPrivacidade]]:** Modal interativo com o Certificado de Privacidade Total e hash de verificação offline.
- **[[ZeroConectividadeService]]:** Guarda de conformidade offline (RNF01).
- **[[BackupService]]:** Portabilidade e backup 100% manuais (RF11).
