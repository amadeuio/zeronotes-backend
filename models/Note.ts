import pool from "../config/database";
import {
  CreateNoteRequest,
  type Note,
  type NoteUpdateRequest,
} from "../types/notes";
import { keysToCamel, keysToSnake } from "../utils/caseConverter";

const Note = {
  getAll: async (): Promise<(Note & { labelIds: string[] })[]> => {
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

    return result.rows.map(keysToCamel);
  },

  create: async (body: Omit<CreateNoteRequest, "labelIds">): Promise<Note> => {
    const { id, title, content, color_id, is_pinned, is_archived } =
      keysToSnake(body);

    const query = `
      INSERT INTO notes (id, title, content, color_id, is_pinned, is_archived) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;

    const values = [id, title, content, color_id, is_pinned, is_archived];

    const result = await pool.query(query, values);
    return keysToCamel(result.rows[0]);
  },

  update: async (id: string, updates: NoteUpdateRequest): Promise<Note> => {
    const snakeUpdates = keysToSnake(updates);
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(snakeUpdates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE notes SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return keysToCamel(result.rows[0]);
  },

  deleteById: async (id: string): Promise<Note | undefined> => {
    const query = `
      DELETE FROM notes WHERE id = $1 
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return keysToCamel(result.rows[0]);
  },

  findById: async (id: string): Promise<Note | undefined> => {
    const query = `SELECT * FROM notes WHERE id = $1`;

    const result = await pool.query(query, [id]);
    return keysToCamel(result.rows[0]);
  },

  addLabels: async (
    noteId: string,
    labelIds: string[]
  ): Promise<Array<{ noteId: string; labelId: string }>> => {
    const values = [];
    const params = [];
    let paramIndex = 2;

    for (const labelId of labelIds) {
      values.push(`($1, $${paramIndex})`);
      params.push(labelId);
      paramIndex++;
    }

    const query = `
      INSERT INTO note_labels (note_id, label_id)
      VALUES ${values.join(", ")}
      ON CONFLICT (note_id, label_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [noteId, ...params]);
    return result.rows.map(keysToCamel);
  },

  removeLabel: async (
    noteId: string,
    labelId: string
  ): Promise<{ noteId: string; labelId: string } | undefined> => {
    const result = await pool.query(
      "DELETE FROM note_labels WHERE note_id = $1 AND label_id = $2 RETURNING *",
      [noteId, labelId]
    );
    return result.rows[0] ? keysToCamel(result.rows[0]) : undefined;
  },
};

export default Note;
