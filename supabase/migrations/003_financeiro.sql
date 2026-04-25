-- Adicionar campos financeiros ao perfil
alter table profiles 
add column if not exists trial_starts_at timestamptz default now(),
add column if not exists subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'past_due', 'canceled')),
add column if not exists stripe_customer_id text;

-- Helper para verificar se o personal pode adicionar alunos
create or replace function can_personal_add_student(p_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_count int;
  v_status text;
  v_trial_start timestamptz;
begin
  select subscription_status, trial_starts_at into v_status, v_trial_start
  from profiles where id = p_id;

  -- Se for ativo, pode tudo
  if v_status = 'active' then
    return true;
  end if;

  -- Se for trial, contar alunos
  select count(*) into v_count
  from personal_alunos where personal_id = p_id;

  -- Limite trial: 1 aluno e dentro dos 30 dias
  if v_status = 'trial' and v_count < 1 and (now() < v_trial_start + interval '30 days') then
    return true;
  end if;

  return false;
end;
$$;
