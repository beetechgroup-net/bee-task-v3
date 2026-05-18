import { Activity, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "../lib/utils";
import {
  getBackendStatus,
  type BackendHealthResponse,
} from "../services/statusService";

type LoadState = "loading" | "online" | "offline";

function extractBackendVersion(payload: BackendHealthResponse | null) {
  const versionCheck = payload?.checks?.find(
    (check) => check.name === "backend-version",
  );
  const version = versionCheck?.data?.version;

  return typeof version === "string" ? version : "unknown";
}

export function SystemStatusBadge() {
  const [backendStatus, setBackendStatus] = useState<LoadState>("loading");
  const [backendVersion, setBackendVersion] = useState("...");
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const response = await getBackendStatus();
        if (!active) return;

        setBackendStatus(response.status === "UP" ? "online" : "offline");
        setBackendVersion(extractBackendVersion(response));
      } catch {
        if (!active) return;

        setBackendStatus("offline");
        setBackendVersion("indisponivel");
      }
    }

    void loadStatus();
    const intervalId = window.setInterval(() => {
      void loadStatus();
    }, 60000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const frontendVersion = import.meta.env.VITE_APP_VERSION;
  const isOnline = backendStatus === "online";
  const isExpanded = isHovered || isPinnedOpen;

  return (
    <div
      className="fixed bottom-4 right-4 z-[70]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-2xl border border-border-soft bg-surface/95 shadow-[0_12px_30px_rgba(79,62,35,0.16)] backdrop-blur-xl transition-all duration-300",
          isExpanded ? "max-w-xs pl-2 pr-3 py-2" : "w-12 h-12 p-2",
        )}
      >
        <button
          type="button"
          aria-label="Mostrar status do sistema"
          onClick={() => setIsPinnedOpen((current) => !current)}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105",
            isOnline
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger",
          )}
        >
          {isOnline ? <Activity size={16} /> : <WifiOff size={16} />}
        </button>

        <div
          className={cn(
            "grid transition-all duration-300",
            isExpanded
              ? "ml-3 grid-cols-[1fr] opacity-100"
              : "ml-0 grid-cols-[0fr] opacity-0",
          )}
        >
          <div className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-text-muted">
                Sistema
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
                  backendStatus === "loading" && "bg-warning-soft text-warning",
                  backendStatus === "online" && "bg-success-soft text-success",
                  backendStatus === "offline" && "bg-danger-soft text-danger",
                )}
              >
                {backendStatus === "loading"
                  ? "Verificando"
                  : isOnline
                    ? "Online"
                    : "Offline"}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-text-muted">
              <span className="whitespace-nowrap">API {backendVersion}</span>
              <span className="text-border-strong">•</span>
              <span className="whitespace-nowrap">WEB {frontendVersion}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
