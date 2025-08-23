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




  /**
   * Cria uma preferência de pagamento no Mercado Pago e salva no banco.
   * @param plan Número do plano (1 = Starter, 2 = Pro).
   * @param userId ID do usuário que está criando o pagamento.
   * @returns O ID da preferência criada.
   */
  async createPaymentPreference(newPlan: number, userId: string): Promise<string> {

    const selectedPlan = Plans[newPlan];

    if (!selectedPlan) {
      throw new Error("Plano inválido. Escolha 1 (Starter) ou 2 (Pro).");
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

      // Salvar no banco como status inicial "created"
      await this.paymentRepository.create(
        new Payment({
          preferenceId: result.id,
          amount: value,
          status: "created",
          userId: new ObjectId(userId),
          createdAt: new Date(),
          updatedAt: new Date(),
          planId: id
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
    const headerSignature = req.headers["x-mp-signature"] as string;
    if (!secret) return
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
    const paymentInfo = await this.getPayment(paymentPreference.paymentId || '');
    // ⚠️ Aqui você precisa ter salvo o `paymentId` que o MP envia no webhook!

    const status = paymentInfo.status; // approved | pending | rejected
    const statusDetail = paymentInfo.status_detail;

    if (!paymentPreference._id) return
    // 4. Atualiza o status do pagamento no repositório
    await this.paymentRepository.updateStatus(paymentPreference._id?.toString(), status, statusDetail, paymentInfo.paymentId)
    await this.quotaService.resetQuota(userPayment);
    // 5. (Opcional) Atualizar usuário com base no pagamento aprovado
    if (status === "approved") {
      // Buscar detalhes do pagamento na API do Mercado Pago
      const paymentInfo = await this.getPayment(paymentPreference.paymentId || '');

      // Mapear o tipo de plano baseado no planId antigo
      const planLevel =
        paymentPreference.planId === 'plan-starter-001' ? 1 :
          paymentPreference.planId === 'plan-pro-002' ? 2 :
            paymentPreference.planId === 'plan-enteprise-003' ? 3 :
              0;
      // Atualizar os dados do usuário no repositório
      await this.userRepository.updatePlan(
        userPayment.email,            // Email do usuário
        paymentInfo.id,           // Novo planId vindo do pagamento
        paymentPreference.method || 'pix',    // Método de pagamento utilizado
        planLevel,
        paymentInfo.date_created      // Data de aprovação do pagamento
      );

      await this.emailService.sendEmailAfterPurchase(userPayment.email)
    }
  }
}
