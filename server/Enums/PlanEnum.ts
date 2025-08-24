// server/enums/PlanEnum.ts

/**
 * Interface que define a estrutura de um plano.
 */
export interface PlanDetails {
    id: number;          // ID numérico do plano
    name: string;        // Nome amigável do plano (ex: "Gratuito", "Starter", "Pro")
    aiModel: string;     // Modelo de IA associado ao plano (ex: "gpt-3.5-turbo")
    value: number;       // Valor monetário do plano (ex: 0 para gratuito, 9.9 para Starter)
    maxRequests: number; // Quantidade máxima de requisições permitidas pelo plano
}

/**
 * Objeto que mapeia os IDs numéricos dos planos para seus detalhes completos.
 * Esta abordagem substitui o Enum e o Map para melhor compatibilidade em ambientes
 * "strip-only mode" e oferece uma representação mais direta em JavaScript.
 */
export const Plans = {
    // Plano Gratuito
    0: { // Corresponde ao ID 0
        id: 0,
        name: "plan-starter-000",
        aiModel: 'gpt-3.5-turbo',
        value: 0,
        maxRequests: 1000// Exemplo: 0 requisições gratuitas
    },
    // Plano Starter
    1: { // Corresponde ao ID 1
        id: 1,
        name: "plan-starter-001",
        aiModel: 'gpt-4o-mini',
        value: 1,
        maxRequests: 25 
    },
    // Plano Pro
    2: { // Corresponde ao ID 2
        id: 2,
        name: 'plan-starter-002',
        aiModel: 'gpt-4o',
        value: 29.9,
        maxRequests: 60
    },
} as const; // 'as const' para garantir que os tipos sejam literais e imutáveis.

/**
 * Define os IDs numéricos dos planos para facilitar a referência.
 * Pode ser usado como PlanId.FREE, PlanId.STARTER, etc.
 * Isso substitui a funcionalidade de um Enum sem a sintaxe de Enum,
 * fornecendo constantes para os IDs.
 */
export const PlanId = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
} as const;


/**
 * Função auxiliar para obter os detalhes de um plano pelo seu ID numérico.
 * @param planId O ID numérico do plano (0, 1, 2).
 * @returns Os detalhes do plano ou undefined se não encontrado.
 */
export function getPlanDetailsById(planId: number): PlanDetails | undefined {
    // Acessa diretamente a propriedade do objeto Plans.
    // TypeScript irá inferir o tipo correto se planId for um literal 0, 1, 2.
    // Caso contrário, retorna undefined se a propriedade não existir.
    return Plans[planId as keyof typeof Plans] as PlanDetails | undefined;
}
