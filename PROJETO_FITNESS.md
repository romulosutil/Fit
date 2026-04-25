# Planejamento do Aplicativo Fitness

## 1. Roadmap: MVP vs Pós-Lançamento

O objetivo do MVP (Minimum Viable Product) é lançar rápido, gerar valor para o Personal Trainer (para que ele pague a assinatura) e validar a usabilidade do aluno.

### 🟢 MVP (Versão 1.0 - Core Value)
**Foco:** O essencial para o Personal abandonar planilhas e o WhatsApp.
* **Autenticação e Perfis:** Login de Personal e Aluno.
* **Gestão Básico (CRM):** Personal pode adicionar, bloquear e listar alunos.
* **Módulo de Avaliação Física:**
  * Anamnese (Questionário dinâmico/texto).
  * Composição Corporal e Perímetros (Inserção manual de dados para gerar histórico).
  * Upload de Fotos (Frente, Costas, Lados).
* **Módulo de Treino:** 
  * Criação de treinos (A, B, C...).
  * Adicionar exercícios com séries, repetições, descanso e cadência.
  * *Banco de exercícios pré-cadastrado básico (nomes e músculos).*
* **Módulo de Dieta (Versão Simplificada):**
  * Cálculo automático de TDEE e divisão de Macros.
  * Montagem de cardápio com busca em banco de alimentos (ex: tabela TACO).
* **App do Aluno:**
  * Visualização do treino do dia com botão de "Check" (Concluído).
  * Visualização da dieta e "Check" de refeições.
  * Rastreador de Água diário (Meta em Litros e Check).
  * Feedback simples pós-treino (esforço, cansaço).
* **Financeiro:**
  * Período de teste de 30 dias grátis para o Personal testar com 1 aluno.
  * Assinatura do Personal via link de pagamento externo (simplificado no início).

### 🟡 Pós-Lançamento (Versão 1.5 a 2.X - Retenção e Engajamento)
**Foco:** Gamificação, diferenciais de mercado e automação de vendas.
* **Gamificação Completa:** Sistema de XP, Streaks (Dias seguidos de foco) e Rankings entre os alunos de um mesmo personal.
* **Módulo de Ciclo Menstrual:** Alertas baseados no ciclo da mulher e ajuste automático de intensidade de treino/água. (Ficou para a v2 pois requer cálculo de calendário e lógica complexa de predição).
* **Avaliação Postural Avançada:** Grid na câmera e linhas de marcação sobrepostas à foto.
* **Gestão de Assinaturas In-App:** Cobrança de alunos direto pelo app (split de pagamento).
* **Templates de Personal:** Salvar "Treinos Padrão" e "Dietas Padrão" para duplicar com 1 clique para novos alunos.

---

## 2. Jornada do Usuário (User Flow)

### 🧑‍🏫 A Jornada do Personal (Avaliador)
1. **Onboarding:** Baixa o app, cria conta e inicia os 30 dias grátis.
2. **Dashboard:** Vê um resumo (Quantos alunos ativos, quem vence a mensalidade, quem não treina há 3 dias).
3. **Novo Aluno:** Clica em "Adicionar Aluno", insere Nome e Email. O app gera um código ou link de convite.
4. **Análise Inicial:** O aluno entra pelo link e preenche a Anamnese. O Personal recebe uma notificação: "João preencheu a anamnese".
5. **Prescrição:** 
   * O Personal acessa o perfil do João.
   * Realiza/preenche a Avaliação Física (se presencial, tira fotos; se online, pede para o aluno enviar).
   * Vai na aba Dieta, usa a calculadora integrada de TDEE e monta as refeições.
   * Vai na aba Treino e monta a periodização (A, B, C).
6. **Acompanhamento:** Recebe alertas do "Feedback" diário do aluno para fazer ajustes se necessário.

### 🏃‍♀️ A Jornada do Aluno
1. **Onboarding:** Recebe o link do Personal, baixa o app, cria a senha e preenche a Anamnese (lesões, objetivos, etc).
2. **A Rotina (Home do App):** Ao abrir o app, a tela principal foca no **HOJE**:
   * Card de Água (0/3 Litros) -> Clica para adicionar copos.
   * Card de Refeições -> Lista do dia (Café, Almoço, etc) com checkboxes.
   * Card de Treino -> "Hoje é dia de Perna".
3. **Execução:** O aluno abre o treino, vê os exercícios (séries/reps) e vai dando "Check" a cada exercício feito.
4. **Fim do Dia:** Clica no "Finalizar Dia", responde ao feedback (Dorme bem? Treino foi pesado? Seguiu a dieta?) e ganha seu "XP" de gamificação.

---

## 3. Estrutura do Banco de Dados (High-Level)

Para implementar isso, o banco de dados relacional (ex: PostgreSQL) terá as seguintes entidades principais:

* **Users:** (id, role [personal, aluno], nome, email, senha).
* **Personal_Alunos (Relação):** (personal_id, aluno_id, status [ativo, bloqueado]).
* **Anamnese:** (aluno_id, data, respostas_json, objetivo).
* **Avaliacao_Fisica:** (aluno_id, data, peso, altura, bf, fotos_urls).
* **Perimetros:** (avaliacao_id, braco, perna, cintura, etc).
* **Treinos:** (aluno_id, personal_id, nome [Ex: Treino A], descricao).
* **Exercicios_Treino:** (treino_id, nome_exercicio, series, reps, descanso).
* **Dietas:** (aluno_id, calorias_meta, macros_meta).
* **Refeicoes:** (dieta_id, horario, nome [Ex: Almoço]).
* **Itens_Refeicao:** (refeicao_id, alimento, quantidade_gramas, macros_calculados).
* **Logs_Diarios (O Feedback):** (aluno_id, data, agua_ingerida, treino_concluido, dieta_concluida, notas).

---

# Checkpoint de Desenvolvimento

## 🏁 O que já foi feito (Concluído)
* **Análise de Requisitos:** Mapeamento completo da estrutura via PDF (Visão Geral).
* **Definição de Negócio:** Modelo SaaS B2B2C focado em Personal Trainers Independentes.
* **Escopo de Produto:** Roadmap definido entre MVP (Core) e Pós-Lançamento (Diferenciais).
* **Jornada do Usuário:** Mapeamento do fluxo do Personal e do Aluno.
* **Modelagem de Dados:** Estrutura high-level das tabelas de banco de dados.
* **Integração Filosófica:** Alinhamento com conceitos de Design System, Automação de Agentes e Minimalismo (extraídos do Obsidian).

## 🚀 Próximos Passos (O que falta fazer)

### Fase 1: Especificação Técnica (Imediato)
1. **Escolha da Stack:** Definir tecnologias (Flutter/React Native, Supabase/Firebase/Node).
2. **Definição de UI/UX:** Criar as diretrizes de design e wireframes das telas principais (Dashboard Personal vs Home Aluno).
3. **Mapeamento de API de Alimentos:** Validar fonte de dados para o banco de alimentos (Tabela TACO ou similar).

### Fase 2: Implementação (Mão na Massa)
1. **Setup do Projeto:** Configuração do repositório e ambiente de dev.
2. **Desenvolvimento do Core Auth:** Login e diferenciação de Roles (Personal/Aluno).
3. **Módulo de Avaliação:** Implementar CRUD de Anamnese e Medidas Corporais.
4. **Motor de Treino/Dieta:** Construir lógica de prescrição e visualização.

### Fase 3: Validação
1. **Testes de Usabilidade:** Simular 30 dias de um aluno fictício.
2. **Ajuste de Gamificação:** Refinar lógica de XP e recompensas para o lançamento.