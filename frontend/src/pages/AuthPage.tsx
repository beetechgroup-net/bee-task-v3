import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Input,
  Chip,
  ChipLabel,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@heroui/react'
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const initialEmail = searchParams.get('email') || ''
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Status & UI
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setSearchParams({ mode: newMode })
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const response = await login(email, password)
      if (!response.organizations || response.organizations.length === 0) {
        navigate('/organizations')
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar login. Verifique suas credenciais.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password)
      setSuccessMessage('Conta criada com sucesso! Faça login para acessar seu workspace.')
      setMode('login')
      setSearchParams({ mode: 'login' })
      setPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-main flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/15 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand/15 blur-[120px] rounded-full" />
      </div>

      {/* Top back navigation */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand transition-colors p-2 rounded-xl hover:bg-surface-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a página inicial
        </Link>
        <Chip className="bg-brand-soft text-brand text-xs font-semibold px-2 py-0.5 border border-brand/20">
          <ChipLabel>v3.0</ChipLabel>
        </Chip>
      </div>

      {/* Main Auth Card */}
      <Card className="w-full max-w-md bg-surface border border-border-soft rounded-3xl p-6 sm:p-8 shadow-panel relative z-10 transition-all">
        {/* Card Header & Brand */}
        <CardHeader className="p-0 pb-6 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-brand flex items-center justify-center shadow-md shadow-accent/20">
            <span className="text-2xl select-none">🐝</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main">
              Bee<span className="text-accent">Task</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              {mode === 'login'
                ? 'Acesse seu painel com segurança e foco'
                : 'Crie seu workspace corporativo em segundos'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="w-full grid grid-cols-2 p-1 bg-surface-muted rounded-xl border border-border-soft mt-3">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-surface text-brand shadow-xs border border-border-soft'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-surface text-brand shadow-xs border border-border-soft'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </CardHeader>

        {/* Feedback Alerts */}
        <CardContent className="p-0 space-y-5">
          {errorMessage && (
            <Alert className="bg-danger-soft border border-danger/30 text-danger rounded-xl p-3 text-xs flex items-start gap-2">
              <div className="flex-1">
                <AlertTitle className="font-bold">Atenção</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{errorMessage}</AlertDescription>
              </div>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-success-soft border border-success/30 text-success rounded-xl p-3 text-xs flex items-start gap-2">
              <div className="flex-1">
                <AlertTitle className="font-bold">Sucesso</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{successMessage}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Mode Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  E-mail Profissional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-main">
                    Senha de Acesso
                  </label>
                  <a
                    href="#esqueci"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Entre em contato com o administrador do seu Workspace para redefinir sua senha.')
                    }}
                    className="text-[11px] font-semibold text-brand hover:underline"
                  >
                    Esqueceu?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isDisabled={isLoading}
                className="w-full bg-brand hover:bg-brand-strong text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-brand/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Acessar Workspace
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  Crie uma Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  Confirme sua Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-sm text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isDisabled={isLoading}
                className="w-full bg-accent hover:bg-[#b45309] text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-accent/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Criar Minha Conta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {/* Footer Links & Info */}
        <CardFooter className="p-0 pt-6 mt-6 border-t border-border-soft flex flex-col items-center space-y-3 text-center">
          <p className="text-xs text-text-muted">
            {mode === 'login' ? (
              <>
                Ainda não tem conta no Bee Task?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-bold text-brand hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </>
            ) : (
              <>
                Já possui uma conta ativa?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-brand hover:underline"
                >
                  Fazer login
                </button>
              </>
            )}
          </p>

          <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
            <span>Autenticação segura com JWT Quarkus & MinIO S3</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
