export interface Label {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLabelRequest {
  id: number;
  name: string;
}

