import { labelMappers } from "./label.mappers";
import { LabelCreateSchema, LabelUpdateSchema } from "./label.schemas";
import { LabelAPI } from "./label.types";
import { labelRepository } from "./labels.repository";

export const labelService = {
  findAll: async (userId: string): Promise<Record<string, LabelAPI>> => {
    const labels = await labelRepository.findAll(userId);
    const labelsById = labels.reduce(
      (acc, label) => {
        acc[label.id] = labelMappers.dbToAPI(label);
        return acc;
      },
      {} as Record<string, LabelAPI>
    );
    return labelsById;
  },

  create: async (userId: string, data: LabelCreateSchema): Promise<string> => {
    const label = await labelRepository.create(userId, data.id, data.name);
    return label.id;
  },

  update: async (
    userId: string,
    id: string,
    data: LabelUpdateSchema
  ): Promise<string> => {
    const label = await labelRepository.update(userId, id, data.name);
    return label.id;
  },

  delete: async (userId: string, id: string): Promise<boolean> => {
    return await labelRepository.delete(userId, id);
  },
};
