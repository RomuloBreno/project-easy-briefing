// src/App.tsx

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { apiFetch } from './api/index.ts'


function AppContent() {
    const { user, isLoading, error, successPay, login, register, resetPass, logout, purchase, updatePassword } = useAuth();
    const [needLogin, setNeedLogin] = useState(false);
    const [needUpdatePlan, setNeedUpdatePlan] = useState(false);
    const [dashboard, setDashboard] = useState(false);
    const [tokenIsValid, setTokenIsValid] = useState(false);
    const updatePlan = () => {
        setNeedUpdatePlan(true)
        setDashboard(false)
    }
    const dashboardPage = () => {
        setNeedUpdatePlan(false)
        setDashboard(true)
    }
    

    const tokenValid = async (token:string, valid:boolean) => {
    //    const response = await apiFetch("/token", {
    //         method: 'POST',
    //         body: JSON.stringify({ token }),
    //     });

    //     setTokenIsValid(valid && response.response);
        setTokenIsValid(true);
    };


    useEffect(() => {
         // Cria um objeto URLSearchParams com a query string da URL atual
        const searchParams = new URLSearchParams(window.location.search);

        // Obtém os parâmetros 'token' e 'valid' da URL
        const token = searchParams.get('resetToken');
        const valid = searchParams.get('value');
        if((token !== null && token !== '') &&
         (valid !== null && valid !== ''))
            tokenValid(token, valid=='true'?true:false)
    }, [])

    useEffect(() => {
       if(user?.email != '')
            dashboardPage()
    }, [user])

    useEffect(() => {

    }, [tokenIsValid])

    useEffect(() => {
        if (successPay == true)
            setNeedUpdatePlan(false)
    }, [successPay])


    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (needUpdatePlan) {
        return <LandingPage
            successPay={successPay}
            onLoginClick={() => setNeedLogin(true)}
            onPurchaseClick={purchase}
            onloading={isLoading}
            user={user}
            onLogout={logout}
            onDashboard={dashboardPage}
        />;
    }

    if (dashboard) {
        if (user?.email)
            return <Dashboard user={user} onLogout={logout} onShop={updatePlan} />;
    }
    if (needLogin || tokenIsValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <AuthForm
                        onRegister={register}
                        onLogin={login}
                        isLoading={isLoading}
                        error={error}
                        resetPassIsValid={tokenIsValid}
                        onPasswordRequest={resetPass}
                        onResetPasswordConfirm={updatePassword}
                    />
                    <div className="text-center mt-4">
                        <button onClick={() => setNeedLogin(false)} className="text-sm text-blue-600 hover:underline">
                            Voltar para a página inicial
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    if (user == null) return <LandingPage
        successPay={successPay}
        onLoginClick={() => setNeedLogin(true)}
        onPurchaseClick={purchase}
        onloading={isLoading}
        user={user}
        onLogout={logout}
        onDashboard={dashboardPage} />;
}

// O componente App principal envolve tudo no AuthProvider
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;