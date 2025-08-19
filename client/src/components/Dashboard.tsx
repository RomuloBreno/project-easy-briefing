import { useEffect, useState } from "react";
import { ProfileForm } from "./ProfileForm";
import { BriefingDataWithFiles, sendBriefingToAiApi, sendEmail } from "../api";
import { AIResponse } from "../types/iaResponse";
import AnalysisResults from "./AIResponse";
import SpanUpdatePlan from "./SpanUpdatePlan";

interface DashboardProps {
    user: {
        name: string;
        email: string;
        plan?: number;
        planId?: boolean;
        isVerified?: boolean
    } | null;
    onLogout: () => void;
    onShop: () => void;

}

export function Dashboard({ user,  onLogout, onShop }: DashboardProps) {
    const [editProfile, setEditProfile] = useState(Boolean)
    if (!user || !user.email) {
        return (
            <div className="text-center mt-10">
                <h1 className="text-2xl font-bold">Please log in to access the dashboard</h1>
            </div>
        );
    }
    useEffect(()=>{

    },[user])


    const handleChangeProfile = () => {
        setEditProfile(!editProfile ? true : false);
    };

    const handleButtonNewEmail = async () => {
        sendEmail(user.email, user.name)
    }
    // Adicione a função de validação de arquivos aqui
    const validateUploadedFiles = (files: File[]) => {
        // 1. Limites de tamanho e quantidade
        const MAX_FILE_SIZE_MB = 10;
        const MAX_FILES = 5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

        if (files.length === 0) {
            throw new Error('Nenhum arquivo enviado. Por favor, anexe pelo menos um arquivo.');
        }

        if (files.length > MAX_FILES) {
            throw new Error(`Limite de arquivos excedido. O máximo permitido é ${MAX_FILES}.`);
        }

        // 2. Tipos de arquivo permitidos
        const allowedMimeTypes = [
            'text/plain', // .txt
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/pdf', // .pdf
        ];

        // 3. Verificação de cada arquivo individualmente
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                throw new Error(`O arquivo "${file.name}" excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB.`);
            }

            if (!allowedMimeTypes.includes(file.type)) {
                throw new Error(`O tipo de arquivo "${file.name}" não é suportado. Tipos permitidos: .txt, .doc, .docx, .pdf.`);
            }
        }
    };
    // ESTADOS DO FORMULÁRIO
    const [files, setFiles] = useState<File[]>([]);
    const [projectTitle, setProjectTitle] = useState('');
    const [promptManipulation, setPromptManipulation] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('');
    const [briefingContent, setBriefingContent] = useState('');
    const [inputOrFile, setInputOrFile] = useState(false);
    // ESTADOS DA IA
    const [aiResponse, setAiResponse] = useState<AIResponse|null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const isFreePlan = user?.plan === 0;
    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    //  const handleSelectChange = (event: any) => {
    //     setSelectedNiche(event?.target?.value);
    // };
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const base64Files = await Promise.all(
            files.map(file => readFileAsBase64(file))
        );
        // Combina todos os dados em um único objeto
        const briefingData: BriefingDataWithFiles = {
            email: user.email,
            projectTitle,
            promptManipulation: isFreePlan ? '' : promptManipulation,
            niche: isFreePlan ? '' : selectedNiche,
            content:undefined,
            file:undefined

        };
        
        if(briefingContent != ''){
           briefingData.content=briefingContent;
        }
        if(base64Files && files.length > 0){
           briefingData.file= isFreePlan ? [''] : base64Files  ;
        }

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
            <header className="header">
            {!user?.isVerified &&
                <button onClick={handleButtonNewEmail} className="btn btn-outline" style={{
                    backgroundColor: '#ffffffff',
                    color: 'rgba(0, 0, 0, 1)',
                    border: '1px solid ##6f42c1',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    marginTop: '10px',
                    display: 'block', // Para que ele ocupe a largura total
                    fontSize: '14px',
                    width:'100%'
                }}>Faça a Autenticação por email e valide sua conta </button>
            }
            <br />
                <nav className="nav container">
                    <div className="nav-brand">
                        <i className="fas fa-clipboard-list nav-logo-icon"></i>
                        <span className="nav-logo-text">izyBriefing</span>
                    </div>
                    <div className="nav-user">
                               {user?.email &&
                            <>
                            <button onClick={onShop} className="btn btn-primary">{ user?.plan == 0 ? "Free": user?.plan == 1 ? "Starter" : user?.plan == 2 ? "Pro" : 'Conheça Mais'}</button>
                            <button onClick={onLogout} className="btn btn-outline btn-sm">Sair</button>
                            </>
                            
                            }

                    </div>
                </nav>
            </header>

            {/* Main App Content */}
            <main className="app-main">
                <div className="container">
                    <div className="app-header">
                        <h1 className="app-title fade-in">IzyBriefing</h1>
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
                                            Título do Projeto*
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
                                            disabled={isFreePlan}
                                        />
                                        {isFreePlan &&
                                            <SpanUpdatePlan onShop={onShop}/>
                                        }
                                    </div>

                                    {/* Niche Dropdown */}
                                    {/* <div className="form-group">
                                        <label htmlFor="plan-select" className="form-label">
                                            Selecione o Nicho
                                        </label>
                                        <select
                                            id="plan-select"
                                            name="plan-select"
                                            className="form-input"
                                            value={selectedNiche}
                                            disabled={isFreePlan}
                                            onClick={()=>handleSelectChange(selectedNiche)}
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
                                    </div> */}

                                    
                                    { user?.planId && <div>
                                        <label htmlFor="content-select" className="form-label">
                                            <input
                                                type="checkbox"
                                                checked={inputOrFile}
                                                onChange={(e) => setInputOrFile(e.target.checked)}
                                                disabled={isFreePlan}
                                            />
                                              {inputOrFile?"Adicionar texto":"Adicionar arquivo"}
                                        </label><br />
                                       {isFreePlan &&
                                            <SpanUpdatePlan onShop={onShop}/>
                                        }
                                    </div>}
                                    {/* Briefing Content */}
                                    {inputOrFile ? 
                                        <div className="form-group">
                                            <div className="file-upload-area">
                                                <input style={{border:'#000'}}
                                                    required={inputOrFile? true : false}
                                                    placeholder="Arquivos Adicionais"
                                                    type="file"
                                                    id="file-upload"
                                                    name="file-upload"
                                                    className="form-input"
                                                    accept=".txt,.doc,.docx,.pdf"
                                                    multiple
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            if(files.length > 1) return
                                                            validateUploadedFiles(Array.from(e.target.files))
                                                            setFiles(Array.from(e.target.files));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor="file-upload" className="form-label">
                                                Arquivos Adicionais
                                            </label>
                                            </div>
                                        </div>
                                        :
                                    <div className="form-group">
                                        <label htmlFor="briefing-content" className="form-label">
                                            Conteúdo do Briefing
                                        </label>
                                        <textarea
                                            id="briefing-content"
                                            name="briefing-content"
                                            className="form-textarea"
                                            placeholder="Digite seu briefing"
                                            value={briefingContent}
                                            onChange={(e) => setBriefingContent(e.target.value)}
                                            rows={12}
                                            required={!inputOrFile? true : false}
                                        />
                                        <div className="form-help">
                                            <span className="form-help-text">
                                                <i className="fas fa-info-circle"></i> Inclua objetivos, prazos, orçamento e requisitos para resultados mais precisos.
                                            </span>
                                        </div>
                                    </div>
                                    }
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
                                  <AnalysisResults aiResponse={aiResponse}/>
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
                        <i className="fas fa-heart" style={{ color: "#e74c3c" }}></i> — IzyBriefing
                    </p>
                </div>
            </footer>
        </>
    );
}
