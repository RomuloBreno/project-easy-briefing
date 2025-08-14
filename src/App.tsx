import React, { useEffect } from 'react';
import { useState } from 'react';
import { AuthForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
}

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [needLogin, setNeedLogin] = useState(false);
    const [tokenIsValid, settokenIsValid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const API_URL = import.meta.env.API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        validateToken();
    }, [tokenIsValid]);

    useEffect(() => {
    }, [user]);
    // URL da API definida no .env

    const handlerButtonClick = () => {
        setNeedLogin(!needLogin ? true : false);
    };
    const validateToken = () => {
        if (!localStorage.getItem("token")) {
            settokenIsValid(false);
        } else {
            const token = localStorage.getItem("token");
            if (token) {
                setIsLoading(true);
                try {
                    axios.post(`${API_URL}/token`, { token }).then((response) => {
                        const user = response.data.token;
                        if (response.status !== 200) {
                            settokenIsValid(false);
                            // setNeedLogin(true);
                            setError('Faça login novamente');
                            setUser(null);
                        }
                        const userNew: User = {
                            id: user?.id?.toString() || '',
                            name: user?.nameUser || '',
                            email: user?.email || ''
                        };
                        setUser(userNew);
                    });
                    setIsLoading(false);
                } catch (err: any) {
                    setError('Faça login novamente');
                } finally {
                    setIsLoading(false);
                }
            }
        }



    }

    // Função para login
    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const user = response.data.token;
            const userNew: User = {
                id: user?.id?.toString() || '',
                name: user?.nameUser || '',
                email: user?.email || ''
            };
            setUser(userNew);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Função para registro
    const handleRegister = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/register`, { name, email, password });
            const user = response.data.token;
            localStorage.setItem("token", user.token); // Garantir que o token esteja presente
            const userNew: User = {
                id: user?.id?.toString() || '',
                name: user?.nameUser || '',
                email: user?.email || ''
            };
            setUser(userNew);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setError(null);
        localStorage.removeItem("token"); // Limpar o token do armazenamento local
        setNeedLogin(true); // Redefinir o estado de login
    };

    if (user !== null) {
        return <Dashboard user={user} onLogout={handleLogout} />;
    }

    if (needLogin == false) {
        return (
            <>

                <div id="root"></div>
                <header className="header">
                    <nav className="nav container">
                        <div className="nav-brand">
                            <i className="fas fa-clipboard-list nav-logo-icon"></i>
                            <span className="nav-logo-text">Briefing Organizer</span>
                        </div>
                        <ul className="nav-menu">
                            <li><a href="#home" className="nav-link">Início</a></li>
                            <li><a href="#features" className="nav-link">Recursos</a></li>
                            <li><a href="#pricing" className="nav-link">Planos</a></li>
                            <li><a href="#faqs" className="nav-link">FAQs</a></li>
                            <li><a href="#contact" className="nav-link">Contato</a></li>
                        </ul>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handlerButtonClick} className="btn btn-primary">Teste Grátis</button>
                            <button onClick={handlerButtonClick} className="btn btn-secondary">Entrar</button>
                        </div>
                        <div className="nav-toggle">
                            <i className="fas fa-bars"></i>
                        </div>
                    </nav>
                </header>

                <main>
                    <section id="home" className="hero">
                        <div className="container">
                            <div className="hero-content">
                                <div className="hero-text fade-in">
                                    <h1 className="hero-title">Organizador de Briefing</h1>
                                    <p className="hero-subtitle">
                                        O Organizador de Briefing ajuda você a reunir, organizar e agilizar briefings de forma simples. Ideal para agências, designers, freelancers e empresas, ele usa IA para identificar lacunas, sugerir perguntas e garantir projetos mais claros e rápidos.
                                    </p>
                                    <div className="hero-buttons">
                                        <a href="app.html" className="btn btn-primary btn-lg">Testar Grátis Agora</a>
                                        <a href="#features" className="btn btn-outline">Saiba Mais</a>
                                    </div>
                                </div>
                                <div className="hero-image slide-in-right">
                                    <div className="mockup">
                                        <div className="mockup-header">
                                            <div className="mockup-buttons">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                        <div className="mockup-content">
                                            <div className="mockup-form">
                                                <div className="mockup-input"></div>
                                                <div className="mockup-input"></div>
                                                <div className="mockup-textarea"></div>
                                                <div className="mockup-button"></div>
                                            </div>
                                            <div className="mockup-results">
                                                <div className="mockup-result-item"></div>
                                                <div className="mockup-result-item"></div>
                                                <div className="mockup-result-item"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="features" className="features">
                        <div className="container">
                            <div className="section-header">
                                <h2 className="section-title">Recursos Inteligentes do Organizador de Briefing

                                </h2>
                            </div>
                            <div className="features-grid">
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-search-plus"></i>
                                    </div>
                                    <h3 className="feature-title">Análise Automática com IA
                                    </h3>
                                    <p className="feature-description">
                                        Organize e categorize seus briefings automaticamente com inteligência artificial para mais clareza e rapidez.



                                    </p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <h3 className="feature-title">Detecção de Lacunas
                                    </h3>
                                    <p className="feature-description">
                                        Encontre informações faltantes e garanta que nenhum detalhe do projeto seja esquecido.



                                    </p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-question-circle"></i>
                                    </div>
                                    <h3 className="feature-title">Sugestões Inteligentes
                                    </h3>
                                    <p className="feature-description">
                                        Receba perguntas personalizadas para deixar seus briefings completos e eficientes.



                                    </p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-cloud"></i>
                                    </div>
                                    <h3 className="feature-title">Integração com Plataformas
                                    </h3>
                                    <p className="feature-description">
                                        Conecte-se ao Google Drive, Dropbox e outros para gerenciar arquivos na nuvem.


                                    </p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-download"></i>
                                    </div>
                                    <h3 className="feature-title">Exportação em Diversos Formatos
                                    </h3>
                                    <p className="feature-description">
                                        Baixe seus briefings prontos em PDF, Word e mais, prontos para compartilhar.


                                    </p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-globe"></i>
                                    </div>
                                    <h3 className="feature-title">Suporte Multilíngue
                                    </h3>
                                    <p className="feature-description">
                                        Crie e gerencie briefings em vários idiomas para projetos globais.


                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="pricing" className="pricing">
                        <div className="container">
                            <div className="section-header">
                                <h2 className="section-title">Escolha o plano perfeito para o seu ritmo de trabalho
                                </h2>
                            </div>
                            <div className="pricing-grid">
                                <div className="pricing-card">
                                    <div className="pricing-header">
                                        <h3 className="pricing-title">Plano Básico</h3>
                                        <p className="pricing-subtitle">Para Começar com Clareza</p>
                                        <div className="pricing-price">
                                            <span className="pricing-amount">R$ 9,90</span>
                                            <span className="pricing-period">/mês</span>
                                        </div>
                                    </div>
                                    <ul className="pricing-features">
                                        <li><i className="fas fa-check"></i> Análise automática de texto com IA</li>
                                        <li><i className="fas fa-check"></i> Sugestões de perguntas personalizada</li>
                                        <li><i className="fas fa-check"></i> Detecção básica de lacunas</li>
                                        <li><i className="fas fa-check"></i> Exportação em PDF</li>
                                    </ul>
                                    <a href="app.html" className="btn btn-outline btn-full">Clique para Começar</a>
                                </div>

                                <div className="pricing-card pricing-card-popular">
                                    <div className="pricing-badge">Most Popular</div>
                                    <div className="pricing-header">
                                        <h3 className="pricing-title">Plano Profissional</h3>
                                        <p className="pricing-subtitle">O Mais Popular</p>
                                        <div className="pricing-price">
                                            <span className="pricing-amount"><span style={{ fontSize: '80%' }}>R$</span> 29,90</span>
                                            <span className="pricing-period">/mês</span>
                                        </div>
                                    </div>
                                    <ul className="pricing-features">
                                        <li><i className="fas fa-check"></i> Integração com Google Drive, Dropbox e OneDrive</li>
                                        <li><i className="fas fa-check"></i> Exportação avançada (PDF, Word, Excel)</li>
                                        <li><i className="fas fa-check"></i> Colaboração em tempo real com equipes</li>
                                        <li><i className="fas fa-check"></i> Histórico e controle de versões</li>
                                        <li><i className="fas fa-check"></i> Armazenamento expandido (até 10 GB)</li>
                                    </ul>
                                    <a href="app.html" className="btn btn-primary btn-full">Clique para Começar</a>
                                </div>

                                <div className="pricing-card">
                                    <div className="pricing-header">
                                        <h3 className="pricing-title">Plano Enterprise</h3>
                                        <p className="pricing-subtitle">Potência Máxima para Grandes Empresas</p>
                                        <div className="pricing-price">
                                            <span className="pricing-amount">R$ 79,90</span>
                                            <span className="pricing-period">/mês</span>
                                        </div>
                                    </div>
                                    <ul className="pricing-features">
                                        <li><i className="fas fa-check"></i> Relatórios e dashboards avançados</li>
                                        <li><i className="fas fa-check"></i> Integrações customizadas com CRM e ERP</li>
                                        <li><i className="fas fa-check"></i> Armazenamento ilimitado</li>
                                        <li><i className="fas fa-check"></i> Gerente de conta dedicado</li>
                                        <li><i className="fas fa-check"></i> SLA com suporte 24/7</li>
                                    </ul>
                                    <a href="app.html" className="btn btn-outline btn-full">Clique para Começar</a>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="faqs" className="faqs">
                        <div className="container">
                            <div className="section-header">
                                <h2 className="section-title">Perguntas Frequentes sobre o Organizador de Briefing

                                </h2>
                            </div>
                            <div className="faqs-grid">
                                <div className="faq-item">
                                    <h3 className="faq-question">O que é o Organizador de Briefing?</h3>
                                    <p className="faq-answer">
                                        O Organizador de Briefing é uma plataforma online que centraliza e organiza todos os dados dos seus projetos. Com inteligência artificial, ele analisa informações, identifica lacunas e sugere perguntas, garantindo briefings claros e completos — essenciais para evitar retrabalho e atrasos.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Posso testar o Organizador de Briefing antes de contratar?</h3>
                                    <p className="faq-answer">
                                        Sim! Você pode experimentar gratuitamente por 7 dias com acesso total a todas as funcionalidades. É a oportunidade perfeita para ver como a ferramenta otimiza seu fluxo de trabalho antes de investir.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Quais formas de pagamento vocês aceitam?</h3>
                                    <p className="faq-answer">
                                        Aceitamos cartões de crédito, PayPal e transferência bancária para planos anuais. Todos os pagamentos são processados com segurança de nível bancário e parceiros confiáveis.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Meus dados e briefings são seguros?</h3>
                                    <p className="faq-answer">
                                        Com certeza. Usamos criptografia de nível empresarial e seguimos protocolos rigorosos de proteção de dados. Suas informações nunca são compartilhadas e ficam armazenadas de forma segura na nuvem.
                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Posso cancelar minha assinatura quando quiser?</h3>
                                    <p className="faq-answer">
                                        Sim. Você pode cancelar a qualquer momento, sem taxas extras. O acesso permanece ativo até o final do período já pago, garantindo que não perca seu trabalho ou dados.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">O Organizador de Briefing é bom para equipes?</h3>
                                    <p className="faq-answer">
                                        Sim. Os planos Profissional e Enterprise oferecem colaboração em tempo real, espaços de trabalho compartilhados, histórico de versões e controles administrativos — perfeitos para agências, equipes remotas e empresas de grande porte.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="contact" className="contact">
                        <div className="container">
                            <div className="section-header">
                                <h2 className="section-title">Organize Seus Briefings com Inteligência Artificial


                                </h2>
                                <p className="section-subtitle">
                                    Otimize seu processo, evite erros e acelere resultados usando o poder da IA.









                                </p>
                            </div>
                            <div className="contact-content">
                                <a href="app.html" className="btn btn-primary btn-lg">Teste Grátis por 7 Dias

                                </a>
                                <p className="contact-note">Sem cartão de crédito • Acesse todos os recursos











                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="footer">
                    <div className="container">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <div className="nav-brand">
                                    <i className="fas fa-clipboard-list nav-logo-icon"></i>
                                    <span className="nav-logo-text">Briefing Organizer</span>
                                </div>
                                <p className="footer-description">
                                    Transforme briefings desorganizados em projetos claros e ágeis com análise avançada.











                                </p>
                            </div>
                            <div className="footer-links">
                                <div className="footer-column">
                                    <h4 className="footer-title">Legal</h4>
                                    <ul className="footer-list">
                                        <li><a href="#" className="footer-link">Termos de Serviço</a></li>
                                        <li><a href="#" className="footer-link">Política de Privacidade</a></li>
                                        <li><a href="#" className="footer-link">Suporte</a></li>
                                    </ul>
                                </div>
                                <div className="footer-column">
                                    <h4 className="footer-title">Compartilhe</h4>
                                    <div className="footer-social">
                                        <a href="#" className="social-link" aria-label="Facebook">
                                            <i className="fab fa-facebook-f"></i>
                                        </a>
                                        <a href="#" className="social-link" aria-label="Twitter">
                                            <i className="fab fa-twitter"></i>
                                        </a>
                                        <a href="#" className="social-link" aria-label="LinkedIn">
                                            <i className="fab fa-linkedin-in"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p className="footer-copyright">© 2025 Automatic Briefing Organizer. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </>
        );
    } else {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <AuthForm
                        onRegister={handleRegister}
                        onLogin={handleLogin}
                        isLoading={isLoading}
                        error={error}
                    />
                    <div className="text-center mt-4">
                        <button
                            onClick={handlerButtonClick}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {needLogin ? 'Voltar para a página inicial' : 'Precisa fazer login?'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
