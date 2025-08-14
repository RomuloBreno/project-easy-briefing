import { MongoClient, Db } from 'mongodb';

// Variáveis de conexão com tipos explícitos
let client: MongoClient | null = null;
let db: Db | null = null;

// Tempo máximo de espera para conexão (5 segundos)
const CONNECTION_TIMEOUT_MS = 5000;

export async function connectDB(): Promise<Db> {
  if (db) return db; // Retorna se já estiver conectado

  if (!process.env.MONGO_URI) {
    throw new Error('❌ Variável de ambiente MONGO_URI não definida');
  }

  try {
    client = new MongoClient(process.env.MONGO_URI, {
      connectTimeoutMS: CONNECTION_TIMEOUT_MS,
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS
    });

    await client.connect();
    
    db = client.db(process.env.MONGO_DB_NAME || 'meu_banco');
    console.log('✅ MongoDB conectado com sucesso');
    
    return db;
  } catch (error) {
    // Limpa as variáveis em caso de falha
    client = null;
    db = null;
    
    console.error('❌ Falha ao conectar ao MongoDB:', error);
    throw new Error('Falha ao conectar ao banco de dados');
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('🔌 MongoDB desconectado com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database não inicializada. Chame connectDB() primeiro');
  }
  return db;
}

// Opcional: Adicionar ping ao banco para verificar saúde da conexão
export async function checkDBHealth(): Promise<boolean> {
  try {
    const currentDb = await connectDB();
    await currentDb.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}