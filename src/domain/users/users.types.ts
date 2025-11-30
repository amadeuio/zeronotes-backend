export interface UserDB {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserAPI {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: UserAPI;
  token: string;
}
