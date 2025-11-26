import pool from "../config/database";
import { Note, NoteDto } from "../types/notes";
import { keysToCamel } from "../utils/caseConverter";

const NoteModel = {
  findAll: async (): Promise<NoteDto[]> => {
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

  create: async (
    id: string,
    title?: string,
    content?: string,
    colorId?: string,
    isPinned?: boolean,
    isArchived?: boolean
  ): Promise<Note> => {
    const minPos = await pool.query('SELECT MIN("order") FROM notes');
    const firstPos = minPos.rows[0].min - 1;

    const query = `
      INSERT INTO notes (id, "order", title, content, color_id, is_pinned, is_archived) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      id,
      firstPos,
      title,
      content,
      colorId,
      isPinned,
      isArchived,
    ];

    const result = await pool.query(query, values);
    return keysToCamel(result.rows[0]);
  },

  update: async (
    id: string,
    title?: string,
    content?: string,
    colorId?: string,
    isPinned?: boolean,
    isArchived?: boolean
  ): Promise<Note> => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(content);
    }

    if (colorId !== undefined) {
      fields.push(`color_id = $${paramCount++}`);
      values.push(colorId);
    }

    if (isPinned !== undefined) {
      fields.push(`is_pinned = $${paramCount++}`);
      values.push(isPinned);
    }

    if (isArchived !== undefined) {
      fields.push(`is_archived = $${paramCount++}`);
      values.push(isArchived);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE notes SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return keysToCamel(result.rows[0]);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  findById: async (id: string): Promise<Note | undefined> => {
    const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);
    return keysToCamel(result.rows[0]);
  },
};

export default NoteModel;
