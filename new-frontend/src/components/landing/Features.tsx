import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Chip,
  ChipLabel,
} from "@heroui/react"
import {
  Clock,
  Building2,
  FolderKanban,
  BarChart3,
  ShieldCheck,
  Tag,
  Flame,
  FileSpreadsheet,
} from "lucide-react"

export const Features = () => {
  const features = [
    {
      title: "Time Tracking Nativo por Tarefa",
      description:
        "Inicie e pause o cronômetro com 1 clique diretamente na tarefa. Cada segundo é registrado em um histórico auditável (start, end, duration).",
      icon: <Clock className="w-6 h-6 text-brand" />,
      tag: "Core Backend",
      accentBg: "bg-brand-soft",
    },
    {
      title: "Workspaces Multi-Tenancy & RBAC",
      description:
        "Isole empresas, clientes e squads com segurança. Controle granular de permissões com papéis de Owner, Admin e Membro com fluxo de convites.",
      icon: <Building2 className="w-6 h-6 text-accent" />,
      tag: "Multi-Org",
      accentBg: "bg-accent-soft",
    },
    {
      title: "Projetos com Cores & Ícones Customizáveis",
      description:
        "Dê identidade própria a cada projeto. Defina paleta de cores, ícones representativos e descrições claras para acelerar a organização visual.",
      icon: <FolderKanban className="w-6 h-6 text-brand" />,
      tag: "Visual",
      accentBg: "bg-brand-soft",
    },
    {
      title: "Dashboards Executivos & Member Detail",
      description:
        "Métricas consolidadas de produtividade por período: horas por categoria, top tasks demoradas e visão de desempenho individual de cada colaborador.",
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      tag: "Analytics",
      accentBg: "bg-accent-soft",
    },
    {
      title: "Upload de Avatares com MinIO S3",
      description:
        "Armazenamento de alta performance para fotos de perfil e ativos integrado ao MinIO S3 compatível com nuvem e autenticação via JWT Quarkus.",
      icon: <ShieldCheck className="w-6 h-6 text-brand" />,
      tag: "Infra & Segurança",
      accentBg: "bg-brand-soft",
    },
    {
      title: "Categorias & Badges Coloridos",
      description:
        "Classifique tarefas como Bug, Feature, DevOps, Design ou Suporte. Filtre seu backlog instantaneamente com alta legibilidade.",
      icon: <Tag className="w-6 h-6 text-accent" />,
      tag: "Organização",
      accentBg: "bg-accent-soft",
    },
    {
      title: "Monitoramento de Ritmo & Prevenção de Burnout",
      description:
        "Ideia Inteligente: Alertas visuais quando um membro excede horas consecutivas em uma tarefa, estimulando pausas saudáveis e ritmo sustentável.",
      icon: <Flame className="w-6 h-6 text-danger" />,
      tag: "Nova Feature",
      accentBg: "bg-danger-soft",
    },
    {
      title: "Relatórios de Faturamento para Clientes",
      description:
        "Ideia Inteligente: Transforme horas rastreadas em extratos prontos para faturamento, com rateio por projeto e exportação automatizada.",
      icon: <FileSpreadsheet className="w-6 h-6 text-brand" />,
      tag: "Nova Feature",
      accentBg: "bg-brand-soft",
    },
  ]

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold tracking-wide uppercase">
            <span>Funcionalidades Robustas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight">
            Tudo o que sua equipe precisa para entregar mais e medir melhor
          </h2>
          <p className="text-base sm:text-lg text-text-muted">
            Do microgerenciamento de tempo na tarefa aos relatórios executivos da diretoria: 
            uma experiência unificada feita para times de tecnologia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <Card
              key={index}
              className="bg-surface border border-border-soft rounded-2xl p-6 shadow-xs hover:shadow-panel hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-0 pb-4 flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${feat.accentBg}`}>
                    {feat.icon}
                  </div>
                  <Chip className="bg-surface-muted text-text-muted text-[11px] font-semibold px-2 py-0.5 border border-border-soft">
                    <ChipLabel>{feat.tag}</ChipLabel>
                  </Chip>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  <CardTitle className="text-lg font-bold text-text-main">
                    {feat.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-text-muted leading-relaxed">
                    {feat.description}
                  </CardDescription>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
