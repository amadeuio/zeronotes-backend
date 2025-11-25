export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  color_id: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  created_at: Date;
  updated_at: Date;
  label_ids?: number[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
}

export interface CreateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  color_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  labels?: Array<{ id: number }>;
}

