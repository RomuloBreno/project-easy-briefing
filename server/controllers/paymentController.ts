// server/controllers/paymentController.ts
import type { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService.ts'; // Verifique o caminho real do seu PaymentService
import { AuthService } from '../services/authService.ts'; // Necessário para buscar o usuário
import { PaymentRequest } from '../model/PaymentRequest.ts'; // Verifique o caminho real do seu PaymentRequest
import { User } from '../model/User.ts'; // Verifique o caminho real do seu User

/**
 * PaymentController é responsável por todas as operações relacionadas a pagamentos.
 */
export class PaymentController {
    private readonly paymentService: PaymentService;
    private readonly authService: AuthService; // Necessário para buscar o usuário antes de criar a preferência

    constructor(paymentService: PaymentService, authService: AuthService) {
        this.paymentService = paymentService;
        this.authService = authService;
    }

    /**
     * Cria uma preferência de pagamento para o Mercado Pago Checkout Pro.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async createPaymentPreference(req: Request, res: Response): Promise<Response> {
        try {
            const dto: PaymentRequest = req.body;
            const user: User | null = await this.authService.findByEmail(dto.email);

            let preferenceId: string = '';
            if (user?._id) {
                preferenceId = await this.paymentService.createPaymentPreference(dto?.plan || 0, user._id.toString());
            } else {
                return res.status(404).json({ error: 'Usuário não encontrado para criar preferência de pagamento.' });
            }

            return res.status(200).json({ preferenceId: preferenceId });
        } catch (error: unknown) {
            console.error('Erro ao criar preferência de pagamento:', error);
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}
