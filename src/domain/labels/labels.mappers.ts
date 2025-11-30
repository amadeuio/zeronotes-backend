import { LabelAPI, LabelDB } from "./labels.types";

export const labelMappers = {
  dbToAPI: (db: LabelDB): LabelAPI => ({
    id: db.id,
    name: db.name,
  }),
};
