// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { 
    validateTokenApi, 
    loginApi, 
    registerApi, 
    purchaseApi,
    updateProfileApi,
    requestEmailChangeApi,
    sendEmail,
    sendEmailResetPass,
    updatePasswordApi
} from '../api';

interface AuthContextType {
    user: User | null;
    checkToken: boolean | null;
    isLoading: boolean;
    error: string | null;
    successPay: boolean | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    resetPass: (email: string) => Promise<void>;
    logout: () => void;
    purchase: (plan: number) => Promise<void>;
    updateProfile: (name: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... (existing state variables and useEffect hook)
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [checkToken, setCheckToken] = useState<boolean | null>(null);
    const [successPay, setSuccessPay] = useState<boolean | null>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            validateToken(token);
            setToken(token)
            checkTokenEmailSend()
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
            localStorage.setItem('token', token);
            // window.location.href="/"
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

    const updatePassword = async (password: string) => {
        setIsLoading(true);
        setError(null);
        try {
        const searchParams = new URLSearchParams(window.location.search);
        // Obtém os parâmetros 'token' e 'valid' da URL
        const token = searchParams.get('resetToken');
            if(token)
                await updatePasswordApi(token || '', password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const checkTokenEmailSend = async () => {
        setIsLoading(true);
        setError(null);
        try {
        const searchParams = new URLSearchParams(window.location.search);
        // Obtém os parâmetros 'token' e 'valid' da URL
        const param = searchParams.get('status');
            if(param === "success-verify")
                setCheckToken(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const resetPass = async (email: string) => {
        setIsLoading(true);
        setError(null);
        try {
             await sendEmailResetPass(email);
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
            if(!user.isVerified){
                setSuccessPay(null);
                 throw new Error('Conta deve ser validada por e-mail');
            } 
                
            // const updatedUser = await purchaseApi(user.email, plan);
            // setUser(updatedUser);
            // setSuccessPay(true);
            //Mock time
            // setTimeout(async ()=>{
            // },5000)
        } catch (err: any) {
            setSuccessPay(false);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // NOVO: Função para atualizar o perfil
    const updateProfile = async (name: string, email: string) => {
        if (!user) {
            setError('Usuário não autenticado.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (name !== user.name) {
                const updatedUser = await updateProfileApi(name);
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
        <AuthContext.Provider value={{ checkToken, user, isLoading, error, successPay, login, register, resetPass, logout, purchase, updateProfile, updatePassword }}>
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