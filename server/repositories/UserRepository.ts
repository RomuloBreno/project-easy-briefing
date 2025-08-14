import type { Db, WithId } from "mongodb";
import 'dotenv/config';
import { IUser} from "../interfaces/IUser.ts";
import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import { LoginDTO } from '../DTO/LoginDTO.ts';
import type { IUserRepository } from "../interfaces/IUserRepository.ts";
import bcrypt from 'bcrypt';

export class UserRepository implements IUserRepository {
  private readonly collectionName = 'users';
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
    this.ensureIndexes().catch(console.error);
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.db.collection(this.collectionName).createIndex(
        { email: 1 },
        { unique: true }
      );
      console.log('✅ Índices verificados/criados');
    } catch (error) {
      console.error('❌ Erro ao criar índices:', error);
      throw error;
    }
  }

  async create(dto: CreateUserDTO): Promise<string> {
    try {
      const passwordHash = await this.hashPassword(dto.password);
      
      const user: IUser = {
        nameUser: dto.nameUser,
        email: dto.email,
        passwordHash,
        createOn: new Date(),
      };

      const result = await this.db
        .collection<IUser>(this.collectionName)
        .insertOne(user);

      if (!result.acknowledged) {
        throw new Error('Falha ao criar usuário');
      }

      return result.insertedId.toString();
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error('Email já está em uso');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<WithId<IUser> | null> {
    return this.db
      .collection<IUser>(this.collectionName)
      .findOne({ email },{ projection: { passwordHash: 0 } } );
  }
  async findByEmailToLogin(email: string): Promise<WithId<IUser> | null> {
    return this.db
      .collection<IUser>(this.collectionName)
      .findOne({ email });
  }

  async list(): Promise<WithId<IUser>[]> {
    return this.db
      .collection<IUser>(this.collectionName)
      .find({ projection: { passwordHash: 0 } })
      .toArray();
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmailToLogin(email);
    if (!user) return false;
    
    return bcrypt.compare(password, user.passwordHash);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    return bcrypt.hash(password, saltRounds);
  }
}