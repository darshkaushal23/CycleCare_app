-- Applied to the existing Saheli Circle tables. Does not recreate them.
-- Stops a parent delete from removing other people's replies, blocks self-approval,
-- forces random aliases, and lets members withdraw their own posts through one function.

create or replace function public.circle_guard()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  member public.circle_members;
  parent public.circle_posts;
  is_staff boolean;
  is_doctor boolean;
begin
  select exists(select 1 from public.circle_staff where user_id = auth.uid()),
         exists(select 1 from public.circle_staff where user_id = auth.uid() and is_doctor)
    into is_staff, is_doctor;

  if tg_op = 'UPDATE' and current_setting('circle.withdraw', true) = '1' then
    if old.author_id is distinct from auth.uid() then
      raise exception 'Not your post';
    end if;
    new.author_id := old.author_id;
    new.age_space := old.age_space;
    new.parent_id := old.parent_id;
    new.author_alias := old.author_alias;
    new.checked_by_doctor := false;
    new.status := 'rejected';
    new.title := '[removed by author]';
    new.body := 'This question was removed by its author.';
    return new;
  end if;

  if tg_op = 'INSERT' then
    select * into member from public.circle_members where user_id = auth.uid();
    if not found or new.author_id <> auth.uid() or new.age_space <> member.age_space then
      raise exception 'Invalid community membership';
    end if;
    new.author_alias := member.alias;
    new.status := 'pending';
    new.checked_by_doctor := false;
    if new.parent_id is not null then
      select * into parent from public.circle_posts where id = new.parent_id;
      if not found or parent.status <> 'approved' or parent.age_space <> new.age_space or parent.parent_id is not null then
        raise exception 'Invalid reply destination';
      end if;
    end if;
  else
    if not is_staff then
      raise exception 'Only moderators may update content';
    end if;
    if old.author_id = auth.uid() then
      raise exception 'You cannot moderate your own post';
    end if;
    if new.checked_by_doctor and not is_doctor then
      raise exception 'Doctor verification required';
    end if;
    new.author_id := old.author_id;
    new.age_space := old.age_space;
    new.parent_id := old.parent_id;
    new.author_alias := old.author_alias;
  end if;

  new.title := public.circle_redact(new.title);
  new.body := public.circle_redact(new.body);
  return new;
end;
$$;

create or replace function public.circle_member_guard()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'Invalid community membership';
  end if;
  new.alias := 'Saheli ' || lpad((floor(random() * 10000))::int::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists circle_member_guard_trigger on public.circle_members;
create trigger circle_member_guard_trigger
before insert on public.circle_members
for each row execute function public.circle_member_guard();

create or replace function public.circle_delete_my_posts()
returns void
language plpgsql
security definer
set search_path to ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  delete from public.circle_posts
  where author_id = auth.uid() and parent_id is not null;

  delete from public.circle_posts as post
  where post.author_id = auth.uid()
    and post.parent_id is null
    and not exists (
      select 1 from public.circle_posts as child
      where child.parent_id = post.id
        and child.author_id is distinct from auth.uid()
    );

  perform set_config('circle.withdraw', '1', true);
  update public.circle_posts
  set title = '[removed by author]',
      body = 'This question was removed by its author.',
      status = 'rejected',
      checked_by_doctor = false
  where author_id = auth.uid() and parent_id is null;
  perform set_config('circle.withdraw', '0', true);
end;
$$;

alter table public.circle_posts drop constraint if exists circle_posts_parent_id_fkey;
alter table public.circle_posts
  add constraint circle_posts_parent_id_fkey
  foreign key (parent_id) references public.circle_posts(id) on delete restrict;

drop policy if exists "reports create" on public.circle_reports;
create policy "reports create" on public.circle_reports
for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'open'
  and reviewed_by is null
  and exists (
    select 1
    from public.circle_posts as post
    join public.circle_members as member on member.user_id = (select auth.uid())
    where post.id = post_id
      and post.age_space = member.age_space
      and post.status = 'approved'
  )
);

revoke all on function public.circle_guard() from public, anon, authenticated;
revoke all on function public.circle_log_moderation() from public, anon, authenticated;
revoke all on function public.circle_rate_limit() from public, anon, authenticated;
revoke all on function public.circle_redact(text) from public, anon, authenticated;
revoke all on function public.circle_report_review_guard() from public, anon, authenticated;
revoke all on function public.circle_member_guard() from public, anon, authenticated;
revoke all on function public.circle_delete_my_posts() from public, anon;
grant execute on function public.circle_delete_my_posts() to authenticated;
