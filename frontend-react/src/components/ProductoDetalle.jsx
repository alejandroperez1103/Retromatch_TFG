import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductoDetalle.css'; 

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useContext(CartContext);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenActiva, setImagenActiva] = useState('');
  
  // Estado para gestionar la talla seleccionada
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');

  // Tallas disponibles (idealmente esto vendría de tu base de datos)
  const tallasDisponibles = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };

        if (token && token !== 'null' && token !== 'undefined' && token.length > 20) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) throw new Error('Producto no encontrado');
        
        const data = await response.json();
        setProducto(data);
        
        if (data.imagenes && data.imagenes.length > 0) {
          setImagenActiva(data.imagenes[0]);
        } else {
          setImagenActiva("https://placehold.co/600x600?text=Sin+Imagen");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error en el detalle:", error);
        setLoading(false);
      }
    };

    if (id) fetchProducto();
  }, [id]);

  const handleAñadirAlCarrito = () => {
    if (!tallaSeleccionada) {
      alert("⚠️ Por favor, selecciona una talla antes de añadir el producto al carrito.");
      return;
    }
    
    agregarAlCarrito({ ...producto, talla: tallaSeleccionada });
    alert(`✅ Añadido al carrito: ${producto.equipo} (Talla ${tallaSeleccionada})`);
  };

  if (loading) return (
    <div className="detalle-loading">
      <p>⏳ Cargando historia...</p>
    </div>
  );

  if (!producto) return <div className="producto-detalle-container">❌ Producto no encontrado</div>;

  return (
    <div className="producto-detalle-container">
      
      {/* BOTÓN VOLVER MEJORADO */}
      <button className="btn-volver-catalogo" onClick={() => navigate(-1)}>
        ⬅️ Volver al catálogo
      </button>

      <div className="detalle-grid">
        
        {/* --- COLUMNA IZQUIERDA: IMÁGENES --- */}
        <div className="galeria-container">
          <div className="imagen-principal-box">
            <img 
              src={imagenActiva} 
              alt={`${producto.equipo} ${producto.anio}`} 
              className="imagen-principal" 
            />
          </div>
          
          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="miniaturas-lista">
              {producto.imagenes.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Vista miniatura ${index + 1}`}
                  className={`miniatura ${imagenActiva === img ? 'activa' : ''}`}
                  onClick={() => setImagenActiva(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: INFO --- */}
        <div className="info-container">
          <span className="detalle-categoria">{producto.categoria}</span>
          <h1 className="detalle-titulo">
            {producto.equipo} <span style={{fontSize: '0.6em', color: '#666'}}>{producto.anio}</span>
          </h1>
          
          {/* SECCIÓN PRECIO MEJORADA */}
          <div className="precio-container">
            <div className="detalle-precio-wrapper">
              <span className="detalle-precio">{producto.precio.toFixed(2)} €</span>
              <span className="precio-iva">IVA incluido</span>
            </div>
            <div className="badge-stock">
              🟢 En Stock
            </div>
          </div>

          {/* SECCIÓN TALLAS */}
          <div className="detalle-tallas">
            <h3>📏 Selecciona tu talla</h3>
            <div className="tallas-grid">
              {tallasDisponibles.map(talla => (
                <button 
                  key={talla}
                  className={`btn-talla ${tallaSeleccionada === talla ? 'seleccionada' : ''}`}
                  onClick={() => setTallaSeleccionada(talla)}
                >
                  {talla}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-comprar-gigante" onClick={handleAñadirAlCarrito}>
            🛒 Añadir al carrito
          </button>

          <ul className="lista-garantias">
            <li>✅ Autenticidad Garantizada</li>
            <li>📦 Envío gratis en pedidos superiores a 100€</li>
            <li>🛡️ Pago 100% seguro</li>
          </ul>

          <div className="detalle-descripcion">
            <h3>📖 Historia de la prenda</h3>
            <p>{producto.descripcionHistorica || "Una pieza de colección indispensable para cualquier amante del fútbol."}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;