interface DashboardProps {
  user: { email: string };
  onLogout: () => void;
  
}
export function Dashboard({ user, onLogout }: DashboardProps) {
  if (!user || !user.email) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold">Please log in to access the dashboard</h1>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <nav className="nav container">
          <div className="nav-brand">
            <i className="fas fa-clipboard-list nav-logo-icon"></i>
            <span className="nav-logo-text">Briefing Organizer</span>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="index.html" className="nav-link">
                Início
              </a>
            </li>
            <li>
              <a href="index.html#features" className="nav-link">
                Recursos
              </a>
            </li>
            <li>
              <a href="index.html#pricing" className="nav-link">
                Planos
              </a>
            </li>
            <li>
              <a href="index.html#faqs" className="nav-link">
                FAQs
              </a>
            </li>
            <li>
              <a href="index.html#contact" className="nav-link">
                Contato
              </a>
            </li>
          </ul>
          <div className="nav-user">
            <span className="user-name">Pronto para continuar?</span>
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

                <form className="briefing-form">
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
                      placeholder="Enter your project title..."
                      required
                    />
                  </div>

                  {/* Client Name */}
                  <div className="form-group">
                    <label htmlFor="client-name" className="form-label">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      id="client-name"
                      name="client-name"
                      className="form-input"
                      placeholder="Enter client name..."
                      required
                    />
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
                      placeholder="Paste or type your project briefing here. Include all available information about the project requirements, objectives, timeline, budget, and any other relevant details..."
                      rows={12}
                      required
                    />
                    <div className="form-help">
                      <span className="form-help-text">
                        <i className="fas fa-info-circle"></i> Inclua objetivos, prazos, orçamento e requisitos para resultados mais precisos.


                      </span>
                    </div>
                  </div>

                  {/* File Upload */}
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
                    <button type="submit" className="btn btn-primary btn-lg">
                      <i className="fas fa-magic"></i> Analisar Briefing 
                    </button>
                    <button type="reset" className="btn btn-outline">
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

                {/* Empty State */}
                <div className="results-empty">
                  <div className="empty-icon">
                    <i className="fas fa-search-plus"></i>
                  </div>
                  <h3 className="empty-title">Preencha e Analise com IA</h3>
                  <p className="empty-description">
                    Complete o formulário, clique em “Analisar Briefing” e nossa IA vai organizar seu conteúdo, detectar lacunas e sugerir perguntas essenciais.
                  </p>
                  <div className="empty-features">
                    <div className="empty-feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Classificação automática</span>
                    </div>
                    <div className="empty-feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Identificação de lacunas</span>
                    </div>
                    <div className="empty-feature">
                      <i className="fas fa-check-circle"></i>
                      <span>Sugestões de perguntas</span>
                    </div>
                  </div>
                </div>

                {/* Loading State (hidden by default) */}
                <div className="results-loading" style={{ display: "none" }}>
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                  <h3 className="loading-title">Analyzing Your Briefing...</h3>
                  <p className="loading-description">
                    Our AI is processing your content and identifying key insights.
                  </p>
                </div>

                {/* Results Content (hidden by default) */}
                <div className="results-content" style={{ display: "none" }}>
                  {/* This would be populated with actual analysis results */}
                  <div className="result-section">
                    <h3 className="result-title">
                      <i className="fas fa-clipboard-check"></i> Structured Information
                    </h3>
                    <div className="result-placeholder">Analysis results will appear here...</div>
                  </div>

                  <div className="result-section">
                    <h3 className="result-title">
                      <i className="fas fa-exclamation-triangle"></i> Identified Gaps
                    </h3>
                    <div className="result-placeholder">Missing information will be highlighted here...</div>
                  </div>

                  <div className="result-section">
                    <h3 className="result-title">
                      <i className="fas fa-question-circle"></i> Suggested Questions
                    </h3>
                    <div className="result-placeholder">
                      Recommended questions for the client will appear here...
                    </div>
                  </div>
                </div>
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
