// services/AuthService.ts
import jwt from 'jsonwebtoken';
import { UserRepository } from "../repositories/UserRepository.ts";
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { UserPlanDTO } from '../DTO/UserPlanDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import { IUser } from '../interfaces/IUser.ts';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  public userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async purchase(dto: UserPlanDTO) : Promise<string | null> {
    const { email, paymentMethod, plan } = dto;
    if (!email || !paymentMethod) {
      return null;
    }

    const validPayment = true; // Simulação de pagamento bem-sucedido
    if (!validPayment) {
      return null;
    }

    const resultado = `${plan}${email}${Date.now()}`;
    return resultado;
  }

  validPlan(resultado: string): UserPlanDTO | null {
    // Como sabemos que validPayment é sempre true (simulação),
    // podemos assumir que o primeiro caractere é 'true'
    const validPayment = resultado.startsWith("true");

    // Remover o 'true' inicial
    const resto = resultado.replace(/^true/, "");

    // O email é uma string, então precisamos saber até onde ele vai.
    // Para simplificar, podemos assumir que o `plan` é um número pequeno (ex: 1, 2, 3)
    // e o restante será o timestamp (Date.now()).

    // Vamos procurar a última parte (timestamp em milissegundos → número grande)
    const timestampMatch = resto.match(/\d{10,}$/); // pega número de pelo menos 10 dígitos
    if (!timestampMatch) return null;

    const timestamp = Number(timestampMatch[0]);

    // Removendo timestamp do resto
    const semTimestamp = resto.replace(timestampMatch[0], "");

    // O plan será o último dígito antes do timestamp
    const email = semTimestamp.slice(1);

    // O restante é o email
    const plan = Number(semTimestamp.slice(0, 1));

    return {
      validPayment,
      email,
      plan,
      timestamp: new Date(timestamp),
    };
  }

  async setNewUserPlan(dto: UserPlanDTO): Promise<UserPlanDTO | null> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (!existingUser) {
      throw new Error('Usuário não existente');
    }
    if (existingUser != null && existingUser?.planId == dto.planId) {  
      throw new Error('Já existe um plano deste ativo para este usuário');
    }

    const purchase = await this.purchase(dto);

    if (!purchase || purchase === null) {
      throw new Error('Erro no processo de compra');
    }

    dto.planId = purchase;
    const userUpdate = await this.userRepository.update(dto);
    if (!userUpdate || userUpdate === null) {
      throw new Error('Falha ao atualizar plano do usuário');
    }

    // const userId = await this.userRepository.findById(userUpdate?.upsertedId || new ObjectId());
    return {
      "email": dto.email,
      "planId": dto.planId,

    };
  }

  async register(dto: CreateUserDTO){
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    const userId = await this.userRepository.create(dto);
    return {
      "token": this.generateToken(userId, dto.email),
      "email": dto.email,
      "nameUser": dto.nameUser
    };
  }

  async login(email: string, password: string){
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValid = await this.userRepository.verifyPassword(user.email, password);
    if (!isValid) {
      throw new Error('Credenciais inválidas');
    }

    if (!user._id?.toString())
      return null;
    return {
      "token": this.generateToken(user._id?.toString(), user.email),
      "userId": user._id?.toString(),
      "email": user.email,
      "nameUser": user.nameUser
    };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async validToken(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      decoded;
      return this.userRepository.findByEmail(decoded.email);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}