import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Layout,
  PlusCircle,
  Send,
} from "lucide-react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

import { taskService } from "../services/taskService";
import { cn } from "../lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "../types/task";
import type { CreateTaskPayload, TaskResponse } from "../types/task";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { projectService, type Project } from "../services/projectService";

type FormState = Omit<CreateTaskPayload, 'projectId'> & { projectId: string };

const initialFormState: FormState = {
  title: "",
  description: "",
  status: "NOT_STARTED",
  projectId: "",
};

export function CreateTaskPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<TaskResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const { activeOrg } = useAuth();

  useEffect(() => {
    async function loadProjects() {
      if (!activeOrg) return;
      try {
        const data = await projectService.listByOrganization(activeOrg.id);
        setProjects(data);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      }
    }
    loadProjects();
  }, [activeOrg]);

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload: CreateTaskPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        projectId: form.projectId ? Number(form.projectId) : null,
      };

      const response = await taskService.createTask(payload);

      setCreatedTask(response);
      setForm(initialFormState);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a task.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdTask) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md overflow-hidden rounded-[2.5rem] border border-border-soft bg-surface p-8 text-center shadow-2xl shadow-brand/10"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-text-main">
            Tarefa Criada!
          </h2>
          <p className="mt-3 text-text-muted">
            Sua nova tarefa foi registrada com sucesso e já está disponível na
            lista.
          </p>

          <div className="mt-8 rounded-2xl bg-app-bg p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              #{createdTask.id}
            </p>
            <h4 className="mt-1 font-bold text-text-main">
              {createdTask.title}
            </h4>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-md bg-surface px-2 py-1 text-[10px] font-bold text-brand shadow-sm">
                {TASK_STATUS_LABELS[createdTask.status]}
              </span>
              <span className="text-[10px] font-bold text-text-muted">
                {createdTask.project || "Geral"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-strong"
            >
              Ver Minhas Tarefas
            </Link>
            <button
              onClick={() => setCreatedTask(null)}
              className="text-sm font-bold text-text-muted hover:text-text-main"
            >
              Criar outra tarefa
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-20">
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft size={16} />
          Voltar para a lista
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2.5rem] border border-border-soft bg-surface shadow-2xl shadow-brand/5"
      >
        <div className="bg-brand p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface/20 backdrop-blur-sm">
              <PlusCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Nova Tarefa
              </h1>
              <p className="text-sm font-medium text-white/80">
                Preencha os detalhes abaixo para começar.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-10">
          <div className="space-y-8">
            {/* Title Section */}
            <div className="space-y-4">
              <label className="group block">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main group-focus-within:text-brand">
                  <FileText size={16} />
                  Título da Tarefa
                </div>
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="Ex.: Implementar autenticação JWT"
                  className="h-14 w-full rounded-2xl border border-border-soft bg-app-bg px-5 text-lg font-medium outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </label>
            </div>

            {/* Project & Status Row */}
            <div className="grid gap-6 md:grid-cols-2">
              <label className="group block">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main group-focus-within:text-brand">
                  <Layout size={16} />
                  Projeto
                </div>
                <select
                  name="projectId"
                  value={form.projectId || ""}
                  onChange={updateField}
                  className="h-12 w-full appearance-none rounded-xl border border-border-soft bg-app-bg px-4 text-sm font-medium outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                >
                  <option value="">Sem Projeto (Geral)</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="group block">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main group-focus-within:text-brand">
                  <Layout size={16} />
                  Status Inicial
                </div>
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  className="h-12 w-full appearance-none rounded-xl border border-border-soft bg-app-bg px-4 text-sm font-medium outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                >
                  {TASK_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {TASK_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Description Section */}
            <label className="group block">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main group-focus-within:text-brand">
                <FileText size={16} />
                Descrição
              </div>
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows={5}
                placeholder="Descreva o que precisa ser feito..."
                className="w-full rounded-2xl border border-border-soft bg-app-bg px-5 py-4 text-sm font-medium outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </label>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm font-bold text-danger"
            >
              {errorMessage}
            </motion.div>
          )}

          <div className="mt-10 flex items-center justify-end gap-4">
            <Link
              to="/"
              className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-main"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-strong active:scale-95 disabled:opacity-50",
                isSubmitting && "cursor-wait",
              )}
            >
              {isSubmitting ? (
                "Criando..."
              ) : (
                <>
                  <Send size={18} />
                  Criar Tarefa
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
