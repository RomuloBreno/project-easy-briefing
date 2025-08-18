import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts';
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import { User } from '../model/User.ts';
import { UserRequest } from '../model/UserRequest.ts';
import openai from 'openai';
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
                briefingContent,
                file
            } = req.body;

            const user = await this.authService.findByEmail(email)

            // Decodifica e extrai o conteúdo dos arquivos Base64
            let fileContent = '';
            if (file) {
                file.forEach(base64String => {
                    // A string Base64 contém metadados, como "data:application/pdf;base64,...",
                    // então precisamos remover essa parte para obter o conteúdo puro.
                    const content = Buffer.from(base64String.split(',')[1], 'base64').toString('utf8');
                    fileContent += `\n\n--- Conteúdo do Arquivo Anexado ---\n`;
                    fileContent += content;
                    fileContent += `\n--- Fim do Conteúdo ---\n`;
                });
            } else {
                fileContent = briefingContent;
            }

            const ModelBasedPlan = this.authService.validPlanToSetModel(user?.plan || 0)
            const userPrompt = `
                        ## Briefing para Análise

                        **Título do Projeto:** ${projectTitle}
                        **Nicho de Mercado:** ${niche || 'Não especificado'}

                        ### Conteúdo do Briefing:
                        ${briefingContent}

                        ### Conteúdo de Arquivos Anexos:
                        ${fileContent || 'Nenhum arquivo anexado.'}

                        ${promptManipulation ? `### Instruções Adicionais (Prompt de Manipulação):
                        ${promptManipulation}` : ''}

                        ### Retorne um corpo JSON para um boa passagem da usa resposta para o frontend
                        `;

            // const completion = await openai.OpenAI.Chat.Completions.caller({
            //     model: ModelBasedPlan,
            //     messages: [
            //         { role: 'system', content: process.env.SYSTEM_PROMPT! },
            //         { role: 'user', content: userPrompt },
            //     ],
            // });

            // const aiResponseContent = completion.choices[0].message.content;

            //mock
            res.json({ response: {
  "analise_geral": {
    "data_analise": "18-08-2025",
    "periodo_analisado": "Últimos 30 dias",
    "desempenho_geral": "O ChatGPT demonstrou uma performance robusta e consistente, com alta taxa de acertos em tarefas de geração de texto e respostas a perguntas. Houve uma pequena queda na precisão em tópicos muito específicos, indicando a necessidade de um ajuste fino no modelo.",
    "principais_conclusoes": [
      "Aumento na velocidade de processamento das requisições.",
      "Melhora na coerência e fluidez em diálogos mais longos.",
      "Identificação de viés leve em respostas sobre finanças, mas sem impacto significativo.",
      "Adoção crescente em setores como atendimento ao cliente e criação de conteúdo."
    ]
  },
  "metricas_chave": {
    "taxa_acertos": {
      "valor": 95.8,
      "unidade": "%",
      "tendencia": "Estável"
    },
    "taxa_rejeicao": {
      "valor": 2.1,
      "unidade": "%",
      "tendencia": "Diminuindo"
    },
    "tempo_resposta_medio": {
      "valor": 1.2,
      "unidade": "segundos",
      "tendencia": "Diminuindo"
    },
    "satisfacao_usuario": {
      "valor": 4.7,
      "unidade": "de 5 estrelas",
      "tendencia": "Aumentando"
    }
  },
  "sugestoes_otimizacao": [
    {
      "prioridade": "Alta",
      "descricao": "Treinar o modelo com um conjunto de dados mais diversificado sobre tópicos financeiros para mitigar o viés identificado."
    },
    {
      "prioridade": "Média",
      "descricao": "Implementar um sistema de 'feedback direto' para que os usuários possam corrigir respostas imprecisas em tempo real."
    },
    {
      "prioridade": "Baixa",
      "descricao": "Explorar novas arquiteturas de modelo para melhorar a compreensão de sarcasmo e ironia."
    }
  ],
  "casos_de_uso_destaque": [
    {
      "setor": "Marketing Digital",
      "descricao": "Geração de ideias de conteúdo para blogs e redes sociais, com aumento de 20% na produtividade."
    },
    {
      "setor": "Educação",
      "descricao": "Criação de resumos e planos de estudo personalizados para alunos do ensino superior."
    }
  ]
} });

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