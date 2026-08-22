---
data: 2026-08-22
tipo: arquitetura
tags: [campusflow, mobile, servico, backup, portabilidade, offline]
---

# BackupService

Serviço central de lógica de negócio para geração, validação e restauração de backups manuais do **CampusFlow** (**RF11**). Opera de forma 100% isolada e offline (RNF01, RNF02, RNF05).

## Responsabilidades

* **Coleta de Dados:** Extrai de forma agregada os registros de todos os repositórios locais ([[Disciplina]], [[HorarioAula]], [[Falta]], [[Avaliacao]], [[Tarefa]], [[EventoAcademico]], [[Notificacao]]).
* **Serialização e Metadados:** Empacota os dados em JSON formatado com metadados de assinatura do app e estatísticas quantitativas.
* **Validação Rigorosa:** Inspeciona sintaxe JSON, assinatura `CampusFlow`, versão do schema e integridade relacional entre entidades (ex: horários e faltas apontando para disciplinas válidas).
* **Restauração Segura:** Executa importação atômica em lote (modos `SUBSTITUIR` ou `MESCLAR`).
* **Sincronização de Notificações:** Aciona [[NotificacaoService]] para reprogramar imediatamente todos os alarmes nativos do aparelho após a restauração.

## Principais Métodos

* `obterResumoDadosAtuais()`: Retorna o quantitativo local de itens antes da exportação.
* `gerarBackupJson()`: Gera a string JSON completa formatada com metadados.
* `validarBackupJson(conteudoJson)`: Retorna diagnóstico com status de validade, erros e avisos de integridade.
* `restaurarBackup(conteudoJson, modo)`: Aplica a restauração no banco e dispara o recálculo de alarmes.

## Testes Unitários

* Cobertura em `__tests__/BackupService.test.ts` validando exportação, rejeição de schemas inválidos, integridade relacional, substituição total, mesclagem e idempotência de dados.
