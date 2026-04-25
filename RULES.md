# Fit — Regras Operacionais

## Mapeamento 1:1:1:1 (Vínculo Obrigatório)
- **Pasta Local**: `C:\Users\sutil\documents\lib\fit`
- **GitHub Repo**: [romulosutil/Fit](https://github.com/romulosutil/Fit)
- **GitHub Project**: [@romulosutil Pipe (Kanban)](https://github.com/users/romulosutil/projects/1/views/1)
- **Obsidian Brain**: `02_Areas/Fit/RULES.md`

---

## ✅ Entrega Ciclo 1 (2026-04-25) - MVP Completo
- [x] Infraestrutura Supabase (Migrations + RLS).
- [x] Módulo Personal (Listagem Alunos, Treino CRUD, Dieta TACO).
- [x] Módulo Aluno (Home Hoje, Água, Execução de Treino, Dieta).
- [x] Gamificação (XP Acumulado + Streaks).
- [x] Financeiro (Free Trial 30 dias + Bloqueio de Upgrade).

---

## 🛡️ Protocolo de Validação (Kanban: Validation)
Todo card que entrar na coluna **Validation** deve seguir este rito pela IA:
1. **Automático**: A IA deve buscar e executar todos os scripts de teste disponíveis.
2. **Manual**: Caso a validação exija interação humana, a IA **deve parar** e adicionar um comentário no card do GitHub Project com o título "**Manual Test Guide**".

---

## Regras de Produto & Design
- **UX Audit**: Toda mudança de UI deve passar por uma checagem de contraste e acessibilidade.
- **Mobile First**: Design deve ser validado primeiro em viewport 375px.