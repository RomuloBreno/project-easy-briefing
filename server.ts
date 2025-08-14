import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { connectDB, disconnectDB } from "./database.ts";
import { UserRepository } from './repositories/UserRepository.ts';
import { AuthService } from './services/authService.ts';
import { AuthController } from "./controllers/AuthController.ts";

// Configuração do Express
const app = express();

// Configuração do CORS
const allowedOrigins = process.env.FRONT_URL || '';
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido por CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Inicialização das dependências
async function initializeApp() {
  // Conexão com o banco
  const db = await connectDB();

  // Injeção de dependências
  const userRepository = new UserRepository(db);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService); // Note que agora passamos o authService

  // Rotas
  app.post('/api/register', async (req, res) => {
    try {
      const token = await authController.register(req.body, res);
      return token
    } catch (error) {
      res.json({ error: error.message });
    }
  });
  app.post('/api/login', async (req, res) => {
    try {
      const token = await authController.login(req.body, res);
      return token
    } catch (error) {
      res.json({ error: error.message });
    }
  });

  app.get('/health', async (req, res) => {
    res.json({ message: 'API is running' });
  });

  app.post('/api/token', async (req, res) => {
    try {
      const token = await authController.validToken(req.body, res);
      return token
    } catch (error) {
      res.json({ error: error.message });
    }
  });

  // Inicia o servidor
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

  // Trata desligamento gracioso
  process.on('SIGINT', async () => {
    server.close(async () => {
      await disconnectDB();
      console.log('Servidor encerrado');
      process.exit(0);
    });
  });
}

initializeApp().catch(err => {
  console.error('Falha na inicialização:', err);
  process.exit(1);
});