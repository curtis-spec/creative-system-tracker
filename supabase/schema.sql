create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'intern',
  mentor_name text,
  development_focus text,
  start_date date,
  growth_goal text,
  created_at timestamptz default now()
);

create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null default current_date,
  system_area text,
  learned text,
  did text,
  next_action text,
  blockers text,
  created_at timestamptz default now()
);

create table weekly_checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_ending date not null,
  system_part text,
  practiced text,
  evidence text,
  confusion text,
  next_week text,
  created_at timestamptz default now()
);

create table final_demonstrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  assignment text,
  audience text,
  due_date date,
  purpose text,
  ownership_clarity text,
  workflow_movement text,
  feedback_applied text,
  learning_reflection text,
  score_execution int,
  score_communication int,
  score_system int,
  score_growth int,
  mentor_notes text,
  status text default 'in_progress',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table daily_logs enable row level security;
alter table weekly_checkpoints enable row level security;
alter table final_demonstrations enable row level security;

create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can manage their own daily logs"
on daily_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own weekly checkpoints"
on weekly_checkpoints for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own final demonstrations"
on final_demonstrations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
