import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext';
import orderService from '../services/orderService';
import StatusAlert from './StatusAlert';
import { FiLock, FiCheckCircle, FiShield } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const { usuario } = useContext(AuthContext);
  const { carrito, totalPrecio, refrescarCarrito, cartLoading } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [procesando, setProcesando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: 'info' });
  const [formData, setFormData] = useState({
    nombreTarjeta: '',
    numeroTarjeta: '',
    expiracion: '',
    cvc: '',
    direccionEnvio: '',
  });

  const subtotal = totalPrecio;
  const gastosEnvio = subtotal > 100 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + gastosEnvio;

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePago = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', type: 'info' });
    setProcesando(true);

    try {
      const pedido = await orderService.checkout(formData.direccionEnvio);
      setPedidoConfirmado(pedido);
      await refrescarCarrito();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="checkout-container empty">
        <h2>Necesitas iniciar sesion</h2>
        <button className="btn-volver-catalogo" onClick={() => navigate('/login')}>
          Ir al acceso
        </button>
      </div>
    );
  }

  if (cartLoading && carrito.length === 0 && !pedidoConfirmado) {
    return (
      <div className="checkout-container empty">
        <h2>Actualizando tu carrito...</h2>
      </div>
    );
  }

  if (carrito.length === 0 && !pedidoConfirmado) {
    return (
      <div className="checkout-container empty">
        <h2>Tu carrito está vacío</h2>
        <button className="btn-volver-catalogo" onClick={() => navigate('/')}>Volver a la tienda</button>
      </div>
    );
  }

  if (pedidoConfirmado) {
    return (
      <div className="checkout-container success">
        <FiCheckCircle className="success-icon" />
        <h2>Pago completado con exito</h2>
        <p>Tu pedido se ha registrado correctamente y ya estamos preparandolo.</p>
        <p>Numero de pedido: <strong>{pedidoConfirmado.numeroPedido}</strong></p>
        <button className="btn-volver-catalogo" style={{marginTop: '2rem'}} onClick={() => navigate('/')}>
          Volver al catalogo
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <div className="checkout-card">
          <div className="checkout-header-title">
            <h2>Pago Seguro</h2>
            <FiLock className="lock-icon" />
          </div>

          <StatusAlert message={feedback.message} type={feedback.type} />
          
          <form onSubmit={handlePago} className="checkout-form">
            <div className="form-group">
              <label>Direccion de envio</label>
              <input
                name="direccionEnvio"
                type="text"
                placeholder="Calle, numero, ciudad y codigo postal"
                value={formData.direccionEnvio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre en la tarjeta</label>
              <input
                name="nombreTarjeta"
                type="text"
                placeholder="Nombre completo del titular"
                value={formData.nombreTarjeta}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Numero de Tarjeta</label>
              <input
                name="numeroTarjeta"
                type="text"
                placeholder="0000 0000 0000 0000"
                maxLength="16"
                value={formData.numeroTarjeta}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-grid-pago">
              <div className="form-group">
                <label>Fecha de expiracion</label>
                <input
                  name="expiracion"
                  type="text"
                  placeholder="MM/AA"
                  maxLength="5"
                  value={formData.expiracion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>CVC / CVV</label>
                <input
                  name="cvc"
                  type="password"
                  placeholder="***"
                  maxLength="4"
                  value={formData.cvc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="pago-seguro-badge">
              <FiShield /> <span>Tus datos estan encriptados y protegidos mediante SSL.</span>
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

        <div className="checkout-summary">
          <h3>Resumen de la compra</h3>
          <div className="summary-items">
            {carrito.map((item, index) => {
               const imagenPrincipal = (item.imagenes && item.imagenes.length > 0) 
                 ? item.imagenes[0] 
                 : (item.imagenUrl || "https://placehold.co/100x100?text=Imagen");

               return (
                 <div key={index} className="summary-item-mini">
                    <img src={imagenPrincipal} alt={item.equipo} onError={(e) => e.target.src="https://placehold.co/100x100"} />
                   <div className="summary-item-info">
                     <h4>{item.equipo}</h4>
                     <p>Talla: {item.talla || 'Unica'}</p>
                   </div>
                   <div className="summary-item-price">
                     {(item.precio * item.cantidad).toFixed(2)} €
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
              <span>Gastos de envio</span>
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
