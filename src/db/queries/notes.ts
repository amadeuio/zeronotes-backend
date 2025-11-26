import { NoteDB } from "../../domain/notes/note.types";
import pool from "../client";

export const noteQueries = {
  findAllWithLabels: async (): Promise<
    (NoteDB & { label_ids: string[] })[]
  > => {
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

  create: async (
    id: string,
    order: number,
    title?: string,
    content?: string,
    colorId?: string,
    isPinned?: boolean,
    isArchived?: boolean
  ): Promise<NoteDB> => {
    const query = `
      INSERT INTO notes (id, "order", title, content, color_id, is_pinned, is_archived) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [id, order, title, content, colorId, isPinned, isArchived];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  update: async (
    id: string,
    title?: string,
    content?: string,
    colorId?: string,
    isPinned?: boolean,
    isArchived?: boolean
  ): Promise<NoteDB> => {
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
    return result.rows[0];
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  getMinOrder: async (): Promise<number> => {
    const result = await pool.query('SELECT MIN("order") FROM notes');
    return result.rows[0].min - 1;
  },

  updateOrders: async (
    updates: Array<{ id: string; order: number }>
  ): Promise<void> => {
    const values: any[] = [];
    const valuePlaceholders: string[] = [];
    let paramCount = 1;

    for (const update of updates) {
      valuePlaceholders.push(
        `($${paramCount++}::uuid, $${paramCount++}::integer)`
      );
      values.push(update.id, update.order);
    }

    const query = `
      UPDATE notes
      SET "order" = v.order_value, updated_at = NOW()
      FROM (VALUES ${valuePlaceholders.join(", ")}) AS v(id, order_value)
      WHERE notes.id = v.id
    `;

    await pool.query(query, values);
  },
};
