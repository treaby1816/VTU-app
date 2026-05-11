import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script allows you to run the vector schema SQL directly against your Supabase database.
 * You will need your Database Connection String from:
 * Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI
 */

async function runSchema() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: Please provide your database connection string.');
    console.log('Usage: node scripts/setup-db.mjs "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('⏳ Connecting to Supabase...');
    await client.connect();
    
    console.log('📖 Reading supabase-vector-schema.sql...');
    const sqlPath = path.join(__dirname, '..', 'supabase-vector-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executing SQL...');
    await client.query(sql);

    console.log('✅ Success! Vector extension enabled and documents table created.');
  } catch (err) {
    console.error('❌ Error executing SQL:', err.message);
  } finally {
    await client.end();
  }
}

runSchema();
