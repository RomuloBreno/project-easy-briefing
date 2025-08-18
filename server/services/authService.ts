// services/AuthService.ts
import jwt from 'jsonwebtoken';
import type { IUserRepository } from "../interfaces/IUserRepository.ts";
import type { CreateUserDTO } from '../DTO/CreateUserDTO.ts';
import type { IUser } from '../interfaces/IUser.ts';
import { User } from '../model/User.ts'; // Importa a classe de modelo de negócio
import { UserResponse } from '../model/UserResponse.ts';
import { sendEmailResetPass, sendWelcomeEmail } from './emailService.ts';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../model/UserRequest.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const FRONT_URL = process.env.FRONT_URL || '';

export class AuthService {
    public userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }
    validPlanToSetModel(plan: number): string{
       switch (plan) {
        case 0: // Plano Gratuito
            return 'gpt-3.5-turbo';
        case 1: // Plano Starter
            return 'gpt-4o-mini';
        case 2: // Plano Pro
            return 'gpt-4o';
        default: // Para qualquer outro valor, retorna o plano gratuito como padrão
            return 'gpt-3.5-turbo';
    }
    }
    // Assumindo que este é o método na sua classe AuthService
    // Ele recebe um UserRequest do frontend
    async updatePass(dto: CreateUserDTO): Promise<UserResponse> {
        const existingUser: User | null = await this.userRepository.findByEmail(dto.email);
        if(!existingUser)
            throw new Error('Falha ao criar o usuário.');
        
        const userId = new User(existingUser)
        

        const planId = await userId.validPlan()
                // Retorna o token para o front-end

        await this.userRepository.updatePass(userId, dto.password)
                
        return {
            "token": this.generateToken(userId?._id?.toString() ||'', userId.email),
            "email": userId?.email,
            "nameUser": userId?.nameUser,
            "plan": userId.plan,
            "isVerified": userId.isVerified,
            "planId": planId
        };
    }
    async register(dto: CreateUserDTO): Promise<UserResponse> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new Error('Email já está em uso');
        }

        // Cria um DTO para a camada de serviço/repositório
        // A senha é separada aqui para ser tratada
        const id = new ObjectId()
        const token = this.generateToken(id.toString(), dto.email);
        const userToCreate: IUser = {
            _id:id,
            nameUser: dto.nameUser,
            email: dto.email,
            passwordHash: '',
            plan: 0,
            verificationCode:token
        };
        // Chama o método create do repositório
        // O repositório ou o serviço de autenticação cuidará do hash da senha
        const userId = await this.userRepository.create(userToCreate, dto.password);

        if (!userId) {
            throw new Error('Falha ao criar o usuário.');
        }
        await this.sendEmail(dto, token)

        // Retorna o token para o front-end
        return {
            "token": token,
            "email": userId?.email,
            "nameUser": userId?.nameUser,
            "plan": userId.plan,
            "isVerified": userId.isVerified
        };
    }

    async update(user: User): Promise<User | null> {
        return this.userRepository.update(user);
    }

    // Método que cuida da lógica de atualização do plano
    async updateUserPlan(user: User): Promise<User | null> {
        // Verifica se o plano do usuário é válido (chamada a um serviço externo)
        const userData = new User(user)
        if(!userData.isVerified)
            throw new Error('Erro no processo de compra, usuário deve validar o email com o link enviado');
        
        const isPlanValid = await userData.validPlan();
        let updatedUser: User|null=null;
        

        if (!isPlanValid) {
            // Se o plano não for válido, inicie um novo processo de compra
            // Em uma arquitetura de microserviços, isso seria uma chamada para um serviço de pagamento
            const newPurchaseId = await this.purchase(user);

            if (!newPurchaseId) {
                throw new Error('Erro no processo de compra');
            }

            // Atualiza o usuário no banco de dados com o novo plano
            user.planId = newPurchaseId !== user.planId ? newPurchaseId : user.planId;
            updatedUser = await this.userRepository.updatePlan(user);

            if (!updatedUser) {
                throw new Error('Falha ao atualizar plano do usuário.');
            }
            return updatedUser
        }
        
        updatedUser = await this.userRepository.updatePlan(user);
        return user;
    }
    async purchase(dto: any): Promise<string> {
        if (!dto.email) {
            return '';
        }
        // Simulação de chamada de API para processar o pagamento e gerar um ID
        const paymentId = `mercadopago_${Date.now()}`;
        return paymentId;
    }
    async login(email: string, password: string): Promise<UserResponse | null> {
        const user: User | null = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        const isValid = await this.userRepository.verifyPassword(user.email, password);
        if (!isValid) {
            throw new Error('Credenciais inválidas');
        }

        // Delega a validação e atualização do plano para a classe User
        const validPlan = await new User(user).validPlan()

        if (!user?._id?.toString()) {
            throw new Error('ID do usuário não encontrado.');
        }
        const token = this.generateToken(user?._id?.toString(), user?.email)

        return {
            "token": token,
            "email": user?.email,
            "nameUser": user?.nameUser,
            "planId": validPlan,
            "plan": user.plan,
            "isVerified": user.isVerified
        };
    }

    private generateToken(userId: string, email: string): string {
        return jwt.sign(
            { id: userId, email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    async validToken(token: string): Promise<UserResponse | null> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            let userbyTokenEmail = await this.userRepository.findByEmail(decoded.email);

            if (!userbyTokenEmail) {
                throw new Error('Usuário não encontrado');
            }

            // Delega a validação e atualização do plano para a classe User
            const validPlan = await new User(userbyTokenEmail).validPlan();

            if (!decoded && decoded.email == userbyTokenEmail.email )
                throw new Error('Token Rejeitado');

            return {
                "email": userbyTokenEmail?.email,
                "nameUser": userbyTokenEmail?.nameUser,
                "planId": validPlan,
                "plan": userbyTokenEmail.plan,
                "isVerified": userbyTokenEmail.isVerified
            };
        } catch (error) {
            throw new Error('Token Expirado');
        }
    }
        async sendEmail(dto: UserRequest, token: string): Promise<void> {
            // Gera o token após a criação bem-sucedida
            
            const linkGenerate = (`${process.env.FRONT_URL}/check/token=${token}`);
            // Envio do e-mail
            await sendWelcomeEmail(dto.email, dto.nameUser, linkGenerate);

        }
        async sendEmailResetPass(dto: UserRequest, id:string): Promise<void> {
            // Gera o token após a criação bem-sucedida
            const token = this.generateToken(id, dto.email);
            const linkGenerate = (`${process.env.FRONT_URL}/resetyourpass/token=${token}`);
            // Envio do e-mail
            await sendEmailResetPass(dto.email, linkGenerate);

        }
}