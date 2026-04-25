-- Habilitar RLS em todas as tabelas
alter table profiles enable row level security;
alter table personal_alunos enable row level security;
alter table anamneses enable row level security;
alter table avaliacoes_fisicas enable row level security;
alter table perimetros enable row level security;
alter table treinos enable row level security;
alter table exercicios_treino enable row level security;
alter table dietas enable row level security;
alter table refeicoes enable row level security;
alter table itens_refeicao enable row level security;
alter table logs_diarios enable row level security;
alter table checks_exercicio enable row level security;
alter table checks_refeicao enable row level security;
alter table streaks enable row level security;

-- profiles: cada um lê o próprio, personal lê os seus alunos
create policy "profiles_self" on profiles for select
  using (auth.uid() = id);

create policy "profiles_personal_reads_alunos" on profiles for select
  using (
    exists (
      select 1 from personal_alunos
      where personal_id = auth.uid() and aluno_id = profiles.id
    )
  );

-- personal_alunos: personal gerencia seus próprios vínculos
create policy "pa_personal_all" on personal_alunos for all
  using (personal_id = auth.uid());

create policy "pa_aluno_read" on personal_alunos for select
  using (aluno_id = auth.uid());

-- Helper: verifica se o caller é personal do aluno
create or replace function is_personal_of(p_aluno_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from personal_alunos
    where personal_id = auth.uid() and aluno_id = p_aluno_id
  );
$$;

-- anamneses: aluno escreve o próprio, personal do aluno lê
create policy "anamnese_aluno_write" on anamneses for all
  using (aluno_id = auth.uid());

create policy "anamnese_personal_read" on anamneses for select
  using (is_personal_of(aluno_id));

-- avaliacoes_fisicas
create policy "aval_aluno_read" on avaliacoes_fisicas for select
  using (aluno_id = auth.uid());

create policy "aval_personal_all" on avaliacoes_fisicas for all
  using (personal_id = auth.uid() or is_personal_of(aluno_id));

-- treinos
create policy "treino_personal_all" on treinos for all
  using (personal_id = auth.uid());

create policy "treino_aluno_read" on treinos for select
  using (aluno_id = auth.uid());

-- dietas
create policy "dieta_personal_all" on dietas for all
  using (personal_id = auth.uid());

create policy "dieta_aluno_read" on dietas for select
  using (aluno_id = auth.uid());

-- logs_diarios, checks: aluno gerencia o próprio
create policy "logs_aluno" on logs_diarios for all using (aluno_id = auth.uid());
create policy "checks_exercicio_aluno" on checks_exercicio for all using (aluno_id = auth.uid());
create policy "checks_refeicao_aluno" on checks_refeicao for all using (aluno_id = auth.uid());
create policy "streaks_aluno" on streaks for all using (aluno_id = auth.uid());

-- personal lê logs dos seus alunos
create policy "logs_personal_read" on logs_diarios for select
  using (is_personal_of(aluno_id));
