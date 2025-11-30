import pool from "../../db/client";
import { NoteDB } from "./notes.types";

export const noteRepository = {
  findAllWithLabels: async (
    userId: string
  ): Promise<(NoteDB & { label_ids: string[] })[]> => {
    const result = await pool.query(
      `
      SELECT 
        n.*,
        COALESCE(
          json_agg(l.id) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) as label_ids
      FROM notes n
      LEFT JOIN note_labels nl ON n.id = nl.note_id
      LEFT JOIN labels l ON nl.label_id = l.id
      WHERE n.user_id = $1
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `,
      [userId]
    );

    return result.rows;
  },

  create: async (
    userId: string,
    id: string,
    order: number,
    title?: string,
    content?: string,
    colorId?: string,
    isPinned?: boolean,
    isArchived?: boolean
  ): Promise<NoteDB> => {
    const query = `
      INSERT INTO notes (user_id, id, "order", title, content, color_id, is_pinned, is_archived) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    const values = [
      userId,
      id,
      order,
      title,
      content,
      colorId,
      isPinned,
      isArchived,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  update: async (
    userId: string,
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
    values.push(id, userId);

    const query = `UPDATE notes SET ${fields.join(", ")} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  delete: async (userId: string, id: string): Promise<boolean> => {
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },

  getMinOrder: async (userId: string): Promise<number> => {
    const result = await pool.query(
      'SELECT MIN("order") FROM notes WHERE user_id = $1',
      [userId]
    );
    const minOrder = result.rows[0].min;
    return minOrder !== null ? minOrder - 1 : -1;
  },

  updateOrders: async (
    userId: string,
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

    values.push(userId);

    const query = `
      UPDATE notes
      SET "order" = v.order_value, updated_at = NOW()
      FROM (VALUES ${valuePlaceholders.join(", ")}) AS v(id, order_value)
      WHERE notes.id = v.id AND notes.user_id = $${paramCount}
    `;

    await pool.query(query, values);
  },
};
