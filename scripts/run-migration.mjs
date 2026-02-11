import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  console.log('\n📝 To run migrations, you need the direct database connection string.');
  console.log('Alternative: Run the SQL manually in Supabase Dashboard:');
  console.log('   1. Go to: https://supabase.com/dashboard > Your Project > SQL Editor');
  console.log('   2. Copy contents from: supabase/migrations/0004_sp_formulas.sql');
  console.log('   3. Paste and execute\n');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Running migration: 0004_sp_formulas.sql\n');
  
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0004_sp_formulas.sql');
  const sql = readFileSync(migrationPath, 'utf-8');
  
  const client = postgres(databaseUrl, { max: 1 });
  
  try {
    await client.unsafe(sql);
    console.log('✅ Migration completed successfully!');
    console.log('📋 Created:');
    console.log('   - Table: sp_formulas');
    console.log('   - RLS policies for formulas');
    console.log('   - Indexes for performance');
    console.log('   - Trigger for updated_at\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n💡 If this error persists, run the SQL manually:');
    console.log('   Open Supabase Dashboard > SQL Editor');
    console.log('   File: supabase/migrations/0004_sp_formulas.sql\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
