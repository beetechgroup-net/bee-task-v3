import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Upload,
  PenTool,
  Type,
  Trash2,
  Undo2,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { signatureService, type UserSignature } from '../../services/signatureService'

interface CreateSignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newSignature: UserSignature) => void
  userName?: string
  hasExistingSignatures: boolean
}

type Mode = 'upload' | 'draw' | 'template'

interface FontOption {
  id: string
  name: string
  fontFamily: string
  description: string
  previewSize: string
  canvasFontSize: number
  yOffsetRatio?: number
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    fontFamily: "'Great Vibes', cursive",
    description: 'Clássica e elegante com curvas suaves',
    previewSize: 'text-3xl',
    canvasFontSize: 52,
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    fontFamily: "'Dancing Script', cursive",
    description: 'Moderna, fluida e descontraída',
    previewSize: 'text-2xl',
    canvasFontSize: 46,
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush',
    fontFamily: "'Alex Brush', cursive",
    description: 'Caligrafia fina com traços delicados',
    previewSize: 'text-3xl',
    canvasFontSize: 54,
  },
  {
    id: 'caveat',
    name: 'Caveat',
    fontFamily: "'Caveat', cursive",
    description: 'Natural e espontânea como escrita à mão',
    previewSize: 'text-2xl',
    canvasFontSize: 48,
  },
  {
    id: 'satisfy',
    name: 'Satisfy',
    fontFamily: "'Satisfy', cursive",
    description: 'Formal, fluida e harmoniosa',
    previewSize: 'text-2xl',
    canvasFontSize: 44,
  },
  {
    id: 'allura',
    name: 'Allura',
    fontFamily: "'Allura', cursive",
    description: 'Sofisticada e estilizada para documentos',
    previewSize: 'text-3xl',
    canvasFontSize: 56,
  },
  {
    id: 'homemade-apple',
    name: 'Homemade Apple',
    fontFamily: "'Homemade Apple', cursive",
    description: 'Autêntica e rápida como uma rubrica real',
    previewSize: 'text-xl',
    canvasFontSize: 38,
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    fontFamily: "'Pacifico', cursive",
    description: 'Encorpada com traço uniforme e legível',
    previewSize: 'text-xl',
    canvasFontSize: 40,
  },
]

const INK_COLORS = [
  { id: 'black', label: 'Preto Clássico', color: '#0f172a' },
  { id: 'blue', label: 'Azul Caneta', color: '#1d4ed8' },
  { id: 'darkblue', label: 'Azul Noturno', color: '#0f2b5c' },
]

