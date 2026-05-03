import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Building2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { organizationService, type UserJoinRequest } from "../services/organizationService";

const StatusBadge: React.FC<{ status: UserJoinRequest["status"] }> = ({ status }) => {
  const configs = {
    PENDING: {
      label: "Pendente",
      icon: Clock,
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    ACTIVE: {
      label: "Aprovado",
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    REJECTED: {
      label: "Recusado",
      icon: XCircle,
      className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${config.className}`}>
      <Icon size={14} />
      <span>{config.label}</span>
    </div>
  );
};

export const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<UserJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await organizationService.getUserRequests();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="bg-surface border border-border-soft p-10 rounded-[2.5rem] shadow-panel">
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-surface-muted/50 text-text-muted hover:bg-brand/10 hover:text-brand flex items-center justify-center transition-all group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-text-main tracking-tight">
                Minhas Solicitações
              </h1>
              <p className="text-text-muted font-medium">
                Acompanhe o status dos seus pedidos para entrar em organizações
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-surface-muted/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-surface-muted/30 border border-dashed border-border-soft rounded-[2rem] p-12 text-center">
              <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-text-muted/50" size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-text-muted mb-8 max-w-xs mx-auto">
                Você ainda não solicitou participar de nenhuma organização.
              </p>
              <button
                onClick={() => navigate("/join-organization")}
                className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand/20 transition-all active:scale-95"
              >
                Buscar Organizações
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.organizationId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface-muted/30 hover:bg-surface-muted/50 border border-border-soft p-5 rounded-2xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-border-soft flex items-center justify-center text-brand">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main group-hover:text-brand transition-colors">
                        {request.organizationName}
                      </h3>
                      <span className="text-xs text-text-muted font-semibold tracking-wider uppercase">
                        ID: {request.organizationId}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
