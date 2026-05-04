import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  ArrowRight,
  Loader2,
  X,
  Target,
  Rocket,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { projectService, type Project } from "../services/projectService";
import { cn } from "../lib/utils";

export const ProjectsPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!activeOrg) return;
    setIsLoading(true);
    try {
      const data = await projectService.listByOrganization(activeOrg.id);
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Não foi possível carregar os projetos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeOrg]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !newProjectName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const newProject = await projectService.create(
        activeOrg.id,
        newProjectName,
      );
      setProjects((prev) => [...prev, newProject]);
      setNewProjectName("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create project", err);
      setError("Falha ao criar o projeto.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-surface-muted rounded-[2rem] flex items-center justify-center mb-6 text-text-muted">
          <Building2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-text-main mb-2">
          Nenhuma Organização Ativa
        </h2>
        <p className="text-text-muted max-w-sm">
          Selecione uma organização no menu superior para gerenciar seus
          projetos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-2">
            <FolderKanban size={14} />
            Workspace
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Projetos em <span className="text-brand">{activeOrg.name}</span>
          </h1>
          <p className="mt-2 text-lg text-text-muted">
            Organize suas tarefas em fluxos de trabalho específicos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-surface border border-border-soft rounded-xl text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all w-48 font-medium"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-dark active:scale-95"
          >
            <Plus size={18} />
            Novo Projeto
          </button>
        </div>
      </header>

      {/* Projects Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Target size={20} className="text-brand" />
          <h2 className="text-xl font-bold text-text-main">Todos os Projetos</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-border-soft bg-surface p-8 transition-all hover:border-brand/30 hover:shadow-2xl hover:shadow-brand/5"
              >
                <div className="relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted text-2xl font-black text-text-muted shadow-inner transition-all group-hover:bg-brand group-hover:text-white group-hover:scale-110">
                    {project.name.substring(0, 2).toUpperCase()}
                  </div>

                  <h3 className="mt-6 text-xl font-black text-text-main leading-tight group-hover:text-brand transition-colors">
                    {project.name}
                  </h3>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-1 text-[10px] font-bold text-text-muted">
                      ID #{project.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-brand/5 px-2 py-1 text-[10px] font-bold text-brand">
                      Ativo
                    </span>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-surface bg-surface-muted flex items-center justify-center text-[10px] font-bold text-text-muted">
                          U{i}
                        </div>
                      ))}
                    </div>
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-bg text-text-muted transition-all hover:bg-brand hover:text-white">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Decorations */}
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-brand/5 blur-3xl group-hover:bg-brand/10 transition-colors" />
              </motion.div>
            ))}

            {/* Quick Create Card */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-border-soft bg-surface/50 p-8 text-center transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98] group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-app-bg text-text-muted transition-colors group-hover:bg-brand group-hover:text-white">
                <Plus size={32} />
              </div>
              <div>
                <h3 className="font-bold text-text-main">Novo Projeto</h3>
                <p className="text-sm text-text-muted">Crie um novo espaço de trabalho.</p>
              </div>
            </button>
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-surface/50 rounded-[3rem] border-2 border-dashed border-border-soft">
             <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-muted/30">
                <FolderKanban size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">
                Nenhum projeto encontrado
              </h3>
              <p className="text-text-muted max-w-xs mx-auto font-medium">
                Sua organização ainda não possui projetos para exibir.
              </p>
          </div>
        )}
      </section>

      {/* Discovery Section */}
      <section className="rounded-[3rem] bg-accent p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-accent/20">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight leading-none">
            Acelere sua Produtividade
          </h2>
          <p className="mt-4 text-white/80 font-medium text-lg">
            Projetos ajudam a categorizar tarefas e manter o foco no que realmente importa. Defina metas e acompanhe o progresso em tempo real.
          </p>
          <div className="mt-10">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-accent shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Rocket size={20} />
              Começar novo projeto
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
        <FolderKanban size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
      </section>

      {/* Info Section */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[2rem] border border-border-soft bg-surface p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand mb-6">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-main">Foco em Objetivos</h3>
          <p className="mt-3 text-text-muted leading-relaxed font-medium">
            Cada projeto pode ser encarado como um objetivo específico. Use-os para separar demandas de diferentes clientes ou departamentos da sua organização.
          </p>
          <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
            Melhores práticas de organização
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="rounded-[2rem] border border-border-soft bg-surface p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent mb-6">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-main">Colaboração Segura</h3>
          <p className="mt-3 text-text-muted leading-relaxed font-medium">
            Projetos herdam as permissões da organização. Apenas membros autorizados podem visualizar e interagir com as tarefas de cada projeto.
          </p>
          <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
            Ver detalhes de visibilidade
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-surface border border-border-soft rounded-[2.5rem] shadow-panel p-10 relative"
            >
              <button 
                onClick={() => setShowCreateForm(false)}
                className="absolute top-8 right-8 text-text-muted hover:text-brand transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20 mx-auto">
                  <Plus size={32} />
                </div>
                <h2 className="text-3xl font-black text-text-main tracking-tight mb-3">Novo Projeto</h2>
                <p className="text-text-muted font-medium">Dê um nome ao seu novo espaço de trabalho em {activeOrg.name}.</p>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main ml-1">Nome do Projeto</label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="block w-full px-5 py-4 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-bold"
                    placeholder="Ex: Redesign Mobile, Q4 Marketing..."
                  />
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3">
                    <X size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating || !newProjectName.trim()}
                  className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-dark disabled:bg-brand/50 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
                >
                  {isCreating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Criar Projeto
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
