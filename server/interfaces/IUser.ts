// interfaces/IUser.ts
import { ObjectId } from "mongodb";

export class IUser {
  _id?: ObjectId;
  token?: string; // Token de autenticação, opcional
  nameUser: string;
  email: string;
  passwordHash: string;
  createOn?: Date;
  planId?: string; // ID do plano de assinatura, opcional
  paymentMethod?: string; // Método de pagamento, opcional
}

