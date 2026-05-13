import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext";
import orderService from "../services/orderService";
import StatusAlert from "./StatusAlert";
import { FiLock, FiCheckCircle, FiShield } from "react-icons/fi";
import "./Checkout.css";

const Checkout = () => {
  const { usuario } = useContext(AuthContext);
  const { carrito, totalPrecio, refrescarCarrito, cartLoading } =
    useContext(CartContext);
  const navigate = useNavigate();

  const [procesando, setProcesando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [formData, setFormData] = useState({
    nombreTarjeta: "",
    numeroTarjeta: "",
    expiracion: "",
    cvc: "",
    direccionEnvio: "",
  });
  const [errores, setErrores] = useState({});

  const subtotal = totalPrecio;
  const gastosEnvio = subtotal > 100 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + gastosEnvio;

  // ── Formateadores ──────────────────────────────────────────────

  const formatNumeroTarjeta = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiracion = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const formatCvc = (value) => value.replace(/\D/g, "").slice(0, 3);

  const formatNombre = (value) =>
    value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");

  // ── Validadores ────────────────────────────────────────────────

  const validarCampo = (name, value) => {
    switch (name) {
      case "nombreTarjeta": {
        if (!value.trim()) return "El nombre es obligatorio";
        if (value.trim().length < 3) return "El nombre es demasiado corto";
        return "";
      }
      case "numeroTarjeta": {
        const digits = value.replace(/\s/g, "");
        if (!digits) return "El número de tarjeta es obligatorio";
        if (digits.length < 16) return `Faltan ${16 - digits.length} dígitos`;
        return "";
      }
      case "expiracion": {
        if (!value) return "La fecha de expiración es obligatoria";
        if (!/^\d{2}\/\d{2}$/.test(value))
          return "Formato incorrecto, usa MM/AA";
        const [mm, aa] = value.split("/").map(Number);
        if (mm < 1 || mm > 12) return "El mes debe estar entre 01 y 12";
        const now = new Date();
        const expDate = new Date(2000 + aa, mm - 1);
        if (expDate < new Date(now.getFullYear(), now.getMonth()))
          return "La tarjeta está caducada";
        return "";
      }
      case "cvc": {
        if (!value) return "El CVC es obligatorio";
        if (value.length < 3) return `Faltan ${3 - value.length} dígitos`;
        return "";
      }
      case "direccionEnvio": {
        if (!value.trim()) return "La dirección de envío es obligatoria";
        if (value.trim().length < 10) return "Introduce una dirección completa";
        return "";
      }
      default:
        return "";
    }
  };

  const validarTodo = () => {
    const nuevosErrores = {};
    Object.keys(formData).forEach((key) => {
      const error = validarCampo(key, formData[key]);
      if (error) nuevosErrores[key] = error;
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ── Handlers ───────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === "numeroTarjeta") formatted = formatNumeroTarjeta(value);
    if (name === "expiracion") formatted = formatExpiracion(value);
    if (name === "cvc") formatted = formatCvc(value);
    if (name === "nombreTarjeta") formatted = formatNombre(value);

    setFormData((prev) => ({ ...prev, [name]: formatted }));

    // Validar en tiempo real si ya había un error
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: validarCampo(name, formatted),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const handlePago = async (e) => {
    e.preventDefault();
    setFeedback({ message: "", type: "info" });

    if (!validarTodo()) {
      setFeedback({
        message: "Revisa los campos del formulario antes de continuar.",
        type: "error",
      });
      return;
    }

    setProcesando(true);
    try {
      const pedido = await orderService.checkout(formData.direccionEnvio);
      setPedidoConfirmado(pedido);
      await refrescarCarrito();
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    } finally {
      setProcesando(false);
    }
  };

  // ── Renders condicionales ──────────────────────────────────────

  if (!usuario) {
    return (
      <div className="checkout-container empty">
        <h2>Necesitas iniciar sesion</h2>
        <button
          className="btn-volver-catalogo"
          onClick={() => navigate("/login")}
        >
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
        <button className="btn-volver-catalogo" onClick={() => navigate("/")}>
          Volver a la tienda
        </button>
      </div>
    );
  }

  if (pedidoConfirmado) {
    return (
      <div className="checkout-container success">
        <FiCheckCircle className="success-icon" />
        <h2>Pago completado con exito</h2>
        <p>
          Tu pedido se ha registrado correctamente y ya estamos preparandolo.
        </p>
        <p>
          Numero de pedido: <strong>{pedidoConfirmado.numeroPedido}</strong>
        </p>
        <button
          className="btn-volver-catalogo"
          style={{ marginTop: "2rem" }}
          onClick={() => navigate("/")}
        >
          Volver al catalogo
        </button>
      </div>
    );
  }

  // ── Formulario ─────────────────────────────────────────────────

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <div className="checkout-card">
          <div className="checkout-header-title">
            <h2>Pago Seguro</h2>
            <FiLock className="lock-icon" />
          </div>

          <StatusAlert message={feedback.message} type={feedback.type} />

          <form onSubmit={handlePago} className="checkout-form" noValidate>
            <div className="form-group">
              <label>Dirección de envío</label>
              <input
                name="direccionEnvio"
                type="text"
                placeholder="Calle, número, ciudad y código postal"
                value={formData.direccionEnvio}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errores.direccionEnvio ? "input-error" : ""}
              />
              {errores.direccionEnvio && (
                <span className="error-msg">{errores.direccionEnvio}</span>
              )}
            </div>

            <div className="form-group">
              <label>Nombre en la tarjeta</label>
              <input
                name="nombreTarjeta"
                type="text"
                placeholder="Nombre completo del titular"
                value={formData.nombreTarjeta}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errores.nombreTarjeta ? "input-error" : ""}
              />
              {errores.nombreTarjeta && (
                <span className="error-msg">{errores.nombreTarjeta}</span>
              )}
            </div>

            <div className="form-group">
              <label>Número de tarjeta</label>
              <input
                name="numeroTarjeta"
                type="text"
                placeholder="0000 0000 0000 0000"
                value={formData.numeroTarjeta}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                className={errores.numeroTarjeta ? "input-error" : ""}
              />
              {errores.numeroTarjeta && (
                <span className="error-msg">{errores.numeroTarjeta}</span>
              )}
            </div>

            <div className="form-grid-pago">
              <div className="form-group">
                <label>Fecha de expiración</label>
                <input
                  name="expiracion"
                  type="text"
                  placeholder="MM/AA"
                  value={formData.expiracion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="numeric"
                  className={errores.expiracion ? "input-error" : ""}
                />
                {errores.expiracion && (
                  <span className="error-msg">{errores.expiracion}</span>
                )}
              </div>
              <div className="form-group">
                <label>CVC / CVV</label>
                <input
                  name="cvc"
                  type="password"
                  placeholder="•••"
                  value={formData.cvc}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="numeric"
                  className={errores.cvc ? "input-error" : ""}
                />
                {errores.cvc && (
                  <span className="error-msg">{errores.cvc}</span>
                )}
              </div>
            </div>

            <div className="pago-seguro-badge">
              <FiShield />{" "}
              <span>
                Tus datos están encriptados y protegidos mediante SSL.
              </span>
            </div>

            <button
              type="submit"
              className={`btn-pagar-premium ${procesando ? "procesando" : ""}`}
              disabled={procesando}
            >
              {procesando
                ? "Procesando pago..."
                : `Pagar ${total.toFixed(2)} €`}
            </button>

            <button
              type="button"
              className="btn-cancelar-premium"
              onClick={() => navigate("/carrito")}
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
              const imagenPrincipal =
                item.imagenes?.[0] ||
                "https://placehold.co/100x100?text=Imagen";
              return (
                <div key={index} className="summary-item-mini">
                  <img
                    src={imagenPrincipal}
                    alt={item.equipo}
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/100x100")
                    }
                  />
                  <div className="summary-item-info">
                    <h4>{item.equipo}</h4>
                    <p>Talla: {item.talla || "Unica"}</p>
                  </div>
                  <div className="summary-item-price">
                    {(item.precio * item.cantidad).toFixed(2)} €
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="summary-row">
              <span>Gastos de envío</span>
              <span>
                {gastosEnvio === 0 ? "Gratis" : `${gastosEnvio.toFixed(2)} €`}
              </span>
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
