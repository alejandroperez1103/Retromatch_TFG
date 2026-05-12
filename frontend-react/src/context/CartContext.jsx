import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext.jsx';
import cartService from '../services/cartService';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

const mapReservaToCartItem = (reserva) => {
  const producto = reserva.inventario?.producto ?? {};

  return {
    reservaId: reserva.id,
    id: producto.id ?? reserva.id,
    equipo: producto.equipo ?? 'Articulo sin nombre',
    anio: producto.anio ?? '',
    precio: Number(producto.precio ?? 0),
    imagenes: producto.imagenes ?? [],
    talla: reserva.inventario?.talla ?? '',
    cantidad: reserva.cantidad ?? 1,
    fechaExpiracion: reserva.fechaExpiracion ?? null,
  };
};

export const CartProvider = ({ children }) => {
  const { usuario } = useContext(AuthContext);
  const [carrito, setCarrito] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const refrescarCarrito = async () => {
    if (!usuario?.token) {
      setCarrito([]);
      setCartError('');
      return [];
    }

    setCartLoading(true);

    try {
      const reservas = await cartService.getCarrito();
      const carritoNormalizado = reservas.map(mapReservaToCartItem);
      setCarrito(carritoNormalizado);
      setCartError('');
      return carritoNormalizado;
    } catch (error) {
      setCartError(error.message);
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const sincronizarCarrito = async () => {
      if (!usuario?.token) {
        setCarrito([]);
        setCartError('');
        return;
      }

      setCartLoading(true);

      try {
        const reservas = await cartService.getCarrito();

        if (!ignore) {
          setCarrito(reservas.map(mapReservaToCartItem));
          setCartError('');
        }
      } catch (error) {
        if (!ignore) {
          setCartError(error.message);
        }
      } finally {
        if (!ignore) {
          setCartLoading(false);
        }
      }
    };

    sincronizarCarrito();

    return () => {
      ignore = true;
    };
  }, [usuario]);

  const agregarAlCarrito = async (producto, talla) => {
    if (!usuario?.token) {
      throw new Error('Debes iniciar sesion para anadir articulos al carrito.');
    }

    if (!talla) {
      throw new Error('Selecciona una talla antes de continuar.');
    }

    await cartService.anadirAlCarrito({
      productoId: producto.id,
      talla,
      cantidad: 1,
    });

    return refrescarCarrito();
  };

  const eliminarDelCarrito = async (reservaId) => {
    await cartService.eliminarReserva(reservaId);
    return refrescarCarrito();
  };

  const vaciarCarrito = async () => {
    if (!usuario?.token) {
      setCarrito([]);
      return;
    }

    await cartService.vaciarCarrito();
    setCarrito([]);
    setCartError('');
  };

  const limpiarErrorCarrito = () => {
    setCartError('');
  };

  const totalPrecio = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const cantidadArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        refrescarCarrito,
        limpiarErrorCarrito,
        totalPrecio,
        cantidadArticulos,
        cartLoading,
        cartError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
