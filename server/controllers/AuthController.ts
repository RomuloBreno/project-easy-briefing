import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts';
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import { UserPlanDTO } from '../DTO/UserPlanDTO.ts';

export class AuthController {
  private readonly authService: AuthService
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(body: Request, res: Response): Promise<Response> {
    try {
      const dto: CreateUserDTO = body.body;
      const token = await this.authService.register(dto);
      return res.status(201).json({ token });
    } catch (error: unknown) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async login(body: Request, res: Response): Promise<Response> {
    try {
      const credentials: LoginDTO = body.body;
      const token = await this.authService.login(credentials.email, credentials.password);
      return res.json({ token });
    } catch (error: unknown) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
  async setNewUserPlan(body: Request, res: Response): Promise<Response> {
    try {
      const credentials: UserPlanDTO = body.body;
      const token = await this.authService.setNewUserPlan(credentials);
      return res.status(200).json({ token });
    } catch (error: unknown) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
  async validPlan(plan:string, res: Response): Promise<Response> {
    try {
      const planBody: string = plan;
      const token =  this.authService.validPlan(planBody);
      if (!token 
        || token === null 
        || token === undefined 
        || token.email === undefined  
        || token.plan === null 
        || token.timestamp === undefined 
        || token.validPayment === null) {
        return res.status(404).json({ error: 'Plano não validado' });
      }
      return res.status(200).json({ token });
    } catch (error: unknown) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

    async validToken(body: Request, res: Response): Promise<Response> {
    try {
      const credentials: string = body.body.token;
      const token = await this.authService.validToken(credentials);
      return res.json({ token });
    } catch (error: unknown) {
        return res.status(401).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
}