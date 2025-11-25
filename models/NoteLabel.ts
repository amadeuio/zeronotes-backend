import pool from "../config/database";

const NoteLabel = {
  addLabelsToNote: async (
    noteId: string,
    labelIds: string[]
  ): Promise<void> => {
    const values: string[] = [];
    const params: string[] = [noteId];
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

    await pool.query(query, params);
  },
};

export default NoteLabel;
