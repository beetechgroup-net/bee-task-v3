import { Card, CardContent } from "@heroui/react"
import { Building2, UserPlus, PlayCircle, LineChart } from "lucide-react"

export const Workflow = () => {
  const steps = [
    {
      step: "01",
      title: "Crie seu Workspace",
      description:
        "Crie a organização para sua empresa ou squad, personalize os projetos e categorize os tipos de demandas com paleta de cores própria.",
      icon: <Building2 className="w-5 h-5 text-brand" />,
    },
    {
      step: "02",
      title: "Convide sua Equipe",
      description:
        "Adicione colaboradores com papéis seguros (Owner, Admin, Membro). Cada um terá seu perfil com avatar customizado e controle de acesso.",
      icon: <UserPlus className="w-5 h-5 text-accent" />,
    },
    {
      step: "03",
      title: "Inicie o Time Tracking",
      description:
        "Cada membro dá o play nas suas tarefas. O cronômetro acompanha o trabalho sem distrações, calculando horas produtivas segundo a segundo.",
      icon: <PlayCircle className="w-5 h-5 text-brand" />,
    },
    {
      step: "04",
      title: "Analise Métricas & Entregas",
      description:
        "Descubra as tarefas mais demoradas, visualize a distribuição por categoria e veja o desempenho consolidado de cada membro do time.",
      icon: <LineChart className="w-5 h-5 text-accent" />,
    },
  ]

  return (
    <section id="workspaces" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase font-extrabold tracking-widest text-brand">
            Fluxo de Trabalho Descomplicado
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Da criação do workspace ao primeiro relatório em 4 passos
          </h2>
          <p className="text-base text-text-muted">
            Uma esteira intuitiva feita para eliminar atrito e focar no que realmente importa: entregar software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => (
            <Card
              key={idx}
              className="bg-surface border border-border-soft rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:shadow-panel hover:-translate-y-1 transition-all duration-200"
            >
              <div className="absolute -right-3 -top-3 text-6xl font-extrabold font-mono text-border-soft/60 select-none group-hover:text-brand/10 transition-colors">
                {item.step}
              </div>
              <CardContent className="p-0 space-y-4 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-surface-muted border border-border-soft flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
