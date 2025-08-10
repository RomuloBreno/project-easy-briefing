import React from 'react';
import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

interface User {
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo credentials for testing
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'password123';

  const handlerButtonClick = () => {
    setNeedLogin(!needLogin ? true : false);
  };
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo authentication logic
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setUser({ email });
      } else {
        throw new Error('Invalid email or password. Try demo@example.com / password123');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

 if(needLogin == false ) {
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
                <li><a href="#home" className="nav-link">Home</a></li>
                <li><a href="#features" className="nav-link">Features</a></li>
                <li><a href="#pricing" className="nav-link">Pricing</a></li>
                <li><a href="#faqs" className="nav-link">FAQs</a></li>
                <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>
            <button onClick={handlerButtonClick} className="btn btn-primary">Try for Free</button>
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
                        <h1 className="hero-title">Turn Disorganized Briefings into Organized Projects</h1>
                        <p className="hero-subtitle">
                            Our Automatic Briefing Organizer uses AI to structure information, detect gaps, 
                            and suggest questions — making every creative project start easier.
                        </p>
                        <div className="hero-buttons">
                            <a href="app.html" className="btn btn-primary btn-lg">Get Started Free</a>
                            <a href="#features" className="btn btn-outline">Learn More</a>
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
                    <h2 className="section-title">Powerful Features to Organize Your Briefings</h2>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-search-plus"></i>
                        </div>
                        <h3 className="feature-title">Automatic Text Analysis</h3>
                        <p className="feature-description">
                            Advanced AI algorithms automatically analyze and categorize your briefing content
                            for better organization and clarity.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 className="feature-title">Gap Detection</h3>
                        <p className="feature-description">
                            Instantly identify missing information and incomplete sections in your project briefs
                            to ensure nothing falls through the cracks.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-question-circle"></i>
                        </div>
                        <h3 className="feature-title">Question Suggestions</h3>
                        <p className="feature-description">
                            Get intelligent suggestions for questions to ask clients based on the type of project
                            and information already provided.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-cloud"></i>
                        </div>
                        <h3 className="feature-title">Platform Integration</h3>
                        <p className="feature-description">
                            Seamlessly integrate with Google Drive, Dropbox, and other storage platforms
                            for efficient file management.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-download"></i>
                        </div>
                        <h3 className="feature-title">Multi-format Export</h3>
                        <p className="feature-description">
                            Export your organized briefings to PDF, Word, or other formats for easy sharing
                            with team members and stakeholders.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-globe"></i>
                        </div>
                        <h3 className="feature-title">Multilingual Support</h3>
                        <p className="feature-description">
                            Work with briefings in multiple languages with our comprehensive
                            multilingual processing capabilities.
                        </p>
                    </div>
                </div>
            </div>
        </section>
        <section id="pricing" className="pricing">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Choose the Plan That Fits You Best</h2>
                </div>
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <div className="pricing-header">
                            <h3 className="pricing-title">Basic Plan</h3>
                            <p className="pricing-subtitle">Ideal for freelancers starting out</p>
                            <div className="pricing-price">
                                <span className="pricing-amount">R$5,50</span>
                                <span className="pricing-period">/month</span>
                            </div>
                        </div>
                        <ul className="pricing-features">
                            <li><i className="fas fa-check"></i> Text analysis</li>
                            <li><i className="fas fa-check"></i> Question suggestions</li>
                            <li><i className="fas fa-check"></i> Basic gap detection</li>
                            <li><i className="fas fa-check"></i> PDF export</li>
                        </ul>
                        <a href="app.html" className="btn btn-outline btn-full">Get Started</a>
                    </div>
                    
                    <div className="pricing-card pricing-card-popular">
                        <div className="pricing-badge">Most Popular</div>
                        <div className="pricing-header">
                            <h3 className="pricing-title">Professional Plan</h3>
                            <p className="pricing-subtitle">For agencies and creative teams</p>
                            <div className="pricing-price">
                                <span className="pricing-amount">$19,90</span>
                                <span className="pricing-period">/month</span>
                            </div>
                        </div>
                        <ul className="pricing-features">
                            <li><i className="fas fa-check"></i> Everything in Basic</li>
                            <li><i className="fas fa-check"></i> Google Drive integration</li>
                            <li><i className="fas fa-check"></i> Advanced PDF export</li>
                            <li><i className="fas fa-check"></i> Team collaboration</li>
                            <li><i className="fas fa-check"></i> Priority email support</li>
                        </ul>
                        <a href="app.html" className="btn btn-primary btn-full">Get Started</a>
                    </div>
                    
                    <div className="pricing-card">
                        <div className="pricing-header">
                            <h3 className="pricing-title">Enterprise Plan</h3>
                            <p className="pricing-subtitle">For large companies and teams</p>
                            <div className="pricing-price">
                                <span className="pricing-amount">$52</span>
                                <span className="pricing-period">/month</span>
                            </div>
                        </div>
                        <ul className="pricing-features">
                            <li><i className="fas fa-check"></i> Everything in Professional</li>
                            <li><i className="fas fa-check"></i> Priority support</li>
                            <li><i className="fas fa-check"></i> Personalized training</li>
                            <li><i className="fas fa-check"></i> Custom integrations</li>
                            <li><i className="fas fa-check"></i> Dedicated account manager</li>
                        </ul>
                        <a href="app.html" className="btn btn-outline btn-full">Get Started</a>
                    </div>
                </div>
            </div>
        </section>
        <section id="faqs" className="faqs">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                </div>
                <div className="faqs-grid">
                    <div className="faq-item">
                        <h3 className="faq-question">What is the Automatic Briefing Organizer?</h3>
                        <p className="faq-answer">
                            An AI-powered tool that structures disorganized briefings, identifies missing information, 
                            and suggests questions to complete the data, making project kickoffs more efficient and thorough.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">Can I try the service before subscribing?</h3>
                        <p className="faq-answer">
                            Yes, we offer a 7-day free trial with full access to all features so you can 
                            experience the benefits before making a commitment.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">What payment methods are accepted?</h3>
                        <p className="faq-answer">
                            We accept all major credit cards, PayPal, and bank transfers for annual subscriptions. 
                            All payments are processed securely through our trusted payment partners.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">Is my data secure and private?</h3>
                        <p className="faq-answer">
                            Absolutely. We use enterprise-grade encryption and follow strict data protection protocols. 
                            Your briefings and client information are never shared and are stored securely.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">Can I cancel my subscription anytime?</h3>
                        <p className="faq-answer">
                            Yes, you can cancel your subscription at any time. There are no cancellation fees, 
                            and you'll continue to have access until the end of your current billing period.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">Do you offer team and enterprise features?</h3>
                        <p className="faq-answer">
                            Yes, our Professional and Enterprise plans include team collaboration features, 
                            shared workspaces, and advanced administrative controls for larger organizations.
                        </p>
                    </div>
                </div>
            </div>
        </section>
        <section id="contact" className="contact">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Ready to Get Started?</h2>
                    <p className="section-subtitle">
                        Transform your briefing process today and never miss important project details again.
                    </p>
                </div>
                <div className="contact-content">
                    <a href="app.html" className="btn btn-primary btn-lg">Try for Free</a>
                    <p className="contact-note">No credit card required • 7-day free trial</p>
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
                        Turn disorganized briefings into organized projects with AI-powered analysis.
                    </p>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <h4 className="footer-title">Legal</h4>
                        <ul className="footer-list">
                            <li><a href="#" className="footer-link">Terms of Service</a></li>
                            <li><a href="#" className="footer-link">Privacy Policy</a></li>
                            <li><a href="#" className="footer-link">Support</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4 className="footer-title">Connect</h4>
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
        <LoginForm 
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
        />
        <div className="text-center mt-4">
          <button 
            onClick={handlerButtonClick} 
            className="text-sm text-blue-600 hover:underline"
          >
            {needLogin ? 'Back to Home' : 'Need to Login?'}
          </button>
        </div>
        
        {/* Demo Credentials Helper */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
}

export default App;
