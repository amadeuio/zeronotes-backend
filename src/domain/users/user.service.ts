import { v4 as uuidv4 } from "uuid";
import { userQueries } from "../../db/queries/users";
import { AuthError, ConflictError } from "../../errors/AppError";
import { hashPassword, verifyPassword } from "../../utils/crypto";
import { createToken } from "../../utils/jwt";
import { userMappers } from "./user.mappers";
import {
  AuthResponse,
  LoginRequest,
  UserAPI,
  UserCreateRequest,
} from "./user.types";

export const userService = {
  register: async (data: UserCreateRequest): Promise<AuthResponse> => {
    const existingUser = await userQueries.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const userId = uuidv4();
    const user = await userQueries.create(userId, data.email, passwordHash);

    const token = await createToken(user.id);

    return {
      user: userMappers.dbToAPI(user),
      token,
    };
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const user = await userQueries.findByEmail(data.email);
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
    const user = await userQueries.findById(id);
    return user ? userMappers.dbToAPI(user) : null;
  },
};
