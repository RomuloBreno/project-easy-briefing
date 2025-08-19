import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from "lucide-react";

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onPasswordRequest: (email: string) => Promise<void>;
  onResetPasswordConfirm: (password: string) => Promise<void>;
  isLoading: boolean;
  resetPassIsValid: boolean;
  error: string | null;
}

export function AuthForm({ resetPassIsValid, onPasswordRequest, onLogin, onRegister, isLoading, error, onResetPasswordConfirm }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isPassReset, setIsPassReset] = useState(false);
  const [isPassResetConfirm, setIsPassResetConfirm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleRegister = ()=>{
     setIsRegister(true)
     setIsPassReset(false)
     setIsLogin(false)
     setIsPassResetConfirm(false)
  }
   const handleLogin = ()=>{
     setIsLogin(true)
     setIsRegister(false)
     setIsPassReset(false)
     setIsPassResetConfirm(false)
  }
   const handleResetPass = ()=>{
     setIsPassReset(true)
     setIsRegister(false)
     setIsLogin(false)
     setIsPassResetConfirm(false)
    }
    const handleResetPassConfirm = ()=>{
     console.log("handleResetPass")
     setIsPassResetConfirm(true)
     setIsPassReset(false)
     setIsRegister(false)
     setIsLogin(false)
  }
  useEffect(()=>{if(resetPassIsValid==true){handleResetPassConfirm()}},[isRegister,isLogin,isPassReset, resetPassIsValid])
  return (
    <div className="w-full max-w-md mx-auto">
      {isRegister && 
        <RegisterForm
          onRegister={onRegister}
          isLoading={isLoading}
          error={error}
          switchLogin={() => handleLogin()}
        />}

       {isPassReset &&
        <PasswordRequestForm
            onPasswordRequest={onPasswordRequest} isLoading={isLoading}
          error={error}
          switchLogin={() => handleLogin()}
          />
        }
        {isPassResetConfirm &&
        <PasswordChangeForm
            onResetPasswordConfirm={onResetPasswordConfirm}
            isLoading={isLoading}
            error={error}
            switchLogin={() =>handleLogin()}
          />
        }
        {isLogin &&
          <LoginForm
            onLogin={onLogin}
            isLoading={isLoading}
            error={error}
            switchRegister={handleRegister}
            switchResetPass={() => handleResetPass()}
          />
        }
    </div>
  );
}

/* ------------------- FORM RESETPASS ------------------- */
function PasswordRequestForm({
  onPasswordRequest,
  isLoading,
  error,
  switchLogin
}: {
  onPasswordRequest: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  switchLogin: () => void; // Para voltar para a tela de login
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  /**
   * Valida o formato do e-mail.
   * @param value O valor do e-mail a ser validado.
   * @returns true se o e-mail for válido, false caso contrário.
   */
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError("O e-mail é obrigatório.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Digite um e-mail válido.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  /**
   * Lida com o envio do formulário.
   * @param e O evento do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      await onPasswordRequest(email);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full max-w-md mx-auto">
      <Header
        title="Esqueceu sua senha?"
        subtitle="Digite seu e-mail para receber um link de redefinição."
      />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="email"
          label="E-mail"
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          value={email}
          onChange={setEmail}
          onBlur={() => validateEmail(email)}
          error={emailError}
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading || !email || emailError !== null}
          className="w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
        </button>
      </form>

      <SwitchAuth
        text="Lembra sua senha?"
        actionText="Voltar para o Login"
        onClick={switchLogin}
      />
    </div>
  );
}


/* ------------------- FORM DE LOGIN ------------------- */
function LoginForm({
  onLogin,
  isLoading,
  error,
  switchRegister,
  switchResetPass
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  switchRegister: () => void;
  switchResetPass: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return setEmailError("O e-mail é obrigatório"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setEmailError("Digite um e-mail válido"), false;
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return setPasswordError("A senha é obrigatória"), false;
    if (value.length < 6)
      return setPasswordError("A senha deve ter pelo menos 6 caracteres"), false;
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email) && validatePassword(password)) {
      await onLogin(email, password);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <Header title="Bem-vindo de volta" subtitle="Entre na sua conta para continuar" />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="email"
          label="E-mail"
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          value={email}
          onChange={setEmail}
          onBlur={() => validateEmail(email)}
          error={emailError}
          disabled={isLoading}
          required
        />

        <PasswordField
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          onBlur={() => validatePassword(password)}
          error={passwordError}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? "Conectando..." : "Entrar"}
        </button>
      </form>

      <SwitchAuth text="Não tem uma conta?" actionText="Cadastre-se" onClick={switchRegister} />
      <SwitchAuth text="Esqueceu sua senha?" actionText="Refazer senha" onClick={switchResetPass} />
    </div>
  );
}

