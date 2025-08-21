// services/PaymentService.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentRepository } from '../repositories/PaymentRepository.ts';
import { Payment } from '../model/Payment.ts';
import { ObjectId } from "mongodb";
import { User } from '../model/User.ts';
import crypto from 'crypto'
import { UserRepository } from '../repositories/UserRepository.ts';

// Variáveis de ambiente
const FRONT_URL = process.env.FRONT_URL;
const TOKEN_MP = process.env.TOKEN_MP;

// Valida variáveis de ambiente
if (!TOKEN_MP) {
  console.error("❌ TOKEN_MP não definido nas variáveis de ambiente.");
  process.exit(1);
}

if (!FRONT_URL) {
  console.error("❌ FRONT_URL não definido nas variáveis de ambiente.");
  process.exit(1);
}

// Instância do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: TOKEN_MP,
  options: { timeout: 5000 },
});

// Função para obter pagamento usando o paymentId
async function getPayment(paymentId: string) {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${TOKEN_MP}`,
      }
    });

    return response.json(); // aqui estão os dados do pagamento
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    throw error;
  }
}

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private userRepository: UserRepository;

  constructor(paymentRepository: PaymentRepository, userRepository:UserRepository) {
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
  }

  /**
   * Cria uma preferência de pagamento no Mercado Pago e salva no banco.
   * @param plan Número do plano (1 = Starter, 2 = Pro).
   * @param userId ID do usuário que está criando o pagamento.
   * @returns O ID da preferência criada.
   */
  async createPaymentPreference(plan: number, userId: string): Promise<string> {
    let title: string;
    let unit_price: number;
    let item_id: string;

    if (plan === 1) {
      title = "Starter Plan";
      unit_price = 9.9;
      item_id = "plan-starter-001";
    } else if (plan === 2) {
      title = "Pro Plan";
      unit_price = 29.9;
      item_id = "plan-pro-002";
    } else {
      throw new Error("Plano inválido. Escolha 1 (Starter) ou 2 (Pro).");
    }

    const preference = {
      items: [
        {
          id: item_id,
          title,
          unit_price,
          quantity: 1,
        },
      ],
      back_urls: {
        success: `${FRONT_URL}/success`,
        failure: `${FRONT_URL}/failure`,
        pending: `${FRONT_URL}/pending`,
      },
      auto_return: "approved",
    };

    try {
      const preferencesInstance = new Preference(client);
      const result = await preferencesInstance.create({ body: preference });

      // Salvar no banco como status inicial "created"
      await this.paymentRepository.create(
        new Payment({
          preferenceId: result.id,
          amount: unit_price,
          status: "created",
          userId: new ObjectId(userId),
          createdAt: new Date(),
          updatedAt: new Date(),
          plan:item_id
        } as Payment)
      );

      console.log("✅ Preferência criada:", result.id);
      return result.id || "";
    } catch (error) {
      console.error("❌ Erro ao criar preferência:", error);
      if (error instanceof Error) {
        throw new Error(`Falha ao criar preferência: ${error.message}`);
      } else {
        throw new Error("Falha desconhecida ao criar preferência.");
      }
    }
  }


validateWebhook(req: Request) {
  const secret = process.env.MP_WEBHOOK_TOKEN; // token secreto definido no ambiente
  const headerSignature = req.headers["x-mp-signature"] as string; // captura o token do header
  console.log("headerSignature - ", headerSignature)
  if(!secret) return
  // Gera o hash HMAC do corpo da requisição
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return hash === headerSignature; // true se for válido
}

async updatePaymentById(preferenceId: string): Promise<void> {

    // 1. Busca o registro de pagamento salvo localmente pelo preferenceId
    const paymentPreference = await this.paymentRepository.findByPreferenceId(preferenceId);
    if (!paymentPreference?.userId) return;

    // 2. Busca o usuário dono desse pagamento
    const userPayment: User | null = await this.userRepository.findById(paymentPreference.userId.toString());
    if (!userPayment) return;
    
    // 3. Buscar detalhes do pagamento na API do Mercado Pago
    const paymentInfo = await getPayment(paymentPreference.paymentId||''); 
    // ⚠️ Aqui você precisa ter salvo o `paymentId` que o MP envia no webhook!

    const status = paymentInfo.status; // approved | pending | rejected
    const statusDetail = paymentInfo.status_detail;

    if(!paymentPreference._id) return
    // 4. Atualiza o status do pagamento no repositório
    await this.paymentRepository.updateStatus(paymentPreference._id?.toString(), status, statusDetail, paymentInfo.paymentId)

    // 5. (Opcional) Atualizar usuário com base no pagamento aprovado
    if (status === "approved") {
      await this.userRepository.updatePlan(
        new User({
          email:userPayment.email,
          plan:paymentPreference.plan == 'plan-starter-001' ? 1 : paymentPreference.plan == 'plan-pro-002' ? 2 : paymentPreference.plan == 'plan-enteprise-003' ? 3 : 0,
          
        } as User)
      );
    }
}
 }
