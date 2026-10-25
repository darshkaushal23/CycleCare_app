
create table if not exists public.circle_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 age_space text not null check (age_space in ('teen','adult')),
 alias text not null default ('Saheli ' || lpad(floor(random()*10000)::int::text,4,'0')),
 created_at timestamptz not null default now()
);
create table if not exists public.circle_staff (
 user_id uuid primary key references auth.users(id) on delete cascade,
 is_doctor boolean not null default false
);
create table if not exists public.circle_posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.circle_members(user_id) on delete cascade,
 author_alias text not null default '',
 age_space text not null check (age_space in ('teen','adult')),
 topic text not null check (topic in ('Periods','Cramps','PCOS','First Period','Hygiene','Feelings')),
 title text not null default '',
 body text not null,
 parent_id uuid references public.circle_posts(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 checked_by_doctor boolean not null default false,
 created_at timestamptz not null default now(),
 constraint circle_content_size check (char_length(body) between 4 and 2000 and char_length(title) <= 120)
);
create table if not exists public.circle_reports (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.circle_posts(id) on delete cascade,
 reporter_id uuid not null references auth.users(id) on delete cascade,
 reason text not null check (reason in ('Bullying','Personal information','Harmful advice','Other')),
 created_at timestamptz not null default now(),
 unique(post_id,reporter_id)
);
create table if not exists public.circle_moderation_log (
 id bigint generated always as identity primary key,
 post_id uuid references public.circle_posts(id) on delete set null,
 moderator_id uuid references auth.users(id),
 action text not null,
 created_at timestamptz not null default now()
);
create or replace function public.circle_redact(input text) returns text language sql immutable as $$
select regexp_replace(
 regexp_replace(
 regexp_replace(
 regexp_replace(coalesce(input,''),'[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}','[email hidden]','gi'),
 '(https?://|www[.])[^[:space:]]+','[link hidden]','gi'),
 '(\+?[0-9][0-9 .()-]{8,}[0-9])','[number hidden]','g'),
 '([0-9]{1,5}[[:space:]]+[A-Za-z]+([[:space:]]+[A-Za-z]+){0,3}[[:space:]]+(Street|Road|Lane|Avenue|Sector|Apartment|Block))','[address hidden]','gi');
$$;
create or replace function public.circle_guard() returns trigger language plpgsql security definer set search_path = '' as $$
declare member public.circle_members; parent public.circle_posts; is_staff boolean; is_doctor boolean;
begin
 select exists(select 1 from public.circle_staff where user_id = auth.uid()),exists(select 1 from public.circle_staff where user_id=auth.uid() and is_doctor) into is_staff,is_doctor;
 if tg_op='INSERT' then
  select * into member from public.circle_members where user_id=auth.uid();
  if not found or new.author_id<>auth.uid() or new.age_space<>member.age_space then raise exception 'Invalid community membership'; end if;
  new.author_alias:=member.alias; new.status:='pending'; new.checked_by_doctor:=false;
  if new.parent_id is not null then
   select * into parent from public.circle_posts where id=new.parent_id;
   if not found or parent.status<>'approved' or parent.age_space<>new.age_space or parent.parent_id is not null then raise exception 'Invalid reply destination'; end if;
  end if;
 else
  if not is_staff then raise exception 'Only moderators may update content'; end if;
  if new.checked_by_doctor and not is_doctor then raise exception 'Doctor verification required'; end if;
  new.author_id:=old.author_id;new.age_space:=old.age_space;new.parent_id:=old.parent_id;new.author_alias:=old.author_alias;
 end if;
 new.title:=public.circle_redact(new.title);
 new.body:=public.circle_redact(new.body);
 return new;
end $$;
drop trigger if exists circle_guard_trigger on public.circle_posts;
create trigger circle_guard_trigger before insert or update on public.circle_posts for each row execute function public.circle_guard();
create or replace function public.circle_log_moderation() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status is distinct from old.status or new.body is distinct from old.body or new.checked_by_doctor is distinct from old.checked_by_doctor then
 insert into public.circle_moderation_log(post_id,moderator_id,action) values(new.id,auth.uid(),new.status);
 end if;
 return new;
end $$;
drop trigger if exists circle_moderation_trigger on public.circle_posts;
create trigger circle_moderation_trigger after update on public.circle_posts for each row execute function public.circle_log_moderation();
alter table public.circle_members enable row level security;
alter table public.circle_staff enable row level security;
alter table public.circle_posts enable row level security;
alter table public.circle_reports enable row level security;
alter table public.circle_moderation_log enable row level security;
create policy "member read self" on public.circle_members for select to authenticated using (user_id=(select auth.uid()));
create policy "member join" on public.circle_members for insert to authenticated with check(user_id=(select auth.uid()));
create policy "staff read own" on public.circle_staff for select to authenticated using(user_id=(select auth.uid()));
create policy "posts read approved or owned or staff" on public.circle_posts for select to authenticated using (
 exists(select 1 from public.circle_staff where user_id=(select auth.uid())) or
 (age_space=(select m.age_space from public.circle_members m where m.user_id=(select auth.uid()))
 and (status='approved' or author_id=(select auth.uid())))
);
create policy "post submit" on public.circle_posts for insert to authenticated with check (
 author_id=(select auth.uid()) and age_space=(select m.age_space from public.circle_members m where m.user_id=(select auth.uid()))
 and status='pending' and checked_by_doctor=false
);
create policy "post delete own" on public.circle_posts for delete to authenticated using(author_id=(select auth.uid()));
create policy "staff update posts" on public.circle_posts for update to authenticated
 using(exists(select 1 from public.circle_staff where user_id=(select auth.uid())))
 with check(exists(select 1 from public.circle_staff where user_id=(select auth.uid()))));
create policy "reports create" on public.circle_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and exists (
 select 1 from public.circle_posts p join public.circle_members m on m.user_id=(select auth.uid())
 where p.id=post_id and p.age_space=m.age_space and p.status='approved'));
create policy "reports staff only" on public.circle_reports for select to authenticated using(exists(select 1 from public.circle_staff where user_id=(select auth.uid())));
create policy "audit staff only" on public.circle_moderation_log for select to authenticated using(exists(select 1 from public.circle_staff where user_id=(select auth.uid())));
grant usage on schema public to authenticated;
grant select,insert on public.circle_members to authenticated;
grant select on public.circle_staff to authenticated;
grant select,insert,delete,update on public.circle_posts to authenticated;
grant select,insert on public.circle_reports to authenticated;
grant select on public.circle_moderation_log to authenticated;
revoke all on function public.circle_redact(text) from public,anon,authenticated;
