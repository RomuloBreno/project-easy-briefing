// models/Payment.ts
import { ObjectId } from "mongodb";

export class Payment {
  _id?: ObjectId | undefined;
  preferenceId: string;          // ID gerado pelo Mercado Pago (preference)
  paymentId?: string | undefined; // ID real do pagamento (quando disponível)
  externalReference?: string | undefined; // se você usar para vincular ao seu pedido
  userId?: ObjectId; // vínculo com o usuário que pagou
  status: string;                // created | pending | approved | rejected | etc
  statusDetail?: string | undefined; // motivo detalhado do status
  amount: number;                // valor do pagamento
  method?: string | undefined;   // cartão, pix, boleto
  createdAt: Date;
  updatedAt: Date;
  planId:number;
  plan:string;


  constructor(payment: Payment) {
    this._id = payment._id;
    this.preferenceId = payment.preferenceId;
    this.paymentId = payment.paymentId;
    this.externalReference = payment.externalReference;
    this.userId = payment.userId;
    this.status = payment.status ?? "created";
    this.statusDetail = payment.statusDetail;
    this.amount = payment.amount;
    this.method = payment.method;
    this.createdAt = payment.createdAt ?? new Date();
    this.updatedAt = payment.updatedAt ?? new Date();
    this.planId = payment.planId ?? '';
    this.plan = payment.plan;
  }
}
