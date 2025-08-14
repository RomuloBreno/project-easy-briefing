// interfaces/IUser.ts
import { ObjectId } from "mongodb";

export class IUser {
  _id?: ObjectId;
  nameUser: string;
  email: string;
  passwordHash: string;
  createOn?: Date;
}

