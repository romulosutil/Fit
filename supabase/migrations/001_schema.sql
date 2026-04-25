-- Extensão para UUID
create extension if not exists "pgcrypto";

-- Enum de roles
create type user_role as enum ('personal', 'aluno');

-- Perfil extendido (espelha auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null,
  nome text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- Relação personal <-> aluno
create table personal_alunos (
  personal_id uuid references profiles(id) on delete cascade,
  aluno_id uuid references profiles(id) on delete cascade,
  status text not null default 'ativo' check (status in ('ativo','bloqueado')),
  primary key (personal_id, aluno_id)
);

-- Anamnese
create table anamneses (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  respostas jsonb not null default '{}',
  objetivo text,
  created_at timestamptz default now()
);

-- Avaliação física
create table avaliacoes_fisicas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  personal_id uuid references profiles(id),
  data date not null default current_date,
  peso_kg numeric(5,2),
  altura_cm numeric(5,1),
  bf_pct numeric(4,1),
  foto_frente_url text,
  foto_costas_url text,
  foto_lado_url text,
  created_at timestamptz default now()
);

-- Perímetros
create table perimetros (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid references avaliacoes_fisicas(id) on delete cascade,
  braco_cm numeric(4,1),
  antebraco_cm numeric(4,1),
  peitoral_cm numeric(4,1),
  cintura_cm numeric(4,1),
  quadril_cm numeric(4,1),
  coxa_cm numeric(4,1),
  panturrilha_cm numeric(4,1)
);

-- Treinos
create table treinos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  personal_id uuid references profiles(id),
  nome text not null,
  descricao text,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Exercícios do treino
create table exercicios_treino (
  id uuid primary key default gen_random_uuid(),
  treino_id uuid references treinos(id) on delete cascade,
  nome text not null,
  grupo_muscular text,
  series int not null default 3,
  reps text not null default '12',
  descanso_seg int default 60,
  cadencia text,
  ordem int not null default 0
);

-- Dietas
create table dietas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  personal_id uuid references profiles(id),
  calorias_meta int,
  proteina_g int,
  carbo_g int,
  gordura_g int,
  ativa boolean default true,
  created_at timestamptz default now()
);

-- Refeições
create table refeicoes (
  id uuid primary key default gen_random_uuid(),
  dieta_id uuid references dietas(id) on delete cascade,
  nome text not null,
  horario text,
  ordem int not null default 0
);

-- Itens de refeição
create table itens_refeicao (
  id uuid primary key default gen_random_uuid(),
  refeicao_id uuid references refeicoes(id) on delete cascade,
  alimento_nome text not null,
  quantidade_g numeric(6,1) not null,
  calorias numeric(6,1),
  proteina_g numeric(5,1),
  carbo_g numeric(5,1),
  gordura_g numeric(5,1)
);

-- Logs diários
create table logs_diarios (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  data date not null default current_date,
  agua_ml int default 0,
  agua_meta_ml int default 3000,
  treino_concluido boolean default false,
  dieta_concluida boolean default false,
  esforco int check (esforco between 1 and 5),
  qualidade_sono int check (qualidade_sono between 1 and 5),
  xp_ganho int default 0,
  notas text,
  unique(aluno_id, data)
);

-- Checks de exercício
create table checks_exercicio (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  exercicio_id uuid references exercicios_treino(id) on delete cascade,
  data date not null default current_date,
  concluido boolean default false,
  unique(aluno_id, exercicio_id, data)
);

-- Checks de refeição
create table checks_refeicao (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete cascade,
  refeicao_id uuid references refeicoes(id) on delete cascade,
  data date not null default current_date,
  concluida boolean default false,
  unique(aluno_id, refeicao_id, data)
);

-- Gamificação
create table streaks (
  aluno_id uuid primary key references profiles(id) on delete cascade,
  streak_atual int default 0,
  streak_max int default 0,
  xp_total int default 0,
  ultima_atividade date
);
