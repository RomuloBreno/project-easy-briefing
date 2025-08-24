import { Db, ObjectId } from "mongodb";
import { BaseRepository } from "./BaseRepository.ts";
import type { Payment as PaymentModel } from "../model/Payment.ts";
import type { IPaymentRepository } from "../interfaces/IPaymentRepository.ts";

// Definindo a interface de documento específica para Pagamento
export interface PaymentDocument extends PaymentModel {}

export class PaymentRepository extends BaseRepository<PaymentDocument> implements IPaymentRepository {
  constructor(db: Db) {
    super(db, "payments");
  }

  // Implementação obrigatória do método abstrato da classe base
  override async ensureIndexes(): Promise<void> {
    try {
      await this.collection.createIndex(
        { preferenceId: 1 },
        { unique: true }
      );
      console.log("✅ Índices de Payment verificados/criados");
    } catch (error) {
      console.error("❌ Erro ao criar índices de Payment:", error);
      throw error;
    }
  }

  // --- Métodos de acesso específicos de Payment ---

  async createPayment(paymentData: PaymentModel): Promise<PaymentDocument | null> {
    const now = new Date();
    const newPayment: Partial<PaymentDocument> = {
      ...paymentData,
      createdAt: now,
      updatedAt: now,
    };
    return this.create(newPayment as PaymentDocument);
  }

  async updateStatus(
    preferenceId: string,
    status: string,
    statusDetail?: string,
    paymentId?: string
  ): Promise<PaymentDocument | null> {
    const update = {
      $set: {
        status,
        statusDetail,
        paymentId,
        updatedAt: new Date(),
      },
    };
    return this.update({ preferenceId }, update);
  }

  async findByPreferenceId(preferenceId: string): Promise<PaymentDocument | null> {
    return this.findOne({ preferenceId });
  }
  async findByPreferenceByUser(preferenceOrder: string): Promise<PaymentDocument | null> {
    return this.findOne({ preferenceId: preferenceOrder });
  }

  async listByUser(preferenceOrder: string): Promise<PaymentDocument[]> {
    return this.find({ preferenceId: preferenceOrder });
  }
}