import React from "react";
import { ShieldCheck, Building2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
  message?: string;
}

export function RoleGate({ children, allowedRoles, message }: RoleGateProps) {
  const { activeOrg, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

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
          recursos.
        </p>
      </div>
    );
  }

  const isAuthorized = activeOrg.roles.some((role) =>
    allowedRoles.includes(role),
  );

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-text-main mb-2">
          Acesso Restrito
        </h2>
        <p className="text-text-muted max-w-sm">
          {message || "Você não tem permissão para acessar esta área nesta organização."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
