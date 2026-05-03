import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Building2, Send, CheckCircle2, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { organizationService } from "../services/organizationService";

interface OrgResult {
  id: number;
  name: string;
}

export const JoinOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrgResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestedId, setRequestedId] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);

    try {
      const data = await organizationService.search(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (id: number) => {
    try {
      await organizationService.requestJoin(id);
      setRequestedId(id);
      alert("Solicitação enviada! Aguarde a aprovação do dono da organização.");
    } catch (error) {
      console.error("Join request failed", error);
      alert(
        error instanceof Error ? error.message : "Erro ao enviar solicitação.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/15 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-surface border border-border-soft p-10 rounded-[2.5rem] shadow-panel relative">
          <div className="absolute top-8 left-8">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-text-muted hover:text-brand transition-colors font-semibold"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-muted/50 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                <ArrowLeft size={18} />
              </div>
              <span>Voltar</span>
            </button>
          </div>

          <div className="absolute top-8 right-8">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-xl bg-surface-muted/50 text-text-muted hover:bg-brand/10 hover:text-brand flex items-center justify-center transition-all"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
              <Search size={28} />
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tight mb-3">
              Buscar Organização
            </h1>
            <p className="text-text-muted font-medium">
              Encontre uma organização pelo nome
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium"
                placeholder="Nome da organização..."
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-brand hover:bg-brand-strong text-white font-bold px-8 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98] flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Buscar"
              )}
            </button>
          </form>

          <div className="space-y-3">
            {results && results.length > 0 ? (
              results.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-5 bg-surface-muted/30 border border-border-soft rounded-2xl hover:border-brand/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    <span className="font-bold text-text-main">{org.name}</span>
                  </div>
                  {requestedId === org.id ? (
                    <div className="flex items-center gap-2 text-success font-bold text-sm bg-success/10 px-4 py-2 rounded-xl">
                      <CheckCircle2 size={16} />
                      Solicitado
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinRequest(org.id)}
                      className="flex items-center gap-2 text-brand font-bold text-sm hover:bg-brand hover:text-white px-4 py-2 rounded-xl border border-brand/20 transition-all"
                    >
                      <Send size={16} />
                      Solicitar entrada
                    </button>
                  )}
                </div>
              ))
            ) : results && results.length === 0 ? (
              <p className="text-center text-text-muted py-10 font-medium">
                Nenhuma organização encontrada.
              </p>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
