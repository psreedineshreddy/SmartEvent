import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload.role || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const role = getRoleFromToken(token);

  const login = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}