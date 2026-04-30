import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { apiFetch } from "../lib/api";
import { TASK_STATUS_OPTIONS } from "../types/task";
import type {
  CreateTaskPayload,
  TaskResponse,
  TaskStatus,
} from "../types/task";

type FormState = CreateTaskPayload;

const initialFormState: FormState = {
  title: "",
  description: "",
  status: "NOT_STARTED",
  project: "",
};

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: "Nao iniciada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluida",
  CANCELED: "Cancelada",
};

export function CreateTaskPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<TaskResponse | null>(null);

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
        project: form.project.trim(),
      };

      const response = await apiFetch<TaskResponse>("/tasks", {
        method: "POST",
        body: payload,
      });

      setCreatedTask(response);
      setForm(initialFormState);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar a task.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="px-6 py-10 text-text-main">
      <section className="rounded-[2rem] border border-border-soft bg-surface p-8 shadow-[var(--shadow-panel)]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-border-soft bg-surface-muted px-4 py-2 text-sm font-semibold text-brand-strong">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            Criar task
          </div>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-main">
                Titulo
              </span>
              <input
                required
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="Ex.: Preparar retrospectiva da sprint"
                className="h-13 w-full rounded-2xl border border-border-soft bg-white px-4 text-base outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-main">
                Projeto
              </span>
              <input
                name="project"
                value={form.project}
                onChange={updateField}
                placeholder="Ex.: Bee Task Web"
                className="h-13 w-full rounded-2xl border border-border-soft bg-white px-4 text-base outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              Descricao
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={6}
              placeholder="Adicione contexto, criterio de pronto ou observacoes importantes."
              className="w-full rounded-3xl border border-border-soft bg-white px-4 py-4 text-base outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>

          <label className="block max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-text-main">
              Status inicial
            </span>
            <select
              name="status"
              value={form.status}
              onChange={updateField}
              className="h-13 w-full rounded-2xl border border-border-soft bg-white px-4 text-base outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            >
              {TASK_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          {errorMessage ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Criando task..." : "Criar task"}
            </button>

            <p className="text-sm text-text-muted">
              O backend define os ids e devolve a task criada.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
