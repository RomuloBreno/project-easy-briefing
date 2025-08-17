// models/User.ts
import type {IUser} from "../interfaces/IUser.ts";
import { ObjectId } from "mongodb";

export class User implements IUser {
   
    _id?: ObjectId | undefined;
    nameUser: string;
    email: string;
    passwordHash: string;
    createOn?: Date | undefined;
    planId?: string | undefined;
    plan: number;
    paymentMethod?: string | undefined;
    verificationCode?: string | undefined;
    isVerified?: boolean | undefined;
    validPayment?: boolean | undefined;
    timestamp?: Date | undefined;

  // Construtor baseado na interface
  constructor(user: User) {
    this._id = user._id;
    this.nameUser = user.nameUser;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.createOn = user.createOn ?? new Date(); // default = agora
    this.planId = user.planId;
    this.plan = user.plan;
    this.paymentMethod = user.paymentMethod;
    this.verificationCode = user.verificationCode;
    this.isVerified = user.isVerified ?? false; // default = false
  }

    // Método simulado de validação de plano com um gateway de pagamento.
    // **Essa lógica deve ser uma chamada para uma API externa real.**
    async validPlan(): Promise<boolean> {
        if (!this.planId) {
            return false;
        }
        // Simulação de chamada de API:
        // const isValid = await PaymentGateway.validatePlan(planId);
        return true;
    }

}