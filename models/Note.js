const pool = require('../config/database');

const Note = {
  findAll: async () => {
    const result = await pool.query(`
      SELECT 
        n.*,
        COALESCE(
          json_agg(l.id) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) as label_ids
      FROM notes n
      LEFT JOIN note_labels nl ON n.id = nl.note_id
      LEFT JOIN labels l ON nl.label_id = l.id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    
    return result.rows;
  },

  create: async (id, title, content, color_id = 'default', is_pinned = false, is_archived = false) => {
    const result = await pool.query(
      'INSERT INTO notes (id, title, content, color_id, is_pinned, is_archived) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, title, content, color_id, is_pinned, is_archived]
    );
    return result.rows[0];
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;
  
    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(updates.content);
    }
    if (updates.color_id !== undefined) {
      fields.push(`color_id = $${paramCount++}`);
      values.push(updates.color_id);
    }
    if (updates.is_pinned !== undefined) {
      fields.push(`is_pinned = $${paramCount++}`);
      values.push(updates.is_pinned);
    }
    if (updates.is_archived !== undefined) {
      fields.push(`is_archived = $${paramCount++}`);
      values.push(updates.is_archived);
    }
    if (updates.is_trashed !== undefined) {
      fields.push(`is_trashed = $${paramCount++}`);
      values.push(updates.is_trashed);
    }
  
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
  
    fields.push(`updated_at = NOW()`);
    values.push(id);
  
    const result = await pool.query(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
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

  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  addLabels: async (note_id, label_ids) => {
    if (!label_ids || label_ids.length === 0) {
      return [];
    }

    const values = [];
    const params = [];
    let paramIndex = 2;

    for (const label_id of label_ids) {
      values.push(`($1, $${paramIndex})`);
      params.push(label_id);
      paramIndex++;
    }

    const query = `
      INSERT INTO note_labels (note_id, label_id)
      VALUES ${values.join(', ')}
      ON CONFLICT (note_id, label_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [note_id, ...params]);
    return result.rows;
  },

  removeLabel: async (note_id, label_id) => {
    const result = await pool.query(
      'DELETE FROM note_labels WHERE note_id = $1 AND label_id = $2 RETURNING *',
      [note_id, label_id]
    );
    return result.rows[0];
  },
};

module.exports = Note;

