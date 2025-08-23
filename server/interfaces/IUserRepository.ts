// interfaces/IUserRepository.ts

import type { IUser } from "./IUser.ts";
import { User } from "../model/User.ts";
import { UserRequest } from "../model/UserRequest.ts";
import type { Filter, UpdateFilter } from "mongodb";

export interface IUserRepository {
    create(data: User): Promise<User | null>;
    
    // Adicionado o método para atualizar o plano do usuário
    updatePlan(email: string, planId: string, paymentMethod: string, plan: number, datePay:Date): Promise<User | null> 
    
    // Adicionado o método genérico de atualização
    update(filter: Filter<User>, update: UpdateFilter<User>);

    updatePass(dto: User, pass:string): Promise<User | null>;
   
    
    updateAuthenticationEmail(email:string): Promise<User | null>;

    // Adicionado o método findById
    findById(_id: string): Promise<User | null>;

    findByEmail(email: string): Promise<User | null>;

    findByEmailToLogin(email: string): Promise<User | null>;
    
    list(): Promise<User[]>;
    
    // // Adicionado o método para verificar a senha
    // verifyPassword(email: string, password: string): Promise<boolean>;
}