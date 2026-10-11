import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TimerProvider } from './contexts/TimerContext'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { OrganizationsPage } from './pages/OrganizationsPage'
import { TasksPage } from './pages/TasksPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Rotas Protegidas dentro do AppShell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/kanban" element={<TasksPage />} />
              <Route path="/projects" element={<DashboardPage />} />
              <Route path="/categories" element={<DashboardPage />} />
              <Route path="/analytics" element={<DashboardPage />} />
              <Route path="/members" element={<OrganizationsPage />} />
              <Route path="/organization/settings" element={<OrganizationsPage />} />
              <Route path="/profile" element={<DashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
