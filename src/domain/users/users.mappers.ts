import { UserAPI, UserDB } from "./users.types";

export const userMappers = {
  dbToAPI: (db: UserDB): UserAPI => ({
    id: db.id,
    email: db.email,
  }),
};
