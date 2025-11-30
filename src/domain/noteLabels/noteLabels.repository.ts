import pool from "../../db/client";

export const noteLabelRepository = {
  addLabelToNote: async (noteId: string, labelId: string): Promise<boolean> => {
    const result = await pool.query(
      "INSERT INTO note_labels (note_id, label_id) VALUES ($1, $2) ON CONFLICT (note_id, label_id) DO NOTHING",
      [noteId, labelId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },

  removeLabelFromNote: async (
    noteId: string,
    labelId: string
  ): Promise<boolean> => {
    const result = await pool.query(
      "DELETE FROM note_labels WHERE note_id = $1 AND label_id = $2",
      [noteId, labelId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },

  addLabelsToNote: async (
    noteId: string,
    labelIds: string[]
  ): Promise<boolean> => {
    const values = [];
    const params = [noteId];
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
    `;

    const result = await pool.query(query, params);
    return result.rowCount ? result.rowCount > 0 : false;
  },
};