export const CreateSignatureModal: React.FC<CreateSignatureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userName = '',
  hasExistingSignatures,
}) => {
  const [mode, setMode] = useState<Mode>('draw')
  const [signatureName, setSignatureName] = useState('')
  const [isDefault, setIsDefault] = useState(!hasExistingSignatures)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 2. Draw canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawColor, setDrawColor] = useState('#0f172a')
  const [drawLineWidth, setDrawLineWidth] = useState(2.5)
  const [hasDrawnContent, setHasDrawnContent] = useState(false)
  const strokesHistoryRef = useRef<ImageData[]>([])

  // 3. Template state
  const [templateText, setTemplateText] = useState(userName || '')
  const [selectedFontId, setSelectedFontId] = useState<string>(FONT_OPTIONS[0].id)
  const [templateColor, setTemplateColor] = useState('#0f172a')

  // Reset or initialize state
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setMode('draw')
      setSignatureName('')
      setIsDefault(!hasExistingSignatures)
      setUploadFile(null)
      setUploadPreview(null)
      setTemplateText(userName || '')
      setSelectedFontId(FONT_OPTIONS[0].id)
      setHasDrawnContent(false)
      strokesHistoryRef.current = []

      // Give DOM time to mount canvas then init
      setTimeout(initCanvas, 50)
    }
  }, [isOpen, userName, hasExistingSignatures])

  // Canvas Initialization & Handlers
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set high DPI for smooth drawing
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)
    strokesHistoryRef.current = []
    setHasDrawnContent(false)
  }, [])

  useEffect(() => {
    if (mode === 'draw') {
      setTimeout(initCanvas, 30)
    }
  }, [mode, initCanvas])

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      strokesHistoryRef.current.push(data)
      setHasDrawnContent(true)
    } catch {
      // Ignored
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    saveCanvasState()

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = drawColor
    ctx.lineWidth = drawLineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setIsDrawing(true)
    canvas.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId)
      } catch {
        // Ignored
      }
    }
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    strokesHistoryRef.current = []
    setHasDrawnContent(false)
  }

  const handleUndoCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (strokesHistoryRef.current.length > 0) {
      const previous = strokesHistoryRef.current.pop()
      if (previous) {
        ctx.putImageData(previous, 0, 0)
        setHasDrawnContent(strokesHistoryRef.current.length > 0)
      }
    } else {
      handleClearCanvas()
    }
  }

  // Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('O arquivo deve ser uma imagem válida (PNG, JPG, WebP).')
      return
    }

    setError(null)
    setUploadFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setUploadPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Generate PNG Blob from drawn canvas
  const getDrawnCanvasBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) {
        reject(new Error('Canvas não disponível'))
        return
      }

      // Trim canvas bounding box to remove excess empty space
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Contexto do Canvas indisponível'))
        return
      }

      const width = canvas.width
      const height = canvas.height
      const imgData = ctx.getImageData(0, 0, width, height)
      const data = imgData.data

      let minX = width
      let minY = height
      let maxX = 0
      let maxY = 0

      // Find bounding box of drawn pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3]
          if (alpha > 10) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }

      if (maxX <= minX || maxY <= minY) {
        reject(new Error('Por favor, desenhe sua assinatura antes de salvar.'))
        return
      }

      // Add a small padding around the cropped signature
      const pad = 20
      minX = Math.max(0, minX - pad)
      minY = Math.max(0, minY - pad)
      maxX = Math.min(width, maxX + pad)
      maxY = Math.min(height, maxY + pad)

      const croppedWidth = maxX - minX
      const croppedHeight = maxY - minY

      const croppedCanvas = document.createElement('canvas')
      croppedCanvas.width = croppedWidth
      croppedCanvas.height = croppedHeight
      const croppedCtx = croppedCanvas.getContext('2d')

      if (!croppedCtx) {
        reject(new Error('Falha ao recortar assinatura'))
        return
      }

      croppedCtx.drawImage(
        canvas,
        minX,
        minY,
        croppedWidth,
        croppedHeight,
        0,
        0,
        croppedWidth,
        croppedHeight
      )

      croppedCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha ao gerar imagem da assinatura.'))
        },
        'image/png',
        1.0
      )
    })
  }

  // Generate PNG Blob from cursive template font
  const getTemplateBlob = async (): Promise<Blob> => {
    const text = templateText.trim()
    if (!text) {
      throw new Error('Informe o nome ou texto para gerar a assinatura.')
    }

    const selectedFont = FONT_OPTIONS.find((f) => f.id === selectedFontId) || FONT_OPTIONS[0]

    // Ensure fonts are loaded in document
    if (document.fonts) {
      try {
        await document.fonts.load(`bold ${selectedFont.canvasFontSize}px ${selectedFont.name}`)
        await document.fonts.ready
      } catch {
        // Fallback continues
      }
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Falha ao inicializar gerador de template')

    // Measure text
    const fontSize = selectedFont.canvasFontSize * 2 // 2x scale for sharp output
    ctx.font = `bold ${fontSize}px ${selectedFont.fontFamily}`
    const metrics = ctx.measureText(text)

    const textWidth = Math.ceil(metrics.width)
    const textHeight = Math.ceil(fontSize * 1.6)

    const padding = 30
    canvas.width = textWidth + padding * 2
    canvas.height = textHeight + padding * 2

    // Re-apply font settings after resize
    ctx.font = `bold ${fontSize}px ${selectedFont.fontFamily}`
    ctx.fillStyle = templateColor
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha ao renderizar assinatura em template.'))
        },
        'image/png',
        1.0
      )
    })
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const defaultName =
      mode === 'upload'
        ? 'Assinatura (Upload)'
        : mode === 'draw'
        ? 'Assinatura Desenhada'
        : `Assinatura (${FONT_OPTIONS.find((f) => f.id === selectedFontId)?.name || 'Template'})`

    const finalName = signatureName.trim() || defaultName

    setSubmitting(true)

    try {
      let imageBlob: Blob | File | null = null
      let sigType: 'UPLOAD' | 'DRAW' | 'TEMPLATE' = 'UPLOAD'

      if (mode === 'upload') {
        if (!uploadFile) {
          throw new Error('Por favor, selecione uma imagem para upload.')
        }
        imageBlob = uploadFile
        sigType = 'UPLOAD'
      } else if (mode === 'draw') {
        if (!hasDrawnContent) {
          throw new Error('Por favor, desenhe sua assinatura no quadro antes de salvar.')
        }
        imageBlob = await getDrawnCanvasBlob()
        sigType = 'DRAW'
      } else if (mode === 'template') {
        if (!templateText.trim()) {
          throw new Error('Digite seu nome para criar a assinatura pelo template.')
        }
        imageBlob = await getTemplateBlob()
        sigType = 'TEMPLATE'
      }

      if (!imageBlob) {
        throw new Error('Nenhuma imagem válida foi gerada.')
      }

      const formData = new FormData()
      formData.append('file', imageBlob, 'signature.png')
      formData.append('name', finalName)
      formData.append('signatureType', sigType)
      formData.append('isDefault', String(isDefault))

      const created = await signatureService.createSignature(formData)
      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar assinatura digital.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface rounded-3xl border border-border-soft shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between bg-surface-raised/40">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <PenTool className="w-4 h-4 text-brand" />
              Adicionar Assinatura Digital
            </h3>
            <p className="text-xs text-muted">
              Crie ou importe assinaturas para uso em relatórios e documentos oficiais.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-border-soft/60 bg-surface-raised/20">
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-surface-raised border border-border-soft">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'draw'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-sunken'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Desenhar</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('template')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'template'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-sunken'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fontes / Cursiva</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'upload'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-sunken'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Imagem</span>
            </button>
          </div>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: DRAW CANVAS */}
          {mode === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-foreground">
                  Desenhe sua assinatura abaixo usando o mouse ou touch:
                </span>

                <div className="flex items-center gap-2">
                  {/* Ink color picker */}
                  <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border-soft">
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setDrawColor(c.color)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          drawColor === c.color ? 'scale-125 border-brand ring-2 ring-brand/30' : 'border-border-soft'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>

                  {/* Stroke thickness */}
                  <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border-soft text-[10px] font-semibold text-muted">
                    {[
                      { label: 'Fina', width: 1.8 },
                      { label: 'Média', width: 2.8 },
                      { label: 'Grossa', width: 4.2 },
                    ].map((w) => (
                      <button
                        key={w.label}
                        type="button"
                        onClick={() => setDrawLineWidth(w.width)}
                        className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                          drawLineWidth === w.width
                            ? 'bg-brand text-white font-bold'
                            : 'hover:text-foreground'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <button
                    type="button"
                    onClick={handleUndoCanvas}
                    title="Desfazer traço"
                    className="p-1.5 rounded-xl border border-border-soft text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    title="Limpar quadro"
                    className="p-1.5 rounded-xl border border-border-soft text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Drawing Area */}
              <div className="relative rounded-2xl border-2 border-dashed border-border-soft bg-surface-raised/30 overflow-hidden shadow-inner group">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="w-full h-48 cursor-crosshair touch-none select-none"
                />

                {/* Baseline Guide */}
                <div className="absolute left-6 right-6 bottom-10 border-b border-dashed border-border-soft pointer-events-none opacity-60 flex justify-between">
                  <span className="text-[9px] font-mono text-muted -translate-y-3 select-none">
                    Linha base de assinatura
                  </span>
                  <span className="text-[9px] font-mono text-muted -translate-y-3 select-none">✕</span>
                </div>

                {!hasDrawnContent && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-muted/60 font-medium">
                      Faça seu traço aqui com o cursor ou toque
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATE FONTS */}
          {mode === 'template' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Nome para a Assinatura</span>
                  <span className="text-[10px] text-muted">
                    Digite como deseja que seu nome apareça
                  </span>
                </label>
                <input
                  type="text"
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  placeholder="Ex: Gabriel Santos Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface text-sm font-semibold text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                />
              </div>

              {/* Ink Color Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground">Cor da Tinta:</span>
                <div className="flex items-center gap-2">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTemplateColor(c.color)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        templateColor === c.color
                          ? 'border-brand bg-brand/10 text-brand shadow-xs'
                          : 'border-border-soft text-muted hover:text-foreground'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Options Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Escolha o estilo de caligrafia que mais lhe agrada:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {FONT_OPTIONS.map((font) => {
                    const isSelected = selectedFontId === font.id
                    return (
                      <div
                        key={font.id}
                        onClick={() => setSelectedFontId(font.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-brand bg-brand/10 ring-2 ring-brand/30 shadow-md'
                            : 'border-border-soft bg-surface-raised/40 hover:border-brand/40 hover:bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-foreground">{font.name}</span>
                          {isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted">{font.description}</span>
                          )}
                        </div>

                        {/* Signature Preview */}
                        <div className="py-2 px-3 rounded-xl bg-surface/70 border border-border-soft/60 flex items-center justify-center min-h-[56px] overflow-hidden">
                          <span
                            style={{
                              fontFamily: font.fontFamily,
                              color: templateColor,
                            }}
                            className={`${font.previewSize} truncate select-none leading-none`}
                          >
                            {templateText || 'Sua Assinatura'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD */}
          {mode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                  uploadPreview
                    ? 'border-brand/50 bg-brand/5'
                    : 'border-border-soft hover:border-brand bg-surface-raised/30'
                }`}
              >
                {uploadPreview ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="p-3 bg-white/10 dark:bg-black/20 rounded-xl border border-border-soft max-w-sm max-h-36 overflow-hidden flex items-center justify-center shadow-xs">
                      <img
                        src={uploadPreview}
                        alt="Prévia da assinatura"
                        className="max-h-28 object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadFile?.name}</span>
                      <span className="text-muted text-[10px]">
                        ({((uploadFile?.size || 0) / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <span className="text-[11px] text-muted hover:underline">
                      Clique para escolher outro arquivo
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Clique para selecionar uma imagem ou arraste para cá
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        PNG com fundo transparente é recomendado (máx. 5 MB).
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Common Details Fields */}
          <div className="pt-2 border-t border-border-soft space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Identificação / Nome da Assinatura</span>
                <span className="text-[10px] text-muted">Opcional</span>
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={
                  mode === 'draw'
                    ? 'Ex: Assinatura Principal'
                    : mode === 'template'
                    ? 'Ex: Rubrica Formal'
                    : 'Ex: Assinatura Digitalizada'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface text-xs font-semibold text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded-md border-border-soft text-brand focus:ring-brand"
              />
              <span className="text-xs font-semibold text-foreground">
                Definir como minha assinatura padrão
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-border-soft flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-border-soft text-muted hover:text-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando Assinatura...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Salvar Assinatura</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
