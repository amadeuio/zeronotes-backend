export interface Note {
  id: string;
  title: string;
  content: string;
  colorId: string;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
}

export type CreateNoteRequest = {
  id: string;
  title: string;
  content: string;
  colorId: string;
  isPinned: boolean;
  isArchived: boolean;
  labelIds: string[];
};

export interface NoteUpdate {
  title?: string;
  content?: string;
  color_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
}
