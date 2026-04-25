-- Migration 004: Post-Launch v2 (Issues #16 e #18)

-- ISSUE #16: Templates de Treinos e Dietas Padrão para o Personal

create table treino_templates (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid references profiles(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria text,
  created_at timestamptz default now()
);

create table exercicios_treino_template (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references treino_templates(id) on delete cascade,
  nome text not null,
  grupo_muscular text,
  series int not null default 3,
  reps text not null default '12',
  descanso_seg int default 60,
  cadencia text,
  ordem int not null default 0
);

create table dieta_templates (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid references profiles(id) on delete cascade,
  nome text not null,
  descricao text,
  calorias_meta int,
  proteina_g int,
  carbo_g int,
  gordura_g int,
  created_at timestamptz default now()
);

create table refeicoes_template (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references dieta_templates(id) on delete cascade,
  nome text not null,
  horario text,
  ordem int not null default 0
);

create table itens_refeicao_template (
  id uuid primary key default gen_random_uuid(),
  refeicao_id uuid references refeicoes_template(id) on delete cascade,
  alimento_nome text not null,
  quantidade_g numeric(6,1) not null,
  calorias numeric(6,1),
  proteina_g numeric(5,1),
  carbo_g numeric(5,1),
  gordura_g numeric(5,1)
);

-- RLS para Templates (Issue #16)
alter table treino_templates enable row level security;
create policy "Personal pode ver seus templates de treino" on treino_templates for select using (auth.uid() = personal_id);
create policy "Personal pode inserir seus templates de treino" on treino_templates for insert with check (auth.uid() = personal_id);
create policy "Personal pode atualizar seus templates de treino" on treino_templates for update using (auth.uid() = personal_id);
create policy "Personal pode deletar seus templates de treino" on treino_templates for delete using (auth.uid() = personal_id);

alter table exercicios_treino_template enable row level security;
create policy "Personal pode gerenciar exercicios do template" on exercicios_treino_template for all using (
  exists (select 1 from treino_templates where id = exercicios_treino_template.template_id and personal_id = auth.uid())
);

alter table dieta_templates enable row level security;
create policy "Personal pode ver seus templates de dieta" on dieta_templates for select using (auth.uid() = personal_id);
create policy "Personal pode inserir seus templates de dieta" on dieta_templates for insert with check (auth.uid() = personal_id);
create policy "Personal pode atualizar seus templates de dieta" on dieta_templates for update using (auth.uid() = personal_id);
create policy "Personal pode deletar seus templates de dieta" on dieta_templates for delete using (auth.uid() = personal_id);

alter table refeicoes_template enable row level security;
create policy "Personal pode gerenciar refeicoes do template" on refeicoes_template for all using (
  exists (select 1 from dieta_templates where id = refeicoes_template.template_id and personal_id = auth.uid())
);

alter table itens_refeicao_template enable row level security;
create policy "Personal pode gerenciar itens da refeicao" on itens_refeicao_template for all using (
  exists (
    select 1 from refeicoes_template rt 
    join dieta_templates dt on rt.template_id = dt.id 
    where rt.id = itens_refeicao_template.refeicao_id and dt.personal_id = auth.uid()
  )
);


-- ISSUE #18: Módulo de Ciclo Menstrual

create type fase_ciclo as enum ('menstrual', 'folicular', 'ovulatoria', 'lutea');

create table ciclos_menstruais (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  data_ultima_menstruacao date not null,
  duracao_media_ciclo int default 28,
  duracao_media_menstruacao int default 5,
  ajuste_agua_fase_lutea int default 500,
  alerta_carga_ativa boolean default true,
  created_at timestamptz default now(),
  unique(aluno_id)
);

-- RLS para Ciclos Menstruais (Issue #18)
alter table ciclos_menstruais enable row level security;
create policy "Aluno gerencia proprio ciclo" on ciclos_menstruais for all using (auth.uid() = aluno_id);
create policy "Personal pode ver ciclo dos seus alunos" on ciclos_menstruais for select using (
  exists (select 1 from personal_alunos where aluno_id = ciclos_menstruais.aluno_id and personal_id = auth.uid())
);
