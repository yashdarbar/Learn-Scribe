create extension if not exists pgcrypto with schema extensions;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.pdf_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  file_path text not null,
  file_size bigint not null default 0,
  upload_status text not null default 'processing' check (upload_status in ('processing', 'completed', 'failed')),
  extracted_content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pdf_chat_messages (
  id uuid primary key default gen_random_uuid(),
  pdf_id uuid not null references public.pdf_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  response text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pdf_id uuid references public.pdf_documents(id) on delete set null,
  title text not null,
  description text,
  page_number integer,
  source_content text,
  is_saved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  flashcard_set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  question text not null,
  answer text not null,
  card_order integer not null default 1,
  difficulty_level text not null default 'medium' check (difficulty_level in ('easy', 'medium', 'hard')),
  card_type text not null default 'qa' check (card_type in ('qa', 'true_false', 'multiple_choice', 'fill_blank')),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pdf_id uuid references public.pdf_documents(id) on delete set null,
  title text not null,
  description text,
  page_number integer,
  source_content text,
  is_saved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  difficulty_level text not null default 'medium' check (difficulty_level in ('easy', 'medium', 'hard')),
  explanation text,
  card_order integer not null default 1,
  card_type text not null default 'multiple_choice',
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  time_taken integer,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_image_url text,
  author_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'published')),
  read_time integer not null default 1,
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_category_relations (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs(id) on delete cascade,
  category_id uuid not null references public.blog_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blog_id, category_id)
);

create table if not exists public.blog_likes (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blog_id, user_id)
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_pdf_documents_user_id on public.pdf_documents(user_id);
create index if not exists idx_pdf_documents_created_at on public.pdf_documents(created_at desc);
create index if not exists idx_pdf_chat_messages_pdf_id on public.pdf_chat_messages(pdf_id);
create index if not exists idx_pdf_chat_messages_user_id on public.pdf_chat_messages(user_id);
create index if not exists idx_flashcard_sets_user_id on public.flashcard_sets(user_id);
create index if not exists idx_flashcard_sets_pdf_id on public.flashcard_sets(pdf_id);
create index if not exists idx_flashcards_flashcard_set_id on public.flashcards(flashcard_set_id);
create index if not exists idx_quiz_sets_user_id on public.quiz_sets(user_id);
create index if not exists idx_quiz_sets_pdf_id on public.quiz_sets(pdf_id);
create index if not exists idx_quiz_questions_quiz_set_id on public.quiz_questions(quiz_set_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_quiz_set_id on public.quiz_attempts(quiz_set_id);
create index if not exists idx_blog_categories_slug on public.blog_categories(slug);
create index if not exists idx_blogs_author_id on public.blogs(author_id);
create index if not exists idx_blogs_slug on public.blogs(slug);
create index if not exists idx_blogs_status_created_at on public.blogs(status, created_at desc);
create index if not exists idx_blog_category_relations_blog_id on public.blog_category_relations(blog_id);
create index if not exists idx_blog_category_relations_category_id on public.blog_category_relations(category_id);
create index if not exists idx_blog_likes_blog_id on public.blog_likes(blog_id);
create index if not exists idx_blog_likes_user_id on public.blog_likes(user_id);

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_pdf_documents_updated_at on public.pdf_documents;
create trigger update_pdf_documents_updated_at
  before update on public.pdf_documents
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_flashcard_sets_updated_at on public.flashcard_sets;
create trigger update_flashcard_sets_updated_at
  before update on public.flashcard_sets
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_quiz_sets_updated_at on public.quiz_sets;
create trigger update_quiz_sets_updated_at
  before update on public.quiz_sets
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_blog_categories_updated_at on public.blog_categories;
create trigger update_blog_categories_updated_at
  before update on public.blog_categories
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_blogs_updated_at on public.blogs;
create trigger update_blogs_updated_at
  before update on public.blogs
  for each row execute function public.update_updated_at_column();

insert into public.blog_categories (name, slug, description, color)
values
  ('Technology', 'technology', 'Technology tutorials and insights', '#2563eb'),
  ('Writing', 'writing', 'Writing tips and publishing workflows', '#16a34a'),
  ('AI & Machine Learning', 'ai-machine-learning', 'AI tools, models, and machine learning guides', '#9333ea'),
  ('Productivity', 'productivity', 'Study and productivity systems', '#ea580c'),
  ('Research', 'research', 'Research methods and summaries', '#0891b2'),
  ('Education', 'education', 'Learning resources and education strategies', '#4f46e5')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  color = excluded.color;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pdfs', 'pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.pdf_documents enable row level security;
alter table public.pdf_chat_messages enable row level security;
alter table public.flashcard_sets enable row level security;
alter table public.flashcards enable row level security;
alter table public.quiz_sets enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_category_relations enable row level security;
alter table public.blog_likes enable row level security;

drop policy if exists profiles_select_own_or_public on public.profiles;
create policy profiles_select_own_or_public on public.profiles
  for select to authenticated
  using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists pdf_documents_select_own on public.pdf_documents;
create policy pdf_documents_select_own on public.pdf_documents
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists pdf_documents_insert_own on public.pdf_documents;
create policy pdf_documents_insert_own on public.pdf_documents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists pdf_documents_update_own on public.pdf_documents;
create policy pdf_documents_update_own on public.pdf_documents
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists pdf_documents_delete_own on public.pdf_documents;
create policy pdf_documents_delete_own on public.pdf_documents
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists pdf_chat_messages_all_own on public.pdf_chat_messages;
create policy pdf_chat_messages_all_own on public.pdf_chat_messages
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists flashcard_sets_all_own on public.flashcard_sets;
create policy flashcard_sets_all_own on public.flashcard_sets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists flashcards_all_own_set on public.flashcards;
create policy flashcards_all_own_set on public.flashcards
  for all to authenticated
  using (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcards.flashcard_set_id
        and flashcard_sets.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcards.flashcard_set_id
        and flashcard_sets.user_id = (select auth.uid())
    )
  );

