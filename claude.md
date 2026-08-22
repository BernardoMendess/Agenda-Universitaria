# CampusFlow — Especificação Geral do Projeto

## Visão Geral

**CampusFlow** é um aplicativo mobile desenvolvido para estudantes universitários gerenciarem sua vida acadêmica. A aplicação centraliza o controle de disciplinas, grade horária, avaliações, tarefas e, principalmente, a **gestão rigorosa de frequência e faltas** — permitindo limites personalizados por matéria (inclusive limite zero).

---

## Stack Tecnológica

| Camada         | Tecnologia                                      | Versão         |
|----------------|-------------------------------------------------|----------------|
| Mobile (App)   | React Native (Expo) ou Flutter                  | Última estável |
| Backend        | Java (Spring Boot)                              | Última estável |
| Banco de Dados | SQLite / WatermelonDB (Local) + PostgreSQL (API)| Última estável |
| Testes         | JUnit 5 + Mockito (back), Jest / Detox (mobile) | —              |

---

## Diretrizes de Código e Estilo

### Princípios Gerais
- **Clean Code:** Código limpo, legível, desacoplado e de fácil manutenção.
- **SOLID:** Aplicar rigorosamente os cinco princípios em todo o backend e na arquitetura de serviços.
- **Offline-First:** O aplicativo mobile deve persistir os dados localmente e sincronizar com o backend em segundo plano.
- **Nomenclatura em português:** Nomes de variáveis, métodos, componentes e classes em português.
- **Comentários pontuais:** Apenas para explicar lógicas complexas de cálculo de frequência ou datas.
- **Modularização:** Separar regras de negócio, telas, componentes de interface e camada de persistência.
- **Lombok:** Usar no backend Java para reduzir código boilerplate.

### Estratégia de Testes
- **Testes unitários:** Cobertura obrigatória para regras de cálculo de média, deduções de faltas e validações de limites.
- **Testes de integração:** Validação dos fluxos de cadastro de disciplina com grade horária e registro de faltas/notas.

---

### Frontend Mobile

- **Arquitetura:** Componentes modulares, navegação baseada em abas/stacks e gerenciamento de estado reativo.
- **Fonte:** Inter ou Roboto — pesos 400, 500, 600, 700.
- **Design System / Temas:** Tokens de estilo centralizados (`src/estilos/tema.js` ou `tema.ts`). Sem valores de cores soltos no código.

#### Design System

**Cores principais (Tokens):**
| Token | Valor | Uso |
|-------|-------|-----|
| `cor-fundo-principal` | `#0d1117` | Fundo principal da aplicação |
| `cor-fundo-card` | `#161b22` | Cards de matérias, modais e containers |
| `cor-fundo-elevado` | `#21262d` | Inputs, caixas de diálogo e botões secundários |
| `cor-texto-primario` | `#f0f6fc` | Títulos e dados numéricos principais |
| `cor-texto-secundario` | `#8b949e` | Subtítulos, dias da semana e horários |
| `cor-marca-primaria` | `#6366f1` | Destaques, botões de ação (CTA) e abas ativas |
| `cor-status-seguro` | `#2ea043` | Frequência segura (< 50% do limite de faltas) |
| `cor-status-alerta` | `#d29922` | Atenção (≥ 75% do limite de faltas) |
| `cor-status-critico` | `#f85149` | Limite atingido, excedido ou matéria com limite 0 faltada |

**Tipografia e Espaçamento:**
- Escala de texto do micro (12px) ao título em destaque (28px).
- Espaçamento baseado em múltiplos de 4px (4px, 8px, 16px, 24px, 32px).
- Cantos arredondados: Raio padrão de 12px para cards e 8px para botões e inputs.

#### Arquitetura de Telas e Navegação

**Estrutura de arquivos:**
```
src/
├── telas/                      # Telas principais da aplicação
│   ├── Home/                   # Tela inicial com abas
│   ├── Disciplinas/            # Lista de disciplinas
│   ├── CriarDisciplina/         # Modal/Tela de cadastro
│   ├── DetalhesDisciplina/     # Frequência, notas, faltas
│   ├── Ajustes/                # Configurações e perfil
│   └── Autenticacao/           # Login e Cadastro
├── componentes/              # Componentes reutilizáveis
├── estilos/                    # Tema, gradientes, utilitários
├── navegacao/                # Configuração do Stack e Tab Navigator
├── serviços/                   # Lógica de negócio e sincronização
├── hooks/                      # Custom Hooks (ex: useFrequencia)
└── utilitarios/                # Funções utilitárias e constantes
```

