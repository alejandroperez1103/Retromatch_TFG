import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FiLock, FiCheckCircle, FiShield } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const { carrito, vaciarCarrito } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [procesando, setProcesando] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);

  // --- LÓGICA DE PRECIOS PROFESIONAL ---
  const subtotal = carrito.reduce((acc, item) => acc + item.precio, 0);
  const gastosEnvio = subtotal > 100 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + gastosEnvio;

  const handlePago = (e) => {
    e.preventDefault();
    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      setPagoCompletado(true);
      vaciarCarrito();
    }, 2000);
  };

  // Pantalla de carrito vacío por acceso directo
  if (carrito.length === 0 && !pagoCompletado) {
    return (
      <div className="checkout-container empty">
        <h2>Tu carrito está vacío</h2>
        <button className="btn-volver-catalogo" onClick={() => navigate('/')}>Volver a la tienda</button>
      </div>
    );
  }

  // PANTALLA DE ÉXITO
  if (pagoCompletado) {
    return (
      <div className="checkout-container success">
        <FiCheckCircle className="success-icon" />
        <h2>¡Pago completado con éxito!</h2>
        <p>Tu pedido histórico está en camino. Recibirás un correo de confirmación en breve.</p>
        <button className="btn-volver-catalogo" style={{marginTop: '2rem'}} onClick={() => navigate('/')}>
          Volver al Catálogo
        </button>
      </div>
    );
  }

  // PANTALLA DE FORMULARIO DE PAGO A DOS COLUMNAS
  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO DE PAGO --- */}
        <div className="checkout-card">
          <div className="checkout-header-title">
            <h2>Pago Seguro</h2>
            <FiLock className="lock-icon" />
          </div>
          
          <form onSubmit={handlePago} className="checkout-form">
            <div className="form-group">
              <label>Nombre en la tarjeta</label>
              <input type="text" placeholder="Nombre completo del titular" required />
            </div>
            
            <div className="form-group">
              <label>Número de Tarjeta</label>
              <input type="text" placeholder="0000 0000 0000 0000" maxLength="16" required />
            </div>
            
            <div className="form-grid-pago">
              <div className="form-group">
                <label>Fecha de expiración</label>
                <input type="text" placeholder="MM/AA" maxLength="5" required />
              </div>
              <div className="form-group">
                <label>CVC / CVV</label>
                <input type="password" placeholder="***" maxLength="4" required />
              </div>
            </div>

            <div className="pago-seguro-badge">
              <FiShield /> <span>Tus datos están encriptados y protegidos mediante SSL.</span>
            </div>

            <button 
              type="submit" 
              className={`btn-pagar-premium ${procesando ? 'procesando' : ''}`}
              disabled={procesando}
            >
              {procesando ? 'Procesando pago...' : `Pagar ${total.toFixed(2)} €`}
            </button>
            
            <button 
              type="button" 
              className="btn-cancelar-premium" 
              onClick={() => navigate('/carrito')}
              disabled={procesando}
            >
              Cancelar y volver al carrito
            </button>
          </form>
        </div>

        {/* --- COLUMNA DERECHA: RESUMEN DEL PEDIDO --- */}
        <div className="checkout-summary">
          <h3>Resumen de la compra</h3>
          <div className="summary-items">
            {carrito.map((item, index) => {
               // Manejo de imagen robusto
               const imagenPrincipal = (item.imagenes && item.imagenes.length > 0) 
                 ? item.imagenes[0] 
                 : (item.imagenUrl || "https://placehold.co/100x100?text=Imagen");

               return (
                 <div key={index} className="summary-item-mini">
                   <img src={imagenPrincipal} alt={item.equipo} onError={(e) => e.target.src="https://placehold.co/100x100"} />
                   <div className="summary-item-info">
                     <h4>{item.equipo}</h4>
                     <p>Talla: {item.talla || 'Única'}</p>
                   </div>
                   <div className="summary-item-price">
                     {item.precio.toFixed(2)} €
                   </div>
                 </div>
               )
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="summary-row">
              <span>Gastos de envío</span>
              <span>{gastosEnvio === 0 ? 'Gratis' : `${gastosEnvio.toFixed(2)} €`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;