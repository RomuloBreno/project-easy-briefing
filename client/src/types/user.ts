// src/types/user.ts

export interface User {
    nameUser: string;
    email: string;
    plan?: number;
    planId?: string; // Corrigido para string, pois é um ID do gateway de pagamento
    isVerified?: boolean;
}