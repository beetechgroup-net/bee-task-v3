import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { TimerProvider } from './contexts/TimerContext'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { DashboardV2Page } from './pages/DashboardV2Page'
import { OrganizationsPage } from './pages/OrganizationsPage'
import { TasksPage } from './pages/TasksPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { MembersPage } from './pages/MembersPage'
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ProfilePage } from './pages/ProfilePage'

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
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
              <Route path="/dashboard-v2" element={<DashboardV2Page />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/kanban" element={<TasksPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/organization/settings" element={<OrganizationSettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </TimerProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
