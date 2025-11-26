export interface Note {
  id: string;
  order: number;
  title: string;
  content: string;
  colorId: string;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteDto = Note & {
  labelIds: string[];
};

export interface NoteCreateRequest {
  id: string;
  title?: string;
  content?: string;
  colorId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  labelIds?: string[];
}

export interface NoteUpdateRequest {
  title?: string;
  content?: string;
  colorId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
}
