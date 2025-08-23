// // src/repositories/UserRepository.ts
// import { Db, ObjectId } from "mongodb";
// import dotenv from "dotenv";
// import { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
// import type { IUserRepository } from "../interfaces/IUserRepository.ts";
// import bcrypt from 'bcrypt';
// import { User } from "../model/User.ts";

// import type { IUser } from "../interfaces/IUser.ts";
// import { UserRequest } from "../model/UserRequest.ts";
// dotenv.config();
// export class UserRepository implements IUserRepository {
//   private readonly collectionName = 'users';
//   private readonly db: Db;

//   constructor(db: Db) {
//     this.db = db;
//     this.ensureIndexes().catch(console.error);
//   }

//   private async ensureIndexes(): Promise<void> {
//     try {
//       await this.db.collection(this.collectionName).createIndex(
//         { email: 1 },
//         { unique: true }
//       );
//       console.log('✅ Índices verificados/criados');
//     } catch (error) {
//       console.error('❌ Erro ao criar índices:', error);
//       throw error;
//     }
//   }

//   async create(dto: IUser, password:string): Promise<User> {
//     const passwordHash = await this.hashPassword(password);
//     const user: IUser = {
//       name: dto.name,
//       email: dto.email,
//       passwordHash,
//       createOn: new Date(),
//       plan: 0,
//       planId: '',
//       isVerified: false
//     };

//     const result = await this.db.collection<IUser>(this.collectionName).insertOne(user);
//     return result as unknown as User;
//   }
  
  
//   async updateAuthenticationEmail(email:string): Promise<User | null> {
//          const user = await this.db.collection<IUser>(this.collectionName).findOne({email:email})
//          if(!user)
//           return null
//          const result = await this.db.collection<IUser>(this.collectionName).updateOne(
//           {email:email},
//           {$set: {isVerified: true}});
//           return result as unknown as User;
//     }

//   async update(user: Partial<User>): Promise<User | null> {
//     if (!user.email) return null;

//     const updateResult = await this.db
//       .collection<User>(this.collectionName)
//       .findOneAndUpdate(
//         { email: user.email },
//         { $set: user },
//         { returnDocument: 'after' }
//       );

//     return updateResult as unknown as User | null;
//   }
//   async updatePass(dto: IUser, password:string): Promise<User | null> {
//     if (!dto.email) return null;
//     const passwordHash = await this.hashPassword(password);
//     const updateResult = await this.db
//       .collection<User>(this.collectionName)
//       .findOneAndUpdate(
//         { email: dto.email },
//         { $set: {passwordHash: passwordHash} },
//         { returnDocument: 'after' }
//       );

//     return updateResult as unknown as User | null;
//   }

//   async updatePlan(dto: User): Promise<User | null> {
//     const result = await this.db.collection<User>(this.collectionName).findOneAndUpdate(
//       { email: dto.email },
//       { $set: { planId: dto.planId, paymentMethod: dto.paymentMethod, plan:dto.plan } },
//       { returnDocument: 'after' }
//     );

//     return result as unknown as User | null;
//   }
    
//   async findById(id: string): Promise<User | null> {
//     const result = await this.db.collection<User>(this.collectionName).findOne(
//       { _id: new ObjectId(id) },
//       { projection: { passwordHash: 0 } }
//     );

//     return result as unknown as User | null;
//   }

//   async findByEmail(email: string): Promise<User | null> {
//     const result = await this.db.collection<User>(this.collectionName).findOne(
//       { email },
//       { projection: { passwordHash: 0 } }
//     );

//     return result as unknown as User | null;
//   }

//   async findByEmailToLogin(email: string): Promise<User | null> {
//     const result = await this.db.collection<User>(this.collectionName).findOne({ email });
//     return result as unknown as User | null;
//   }

//   async list(): Promise<User[]> {
//     const results = await this.db.collection<User>(this.collectionName)
//       .find({}, { projection: { passwordHash: 0 } })
//       .toArray();

//     return results as unknown as User[];
//   }

//   async verifyPassword(email: string, password: string): Promise<boolean> {
//     const user = await this.findByEmailToLogin(email);
//     if (!user) return false;
//     return bcrypt.compare(password, user.passwordHash);
//   }

//   private async hashPassword(password: string): Promise<string> {
//     const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
//     return bcrypt.hash(password, saltRounds);
//   }
// }
import { Db, ObjectId} from "mongodb";
import { BaseRepository } from "./BaseRepository.ts";
import type { User as UserModel } from "../model/User.ts";
import type { IUserRepository } from "../interfaces/IUserRepository.ts";

export interface UserDocument extends Document, UserModel {}

export class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
  constructor(db: Db) {
    super(db, "users");
  }
  
  // Implementação obrigatória do método abstrato da classe base
  protected override async ensureIndexes(): Promise<void> {
    try {
      await this.collection.createIndex(
        { email: 1 },
        { unique: true }
      );
      console.log('✅  Índices de Payment verificados/criados');
    } catch (error) {
      console.error('❌ Erro ao criar índices de User:', error);
      throw error;
    }
  }

  async list(): Promise<UserDocument[]> {
    const results = await this.db.collection<UserDocument>(this.collectionName)
      .find({}, { projection: { passwordHash: 0 } })
      .toArray();

    return results as unknown as UserDocument[];
  }

  // --- Métodos de acesso específicos de User ---

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async findByEmailToLogin(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }
  
  async listAll(): Promise<UserDocument[]> {
    return this.find({});
  }

  async updateAuthenticationEmail(email: string): Promise<UserDocument | null> {
    const update = { $set: { isVerified: true } };
    return this.update({ email }, update);
  }

  // O método de criação agora aceita o hash da senha diretamente
  async createWithHashedPassword(userData: Partial<UserDocument>, passwordHash: string): Promise<UserDocument | null> {
    const userToSave: Partial<UserDocument> = { ...userData, passwordHash };
    return this.create(userToSave as UserDocument);
  }

  async updatePassword(email: string, passwordHash: string): Promise<UserDocument | null> {
    const update = { $set: { passwordHash } };
    return this.update({ email }, update);
  }

  async updatePlan(email: string, planId: string, paymentMethod: string, plan: number, datePay:Date): Promise<UserDocument | null> {
    const update = { $set: { planId, paymentMethod, plan, planExpirationDate:datePay } };
    return this.update({ email }, update);
  }
    async updatePass(dto: UserModel, passwordHash:string): Promise<UserDocument | null> {
      if (!dto.email) return null;
      const updateResult = await this.db
        .collection<UserModel>(this.collectionName)
        .findOneAndUpdate(
          { email: dto.email },
          { $set: {passwordHash: passwordHash} },
          { returnDocument: 'after' }
        );

      return updateResult as unknown as UserDocument | null;
    }

}