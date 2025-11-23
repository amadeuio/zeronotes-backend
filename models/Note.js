const pool = require('../config/database');

const Note = {
  findAll: async (filters = {}) => {
    const { view, search } = filters;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (view) {
      if (view.type === 'archive') {
        conditions.push(`n.is_archived = true`);
      } else if (view.type === 'trash') {
        conditions.push(`n.is_trashed = true`);
      } else if (view.type === 'notes') {
        conditions.push(`n.is_archived = false AND n.is_trashed = false`);
      } else if (view.type === 'label' && view.id) {
        conditions.push(`n.id IN (
          SELECT note_id FROM note_labels WHERE label_id = $${paramIndex}
        )`);
        params.push(view.id);
        paramIndex++;
      }
    } else {
      conditions.push(`n.is_trashed = false`);
    }

    if (search && search.trim()) {
      conditions.push(`(
        n.title ILIKE $${paramIndex} OR 
        n.content ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        n.*,
        COALESCE(
          json_agg(l.id) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) as label_ids
      FROM notes n
      LEFT JOIN note_labels nl ON n.id = nl.note_id
      LEFT JOIN labels l ON nl.label_id = l.id
      ${whereClause}
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
  },

  create: async (title, content, colorId = 'default', isPinned = false, isArchived = false) => {
    const result = await pool.query(
      'INSERT INTO notes (title, content, color_id, is_pinned, is_archived) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, colorId, isPinned, isArchived]
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

