import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import productService from "../services/productService";
import StatusAlert from "./StatusAlert";
import "./ProductoDetalle.css";

const FALLBACK_TALLAS = ["S", "M", "L", "XL", "XXL"];

const normalizar = (stockData) =>
  stockData.map((s) => ({
    ...s,
    cantidadStock: s.cantidadStock ?? s.cantidad ?? 0,
  }));

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useContext(CartContext);

  const [producto, setProducto] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagenActiva, setImagenActiva] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [error, setError] = useState("");
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      setError("");

      try {
        const [productoData, stockData] = await Promise.all([
          productService.getProductoById(id),
          productService.getStockProducto(id),
        ]);

        setProducto(productoData);
        setInventario(normalizar(stockData));
        setImagenActiva(
          productoData.imagenes && productoData.imagenes.length > 0
            ? productoData.imagenes[0]
            : "https://placehold.co/600x600?text=Sin+Imagen",
        );
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProducto();
    }
  }, [id]);

  const tallasDisponibles = (
    inventario.length > 0
      ? [...inventario]
      : FALLBACK_TALLAS.map((talla) => ({ talla, cantidadStock: 0 }))
  ).sort(
    (a, b) =>
      FALLBACK_TALLAS.indexOf(a.talla) - FALLBACK_TALLAS.indexOf(b.talla),
  );

  const stockSeleccionado =
    tallasDisponibles.find((item) => item.talla === tallaSeleccionada)
      ?.cantidadStock ?? null;

  const productoDisponible = tallasDisponibles.some(
    (item) => item.cantidadStock > 0,
  );

  const handleAnadirAlCarrito = async () => {
    setFeedback({ message: "", type: "info" });

    if (!tallaSeleccionada) {
      setFeedback({
        message: "Selecciona una talla antes de anadir el articulo.",
        type: "warning",
      });
      return;
    }

    try {
      setAgregando(true);
      await agregarAlCarrito(producto, tallaSeleccionada);
      setFeedback({
        message: `${producto.equipo} se ha reservado en talla ${tallaSeleccionada}.`,
        type: "success",
      });
      // Refrescamos y normalizamos el stock tras comprar
      const stockActualizado = await productService.getStockProducto(id);
      setInventario(normalizar(stockActualizado));
    } catch (cartError) {
      setFeedback({ message: cartError.message, type: "error" });
      if (cartError.message.toLowerCase().includes("iniciar sesion")) {
        navigate("/login");
      }
    } finally {
      setAgregando(false);
    }
  };

  if (loading) {
    return (
      <div className="detalle-loading">
        <p>Cargando historia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="producto-detalle-container">
        <StatusAlert type="error" message={error} />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="producto-detalle-container">Producto no encontrado.</div>
    );
  }

  return (
    <div className="producto-detalle-container">
      <button className="btn-volver-catalogo" onClick={() => navigate(-1)}>
        Volver al catalogo
      </button>

      <div className="detalle-grid">
        <div className="galeria-container">
          <div className="imagen-principal-box">
            <img
              src={imagenActiva}
              alt={`${producto.equipo} ${producto.anio}`}
              className="imagen-principal"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src =
                  "https://placehold.co/600x600?text=Imagen+No+Disponible";
              }}
            />
          </div>

          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="miniaturas-lista">
              {producto.imagenes.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Vista miniatura ${index + 1}`}
                  className={`miniatura ${imagenActiva === img ? "activa" : ""}`}
                  onClick={() => setImagenActiva(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="info-container">
          <span className="detalle-categoria">{producto.categoria}</span>
          <h1 className="detalle-titulo">
            {producto.equipo}{" "}
            <span style={{ fontSize: "0.6em", color: "#666" }}>
              {producto.anio}
            </span>
          </h1>

          <div className="precio-container">
            <div className="detalle-precio-wrapper">
              <span className="detalle-precio">
                {Number(producto.precio).toFixed(2)} €
              </span>
              <span className="precio-iva">IVA incluido</span>
            </div>
            <div className={`badge-stock ${productoDisponible ? "disponible" : "agotado"}`}>
              {productoDisponible ? "Stock disponible" : "Sin stock"}
            </div>
          </div>

          <div className="detalle-tallas">
            <h3>Selecciona tu talla</h3>
            <div className="tallas-grid">
              {tallasDisponibles.map((item) => (
                <button
                  key={item.talla}
                  className={`btn-talla ${tallaSeleccionada === item.talla ? "seleccionada" : ""} ${item.cantidadStock < 1 ? "agotada" : ""}`}
                  onClick={() => item.cantidadStock > 0 && setTallaSeleccionada(item.talla)}
                  disabled={item.cantidadStock < 1}
                  title={
                    item.cantidadStock < 1
                      ? "Sin stock disponible"
                      : item.cantidadStock === 1
                      ? "¡Última unidad!"
                      : `Quedan ${item.cantidadStock} unidades`
                  }
                >
                  {item.talla}
                  {item.cantidadStock === 1 && item.cantidadStock > 0 && (
                    <span className="badge-ultima">¡Última!</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {stockSeleccionado !== null && (
            <StatusAlert
              type={
                stockSeleccionado === 0
                  ? "warning"
                  : stockSeleccionado === 1
                  ? "warning"
                  : "info"
              }
              message={
                stockSeleccionado === 0
                  ? `La talla ${tallaSeleccionada} esta agotada ahora mismo.`
                  : stockSeleccionado === 1
                  ? `¡Última unidad disponible en talla ${tallaSeleccionada}!`
                  : `Quedan ${stockSeleccionado} unidades en la talla ${tallaSeleccionada}.`
              }
            />
          )}

          <StatusAlert message={feedback.message} type={feedback.type} />

          <button
            className="btn-comprar-gigante"
            onClick={handleAnadirAlCarrito}
            disabled={agregando || !productoDisponible}
          >
            {agregando ? "Reservando..." : "Anadir al carrito"}
          </button>

          <ul className="lista-garantias">
            <li>Autenticidad garantizada</li>
            <li>Envio gratis en pedidos superiores a 100 EUR</li>
            <li>Pago seguro</li>
          </ul>

          <div className="detalle-descripcion">
            <h3>Historia de la prenda</h3>
            <p>
              {producto.descripcionHistorica ||
                "Una pieza imprescindible para cualquier coleccionista del futbol retro."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;