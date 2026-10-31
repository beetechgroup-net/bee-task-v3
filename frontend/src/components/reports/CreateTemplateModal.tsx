import React, { useState } from 'react'
import {
  X,
  UploadCloud,
  Plus,
  Trash2,
  FileText,
  Tag,
  AlertCircle,
  Folder,
  UserCheck,
  Calendar,
  User,
} from 'lucide-react'
import { CustomSelect } from '../ui/Select'
import { reportService, type ReportTemplateOutput } from '../../services/reportService'
import type { Project, Category } from '../../types/task'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newTemplate: ReportTemplateOutput) => void
  orgId: number
  projects: Project[]
  categories: Category[]
}

interface SectionFormItem {
  sectionKey: string
  title: string
  sectionType: 'FREE_TEXT' | 'TASK_LIST'
  filterCategoryId?: number
  filterStatus?: 'ALL' | 'COMPLETED' | 'IN_PROGRESS'
  includeTime: boolean
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orgId,
  projects,
  categories,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scope, setScope] = useState<'ORGANIZATION' | 'PROJECT'>('ORGANIZATION')
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [managerName, setManagerName] = useState('')
  const [customProjectName, setCustomProjectName] = useState('')
  const [dateFormatPattern, setDateFormatPattern] = useState('DD/MM/AAAA até DD/MM/AAAA')
  const [file, setFile] = useState<File | null>(null)
  const [sections, setSections] = useState<SectionFormItem[]>([
    {
      sectionKey: 'resumo_andamento',
      title: 'Resumo do Andamento do Projeto',
      sectionType: 'FREE_TEXT',
      includeTime: false,
    },
    {
      sectionKey: 'atividades',
      title: 'Atividades e Entregas Desenvolvidas',
      sectionType: 'TASK_LIST',
      filterStatus: 'ALL',
      includeTime: true,
    },
    {
      sectionKey: 'reunioes',
      title: 'Reuniões e Alinhamentos Técnicos',
      sectionType: 'TASK_LIST',
      filterStatus: 'ALL',
      includeTime: true,
    },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        sectionKey: `secao_${prev.length + 1}`,
        title: `Nova Seção ${prev.length + 1}`,
        sectionType: 'FREE_TEXT',
        includeTime: false,
      },
    ])
  }

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateSection = (index: number, patch: Partial<SectionFormItem>) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (!selected.name.toLowerCase().endsWith('.docx')) {
        setError('O modelo deve ser um arquivo com extensão .docx (Word)')
        return
      }
      setFile(selected)
      setError(null)
      if (!name) {
        setName(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Informe o nome do modelo de relatório')
      return
    }
    if (!file) {
      setError('Faça o upload de um arquivo .docx para o modelo')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('scope', scope)
      formData.append('managerName', managerName.trim())
      formData.append('customProjectName', customProjectName.trim())
      formData.append('dateFormatPattern', dateFormatPattern)
      if (scope === 'PROJECT' && projectId) {
        formData.append('projectId', String(projectId))
      }

      // Limpar chaves das seções para serem seguras para {{tag}}
      const sanitizedSections = sections.map((s, idx) => ({
        sectionKey: s.sectionKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        title: s.title.trim() || s.sectionKey,
        sectionType: s.sectionType,
        filterCategoryId: s.filterCategoryId,
        filterStatus: s.filterStatus || 'ALL',
        includeTime: s.includeTime ?? true,
        orderIndex: idx,
      }))

      formData.append('sectionsJson', JSON.stringify(sanitizedSections))

      const created = await reportService.createTemplate(orgId, formData)
      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao salvar modelo de relatório')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-surface border border-border-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Cadastrar Modelo de Relatório (.DOCX)
              </h2>
              <p className="text-xs text-muted">
                Envie seu arquivo Word e configure as tags que serão preenchidas automaticamente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nome e Escopo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Nome do Modelo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Relatório Mensal de Atividades P&D"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Nível / Escopo</label>
              <CustomSelect
                value={scope}
                onChange={(val) => setScope(val as 'ORGANIZATION' | 'PROJECT')}
                options={[
                  { value: 'ORGANIZATION', label: 'Organização' },
                  { value: 'PROJECT', label: 'Projeto Específico' },
                ]}
              />
            </div>
          </div>

          {/* Se for escopo de Projeto, selecionar qual */}
          {scope === 'PROJECT' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-foreground">Projeto Vinculado</label>
              <CustomSelect
                value={projectId ?? 0}
                onChange={(val) => setProjectId(Number(val) === 0 ? undefined : Number(val))}
                placeholder="Selecione o Projeto..."
                leftIcon={<Folder className="w-3.5 h-3.5 text-brand" />}
                options={[
                  { value: 0, label: 'Selecione o Projeto...' },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                    color: p.color || '#0f766e',
                  })),
                ]}
              />
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Descrição ou Orientações <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Template padrão exigido para prestação de contas mensal."
              className="w-full px-3.5 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
            />
          </div>

          {/* Seção Padrão (Identificação, Gestão e Período) */}
          <div className="p-4 rounded-2xl border border-brand/25 bg-brand-soft/20 dark:bg-brand/10 space-y-3.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand" />
              <div>
                <h4 className="text-xs font-extrabold text-brand uppercase tracking-wider">
                  Seção Padrão: Identificação e Gestão
                </h4>
                <p className="text-[11px] text-muted">
                  Valores configurados no modelo que alimentam o cabeçalho e identificação no Word.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Colaborador / Usuário (Automático) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted" /> Nome do Colaborador
                  </span>
                  <code className="text-[10px] text-brand font-mono font-bold">{'{{nome}}'}</code>
                </label>
                <div className="px-3 py-2 rounded-xl border border-border-soft bg-surface/60 text-xs text-muted font-medium">
                  Preenchido automaticamente com o usuário logado
                </div>
              </div>

              {/* Nome do Gestor */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-muted" /> Nome do Gestor Responsável
                  </span>
                  <code className="text-[10px] text-brand font-mono font-bold">{'{{nome_gestor}}'}</code>
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Ex.: Dr. Roberto Silva"
                  className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
                />
              </div>

              {/* Nome do Projeto */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Folder className="w-3 h-3 text-muted" /> Nome do Projeto no Relatório
                  </span>
                  <code className="text-[10px] text-brand font-mono font-bold">{'{{nome_projeto}}'}</code>
                </label>
                <input
                  type="text"
                  value={customProjectName}
                  onChange={(e) => setCustomProjectName(e.target.value)}
                  placeholder="Ex.: Projeto BeeTask Inovação Tecnológica"
                  className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
                />
              </div>

              {/* Formato da Data do Período */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted" /> Formato do Período
                  </span>
                  <code className="text-[10px] text-brand font-mono font-bold">{'{{periodo}}'}</code>
                </label>
                <CustomSelect
                  size="sm"
                  value={dateFormatPattern}
                  onChange={(val) => setDateFormatPattern(String(val))}
                  options={[
                    { value: 'DD/MM/AAAA até DD/MM/AAAA', label: 'DD/MM/AAAA até DD/MM/AAAA (ex: 01/10/2026 até 31/10/2026)' },
                    { value: 'DD/MM/AAAA a DD/MM/AAAA', label: 'DD/MM/AAAA a DD/MM/AAAA (ex: 01/10/2026 a 31/10/2026)' },
                    { value: 'DD de Mês de AAAA até DD de Mês de AAAA', label: '01 de Outubro de 2026 até 31 de Outubro de 2026' },
                    { value: 'MM/AAAA', label: 'MM/AAAA (ex: 10/2026)' },
                    { value: 'Mês de AAAA', label: 'Mês de AAAA (ex: Outubro de 2026)' },
                    { value: 'DD/MM - DD/MM/AAAA', label: 'DD/MM - DD/MM/AAAA (ex: 01/10 - 31/10/2026)' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Upload de Arquivo .DOCX */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Arquivo Template .DOCX <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-muted font-normal">Formatos suportados: .docx</span>
            </label>

            <label className="relative border-2 border-dashed border-border-soft hover:border-brand/40 bg-surface-raised/60 hover:bg-surface-raised rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="sr-only"
              />
              <UploadCloud className="w-8 h-8 text-brand/70 mb-2" />
              {file ? (
                <div className="text-center">
                  <p className="text-xs font-bold text-brand">{file.name}</p>
                  <p className="text-[10px] text-muted">{(file.size / 1024).toFixed(1)} KB — Clique para substituir</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">Clique para selecionar seu arquivo Word</p>
                  <p className="text-[10px] text-muted">ou arraste e solte o arquivo .docx aqui</p>
                </div>
              )}
            </label>
          </div>

          {/* Construtor de Seções Dinâmicas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Seções e Tags Dinâmicas do Modelo</h4>
                <p className="text-[11px] text-muted">
                  Insira essas tags entre <code className="text-brand font-bold">{'{{nome_da_tag}}'}</code> no seu arquivo Word.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Seção</span>
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-border-soft bg-surface-raised/40 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-brand flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      Tag no Word: <code className="bg-surface px-1.5 py-0.5 rounded-md border border-border-soft text-foreground font-mono font-bold">
                        {`{{${section.sectionKey || 'tag'}}}`}
                      </code>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="p-1 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remover seção"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-muted block mb-1">Identificador da Tag</label>
                      <input
                        type="text"
                        value={section.sectionKey}
                        onChange={(e) =>
                          handleUpdateSection(idx, {
                            sectionKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                          })
                        }
                        placeholder="ex: resumo_projeto"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs font-mono text-foreground focus:outline-hidden focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-muted block mb-1">Título Amigável</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(idx, { title: e.target.value })}
                        placeholder="ex: Resumo do Andamento"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-muted block mb-1">Tipo de Seção</label>
                      <CustomSelect
                        size="sm"
                        value={section.sectionType}
                        onChange={(val) =>
                          handleUpdateSection(idx, { sectionType: val as 'FREE_TEXT' | 'TASK_LIST' })
                        }
                        options={[
                          { value: 'FREE_TEXT', label: 'Texto Livre (Digitado)' },
                          { value: 'TASK_LIST', label: 'Lista de Tarefas do Período' },
                        ]}
                      />
                    </div>
                  </div>

                  {section.sectionType === 'TASK_LIST' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border-soft/60 animate-in fade-in duration-150">
                      <div>
                        <label className="text-[10px] font-semibold text-muted block mb-1">
                          Filtrar por Categoria (Opcional)
                        </label>
                        <CustomSelect
                          size="sm"
                          value={section.filterCategoryId ?? 0}
                          onChange={(val) =>
                            handleUpdateSection(idx, {
                              filterCategoryId: Number(val) === 0 ? undefined : Number(val),
                            })
                          }
                          options={[
                            { value: 0, label: 'Todas as Categorias' },
                            ...categories.map((c) => ({
                              value: c.id,
                              label: c.name,
                              color: c.color,
                            })),
                          ]}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                          <input
                            type="checkbox"
                            checked={section.includeTime}
                            onChange={(e) =>
                              handleUpdateSection(idx, { includeTime: e.target.checked })
                            }
                            className="rounded border-border text-brand focus:ring-brand"
                          />
                          <span>Incluir duração/horas da tarefa</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-soft bg-surface-raised/40">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-teal-700 hover:from-brand-hover hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-brand/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Salvando Modelo...' : 'Salvar Modelo de Relatório'}
          </button>
        </div>
      </div>
    </div>
  )
}
