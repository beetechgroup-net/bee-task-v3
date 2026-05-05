import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService, type LoginResponse } from "../services/authService";

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeOrg: LoginResponse["organizations"][number] | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setActiveOrg: (id: number) => void;
}

const STORAGE_KEYS = {
  USER: "user",
  ACTIVE_ORG_ID: "activeOrgId",
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const setupActiveOrg = useCallback((organizations: LoginResponse["organizations"]) => {
    const storedOrgId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);
    const parsedStoredId = storedOrgId ? Number(storedOrgId) : null;
    
    const isValidOrg = organizations.some(org => org.id === parsedStoredId);

    if (isValidOrg && parsedStoredId !== null) {
      setActiveOrgId(parsedStoredId);
    } else if (organizations.length > 0) {
      const firstOrgId = organizations[0].id;
      setActiveOrgId(firstOrgId);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, firstOrgId.toString());
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const checkTokenExpiration = useCallback(
    (userData: LoginResponse) => {
      const issuedAt = new Date(userData.issuedAt).getTime();
      const expiresAt = issuedAt + userData.expiresIn * 1000;
      const now = Date.now();

      // Se já expirou
      if (now >= expiresAt) {
        logout();
        return false;
      }

      // Se falta menos de 5 minutos para vencer, tenta renovar
      const timeToExpire = expiresAt - now;
      if (timeToExpire < 300000) {
        // 5 min
        renewToken(userData.refreshToken);
      }

      return true;
    },
    [logout],
  );

  const renewToken = async (refreshToken: string) => {
    try {
      const response = await authService.refresh(refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
      setUser(response);
    } catch (error) {
      console.error("Failed to renew token", error);
      logout();
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        const userData: LoginResponse = JSON.parse(storedUser);
        if (checkTokenExpiration(userData)) {
          setUser(userData);
          setupActiveOrg(userData.organizations);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, [checkTokenExpiration]);

  // Timer para verificar expiração periodicamente
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkTokenExpiration(user);
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, [user, checkTokenExpiration]);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
    setUser(response);
    setupActiveOrg(response.organizations);
    return response;
  };

  const refreshUser = async () => {
    try {
      const response = await authService.me();
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const updatedUser = { ...userData, ...response };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Update active org if not set or if current active org is gone
        setupActiveOrg(updatedUser.organizations);
      }
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  const setActiveOrg = (id: number) => {
    setActiveOrgId(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, id.toString());
  };

  const activeOrg = React.useMemo(
    () => user?.organizations.find((org) => org.id === activeOrgId) || null,
    [user, activeOrgId],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeOrg,
        login,
        logout,
        refreshUser,
        setActiveOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
