import {
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
} from "@heroui/react"
import { Star } from "lucide-react"

export const Testimonials = () => {
  const reviews = [
    {
      name: "Gabriel Ramos",
      role: "Lead Software Architect",
      company: "BeeTech Group",
      initials: "GR",
      comment:
        "O time tracking nativo acoplado à tarefa transformou nossa dinâmica de sprint. Acabou aquela história de esquecer de apontar horas no fim do dia; agora é 1 clique e tudo fica auditado no backend Quarkus.",
      rating: 5,
    },
    {
      name: "Mariana Siqueira",
      role: "Engineering Manager",
      company: "Fintech Nexus",
      initials: "MS",
      comment:
        "O recurso de Member Detail e a visão por categoria no Org Dashboard nos deram a clareza necessária para balancear a carga dos desenvolvedores antes que qualquer gargalo se formasse.",
      rating: 5,
    },
    {
      name: "Lucas Vasconcelos",
      role: "CTO & Co-founder",
      company: "CloudScale Labs",
      initials: "LV",
      comment:
        "O suporte a múltiplos workspaces isolados nos permitiu centralizar tanto nossos projetos internos quanto o acompanhamento dos squads dos clientes em uma única ferramenta super leve e rápida.",
      rating: 5,
    },
  ]

  return (
    <section className="py-24 bg-surface/50 border-t border-border-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs uppercase font-extrabold tracking-widest text-brand">
            Feedback de Líderes Técnicos
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Desenvolvido por quem vive os desafios de entregar software
          </h2>
          <p className="text-base text-text-muted">
            Veja como equipes ágeis aumentaram a precisão do acompanhamento de horas e o foco nas sprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <Card
              key={idx}
              className="bg-surface border border-border-soft rounded-3xl p-7 shadow-xs hover:shadow-panel transition-all duration-200 flex flex-col justify-between"
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent" />
                  ))}
                </div>

                <p className="text-sm text-text-muted italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </CardContent>

              <div className="pt-6 border-t border-border-soft flex items-center gap-3.5">
                <Avatar className="w-10 h-10 rounded-full">
                  <AvatarFallback className="bg-brand-soft text-brand font-bold text-xs">
                    {rev.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold text-text-main">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {rev.role} • {rev.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
