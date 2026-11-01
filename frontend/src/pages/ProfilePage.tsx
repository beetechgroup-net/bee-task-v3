import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  LogOut,
  ExternalLink,
  Loader2,
  Target,
  CheckCircle2,
  Save,
  Sparkles,
  Camera,
  Edit2,
  AlertCircle,
  X,
  Check,
  PenTool,
  Star,
  Trash2,
  Plus,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { taskService } from '../services/taskService'
import { authService } from '../services/authService'
import { signatureService, type UserSignature } from '../services/signatureService'
import { CreateSignatureModal } from '../components/profile/CreateSignatureModal'
import type { Task } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman, formatSecondsToTimer } from '../lib/timeUtils'
import { CustomSelect } from '../components/ui/Select'
import {
  getUserWorkGoal,
  saveUserWorkGoal,
  type WorkGoal,
  type WorkGoalPeriod,
} from '../lib/userGoals'

export const ProfilePage: React.FC = () => {
  const { user, activeOrg, setActiveOrg, logout, updateUser, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoSuccess, setPhotoSuccess] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // Name edit state
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name)
    }
  }, [user?.name])

  // Workload & Goal State (Global)
  const [goalPeriod, setGoalPeriod] = useState<WorkGoalPeriod>('DAILY')
  const [goalHours, setGoalHours] = useState<number>(8)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Signatures state
  const [signatures, setSignatures] = useState<UserSignature[]>([])
  const [loadingSignatures, setLoadingSignatures] = useState(true)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [signatureActionLoading, setSignatureActionLoading] = useState<number | null>(null)
  const [signatureSuccessMsg, setSignatureSuccessMsg] = useState<string | null>(null)
  const [signatureErrorMsg, setSignatureErrorMsg] = useState<string | null>(null)

  const loadSignatures = async () => {
    try {
      setLoadingSignatures(true)
      const data = await signatureService.listSignatures()
      setSignatures(data || [])
    } catch (err: unknown) {
      console.error('Failed to load user signatures', err)
    } finally {
      setLoadingSignatures(false)
    }
  }

  useEffect(() => {
    loadSignatures()
  }, [])

  const handleSetDefaultSignature = async (id: number) => {
    try {
      setSignatureActionLoading(id)
      setSignatureErrorMsg(null)
      await signatureService.setDefault(id)
      setSignatures((prev) =>
        prev.map((s) => ({
          ...s,
          isDefault: s.id === id,
        }))
      )
      setSignatureSuccessMsg('Assinatura padrão atualizada!')
      setTimeout(() => setSignatureSuccessMsg(null), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao definir assinatura padrão.'
      setSignatureErrorMsg(msg)
      setTimeout(() => setSignatureErrorMsg(null), 4000)
    } finally {
      setSignatureActionLoading(null)
    }
  }

  const handleDeleteSignature = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta assinatura?')) return

    try {
      setSignatureActionLoading(id)
      setSignatureErrorMsg(null)
      await signatureService.deleteSignature(id)
      setSignatures((prev) => prev.filter((s) => s.id !== id))
      setSignatureSuccessMsg('Assinatura excluída com sucesso!')
      setTimeout(() => setSignatureSuccessMsg(null), 3000)
      // Reload in case another was promoted to default
      loadSignatures()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir assinatura.'
      setSignatureErrorMsg(msg)
      setTimeout(() => setSignatureErrorMsg(null), 4000)
    } finally {
      setSignatureActionLoading(null)
    }
  }

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('A imagem deve ter no máximo 5 MB.')
      setTimeout(() => setPhotoError(null), 5000)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Validate image mime type
    if (!file.type.startsWith('image/')) {
      setPhotoError('O arquivo selecionado deve ser uma imagem (JPG, PNG, WebP).')
      setTimeout(() => setPhotoError(null), 5000)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploadingPhoto(true)
    setPhotoError(null)

    try {
      const res = await authService.uploadPhoto(file)
      // Append timestamp query parameter to bust browser cache
      const freshPhotoUrl = res.photoUrl.includes('?')
        ? `${res.photoUrl}&t=${Date.now()}`
        : `${res.photoUrl}?t=${Date.now()}`
      updateUser({ photo: freshPhotoUrl })
      setPhotoSuccess(true)
      setTimeout(() => setPhotoSuccess(false), 4000)
      await refreshUser()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar a foto de perfil.'
      setPhotoError(msg)
      setTimeout(() => setPhotoError(null), 5000)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !nameInput.trim()) return

    setSavingName(true)
    setNameError(null)

    try {
      const res = await authService.updateProfile(nameInput.trim(), user.email)
      updateUser({ name: res.name })
      setNameSuccess(true)
      setEditingName(false)
      setTimeout(() => setNameSuccess(false), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar o nome.'
      setNameError(msg)
      setTimeout(() => setNameError(null), 5000)
    } finally {
      setSavingName(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      const g = getUserWorkGoal(user.email)
      setGoalPeriod(g.period)
      setGoalHours(g.targetHours)
    }
  }, [user?.email])

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    const validHours = Math.max(1, Math.min(720, Number(goalHours) || 8))
    const goal: WorkGoal = {
      period: goalPeriod,
      targetHours: validHours,
    }
    setGoalHours(validHours)
    saveUserWorkGoal(user.email, goal)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  useEffect(() => {
    if (!activeOrg?.id) return
    const loadMyTasks = async () => {
      try {
        const res = await taskService.listMyTasks({ organizationId: activeOrg.id })
        setMyTasks(res || [])
      } catch (err) {
        console.error('Failed to load my tasks', err)
      } finally {
        setLoading(false)
      }
    }
    loadMyTasks()
  }, [activeOrg?.id])

  const myTotalSeconds = myTasks.reduce(
    (acc, t) => acc + calculateTaskTotalSeconds(t),
    0
  )
  const myCompletedCount = myTasks.filter((t) => t.status === 'COMPLETED').length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand via-brand-strong to-accent bg-clip-text text-transparent mb-1">
          Meu Perfil & Conta
        </h1>
        <p className="text-xs text-muted">
          Gerencie seus dados pessoais, credenciais de acesso e visualize seu desempenho.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-6 sm:p-8 shadow-panel space-y-6">
        {/* Status Alerts */}
        {photoSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Foto de perfil atualizada com sucesso!</span>
          </div>
        )}

        {photoError && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-600/20 text-rose-300 text-xs font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{photoError}</span>
          </div>
        )}

        {nameSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Nome atualizado com sucesso!</span>
          </div>
        )}

        {nameError && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-600/20 text-rose-300 text-xs font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{nameError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-soft/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Camera Trigger */}
            <div className="relative group shrink-0">
              <div
                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-brand/50 bg-gradient-to-br from-brand to-teal-700 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-lg shadow-brand/20 cursor-pointer relative transition-transform duration-200 group-hover:scale-[1.02] ${
                  uploadingPhoto ? 'opacity-80 pointer-events-none' : ''
                }`}
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name || 'Avatar'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : user.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  user.email.charAt(0).toUpperCase()
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                  <Camera className="w-5 h-5 text-white drop-shadow" />
                  <span>Alterar</span>
                </div>

                {/* Uploading Overlay */}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-white gap-1 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-brand" />
                    <span className="text-[10px] font-bold">Enviando...</span>
                  </div>
                )}
              </div>

              {/* Camera Badge Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Alterar foto de perfil"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-brand hover:bg-brand-strong text-white shadow-md border-2 border-surface transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handlePhotoSelected}
                className="hidden"
              />
            </div>

            {/* User Details & Edit Form */}
            <div className="space-y-1.5 flex-1 min-w-0">
              {editingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="Seu nome"
                    className="px-3 py-1.5 rounded-xl border border-brand bg-surface text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={savingName || !nameInput.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-strong shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Salvar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(user.name || '')
                      setEditingName(false)
                    }}
                    className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">{user.name || 'Usuário'}</h2>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    title="Editar nome"
                    className="p-1 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-raised hover:bg-surface-sunken border border-border-soft text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-brand" />
                  <span>Trocar foto</span>
                </button>
                <span className="text-[10px] text-muted">
                  PNG, JPG, WebP ou GIF (máx. 5MB)
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-all hover:shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>

        {/* My Performance KPIs */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Meu Desempenho no Workspace Atual ({activeOrg?.name})
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs rounded-2xl bg-surface-raised/80 border border-border-soft">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Carregando estatísticas pessoais...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-5 rounded-2xl bg-surface-raised/80 border border-border-soft shadow-xs">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Tempo Registrado
                </span>
                <span className="text-lg font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                  {formatSecondsToTimer(myTotalSeconds)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  ({formatSecondsToHuman(myTotalSeconds)})
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-raised/80 border border-border-soft shadow-xs">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Tarefas Concluídas
                </span>
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                  {myCompletedCount} entregas
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  de {myTasks.length} atribuídas a você
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-raised/80 border border-border-soft shadow-xs">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Workspace Ativo
                </span>
                <span className="text-sm font-bold text-foreground truncate block">
                  {activeOrg?.name}
                </span>
                <span className="text-[10px] text-brand font-semibold block mt-0.5">
                  {activeOrg?.roles.join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Workload & Time Goals (Global) */}
        <div className="p-6 rounded-3xl border border-border-soft bg-surface-raised/60 backdrop-blur-md shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600/20 dark:border-amber-500/25 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Jornada de Trabalho & Metas de Tempo
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                    Global
                  </span>
                </h3>
                <p className="text-xs text-muted">
                  Defina o número de horas que você planeja trabalhar. Esse valor será usado para calcular sua barra de progresso no Dashboard.
                </p>
              </div>
            </div>

            {savedSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Meta salva com sucesso!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveGoal} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Period selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Frequência da Meta
                </label>
                <CustomSelect
                  value={goalPeriod}
                  onChange={(val) => {
                    const newPeriod = val as WorkGoalPeriod
                    setGoalPeriod(newPeriod)
                    // Auto-adjust default recommended hours when changing period
                    if (newPeriod === 'DAILY' && goalHours > 24) setGoalHours(8)
                    else if (newPeriod === 'WEEKLY' && (goalHours < 15 || goalHours > 80)) setGoalHours(40)
                    else if (newPeriod === 'MONTHLY' && goalHours < 60) setGoalHours(160)
                  }}
                  options={[
                    { value: 'DAILY', label: '☀️ Diária (por dia de trabalho)' },
                    { value: 'WEEKLY', label: '📅 Semanal (por semana)' },
                    { value: 'MONTHLY', label: '📆 Mensal (por mês)' },
                  ]}
                />
              </div>

              {/* Hours target */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Número de Horas Planejadas
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    step="0.5"
                    value={goalHours}
                    onChange={(e) => setGoalHours(Number(e.target.value))}
                    required
                    className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-border-soft bg-surface text-xs font-bold text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted pointer-events-none select-none">
                      horas
                    </span>
                    <div className="flex items-center gap-0.5 pl-1.5 border-l border-border-soft">
                      <button
                        type="button"
                        onClick={() => setGoalHours((prev) => Math.max(1, (Number(prev) || 0) - 1))}
                        className="w-6 h-6 rounded-md bg-surface-sunken hover:bg-surface-raised border border-border-soft text-muted hover:text-foreground text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Diminuir 1 hora"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalHours((prev) => Math.min(720, (Number(prev) || 0) + 1))}
                        className="w-6 h-6 rounded-md bg-surface-sunken hover:bg-surface-raised border border-border-soft text-muted hover:text-foreground text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Aumentar 1 hora"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-muted font-medium mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Atalhos rápidos:
              </span>
              {[
                { label: '4h / dia', period: 'DAILY' as WorkGoalPeriod, hours: 4 },
                { label: '6h / dia', period: 'DAILY' as WorkGoalPeriod, hours: 6 },
                { label: '8h / dia (Padrão CLT)', period: 'DAILY' as WorkGoalPeriod, hours: 8 },
                { label: '20h / semana (Meio período)', period: 'WEEKLY' as WorkGoalPeriod, hours: 20 },
                { label: '40h / semana (Integral)', period: 'WEEKLY' as WorkGoalPeriod, hours: 40 },
                { label: '160h / mês', period: 'MONTHLY' as WorkGoalPeriod, hours: 160 },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGoalPeriod(preset.period)
                    setGoalHours(preset.hours)
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    goalPeriod === preset.period && goalHours === preset.hours
                      ? 'bg-brand text-white border-brand shadow-xs'
                      : 'bg-surface hover:bg-surface-sunken text-muted hover:text-foreground border-border-soft'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Meta de Horas</span>
              </button>
            </div>
          </form>
        </div>

        {/* Assinaturas Digitais */}
        <div className="p-6 rounded-3xl border border-border-soft bg-surface-raised/60 backdrop-blur-md shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Minhas Assinaturas Digitais
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                    {signatures.length} {signatures.length === 1 ? 'cadastrada' : 'cadastradas'}
                  </span>
                </h3>
                <p className="text-xs text-muted">
                  Cadastre suas assinaturas (upload, desenho na tela ou fontes cursivas) para autenticação de relatórios e documentos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Assinatura</span>
            </button>
          </div>

          {signatureSuccessMsg && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{signatureSuccessMsg}</span>
            </div>
          )}

          {signatureErrorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{signatureErrorMsg}</span>
            </div>
          )}

          {loadingSignatures ? (
            <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs rounded-2xl bg-surface/40 border border-border-soft">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Carregando assinaturas digitais...</span>
            </div>
          ) : signatures.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border-soft bg-surface/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-sunken border border-border-soft text-muted flex items-center justify-center mx-auto">
                <PenTool className="w-5 h-5 text-muted" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Nenhuma assinatura cadastrada ainda
                </p>
                <p className="text-[11px] text-muted mt-0.5 max-w-sm mx-auto">
                  Você pode desenhar com o mouse, escolher modelos de caligrafia cursiva ou fazer upload da sua assinatura escaneada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/30 text-xs font-bold text-brand transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Minha Primeira Assinatura</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {signatures.map((sig) => (
                <div
                  key={sig.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 bg-surface/80 relative group shadow-xs ${
                    sig.isDefault
                      ? 'border-brand/60 ring-2 ring-brand/20 bg-brand/5'
                      : 'border-border-soft hover:border-brand/40'
                  }`}
                >
                  {/* Top Bar: Title & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate" title={sig.name}>
                        {sig.name}
                      </h4>
                      <span className="text-[10px] text-muted font-medium">
                        {sig.signatureType === 'DRAW'
                          ? '✍️ Desenhada'
                          : sig.signatureType === 'TEMPLATE'
                          ? '✨ Fonte Cursiva'
                          : '📁 Upload de Imagem'}
                      </span>
                    </div>

                    {sig.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Padrão</span>
                      </span>
                    )}
                  </div>

                  {/* Visual Signature Preview Box */}
                  <div className="h-24 px-3 py-2 rounded-xl bg-white/40 dark:bg-black/30 border border-border-soft/60 flex items-center justify-center overflow-hidden">
                    <img
                      src={sig.imageUrl}
                      alt={sig.name}
                      className="max-h-20 max-w-full object-contain filter drop-shadow-xs"
                    />
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border-soft/60 gap-2">
                    {!sig.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultSignature(sig.id)}
                        disabled={signatureActionLoading === sig.id}
                        className="text-[11px] font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {signatureActionLoading === sig.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )}
                        <span>Definir como padrão</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted italic">Assinatura ativa</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteSignature(sig.id)}
                      disabled={signatureActionLoading === sig.id}
                      title="Excluir assinatura"
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50 ml-auto"
                    >
                      {signatureActionLoading === sig.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Workspaces */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Meus Workspaces Cadastrados
            </h3>
            <button
              type="button"
              onClick={() => navigate('/organizations')}
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>Gerenciar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.organizations.map((org) => {
              const isCurrent = org.id === activeOrg?.id
              return (
                <div
                  key={org.id}
                  onClick={() => setActiveOrg(org.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-brand bg-brand/10 ring-1 ring-brand/40 shadow-xs'
                      : 'border-border-soft bg-surface-raised/80 hover:border-brand/40 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-surface-sunken text-muted border border-border-soft'
                      }`}
                    >
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{org.name}</h4>
                      <p className="text-[10px] text-muted">{org.roles.join(', ')}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-brand/20 text-brand text-[10px] font-bold">
                      Ativo
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Create Signature Modal */}
      <CreateSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSuccess={(newSig) => {
          setSignatures((prev) => {
            if (newSig.isDefault) {
              return [newSig, ...prev.map((s) => ({ ...s, isDefault: false }))]
            }
            return [...prev, newSig]
          })
          setSignatureSuccessMsg('Assinatura adicionada com sucesso!')
          setTimeout(() => setSignatureSuccessMsg(null), 3000)
        }}
        userName={user.name || ''}
        hasExistingSignatures={signatures.length > 0}
      />
    </div>
  )
}
