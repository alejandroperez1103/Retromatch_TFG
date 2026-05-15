import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import StatusAlert from "./StatusAlert";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import "./Carrito.css";

const Carrito = () => {
  const { usuario } = useContext(AuthContext);
  const {
    carrito,
    eliminarDelCarrito,
    vaciarCarrito,
    totalPrecio,
    cartLoading,
    cartError,
    limpiarErrorCarrito,
  } = useContext(CartContext);
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [procesando, setProcesando] = useState("");

  useEffect(() => {
    if (carrito.length === 0) {
      setTimeLeft(null);
      return;
    }

    const actualizarTiempo = () => {
      const expiraciones = carrito
        .map((item) => new Date(item.fechaExpiracion).getTime())
        .filter((value) => Number.isFinite(value));

      if (expiraciones.length === 0) {
        setTimeLeft(null);
        return;
      }

      const siguienteExpiracion = Math.min(...expiraciones);
      const segundosRestantes = Math.max(
        0,
        Math.floor((siguienteExpiracion - Date.now()) / 1000),
      );
      setTimeLeft(segundosRestantes);
    };

    actualizarTiempo();
    const timerId = setInterval(actualizarTiempo, 1000);

    return () => clearInterval(timerId);
  }, [carrito]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const gastosEnvio = totalPrecio > 100 || totalPrecio === 0 ? 0 : 4.99;
  const total = totalPrecio + gastosEnvio;

  const handleEliminar = async (reservaId) => {
    setFeedback({ message: "", type: "info" });
    limpiarErrorCarrito();
    setProcesando(`eliminar-${reservaId}`);

    try {
      await eliminarDelCarrito(reservaId);
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    } finally {
      setProcesando("");
    }
  };

  const handleVaciar = async () => {
    setFeedback({ message: "", type: "info" });
    limpiarErrorCarrito();
    setProcesando("vaciar");

    try {
      await vaciarCarrito();
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    } finally {
      setProcesando("");
    }
  };

  if (!usuario) {
    return (
      <div className="carrito-vacio">
        <FiShoppingBag className="icono-bolsa-vacia" />
        <h2>Inicia sesion para ver tu carrito</h2>
        <p>Las reservas de stock solo se guardan para usuarios autenticados.</p>
        <Link to="/login" className="btn-volver-catalogo">
          Acceder
        </Link>
      </div>
    );
  }

  if (cartLoading && carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <FiShoppingBag className="icono-bolsa-vacia" />
        <h2>Cargando tu carrito...</h2>
      </div>
    );
  }

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
      <StatusAlert
        message={feedback.message || cartError}
        type={feedback.message ? feedback.type : "error"}
      />
      {timeLeft !== null && timeLeft === 0 && (
        <StatusAlert
          message="La reserva esta a punto de expirar o ya ha expirado. Revisa el pedido antes de pagar."
          type="warning"
        />
      )}

      <div className="carrito-header">
        <h2>Tu Carrito</h2>
        <div className={`timer-box ${timeLeft !== null && timeLeft < 300 ? "danger" : ""}`}>
          <span>Reserva de articulos:</span>
          <span className="timer">
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </span>
        </div>
      </div>

      <div className="carrito-content">
        {/* LISTA DE PRODUCTOS */}
        <div className="carrito-items">
          {carrito.map((item, index) => {
            const imagenPrincipal =
              item.imagenes?.[0] ||
              "https://placehold.co/300x300?text=Sin+Imagen";

            return (
              <div key={`${item.reservaId}-${index}`} className="cart-item">
                <div className="cart-item-img-wrapper">
                  <img
                    src={imagenPrincipal}
                    alt={item.equipo}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/300x300?text=Imagen+No+Disponible";
                    }}
                  />
                </div>

                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <h3>{item.equipo}</h3>
                    <p className="item-precio">
                      {(item.precio * item.cantidad).toFixed(2)} €
                    </p>
                  </div>
                  <p className="item-season">Temporada {item.anio}</p>

                  <p className="item-talla">
                    Talla: <strong>{item.talla || "Unica"}</strong>
                  </p>

                  <div className="cart-item-actions">
                    <button
                      className="btn-eliminar"
                      onClick={() => handleEliminar(item.reservaId)}
                      title="Eliminar producto"
                      disabled={
                        procesando === `eliminar-${item.reservaId}` ||
                        procesando === "vaciar"
                      }
                    >
                      <FiTrash2 />{" "}
                      {procesando === `eliminar-${item.reservaId}`
                        ? "Eliminando..."
                        : "Eliminar"}
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
              <span>Subtotal ({carrito.length} articulos)</span>
              <span>{totalPrecio.toFixed(2)} €</span>
            </div>
            <div className="resumen-fila">
              <span>Gastos de envio</span>
              <span>
                {gastosEnvio === 0 ? "Gratis" : `${gastosEnvio.toFixed(2)} €`}
              </span>
            </div>

            <div className="resumen-fila total">
              <span>Total a pagar</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <p className="iva-incluido">IVA incluido</p>

            <button
              className="btn-pagar"
              onClick={() => navigate("/checkout")}
              disabled={procesando !== ""}
            >
              Finalizar Compra
            </button>

            <button
              className="btn-vaciar"
              onClick={handleVaciar}
              disabled={procesando !== ""}
            >
              {procesando === "vaciar" ? "Vaciando..." : "Vaciar Carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
