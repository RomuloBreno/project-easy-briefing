// src/api/index.ts

import { AIResponse } from '../types/iaResponse';
import { User } from '../types/user';

// Interface para as opções da requisição para 'fetch'
// Extendendo RequestInit para cobrir as opções padrão do fetch,
// e adicionando headers de forma mais específica se necessário.
interface CustomRequestOptions extends RequestInit {
    headers?: { [key: string]: string }; // Permite que 'headers' seja um objeto com chaves e valores string
}

export interface BriefingDataWithFiles {
    email: string,
    projectTitle: string;
    promptManipulation: string;
    niche: string;
    content?: string;
    file?: string[]; // Array de strings Base64
}

// Função utilitária centralizada para fazer requisições à API usando fetch
export const apiFetch = async (url: string, options: CustomRequestOptions = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Adiciona o header se houver token
        ...(options.headers || {}), // Garante que headers seja um objeto para spread
    };

    try {
        const response = await fetch("/api"+ url, { ...options, headers: new Headers(headers) }); // Envolve headers em new Headers() para fetch
        if (response.status === 401) {
            console.warn('Sessão expirada ou não autorizado. Redirecionando para a página de login.');
            localStorage.removeItem('token'); // Limpa o token inválido
            // IMPORTANTE: Para redirecionar aqui, você precisará de uma forma de acessar a navegação
            // (ex: window.location.href = '/login'; ou usar um hook de navegação do React Router em um contexto superior).
            throw new Error('Sessão expirada ou não autorizada. Dados como email e senha não Encontrados'); // Lança um erro para ser capturado no chamador
        }

        if (response.status === 500) {
            console.warn('Tivemos um erro inesperado, sintimos muito pelo imprevisto');
            localStorage.removeItem('token'); // Limpa o token inválido
            // IMPORTANTE: Para redirecionar aqui, você precisará de uma forma de acessar a navegação
            // (ex: window.location.href = '/login'; ou usar um hook de navegação do React Router em um contexto superior).
            throw new Error('Tivemos um erro inesperado, sintimos muito pelo imprevisto'); // Lança um erro para ser capturado no chamador
        }

        if (!response.ok) { // Trata status HTTP que não são 2xx (ex: 400, 500, etc.)
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
            throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
        }

        // Se a resposta for OK (status 2xx), tenta retornar o JSON
        // Algumas respostas podem não ter corpo (ex: 204 No Content), então verificamos.
        if (response.headers.get('content-type')?.includes('application/json')) {
            return await response.json();
        } else {
            return response.text(); // Ou retorne o texto se não for JSON
        }

    } catch (error: any) {
        console.error('Erro na requisição API:', error);
        // Relança o erro para que as funções de API o capturem e o tratem ou o propaguem
        throw error;
    }
};

// Funções de API que agora usam apiFetch
export const sendBriefingToAiApi = async (briefingText: BriefingDataWithFiles): Promise<AIResponse> => {
    try {
        const response = await apiFetch('/briefing', {
            method: 'POST',
            body: JSON.stringify({ briefingText }),
        });
        return response.response; // Supondo que o backend retorna a resposta da IA em um campo 'response'
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao enviar o briefing para a IA.');
    }
};

export const updateProfileApi = async (name: string): Promise<User> => {
    try {
        const response = await apiFetch('/profile', {
            method: 'PATCH',
            body: JSON.stringify({ name }),
        });
        return response.user; // Assumindo que o backend retorna o usuário atualizado
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao atualizar o perfil.');
    }
};

export const requestEmailChangeApi = async (newEmail: string): Promise<void> => {
    try {
        const response = await apiFetch('/request-email-change', {
            method: 'POST',
            body: JSON.stringify({ newEmail }),
        });
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao solicitar a mudança de email.');
    }
};

export const validateTokenApi = async (token: string): Promise<User> => {
    try {
        const response = await apiFetch('/token', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
        return response.user; // O backend deve retornar os dados do usuário se o token for válido
    } catch (error: any) {
        throw new Error(error.message || 'Token inválido ou expirado.');
    }
};

export const sendEmail = async (email: string, name: string): Promise<User> => {
    try {
        const response = await apiFetch('/token-to-email', {
            method: 'POST',
            body: JSON.stringify({ name: name, email: email }),
        }); // Log para depuração
        return response;
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao enviar e-mail.');
    }
};
export const sendEmailResetPass = async (email: string): Promise<void> => {
    try {
        const response = await apiFetch('/reset-pass', {
            method: 'POST',
            body: JSON.stringify({email: email}),
        }); // Log para depuração
        return response;
    } catch (error: any) {
        throw new Error(error.message || 'Falha ao enviar e-mail.');
    }
};

export const loginApi = async (email: string, password: string): Promise<any> => {
    try {
        const response = await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        return { response };
    } catch (error: any) {
        throw new Error(error.message || 'Login falhou.');
    }
};

export const registerApi = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
        const response = await apiFetch('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        return {
            user: response.user,
            token: response.token,
        };
    } catch (error: any) {
        throw new Error(error.message || 'Registro falhou.');
    }
};

export const updatePasswordApi = async (token: string, password: string): Promise<{ user: User; token: string }> => {
    try {
        const response = await apiFetch('/update-password', {
            method: 'PATCH',
            body: JSON.stringify({token, password }),
        });
        return {
            user: response.user,
            token: response.token,
        };
    } catch (error: any) {
        throw new Error(error.message || 'Registro falhou.');
    }
};

export const purchaseApi = async (email: string, plan: number): Promise<User> => {
    try {
        const apiPayResult = "mercadopago_" + new Date().getMilliseconds();
        const response = await apiFetch('/purchase', {
            method: 'POST',
            body: JSON.stringify({
                email,
                paymentMethod: "pix",
                plan,
                planId: apiPayResult
            }),
        });
        return response.user;
    } catch (error: any) {
        throw new Error(error.message || 'Falha na compra.');
    }
};
