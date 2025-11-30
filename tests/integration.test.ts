import { v4 as uuidv4 } from "uuid";
import {
  api,
  createLabel,
  createNote,
  getAuthToken,
} from "./helpers/testHelpers";

describe("Notes and Labels Integration", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAuthToken();
  });

  describe("Adding and removing labels from notes", () => {
    it("should add a label to a note", async () => {
      // Create a note
      const noteResponse = await createNote(token, {
        title: "Test Note",
        content: "Test Content",
      });
      const noteId = noteResponse.body.id;
      // Create a label
      const labelId = uuidv4();
      await createLabel(token, {
        id: labelId,
        name: "Test Label",
      });

      // Add label to note
      const response = await api
        .post(`/api/notes/${noteId}/labels/${labelId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it("should remove a label from a note", async () => {
      // Create a note
      const noteResponse = await createNote(token, {
        title: "Test Note",
        content: "Test Content",
      });
      const noteId = noteResponse.body.id;

      // Create a label
      const labelId = uuidv4();
      await createLabel(token, {
        id: labelId,
        name: "Test Label",
      });

      // Add label to note
      await api
        .post(`/api/notes/${noteId}/labels/${labelId}`)
        .set("Authorization", `Bearer ${token}`);

      // Remove label from note
      const response = await api
        .delete(`/api/notes/${noteId}/labels/${labelId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it("should create a label and add it to a note in one request", async () => {
      // Create a note
      const noteResponse = await createNote(token, {
        title: "Test Note",
        content: "Test Content",
      });
      const noteId = noteResponse.body.id;

      // Create label and add to note
      const labelId = uuidv4();
      const response = await api
        .post(`/api/notes/${noteId}/labels`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          id: labelId,
          name: "New Label",
          color: "#FF0000",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("should return 401 when adding label without authentication", async () => {
      const response = await api.post("/api/notes/note-id/labels/label-id");

      expect(response.status).toBe(401);
    });

    it("should return 401 when removing label without authentication", async () => {
      const response = await api.delete("/api/notes/note-id/labels/label-id");

      expect(response.status).toBe(401);
    });
  });

  describe("Complex scenarios", () => {
    it("should handle multiple labels on a single note", async () => {
      // Create a note
      const noteResponse = await createNote(token, {
        title: "Multi-Label Note",
        content: "Content",
      });
      const noteId = noteResponse.body.id;

      // Create multiple labels
      const label1Id = uuidv4();
      const label2Id = uuidv4();
      const label3Id = uuidv4();

      await createLabel(token, { id: label1Id, name: "Label 1" });
      await createLabel(token, { id: label2Id, name: "Label 2" });
      await createLabel(token, { id: label3Id, name: "Label 3" });

      // Add all labels to the note
      await api
        .post(`/api/notes/${noteId}/labels/${label1Id}`)
        .set("Authorization", `Bearer ${token}`);
      await api
        .post(`/api/notes/${noteId}/labels/${label2Id}`)
        .set("Authorization", `Bearer ${token}`);
      await api
        .post(`/api/notes/${noteId}/labels/${label3Id}`)
        .set("Authorization", `Bearer ${token}`);

      // Get all notes and verify labels
      const getResponse = await api
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);

      const note = getResponse.body.notesById[noteId];
      expect(note).toBeDefined();
      expect(note.labelIds).toBeDefined();
      expect(note.labelIds.length).toBe(3);
    });

    it("should handle deleting a label that's assigned to multiple notes", async () => {
      // Create multiple notes
      const note1Response = await createNote(token, {
        title: "Note 1",
        content: "Content 1",
      });
      const note2Response = await createNote(token, {
        title: "Note 2",
        content: "Content 2",
      });

      const note1Id = note1Response.body.id;
      const note2Id = note2Response.body.id;

      // Create a label
      const labelId = uuidv4();
      await createLabel(token, {
        id: labelId,
        name: "Shared Label",
      });

      // Add label to both notes
      await api
        .post(`/api/notes/${note1Id}/labels/${labelId}`)
        .set("Authorization", `Bearer ${token}`);
      await api
        .post(`/api/notes/${note2Id}/labels/${labelId}`)
        .set("Authorization", `Bearer ${token}`);

      // Delete the label
      const deleteResponse = await api
        .delete(`/api/labels/${labelId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(204);

      // Verify label is removed from both notes
      const getNotesResponse = await api
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);

      const updatedNote1 = getNotesResponse.body.notesById[note1Id];
      const updatedNote2 = getNotesResponse.body.notesById[note2Id];

      // Verify the label is not in the notes anymore
      if (updatedNote1.labels) {
        const hasLabel1 = updatedNote1.labels.some(
          (l: any) => l.id === labelId
        );
        expect(hasLabel1).toBe(false);
      }

      if (updatedNote2.labels) {
        const hasLabel2 = updatedNote2.labels.some(
          (l: any) => l.id === labelId
        );
        expect(hasLabel2).toBe(false);
      }
    });
  });
});
