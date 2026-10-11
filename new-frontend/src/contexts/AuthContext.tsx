import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  authService,
  type LoginResponse,
  type CreateAccountResponse,
  type OrganizationMembership,
} from '../services/authService'

interface AuthContextType {
  user: LoginResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  activeOrg: OrganizationMembership | null
  login: (email: string, password: string) => Promise<LoginResponse>
  register: (name: string, email: string, password: string) => Promise<CreateAccountResponse>
  logout: () => void
  refreshUser: () => Promise<void>
  setActiveOrg: (id: number) => void
}

const STORAGE_KEYS = {
  USER: 'user',
  ACTIVE_ORG_ID: 'activeOrgId',
} as const

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setupActiveOrg = useCallback((organizations: OrganizationMembership[]) => {
    const storedOrgId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID)
    const parsedStoredId = storedOrgId ? Number(storedOrgId) : null

    const isValidOrg = organizations.some((org) => org.id === parsedStoredId)

    if (isValidOrg && parsedStoredId !== null) {
      setActiveOrgId(parsedStoredId)
    } else if (organizations.length > 0) {
      const firstOrgId = organizations[0].id
      setActiveOrgId(firstOrgId)
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, firstOrgId.toString())
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG_ID)
    setUser(null)
    setActiveOrgId(null)
  }, [])

  const renewToken = useCallback(async (refreshToken: string) => {
    try {
      const response = await authService.refresh(refreshToken)
      response.issuedAt = new Date().toISOString()
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response))
      setUser(response)
    } catch {
      logout()
    }
  }, [logout])

  const checkTokenExpiration = useCallback(
    (userData: LoginResponse) => {
      const issuedAt = new Date(userData.issuedAt).getTime()
      const expiresAt = issuedAt + userData.expiresIn * 1000
      const now = Date.now()

      if (now >= expiresAt) {
        logout()
        return false
      }

      // Se expirar em menos de 5 min, renova
      if (expiresAt - now < 300000) {
        renewToken(userData.refreshToken)
      }

      return true
    },
    [logout, renewToken]
  )

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (storedUser) {
      try {
        const userData: LoginResponse = JSON.parse(storedUser)
        if (checkTokenExpiration(userData)) {
          setUser(userData)
          setupActiveOrg(userData.organizations)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
    setIsLoading(false)
  }, [checkTokenExpiration, setupActiveOrg])

  // Verificação periódica a cada 60 segundos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      checkTokenExpiration(user)
    }, 60000)

    return () => clearInterval(interval)
  }, [user, checkTokenExpiration])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    response.issuedAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response))
    setUser(response)
    setupActiveOrg(response.organizations)
    return response
  }

  const register = async (name: string, email: string, password: string) => {
    return authService.register(name, email, password)
  }

  const refreshUser = async () => {
    try {
      const response = await authService.me()
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        const updatedUser = { ...userData, ...response }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
        setUser(updatedUser)
        setupActiveOrg(updatedUser.organizations)
      }
    } catch {
      // Ignora erro
    }
  }

  const setActiveOrg = (id: number) => {
    setActiveOrgId(id)
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, id.toString())
  }

  const activeOrg = useMemo(
    () => user?.organizations.find((org) => org.id === activeOrgId) || null,
    [user, activeOrgId]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeOrg,
        login,
        register,
        logout,
        refreshUser,
        setActiveOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
