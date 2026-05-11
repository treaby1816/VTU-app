import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generates embeddings using OpenAI's text-embedding-3-small model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, ' '), // recommended by OpenAI
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}


/**
 * Helper function to upsert an embedding into Supabase pgvector.
 */
export async function upsertEmbedding(content: string, metadata: any = {}) {
  const embedding = await generateEmbedding(content);
  
  const { data, error } = await supabaseClient
    .from('documents')
    .insert({
      content,
      metadata,
      embedding
    })
    .select();
    
  if (error) {
    console.error("Error upserting embedding:", error);
    throw error;
  }
  return data;
}

/**
 * Helper function to query similar embeddings using the match_documents RPC.
 */
export async function querySimilarEmbeddings(queryText: string, matchCount: number = 5, matchThreshold: number = 0.7) {
  const queryEmbedding = await generateEmbedding(queryText);
  
  const { data, error } = await supabaseClient
    .rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount
    });
    
  if (error) {
    console.error("Error querying embeddings:", error);
    throw error;
  }
  
  return data;
}
