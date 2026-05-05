/* eslint react-refresh/only-export-components: off */
import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializamos con lo que haya en localStorage
  const [usuario, setUsuario] = useState(() => authService.getCurrentUser());

  // Este log es VITAL para saber por qué no sale la pestaña
  useEffect(() => {
    console.log("SISTEMA - Datos del usuario logueado:", usuario);
  }, [usuario]);

  const login = async (email, password) => {
    // Quitamos el try/catch para que el linter no llore
    const data = await authService.login(email, password);
    // data debe ser { token, rol, email ... }
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