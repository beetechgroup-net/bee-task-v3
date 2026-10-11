import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@heroui/react"
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react"

export const CtaSection = () => {
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email) {
      navigate(`/register?mode=register&email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <section id="comecar" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-brand via-brand-strong to-[#0a4d47] p-8 sm:p-14 lg:p-16 text-white shadow-2xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-brand-soft/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Experimente o Novo Bee Task v3</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Pronto para elevar a produtividade e o controle da sua equipe?
            </h2>

            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Crie seu workspace em menos de 1 minuto. Comece a rastrear horas reais, 
              organizar projetos e gerenciar seu squad com precisão cirúrgica.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                placeholder="Seu melhor e-mail profissional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-80 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              <Button
                type="submit"
                className="w-full sm:w-auto bg-accent hover:bg-[#b45309] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-all duration-200"
              >
                Criar Conta
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Sem compromisso ou cartão
              </span>
              <span>•</span>
              <span>Setup em 60 segundos</span>
              <span>•</span>
              <span>Suporte técnico direto do time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
