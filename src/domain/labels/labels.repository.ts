import pool from "../../db/client";
import { LabelDB } from "./label.types";

export const labelRepository = {
  findAll: async (userId: string): Promise<LabelDB[]> => {
    const result = await pool.query(
      "SELECT * FROM labels WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  },

  create: async (
    userId: string,
    id: string,
    name: string
  ): Promise<LabelDB> => {
    const result = await pool.query(
      "INSERT INTO labels (user_id, id, name) VALUES ($1, $2, $3) RETURNING *",
      [userId, id, name]
    );
    return result.rows[0];
  },

  update: async (
    userId: string,
    id: string,
    name: string
  ): Promise<LabelDB> => {
    const result = await pool.query(
      "UPDATE labels SET name = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *",
      [name, id, userId]
    );
    return result.rows[0];
  },

  delete: async (userId: string, id: string): Promise<boolean> => {
    const result = await pool.query(
      "DELETE FROM labels WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },
};
