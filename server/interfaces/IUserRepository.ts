// interfaces/IUserRepository.ts

import type {IUser} from "./IUser.ts";
import type {CreateUserDTO} from '../DTO/CreateUserDTO.ts';
export interface IUserRepository {
  create(usuario: CreateUserDTO): Promise<string>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailToLogin(email: string): Promise<IUser | null>;
  list(): Promise<IUser[]>;
}