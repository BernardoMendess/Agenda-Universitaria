# Requisitos do Sistema — CampusFlow (100% Offline)

---

## 1. Requisitos Funcionais (RF)

### 1.1. Gestão de Disciplinas & Grade Horária

* ~~**RF01 — Cadastro de Disciplinas:** Criar, editar e excluir matérias localmente com os seguintes campos:
  * Nome da matéria, código e nome/contato do professor.
  * Local/sala e anotações úteis (links de pastas locais, avisos).
  * Cor de identificação visual (tag colorida para a grade).
  * **Limite Máximo de Faltas Permitidas:** Campo numérico inteiro obrigatório (aceitando valor $\ge 0$).
  * Critério de média para aprovação (aritmética, ponderada ou fórmula customizada).~~
* ~~**RF02 — Grade Horária Semanal:**
  * Configuração de dias da semana e horários de início/fim de cada aula.
  * Suporte a múltiplos blocos de horário para a mesma disciplina em dias distintos.~~

---

### 1.2. Módulo de Faltas e Frequência (Regra Personalizada)

* ~~**RF03 — Registro Rápido de Faltas:**
  * Botão de incremento rápido (+1 / -1) diretamente no card da matéria ou na visão do dia.
  * Histórico local de faltas com data, horário e justificativa opcional (atestado, imprevisto).~~
* ~~**RF04 — Lógica do Limite Máximo:**
  * **Se limite = 0:** Qualquer falta registrada coloca a matéria imediatamente como *Reprovado por Falta* / *Limite Excedido*.
  * **Se limite > 0:** Cálculo local do saldo restante:
    $$\text{Faltas Restantes} = \text{Limite Máximo} - \text{Faltas Atuais}$$~~
* ~~**RF05 — Indicadores Visuais de Status:**
  * **Verde:** Frequência segura (menos de 50% do limite consumido).
  * **Amarelo / Laranja:** Alerta (mais de 75% do limite consumido).
  * **Vermelho / Crítico:** Limite atingido, ultrapassado ou $\ge 1$ falta em disciplina com limite 0.~~

---

### 1.3. Avaliações, Notas e Tarefas

* ~~**RF06 — Gestão de Avaliações e Notas:**
  * Agendamento de provas, testes e trabalhos com pesos/pontuações atribuídas.
  * Lançamento de notas com recálculo automático da média atual e projeção da nota necessária para aprovação.~~
* ~~**RF07 — Lista de Tarefas (To-Do List):**
  * Criação de tarefas vinculadas a uma disciplina ou avulsas (ex: "Leitura do artigo X").
  * Checkbox de conclusão e definição de data/hora limite.~~

---

### 1.4. Dashboard, Calendário e Notificações Locais

* ~~**RF08 — Dashboard Inicial ("Hoje"):**
  * Visão rápida das aulas do dia com sala/horário.
  * Tarefas pendentes com vencimento próximo.
  * Resumo das matérias em estado de alerta (faltas ou notas baixas).~~
* ~~**RF09 — Calendário Integrado:** Visão mensal e semanal unificando provas, entregas e eventos acadêmicos.~~
* ~~**RF10 — Notificações Locais (AlarmManager / Local Notifications):**
  * Disparo de lembretes locais agendados no próprio dispositivo antes das aulas.
  * Avisos locais com antecedência configurável (ex: 24h / 2h antes) para provas e entregas sem depender de serviços externos de push.
  * Alerta visual/sonoro imediato ao atingir o limite de faltas.~~

---

### 1.5. Gerenciamento e Portabilidade de Dados

* ~~**RF11 — Exportação/Importação Manual de Dados:**
  * Opção de exportar todos os dados locais em um arquivo estruturado (`.json` ou `.sqlite`).
  * Opção de restaurar o backup a partir de um arquivo salvo no armazenamento do próprio aparelho.~~

---

## 2. Requisitos Não Funcionais (RNF)

* **RNF01 — Zero Conectividade (Offline por Padrão):** O app funciona 100% isolado, sem chamadas a APIs, servidores web ou serviços em nuvem.
* **RNF02 — Persistência Estritamente Local:** Todos os dados são armazenados localmente no dispositivo (via SQLite, Room, WatermelonDB ou Realm).
* **RNF03 — Usabilidade Mobile (Ações em 1 Toque):** O registro de faltas e a conclusão de tarefas devem ser acessíveis diretamente na tela inicial sem navegação profunda.
* **RNF04 — Eficiência Energética:** Uso exclusivo de agendadores nativos de alarmes locais para evitar rotinas em segundo plano drenando bateria.
* **RNF05 — Privacidade Total:** Nenhum dado acadêmico, pessoal ou estatístico sai do aparelho do usuário.