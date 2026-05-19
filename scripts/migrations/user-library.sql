-- =====================================================
-- MIGRACIÓN: Biblioteca de usuario (favoritos + listas)
-- Fecha: 2026-05-18
-- Descripción: Tablas para "Mis Favoritos" y "Mi Lista de
--   canciones" del dashboard de usuario. Acceso directo desde
--   el frontend con la sesión Supabase del usuario, protegido
--   por Row Level Security (cada quien solo ve/edita lo suyo).
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================

-- ----- FAVORITOS -----------------------------------------------------
create table if not exists public.favorites (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  song_id    uuid        not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- ----- LISTAS (PLAYLISTS) --------------------------------------------
create table if not exists public.playlists (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null check (char_length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists playlists_user_idx on public.playlists (user_id);

-- ----- CANCIONES DENTRO DE UNA LISTA ---------------------------------
create table if not exists public.playlist_songs (
  id          uuid        primary key default gen_random_uuid(),
  playlist_id uuid        not null references public.playlists(id) on delete cascade,
  song_id     uuid        not null references public.songs(id) on delete cascade,
  position    int         not null default 0,
  created_at  timestamptz not null default now(),
  unique (playlist_id, song_id)
);

create index if not exists playlist_songs_playlist_idx on public.playlist_songs (playlist_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.favorites      enable row level security;
alter table public.playlists      enable row level security;
alter table public.playlist_songs enable row level security;

-- ----- FAVORITOS: el usuario solo gestiona los suyos -----------------
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ----- LISTAS: el usuario solo gestiona las suyas --------------------
drop policy if exists "playlists_select_own" on public.playlists;
create policy "playlists_select_own" on public.playlists
  for select using (auth.uid() = user_id);

drop policy if exists "playlists_insert_own" on public.playlists;
create policy "playlists_insert_own" on public.playlists
  for insert with check (auth.uid() = user_id);

drop policy if exists "playlists_update_own" on public.playlists;
create policy "playlists_update_own" on public.playlists
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "playlists_delete_own" on public.playlists;
create policy "playlists_delete_own" on public.playlists
  for delete using (auth.uid() = user_id);

-- ----- CANCIONES DE LISTA: acceso vía la lista del usuario -----------
drop policy if exists "playlist_songs_select_own" on public.playlist_songs;
create policy "playlist_songs_select_own" on public.playlist_songs
  for select using (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.user_id = auth.uid())
  );

drop policy if exists "playlist_songs_insert_own" on public.playlist_songs;
create policy "playlist_songs_insert_own" on public.playlist_songs
  for insert with check (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.user_id = auth.uid())
  );

drop policy if exists "playlist_songs_update_own" on public.playlist_songs;
create policy "playlist_songs_update_own" on public.playlist_songs
  for update using (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.user_id = auth.uid())
  );

drop policy if exists "playlist_songs_delete_own" on public.playlist_songs;
create policy "playlist_songs_delete_own" on public.playlist_songs
  for delete using (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.user_id = auth.uid())
  );

-- =====================================================
-- VERIFICACIÓN (opcional, correr aparte)
-- select tablename, rowsecurity from pg_tables
--   where tablename in ('favorites','playlists','playlist_songs');
-- =====================================================
