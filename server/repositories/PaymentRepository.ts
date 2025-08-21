// repositories/PaymentRepository.ts
import { Db, ObjectId } from "mongodb";
import type { Payment } from "../model/Payment";

export class PaymentRepository {
  private readonly collectionName = "payments";
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
    this.ensureIndexes().catch(console.error);
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.db.collection(this.collectionName).createIndex(
        { preferenceId: 1 },
        { unique: true }
      );
      console.log("✅ Índices de Payment verificados/criados");
    } catch (error) {
      console.error("❌ Erro ao criar índices de Payment:", error);
      throw error;
    }
  }

  async create(payment: Payment): Promise<Payment> {
    const now = new Date();
    const newPayment: Payment = {
      ...payment,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db
      .collection<Payment>(this.collectionName)
      .insertOne(newPayment);
    return { ...newPayment, _id: result.insertedId };
  }

  async updateStatus(
    preferenceId: string,
    status: string,
    statusDetail?: string,
    paymentId?: string
  ): Promise<Payment | null> {
    const updateResult = await this.db
      .collection<Payment>(this.collectionName)
      .findOneAndUpdate(
        { preferenceId },
        {
          $set: {
            status,
            statusDetail,
            paymentId,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

    return updateResult as unknown as Payment | null;
  }

  async findByPreferenceId(preferenceId: string): Promise<Payment | null> {
    return (await this.db
      .collection<Payment>(this.collectionName)
      .findOne({ preferenceId })) as unknown as Payment | null;
  }

  async listByUser(userId: string): Promise<Payment[]> {
    return (await this.db
      .collection<Payment>(this.collectionName)
      .find({ userId: new ObjectId(userId) })
      .toArray()) as unknown as Payment[];
  }
}
