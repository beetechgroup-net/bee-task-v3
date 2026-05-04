import React, { useState } from "react";
import {
  Layout,
  ListTodo,
  PlusCircle,
  Columns,
  LogOut,
  Settings,
  Building2,
  Clock,
  ChevronDown,
  Shield,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { NavLink, Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { OnboardingModal } from "./OnboardingModal";

import { cn } from "../lib/utils";
import { motion } from "framer-motion";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-brand text-white shadow-md shadow-brand/20"
      : "text-text-muted hover:bg-surface-muted hover:text-text-main",
  );

const dropdownItemClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
    isActive
      ? "bg-brand/10 text-brand"
      : "text-text-muted hover:bg-surface-muted hover:text-text-main",
  );

export function AppShell() {
  const { user, isAuthenticated, isLoading, logout, activeOrg, setActiveOrg } =
    useAuth();
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [showTasksDropdown, setShowTasksDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user && user.organizations.length === 0) {
      setShowOrgModal(true);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-brand">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-app-bg font-sans text-text-main">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border-soft bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
                <Layout size={20} />
              </div>
              <div>
                <span className="block text-lg font-black tracking-tight text-text-main">
                  BeeTask
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Workspace
                </span>
              </div>
            </NavLink>

            <div className="h-8 w-px bg-border-soft hidden lg:block" />

            {/* Org Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowOrgSwitcher(!showOrgSwitcher)}
                className="flex w-48 items-center gap-2 rounded-xl border border-border-soft bg-surface-muted/50 px-4 py-2 text-sm font-bold transition-all hover:bg-surface-muted group"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-all">
                  <Building2 size={14} />
                </div>
                <div className="text-left hidden sm:block flex-1 min-w-0">
                  <span className="block text-xs text-text-main leading-tight truncate">
                    {activeOrg?.name || "Selecionar Org"}
                  </span>
                  <span className="block text-[10px] text-text-muted font-black uppercase tracking-tighter leading-none truncate">
                    {activeOrg?.roles[0] || "Visitante"}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-text-muted transition-transform",
                    showOrgSwitcher && "rotate-180",
                  )}
                />
              </button>

              {showOrgSwitcher && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOrgSwitcher(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-2 z-50 w-48 rounded-2xl border border-border-soft bg-surface p-2 shadow-xl shadow-brand/10"
                  >
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Suas Organizações
                    </div>
                    <div className="grid gap-1 mt-1">
                      {user?.organizations.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            setActiveOrg(org.id);
                            setShowOrgSwitcher(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all text-left",
                            org.id === activeOrg?.id
                              ? "bg-brand/10 text-brand"
                              : "hover:bg-surface-muted text-text-muted hover:text-text-main",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shadow-sm",
                                org.id === activeOrg?.id
                                  ? "bg-brand text-white"
                                  : "bg-white border border-border-soft text-text-muted",
                              )}
                            >
                              {org.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="block text-sm font-bold leading-none">
                                {org.name}
                              </span>
                              <span className="text-[10px] font-medium opacity-70">
                                {org.roles.join(", ")}
                              </span>
                            </div>
                          </div>
                          {org.id === activeOrg?.id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 border-t border-border-soft p-1">
                      <Link
                        to="/organizations"
                        onClick={() => setShowOrgSwitcher(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand hover:bg-brand/5 transition-all"
                      >
                        <PlusCircle size={14} />
                        Gerenciar Organizações
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              <NavLink to="/dashboard" className={navLinkClassName}>
                <BarChart3 size={18} />
                Dashboard
              </NavLink>

              {/* Tarefas Dropdown */}
              <div className="relative">
                <NavLink
                  to="/"
                  className={({ isActive }) => {
                    const isBoardActive = window.location.pathname === "/board";
                    const active = isActive || isBoardActive;
                    return cn(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                      active || showTasksDropdown
                        ? "bg-brand text-white shadow-md shadow-brand/20"
                        : "text-text-muted hover:bg-surface-muted hover:text-text-main",
                    );
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTasksDropdown(!showTasksDropdown);
                  }}
                >
                  <ListTodo size={18} />
                  Tarefas
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      showTasksDropdown && "rotate-180",
                    )}
                  />
                </NavLink>

                {showTasksDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTasksDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 mt-2 z-50 w-48 rounded-2xl border border-border-soft bg-surface p-2 shadow-xl shadow-brand/10"
                    >
                      <NavLink
                        to="/"
                        end
                        onClick={() => setShowTasksDropdown(false)}
                        className={dropdownItemClassName}
                      >
                        <ListTodo size={18} />
                        Minhas Tarefas
                      </NavLink>
                      <NavLink
                        to="/board"
                        onClick={() => setShowTasksDropdown(false)}
                        className={(props) =>
                          cn(dropdownItemClassName(props), "mt-1")
                        }
                      >
                        <Columns size={18} />
                        Quadro
                      </NavLink>
                    </motion.div>
                  </>
                )}
              </div>

              <NavLink to="/projects" className={navLinkClassName}>
                <FolderKanban size={18} />
                Projetos
              </NavLink>

              {/* Organizações Dropdown */}
              <div className="relative">
                <NavLink
                  to="/organizations"
                  className={({ isActive }) => {
                    const isRequestsActive =
                      window.location.pathname === "/requests";
                    const isAdminActive = window.location.pathname === "/admin";
                    const active =
                      isActive || isRequestsActive || isAdminActive;
                    return cn(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                      active || showOrgDropdown
                        ? "bg-brand text-white shadow-md shadow-brand/20"
                        : "text-text-muted hover:bg-surface-muted hover:text-text-main",
                    );
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowOrgDropdown(!showOrgDropdown);
                  }}
                >
                  <Building2 size={18} />
                  Organizações
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      showOrgDropdown && "rotate-180",
                    )}
                  />
                </NavLink>

                {showOrgDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowOrgDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-border-soft bg-surface p-2 shadow-xl shadow-brand/10"
                    >
                      <NavLink
                        to="/organizations"
                        onClick={() => setShowOrgDropdown(false)}
                        className={dropdownItemClassName}
                      >
                        <Building2 size={18} />
                        Minhas Organizações
                      </NavLink>
                      <NavLink
                        to="/requests"
                        onClick={() => setShowOrgDropdown(false)}
                        className={(props) =>
                          cn(dropdownItemClassName(props), "mt-1")
                        }
                      >
                        <Clock size={18} />
                        Minhas Solicitações
                      </NavLink>
                      {user?.organizations.some(
                        (org) =>
                          org.roles.includes("OWNER") ||
                          org.roles.includes("ADMIN"),
                      ) && (
                        <NavLink
                          to="/admin"
                          onClick={() => setShowOrgDropdown(false)}
                          className={(props) =>
                            cn(dropdownItemClassName(props), "mt-1")
                          }
                        >
                          <Settings size={18} />
                          Solicitações Pendentes
                        </NavLink>
                      )}
                    </motion.div>
                  </>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden h-8 w-px bg-border-soft md:block" />
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="ml-2 p-2 text-text-muted hover:text-danger transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Footer / Mobile Nav */}
      <footer className="border-t border-border-soft bg-surface py-6 md:hidden">
        <nav className="flex justify-around px-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(navLinkClassName({ isActive }), "flex-col gap-0.5 py-1")
            }
          >
            <BarChart3 size={20} />
            <span className="text-[10px]">Dash</span>
          </NavLink>

          {/* Mobile Tarefas Group */}
          <div className="relative">
            <button
              onClick={() => setShowTasksDropdown(!showTasksDropdown)}
              className={cn(
                navLinkClassName({
                  isActive:
                    window.location.pathname === "/" ||
                    window.location.pathname === "/board",
                }),
                "flex-col gap-0.5 py-1",
              )}
            >
              <ListTodo size={20} />
              <span className="text-[10px]">Tarefas</span>
            </button>

            {showTasksDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTasksDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-40 rounded-2xl border border-border-soft bg-surface p-1 shadow-2xl"
                >
                  <NavLink
                    to="/"
                    end
                    onClick={() => setShowTasksDropdown(false)}
                    className={dropdownItemClassName}
                  >
                    <ListTodo size={18} />
                    Lista
                  </NavLink>
                  <NavLink
                    to="/board"
                    onClick={() => setShowTasksDropdown(false)}
                    className={(props) =>
                      cn(dropdownItemClassName(props), "mt-1")
                    }
                  >
                    <Columns size={18} />
                    Quadro
                  </NavLink>
                </motion.div>
              </>
            )}
          </div>
          <NavLink to="/projects" className={navLinkClassName}>
            <FolderKanban size={18} />
            Projetos
          </NavLink>

          {/* Mobile Organizações Group */}
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className={cn(
                navLinkClassName({
                  isActive:
                    window.location.pathname === "/organizations" ||
                    window.location.pathname === "/requests" ||
                    window.location.pathname === "/admin",
                }),
                "flex-col gap-0.5 py-1",
              )}
            >
              <Building2 size={20} />
              <span className="text-[10px]">Org</span>
            </button>

            {showOrgDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOrgDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-48 rounded-2xl border border-border-soft bg-surface p-1 shadow-2xl"
                >
                  <NavLink
                    to="/organizations"
                    onClick={() => setShowOrgDropdown(false)}
                    className={dropdownItemClassName}
                  >
                    <Building2 size={18} />
                    Minhas Orgs
                  </NavLink>
                  <NavLink
                    to="/requests"
                    onClick={() => setShowOrgDropdown(false)}
                    className={(props) =>
                      cn(dropdownItemClassName(props), "mt-1")
                    }
                  >
                    <Clock size={18} />
                    Pedidos
                  </NavLink>
                  {user?.organizations.some(
                    (org) =>
                      org.roles.includes("OWNER") ||
                      org.roles.includes("ADMIN"),
                  ) && (
                    <NavLink
                      to="/admin"
                      onClick={() => setShowOrgDropdown(false)}
                      className={(props) =>
                        cn(dropdownItemClassName(props), "mt-1")
                      }
                    >
                      <Settings size={18} />
                      Gestão
                    </NavLink>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </nav>
      </footer>
      <OnboardingModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
      />
    </div>
  );
}
