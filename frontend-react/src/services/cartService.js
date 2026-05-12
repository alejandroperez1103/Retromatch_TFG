import { apiFetch } from './apiClient';

const getCarrito = () => apiFetch('/api/reservas');

const anadirAlCarrito = ({ productoId, talla, cantidad }) =>
  apiFetch('/api/reservas', {
    method: 'POST',
    body: JSON.stringify({ productoId, talla, cantidad }),
  });

const eliminarReserva = (reservaId) =>
  apiFetch(`/api/reservas/${reservaId}`, {
    method: 'DELETE',
  });

const vaciarCarrito = () =>
  apiFetch('/api/reservas', {
    method: 'DELETE',
  });

const cartService = {
  getCarrito,
  anadirAlCarrito,
  eliminarReserva,
  vaciarCarrito,
};

export default cartService;
