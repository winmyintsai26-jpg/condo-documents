create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_name text not null check (char_length(short_name) between 1 and 40),
  description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  category_id uuid not null references public.categories(id) on delete restrict,
  file_name text not null,
  storage_path text not null unique,
  year integer not null check (year between 1800 and 2200),
  file_type text not null default 'PDF' check (file_type = 'PDF'),
  file_size bigint not null check (file_size between 1 and 15728640),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_category_id_idx on public.documents(category_id);
create index if not exists documents_public_idx on public.documents(published, updated_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.documents enable row level security;

insert into public.categories(name, slug, short_name, description, position) values
('Management Certificate','management','Management','Current recorded association and management information.',10),
('Dedicatory Instruments','dedicatory','Dedicatory','Governing documents, declarations, bylaws, and rules.',20),
('Meeting Minutes','minutes','Meeting Minutes','Official records from association board meetings.',30),
('Financial Statements','financial','Financial','Annual financial reports and association statements.',40),
('Community Notices','notices','Notices','Important notices and community guidance.',50)
on conflict (slug) do update set name=excluded.name, short_name=excluded.short_name, description=excluded.description, position=excluded.position;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('documents','documents',true,15728640,array['application/pdf'])
on conflict (id) do update set public=true, file_size_limit=15728640, allowed_mime_types=array['application/pdf'];

drop policy if exists "Public may read document files" on storage.objects;
create policy "Public may read document files" on storage.objects for select using (bucket_id = 'documents');
