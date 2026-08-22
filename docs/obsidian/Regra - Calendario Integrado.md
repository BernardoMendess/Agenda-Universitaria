---
data: 2026-08-22
tipo: regra-de-negocio
tags: [campusflow, regras, calendario, planejamento, mobile]
---

# Regra - Calendário Integrado

Especificação das regras de negócio aplicadas no **Calendário Integrado** (RF09) para unificar a visão temporal acadêmica do estudante.

## 1. Visão Geral e Unificação

O calendário atua como ponto central de convergência temporal de 4 fontes acadêmicas independentes:

1. **Provas e Avaliações (RF06):** Inseridas na data agendada (`data`). Exibem peso, nota obtida (ou status pendente) e identificação da disciplina.
2. **Entregas e Tarefas (RF07):** Inseridas na `dataLimite`. Apresentam checkbox de conclusão rápida em 1 toque (RNF03) e indicador de prioridade (`ALTA`, `MEDIA`, `BAIXA`).
3. **Grade de Aulas (RF02):** Aulas recorrentes são mapeadas nos dias da semana correspondentes do mês/semana com indicação de sala e horários (`horarioInicio` às `horarioFim`).
4. **Eventos Acadêmicos (RF09):** Eventos especiais e marcos acadêmicos com data e horários específicos.

## 2. Visão Mensal

- O Grid Mensal exibe semanas de Domingo a Sábado.
- Dias do mês anterior e próximo preenchem a primeira e última linha para manter o alinhamento de 7 colunas.
- Cada célula exibe:
  - Número do dia.
  - Anel de destaque se for o dia de "Hoje".
  - Fundo preenchido com a cor da marca quando selecionado.
  - Indicadores pontuais de cores correspondentes aos compromissos do dia.
- Ao selecionar um dia, a lista detalhada inferior exibe imediatamente os cartões com todos os eventos ordenados cronologicamente.

## 3. Visão Semanal

- Exibe os 7 dias da semana ativa com linha do tempo.
- O estudante pode navegar entre semanas com os botões `<` e `>` ou voltar para a semana corrente pelo atalho `Hoje`.

## 4. Categorização e Filtros

O estudante pode filtrar a visualização simultaneamente por:
- **Categoria:**
  - `Tudo`: Exibe provas, entregas, aulas e eventos.
  - `Provas & Avaliações`: Exibe apenas exames, testes e trabalhos avaliativos.
  - `Entregas & Tarefas`: Exibe apenas tarefas do To-Do com prazo.
  - `Aulas`: Exibe apenas os horários de aula da grade.
  - `Eventos`: Exibe apenas eventos acadêmicos avulsos.
- **Disciplina:** Filtro por matéria específica selecionada via chips com a cor da disciplina.

## 5. Wikilinks

- [[CalendarioService]]
- [[EventoAcademico]]
- [[Regra - Dashboard Inicial]]
- [[Regra - Gestao de Tarefas]]
- [[Regra - Grade Horaria]]
- [[Regra - Calculo de Media e Projecao]]
