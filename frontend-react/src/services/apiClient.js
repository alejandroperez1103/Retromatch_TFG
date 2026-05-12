const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getStoredUser = () => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const getAuthToken = () => getStoredUser()?.token ?? null;

const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

const extractErrorMessage = async (response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);

    if (data?.message) {
      return data.message;
    }

    if (data?.mensaje) {
      return data.mensaje;
    }
  }

  const text = await response.text().catch(() => '');

  if (!text) {
    if (response.status === 401) {
      return 'Debes iniciar sesion para continuar.';
    }

    if (response.status === 403) {
      return 'No tienes permisos para realizar esta accion.';
    }

    return 'No se pudo completar la solicitud.';
  }

  if (text.trim().startsWith('<!DOCTYPE html') || text.trim().startsWith('<html')) {
    if (response.status === 401) {
      return 'Debes iniciar sesion para continuar.';
    }

    if (response.status === 403) {
      return 'No tienes permisos para realizar esta accion.';
    }

    return 'El servidor devolvio una respuesta inesperada.';
  }

  return text;
};

const apiFetch = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

export { API_BASE_URL, apiFetch, getAuthToken, getStoredUser };
