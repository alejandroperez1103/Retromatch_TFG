/* eslint react-refresh/only-export-components: off */
import { createContext, useState } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => authService.getCurrentUser());

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUsuario(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
