import { type FormEvent, useState } from 'react'

interface CreateTaskFormProps {
  isSubmitting: boolean
  onSubmit: (input: { name: string; description: string }) => Promise<void>
}

export function CreateTaskForm({ isSubmitting, onSubmit }: CreateTaskFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({ name, description })
    setName('')
    setDescription('')
  }

  return (
    <form
      className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200">Create task</p>
        <h2 className="mt-3 text-3xl font-semibold">Capture work while it is fresh.</h2>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block font-medium">Name</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300"
            placeholder="Prepare sprint review"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="block text-sm text-slate-200">
          <span className="mb-2 block font-medium">Description</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300"
            placeholder="Optional context for this task"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex items-center rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : 'Create task'}
      </button>
    </form>
  )
}
