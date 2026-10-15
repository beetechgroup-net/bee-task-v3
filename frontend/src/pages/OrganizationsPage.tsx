import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Chip,
  ChipLabel,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@heroui/react'
import {
  Building2,
  Plus,
  ArrowRight,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { organizationService } from '../services/organizationService'

export const OrganizationsPage = () => {
  const { user, activeOrg, setActiveOrg, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [newOrgName, setNewOrgName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setIsCreating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const created = await organizationService.create(newOrgName.trim())
      await refreshUser()
      setActiveOrg(created.id)
      setSuccessMessage(`Workspace "${newOrgName}" criado com sucesso!`)
      setNewOrgName('')
      setTimeout(() => {
        navigate('/dashboard')
      }, 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar organização.'
      setErrorMessage(msg)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectOrg = (id: number) => {
    setActiveOrg(id)
    navigate('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Gestão de Workspaces Corporativos</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
          Seus Workspaces & Organizações
        </h1>
        <p className="text-sm text-text-muted max-w-2xl">
          Selecione uma organização ativa para acessar projetos, tarefas e métricas da equipe, 
          ou crie um novo workspace dedicado para sua empresa ou squad.
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <Alert className="bg-danger-soft border border-danger/30 text-danger rounded-2xl p-4 text-xs flex items-start gap-2">
          <div className="flex-1">
            <AlertTitle className="font-bold">Não foi possível criar</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{errorMessage}</AlertDescription>
          </div>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-success-soft border border-success/30 text-success rounded-2xl p-4 text-xs flex items-start gap-2">
          <div className="flex-1">
            <AlertTitle className="font-bold">Sucesso</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{successMessage}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Existing Organizations (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-main flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              Workspaces Vinculados ({user?.organizations?.length || 0})
            </h2>
          </div>

          {user?.organizations && user.organizations.length > 0 ? (
            <div className="space-y-3">
              {user.organizations.map((org) => {
                const isActive = org.id === activeOrg?.id
                return (
                  <Card
                    key={org.id}
                    className={`bg-surface border rounded-2xl p-4.5 transition-all flex items-center justify-between gap-4 cursor-pointer hover:shadow-panel ${
                      isActive
                        ? 'border-brand ring-2 ring-brand/10'
                        : 'border-border-soft hover:border-brand/40'
                    }`}
                    onClick={() => handleSelectOrg(org.id)}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                          isActive
                            ? 'bg-brand text-white shadow-brand/20'
                            : 'bg-surface-muted text-text-muted border border-border-soft'
                        }`}
                      >
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-main truncate">
                            {org.name}
                          </h3>
                          {isActive && (
                            <Chip className="bg-brand-soft text-brand text-[10px] font-bold px-2 py-0.2">
                              <ChipLabel>ATIVO</ChipLabel>
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 font-medium">
                          Papel: <span className="text-brand font-semibold">{org.roles.join(', ')}</span>
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectOrg(org.id)
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ${
                        isActive
                          ? 'bg-brand text-white shadow-sm'
                          : 'bg-surface-muted text-text-muted hover:text-text-main hover:bg-border-soft'
                      }`}
                    >
                      {isActive ? 'Acessar' : 'Selecionar'}
                    </Button>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-surface border border-border-soft rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">
                Nenhum workspace encontrado
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Você ainda não faz parte de nenhuma organização. Crie o seu primeiro workspace ao lado para começar!
              </p>
            </Card>
          )}
        </div>

        {/* Create New Workspace Form (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <Card className="bg-surface border border-border-soft rounded-3xl p-6 shadow-panel space-y-5">
            <CardHeader className="p-0 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center mb-1">
                <Plus className="w-5 h-5 text-accent" />
              </div>
              <CardTitle className="text-base font-bold text-text-main">
                Criar Novo Workspace
              </CardTitle>
              <CardDescription className="text-xs text-text-muted">
                Você será automaticamente configurado como <strong>OWNER</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-main">
                    Nome da Organização / Empresa
                  </label>
                  <Input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Ex: Minha Empresa Corp"
                    className="w-full px-3.5 py-2.5 bg-surface-muted/60 border border-border-soft rounded-xl text-xs text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  isDisabled={isCreating || !newOrgName.trim()}
                  className="w-full bg-accent hover:bg-[#b45309] text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Criar Organização
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <div className="pt-3 border-t border-border-soft flex items-center gap-2 text-[11px] text-text-muted font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Multi-tenancy com isolamento de dados</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
