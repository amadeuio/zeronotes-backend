const pool = require('../config/database');

const Note = {
  findAll: async () => {
    const result = await pool.query(
      'SELECT * FROM notes ORDER BY created_at DESC'
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  create: async (title, content, colorId = 'default', isPinned = false, isArchived = false, isTrashed = false) => {
    const result = await pool.query(
      'INSERT INTO notes (title, content, color_id, is_pinned, is_archived, is_trashed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, content, colorId, isPinned, isArchived, isTrashed]
    );
    return result.rows[0];
  },

  update: async (id, title, content, colorId, isPinned, isArchived, isTrashed) => {
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, color_id = $3, is_pinned = $4, is_archived = $5, is_trashed = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [title, content, colorId, isPinned, isArchived, isTrashed, id]
    );
    return result.rows[0];
  },

  deleteById: async (id) => {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Note;

