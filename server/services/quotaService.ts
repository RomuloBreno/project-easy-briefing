// server/services/quotaService.ts
import { User } from '../model/User.ts'; // Verifique o caminho real do seu User
import type { IUserRepository } from '../interfaces/IUserRepository.ts'; // Verifique o caminho real do seu IUserRepository

/**
 * QuotaService é responsável por gerenciar a cota de requisições dos usuários
 * com base em seus planos.
 */
export class QuotaService {
    private readonly userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retorna o limite máximo de requisições para um determinado plano.
     * @param plan O número do plano (0: Gratuito, 1: Starter, 2: Pro).
     * @returns O número máximo de requisições permitidas para o plano.
     */
    getPlanQuota(plan: number): number {
        switch (plan) {
            case 0: // Plano Gratuito
                return 5; // Exemplo: 5 requisições gratuitas
            case 1: // Plano Starter
                return 100; // Exemplo: 100 requisições para o plano Starter
            case 2: // Plano Pro
                return 1000; // Exemplo: 1000 requisições para o plano Pro
            default:
                return 0; // Plano desconhecido ou inválido não permite requisições
        }
    }

    /**
     * Verifica se o usuário tem requisições restantes.
     * @param user O objeto User.
     * @returns True se o usuário tiver requisições restantes, false caso contrário.
     */
    checkQuota(user: User): boolean {
        // Se qtdRequest for undefined, assume que é 0 para segurança
        // if(user.planId === '' && user.plan === 0)
        //     return true
        return (user.qtdRequest ?? 0) > 0;
    }

    /**
     * Decrementa a quantidade de requisições restantes do usuário e persiste a mudança.
     * @param user O objeto User a ser atualizado.
     * @returns Uma Promise vazia.
     * @throws Erro se o usuário não tiver requisições restantes ou se a atualização falhar.
     */
    async decrementQuota(user: User): Promise<void> {
        if (!this.checkQuota(user)) {
            throw new Error('Cota de requisições excedida.');
        }

        // Persiste a mudança no banco de dados.
        // O userRepository.update deve ser capaz de atualizar o campo qtdRequest.
            const filter = { email: user.email };
            const update = {
                $set: {
                qtdRequest: user.planId !== '' && user.plan !== 0 ? (user.qtdRequest ?? 0) - 1 : 0,
                updatedAt: new Date(), // É uma boa prática atualizar o timestamp
                },
        };

        const updatedUser = await this.userRepository.update(filter, update);
        
        if (!updatedUser) {
            throw new Error('Falha ao atualizar a cota do usuário no banco de dados.');
        }
    }

    /**
     * Reseta a cota de requisições do usuário para o valor máximo do seu plano.
     * Ideal para ser chamado em ciclos de billing (ex: início de cada mês).
     * @param user O objeto User a ser atualizado.
     * @returns Uma Promise vazia.
     * @throws Erro se a atualização falhar.
     */
    async resetQuota(user: User): Promise<void> {
        const maxQuota = this.getPlanQuota(user.plan);
        
        // Persiste a mudança no banco de dados.
          const filter = { email: user.email };
            const update = {
                $set: {
                qtdRequest:user.qtdRequest = maxQuota,
                updatedAt: new Date(), // É uma boa prática atualizar o timestamp
                },
        };

        const updatedUser = await this.userRepository.update(filter, update);

        if (!updatedUser) {
            throw new Error('Falha ao resetar a cota do usuário no banco de dados.');
        }
    }
}