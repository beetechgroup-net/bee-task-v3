import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { CreateTaskPage } from "./pages/CreateTaskPage";
import { TaskListPage } from "./pages/TaskListPage";
import { TaskBoardPage } from "./pages/TaskBoardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

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
    ],
  },
]);
