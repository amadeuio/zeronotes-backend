import pool from '../config/database';
import { Label as LabelType } from '../types/labels';

const Label = {
  findAll: async (): Promise<LabelType[]> => {
    const result = await pool.query(
      'SELECT * FROM labels ORDER BY created_at DESC'
    );
    return result.rows;
  },

  create: async (id: number, name: string): Promise<LabelType> => {
    const result = await pool.query(
      'INSERT INTO labels (id, name) VALUES ($1, $2) RETURNING *',
      [id, name]
    );
    return result.rows[0];
  },

  update: async (id: number, name: string): Promise<LabelType> => {
    const result = await pool.query(
      'UPDATE labels SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  },

  deleteById: async (id: number): Promise<LabelType | undefined> => {
    const result = await pool.query(
      'DELETE FROM labels WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

export default Label;

