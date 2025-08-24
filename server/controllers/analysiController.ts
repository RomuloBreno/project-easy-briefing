// server/controllers/analysisController.ts
import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts'; // Verifique o caminho real do seu AuthService
import { OpenAI } from 'openai'; // Verifique o caminho real do seu OpenAI import (ou remova se for um mock)
import { QuotaService } from '../services/quotaService.ts';

/**
 * AnalysisController é responsável por processar requisições de análise
 * e interagir com modelos de inteligência artificial.
 */
function decodeTextFile(base64Data: string): string {
    return Buffer.from(base64Data, 'base64').toString('utf8');
}

function handleTextFile(base64Data: string): string {
    const content = decodeTextFile(base64Data);
    return `\n\n--- Conteúdo do Arquivo de Texto ---\n${content}\n--- Fim do Conteúdo ---\n`;
}

function handlePdfFile(base64Data: string): string {
    return `\n\n--- Arquivo PDF em Base64 ---\n${base64Data}\n--- Fim do PDF ---\n`;
}

export function processFiles(file: string[] | null, userPlan: number): string {
    if (!file || userPlan === 0) return '';

    return file
        .map((base64String: string) => {
            const [metadata, base64Data] = base64String.split(',');

            if (metadata.includes('text/')) return handleTextFile(base64Data);
            if (metadata.includes('application/pdf')) return handlePdfFile(base64Data);

            throw new Error('Somente arquivos de texto ou PDF são permitidos.');
        })
        .join('');
}

export class AnalysisController {
    private readonly authService: AuthService;
    private readonly quotaService: QuotaService;
    // No futuro, aqui poderá ser injetado um AIService:
    // private readonly aiService: AIService;

    constructor(authService: AuthService, quotaService: QuotaService) {
        this.authService = authService;
        this.quotaService = quotaService;
        // this.aiService = aiService;
    }


    /**
     * Obtém uma análise usando um modelo de IA com base no briefing do usuário.
     * @param req O objeto Request do Express.
     * @param res O objeto Response do Express.
     * @returns Uma Promise que resolve para um Response.
     */
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

            const user = await this.authService.findByEmail(email);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Decodifica e extrai o conteúdo dos arquivos Base64
            let fileContent = content == '' ? processFiles(file, user.plan) : content;

            if (fileContent === undefined || fileContent === '') {
                // Melhorar esta mensagem, pois não é sobre plano não contemplar, mas sim falta de conteúdo.
                return res.status(400).json({ response: {response: "Conteúdo para análise não fornecido ou inválido." }});
            }

            if (!this.quotaService.checkQuota(user)) return res.status(200).json({ response: {response:"Você não possui mais cotas para analise, considere adiquirir um novo plano" }});

            const ModelBasedPlan = this.authService.validPlanToSetModel(user?.plan || 0);
            if (ModelBasedPlan === '') {
                // Deveria ter um tratamento de erro mais específico se validPlanToSetModel retornar null/undefined
                return res.status(500).json({ error: 'Falha ao determinar o modelo de IA com base no plano.' });
            }

            const userPrompt = 
                            `
                            ## Briefing para Análise
                            **Título do Projeto:** ${projectTitle}
                            **Nicho de Mercado:** ${niche || 'Não especificado'}

                            ### Conteúdo do Briefing:
                            ${content || "SEM CONTEUDO PARA ANALISAR"}

                            ### Conteúdo de Arquivos Anexos:
                            ${fileContent || 'Nenhum arquivo anexado.'}

                            ${promptManipulation ? `### Instruções Adicionais (Prompt de Manipulação):
                            ${promptManipulation}` : ''}
                            `;

            // const mockAI = {
            //         "analise": "O briefing está bem estruturado, mas alguns pontos de fluxo de usuário não estão claros.",
            //         "perguntas": [
            //             "Qual é o público-alvo principal?",
            //             "Existe prazo estimado para entrega da primeira versão?",
            //             "Há integrações obrigatórias com outros sistemas?"
            //         ],
            //         "oportunidades": [
            //             "Implementação de dashboard de métricas",
            //             "Automação de notificações por e-mail"
            //         ],
            //         "cenarios": [
            //             "Escalabilidade para múltiplos usuários simultâneos",
            //             "Segurança de dados sensíveis"
            //         ]
            //     }
            const connectIA = new OpenAI()
            const completion = await connectIA.responses.create({
                model: ModelBasedPlan,
                input: [
                    { role: 'system', content: process.env.SYSTEM_PROMPT! },
                    { role: 'user', content: userPrompt },
                ],
            });
            const aiResponseContent = completion.output_text;

           await this.quotaService.decrementQuota(user)


                        // Define o prefixo e sufixo de markdown
            const prefix = '```json\n';
            const suffix = '\n```\n';

            // Remove o prefixo e o sufixo para obter a string JSON pura
            const pureaiResponseContent = aiResponseContent.substring(prefix.length, aiResponseContent.length - suffix.length);
            
        return res.json({
            response: JSON.parse(pureaiResponseContent)
        });


        } catch (error) {
            console.error('Erro na requisição de análise:', error);
            res.status(500).json({ error: (error as Error).message || 'Falha ao processar os arquivos e obter a resposta da IA.' });
        }
    }
}