/* ------------------- FORM DE REGISTRO ------------------- */
function PasswordChangeForm({
  isLoading,
  error,
  switchLogin,
  onResetPasswordConfirm
}: {
  onResetPasswordConfirm: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  switchLogin: () => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordRepet, setPasswordRepet] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (value: string) => {
    if (!value) return setPasswordError("A senha é obrigatória"), false;
    if (value.length < 6)
      return setPasswordError("A senha deve ter pelo menos 6 caracteres"), false;
    if (password !== value)
      return setPasswordError("As senhas devem ser iguais"), false;
    setPasswordError("");
    return true;
  };
  const validatePasswordRepet = (value: string) => {
    setPasswordRepet(value)
    if (!value) return setPasswordError("A senha é obrigatória"), false;
    if (value.length < 6)
      return setPasswordError("A senha deve ter pelo menos 6 caracteres"), false;
    if (password !== value)
      return setPasswordError("As senhas devem ser iguais"), false;
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword(password) && validatePasswordRepet(passwordRepet)) {
      await onResetPasswordConfirm(password);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <Header title="Crie sua conta" subtitle="Preencha os dados para continuar" />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <PasswordField
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          onBlur={() => validatePassword(password)}
          error={passwordError}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          required
        />
        <PasswordField
          id="password-repet"
          label="Senha"
          value={passwordRepet}
          onChange={setPasswordRepet}
          onBlur={() => validatePasswordRepet(passwordRepet)}
          error={passwordError}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      <SwitchAuth text="Já possui uma conta?" actionText="Entrar" onClick={switchLogin} />
    </div>
  );
}
/* ------------------- FORM DE REGISTRO ------------------- */
function RegisterForm({
  onRegister,
  isLoading,
  error,
  switchLogin
}: {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  switchLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepet, setPasswordRepet] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateName = (value: string) => {
    if (!value) return setNameError("O nome é obrigatório"), false;
    if (value.length < 3) return setNameError("O nome deve ter pelo menos 3 letras"), false;
    setNameError("");
    return true;
  };

  const validateEmail = (value: string) => {
    if (!value) return setEmailError("O e-mail é obrigatório"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setEmailError("Digite um e-mail válido"), false;
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return setPasswordError("A senha é obrigatória"), false;
    if (value.length < 6)
      return setPasswordError("A senha deve ter pelo menos 6 caracteres"), false;
    if (password !== value)
      return setPasswordError("As senhas devem ser iguais"), false;
    setPasswordError("");
    return true;
  };
  const validatePasswordRepet = (value: string) => {
    setPasswordRepet(value)
    if (!value) return setPasswordError("A senha é obrigatória"), false;
    if (value.length < 6)
      return setPasswordError("A senha deve ter pelo menos 6 caracteres"), false;
    if (password !== value)
      return setPasswordError("As senhas devem ser iguais"), false;
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateName(name) && validateEmail(email) && validatePassword(password) && validatePasswordRepet(passwordRepet)) {
      await onRegister(name, email, password);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <Header title="Crie sua conta" subtitle="Preencha os dados para continuar" />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="name"
          label="Nome"
          icon={<User className="h-5 w-5 text-gray-400" />}
          value={name}
          onChange={setName}
          onBlur={() => validateName(name)}
          error={nameError}
          disabled={isLoading}
          required
        />

        <InputField
          id="email"
          label="E-mail"
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          value={email}
          onChange={setEmail}
          onBlur={() => validateEmail(email)}
          error={emailError}
          disabled={isLoading}
          required
        />

        <PasswordField
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          onBlur={() => validatePassword(password)}
          error={passwordError}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          required
        />
        <PasswordField
          id="password-repet"
          label="Senha"
          value={passwordRepet}
          onChange={setPasswordRepet}
          onBlur={() => validatePasswordRepet(passwordRepet)}
          error={passwordError}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading || !email || !password || !name}
          className="w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <SwitchAuth text="Já possui uma conta?" actionText="Entrar" onClick={switchLogin} />
    </div>
  );
}

/* ------------------- COMPONENTES REUTILIZÁVEIS ------------------- */
function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
        <User className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
}

function InputField({
  id,
  label,
  icon,
  value,
  onChange,
  onBlur,
  error,
  disabled
}: any) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  showPassword,
  toggleShowPassword,
  disabled
}: any) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-500" />
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  );
}

function SwitchAuth({ text, actionText, onClick }: any) {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-600">
        {text}{" "}
        <button onClick={onClick} className="font-medium text-blue-600 hover:text-blue-500">
          {actionText}
        </button>
      </p>
    </div>
  );
}
