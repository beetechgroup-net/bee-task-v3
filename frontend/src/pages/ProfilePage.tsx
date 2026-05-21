import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Save, CheckCircle, AlertCircle, Loader2, Camera, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { cn } from "../lib/utils";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const currentPhoto = photoPreview ?? user?.photo ?? null;
  const displayInitials = (name || user?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hasChanges =
    name !== user?.name || email !== user?.email || pendingPhoto !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE) {
      setErrorMsg("A foto deve ter no máximo 5 MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Selecione um arquivo de imagem.");
      e.target.value = "";
      return;
    }

    setErrorMsg(null);
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (pendingPhoto) {
        await userService.uploadPhoto(pendingPhoto);
      }
      await userService.updateProfile({ name: name.trim(), email: email.trim() });
      await refreshUser();
      setPendingPhoto(null);
      setPhotoPreview(null);
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
        {/* Avatar com upload */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-20 w-20 cursor-pointer"
            title="Alterar foto"
          >
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={name || user?.name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-brand/10"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-2xl font-black text-brand ring-4 ring-brand/10">
                {displayInitials}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={20} className="text-white" />
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="text-center">
            <p className="font-bold text-text-main">{user?.name}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
            <p className="mt-1 text-xs text-text-muted">
              Clique na foto para alterar · máx. 5 MB
            </p>
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
