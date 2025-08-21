// interfaces/IPaymentRepository.ts
import { Payment } from "../model/Payment";

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  updateStatus(
    preferenceId: string,
    status: string,
    statusDetail?: string,
    paymentId?: string
  ): Promise<Payment | null>;
  findByPreferenceId(preferenceId: string): Promise<Payment | null>;
  listByUser(userId: string): Promise<Payment[]>;
}
