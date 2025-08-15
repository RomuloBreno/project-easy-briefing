import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from "./database.ts";
import { UserRepository } from './repositories/UserRepository.ts';
import { AuthService } from './services/authService.ts';
import { AuthController } from "./controllers/AuthController.ts";

// Configuração do Express
const app = express();

// Configuração do CORS
const allowedOrigins = process.env.FRONT_URL ? process.env.FRONT_URL.split(',') : [];
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem "origin" (como no caso de file:// ou requisições do mesmo domínio)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Apenas para depuração, você pode logar a origem que está sendo bloqueada
      console.error(`CORS block: Origin "${origin}" not allowed.`);
      callback(new Error('Acesso não permitido por CORS'));
    }
  }
};


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

  // --- Rotas da API ---
  app.post('/api/register', async (req, res) => {
    try {
      await authController.register(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Erro interno do servidor', 
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      await authController.login(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Erro interno do servidor',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  });

  app.post('/api/token', async (req, res) => {
    try {
      await authController.validToken(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Erro interno do servidor',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ message: 'API is running' });
  });

  // --- Rota Curinga para o Frontend ---
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Recurso da API não encontrado.' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Arquivos estáticos servidos de: ${publicPath}`);
  });

  process.on('SIGINT', async () => {
    server.close(async () => {
      await disconnectDB();
      console.log('Servidor encerrado');
      process.exit(0);
    });
  });
}

initializeApp().catch(err => {
  console.error('Falha na inicialização do servidor:', err);
  process.exit(1);
});