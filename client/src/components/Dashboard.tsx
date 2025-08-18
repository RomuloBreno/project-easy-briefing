import { useState } from "react";
import { ProfileForm } from "./ProfileForm";
import { sendBriefingToAiApi, sendEmail } from "../api";

interface DashboardProps {
  user: {
    nameUser: string;
    email: string;
    plan?: number;
    PlanId?: boolean;
    isVerified?:boolean
  } | null;
  onLogout: () => void;

}
export function Dashboard({ user, onLogout}: DashboardProps) {
  const [editProfile, setEditProfile] = useState(Boolean)
  if (!user || !user.email) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold">Please log in to access the dashboard</h1>
      </div>
    );
  }
  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (event: any) => {
    setSelectedOption(event?.target?.value);
  };
  const handleChangeProfile = () => {
    setEditProfile(!editProfile ? true: false);
  };

  const handleButtonNewEmail = async () =>{
      sendEmail(user.email, user.nameUser)
  }
      // ESTADOS DO FORMULÁRIO
    const [projectTitle, setProjectTitle] = useState('');
    const [promptManipulation, setPromptManipulation] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('');
    const [briefingContent, setBriefingContent] = useState('');

    // ESTADOS DA IA
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const isFreePlan = user?.plan === 0;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Combina todos os dados em um único objeto
        const briefingData = {
            projectTitle,
            promptManipulation: isFreePlan ? '' : promptManipulation,
            niche: isFreePlan ? '' : selectedNiche,
            briefingContent,
        };

        // Reseta o estado da resposta e erro
        setAiResponse(null);
        setAiError(null);
        setIsAiLoading(true);

        try {
            const response = await sendBriefingToAiApi(briefingData);
            setAiResponse(response);
        } catch (err: any) {
            setAiError(err.message);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    // Opcional: Função para limpar o formulário
    const handleFormReset = () => {
        setProjectTitle('');
        setPromptManipulation('');
        setSelectedNiche('');
        setBriefingContent('');
        setAiResponse(null);
        setAiError(null);
    };
   if (editProfile) {
        return <ProfileForm onCancel={() => handleChangeProfile()} />;
    }

  return (
    <>
      {/* Header */}
        { !user?.isVerified &&
                   <button onClick={handleButtonNewEmail} className="btn btn-outline" style={{
                        backgroundColor: '#ffffffff',
                        color: 'rgba(0, 0, 0, 1)',
                        border: '1px solid ##6f42c1',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        marginTop: '10px',
                        display: 'block', // Para que ele ocupe a largura total
                        fontSize: '14px'
                      }}>Faça a Autenticação por email e valide sua conta </button>
                   }
                   <br/>
      <header className="header">
        <nav className="nav container">
          <div className="nav-brand">
            <i className="fas fa-clipboard-list nav-logo-icon"></i>
            <span className="nav-logo-text">izyBriefing</span>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="index.html" className="nav-link">
                Início
              </a>
            </li>
          </ul>
          <div className="nav-user">
            <button onClick={handleChangeProfile} className="btn btn-sm" disabled>{user.nameUser || "Usuário"}</button>
            <button onClick={onLogout} className="btn btn-outline btn-sm">Sair</button>

          </div>
          <div className="nav-toggle">
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      {/* Main App Content */}
    <main className="app-main">
            <div className="container">
                <div className="app-header">
                    <h1 className="app-title fade-in">Briefing Organizer</h1>
                    <p className="app-subtitle fade-in">
                        Organize e analise seus briefings com Inteligência Artificial
                    </p>
                </div>

                <div className="app-content">
                    {/* Left Section: Input Form */}
                    <div className="app-section app-input fade-in">
                        <div className="section-card">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <i className="fas fa-edit"></i> Detalhes do Projeto
                                </h2>
                                <p className="section-subtitle">Insira as informações essenciais do seu briefing para análise inteligente.</p>
                            </div>

                            <form className="briefing-form" onSubmit={handleFormSubmit}>
                                {/* Project Title */}
                                <div className="form-group">
                                    <label htmlFor="project-title" className="form-label">
                                        Título do Projeto
                                    </label>
                                    <input
                                        type="text"
                                        id="project-title"
                                        name="project-title"
                                        className="form-input"
                                        placeholder="Coloque o titulo do seu projeto aqui..."
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Prompt Manipulation */}
                                <div className="form-group">
                                    <label htmlFor="prompt-manipulation" className="form-label">
                                        Seu Prompt de manipulação 
                                    </label>
                                    <textarea
                                        id="prompt-manipulation"
                                        name="prompt-manipulation"
                                        className="form-input"
                                        placeholder="Digite Seu Prompt de manipulação aqui..."
                                        value={promptManipulation}
                                        onChange={(e) => setPromptManipulation(e.target.value)}
                                        required
                                        disabled={isFreePlan}
                                    />
                                    {isFreePlan &&
                                        <span className="form-hint-pro">
                                            Assine o plano <strong>PRO</strong> para acessar mais recursos e análises avançadas!
                                        </span>
                                    }
                                </div>

                                {/* Niche Dropdown */}
                                <div className="form-group">
                                    <label htmlFor="plan-select" className="form-label">
                                        Selecione o Nicho
                                    </label>
                                    <select
                                        id="plan-select"
                                        name="plan-select"
                                        className="form-input"
                                        value={selectedNiche}
                                        onChange={handleSelectChange}
                                        required
                                        disabled={isFreePlan}
                                    >
                                        <option value="" disabled>Selecione uma opção...</option>
                                        <option value="Educação">Educaçao</option>
                                        <option value="Financeiro">Financeiro</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Audio/Visual">Audio/Visual</option>
                                    </select>
                                    {isFreePlan &&
                                        <span className="form-hint-pro">
                                            Assine o plano <strong>PRO</strong> para acessar mais recursos e análises avançadas!
                                        </span>
                                    }
                                </div>

                                {/* Briefing Content */}
                                <div className="form-group">
                                    <label htmlFor="briefing-content" className="form-label">
                                        Conteúdo do Briefing
                                    </label>
                                    <textarea
                                        id="briefing-content"
                                        name="briefing-content"
                                        className="form-textarea"
                                        value={briefingContent}
                                        onChange={(e) => setBriefingContent(e.target.value)}
                                        rows={12}
                                        required
                                    />
                                    <div className="form-help">
                                        <span className="form-help-text">
                                            <i className="fas fa-info-circle"></i> Inclua objetivos, prazos, orçamento e requisitos para resultados mais precisos.
                                        </span>
                                    </div>
                                </div>

                                {/* File Upload - Lógica mais avançada, deixada como está */}
                                <div className="form-group">
                                    <label htmlFor="file-upload" className="form-label">
                                        Arquivos Adicionais
                                    </label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            name="file-upload"
                                            className="file-input"
                                            accept=".txt,.doc,.docx,.pdf"
                                            multiple
                                        />
                                        <label htmlFor="file-upload" className="file-label">
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            <span className="file-text">
                                                <strong>Envie</strong> ou arraste arquivos
                                            </span>
                                            <span className="file-hint">TXT, DOC, DOCX, PDF up to 10MB</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg"
                                        disabled={isAiLoading}
                                    >
                                        {isAiLoading ? 'Analisando...' : 'Analisar Briefing'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline"
                                        onClick={handleFormReset}
                                    >
                                        <i className="fas fa-redo"></i> Limpar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Section: Analysis Results */}
                    <div className="app-section app-results">
                        <div className="section-card">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <i className="fas fa-chart-line"></i> Resultados da Análise
                                </h2>
                                <p className="section-subtitle">Acompanhe insights gerados automaticamente pela Inteligência Artificial:</p>
                            </div>

                            {/* Renderização Condicional do Conteúdo */}
                            {isAiLoading && (
                                <div className="results-loading">
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                    </div>
                                    <h3 className="loading-title">Analisando seu Briefing...</h3>
                                    <p className="loading-description">
                                        Nossa IA está processando seu conteúdo e identificando insights chave.
                                    </p>
                                </div>
                            )}

                            {aiError && (
                                <div className="results-content">
                                    <div className="result-section">
                                        <h3 className="result-title">Erro na Análise</h3>
                                        <p className="text-red-500">{aiError}</p>
                                    </div>
                                </div>
                            )}
                            
                            {aiResponse && !isAiLoading && (
                                <div className="results-content">
                                    <div className="result-section">
                                        <h3 className="result-title">
                                            <i className="fas fa-clipboard-check"></i> Análise Completa
                                        </h3>
                                        <div className="result-placeholder" dangerouslySetInnerHTML={{ __html: aiResponse }} />
                                    </div>
                                </div>
                            )}

                            {!isAiLoading && !aiResponse && !aiError && (
                                <div className="results-empty">
                                    <div className="empty-icon">
                                        <i className="fas fa-search-plus"></i>
                                    </div>
                                    <h3 className="empty-title">Preencha e Analise com IA</h3>
                                    <p className="empty-description">
                                        Complete o formulário, clique em “Analisar Briefing” e nossa IA vai organizar seu conteúdo, detectar lacunas e sugerir perguntas essenciais.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>

      {/* Fixed Footer */}
      <footer className="app-footer">
        <div className="container">
          <p className="app-footer-text">
            Prototype • Made with{" "}
            <i className="fas fa-heart" style={{ color: "#e74c3c" }}></i> — Briefing Organizer
          </p>
        </div>
      </footer>
    </>
  );
}
