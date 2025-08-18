import type { AuthService } from "../services/authService";
import {OpenAI} from "openai"

// Assumindo a classe do seu controller ou service
export class AnalysiController {
    private _authService: AuthService
    constructor(authService: AuthService) {
        this._authService = authService

    }

    // 1. Função auxiliar para processar os arquivos Base64
    private processFiles(files: string[] | undefined): string {
        if (!files || files.length === 0) {
            return '';
        }

        let fileContent = '';
        files.forEach(base64String => {
            try {
                // Decodifica a string Base64 e remove metadados
                const content = Buffer.from(base64String.split(',')[1], 'base64').toString('utf8');
                fileContent += `\n\n--- Conteúdo do Arquivo Anexado ---\n`;
                fileContent += content;
                fileContent += `\n--- Fim do Conteúdo ---\n`;
            } catch (e) {
                // Em caso de erro na decodificação, loga e continua
                console.error('Erro ao decodificar arquivo Base64:', e);
                fileContent += `\n\n--- Erro ao processar arquivo ---\n`;
            }
        });
        return fileContent;
    }

    // 2. Função dedicada para construir o prompt e chamar a API da OpenAI
    private async callOpenAI(
        model: string,
        systemPrompt: string,
        projectTitle: string,
        niche: string,
        briefingContent: string,
        fileContent: string,
        promptManipulation?: string
    ): Promise<string> {
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

            ### Retorne um corpo JSON para uma boa passagem da sua resposta para o frontend
        `;

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
        });

        return completion.choices[0].message.content || '';
    }

    async getAnalysi(req: Request, res: Response): Promise<Response> {
        try {
            const {
                email,
                projectTitle,
                promptManipulation,
                niche,
                briefingContent,
                file
            } = req.body;

            const user = await this._authService.findByEmail(email);
            const modelBasedPlan = this._authService.validPlanToSetModel(user?.plan || 0);

            // Refatorado: Use a função auxiliar para processar os arquivos
            const fileContent = this.processFiles(file);

            // Refatorado: Use a função separada para a chamada à OpenAI
            const aiResponseContent = await this.callOpenAI(
                modelBasedPlan,
                process.env.SYSTEM_PROMPT!, // Assumindo que essa variável existe
                projectTitle,
                niche,
                briefingContent,
                fileContent,
                promptManipulation
            );

            // Resposta final
            return res.status(200).json({ response: aiResponseContent });

        } catch (error) {
            console.error('Erro na requisição:', error);
            return res.status(500).json({ error: (error as Error).message || 'Falha ao processar a requisição.' });
        }
    }
}