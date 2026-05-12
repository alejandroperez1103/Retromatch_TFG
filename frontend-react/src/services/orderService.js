import { apiFetch } from './apiClient';

const checkout = (direccionEnvio) =>
  apiFetch('/api/pedidos/checkout', {
    method: 'POST',
    body: JSON.stringify({ direccionEnvio }),
  });

const orderService = {
  checkout,
};

export default orderService;
