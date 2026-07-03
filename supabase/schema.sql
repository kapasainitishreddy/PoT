-- ProofTimeline — Supabase schema with Row Level Security
--
-- Auth model: Clerk is the identity provider. Every table carries
-- clerk_user_id and RLS restricts rows to the requesting user. Configure
-- Clerk as a third-party auth provider in Supabase (Dashboard → Auth →
-- Third-Party Auth → Clerk) so auth.jwt()->>'sub' is the Clerk user id.
--
-- Storage: create a PRIVATE bucket named "evidence". Files are uploaded to
-- <clerk_user_id>/<evidence_id>/<filename> and the policy below restricts
-- access to the owner. No public evidence, ever.

create extension if not exists "pgcrypto";

-- Helper: current Clerk user id from the JWT
create or replace function requesting_user_id() returns text
language sql stable as $$
  select coalesce(auth.jwt()->>'sub', '')
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  display_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cases
-- ---------------------------------------------------------------------------
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  title text not null,
  category text not null default 'other',
  incident_at timestamptz,
  location text not null default '',
  people_involved text not null default '',
  organization text not null default '',
  what_happened text not null default '',
  desired_outcome text not null default '',
  urgency text not null default 'medium',
  status text not null default 'draft',
  private_notes text not null default '',
  follow_up_date date,
  is_archived boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cases_user_idx on cases (clerk_user_id);

-- ---------------------------------------------------------------------------
-- evidence_items
-- ---------------------------------------------------------------------------
create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  case_id uuid not null references cases (id) on delete cascade,
  title text not null,
  type text not null default 'other',
  created_or_captured_at timestamptz,
  uploaded_at timestamptz not null default now(),
  description text not null default '',
  source text not null default '',
  related_event text not null default '',
  importance text not null default 'medium',
  tags text[] not null default '{}',
  file_url text not null default '',
  file_name text not null default '',
  file_type text not null default '',
  file_size bigint not null default 0,
  file_hash text not null default '',
  private_note text not null default '',
  include_in_export boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists evidence_user_idx on evidence_items (clerk_user_id);
create index if not exists evidence_case_idx on evidence_items (case_id);

-- ---------------------------------------------------------------------------
-- timeline_events
-- ---------------------------------------------------------------------------
create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  case_id uuid not null references cases (id) on delete cascade,
  happened_at timestamptz not null,
  title text not null,
  description text not null default '',
  evidence_ids uuid[] not null default '{}',
  importance text not null default 'medium',
  tags text[] not null default '{}',
  source text not null default '',
  is_key_event boolean not null default false,
  show_in_packet boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_case_idx on timeline_events (case_id);

-- ---------------------------------------------------------------------------
-- evidence_logs (integrity log — append only from the app's perspective)
-- ---------------------------------------------------------------------------
create table if not exists evidence_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  evidence_id uuid not null references evidence_items (id) on delete cascade,
  action text not null, -- uploaded | metadata_updated | hash_verified | export_included
  detail text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- evidence_packets (generated packet snapshots)
-- ---------------------------------------------------------------------------
create table if not exists evidence_packets (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  case_id uuid not null references cases (id) on delete cascade,
  packet_type text not null,
  options jsonb not null default '{}',
  document jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  case_id uuid not null references cases (id) on delete cascade,
  due_date date not null,
  note text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- saved_scripts
-- ---------------------------------------------------------------------------
create table if not exists saved_scripts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  case_id uuid references cases (id) on delete cascade,
  script_type text not null,
  tone text not null,
  body text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- communications
-- ---------------------------------------------------------------------------
create table if not exists communications (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  case_id uuid not null references cases (id) on delete cascade,
  type text not null default 'email',
  person_contacted text not null default '',
  happened_at timestamptz not null,
  summary text not null default '',
  outcome text not null default '',
  next_follow_up date,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- subscriptions (written by the Stripe webhook only)
-- ---------------------------------------------------------------------------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  plan text not null default 'free',
  stripe_customer_id text not null default '',
  stripe_subscription_id text not null default '',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- usage_limits
-- ---------------------------------------------------------------------------
create table if not exists usage_limits (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  active_cases int not null default 0,
  evidence_items int not null default 0,
  storage_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: users only ever see their own rows.
-- Case sharing is intentionally disabled in the MVP — there are no
-- cross-user grants of any kind.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','cases','evidence_items','timeline_events','evidence_logs',
    'evidence_packets','follow_ups','saved_scripts','communications',
    'subscriptions','usage_limits'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'drop policy if exists "%s_owner" on %I', t, t);
    execute format(
      'create policy "%s_owner" on %I for all
         using (clerk_user_id = requesting_user_id())
         with check (clerk_user_id = requesting_user_id())', t, t);
  end loop;
end $$;

-- Subscriptions are read-only for users; the Stripe webhook uses the
-- service role key (bypasses RLS) to write.
drop policy if exists "subscriptions_owner" on subscriptions;
create policy "subscriptions_read_own" on subscriptions
  for select using (clerk_user_id = requesting_user_id());

-- ---------------------------------------------------------------------------
-- Storage policies (run after creating the PRIVATE "evidence" bucket)
-- ---------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('evidence','evidence', false);

drop policy if exists "evidence_owner_read" on storage.objects;
create policy "evidence_owner_read" on storage.objects
  for select using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = requesting_user_id()
  );

drop policy if exists "evidence_owner_write" on storage.objects;
create policy "evidence_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = requesting_user_id()
  );

drop policy if exists "evidence_owner_delete" on storage.objects;
create policy "evidence_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = requesting_user_id()
  );

-- updated_at maintenance
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','cases','evidence_items','timeline_events','evidence_logs',
    'evidence_packets','follow_ups','saved_scripts','communications',
    'subscriptions','usage_limits'
  ] loop
    execute format('drop trigger if exists %s_updated_at on %I', t, t);
    execute format(
      'create trigger %s_updated_at before update on %I
         for each row execute function set_updated_at()', t, t);
  end loop;
end $$;
