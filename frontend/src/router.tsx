import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { CreateTaskPage } from './pages/CreateTaskPage'
import { TaskListPage } from './pages/TaskListPage'
import { TaskBoardPage } from './pages/TaskBoardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <CreateTaskPage />,
      },
      {
        path: 'tasks',
        element: <TaskListPage />,
      },
      {
        path: 'board',
        element: <TaskBoardPage />,
      },
    ],
  },
])
