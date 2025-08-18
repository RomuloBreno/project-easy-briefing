// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { 
    validateTokenApi, 
    loginApi, 
    registerApi, 
    purchaseApi,
    updateProfileApi,
    requestEmailChangeApi
} from '../api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    purchase: (plan: number) => Promise<void>;
    updateProfile: (nameUser: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... (existing state variables and useEffect hook)
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            validateToken(token);
        }
    }, []);

    const validateToken = async (token: string) => {
        setIsLoading(true);
        try {
            const result = await validateTokenApi(token);
            localStorage.setItem('token', token);
            setUser(result);
        } catch (err: any) {
            setError(err.message || 'Token inválido ou expirado.');
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await loginApi(email, password);
            const { token, ...user} = result.response
            console.log("login",token, user)
            localStorage.setItem('token', token);
            setUser(user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { user, token } = await registerApi(name, email, password);
            localStorage.setItem('token', token);
            setUser(user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        setError(null);
    };

    const purchase = async (plan: number) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!user) {
                throw new Error('Usuário não autenticado.');
            }
            //Mock time
            console.log("ABRIR MODAL DE PAGAEMENTO")
            setTimeout(async ()=>{
                const updatedUser = await purchaseApi(user.email, plan);
                setUser(updatedUser);
            },5000)
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // NOVO: Função para atualizar o perfil
    const updateProfile = async (nameUser: string, email: string) => {
        if (!user) {
            setError('Usuário não autenticado.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (nameUser !== user.nameUser) {
                const updatedUser = await updateProfileApi(nameUser);
                setUser(updatedUser);
            }

            if (email !== user.email) {
                await requestEmailChangeApi(email);
                setError('Um link de verificação foi enviado para o novo e-mail.');
                // Note: o `user` no estado do cliente ainda tem o email antigo,
                // para que a validação do token funcione até o novo email ser verificado.
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, purchase, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};