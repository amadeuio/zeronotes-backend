-- Current Database Schema
-- Generated automatically - DO NOT EDIT MANUALLY
-- Run: npm run schema:dump
-- Date: 2025-11-22T23:25:22.047Z

-- Table: labels
CREATE TABLE IF NOT EXISTS labels (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Table: note_labels
CREATE TABLE IF NOT EXISTS note_labels (
  note_id UUID NOT NULL,
  label_id UUID NOT NULL,
  PRIMARY KEY (note_id, label_id)
);

ALTER TABLE note_labels ADD CONSTRAINT fk_note_labels_note_id FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE;
ALTER TABLE note_labels ADD CONSTRAINT fk_note_labels_label_id FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE;

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  color_id TEXT DEFAULT 'default'::text,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_trashed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

