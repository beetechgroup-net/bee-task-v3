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
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
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
      localStorage.setItem("user", JSON.stringify(response));
      setUser(response);
    } catch (error) {
      console.error("Failed to renew token", error);
      logout();
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData: LoginResponse = JSON.parse(storedUser);
        if (checkTokenExpiration(userData)) {
          setUser(userData);
        }
      } catch (e) {
        localStorage.removeItem("user");
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
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response);
    return response;
  };

  const refreshUser = async () => {
    try {
      const response = await authService.me();
      // We keep the old tokens since /me might not return new ones 
      // or we just update the profile part.
      // But actually, let's merge the updated profile data into the stored user.
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const updatedUser = { ...userData, ...response };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
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
