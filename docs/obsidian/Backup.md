---
data: 2026-08-22
tipo: entidade
tags: [campusflow, mobile, entidade, backup, portabilidade, json]
---

# Backup

Representação e schema da estrutura de dados serializada para exportação e importação manual no **CampusFlow** (**RF11**).

## Visão Geral

Permite a portabilidade completa de todos os dados locais do estudante sem nenhuma dependência de serviços em nuvem ou conectividade remota (**RNF01**, **RNF02**, **RNF05**).

## Estrutura do Arquivo de Backup (`ArquivoBackup`)

O backup é estruturado em duas seções principais: `metadados` e `dados`.

### 1. Metadados (`MetadadosBackup`)

* `versaoSchema`: Versão do formato (atualmente `1.0.0`) para suporte a migrações futuras.
* `app`: Assinatura fixa `'CampusFlow'` para validação de origem.
* `dataExportacao`: Timestamp ISO de quando o arquivo foi gerado.
* `estatisticas`: Contagem total de cada entidade contida no arquivo.

### 2. Seção de Dados (`DadosBackup`)

Agrupamento de arrays de todas as entidades locais:
* `disciplinas`: Lista de [[Disciplina]] com critérios de aprovação e limites de falta.
* `horariosAula`: Lista de [[HorarioAula]] da grade horária semanal.
* `faltas`: Histórico de [[Falta]] registradas.
* `avaliacoes`: Lista de [[Avaliacao]] com datas, pesos e notas lançadas.
* `tarefas`: Lista de [[Tarefa]] pendentes e concluídas.
* `eventosAcademicos`: Lista de [[EventoAcademico]] do calendário.
* `configuracaoNotificacoes`: Preferências de [[Notificacao]] e alarmes locais.

## Modos de Restauração (`ModoRestauracao`)

* **`SUBSTITUIR`**: Apaga a base local atual e restaura rigorosamente os dados do backup.
* **`MESCLAR`**: Importa os registros sem apagar o que já existe no dispositivo.

## Relacionamentos

* Gerenciado por: [[BackupService]]
* Interface: `ModalBackup` na `TelaAjustes`
* Regras de Validação: [[Regra - Portabilidade e Backup]]
