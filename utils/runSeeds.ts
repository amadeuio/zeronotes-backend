import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function runSeeds(): Promise<void> {
  const seedsDir = path.join(__dirname, '../seeds');
  
  // Check if seeds directory exists
  if (!fs.existsSync(seedsDir)) {
    console.log('❌ Seeds directory not found');
    process.exit(1);
  }

  // Read all seed files
  const files = fs.readdirSync(seedsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically (001, 002, 003...)

  if (files.length === 0) {
    console.log('⚠️  No seed files found');
    return;
  }

  console.log(`📦 Found ${files.length} seed file(s)\n`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`🔄 Running seed: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✅ Successfully executed: ${file}\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error executing ${file}:`, errorMessage);
        throw error;
      }
    }

    await client.query('COMMIT');
    console.log('✨ All seeds completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Seeding failed, rolled back:', errorMessage);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

