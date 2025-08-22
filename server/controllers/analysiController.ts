// server/controllers/analysisController.ts
import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts'; // Verifique o caminho real do seu AuthService
import { OpenAI } from 'openai'; // Verifique o caminho real do seu OpenAI import (ou remova se for um mock)
import { QuotaService } from '../services/quotaService.ts';

/**
 * AnalysisController é responsável por processar requisições de análise
 * e interagir com modelos de inteligência artificial.
 */
export class AnalysisController {
    private readonly authService: AuthService;
    private readonly quotaService: QuotaService;
    // No futuro, aqui poderá ser injetado um AIService:
    // private readonly aiService: AIService;

    constructor(authService: AuthService ,quotaService: QuotaService) {
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
            let fileContent = '';
            if (file && user?.plan !== 0) { // user?.plan !== 0 para planos pagos que permitem arquivos
                file.forEach((base64String: string) => {
                    const contentPart = Buffer.from(base64String.split(',')[1], 'base64').toString('utf8');
                    fileContent += `\n\n--- Conteúdo do Arquivo Anexado ---\n`;
                    fileContent += contentPart;
                    fileContent += `\n--- Fim do Conteúdo ---\n`;
                });
            } else {
                fileContent = content; // Se não tem arquivo ou plano gratuito, usa o 'content' direto
            }
            


            //ESCREVER FUNÇÃO PARA TIRAR CONTEUDO DO FILE


            
            if (fileContent === undefined || fileContent === '') {
                // Melhorar esta mensagem, pois não é sobre plano não contemplar, mas sim falta de conteúdo.
                return res.status(400).json({ response: "Conteúdo para análise não fornecido ou inválido." });
            }

             if(!this.quotaService.checkQuota(user))  return res.status(400).json({response: "Você não possui mais cotas para analisy, considere adiquirir um novo plano" });

            const ModelBasedPlan = this.authService.validPlanToSetModel(user?.plan || 0);
            if (ModelBasedPlan === '') {
                // Deveria ter um tratamento de erro mais específico se validPlanToSetModel retornar null/undefined
                return res.status(500).json({ error: 'Falha ao determinar o modelo de IA com base no plano.' });
            }

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
            // No futuro, descomentar e usar a chamada à API da OpenAI
            // const connectIA = new OpenAI()
            // const completion = await connectIA.responses.create({
            //     model: ModelBasedPlan,
            //     input: [
            //         { role: 'system', content: process.env.SYSTEM_PROMPT! },
            //         { role: 'user', content: userPrompt },
            //     ],
            // });
            // const aiResponseContent = completion.output_text;

            return res.json({
                response: {
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
            console.error('Erro na requisição de análise:', error);
            res.status(500).json({ error: (error as Error).message || 'Falha ao processar os arquivos e obter a resposta da IA.' });
        }
    }
}
