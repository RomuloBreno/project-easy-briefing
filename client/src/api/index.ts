// src/api/index.ts

import axiosInstance from './axiosInstance';
import { User } from '../types/user';

export interface BriefingDataWithFiles {
    email:string,
    projectTitle: string;
    promptManipulation: string;
    niche: string;
    content?: string;
    file?: string[]; // Array de strings Base64
}

// NOVO: Função para enviar um briefing para a IA
export const sendBriefingToAiApi = async (briefingText: BriefingDataWithFiles): Promise<string> => {
    try {
        const response = await axiosInstance.post('/api/briefing', { briefingText });
        // Supondo que o backend retorna a resposta da IA em um campo 'response'
        return response.data.response; 
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Falha ao enviar o briefing para a IA.');
    }
};


// Nova função para atualizar o nome do usuário
export const updateProfileApi = async (nameUser: string): Promise<User> => {
    try {
        const response = await axiosInstance.patch('/profile', { nameUser });
        return response.data.user; // Assumindo que o backend retorna o usuário atualizado
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Falha ao atualizar o perfil.');
    }
};

// Nova função para solicitar a alteração de email
export const requestEmailChangeApi = async (newEmail: string): Promise<void> => {
    try {
        await axiosInstance.post('/request-email-change', { newEmail });
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Falha ao solicitar a mudança de email.');
    }
};

export const validateTokenApi = async (token: string): Promise<User> => {
    try {
        const response = await axiosInstance.post('/token', { token });
        // O backend deve retornar os dados do usuário se o token for válido
        return response.data.user;
    } catch (error) {
        throw new Error('Token inválido ou expirado.');
    }
};
export const sendEmail = async (email: string, name:string): Promise<User> => {
    try {

        const response = await axiosInstance.post('/token-to-email', {
        nameUser: name,
        email: email
        });
        console.log("loginApi", response)
        // O backend deve retornar os dados do usuário se o token for válido
        return response.data;
    } catch (error) {
        throw new Error('Token inválido ou expirado.');
    }
};

export const loginApi = async (email: string, password: string): Promise<any> => {
    try {
        const response = await axiosInstance.post('/login', { email, password });
        console.log("loginApi", response)
        return {
            response: response.data
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Login falhou.');
    }
};

export const registerApi = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
        const response = await axiosInstance.post('/register', { name, email, password });
        console.log("registerApi", response)
        return {
            user: response.data.user,
            token: response.data.token,
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registro falhou.');
    }
};

export const purchaseApi = async (email: string, plan: number): Promise<User> => {
    try {
        const response = await axiosInstance.post('/purchase', { 
            email, 
            paymentMethod: "pix", 
            plan,
        });
        return response.data.user;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Falha na compra.');
    }
};