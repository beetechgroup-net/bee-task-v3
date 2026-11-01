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
  Calendar,
  Sparkles,
  Info,
  PenTool,
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
  sectionType: 'FREE_TEXT' | 'FIXED_TEXT' | 'DATE' | 'TASK_LIST' | 'SIGNATURE' | 'AI_TEXT'
  defaultValue?: string
  dateFormat?: string
  aiPrompt?: string
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
  const [file, setFile] = useState<File | null>(null)
  const [sections, setSections] = useState<SectionFormItem[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddSection = () => {
    const nextIndex = sections.length + 1
    setSections((prev) => [
      ...prev,
      {
        sectionKey: `campo_${nextIndex}`,
        title: `Campo ${nextIndex}`,
        sectionType: 'FREE_TEXT',
        defaultValue: '',
        dateFormat: 'DD/MM/AAAA',
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
      if (scope === 'PROJECT' && projectId) {
        formData.append('projectId', String(projectId))
      }

      // Sanitizar seções com chave segura, valor padrão e formato de data
      const sanitizedSections = sections.map((s, idx) => ({
        sectionKey: s.sectionKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        title: s.title.trim() || s.sectionKey,
        sectionType: s.sectionType,
        defaultValue: s.defaultValue ? s.defaultValue.trim() : '',
        dateFormat: s.sectionType === 'DATE' ? (s.dateFormat || 'DD/MM/AAAA') : undefined,
        aiPrompt: s.sectionType === 'AI_TEXT' ? (s.aiPrompt?.trim() || undefined) : undefined,
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
                Envie seu arquivo Word e configure os campos dinâmicos, tipos e formatos.
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
              Descrição <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Modelo padrão exigido para prestação de contas mensal."
              className="w-full px-3.5 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
            />
          </div>

          {/* Dica de Tags Nativas */}
          <div className="p-3.5 rounded-2xl bg-brand/5 border border-brand/15 text-xs text-foreground/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p className="font-bold text-brand">Tags Nativas Automáticas Disponíveis no Word:</p>
              <p className="text-muted">
                Você pode utilizar diretamente as tags{' '}
                <code className="text-brand font-bold bg-brand/10 px-1 py-0.5 rounded">{'{{nome}}'}</code> (usuário logado),{' '}
                <code className="text-brand font-bold bg-brand/10 px-1 py-0.5 rounded">{'{{data_inicio}}'}</code> e{' '}
                <code className="text-brand font-bold bg-brand/10 px-1 py-0.5 rounded">{'{{data_fim}}'}</code> sem precisar cadastrar campos para elas. Para listagens de tarefas, cadastre uma seção do tipo <strong className="text-foreground">Listagem de Tarefas</strong> definindo a tag desejada.
              </p>
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

          {/* Construtor de Campos e Seções */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Campos e Seções do Relatório</h4>
                <p className="text-[11px] text-muted">
                  Crie tags que serão substituídas pelo Word. Escolha se o campo é texto livre, texto fixo, data (com formato personalizado) ou listagem de tarefas.
                </p>
              </div>
              {sections.length > 0 && (
                <span className="text-[11px] font-semibold text-muted bg-surface-raised px-2.5 py-1 rounded-xl border border-border-soft">
                  {sections.length} {sections.length === 1 ? 'campo' : 'campos'}
                </span>
              )}
            </div>

            {sections.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border-soft text-center space-y-2 bg-surface/40">
                <Sparkles className="w-6 h-6 text-muted mx-auto" />
                <p className="text-xs font-semibold text-foreground">Nenhum campo personalizado adicionado</p>
                <p className="text-[11px] text-muted max-w-md mx-auto">
                  Caso seu documento precise de variáveis como Gestor, Nome do Projeto, Data formatada, Resumo ou Lista de Tarefas, clique em <strong>Adicionar Campo / Seção</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-border-soft bg-surface-raised/40 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-brand flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        Tag no Word:{' '}
                        <code className="bg-surface px-1.5 py-0.5 rounded-md border border-border-soft text-foreground font-mono font-bold">
                          {`{{${section.sectionKey || 'tag'}}}`}
                        </code>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="p-1 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remover campo"
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
                          placeholder="ex: gestor ou periodo"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs font-mono text-foreground focus:outline-hidden focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-muted block mb-1">Nome / Rótulo</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleUpdateSection(idx, { title: e.target.value })}
                          placeholder="ex: Período de Vigência"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-muted block mb-1">Tipo de Campo</label>
                        <CustomSelect
                          size="sm"
                          value={section.sectionType}
                          onChange={(val) =>
                            handleUpdateSection(idx, {
                              sectionType: val as 'FREE_TEXT' | 'FIXED_TEXT' | 'DATE' | 'TASK_LIST' | 'SIGNATURE' | 'AI_TEXT',
                            })
                          }
                          options={[
                            { value: 'FREE_TEXT', label: 'Texto Livre (Preenchido na emissão)' },
                            { value: 'FIXED_TEXT', label: 'Texto Fixo (Pré-preenchido no cadastro)' },
                            { value: 'DATE', label: 'Data (Com formato personalizado)' },
                            { value: 'SIGNATURE', label: '✍️ Assinatura Digital (Assinatura do usuário)' },
                            { value: 'AI_TEXT', label: '✨ Resumo / Texto com IA (Ollama)' },
                            { value: 'TASK_LIST', label: 'Lista de Tarefas do Período' },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Configuração de Campo de Tipo IA */}
                    {section.sectionType === 'AI_TEXT' && (
                      <div className="pt-2 border-t border-border-soft/60 space-y-3 animate-in fade-in duration-150">
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-foreground/80 flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-purple-700 dark:text-purple-400">Geração Inteligente com IA Local (Ollama / Qwen)</p>
                            <p className="text-muted mt-0.5">
                              A IA lerá as tarefas do colaborador no período (título, descrição, categoria, projeto) e gerará o resumo conforme o prompt configurado abaixo. Na emissão do relatório, o usuário poderá clicar em <strong>"Gerar com IA"</strong> e editar o resultado antes de baixar o documento.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-muted block mb-1">
                            Instruções para a IA (Prompt personalizado)
                          </label>
                          <textarea
                            rows={3}
                            value={section.aiPrompt || ''}
                            onChange={(e) => handleUpdateSection(idx, { aiPrompt: e.target.value })}
                            placeholder="Ex.: Resuma as atividades realizadas pelo colaborador de forma clara, técnica e concisa, destacando as entregas principais. Responda em português sem introduções ou saudações."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-purple-500 font-mono shadow-xs resize-y"
                          />
                          <span className="text-[9px] text-muted block mt-0.5">
                            Deixe em branco para usar a instrução técnica padrão do sistema.
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-muted block mb-1">
                            Filtrar tarefas enviadas para a IA por Categoria (Opcional)
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
                      </div>
                    )}

                    {/* Configuração de Campo de Tipo ASSINATURA */}
                    {section.sectionType === 'SIGNATURE' && (
                      <div className="p-3 rounded-xl bg-brand/5 border border-brand/15 text-[11px] text-foreground/80 flex items-start gap-2.5 animate-in fade-in duration-150">
                        <PenTool className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-brand">Preenchimento Automático com Assinatura Digital</p>
                          <p className="text-muted mt-0.5">
                            O BeeTask buscará automaticamente a <strong>assinatura padrão</strong> cadastrada no perfil do usuário que gerar o relatório e inserirá a imagem no Word na tag <code className="text-brand font-mono font-bold">{`{{${section.sectionKey || 'assinatura'}}}`}</code>. Se o usuário não tiver assinatura cadastrada, o campo ficará em branco (não assina).
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Configuração de Campo de Tipo DATA */}
                    {section.sectionType === 'DATE' && (
                      <div className="pt-2 border-t border-border-soft/60 space-y-2 animate-in fade-in duration-150">
                        <label className="text-[10px] font-semibold text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-brand" />
                            Formato de Exibição da Data / Período
                          </span>
                          <span className="text-[9px] text-muted">Escolha a formatação para o Word</span>
                        </label>
                        <CustomSelect
                          size="sm"
                          value={section.dateFormat || 'DD/MM/AAAA'}
                          onChange={(val) => handleUpdateSection(idx, { dateFormat: String(val) })}
                          options={[
                            { value: 'DD/MM/AAAA', label: 'DD/MM/AAAA (ex: 31/10/2026)' },
                            { value: 'DD-MM-AAAA', label: 'DD-MM-AAAA (ex: 31-10-2026)' },
                            { value: 'AAAA-MM-DD', label: 'AAAA-MM-DD (ex: 2026-10-31)' },
                            { value: 'DD/MM/AAAA até DD/MM/AAAA', label: 'DD/MM/AAAA até DD/MM/AAAA (ex: 01/10/2026 até 31/10/2026)' },
                            { value: 'DD-MM-AAAA até DD-MM-AAAA', label: 'DD-MM-AAAA até DD-MM-AAAA (ex: 01-10-2026 até 31-10-2026)' },
                            { value: 'DD/MM/AAAA a DD/MM/AAAA', label: 'DD/MM/AAAA a DD/MM/AAAA (ex: 01/10/2026 a 31/10/2026)' },
                            { value: 'DD-MM-AAAA a DD-MM-AAAA', label: 'DD-MM-AAAA a DD-MM-AAAA (ex: 01-10-2026 a 31-10-2026)' },
                            { value: 'DD de Mês de AAAA', label: 'DD de Mês de AAAA (ex: 31 de Outubro de 2026)' },
                            { value: 'DD de Mês de AAAA até DD de Mês de AAAA', label: '01 de Outubro de 2026 até 31 de Outubro de 2026' },
                            { value: 'MM/AAAA', label: 'MM/AAAA (ex: 10/2026)' },
                            { value: 'Mês de AAAA', label: 'Mês de AAAA (ex: Outubro de 2026)' },
                            { value: 'DD/MM - DD/MM/AAAA', label: 'DD/MM - DD/MM/AAAA (ex: 01/10 - 31/10/2026)' },
                          ]}
                        />
                      </div>
                    )}

                    {/* Campo de Valor Pré-preenchido (Fixo ou Sugerido) */}
                    {(section.sectionType === 'FIXED_TEXT' || section.sectionType === 'FREE_TEXT') && (
                      <div className="pt-1 border-t border-border-soft/60 animate-in fade-in duration-150">
                        <label className="text-[10px] font-semibold text-muted block mb-1 flex items-center justify-between">
                          <span>
                            {section.sectionType === 'FIXED_TEXT'
                              ? 'Valor Fixo Pré-preenchido'
                              : 'Valor Padrão / Sugestão Inicial (Opcional)'}
                          </span>
                          <span className="text-[9px] text-brand font-medium">
                            {section.sectionType === 'FIXED_TEXT'
                              ? 'Sempre virá preenchido no relatório'
                              : 'Sugestão inicial editável'}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={section.defaultValue || ''}
                          onChange={(e) => handleUpdateSection(idx, { defaultValue: e.target.value })}
                          placeholder={
                            section.sectionType === 'FIXED_TEXT'
                              ? 'Ex.: Dr. Roberto Silva ou Nome do Projeto'
                              : 'Ex.: Deixar uma observação inicial...'
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand"
                        />
                      </div>
                    )}

                    {/* Configurações de Lista de Tarefas */}
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
            )}

            {/* Botão de Adicionar Campo / Seção embaixo */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddSection}
                className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-brand/35 hover:border-brand bg-brand/5 hover:bg-brand/10 text-brand text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Campo / Seção</span>
              </button>
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
