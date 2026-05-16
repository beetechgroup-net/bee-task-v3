import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { CreateTaskPage } from "./pages/CreateTaskPage";
import { TaskListPage } from "./pages/TaskListPage";
import { TaskBoardPage } from "./pages/TaskBoardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CreateOrganizationPage } from "./pages/CreateOrganizationPage";
import { JoinOrganizationPage } from "./pages/JoinOrganizationPage";
import { OrganizationAdminPage } from "./pages/OrganizationAdminPage";
import { MyRequestsPage } from "./pages/MyRequestsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrgDashboardPage } from "./pages/OrgDashboardPage";
import { RoleGate } from "./components/RoleGate";
import { LandingPage } from "./pages/LandingPage";

export const router = createBrowserRouter([
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/organizations/new",
    element: <CreateOrganizationPage />,
  },
  {
    path: "/organizations/join",
    element: <JoinOrganizationPage />,
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <TaskListPage />,
      },
      {
        path: "new",
        element: <CreateTaskPage />,
      },
      {
        path: "edit/:id",
        element: <CreateTaskPage />,
      },
      {
        path: "board",
        element: <TaskBoardPage />,
      },
      {
        path: "admin",
        element: (
          <RoleGate allowedRoles={["OWNER", "ADMIN"]} message="Apenas administradores e proprietários podem gerenciar solicitações.">
            <OrganizationAdminPage />
          </RoleGate>
        ),
      },
      {
        path: "requests",
        element: <MyRequestsPage />,
      },
      {
        path: "projects",
        element: (
          <RoleGate allowedRoles={["OWNER", "ADMIN"]} message="Apenas administradores e proprietários podem gerenciar projetos.">
            <ProjectsPage />
          </RoleGate>
        ),
      },
      {
        path: "categories",
        element: (
          <RoleGate allowedRoles={["OWNER", "ADMIN"]} message="Apenas administradores e proprietários podem gerenciar categorias.">
            <CategoriesPage />
          </RoleGate>
        ),
      },
      {
        path: "organizations",
        element: <OrganizationsPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "org-dashboard",
        element: (
          <RoleGate allowedRoles={["OWNER", "ADMIN"]} message="Apenas administradores e proprietários podem acessar o dashboard da organização.">
            <OrgDashboardPage />
          </RoleGate>
        ),
      },
    ],
  },
]);
