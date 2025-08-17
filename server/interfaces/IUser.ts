// interfaces/IUser.ts
import { ObjectId } from "mongodb";
import type { CreateUserDTO } from "../DTO/CreateUserDTO";

export interface IUser {
    _id?: ObjectId;
    token?: string;
    nameUser: string;
    email: string;
    passwordHash: string;
    createOn?: Date;
    planId?: string;
    plan: number;
    paymentMethod?: string;
    verificationCode?: string; // Adicionado para verificação
    isVerified?: boolean; // Adicionado para verificação
    validPayment?: boolean; // Indica se o pagamento é válido, opcional
    timestamp?: Date;

}