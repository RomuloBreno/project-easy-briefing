import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts';
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import { User } from '../model/User.ts';
import { UserRequest } from '../model/UserRequest.ts';
import openai, { OpenAI } from 'openai';
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
    async verifyEmail(res: Request, token: string): Promise<Response> {
        try {
            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Token de verificação inválido.' });
            }
            const decode = await this.authService.validToken(token);

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
    async getAnalysis(req: Request, res: Response): Promise<Response> {
        try {
            const {
                email,
                projectTitle,
                promptManipulation,
                niche,
                content,
                file
            } = req.body.briefingText;

            const user = await this.authService.findByEmail(email)

            // Decodifica e extrai o conteúdo dos arquivos Base64
            let fileContent = '';
            if (file && user?.plan !== 0) {
                file.forEach(base64String => {
                    // A string Base64 contém metadados, como "data:application/pdf;base64,...",
                    // então precisamos remover essa parte para obter o conteúdo puro.
                    const content = Buffer.from(base64String.split(',')[1], 'base64').toString('utf8');
                    fileContent += `\n\n--- Conteúdo do Arquivo Anexado ---\n`;
                    fileContent += content;
                    fileContent += `\n--- Fim do Conteúdo ---\n`;
                });
            } else {
                fileContent = content;
            }

            if(fileContent === undefined || fileContent ==='') return res.status(401).json({ response:  "Plano Não Contempla essa ação"});

            const ModelBasedPlan = this.authService.validPlanToSetModel(user?.plan || 0)
            const userPrompt = `
                        ## Briefing para Análise

**Título do Projeto:** ${projectTitle}  
**Nicho de Mercado:** ${niche || 'Não especificado'}  

### Conteúdo do Briefing:
${content}  

### Conteúdo de Arquivos Anexos:
${fileContent || 'Nenhum arquivo anexado.'}  

${promptManipulation ? `### Instruções Adicionais (Prompt de Manipulação):  
${promptManipulation}` : ''}  

### Instrução Final
Responda **exclusivamente** em JSON válido, no formato abaixo, preenchendo cada campo de forma detalhada com base no briefing.  
Não adicione nenhum texto fora do JSON.  

{
  "analise": "Texto sobre clareza, organização e facilidade de entendimento do briefing",
  "perguntas": [
    "Pergunta 1 necessária para complementar a documentação",
    "Pergunta 2",
    "Pergunta 3"
  ],
  "oportunidades": [
    "Oportunidade 1 identificada",
    "Oportunidade 2"
  ],
  "cenarios": [
    "Cenário 1 que ainda não foi validado",
    "Cenário 2"
  ]
}

                        `;
            //   const connectIA = new OpenAI()              
            // const completion = await connectIA.responses.create({
            //     model: ModelBasedPlan,
            //     input: [
            //         { role: 'system', content: process.env.SYSTEM_PROMPT! },
            //         { role: 'user', content: userPrompt },
            //     ],
            // });

            // const aiResponseContent = completion.output_text;

          
            return res.json({ response:  {
  "analise": "O briefing está bem estruturado, mas alguns pontos de fluxo de usuário não estão claros.",
  "perguntas": [
    "Qual é o público-alvo principal?",
    "Existe prazo estimado para entrega da primeira versão?",
    "Há integrações obrigatórias com outros sistemas?"
  ],
  "oportunidades": [
    "Implementação de dashboard de métricas",
    "Automação de notificações por e-mail"
  ],
  "cenarios": [
    "Escalabilidade para múltiplos usuários simultâneos",
    "Segurança de dados sensíveis"
  ]
}
});

        } catch (error) {
            console.error('Erro na requisição:', error);
            res.status(500).json({ error: (error as Error).message || 'Falha ao processar os arquivos e obter a resposta da IA.' });
        }
    }


    async getTokenValidation(req: Request, res: Response): Promise<Response> {
        try {
            const { tokenQueryBytEmail } = req.query;
            if (tokenQueryBytEmail)
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