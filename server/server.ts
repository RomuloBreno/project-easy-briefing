import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from "./database.ts";
import { UserRepository } from './repositories/UserRepository.ts';
import { PaymentRepository } from './repositories/PaymentRepository.ts';
import { AuthService } from './services/authService.ts';
import { PaymentService } from './services/paymentService.ts'
import { QuotaService } from './services/quotaService.ts'; // NOVO: Importa o QuotaService
import { EmailService } from './services/emailService.ts'; // NOVO: Importa o QuotaService

// Importa as novas controllers
import { AuthController } from './controllers/authController.ts'; // Verifique o caminho real
import { PaymentController } from './controllers/paymentController.ts'; // Verifique o caminho real
import { UserController } from './controllers/userController.ts'; // Verifique o caminho real
import { AnalysisController } from './controllers/analysiController.ts'; // Verifique o caminho real
import { authMiddleware } from './auth/middleware.ts';

// Carrega variáveis do arquivo .env para process.env
// Importante: No Dockerfile, garantimos que as variáveis de ambiente estão disponíveis no build E runtime.
dotenv.config();


// Configuração do Express

const app = express();

// Configuração do CORS
const allowedOrigins = process.env.FRONT_URL ? process.env.FRONT_URL.split(',') : [];
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem "origin" (como no caso de file:// ou requisições do mesmo domínio)
        // ou se a origem estiver na lista de origens permitidas.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS block: Origin "${origin}" not allowed.`);
            callback(new Error('Acesso não permitido por CORS'));
        }
    }
};

// Aplica o middleware CORS
app.use(cors(corsOptions));
app.use(express.json());

// Configuração de caminhos para o Docker
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajuste importante: O Docker copia os arquivos do frontend para /project/server/public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Inicialização das dependências do servidor
async function initializeApp() {
    const db = await connectDB();

    const userRepository = new UserRepository(db);
    const paymentRepository = new PaymentRepository(db);

    const quotaService = new QuotaService(userRepository);
    const emailService = new EmailService();
    const paymentService = new PaymentService(paymentRepository, userRepository,quotaService,emailService);
    const authService = new AuthService(userRepository, emailService);

    // Instancia as novas controllers com suas dependências
    const authController = new AuthController(authService, emailService);
    const paymentController = new PaymentController(paymentService, authService); // PaymentController precisa de AuthService para buscar usuário
    const userController = new UserController(authService, paymentService); // UserController precisa de AuthService (e talvez PaymentService)
    const analysisController = new AnalysisController(authService, quotaService); // AnalysisController precisa de AuthService e QuotaService
    const middleware = authMiddleware(authService)

    // --- Rotas da API ---
    // Rotas de Autenticação (AuthController)
    app.post('/api/register', (req, res) => authController.register(req, res));
    app.patch('/api/update-password', (req, res) => authController.updateNewPass(req, res));
    app.post('/api/login', (req, res) => authController.login(req, res));
    app.post('/api/token', (req, res) => authController.getTokenValidation(req, res));
    app.post('/api/token-to-email', middleware,  (req, res) => authController.sendTokenEmail(req, res));
    app.post('/api/reset-pass', (req, res) => authController.sendEmailResetPass(req, res));
    app.get('/resetyourpass', async (req, res) => {
        const { token } = req.query;
        if (!token) return res.redirect('/?error=invalid_reset_token'); // Correção aqui
        
        // Chame o método da AuthController para verificar e lidar com o redirect
        const isValidResponse = await authController.verifyEmailResetPass(req, res);
        // O verifyEmailResetPass na controller agora retorna um Response,
        // então não precisamos do then() e podemos retornar diretamente.
        return isValidResponse;
    });
    app.get('/check', async (req, res) => { // Tornar async para await
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token não fornecido.' }); // Se token não existe, retorne erro
        
        // Chame o método da AuthController para verificar e lidar com o redirect/response
        const verifyResponse = await authController.verifyEmail(req, res); // Chamar como um método do controller
        // Envia o arquivo index.html para todas as outras rotas
           return verifyResponse
    });
    
    // Rotas de Usuário (UserController)
    // app.post('/api/purchase', (req, res) => userController.setNewUserPlan(req, res));

    // Rotas de Pagamento (PaymentController)
    app.post('/api/create-payment-preference', (req, res) => paymentController.createPaymentPreference(req, res));
    
    // Rota para Webhook do Mercado Pago (pode permanecer aqui ou ir para PaymentController)
    app.post('/api/preference-success', async (req, res) => { // Tornar async para await
        try {
            const paymentData = req.body;
            // A validação do webhook e a atualização do pagamento devem estar no PaymentService
            // if (!paymentService.validateWebhook(req)) {
            //     return res.status(401).send("Webhook inválido");
            // }
            await paymentService.updatePaymentById(paymentData.data.id); // Certifique-se que é await
            // Sempre responda 200 para confirmar o recebimento
            res.sendStatus(200);
        } catch (error) {
            console.error("Erro no webhook:", error);
            res.sendStatus(500);
        }
    });

    // Rotas de Análise (AnalysisController)
    app.post('/api/briefing',middleware, async (req, res) => analysisController.getAnalysis(req, res));
    
    // Rota de health check
    app.get('/api/health', (req, res) => {
        res.json({ message: 'API is running' });
    });
    
    // Configuração para servir arquivos estáticos
    app.use(express.static(publicPath, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            } else if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
        }
    }));

    // Rota curinga para SPA (Single Page Application)
    app.get('*', (req, res) => {
        // Se a rota começar com /api, significa que não foi encontrada uma rota de API
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'Recurso da API não encontrado.' });
        }

        // Envia o arquivo index.html para todas as outras rotas
        res.sendFile(path.join(publicPath, 'index.html'), (err) => {
            if (err) {
                console.error('Erro ao enviar index.html:', err);
                res.status(500).send('Erro ao carregar a aplicação');
            }
        });
    });

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Arquivos estáticos servidos de: ${publicPath}`);
    });

    // Gerenciamento do desligamento do servidor
    process.on('SIGINT', async () => {
        server.close(async () => {
            await disconnectDB();
            console.log('Servidor encerrado');
            process.exit(0);
        });
    });
}

// Inicia a aplicação e lida com erros de inicialização
initializeApp().catch(err => {
    console.error('Falha na inicialização do servidor:', err);
    process.exit(1);
});
