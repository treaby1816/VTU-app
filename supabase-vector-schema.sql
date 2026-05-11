-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your embeddings
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb,
  embedding vector(1536) -- Assuming 1536 dimensions for OpenAI text-embedding-ada-002 or text-embedding-3-small
);

-- Create an index to speed up similarity search
-- Adjust the lists parameter depending on the number of rows you expect to have
create index if not exists documents_embedding_idx on documents using hnsw (embedding vector_cosine_ops);

-- Create a function to search for documents
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb default '{}'
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.metadata @> filter
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
