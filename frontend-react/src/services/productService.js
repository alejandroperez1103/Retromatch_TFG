import { apiFetch } from './apiClient';

const getProductos = () => apiFetch('/api/productos');

const getProductoById = (id) => apiFetch(`/api/productos/${id}`);

const getStockProducto = (id) => apiFetch(`/api/productos/${id}/stock`);

const crearProducto = (producto) =>
  apiFetch('/api/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  });

const actualizarProducto = (id, producto) =>
  apiFetch(`/api/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto),
  });

const eliminarProducto = (id) =>
  apiFetch(`/api/productos/${id}`, {
    method: 'DELETE',
  });

const productService = {
  getProductos,
  getProductoById,
  getStockProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};

export default productService;
