// server/controllers/userController.ts
import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts'; // Verifique o caminho real do seu AuthService
import { PaymentService } from '../services/paymentService.ts'; // Mantido por consistência com AppController, ajuste se não for usado
import { User } from '../model/User.ts'; // Verifique o caminho real do seu User

/**
 * UserController é responsável por operações de gerenciamento de perfil e planos do usuário.
 */
export class UserController {
    private readonly authService: AuthService;
    private readonly paymentService: PaymentService; // Injetado, mas pode ser removido se setNewUserPlan não depender dele

    constructor(authService: AuthService, paymentService: PaymentService) {
        this.authService = authService;
        this.paymentService = paymentService; // Certifique-se de que é realmente necessário aqui ou remova
    }

    /**
     * Define um novo plano para o usuário.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async setNewUserPlan(req: Request, res: Response): Promise<Response> {
        try {
            const dto: User = req.body;
            // Assumindo que authService.updateUserPlan contém a lógica de negócio para atualização do plano
            const updatedUser = await this.authService.updateUserPlan(dto); 
            return res.status(200).json(updatedUser);
        } catch (error: unknown) {
            console.error('Erro ao definir novo plano para o usuário:', error);
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}
