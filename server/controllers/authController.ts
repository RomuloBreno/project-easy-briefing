// server/controllers/authController.ts
import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts'; // Verifique o caminho real do seu AuthService
import { CreateUserDTO, UpdateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import { UserRequest } from '../model/UserRequest.ts'; // Verifique o caminho real do seu UserRequest
import { User } from '../model/User.ts';
import { UserResponse } from '../model/UserResponse.ts';
import { EmailService } from '../services/emailService.ts';

/**
 * AuthController é responsável por todas as operações relacionadas à autenticação
 * e gerenciamento de usuários.
 */
export class AuthController {
    private readonly authService: AuthService;
    private readonly emailService: EmailService;

    constructor(authService: AuthService, emailService:EmailService) {
        this.authService = authService;
        this.emailService = emailService
    }

    /**
     * Lida com o registro de um novo usuário.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async register(req: Request, res: Response): Promise<Response> {
        try {
            const dto: CreateUserDTO = req.body;
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
    /**
     * Lida com o registro de um novo usuário.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async updateNewPass(req: Request, res: Response): Promise<Response> {
        try {
            const dto: UpdateUserDTO = req.body;
            const result = await this.authService.updatePass(dto);
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
    /**
     * Envia um email com um token de verificação para o usuário.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async sendTokenEmail(req: Request, res: Response): Promise<Response> {
        try {
            const dto: UserRequest = req.body;
            // A busca do userId deve ser feita no serviço para desacoplamento.
            const user = await this.authService.findByEmail(dto.email);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            const result = await this.authService.sendEmailwithToken(dto, user._id?.toString() || '', 'check');
            return res.status(201).json({ message: result });
        } catch (error: unknown) {
            console.error('Erro ao enviar token por e-mail:', error);
            return res.status(400).json({ error: 'Falha no envio do link para e-mail.' });
        }
    }

    /**
     * Envia um email com um token para redefinição de senha.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async sendEmailResetPass(req: Request, res: Response): Promise<Response> {
        try {
            const dto: UserRequest = req.body;
            const user = await this.authService.findByEmail(dto.email);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            const result = await this.authService.sendEmailwithToken(dto, user._id?.toString() || '', 'reset');
            return res.status(201).json({ message: result });
        } catch (error: unknown) {
            console.error('Erro ao enviar link de redefinição de senha:', error);
            return res.status(400).json({ error: 'Falha no envio do link para e-mail.' });
        }
    }

    /**
     * Lida com o login do usuário.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
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

    /**
     * Verifica o email do usuário usando um token da URL.
     * @param req O objeto Request do Express (originalmente `res` no seu código, corrigido para `req`).
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async verifyEmail(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.query.token as string; // Assume que o token vem da query string
            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Token de verificação inválido.' });
            }
            await this.authService.validToken(token); // Valida o token e decodifica

            // O seu método original chamava updateAuthenticationEmail e retornava.
            // Para manter a lógica original, authService.validToken deve ter a lógica de atualização.
            // Ou o controller deve chamar a atualização:
            const decodedPayload = await this.authService.validToken(token); // Retorna o payload decodificado
            if (decodedPayload?.email) {
                await this.authService.userRepository.updateAuthenticationEmail(decodedPayload.email);
            } else {
                return res.status(401).json({ error: 'Token inválido ou e-mail não encontrado.' });
            }
            
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

    /**
     * Verifica um token para redefinição de senha.
     * @param req O objeto Request do Express (originalmente `res` no seu código, corrigido para `req`).
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async verifyEmailResetPass(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.query.token as string; // Assume que o token vem da query string
            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Token de verificação inválido.' });
            }
            const decodedPayload = await this.authService.validToken(token);
            if (!decodedPayload || !decodedPayload.email) {
                return res.status(401).json({ error: 'Token inválido ou e-mail não encontrado.' });
            }
            
            // Se o token é válido e o email existe, retorna true para o front-end
            return res.status(200).json({ isValid: true, email: decodedPayload.email });

        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes('Token Expirado')) {
                    return res.status(401).json({ error: error.message });
                }
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    /**
     * Valida um token JWT (para acesso a recursos protegidos).
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
    async getTokenValidation(req: Request, res: Response): Promise<Response> {
        try {
            // O token pode vir do query param 'tokenQueryBytEmail' ou do corpo da requisição 'token'
            // const tokenQueryBytEmail = req.query.tokenQueryBytEmail as string;
            let authHeader: string = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token de autenticação não fornecido ou formato inválido.' });
            }

            const token = authHeader.split(' ')[1]; // Extrai o token após "Bearer "

            if (!token) {
                return res.status(401).json({ error: 'Token de autenticação ausente.' });
            }

            const userDecoded = await this.authService.validToken(token); // Retorna o usuário decodificado pelo token
            
            if (!userDecoded) {
                return res.status(404).json({ error: 'Usuário não encontrado ou token inválido.' });
            }

            return res.status(200).json({ user: userDecoded });
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}