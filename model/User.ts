// models/User.ts

import { IUserRepository } from "../interfaces/IUserRepository";
import { IUser } from "../interfaces/IUser";
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';


export class User {
  constructor(private repository: IUserRepository) {}

  async create(usuario: CreateUserDTO): Promise<string> {
    return this.repository.create(usuario);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.repository.findByEmail(email);
  }

  async list(): Promise<IUser[]> {
    return this.repository.list();
  }

  // Métodos adicionais de negócio podem ser adicionados aqui
  async registrarUsuario(
    nameUser: string, 
    email: string, 
    senha: string
  ): Promise<string> {
    const usuarioExistente = await this.findByEmail(email);
    if (usuarioExistente) {
      throw new Error("Email já está em uso");
    }

    return this.create({
      nameUser,
      email,
      password: await this.gerarHashSenha(senha)
    });
  }

  private async gerarHashSenha(senha: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(senha, 12);
  }
}