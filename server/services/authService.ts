// services/AuthService.ts
import jwt from 'jsonwebtoken';
import type { IUserRepository } from "../interfaces/IUserRepository.ts";
import type { CreateUserDTO, UpdateUserDTO } from '../DTO/CreateUserDTO.ts';
import type { IUser } from '../interfaces/IUser.ts';
import { User } from '../model/User.ts'; // Importa a classe de modelo de negócio
import { UserResponse } from '../model/UserResponse.ts';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../model/UserRequest.ts';
import { Plans } from '../Enums/PlanEnum.ts';
import bcrypt from 'bcrypt'
import { EmailService } from './emailService.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const FRONT_URL = process.env.FRONT_URL || '';

export class AuthService {
    public userRepository: IUserRepository;
    public emailService:EmailService;

    constructor(userRepository: IUserRepository, emailService:EmailService) {
        this.userRepository = userRepository;
        this.emailService=emailService
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }
    validPlanToSetModel(plan: number): string {
        const planDetails = Plans[plan as keyof typeof Plans];
        return planDetails?.aiModel || Plans[0].aiModel; // Retorna o modelo do plano, ou o do plano GRATUITO como fallback
    }
    // Assumindo que este é o método na sua classe AuthService
    // Ele recebe um UserRequest do frontend
    async updatePass(dto: UpdateUserDTO): Promise<UserResponse> {
        const decoded = await this.validToken(dto.token)
        const existingUser: User | null = await this.userRepository.findByEmail(decoded?.email || '');
        if (!existingUser)
            throw new Error('Falha ao criar o usuário.');


        const userId = new User(existingUser)
        const planId = await userId.validPlan()
        // Retorna o token para o front-end
        
        const passwordHash = await this.hashPassword(dto.password);


        await this.userRepository.updatePass(userId, passwordHash)

        return {
            "token": this.generateToken(userId?._id?.toString() || '', userId.email),
            "email": userId?.email,
            "name": userId?.name,
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
        
        const passwordHash = await this.hashPassword(dto.password);
        const userToCreate = new User({
            _id: id,
            name: dto.name,
            email: dto.email,
            passwordHash: passwordHash,
            plan: 0,
            verificationCode: token,
            qtdRequest: Plans[0].maxRequests,
            isVerified:false,
            planId:''
        })
        const userId = await this.userRepository.create(userToCreate);

        if (!userId) {
            throw new Error('Falha ao criar o usuário.');
        }
        //ENVIO DE EMAIL REGISTER
        // await this.sendEmailwithToken(dto, id.toString(), 'check')

        // Retorna o token para o front-end
        return {
            "token": token,
            "email": userId?.email,
            "name": userId?.name,
            "plan": userId.plan,
            "isVerified": userId.isVerified
        };
    }


    // Método que cuida da lógica de atualização do plano
    //UPDATE É REALIZADO PELO WEBHOOK
    // async updateUserPlan(user: User): Promise<User | null> {
    //     // Verifica se o plano do usuário é válido (chamada a um serviço externo)

    //     let userDataSave: User | null = await this.userRepository.findByEmail(user.email);
    //     if (!userDataSave) {
    //         throw new Error('Usuário não encontrado');
    //     }
    //     const userData = new User(userDataSave)
    //     if (!userData.isVerified)
    //         throw new Error('Erro no processo de compra, usuário deve validar o email com o link enviado');

    //     const isPlanValid = await userData.validPlan();
    //     let updatedUser: User | null = null;


    //     if (!isPlanValid) {
    //         // Se o plano não for válido, inicie um novo processo de compra
    //         // Em uma arquitetura de microserviços, isso seria uma chamada para um serviço de pagamento
    //         const newPurchaseId = await this.purchase(user);

    //         if (!newPurchaseId) {
    //             throw new Error('Erro no processo de compra');
    //         }

    //         // Atualiza o usuário no banco de dados com o novo plano
    //         user.planId = newPurchaseId !== user.planId ? newPurchaseId : user.planId;
    //         updatedUser = await this.userRepository.updatePlan(user.email, user);

    //         if (!updatedUser) {
    //             throw new Error('Falha ao atualizar plano do usuário.');
    //         }
    //         return updatedUser
    //     }

    //     updatedUser = await this.userRepository.updatePlan(user);
    //     return user;
    // }

    //FEITO VIA METODOS DO MP
    // async purchase(dto: any): Promise<string> {
    //     if (!dto.email) {
    //         return '';
    //     }
    //     // Simulação de chamada de API para processar o pagamento e gerar um ID
    //     const paymentId = `mercadopago_${Date.now()}`;
    //     if (paymentId != '')
            
    //     return paymentId;
    // }
    async login(email: string, password: string): Promise<UserResponse | null> {
        const user: User | null = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        const isValid = await this.verifyPassword(user.email, password);
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
            "name": user?.name,
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

    async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findByEmailToLogin(email);
    if (!user) return false;
    return bcrypt.compare(password, user.passwordHash);
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

            if (!decoded && decoded.email === userbyTokenEmail.email)
                throw new Error('Token Rejeitado');

            return {
                "email": userbyTokenEmail?.email,
                "name": userbyTokenEmail?.name,
                "planId": validPlan,
                "plan": userbyTokenEmail.plan,
                "isVerified": userbyTokenEmail.isVerified
            };
        } catch (error) {
            throw new Error('Token Expirado');
        }
    }
    // async sendEmail(dto: UserRequest, id: string): Promise<void> {
    //     // Gera o token após a criação bem-sucedida

    //     const token = this.generateToken(id, dto.email);
    //     // Envio do e-mail
    //     await sendWelcomeEmail(dto.email, dto.name, linkGenerate);

    // }
    async sendEmailwithToken(dto: UserRequest, id: string, handler: string): Promise<void> {
        // Gera o token após a criação bem-sucedida
        const token = this.generateToken(id, dto.email);
        let linkGenerate: string = '';
        if (handler == 'check'){
            linkGenerate = (`${process.env.FRONT_URL}/check?token=${token}`);
            await this.emailService.sendWelcomeEmail(dto.email, dto.name, linkGenerate);
            return
        }
        if (handler == 'reset'){
            linkGenerate = (`${process.env.FRONT_URL}/resetyourpass?token=${token}`);
            await this.emailService.sendEmailResetPass(dto.email, linkGenerate);
            return
        }
        // Envio do e-mail

    }
      private async hashPassword(password: string): Promise<string> {
        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
        return bcrypt.hash(password, saltRounds);
  }
}