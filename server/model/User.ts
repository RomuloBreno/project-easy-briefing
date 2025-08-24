// models/User.ts
import { getPayment } from "../auth/marcadopagoApi.ts";
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
    planExpirationDate?:Date;
    preferenceOrder?:string

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
        this.planExpirationDate = user.planExpirationDate
        this.preferenceOrder = user.preferenceOrder
    }

    // Método simulado de validação de plano com um gateway de pagamento.
    // **Essa lógica deve ser uma chamada para uma API externa real.**
  async validPlan(): Promise<boolean> {
    // 1. Verifica se usuário não tem plano
    if (!this.planId || this.planId.trim() === '') {
        return false;
    }

    // 2. Busca informações do pagamento na API
    const payment = await getPayment(this.planId);

    // Se pagamento não encontrado ou não aprovado
    if (!payment || payment.status !== 'approved') {
        return false;
    }

    // 3. Pega data de aprovação do pagamento
    const approvedDate = new Date(payment.date_approved);
    if(this.planExpirationDate == approvedDate){
        const validade = new Date(approvedDate);
        validade.setDate(validade.getDate() + 30);
    
        // Retorna se o plano ainda está dentro da validade
        return new Date() <= validade;
    }
    return false
    // Define validade de 30 dias
}
}
