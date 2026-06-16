-- Run this entire file once in the Supabase SQL editor
-- (Project -> SQL Editor -> New query -> paste -> Run)

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color_id text not null default 'p1',
  created_at timestamptz not null default now()
);

create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  cal numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  unit text not null default 'g',
  portion numeric not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  ingredients jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists plan_items (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  recipe_id uuid references recipes(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Row Level Security: this app has no login system, so we open access to
-- the anon key. Anyone with your project URL + anon key could read/write,
-- which is fine for a personal single-user app but do NOT reuse this schema
-- for anything with other people's data without adding real auth.
alter table categories enable row level security;
alter table foods enable row level security;
alter table recipes enable row level security;
alter table plan_items enable row level security;

create policy "allow all categories" on categories for all using (true) with check (true);
create policy "allow all foods" on foods for all using (true) with check (true);
create policy "allow all recipes" on recipes for all using (true) with check (true);
create policy "allow all plan_items" on plan_items for all using (true) with check (true);

-- Seed default categories (safe to re-run; skips if already present)
insert into categories (name, color_id)
select * from (values
  ('Meat', 'p7'),
  ('Fish & seafood', 'p8'),
  ('Protein', 'p1'),
  ('Vegetables', 'p2'),
  ('Dairy', 'p3'),
  ('Grains', 'p4'),
  ('Fruit', 'p5'),
  ('Seasoning', 'p6'),
  ('Oils', 'p9')
) as v(name, color_id)
where not exists (select 1 from categories);
