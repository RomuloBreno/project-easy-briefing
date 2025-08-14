// src/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces/IUser';

const JWT_SECRET = process.env.JWT_SECRET || 'seuSegredoSuperSecreto';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class JWTService {
  /**
   * Cria um token JWT para o usuário
   */
  static createToken(user: IUser): string {
    const payload = {
      id: user._id,
      email: user.email,
      name: user.nameUser
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static verifyToken(token: string): Promise<{ id: string; email: string; name: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded as { id: string; email: string; name: string });
      });
    });
  }
}