import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  Layout,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { projectService, type Project } from "../services/projectService";

export const ProjectsPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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
    try {
      const newProject = await projectService.create(
        activeOrg.id,
        newProjectName,
      );
      setProjects((prev) => [...prev, newProject]);
      setNewProjectName("");
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create project", err);
      setError("Falha ao criar o projeto.");
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-brand font-black uppercase tracking-widest text-[10px] mb-2">
            <Layout size={14} />
            Gerenciamento
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">
            Projetos de <span className="text-brand">{activeOrg.name}</span>
          </h1>
          <p className="text-text-muted font-medium mt-1">
            Organize suas tarefas em projetos específicos para melhor
            acompanhamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Filtrar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-surface border border-border-soft rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all w-full md:w-64 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Project Form */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface border border-border-soft p-8 rounded-[2.5rem] shadow-panel sticky top-24"
          >
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
              <Plus size={24} />
            </div>
            <h2 className="text-xl font-black text-text-main mb-2">
              Novo Projeto
            </h2>
            <p className="text-sm text-text-muted mb-8 font-medium">
              Crie um novo contêiner para suas tarefas e objetivos.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Redesign Mobile, Marketing Q3..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-5 py-4 bg-app-bg border border-border-soft rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || !newProjectName.trim()}
                className="w-full bg-brand hover:bg-brand-dark disabled:bg-surface-muted disabled:text-text-muted text-white font-black py-4 rounded-2xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                {isCreating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Criar Projeto</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3"
              >
                <X size={16} />
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-surface-muted animate-pulse rounded-[2rem]"
                />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-surface/50 border-2 border-dashed border-border-soft rounded-[3rem] p-20 text-center">
              <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-muted/30">
                <FolderKanban size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">
                Nenhum projeto encontrado
              </h3>
              <p className="text-text-muted max-w-xs mx-auto font-medium">
                {searchQuery
                  ? "Nenhum projeto corresponde à sua busca."
                  : "Sua organização ainda não possui projetos."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-surface hover:bg-brand/[0.02] border border-border-soft p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-surface-muted rounded-2xl flex items-center justify-center text-brand font-black text-xl shadow-inner group-hover:bg-brand group-hover:text-white transition-all">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-text-main group-hover:text-brand transition-colors text-lg leading-tight">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                            ID #{project.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted/20 group-hover:text-brand group-hover:bg-brand/10 transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
