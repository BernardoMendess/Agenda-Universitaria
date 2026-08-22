---
data: 2026-08-22
tipo: [regra-de-negocio, arquitetura]
tags: [campusflow, rnf, seguranca, offline, zero-conectividade]
---

# RNF01 — Zero Conectividade (Offline por Padrão)

## Visão Geral

O **RNF01** estabelece como princípio inegociável que o **CampusFlow** opera de forma **100% autônoma e isolada** no dispositivo do estudante universitário. O aplicativo não realiza requisições para servidores web, APIs externas, banco de dados em nuvem, ferramentas de telemetria ou analytics.

---

## 1. Princípios Arquiteturais

1. **Zero Chamadas de Rede (`0 Network I/O`):**
   - Não há dependências de bibliotecas de requisição remota em tempo de execução (sem `axios`, `fetch` externo ou WebSockets).
2. **Ativos Estritamente Locais:**
   - Ícones, fontes, estilos e assets visuais estão embutidos localmente no pacote do app, dispensando CDNs.
3. **Persistência Segura e Isolada:**
   - Todos os dados transitam exclusivamente entre os repositórios locais (`src/servicos/banco/`) e as camadas de visualização / hooks.
4. **Portabilidade Manual:**
   - A troca de dados com o exterior é realizada apenas por ação deliberada do usuário via exportação/importação de arquivo JSON estruturado ([[BackupService]] / [[Regra - Portabilidade e Backup]]).

---

## 2. Componentes e Serviços Envolvidos

- **[[ZeroConectividadeService]]:** Serviço singleton de auditoria e guarda de conformidade offline.
- **[[BadgeStatusOffline]]:** Indicador visual exibido no Dashboard ([[DashboardService]]) e na tela de Ajustes ([[NotificacaoService]]), assegurando ao usuário seu estado isolado.
- **[[DisciplinaService]], [[FrequenciaService]], [[AvaliacaoService]], [[TarefaService]], [[CalendarioService]]:** Todos os serviços de regra de negócio operam com garantia estrita de persistência offline.

---

## 3. Garantias de Privacidade e Segurança

- **Privacidade Total (#privacidade):** Nenhum dado pessoal, frequência, notas ou grade horária do aluno trafega pela internet.
- **Autonomia Total (#offline):** O aplicativo nunca apresenta telas de erro por falta de sinal de Wi-Fi ou dados móveis.
