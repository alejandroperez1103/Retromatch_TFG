import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/apiClient';
import { FiPackage, FiCalendar, FiMapPin, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import './MisPedidos.css';

const MisPedidos = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    if (!usuario?.token) {
      navigate('/login');
      return;
    }

    apiFetch('/api/pedidos')
      .then(setPedidos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [usuario, navigate]);

  const toggleExpandido = (id) => {
    setExpandido((prev) => (prev === id ? null : id));
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const calcularTotal = (detalles) => {
    if (!detalles || detalles.length === 0) return '0.00';
    return detalles
      .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="mispedidos-empty">
        <div className="mispedidos-spinner" />
        <p>Cargando tu historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mispedidos-empty">
        <p className="mispedidos-error">{error}</p>
        <button className="btn-volver" onClick={() => navigate('/')}>Volver al catálogo</button>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="mispedidos-empty">
        <FiPackage className="mispedidos-empty-icon" />
        <h2>Aún no tienes pedidos</h2>
        <p>Cuando realices una compra aparecerá aquí.</p>
        <button className="btn-volver" onClick={() => navigate('/')}>Descubrir camisetas</button>
      </div>
    );
  }

  return (
    <div className="mispedidos-container">
      <div className="mispedidos-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <FiArrowLeft /> Volver
        </button>
        <h1>Mis Pedidos</h1>
        <span className="mispedidos-count">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="mispedidos-list">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="pedido-card">
            <div className="pedido-card-top" onClick={() => toggleExpandido(pedido.id)}>
              <div className="pedido-info-grupo">
                <span className="pedido-numero">{pedido.numeroPedido}</span>
                <span className={`pedido-estado estado-${pedido.estado?.replace(/\s+/g, '-').toLowerCase()}`}>
                  {pedido.estado}
                </span>
              </div>

              <div className="pedido-meta">
                <span className="pedido-meta-item">
                  <FiCalendar /> {formatFecha(pedido.fechaCreacion)}
                </span>
                <span className="pedido-meta-item">
                  <FiMapPin /> {pedido.direccionEnvio}
                </span>
                <span className="pedido-total">
                  {calcularTotal(pedido.detalles)} €
                </span>
              </div>

              <button className="btn-toggle">
                {expandido === pedido.id ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {expandido === pedido.id && (
              <div className="pedido-detalles">
                {pedido.detalles && pedido.detalles.length > 0 ? (
                  <table className="detalles-tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Talla</th>
                        <th>Cantidad</th>
                        <th>Precio ud.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.detalles.map((detalle) => (
                        <tr key={detalle.id}>
                          <td>{detalle.inventario?.producto?.equipo ?? '—'}</td>
                          <td>{detalle.inventario?.talla ?? '—'}</td>
                          <td>{detalle.cantidad}</td>
                          <td>{Number(detalle.precioUnitario).toFixed(2)} €</td>
                          <td>{(detalle.precioUnitario * detalle.cantidad).toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="tfoot-label">Total</td>
                        <td className="tfoot-total">{calcularTotal(pedido.detalles)} €</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="sin-detalles">No hay detalles disponibles para este pedido.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisPedidos;
