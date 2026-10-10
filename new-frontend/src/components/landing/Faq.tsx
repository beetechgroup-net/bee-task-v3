import { useState } from "react"
import { Card, CardContent } from "@heroui/react"
import { ChevronDown } from "lucide-react"

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: "Como funciona a contagem de tempo de uma tarefa?",
      a: "Cada tarefa possui métodos nativos de start() e stop(). Quando você clica em Iniciar, um novo registro de sessão (TaskHistoryItem) é criado com o timestamp de início exato. Ao pausar, o término é computado e gravado no banco de dados. Tarefas não permitem execuções concorrentes acidentais.",
    },
    {
      q: "O que são os Workspaces e como funciona o Multi-tenancy?",
      a: "Cada Workspace é uma Organização isolada no banco de dados. Você pode pertencer a múltiplas organizações (ex: empresa principal, squads de consultoria ou projetos de clientes) e alternar entre elas com papéis distintos (Owner, Admin e Membro).",
    },
    {
      q: "O que é o painel Member Detail no Org Dashboard?",
      a: "É uma visão analítica específica para gestores e líderes técnicos avaliarem as métricas consolidadas de cada membro da equipe: horas totais gastas por semana/mês, categorias em que mais atuou e principais tarefas entregues.",
    },
    {
      q: "Onde ficam armazenados os avatares e anexos?",
      a: "O Bee Task utiliza MinIO com bucket privado (S3-compatible). O upload é processado diretamente pelo backend Quarkus, gerando URLs públicas seguras para renderização no frontend.",
    },
    {
      q: "Qual a diferença entre a versão antiga e este new-frontend v3?",
      a: "O new-frontend foi reescrito do zero utilizando React 19, TypeScript, Tailwind CSS v4 e a biblioteca de componentes HeroUI v3. A interface possui alta responsividade, design system refinado com fontes Plus Jakarta Sans e uma UX muito mais rápida e elegante.",
    },
  ]

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase font-extrabold tracking-widest text-brand">
            Tire Suas Dúvidas
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Perguntas Frequentes
          </h2>
          <p className="text-text-muted text-base">
            Esclarecimentos diretos sobre a arquitetura, regras de negócio e recursos do Bee Task.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <Card
                key={idx}
                className="bg-surface border border-border-soft rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-text-main hover:text-brand transition-colors"
                >
                  <span className="text-base sm:text-lg flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-brand" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <CardContent className="px-6 pb-6 pt-0 text-sm sm:text-base text-text-muted leading-relaxed border-t border-border-soft/60 mt-1">
                    {faq.a}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
