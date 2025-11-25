import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

interface TableRow {
  table_name: string;
}

interface ColumnRow {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  column_default: string | null;
}

interface PrimaryKeyRow {
  attname: string;
}

interface ForeignKeyRow {
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  delete_rule: string;
}

async function dumpSchema(): Promise<void> {
  const schemaDir = path.join(__dirname, '../schema');
  const schemaFile = path.join(schemaDir, 'current_schema.sql');

  // Create schema directory if it doesn't exist
  if (!fs.existsSync(schemaDir)) {
    fs.mkdirSync(schemaDir, { recursive: true });
  }

  const client = await pool.connect();

  try {
    console.log('📋 Generating schema from database...\n');

    // Get all tables
    const tablesResult = await client.query<TableRow>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    let schemaContent = `-- Current Database Schema
-- Generated automatically - DO NOT EDIT MANUALLY
-- Run: npm run schema:dump
-- Date: ${new Date().toISOString()}

`;

    for (const table of tablesResult.rows) {
      const tableName = table.table_name;

      // Get table columns
      const columnsResult = await client.query<ColumnRow>(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      // Get primary keys
      const pkResult = await client.query<PrimaryKeyRow>(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass
        AND i.indisprimary;
      `, [tableName]);

      const primaryKeys = pkResult.rows.map(row => row.attname);

      // Get foreign keys
      const fkResult = await client.query<ForeignKeyRow>(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1;
      `, [tableName]);

      // Build CREATE TABLE statement
      schemaContent += `-- Table: ${tableName}\n`;
      schemaContent += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

      const columnDefs = columnsResult.rows.map(col => {
        let def = `  ${col.column_name} ${col.data_type.toUpperCase()}`;

        // Add length for varchar/text types
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }

        // Add NOT NULL
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }

        // Add default value
        if (col.column_default) {
          // Clean up default values (remove ::type casts)
          def += ` DEFAULT ${col.column_default}`;
        }

        return def;
      });

      schemaContent += columnDefs.join(',\n');

      // Add primary key
      if (primaryKeys.length > 0) {
        schemaContent += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
      }

      schemaContent += '\n);\n\n';

      // Add foreign keys
      if (fkResult.rows.length > 0) {
        for (const fk of fkResult.rows) {
          const onDelete = fk.delete_rule === 'CASCADE' ? ' ON DELETE CASCADE' : '';
          schemaContent += `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${fk.column_name} FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})${onDelete};\n`;
        }
        schemaContent += '\n';
      }
    }

    // Write to file
    fs.writeFileSync(schemaFile, schemaContent, 'utf8');
    console.log(`✅ Schema dumped to: ${schemaFile}`);
    console.log(`📊 Found ${tablesResult.rows.length} table(s)\n`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error generating schema:', errorMessage);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

dumpSchema().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

