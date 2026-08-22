---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, regras, backup, portabilidade, offline, privacidade]
---

# Regra - Portabilidade e Backup (Exportação/Importação Manual)

Especificação das regras de negócio para geração e restauração manual de dados locais no **CampusFlow** (**RF11**).

## 1. Princípios de Privacidade e Soberania de Dados

* **Privacidade Absoluta (RNF05):** Nenhum dado acadêmico é trafegado para a internet. O arquivo `.json` gerado reside estritamente no armazenamento local do dispositivo ou onde o usuário escolher salvá-lo/compartilhá-lo.
* **100% Offline (RNF01, RNF02):** A exportação e a importação funcionam de forma totalmente isolada.

## 2. Regras de Exportação

1. **Agregação Completa:** O arquivo de backup deve consolidar todos os registros de [[Disciplina]], [[HorarioAula]], [[Falta]], [[Avaliacao]], [[Tarefa]], [[EventoAcademico]] e preferências de [[Notificacao]].
2. **Assinatura e Versão:** Todo backup gerado contém `app: "CampusFlow"` e `versaoSchema: "1.0.0"`.
3. **Estatísticas Embutidas:** Metadados incluem a contagem exata de registros para permitir validação antes da aplicação.

## 3. Regras de Validação

Antes de qualquer restauração, o [[BackupService]] executa:
* **Validação de Sintaxe:** Verifica se o texto é um JSON válido.
* **Validação de Assinatura:** Rejeita arquivos que não possuam `metadados.app === 'CampusFlow'`.
* **Validação de Schema:** Exige que todos os arrays de dados obrigatórios estejam presentes.
* **Integridade Relacional:** Inspeciona chaves estrangeiras (`disciplinaId`) em horários, faltas, avaliações, tarefas e eventos, emitindo avisos detalhados caso existam registros órfãos.

## 4. Modos de Restauração

* **Substituição Total (`SUBSTITUIR`):**
  * Limpa completamente todos os repositórios locais.
  * Restaura todos os registros do arquivo de backup.
  * Preserva configurações personalizadas de notificação.
* **Mesclagem Inteligente (`MESCLAR`):**
  * Importa os dados do backup adicionando-os aos dados já existentes no aparelho, sem apagar registros prévios.

## 5. Reagendamento de Notificações Pós-Restauração

Imediatamente após a conclusão da restauração no banco, o [[BackupService]] aciona `NotificacaoService.sincronizarTodasNotificacoes`:
* Reprograma todos os lembretes de aulas semanais conforme os novos [[HorarioAula]];
* Reprograma avisos de [[Avaliacao]] pendentes e prazos de [[Tarefa]];
* Notifica a interface para recarregar todos os componentes e telas.
