// interfaces/IPaymentRepository.ts
import { Payment } from "../model/Payment.ts";

export interface IPaymentRepository {
 
   // Implementação obrigatória do método abstrato da classe base
    ensureIndexes(): Promise<void>
 
   // --- Métodos de acesso específicos de Payment ---
    createPayment(paymentData: Payment): Promise<Payment | null>
 
    updateStatus(preferenceId: string,status: string,statusDetail?: string,paymentId?: string): Promise<Payment | null>
 
    findByPreferenceId(preferenceId: string): Promise<Payment | null>
 
    listByUser(userId: string): Promise<Payment[]>
}
