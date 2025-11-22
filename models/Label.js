const pool = require('../config/database');

const Label = {
  findAll: async () => {
    const result = await pool.query(
      'SELECT * FROM labels ORDER BY created_at DESC'
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM labels WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  create: async (name) => {
    const result = await pool.query(
      'INSERT INTO labels (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  },

  update: async (id, name) => {
    const result = await pool.query(
      'UPDATE labels SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  },

  deleteById: async (id) => {
    const result = await pool.query(
      'DELETE FROM labels WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Label;

