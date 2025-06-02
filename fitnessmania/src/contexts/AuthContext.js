import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    userId: null,
  });
  const [loading, setLoading] = useState(true);

  // On initial load, read from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (storedUserId) {
      setAuth({
        userId: storedUserId,
      });
    }
    setLoading(false);
  }, []);

  // Login function: save both userId and username
  const login = (userId) => {
    setAuth({ userId});
    localStorage.setItem("userId", userId);
  };

  // Logout: clear both
  const logout = () => {
    setAuth({ userId: null});
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth
export const useAuth = () => useContext(AuthContext);
