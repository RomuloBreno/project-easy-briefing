// interfaces/IUserRepository.ts

import type { IUser } from "./IUser.ts";
import { User } from "../model/User.ts";
import { UserRequest } from "../model/UserRequest.ts";

export interface IUserRepository {
    create(usuario: IUser, pass:string): Promise<User>;
    
    // Adicionado o método para atualizar o plano do usuário
    updatePlan(dto: User): Promise<User | null>
    
    // Adicionado o método genérico de atualização
    update(user: Partial<IUser>): Promise<User | null>;
    
    updateAuthenticationEmail(email:string): Promise<User | null>;

    // Adicionado o método findById
    findById(_id: string): Promise<User | null>;

    findByEmail(email: string): Promise<User | null>;

    findByEmailToLogin(email: string): Promise<User | null>;
    
    list(): Promise<User[]>;
    
    // Adicionado o método para verificar a senha
    verifyPassword(email: string, password: string): Promise<boolean>;
}