drop policy if exists quiz_sets_all_own on public.quiz_sets;
create policy quiz_sets_all_own on public.quiz_sets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists quiz_questions_all_own_set on public.quiz_questions;
create policy quiz_questions_all_own_set on public.quiz_questions
  for all to authenticated
  using (
    exists (
      select 1 from public.quiz_sets
      where quiz_sets.id = quiz_questions.quiz_set_id
        and quiz_sets.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.quiz_sets
      where quiz_sets.id = quiz_questions.quiz_set_id
        and quiz_sets.user_id = (select auth.uid())
    )
  );

drop policy if exists quiz_attempts_all_own on public.quiz_attempts;
create policy quiz_attempts_all_own on public.quiz_attempts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists blog_categories_select_all on public.blog_categories;
create policy blog_categories_select_all on public.blog_categories
  for select to anon, authenticated
  using (true);

drop policy if exists blogs_select_published_or_own on public.blogs;
create policy blogs_select_published_or_own on public.blogs
  for select to anon, authenticated
  using (status = 'published' or (select auth.uid()) = author_id);

drop policy if exists blogs_insert_own on public.blogs;
create policy blogs_insert_own on public.blogs
  for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists blogs_update_own on public.blogs;
create policy blogs_update_own on public.blogs
  for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

drop policy if exists blogs_delete_own on public.blogs;
create policy blogs_delete_own on public.blogs
  for delete to authenticated
  using ((select auth.uid()) = author_id);

drop policy if exists blog_category_relations_select_visible on public.blog_category_relations;
create policy blog_category_relations_select_visible on public.blog_category_relations
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.blogs
      where blogs.id = blog_category_relations.blog_id
        and (blogs.status = 'published' or blogs.author_id = (select auth.uid()))
    )
  );

drop policy if exists blog_category_relations_modify_own_blog on public.blog_category_relations;
create policy blog_category_relations_modify_own_blog on public.blog_category_relations
  for all to authenticated
  using (
    exists (
      select 1 from public.blogs
      where blogs.id = blog_category_relations.blog_id
        and blogs.author_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.blogs
      where blogs.id = blog_category_relations.blog_id
        and blogs.author_id = (select auth.uid())
    )
  );

drop policy if exists blog_likes_select_all on public.blog_likes;
create policy blog_likes_select_all on public.blog_likes
  for select to anon, authenticated
  using (true);

drop policy if exists blog_likes_insert_own on public.blog_likes;
create policy blog_likes_insert_own on public.blog_likes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists blog_likes_delete_own on public.blog_likes;
create policy blog_likes_delete_own on public.blog_likes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists storage_pdfs_select_own on storage.objects;
create policy storage_pdfs_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists storage_pdfs_insert_own on storage.objects;
create policy storage_pdfs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists storage_pdfs_update_own on storage.objects;
create policy storage_pdfs_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists storage_pdfs_delete_own on storage.objects;
create policy storage_pdfs_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
