// interfaces/IUser.ts
import { ObjectId } from "mongodb";
import type { CreateUserDTO } from "../DTO/CreateUserDTO";

export interface IUser {
    _id?: ObjectId;
    token?: string;
    name: string;
    email: string;
    passwordHash: string;
    createOn?: Date;
    updateAt?:Date;
    planId?: string;
    plan: number;
    paymentMethod?: string;
    verificationCode?: string; // Adicionado para verificação
    isVerified?: boolean; // Adicionado para verificação
    validPayment?: boolean; // Indica se o pagamento é válido, opcional
    timestamp?: Date;
    qtdRequest: number;
    planExpirationDate?:Date;
    preferenceOrder?:ObjectId;
    

}