import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Note: In server components/API routes you should use @supabase/ssr, but for simplicity here we use the generic client
// or whatever client you have defined for your project.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Placeholder function for generating embeddings.
 * In a real scenario, you'd call the OpenAI API (or another provider) here.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Replace with actual call to OpenAI embeddings API
  // Example: 
  // const response = await openai.embeddings.create({
  //   model: "text-embedding-3-small",
  //   input: text,
  // });
  // return response.data[0].embedding;
  
  console.warn("Using placeholder embedding function. Please configure a real embedding provider.");
  return new Array(1536).fill(0).map(() => Math.random());
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
