// DTO para criação plano do usuário
export class UserPlanDTO {
  email: string;
  planId?: string; // ID do plano de assinatura, opcional
  paymentMethod?: string; // Método de pagamento, opcional
  plan?: number; // Plano de assinatura, opcional
  validPayment?: boolean; // Indica se o pagamento é válido, opcional
  timestamp?: Date;
}