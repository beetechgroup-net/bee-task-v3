import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  StickyNote,
  Save,
  Check,
  AlertTriangle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  Undo,
  Redo,
  Copy,
  Trash2,
  Loader2,
  X,
} from 'lucide-react'
import { noteService, type UserNote } from '../services/noteService'

export const NotepadPage: React.FC = () => {
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialContent, setInitialContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ words: 0, characters: 0 })

  // Leave warning modal state
  const [showExitModal, setShowExitModal] = useState(false)
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Ref to always have the latest isDirty & editor content in callbacks
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  const initialContentRef = useRef(initialContent)
  initialContentRef.current = initialContent

  // Calculate stats from plain text
  const updateStats = useCallback(() => {
    if (!editorRef.current) return
    const text = editorRef.current.innerText || ''
    const cleanText = text.trim()
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0
    const characters = text.length
    setStats({ words, characters })
  }, [])

  // Load note from backend
  useEffect(() => {
    let mounted = true
    const fetchNote = async () => {
      try {
        setLoading(true)
        const note: UserNote = await noteService.getNote()
        if (!mounted) return
        const content = note?.content || ''
        setInitialContent(content)
        if (note?.updatedAt) {
          setLastSavedAt(new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
        if (editorRef.current) {
          editorRef.current.innerHTML = content
          updateStats()
        }
      } catch (err) {
        console.error('Erro ao carregar bloco de notas:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchNote()
    return () => {
      mounted = false
    }
  }, [updateStats])

  // Handle editor input
  const handleInput = () => {
    if (!editorRef.current) return
    const currentHtml = editorRef.current.innerHTML
    // Check if HTML represents empty (e.g. <br>, <p><br></p>, etc.)
    const text = editorRef.current.innerText || ''
    const isEmpty = text.trim() === '' && !editorRef.current.querySelector('img, hr')
    editorRef.current.setAttribute('data-empty', isEmpty ? 'true' : 'false')

    const dirty = currentHtml !== initialContentRef.current
    setIsDirty(dirty)
    updateStats()
  }

  // Formatting commands via document.execCommand
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command, false, value)
    handleInput()
  }

  // Custom code block insertion
  const handleFormatCodeBlock = () => {
    if (!editorRef.current) return
    editorRef.current.focus()
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = range.toString() || 'Código aqui...'
      const pre = document.createElement('pre')
      const code = document.createElement('code')
      code.textContent = selectedText
      pre.appendChild(code)
      range.deleteContents()
      range.insertNode(pre)

      // Move cursor after pre
      const newRange = document.createRange()
      newRange.setStartAfter(pre)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
      handleInput()
    }
  }

  // Save note to database
  const handleSave = async (showFeedback = true): Promise<boolean> => {
    if (!editorRef.current) return false
    const content = editorRef.current.innerHTML
    try {
      setSaving(true)
      const saved = await noteService.saveNote(content)
      setInitialContent(content)
      setIsDirty(false)
      const timeStr = saved.updatedAt
        ? new Date(saved.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setLastSavedAt(timeStr)
      return true
    } catch (err) {
      console.error('Falha ao salvar o bloco de notas:', err)
      if (showFeedback) {
        alert('Ocorreu um erro ao salvar o bloco de notas. Tente novamente.')
      }
      return false
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 1. Browser unload / reload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // 2. Browser Back / Forward warning (popstate)
  useEffect(() => {
    if (!isDirty) return

    window.history.pushState(null, '', window.location.pathname)

    const handlePopState = () => {
      if (isDirtyRef.current) {
        const confirmLeave = window.confirm(
          'Você possui alterações não salvas no bloco de notas. Deseja realmente sair sem salvar?'
        )
        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.pathname)
        } else {
          setIsDirty(false)
          window.history.back()
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty])

  // 3. In-App Navigation Interception
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isDirtyRef.current) return

      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (href && !href.startsWith('#') && href !== window.location.pathname) {
        e.preventDefault()
        e.stopPropagation()
        setPendingNavigationUrl(href)
        setShowExitModal(true)
      }
    }

    // Capture phase intercepts before React Router
    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [])

  // Exit Modal Actions
  const handleStayOnPage = () => {
    setShowExitModal(false)
    setPendingNavigationUrl(null)
  }

  const handleDiscardAndExit = () => {
    setIsDirty(false)
    setShowExitModal(false)
    if (pendingNavigationUrl) {
      navigate(pendingNavigationUrl)
    }
  }

  const handleSaveAndExit = async () => {
    const success = await handleSave(false)
    if (success) {
      setShowExitModal(false)
      if (pendingNavigationUrl) {
        navigate(pendingNavigationUrl)
      }
    }
  }

  // Copy plain text
  const handleCopyText = async () => {
    if (!editorRef.current) return
    const text = editorRef.current.innerText || ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  // Clear note
  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
      handleInput()
    }
    setShowClearConfirm(false)
  }

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100vh-6rem)]">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border-soft shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-brand/20 to-accent/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Bloco de Notas
              </h1>
              {isDirty ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Não salvo
                </span>
              ) : lastSavedAt ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Check className="w-3 h-3" />
                  Salvo às {lastSavedAt}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted mt-0.5">
              Seu espaço livre para rascunhos, tarefas rápidas e anotações formatadas.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyText}
            title="Copiar texto puro"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-soft bg-surface-raised hover:bg-surface-sunken text-xs font-semibold text-foreground transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            title="Limpar bloco de notas"
            className="p-2 rounded-xl border border-border-soft bg-surface-raised hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isDirty
                ? 'bg-brand hover:bg-brand-hover text-white shadow-brand/20 ring-2 ring-brand/30'
                : 'bg-brand/90 hover:bg-brand text-white shadow-brand/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar</span>
                <span className="hidden md:inline-block text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                  Ctrl+S
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Main Card */}
      <div className="flex-1 flex flex-col rounded-2xl bg-surface border border-border-soft shadow-xs overflow-hidden">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 sm:p-2.5 bg-surface-raised border-b border-border-soft select-none">
          {/* Headings */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-border-soft">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('formatBlock', '<p>')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground text-xs font-semibold px-2 cursor-pointer"
              title="Texto Normal"
            >
              Normal
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('formatBlock', '<h1>')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Título 1 (H1)"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('formatBlock', '<h2>')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Título 2 (H2)"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('formatBlock', '<h3>')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Título 3 (H3)"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-soft">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('bold')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Negrito (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('italic')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Itálico (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('underline')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Sublinhado (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('strikeThrough')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Tachado"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('hiliteColor', '#fef08a')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-amber-500 cursor-pointer"
              title="Destacar com marca-texto"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-soft">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('insertUnorderedList')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Lista com marcadores"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('insertOrderedList')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Lista numerada"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Blocks */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-soft">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('formatBlock', '<blockquote>')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Citação"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleFormatCodeBlock()
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Bloco de código"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('insertHorizontalRule')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Linha horizontal"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Alignments */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-soft">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('justifyLeft')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Alinhar à esquerda"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('justifyCenter')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Centralizar"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('justifyRight')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Alinhar à direita"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Utility Tools */}
          <div className="flex items-center gap-0.5 pl-1.5">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('removeFormat')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Limpar formatação"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('undo')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                execCmd('redo')
              }}
              className="p-1.5 rounded-lg hover:bg-surface-sunken text-muted hover:text-foreground cursor-pointer"
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-5 sm:p-7 relative overflow-y-auto cursor-text">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <p className="text-xs font-semibold">Carregando suas anotações...</p>
            </div>
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              data-placeholder="Escreva suas anotações aqui... Você pode usar a barra de ferramentas para formatar com títulos, negrito, listas e códigos."
              className="notepad-editor min-h-[460px] text-base focus:outline-none"
            />
          )}
        </div>

        {/* Footer Statistics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-raised border-t border-border-soft text-xs text-muted">
          <div className="flex items-center gap-3">
            <span>{stats.words} palavras</span>
            <span>•</span>
            <span>{stats.characters} caracteres</span>
            {isDirty && (
              <>
                <span>•</span>
                <span className="text-amber-500 font-medium">Modificações pendentes de salvamento</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-surface-sunken border border-border-soft font-mono">Ctrl+S</kbd> para salvar a qualquer momento</span>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={handleStayOnPage}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-raised shadow-2xl p-5 sm:p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">
                  Alterações não salvas
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Você alterou o texto do bloco de notas e ainda não salvou. Se sair agora, as novas modificações serão perdidas. Deseja sair sem salvar?
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleStayOnPage}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border-soft bg-surface hover:bg-surface-sunken text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                Continuar Editando
              </button>
              <button
                type="button"
                onClick={handleDiscardAndExit}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sair sem Salvar
              </button>
              <button
                type="button"
                onClick={handleSaveAndExit}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Salvar e Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Note Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface-raised shadow-2xl p-5 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                Limpar Bloco de Notas
              </h3>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted my-4">
              Tem certeza de que deseja apagar todo o conteúdo deste bloco de notas? Esta ação não poderá ser desfeita caso você salve em seguida.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-xl border border-border-soft bg-surface hover:bg-surface-sunken text-xs font-semibold text-foreground cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Sim, Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
