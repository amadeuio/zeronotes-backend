import pool from "../../db/client";
import { UserDB } from "./users.types";

export const userRepository = {
  findByEmail: async (email: string): Promise<UserDB | null> => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  findById: async (id: string): Promise<UserDB | null> => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  create: async (
    id: string,
    email: string,
    passwordHash: string
  ): Promise<UserDB> => {
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [id, email, passwordHash]
    );
    return result.rows[0];
  },
};
