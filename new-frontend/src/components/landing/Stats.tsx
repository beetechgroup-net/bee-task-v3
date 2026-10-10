import React from "react"
import { Card, CardContent } from "@heroui/react"
import { CheckCircle2, Clock, Building2, Users } from "lucide-react"

export const Stats: React.FC = () => {
  const stats = [
    {
      label: "Tarefas Finalizadas",
      value: "84.500+",
      subtext: "Entregues com ciclo completo",
      icon: <CheckCircle2 className="w-5 h-5 text-brand" />,
      highlightColor: "bg-brand-soft",
    },
    {
      label: "Horas Rastreadas",
      value: "12.350h",
      subtext: "Com controle auditável em tempo real",
      icon: <Clock className="w-5 h-5 text-accent" />,
      highlightColor: "bg-accent-soft",
    },
    {
      label: "Organizações & Workspaces",
      value: "480+",
      subtext: "Isolamento multi-tenancy rigoroso",
      icon: <Building2 className="w-5 h-5 text-brand" />,
      highlightColor: "bg-brand-soft",
    },
    {
      label: "Colaboradores Ativos",
      value: "3.200+",
      subtext: "Equipes de tecnologia e squads ágeis",
      icon: <Users className="w-5 h-5 text-accent" />,
      highlightColor: "bg-accent-soft",
    },
  ]

  return (
    <section className="py-12 border-y border-border-soft bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase font-extrabold tracking-widest text-brand">
            Métricas da Plataforma (Public Stats API)
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main mt-1">
            Resultados mensuráveis entregues todos os dias
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <Card
              key={index}
              className="bg-surface border border-border-soft rounded-2xl p-6 shadow-xs hover:shadow-panel transition-all duration-200"
            >
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-muted">
                    {item.label}
                  </span>
                  <div className={`p-2.5 rounded-xl ${item.highlightColor}`}>
                    {item.icon}
                  </div>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold font-mono text-text-main tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{item.subtext}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
