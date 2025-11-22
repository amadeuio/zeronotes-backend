const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

async function dumpSchema() {
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
    const tablesResult = await client.query(`
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
      const columnsResult = await client.query(`
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
      const pkResult = await client.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass
        AND i.indisprimary;
      `, [tableName]);

      const primaryKeys = pkResult.rows.map(row => row.attname);

      // Get foreign keys
      const fkResult = await client.query(`
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
          let defaultValue = col.column_default
            .replace(/::\w+/g, '')
            .replace(/^'|'$/g, '');
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
    console.error('❌ Error generating schema:', error.message);
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

