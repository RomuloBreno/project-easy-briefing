// src/types/user.ts

export interface User {
    name: string;
    email: string;
    plan?: number;
    planId?: boolean; // Corrigido para string, pois é um ID do gateway de pagamento
    isVerified?: boolean;
}