**Navegação:**
- Tela inicial (`Home`) com abas (Dashboard, Disciplinas, Ajustes).
- Navegação baseada em `React Navigation` (Stack + Tab).
- O fluxo de Login deve redirecionar para `Home`.

---

## Arquitetura do Backend

### Estrutura em Camadas

```
Controller → Service → Repository/DAO
```

- **Controller:** Recebe requisições e delega para o Service. Deve ser "enxuto".
- **Service:** **Contém toda a lógica de negócio.** Responsável por cálculos matemáticos, validações complexas e regra de sincronização.
- **Repository/DAO:** Acesso direto ao banco de dados (JPA/Hibernate).

### Regras Específicas
- Utilizar **DTOs** e **Records** apenas quando necessário para clareza.
- **Validações:** Usar `@Valid` nos DTOs de entrada. Implementar validações personalizadas (ex: verificar se a data de início é menor que a de fim) via `ConstraintValidator`.
- **Lógica de Negócio:** A regra de "limite de faltas 0" ou "tolerância percentual" deve ser implementada no **Service**, não no Controller.
- **Sincronização:** O Service deve conter métodos para `uploadFromDevice` e `downloadToDevice`, garantindo a integridade dos dados no modelo Offline-First.

---

## Tom e Personalidade

- **Direto ao ponto:** Sem enrolação ou explicações desnecessárias.
- **Foco nas implementações:** Mostrar o código e as mudanças realizadas de forma clara.
- **Sem jargões desnecessários:** Comunicação objetiva e prática.

---

## Documentação e Base de Conhecimento (Obsidian)

O projeto utiliza o **Obsidian** como repositório central de conhecimento, arquitetura e decisões de negócio.

### Caminho do Vault
```
C:\Users\berna\OneDrive\Documentos\Obsidian Vault\campusflow
```

### Regras de Alimentação
- **Atualização Contínua:** Sempre que houver mudança de arquitetura, criação de nova entidade, nova regra de negócio ou refatoração importante, criar ou atualizar a nota correspondente no Obsidian.
- **Stack Tecnológica:** Sempre que uma nova tecnologia, framework, biblioteca ou dependência for adicionada ao projeto (seja no `pom.xml`, `package.json`, `build.gradle` ou `pubspec.yaml`), **atualizar obrigatoriamente** a nota `[[Stack Tecnológica]]` no Obsidian, adicionando a nova entrada na tabela da camada correspondente (Backend, Mobile, Testes, Ferramentas).
- **Formatação Padrão:**
  - Utilizar **Wikilinks** (`[[Nome do Arquivo]]`) para conectar conceitos.
  - Adicionar **Frontmatter (YAML)** no início de toda nova nota:
    ```yaml
    ---
    data: YYYY-MM-DD
    tipo: [arquitetura, entidade, regra-de-negocio, log]
    tags: [campusflow, backend, mobile]
    ---
    - Utilizar **Tags** (`#nomedatag`) no corpo do texto para facilitar indexação.
- **Evitar Duplicação:** Antes de criar um novo arquivo `.md` no Obsidian, verificar o contexto para garantir que não exista nota semelhante que deva apenas ser atualizada.
- **Organização de Pastas:** Respeitar a hierarquia de pastas do Vault.
- **Nomenclatura de Arquivos:**
  - Para código, usar o nome exato da classe/componente (ex: `DisciplinaService`).
  - Para entidades, usar o nome no singular (ex: `Usuario`).
  - Para lógicas globais, usar prefixos (ex: `Regra - Cálculo de Média`, `Arch - Fluxo de Autenticação`).

### Requisitos
Os requisitos estão em `requisitos.md`. Pegue um requisito na ordem, implemente e depois risque da lista. Antes de cada requisito crie uma branch a partir da branch "main" e depois faça o merge na "main" quando terminar.