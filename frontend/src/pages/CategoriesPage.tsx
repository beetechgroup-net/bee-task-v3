import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Loader2, Pencil, Plus, Search, Tag, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { categoryService } from '../services/categoryService'
import type { Category, CategoryPayload } from '../types/category'
import { CategoryIcon } from '../components/CategoryIcon'
import { IconPicker } from '../components/IconPicker'

const DEFAULT_COLOR = '#7C3AED'
const DEFAULT_ICON = 'Tag'

export const CategoriesPage: React.FC = () => {
  const { activeOrg } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryPayload>({ name: '', color: DEFAULT_COLOR, icon: DEFAULT_ICON })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCategories = async () => {
    if (!activeOrg) return
    setIsLoading(true)
    try {
      const data = await categoryService.listByOrganization(activeOrg.id)
      setCategories(data)
    } catch (err) {
      console.error('Falha ao carregar categorias', err)
      setError('Não foi possível carregar as categorias.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [activeOrg])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', color: DEFAULT_COLOR, icon: DEFAULT_ICON })
    setError(null)
    setShowForm(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setForm({ name: category.name, color: category.color, icon: category.icon })
    setError(null)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrg) return
    setIsSubmitting(true)
    setError(null)
    try {
      if (editing) {
        const updated = await categoryService.update(activeOrg.id, editing.id, form)
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const created = await categoryService.create(activeOrg.id, form)
        setCategories((prev) => [...prev, created])
      }
      setShowForm(false)
    } catch (err) {
      console.error('Falha ao salvar categoria', err)
      setError(err instanceof Error ? err.message : 'Falha ao salvar categoria.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-2">
            <Tag size={14} />
            Workspace
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Categorias em <span className="text-brand">{activeOrg?.name ?? '...'}</span>
          </h1>
          <p className="mt-2 text-lg text-text-muted">
            Crie categorias para classificar e medir o tempo das suas tarefas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-surface border border-border-soft rounded-xl text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all w-56 font-medium"
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-dark active:scale-95"
          >
            <Plus size={18} />
            Nova Categoria
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[2rem] border border-border-soft bg-surface-muted" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((category, index) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                className="group relative flex items-center gap-4 rounded-[2rem] border border-border-soft bg-surface p-6 transition-all hover:shadow-xl hover:shadow-brand/5"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl shrink-0"
                  style={{ background: `${category.color}1a`, color: category.color }}
                >
                  <CategoryIcon iconName={category.icon} color={category.color} size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-text-main truncate">{category.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                    {category.icon} · {category.color}
                  </p>
                </div>
                <button
                  onClick={() => openEdit(category)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-bg text-text-muted transition-all hover:bg-brand hover:text-white"
                  title="Editar categoria"
                >
                  <Pencil size={16} />
                </button>
              </motion.div>
            ))}
            <button
              onClick={openCreate}
              className="flex min-h-[7rem] flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-border-soft bg-surface/50 p-6 text-center transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98] group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-bg text-text-muted transition-colors group-hover:bg-brand group-hover:text-white">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold text-text-main">Nova categoria</span>
            </button>
          </AnimatePresence>
        </section>
      )}

      {!isLoading && filtered.length === 0 && categories.length === 0 && (
        <div className="text-center py-16 bg-surface/50 rounded-[3rem] border-2 border-dashed border-border-soft">
          <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-muted/40">
            <Tag size={32} />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">Nenhuma categoria cadastrada</h3>
          <p className="text-text-muted max-w-xs mx-auto font-medium">
            Crie sua primeira categoria para começar a classificar tarefas e medir tempo.
          </p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-surface border border-border-soft rounded-[2.5rem] shadow-panel p-8 relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-brand transition-colors"
              >
                <X size={22} />
              </button>

              <div className="mb-8 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: `${form.color}1a`, color: form.color }}
                >
                  <CategoryIcon iconName={form.icon} color={form.color} size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-main">
                    {editing ? 'Editar categoria' : 'Nova categoria'}
                  </h2>
                  <p className="text-sm text-text-muted">
                    Defina nome, cor e ícone para identificar suas tarefas.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-text-main">Nome</span>
                    <input
                      autoFocus
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex.: Bug, Feature, Reunião"
                      className="block w-full h-12 px-4 bg-app-bg border border-border-soft rounded-xl text-sm font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-text-main">Cor</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="h-12 w-16 cursor-pointer rounded-xl border border-border-soft bg-app-bg"
                      />
                      <input
                        type="text"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="flex-1 h-12 px-4 bg-app-bg border border-border-soft rounded-xl text-sm font-mono outline-none focus:border-brand"
                      />
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-bold text-text-main">Ícone</span>
                  <IconPicker
                    value={form.icon}
                    onChange={(icon) => setForm({ ...form, icon })}
                    color={form.color}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3">
                    <X size={16} />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-3 text-sm font-bold text-text-muted hover:text-text-main"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !form.name.trim() || !form.icon}
                    className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-black text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-dark active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        {editing ? 'Salvar' : 'Criar categoria'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
