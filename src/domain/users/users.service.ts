import { v4 as uuidv4 } from "uuid";
import { AuthError, ConflictError } from "../../utils/AppError";
import { hashPassword, verifyPassword } from "../../utils/crypto";
import { createToken } from "../../utils/jwt";
import { userMappers } from "./users.mappers";
import { LoginSchema, UserCreateSchema } from "./users.schemas";
import { AuthResponse, UserAPI } from "./users.types";
import { userRepository } from "./users.repository";

export const userService = {
  register: async (data: UserCreateSchema): Promise<AuthResponse> => {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const userId = uuidv4();
    const user = await userRepository.create(userId, data.email, passwordHash);

    const token = await createToken(user.id);

    return {
      user: userMappers.dbToAPI(user),
      token,
    };
  },

  login: async (data: LoginSchema): Promise<AuthResponse> => {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AuthError("Invalid credentials");
    }

    const isValid = await verifyPassword(user.password_hash, data.password);
    if (!isValid) {
      throw new AuthError("Invalid credentials");
    }

    const token = await createToken(user.id);

    return {
      user: userMappers.dbToAPI(user),
      token,
    };
  },

  findById: async (id: string): Promise<UserAPI | null> => {
    const user = await userRepository.findById(id);
    return user ? userMappers.dbToAPI(user) : null;
  },
};
