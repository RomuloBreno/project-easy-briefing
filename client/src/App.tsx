// src/App.tsx

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function AppContent() {
    const { user, isLoading, error, login, register, logout, purchase } = useAuth();
    const [needLogin, setNeedLogin] = useState(false);

    if (isLoading) {
        return <div>Carregando...</div>;
    }



    if (user) {
        return <Dashboard user={user} onLogout={logout} />;
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

    return <LandingPage onLoginClick={() => setNeedLogin(true)} onPurchaseClick={purchase} />;
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