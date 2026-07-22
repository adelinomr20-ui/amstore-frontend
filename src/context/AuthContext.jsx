import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("amstore_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const encoded = btoa(`${email}:${password}`);
    localStorage.setItem("amstore_auth", encoded);

    try {
      // Este endpoint hay que agregarlo en el backend (ver instrucciones)
      const { data } = await api.get("/auth/me");
      const userData = { username: data.username, roles: data.roles };
      localStorage.setItem("amstore_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      localStorage.removeItem("amstore_auth");
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem("amstore_auth");
    localStorage.removeItem("amstore_user");
    setUser(null);
  }

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
