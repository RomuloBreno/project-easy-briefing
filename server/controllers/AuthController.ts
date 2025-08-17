import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts';
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import { User } from '../model/User.ts';
import { UserRequest } from '../model/UserRequest.ts';
export class AuthController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    async register(req: Request, res: Response): Promise<Response> {
        try {
            const dto: CreateUserDTO = req.body;
            // The service now returns a message, not a token
            const result = await this.authService.register(dto);
            return res.status(201).json({ message: result });
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes('Email já está em uso')) {
                    return res.status(409).json({ error: error.message });
                }
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    async sendTokenEmail(req: Request, res: Response): Promise<Response> {
        try {
            const dto: UserRequest = req.body;
            // The service now returns a message, not a token
            const result = await this.authService.sendEmail(dto, dto.token || '');
            return res.status(201).json({ message: result });
        } catch (error: unknown) {
            return res.status(400).json({ error: 'Envio de link para email' });
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const dto: LoginDTO = req.body;
            const result = await this.authService.login(dto.email, dto.password);
            return res.status(200).json(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes('Credenciais inválidas')) {
                    return res.status(401).json({ error: error.message });
                }
            }
            return res.status(500).json({ error: 'Erro interno do servidor.', message: error });
        }
    }

    // New endpoint to verify the email with the token from the URL
    async verifyEmail(res:Request, token:string): Promise<Response> {
        try {
            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Token de verificação inválido.' });
            }
           const decode =  await this.authService.validToken(token);

            this.authService.userRepository.updateAuthenticationEmail(decode?.email || '')
            
            return res.status(200).json({ message: 'E-mail verificado com sucesso. Você pode fechar esta página.' });
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes('Token Expirado')) {
                    return res.status(401).json({ error: error.message });
                }
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // The other methods are simplified and delegated to the service
    async setNewUserPlan(req: Request, res: Response): Promise<Response> {
        try {
            const dto: User = req.body;
            const updatedUser = await this.authService.updateUserPlan(dto);
            return res.status(200).json(updatedUser);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
    
    async getTokenValidation(req: Request, res: Response): Promise<Response> {
        try {
            const { tokenQueryBytEmail } = req.query;
            if(tokenQueryBytEmail)
                this.verifyEmail(res, tokenQueryBytEmail)
            const token: string = req.body.token;
            if (!token) {
                return res.status(400).json({ error: 'Token não fornecido.' });
            }
            const user = await this.authService.validToken(token);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado para o token fornecido.' });
            }
            return res.status(200).json({ user });
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

}