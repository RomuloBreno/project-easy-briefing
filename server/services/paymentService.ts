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

      const userGet = await this.userRepository.findById(userId)
      if(!userGet) throw new Error("Erro ao fazer upload da ordem de pedido, fazendo o cancelamento da ordem");

      //excluir ordem do banco

      await this.userRepository.update({email:userGet.email}, {preferenceOrder:result.id})

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
   console.log("Start Purchase")
    // 1. Fetch payment details from Mercado Pago API using the paymentId
    const paymentInfo = await this.getPayment(paymentId);
    if (!paymentInfo) {
        throw new Error('Payment not found in Mercado Pago');
    }
    const { status, status_detail, id: id, payer, external_reference} = paymentInfo;
    console.log("pay:", paymentInfo);
    
    let user = await this.userRepository.findById(payer.email);
    console.log("user", user);
    if (!user) {
        user = await this.userRepository.findById(external_reference);
        if(!user)
          throw new Error('User not found.');
    }
    // 2. Fetch the local payment record using the preferenceId from the API response
    if(user == null || user == undefined) throw new Error('Não localizado o pagamento para esta usuário.'); 
    const localPayment = await this.paymentRepository.findByPreferenceByUser(user.preferenceOrder?.toString() || '');
    console.log("PReference", localPayment);
    if (!localPayment || !localPayment.userId) {
        throw new Error('Não localizado o pagamento para esta usuário.');
    }


    // 3. Update the local payment record with the latest status and payment ID
    // We use the `_id` of the local record to make the update.
    await this.paymentRepository.updateStatus(
        localPayment._id?.toString() || '',
        status,
        status_detail,
        id
    );
    console.log("Update Concluido", localPayment);

    // 4. Update the user record and send an email if the payment is approved
    if (status === "approved") {
        // Map the plan level
        const planLevel = localPayment.planId === 'plan-starter-001' ? 1 :
            localPayment.planId === 'plan-pro-002' ? 2 :
            localPayment.planId === 'plan-enteprise-003' ? 3 : 0;
        
        // Update user plan details
        await this.userRepository.updatePlan(
            user.email,
            localPayment.planId,
            paymentInfo.payment_method_id || 'pix',
            planLevel,
            paymentInfo.date_approved
        );
         console.log("Update User");
        // Reset the user's quota and send a confirmation email
        await this.quotaService.resetQuota(user);
        await this.emailService.sendEmailAfterPurchase(user.email);
        console.log("End Purchase")
    }
    console.log("Fazendo estorno")
    await this.getInfoRefunds(id)
}
}
