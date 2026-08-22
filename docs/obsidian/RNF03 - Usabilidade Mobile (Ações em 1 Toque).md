---
data: 2026-08-22
tipo: [regra-de-negocio, arquitetura]
tags: [campusflow, rnf, usabilidade, mobile, acoes-rapidas, dashboard]
---

# RNF03 — Usabilidade Mobile (Ações em 1 Toque)

## Visão Geral

O **RNF03** define que as ações mais críticas do dia a dia do estudante universitário — especificamente o **registro de faltas** e a **conclusão de tarefas** — devem ser acessíveis **diretamente na tela inicial (`TelaHome`) em exatamente 1 toque**, eliminando a necessidade de navegações profundas, múltiplos cliques ou abertura forçada de modais complexos.

---

## 1. Princípios e Diretrizes de Usabilidade

1. **Ação Direta Sem Navegação Profunda:**
   - O estudante consegue registrar uma falta ou marcar uma tarefa como feita logo que abre o aplicativo, sem navegar para abas secundárias ou telas de detalhes.
2. **Alvo de Toque Acessível (`HitSlop` ≥ 44x44 pt):**
   - Checkboxes e botões rápidos possuem área de toque expandida para facilitar a interação mesmo em movimento ou com apenas uma das mãos no dispositivo.
3. **Feedback Instantâneo com Reversibilidade (Undo / Desfazer):**
   - Toda ação rápida em 1 toque aciona um componente visual flutuante (`[[BarraAcaoRapidaFeedback]]`) que informa o status (ex: *"Falta registrada em Cálculo I (4/8)"*) e disponibiliza um botão de **Desfazer em 1 toque** para prevenir toques acidentais.
4. **Semântica e Acessibilidade:**
   - Uso de `accessibilityRole="checkbox"`, `accessibilityRole="button"` e labels detalhados para leitores de tela nativos.

---

## 2. Pontos de Interação em 1 Toque no Dashboard

### 2.1. Conclusão de Tarefas
- **Componente:** `[[CardTarefa]]` na seção *"Tarefas Prioritárias"*.
- **Ação:** Toque direto no checkbox alterna entre pendente e concluída instantaneamente com estilo tachado e atualização das métricas no topo.

### 2.2. Registro de Faltas nas Aulas de Hoje
- **Componente:** `[[CardHorarioAula]]` na seção *"Aulas de Hoje"*.
- **Ação:** Botão `+1 Falta` (e `-1` quando aplicável) registra ausência sem bloquear aulas já ocorridas no dia, exibindo o contador atualizado.

### 2.3. Registro de Faltas no Diagnóstico Acadêmico
- **Componente:** `[[CardMateriaAlerta]]` na seção *"Diagnóstico Acadêmico"*.
- **Ação:** Botões `+1 Falta` e `-1` diretamente no card de risco, permitindo controle imediato de matérias em alerta.

### 2.4. Lançamento Rápido de Faltas Geral
- **Componente:** `[[SecaoFrequenciaRapidaHome]]`.
- **Ação:** Carrossel horizontal com todas as disciplinas cadastradas, permitindo lançar falta em 1 toque mesmo em dias sem aula programada.

---

## 3. Componentes e Serviços Envolvidos

- **[[AcoesRapidasService]]:** Serviço responsável pela inteligência das ações de 1 toque, geração de mensagens de feedback e pilha de histórico para reversão (Undo).
- **[[BarraAcaoRapidaFeedback]]:** Toast animado com confirmação e botão "Desfazer".
- **[[SecaoFrequenciaRapidaHome]]:** Widget horizontal de faltas rápidas no Dashboard.
- **[[CardHorarioAula]]:** Card de aula de hoje com suporte a registro direto.
- **[[CardTarefa]]:** Card de tarefa com checkbox ampliado e acessível.
- **[[CardMateriaAlerta]]:** Card de alerta com botões rápidos de frequência.
- **[[useDashboard]]:** Hook integrador das ações rápidas e feedbacks.
