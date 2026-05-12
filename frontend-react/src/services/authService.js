import { apiFetch, getAuthToken, getStoredUser } from './apiClient';

const login = async (email, password) => {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

const registro = async (email, password, codigoAdmin) =>
  apiFetch('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ email, password, codigoAdmin }),
  });

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => getStoredUser();

const getToken = () => getAuthToken();

const authService = {
  login,
  registro,
  logout,
  getCurrentUser,
  getToken,
};

export default authService;
