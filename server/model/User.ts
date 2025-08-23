// models/User.ts
import type {IUser} from "../interfaces/IUser.ts";
import { ObjectId } from "mongodb";

export class User implements IUser {
    
    _id?: ObjectId | undefined;
    name: string;
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
    qtdRequest: number | 0; 

    // Construtor baseado na interface
    constructor(user: IUser) { // Usar IUser aqui para ser mais flexível
        this._id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.passwordHash = user.passwordHash;
        this.createOn = user.createOn ?? new Date(); // default = agora
        this.planId = user.planId;
        this.plan = user.plan;
        this.paymentMethod = user.paymentMethod;
        this.verificationCode = user.verificationCode;
        this.isVerified = user.isVerified ?? false; // default = false
        // NOVO: Inicializa qtdRequest. Pode ser 0, ou um valor padrão baseado no plano
        this.qtdRequest = user.qtdRequest ?? 0; 
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
