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

export const router = createBrowserRouter([
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
        path: "board",
        element: <TaskBoardPage />,
      },
      {
        path: "admin",
        element: <OrganizationAdminPage />,
      },
      {
        path: "requests",
        element: <MyRequestsPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
    ],
  },
]);
