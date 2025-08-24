// src/components/LandingPage.tsx

import React, { useEffect, useState } from 'react';
import ModalExample from './modal';
import {sendEmail } from "../api";
import MercadoPagoButton from './MpCheckout';
import { User } from '../types/user';
import ModalSendEmail from './modalSendEmail';

interface LandingPageProps {
    onLoginClick: () => void;
    onPurchaseClick: (plan: number) => void;
    onDashboard: () => void;
    onLogout: () => void;
    onloading:boolean;
    successPay:boolean|null;
    checkToken:boolean|null;
    user: User | null;
    error: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({checkToken, error, successPay, user, onLoginClick, onPurchaseClick, onloading, onLogout, onDashboard }) => {
        if (onloading) {
        return (
            <div className="text-center mt-10">
                <div className="loading-spinner"></div>
            </div>
        );
    }
    const [openModal, setOpenModal] = useState<boolean>()
    const [checkTokenParam, setCheckTokenParam] = useState<boolean | null>(false)
    const [modalPurchase, setmodalPurchase] = useState<boolean>()
    const [newPlanValue, setNewPlanValue] = useState<number>()

    const handleButtonPurchase = async (value:number|null) => {
        if(user?.isVerified == false){
            handleButtonNeedVerified
            setOpenModal(true)
        }
        if(value && user?.isVerified == true){
            setNewPlanValue(value)
            setOpenModal(false)
            onPurchaseClick(value)
            document.getElementById("mp")?.scrollIntoView({ behavior: "smooth" });
            setmodalPurchase(true)
        }
    }
    
    
    const handleButtonNeedVerified = async () => {
        setOpenModal(false)
    }
    const handleButtonNewEmail = async () => {
        setOpenModal(true)
        if(!user) return
        // sendEmail(user.email, user.name)
        sendEmail(user.email, user.name)
        setOpenModal(true)
    }
    const handleCloseModalCheckTokenEmail= async () => {
        setCheckTokenParam(false)
        setOpenModal(false)
        window.location.href ="/"
    }
    const openModalCheckTokenEmail = async () => {
        if(checkToken !== null && user?.isVerified==true){
            setCheckTokenParam(checkToken)
            setOpenModal(true)
        }else{
            setCheckTokenParam(false)
        }
    }

    useEffect(()=>{
        openModalCheckTokenEmail()
    },[user,openModal,modalPurchase])
    // Código JSX da landing page que você forneceu
    // Note que os botões de login e compra agora usam as props do componente.
    

    if(modalPurchase && user?.isVerified==true){
        return (
                <>
                <div id="mp" className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                {/* Renderiza o componente do botão do Mercado Pago */}
                <MercadoPagoButton user={user} newPlan={newPlanValue ||1} orderId="meu-pedido-123" />
                </div>
                </>
            )

    }
    return (
        <>
        {openModal && checkTokenParam && user?.isVerified==true && <ModalExample onClose={handleCloseModalCheckTokenEmail} openModalSuccessPay={true} message={"E-mail verificado com sucesso"}/>}
        {openModal && user?.isVerified==false && <ModalSendEmail onClose={handleButtonNeedVerified} onSend={handleButtonNewEmail} openModalSuccessPay={true} message={"Ative sua conta pelo email para ter direito a assinatura"}/>}   
            {/* {modalPurchase && <ModalExample onClose={handleButtonPurchaseFakeModal} openModalSuccessPay={true} message={"SIMULAÇÃO DE COMPRA"}/>} */}
           <div id="root"></div>
                <header className="header">
                    <nav className="nav container">
                        <div className="nav-brand">
                            <i className="fas fa-clipboard-list nav-logo-icon"></i>
                            <span className="nav-logo-text">IzyBriefing</span>
                        </div>
                        <ul className="nav-menu">
                            <li><a href="#home" className="nav-link">Início</a></li>
                            <li><a href="#features" className="nav-link">Recursos</a></li>
                            <li><a href="#pricing" className="nav-link">Planos</a></li>
                            <li><a href="#faqs" className="nav-link">FAQs</a></li>
                            <li><a href="#contact" className="nav-link">Contato</a></li>
                        </ul>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {user?.email ? 
                            <>
                            <button onClick={onDashboard} className="btn btn-primary">{ user?.plan === 0 ? "Free": user?.plan === 1 ? "Starter" : user?.plan === 2 ? "Pro" : 'Conheça Mais'}</button>
                            <button onClick={onDashboard} className="btn btn-outline btn-sm">{user?.name === '' ? "User":user?.name}</button>
                            <button onClick={onLogout} className="btn btn-outline btn-sm">Sair</button>
                            </>
                            :
                            <>
                            <button onClick={onLoginClick} className="btn btn-primary">Teste Grátis</button>
                            <button onClick={onLoginClick} className="btn btn-secondary">Entrar</button>
                            </>
                            }
                        </div>
                    </nav>
                </header>

                <main>
                    <section id="home" className="hero">
                        <div className="container">
                            <div className="hero-content">
                                <div className="hero-text fade-in">
                                    <h1 className="hero-title">Analises que mudam sua perspectiva</h1>
                                    <p className="hero-subtitle">
                                        IzyBriefing é um assistente inteligente que transforma a forma como você trabalha com briefings. Ele centraliza informações, analisa conteúdos de forma automática e identifica pontos de melhoria, lacunas e riscos. Com apoio de IA, sugere perguntas estratégicas e destaca cenários que exigem atenção imediata. Perfeito para agências, freelancers e empresas que buscam clareza, eficiência e decisões rápidas — mesmo em projetos complexos ou de alcance global, com múltiplos idiomas.
                                    </p>
                                    <div className="hero-buttons">
                                        <a onClick={onLoginClick} className="btn btn-primary btn-lg">Testar Grátis Agora</a>
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
                                <h2 className="section-title">Recursos Inteligentes do Analista de Briefing

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
                                        Analise seus briefings automaticamente com inteligência artificial para mais clareza e rapidez.



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
                                    <h3 className="feature-title">Prompts personalizados
                                    </h3>
                                    <p className="feature-description">
                                        Faça seus prompts personalizados para nossa IA avaliar com base nas suas informações


                                    </p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-download"></i>
                                    </div>
                                    <h3 className="feature-title">Amostragem de cenários não avaliados
                                    </h3>
                                    <p className="feature-description">
                                        Saiba quais cenários devem ser melhor avaliados com base no seu nicho e prompt


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
                                        <li><i className="fas fa-check"></i> Validações de oportunidades para novos projetos</li>
                                        <li><i className="fas fa-check"></i> Detecção de cenários que impactam</li>
                                        <li><i className="fas fa-check"></i> até 25 analises completas mensais</li>
                                    </ul>
                                   {user?.plan === 1 ? <span>Ja Possui</span> : <button onClick={user==null ? () => onLoginClick() :() => handleButtonPurchase(1)} className="btn btn-outline btn-full">Ativar Starter</button>}
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
                                        <ul className="pricing-features">
                                        <li><i className="fas fa-check"></i> Análises de IA por arquivo enviado e Texto</li>
                                        <li><i className="fas fa-check"></i> Possibilidade de envio de prompt de pedido para a IA</li>
                                        <li><i className="fas fa-check"></i> Sugestões avançadas de perguntas personalizada</li>
                                        <li><i className="fas fa-check"></i> Validações de oportunidades para novos projetos com foco no seu prompt</li>
                                        <li><i className="fas fa-check"></i> Detecção avançada de cenários e tecnicas baseado em seu nicho </li>
                                        <li><i className="fas fa-check"></i> até 60 analises completas mensais</li>
                                    </ul>
                                    </ul>
                                    {user?.plan === 2 ? <span>Ja Possui</span> :  <button  onClick={user==null ? () => onLoginClick() :() => handleButtonPurchase(2)} className="btn btn-outline btn-full">Liberar Pro</button>}
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
                                        <li><i className="fas fa-check"></i> Análises de IA por arquivo enviado e Texto</li>
                                        <li><i className="fas fa-check"></i> Possibilidade de envio de prompt de pedido para a IA</li>
                                        <li><i className="fas fa-check"></i> Sugestões avançadas de perguntas personalizada</li>
                                        <li><i className="fas fa-check"></i> Validações de oportunidades para novos projetos com foco no seu prompt</li>
                                        <li><i className="fas fa-check"></i> Detecção avançada de cenários e tecnicas baseado em seu nicho </li>
                                        <li><i className="fas fa-check"></i> Sem limitações em analises completas mensais</li>
                                        <li><i className="fas fa-check"></i> Downlaod da analise em PDF</li>
                                        <li><i className="fas fa-check"></i> Integração com Google Drive</li>
                                    </ul>
                                    {/* <button onClick={() => onPurchaseClick(3)} className="btn btn-outline btn-full">Clique para Começar</button> */}
                                    <span>Em breve</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="faqs" className="faqs">
                        <div className="container">
                            <div className="section-header">
                                <h2 className="section-title">Perguntas Frequentes sobre o Analista de Briefing

                                </h2>
                            </div>
                            <div className="faqs-grid">
                                <div className="faq-item">
                                    <h3 className="faq-question">O que é o Analista de Briefing?</h3>
                                    <p className="faq-answer">
                                        O Analista de Briefings é uma plataforma inteligente que revisa e organiza as informações dos seus briefings. Com o apoio da IA, ele identifica lacunas, sugere perguntas estratégicas e garante que cada briefing seja claro e completo — reduzindo retrabalho, atrasos e ruídos de comunicação.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Posso testar o Analista de Briefing antes de contratar?</h3>
                                    <p className="faq-answer">
                                        Sim! Você pode experimentar o plano gratuito fazendo sua conta, com limite de até 100 analises mensais. É a oportunidade ideal para conhecer como a ferramenta otimiza seus processos e melhora a qualidade dos seus projetos antes de investir.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Quais formas de pagamento vocês aceitam?</h3>
                                    <p className="faq-answer">
                                        Aceitamos, pix, cartões de crédito. Todos os pagamentos são processados com segurança de nível bancário e parceiros confiáveis como mercado pago.


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Meus dados e briefings são seguros?</h3>
                                    <p className="faq-answer">
                                        Com certeza. Não salvamos sua analise, ela vem direto da LLM para você. Usamos criptografia de nível empresarial e seguimos protocolos rigorosos de proteção de dados. Suas informações nunca são compartilhadas e ficam armazenadas de forma segura na nuvem.
                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">Posso cancelar minha assinatura quando quiser?</h3>
                                    <p className="faq-answer">
                                        Sim. Você pode cancelar a qualquer momento, o pagamento é feito e te garante 1 mês naquele plano, assim que acabar não cobramos novamente. Seu plano volta a ser free com uma nova possibilidade de contratação


                                    </p>
                                </div>
                                <div className="faq-item">
                                    <h3 className="faq-question">O Analista de Briefings é indicado para quem?</h3>
                                    <p className="faq-answer">
                                        Com certeza. Os planos Profissional e Enterprise permitem analises complexas com informações que você pode dar além do briefing. O Analista de Briefings é ideal para freelancers, agências criativas e empresas que precisam de organização e clareza em seus projetos.
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
                                <a onClick={user == null ? onLoginClick : onDashboard} className="btn btn-primary btn-lg">Teste Grátis</a>
                                <p className="contact-note">Sem cartão de crédito • Acesse os nossos recursos











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
                                    <span className="nav-logo-text">IzyBriefing</span>
                                </div>
                                <p className="footer-description">
                                    Transforme briefings desorganizados em projetos claros e ágeis com análise avançada.
                                     <br/>
                                     <br/>
                                    contato@izybriefing.com










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
                            <p className="footer-copyright">© 2025 Automatic IzyBriefing. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </>

    );
};