import { createBrowserRouter } from 'react-router-dom'

import { CreateTaskPage } from './pages/CreateTaskPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CreateTaskPage />,
  },
])
