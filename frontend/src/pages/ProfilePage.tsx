import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { cn } from "../lib/utils";

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const initials = (name || user?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hasChanges = name !== user?.name || email !== user?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await userService.updateProfile({ name: name.trim(), email: email.trim() });
      await refreshUser();
      setSuccessMsg("Perfil atualizado com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil.";
      setErrorMsg(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-lg"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-black text-text-main">Meu Perfil</h1>
        <p className="mt-1 text-sm text-text-muted">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="rounded-2xl border border-border-soft bg-surface p-8 shadow-sm">
        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-2xl font-black text-brand ring-4 ring-brand/10">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main">{user?.name}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-text-main">
              Nome
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-border-soft bg-surface-muted py-2.5 pl-9 pr-4 text-sm text-text-main placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-text-main">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border-soft bg-surface-muted py-2.5 pl-9 pr-4 text-sm text-text-main placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Feedback */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
            >
              <CheckCircle size={16} />
              {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <AlertCircle size={16} />
              {errorMsg}
            </motion.div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
              hasChanges && !isSaving
                ? "bg-brand text-white shadow-md shadow-brand/20 hover:scale-[1.01] hover:bg-brand-dark active:scale-95"
                : "cursor-not-allowed bg-surface-muted text-text-muted",
            )}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar alterações
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
