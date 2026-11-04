import React, { useState } from 'react'
import { Sparkles, Loader2, X, AlertCircle, Wand2, Lightbulb } from 'lucide-react'
import type { ParsedAiTask } from '../../types/task'
import { taskService } from '../../services/taskService'

interface CreateWithAiModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: number
  onSuccess: (parsedData: ParsedAiTask) => void
}

const EXAMPLE_PROMPTS = [
  'Corrigir bug na exportação de relatórios para PDF no projeto BeeTask categoria Bugfix para Gabriel',
  'Desenvolver tela de configurações de notificações no projeto Frontend, categoria Feature',
  'Reunião com cliente amanhã às 15h para alinhamento de escopo e prazos, categoria Reunião',
  'Configurar pipeline de CI/CD para deploy automático do backend, categoria DevOps',
]

export const CreateWithAiModal: React.FC<CreateWithAiModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  onSuccess,
}) => {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setError(null)
    try {
      const parsed = await taskService.parseTaskWithAi(organizationId, prompt.trim())
      onSuccess(parsed)
      setPrompt('')
      onClose()
    } catch (err: unknown) {
      console.error('Falha ao processar tarefa com IA:', err)
      const msg = err instanceof Error ? err.message : 'Não foi possível interpretar a tarefa com IA. Verifique se o serviço está ativo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExample = (text: string) => {
    setPrompt(text)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl border border-purple-500/30 bg-surface-raised shadow-2xl shadow-purple-500/10 z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-gradient-to-r from-purple-500/10 via-surface to-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner shadow-purple-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Criar Tarefa com IA</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Qwen Local
                </span>
              </div>
              <p className="text-xs text-muted">
                Descreva a demanda em linguagem natural e deixe a IA preencher todos os campos.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              O que precisa ser feito? <span className="text-purple-400">*</span>
            </label>
            <textarea
              autoFocus
              rows={4}
              value={prompt}
              disabled={loading}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Criar endpoint para autenticação com Google no backend Quarkus, vincular ao projeto BeeTask, categoria Backend e atribuir ao Gabriel..."
              className="w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-sm text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Prompt suggestions */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Exemplos rápidos:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectExample(ex)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-surface border border-border-soft hover:border-purple-500/40 text-muted hover:text-foreground transition-all hover:bg-purple-500/5 line-clamp-1"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Interpretando com IA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Gerar Tarefa ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
