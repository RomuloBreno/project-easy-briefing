import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from "./database.ts";
import { UserRepository } from './repositories/UserRepository.ts';
import { AuthService } from './services/authService.ts';
import { AuthController } from "./controllers/AuthController.ts";
import { AnalysiController } from './controllers/AnalysiController.ts'

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
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);
  const analysiController = new AnalysiController(authService);

  // --- Rotas da API ---
  // Rota de registro de usuário
  app.post('/api/register', (req, res) => authController.register(req, res));
  app.patch('/api/update', (req, res) => authController.update(req, res));

  // Rota de login de usuário
  app.post('/api/login', (req, res) => authController.login(req, res));

  // Rota para validar token de autenticação
  app.post('/api/token', (req, res) => authController.getTokenValidation(req, res));
  
  app.post('/api/token-to-email', (req, res) => authController.sendTokenEmail(req, res));

  
  // Rota para definir/atualizar plano do usuário (compra/assinatura)
  app.post('/api/purchase', (req, res) => authController.setNewUserPlan(req, res));
  
  app.post('/api/briefing', async (req, res) => authController.getAnalysis(req,res));
  
  // Rota de health check
  app.get('/api/health', (req, res) => {
    res.json({ message: 'API is running' });
  });
  
  //Valid urls by email
  app.get('/api/resetyourpass', (req, res) =>{
    const { token } = req.query;
    if (token)
      authController.verifyEmailResetPass(res, token)

  });
  app.get('/check', (req, res) => {
    const { token } = req.query;
    if (token)
      authController.verifyEmail(res, token)
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