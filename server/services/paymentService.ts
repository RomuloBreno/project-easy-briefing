// services/PaymentService.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentRepository } from '../repositories/PaymentRepository.ts';
import { Payment } from '../model/Payment.ts';
import { ObjectId } from "mongodb";
import { User } from '../model/User.ts';
import crypto from 'crypto'
import { UserRepository } from '../repositories/UserRepository.ts';
import { Plans } from '../Enums/PlanEnum.ts';
import { QuotaService } from './quotaService.ts';
import { EmailService } from './emailService.ts';

// Instância do Mercado Pago


export class PaymentService {

  public front_url: string
  public token_mp: string
  public client: MercadoPagoConfig

  private paymentRepository: PaymentRepository;
  private userRepository: UserRepository;
  private quotaService: QuotaService;
  private emailService: EmailService;

  constructor(paymentRepository: PaymentRepository, userRepository: UserRepository, quotaService: QuotaService, emailService: EmailService) {
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
    this.quotaService = quotaService;
    this.emailService = emailService
    this.front_url = process.env.FRONT_URL || '';
    this.token_mp = process.env.TOKEN_MP || '';


    // Valida variáveis de ambiente
    if (!this.token_mp) {
      console.error("❌ token_mp não definido nas variáveis de ambiente.");
      process.exit(1);
    }

    if (!this.front_url) {
      console.error("❌ front_url não definido nas variáveis de ambiente.");
      process.exit(1);
    }

    const client = new MercadoPagoConfig({
      accessToken: this.token_mp,
      options: { timeout: 5000 },
    });

    this.client = client
  }



  // Função para obter pagamento usando o paymentId
  async getPayment(paymentId: string) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${this.token_mp}`,
        }
      });

      return response.json(); // aqui estão os dados do pagamento
    } catch (error) {
      console.error("Erro ao buscar pagamento:", error);
      throw error;
    }
  }
  async getInfoRefunds(paymentId: string) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        headers: {
          Authorization: `Bearer ${this.token_mp}`,
        }
      });

      return response.json(); // aqui estão os dados do pagamento
    } catch (error) {
      console.error("Erro ao buscar pagamento:", error);
      throw error;
    }
  }




  /**
   * Cria uma preferência de pagamento no Mercado Pago e salva no banco.
   * @param plan Número do plano (1 = Starter, 2 = Pro).
   * @param userId ID do usuário que está criando o pagamento.
   * @returns O ID da preferência criada.
   */
 async createPaymentPreference(newPlan: number, userId: string): Promise<string> {
    const selectedPlan = Plans[newPlan];

    if (!selectedPlan) {
        throw new Error("Plano inválido. Escolha 1 (Starter), 2 (Pro) ou 3 (Enterprise).");
    }

    const { name, value, id } = selectedPlan;

    const preference = {
        items: [
            {
                id: id,
                title: name,
                unit_price: value,
                quantity: 1,
            },
        ],
        external_reference: userId,
        back_urls: {
            success: `${this.front_url}/success`,
            failure: `${this.front_url}/failure`,
            pending: `${this.front_url}/pending`,
        },
        auto_return: "approved",
    };

    try {
        const preferencesInstance = new Preference(this.client);
        const result = await preferencesInstance.create({ body: preference });

        // Salva o registro de pagamento localmente com o preferenceId como string
        await this.paymentRepository.create(
            new Payment({
                preferenceId: result.id || '',
                amount: value,
                status: "created",
                userId: new ObjectId(userId),
                createdAt: new Date(),
                updatedAt: new Date(),
                planId: id
            })
        );

        const userGet = await this.userRepository.findById(userId);
        if (!userGet) {
            // Se o usuário não for encontrado, a preferência é cancelada
            console.error("Erro ao fazer upload da ordem de pedido. Cancelando a ordem.");
            throw new Error("Erro ao fazer upload da ordem de pedido.");
        }

        // Atualiza o documento do usuário com o preferenceId como string
        const update = { $set: { preferenceOrder: result.id || '' } };
        await this.userRepository.update({ email: userGet.email }, update);

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
    const headerSignature = req.headers["x-mp-signature"] as string;
    if (!secret) return
    // Gera o hash HMAC do corpo da requisição
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    return hash === headerSignature; // true se for válido
  }

async updatePaymentById(paymentId: string): Promise<void> {
    console.log("Start Purchase");

    try {
        // 1. Busca os detalhes do pagamento na API do Mercado Pago
        const paymentInfo = await this.getPayment(paymentId);
        if (!paymentInfo) {
            console.error('Payment not found in Mercado Pago');
            throw new Error('Payment not found in Mercado Pago');
        }

        const { status, status_detail, id, payer, external_reference } = paymentInfo;
        console.log("pay:", paymentInfo);

        // 2. Localiza o usuário: Tenta encontrar pelo email do pagador ou pela referência externa
        let user = await this.userRepository.findByEmail(payer.email);
        if (!user && external_reference) {
            user = await this.userRepository.findById(external_reference);
        }

        if (!user) {
            console.error('User not found.');
            throw new Error('User not found.');
        }
        console.log("user", user);

        // 3. Localiza o registro de pagamento local do usuário
        const localPayment = await this.paymentRepository.findByPreferenceByUser(user.preferenceOrder|| '');
        if (!localPayment) {
            console.error('Local payment record not found for user.');
            throw new Error('Local payment record not found.');
        }
        console.log("PReference", localPayment);

        // 4. Atualiza o status do pagamento local
        await this.paymentRepository.updateStatus(
            localPayment._id?.toString() || '',
            status,
            status_detail,
            id
        );
        console.log("Update Concluido", localPayment);

        // 5. Se o pagamento for aprovado, atualiza o usuário, cota e envia e-mail
        if (status === "approved") {
            const planLevel =
                localPayment.planId === 'plan-starter-001' ? 1 :
                localPayment.planId === 'plan-pro-002' ? 2 :
                localPayment.planId === 'plan-enteprise-003' ? 3 : 0;
            
            await this.userRepository.updatePlan(
                user.email,
                localPayment.planId,
                paymentInfo.payment_method_id || 'pix',
                planLevel,
                paymentInfo.date_approved
            );
            console.log("Update User");

            await this.quotaService.resetQuota(user);
            await this.emailService.sendEmailAfterPurchase(user.email);
            console.log("End Purchase");
        }
    } catch (error) {
        console.error('Error in updatePaymentById:', error);
        throw error;
    }
}
}
