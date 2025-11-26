-- Database Schema
-- Modify this file directly for schema changes
-- Run: npm run migrate
-- WARNING: This will DROP and recreate all tables, deleting all data!

-- Drop existing tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS note_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS notes CASCADE;

-- Table: notes
CREATE TABLE notes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  "order" INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  color_id TEXT DEFAULT 'default',
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_trashed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Table: labels
CREATE TABLE labels (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Table: note_labels (junction table)
CREATE TABLE note_labels (
  note_id UUID NOT NULL,
  label_id UUID NOT NULL,
  PRIMARY KEY (note_id, label_id)
);

-- Foreign key constraints
ALTER TABLE note_labels 
  ADD CONSTRAINT fk_note_labels_note_id 
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE;

ALTER TABLE note_labels 
  ADD CONSTRAINT fk_note_labels_label_id 
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE;

