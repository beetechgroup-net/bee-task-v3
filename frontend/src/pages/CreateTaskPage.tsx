import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Layout,
  PlusCircle,
  Send,
  Users,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { taskService } from "../services/taskService";
import { cn } from "../lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "../types/task";
import type { CreateTaskPayload, TaskResponse, TaskHistoryItem } from "../types/task";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { projectService, type Project } from "../services/projectService";
import { categoryService } from "../services/categoryService";
import {
  organizationService,
  type OrganizationMember,
} from "../services/organizationService";
import type { Category } from "../types/category";
import { CategoryIcon } from "../components/CategoryIcon";
import { UserAvatar } from "../components/UserAvatar";

type FormState = Omit<CreateTaskPayload, 'organizationId' | 'projectId' | 'categoryId' | 'assigneeUserId'> & {
  projectId: string;
  categoryId: string;
  assigneeUserId: string;
  history: TaskHistoryItem[];
};

const initialFormState: FormState = {
  title: "",
  description: "",
  status: "NOT_STARTED",
  projectId: "",
  categoryId: "",
  assigneeUserId: "",
  history: [],
};

export function CreateTaskPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<TaskResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [assignToLoggedUser, setAssignToLoggedUser] = useState(false);
  const { activeOrg, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      async function loadTask() {
        try {
          const data = await taskService.getTask(Number(id));
          setForm({
            title: data.title,
            description: data.description || "",
            status: data.status,
            projectId: data.project?.id?.toString() || "",
            categoryId: data.category?.id?.toString() || "",
            assigneeUserId: data.user?.id?.toString() || "",
            history: data.history || [],
          });
          setAssignToLoggedUser(Boolean(user?.email && data.user?.email === user.email));
        } catch (error) {
          console.error("Erro ao carregar tarefa:", error);
          setErrorMessage("Não foi possível carregar os dados da tarefa.");
        }
      }
      loadTask();
    }
  }, [id, isEdit, user?.email]);

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
    async function loadCategories() {
      if (!activeOrg) return;
      try {
        const data = await categoryService.listByOrganization(activeOrg.id);
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }
    async function loadMembers() {
      if (!activeOrg) return;
      try {
        const data = await organizationService.listMembers(activeOrg.id);
        setMembers(data);
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
      }
    }
    loadProjects();
    loadCategories();
    loadMembers();
  }, [activeOrg]);

  useEffect(() => {
    if (!activeOrg) return;
    if (assignToLoggedUser && user) {
      const currentMember = members.find((member) => member.userEmail === user.email);
      if (currentMember) {
        setForm((current) => ({ ...current, assigneeUserId: currentMember.userId.toString() }));
      }
    }
  }, [assignToLoggedUser, user, members, activeOrg]);

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
      if (!activeOrg) {
        throw new Error("Nenhuma organização ativa selecionada.");
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        organizationId: activeOrg.id,
        projectId: form.projectId ? Number(form.projectId) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        assigneeUserId: form.assigneeUserId ? Number(form.assigneeUserId) : null,
        history: form.history,
      };

      if (isEdit) {
        await taskService.updateTask(Number(id), payload);
        navigate("/");
      } else {
        const response = await taskService.createTask(payload);
        setCreatedTask(response);
        setForm(initialFormState);
        setAssignToLoggedUser(false);
      }
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
                {createdTask.project?.name || "Geral"}
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

  const selectedAssignee = members.find(
    (member) => member.userId === Number(form.assigneeUserId),
  );

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
                {isEdit ? "Editar Tarefa" : "Nova Tarefa"}
              </h1>
              <p className="text-sm font-medium text-white/80">
                {isEdit ? `Editando tarefa #${id}` : "Preencha os detalhes abaixo para começar."}
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

            {/* Project, Category & Status Row */}
            <div className="grid gap-6 md:grid-cols-3">
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
                  {form.categoryId ? (
                    (() => {
                      const c = categories.find((cat) => cat.id === Number(form.categoryId));
                      return c ? (
                        <CategoryIcon iconName={c.icon} color={c.color} size={16} />
                      ) : (
                        <Layout size={16} />
                      );
                    })()
                  ) : (
                    <Layout size={16} />
                  )}
                  Categoria
                </div>
                <select
                  name="categoryId"
                  value={form.categoryId || ""}
                  onChange={updateField}
                  className="h-12 w-full appearance-none rounded-xl border border-border-soft bg-app-bg px-4 text-sm font-medium outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                >
                  <option value="">Sem Categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
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

            <div className="space-y-4 rounded-[2rem] border border-border-soft bg-app-bg/40 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <label className="group block flex-1">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main group-focus-within:text-brand">
                    <Users size={16} />
                    Funcionário Responsável
                  </div>
                  <select
                    name="assigneeUserId"
                    value={form.assigneeUserId}
                    onChange={updateField}
                    disabled={assignToLoggedUser}
                    className="h-12 w-full appearance-none rounded-xl border border-border-soft bg-app-bg px-4 text-sm font-medium outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 focus:border-brand focus:ring-4 focus:ring-brand/10"
                  >
                    <option value="">Sem responsável</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.userName} - {member.userEmail}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm font-bold text-text-main">
                  <input
                    type="checkbox"
                    checked={assignToLoggedUser}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setAssignToLoggedUser(checked);
                      if (!checked && user?.email && selectedAssignee?.userEmail === user.email) {
                        setForm((current) => ({ ...current, assigneeUserId: current.assigneeUserId }));
                      }
                    }}
                    className="h-4 w-4 rounded border-border-soft text-brand focus:ring-brand"
                  />
                  Associar ao usuário logado
                </label>
              </div>

              {selectedAssignee ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface p-4">
                  <UserAvatar
                    name={selectedAssignee.userName}
                    photo={selectedAssignee.userPhoto}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-black text-text-main">
                      {selectedAssignee.userName}
                    </p>
                    <p className="text-xs font-medium text-text-muted">
                      {selectedAssignee.userEmail}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-text-muted">
                  Esta tarefa pode ficar sem responsável.
                </p>
              )}
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

            {/* History Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                  <Clock size={16} />
                  Histórico de Execução
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      history: [...prev.history, { startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"), endAt: null }]
                    }))
                  }}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  + Adicionar Registro Manual
                </button>
              </div>

              <div className="space-y-3">
                {form.history.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-4 rounded-xl border border-border-soft bg-app-bg/50 p-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black uppercase text-text-muted">Início</label>
                      <input
                        type="datetime-local"
                        value={item.startAt ? item.startAt.slice(0, 16) : ""}
                        onChange={(e) => {
                          const newHistory = [...form.history];
                          newHistory[index] = { ...item, startAt: e.target.value };
                          setForm(prev => ({ ...prev, history: newHistory }));
                        }}
                        className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs outline-none focus:border-brand"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black uppercase text-text-muted">Fim</label>
                      <input
                        type="datetime-local"
                        value={item.endAt ? item.endAt.slice(0, 16) : ""}
                        onChange={(e) => {
                          const newHistory = [...form.history];
                          newHistory[index] = { ...item, endAt: e.target.value || null };
                          setForm(prev => ({ ...prev, history: newHistory }));
                        }}
                        className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs outline-none focus:border-brand"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          history: prev.history.filter((_, i) => i !== index)
                        }))
                      }}
                      className="mb-1 rounded-lg p-2 text-danger hover:bg-danger-soft"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                {form.history.length === 0 && (
                  <p className="py-4 text-center text-xs font-medium text-text-muted">Nenhum registro de execução encontrado.</p>
                )}
              </div>
            </div>
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
                isEdit ? "Salvando..." : "Criando..."
              ) : (
                <>
                  <Send size={18} />
                  {isEdit ? "Salvar Alterações" : "Criar Tarefa"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
