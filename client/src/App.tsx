// src/App.tsx

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function AppContent() {
    const { user, isLoading, error, successPay, login, register, logout, purchase } = useAuth();
    const [needLogin, setNeedLogin] = useState(false);
    const [needUpdatePlan, setNeedUpdatePlan] = useState(false);
    const [dashboard, setDashboard] = useState(false);
    useEffect(()=>{
    if(user?.email)
        dashboardPage()
    },[user,needUpdatePlan])
    
    useEffect(()=>{
        if(successPay)
            setNeedUpdatePlan(false)
    },[successPay])

    const updatePlan = () => {
        setNeedUpdatePlan(true)
        setDashboard(false)
    }
    const dashboardPage = () =>{
        setNeedUpdatePlan(false)
        setDashboard(true)
    }

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if(needUpdatePlan){
         return <LandingPage
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
            return <Dashboard user={user} onLogout={logout} onShop={updatePlan}/>;
    }
    if (needLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <AuthForm
                        onRegister={register}
                        onLogin={login}
                        isLoading={isLoading}
                        error={error}
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
   if (user == null ) return <LandingPage 
   onLoginClick={() => setNeedLogin(true)} 
   onPurchaseClick={purchase} 
   onloading={isLoading} 
   user={user} 
   onLogout={logout} 
   onDashboard={dashboardPage}  />;
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