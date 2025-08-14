import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Importação necessária
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
    // Permitir requisições sem 'origin' (ex: de um navegador no mesmo servidor)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido por CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Definição correta de __filename e __dirname para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// Inicialização das dependências
async function initializeApp() {
  // Conexão com o banco
  const db = await connectDB();

  // Injeção de dependências
  const userRepository = new UserRepository(db);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  // Rotas
  app.post('/api/register', async (req, res) => {
    try {
      await authController.register(req, res); // Passa req e res diretamente
    } catch (error) {
      // Caso o controller não tenha enviado a resposta, enviamos um erro genérico
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
      }
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      await authController.login(req, res); // Passa req e res diretamente
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
      }
    }
  });

  app.post('/api/token', async (req, res) => {
    try {
      await authController.validToken(req, res); // Passa req e res diretamente
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
      }
    }
  });

  app.get('/api/health', async (req, res) => {
    res.json({ message: 'API is running' });
  });

// A ROTA CURINGA DEVE SER A ÚLTIMA DEFINIÇÃO
app.get('/', (req, res) => {
  // Se a requisição for para um endpoint da API que não existe, retorna 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Recurso da API não encontrado.' });
  }
  
  // Para todas as outras requisições, serve o arquivo HTML do frontend
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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