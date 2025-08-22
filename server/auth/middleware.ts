// server/middleware/authMiddleware.ts
import { AuthService } from '../services/authService.ts'; // Verifique o caminho real do seu AuthService
import { UserResponse } from '../model/UserResponse.ts'; // Verifique o caminho real do seu UserResponse

// Estende a interface Request do Express para incluir informações do usuário
// Isso permite que controllers acessem req.user
declare global {
    namespace Express {
        interface Request {
            user?: UserResponse; // Informações do usuário logado
        }
    }
}

/**
 * Retorna uma função de middleware para autenticação baseada em token JWT.
 * O token é esperado no cabeçalho 'Authorization' no formato 'Bearer <token>'.
 * Se o token for válido, as informações do usuário são anexadas a `req.user`.
 * Caso contrário, retorna um erro de autenticação.
 * @param authService Instância do AuthService para validação do token.
 * @returns Um middleware do Express.
 */
export const authMiddleware = (authService: AuthService) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token de autenticação não fornecido ou formato inválido.' });
            }

            const token = authHeader.split(' ')[1]; // Extrai o token após "Bearer "

            if (!token) {
                return res.status(401).json({ error: 'Token de autenticação ausente.' });
            }

            // Valida o token usando o AuthService
            const user = await authService.validToken(token);

            if (!user) {
                return res.status(403).json({ error: 'Token inválido ou expirado.' });
            }

            // Anexa as informações do usuário à requisição para uso em controllers subsequentes
            req.user = user;
            next(); // Prossegue para o próximo middleware/rota
        } catch (error: unknown) {
            console.error('Erro no middleware de autenticação:', error);
            if (error instanceof Error && error.message.includes('Token Expirado')) {
                return res.status(401).json({ error: 'Token de autenticação expirado.' });
            }
            return res.status(500).json({ error: 'Falha na autenticação do token.' });
        }
    };
};
