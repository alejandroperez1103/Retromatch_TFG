import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import './Carrito.css';

const Carrito = () => {
  const { carrito, eliminarDelCarrito, vaciarCarrito, totalPrecio } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (carrito.length === 0 || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, carrito.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <FiShoppingBag className="icono-bolsa-vacia" />
        <h2>Tu carrito está vacío</h2>
        <p>Aún no has seleccionado ninguna joya histórica.</p>
        <Link to="/" className="btn-volver-catalogo">
          <FiArrowLeft /> Descubrir camisetas
        </Link>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <h2>Tu Carrito</h2>
        <div className={`timer-box ${timeLeft < 300 ? 'danger' : ''}`}>
          <span>Reserva de artículos:</span>
          <span className="timer">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="carrito-content">
        {/* LISTA DE PRODUCTOS */}
        <div className="carrito-items">
          {carrito.map((item, index) => {
            
            // Lógica robusta para las imágenes (Igual que en el Home)
            const imagenPrincipal = (item.imagenes && item.imagenes.length > 0) 
              ? item.imagenes[0] 
              : (item.imagenUrl || "https://placehold.co/300x300?text=Sin+Imagen");

            return (
              <div key={`${item.id}-${index}`} className="cart-item">
                <div className="cart-item-img-wrapper">
                  <img 
                    src={imagenPrincipal} 
                    alt={item.equipo} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x300?text=Imagen+No+Disponible";
                    }}
                  />
                </div>
                
                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <h3>{item.equipo}</h3>
                    <p className="item-precio">{item.precio.toFixed(2)} €</p>
                  </div>
                  <p className="item-season">Temporada {item.anio}</p>
                  
                  {/* Mostramos la talla si el usuario la seleccionó */}
                  <p className="item-talla">
                    Talla: <strong>{item.talla || 'Única'}</strong>
                  </p>

                  <div className="cart-item-actions">
                    <button 
                      className="btn-eliminar" 
                      onClick={() => eliminarDelCarrito(item.id)}
                      title="Eliminar producto"
                    >
                      <FiTrash2 /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMEN DEL PEDIDO (Sticky) */}
        <div className="carrito-resumen-container">
          <div className="carrito-resumen">
            <h3>Resumen</h3>
            
            <div className="resumen-fila">
              <span>Subtotal ({carrito.length} artículos)</span>
              <span>{totalPrecio.toFixed(2)} €</span>
            </div>
            <div className="resumen-fila">
              <span>Gastos de envío</span>
              <span>{totalPrecio > 100 ? 'Gratis' : '4.99 €'}</span>
            </div>
            
            <div className="resumen-fila total">
              <span>Total a pagar</span>
              <span>{(totalPrecio + (totalPrecio > 100 ? 0 : 4.99)).toFixed(2)} €</span>
            </div>
            
            <p className="iva-incluido">IVA incluido</p>

            <button className="btn-pagar" onClick={() => navigate('/checkout')}>
              Finalizar Compra
            </button>
            
            <button className="btn-vaciar" onClick={vaciarCarrito}>
              Vaciar Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;