// services/AuthService.ts
import jwt from 'jsonwebtoken';
import { UserRepository } from "../repositories/UserRepository.ts";
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  public userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(dto: CreateUserDTO) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    const userId = await this.userRepository.create(dto);
    return {
      "token":this.generateToken(userId, dto.email, dto.nameUser),
      "userId": userId,
      "email": dto.email,
      "nameUser": dto.nameUser
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValid = await this.userRepository.verifyPassword(user.email, password);
    if (!isValid) {
      throw new Error('Credenciais inválidas');
    }
    
    if(!user._id?.toString())
      return null;
     return {
      "token":this.generateToken(user._id?.toString(), user.email, user.nameUser),
      "userId": user._id?.toString(),
      "email": user.email,
      "nameUser": user.nameUser
    };
  }

  private generateToken(userId: string, email: string, name: string) {
    return jwt.sign(
      { id: userId, email, name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async validToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      decoded;
      return this.userRepository.findByEmail(decoded.email); 
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}