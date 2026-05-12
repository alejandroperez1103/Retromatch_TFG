import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import StatusAlert from './StatusAlert';
import './Home.css';
import { FiShoppingCart } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { MdOutlineCategory } from 'react-icons/md';

const CategoriaView = () => {
  const { nombreCategoria } = useParams();
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const titulos = {
    'Mundial86': "Mundial '86",
    'LaLiga': "La Liga Classic",
    'Premier': "Premier Legend",
    'Selecciones': "Selecciones Nacionales"
  };

  useEffect(() => {
    const fetchProductosCategoria = async () => {
      try {
        const data = await productService.getProductos();
        const filtrados = data.filter((p) => p.categoria === nombreCategoria);
        setProductosFiltrados(filtrados);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductosCategoria();
  }, [nombreCategoria]);

  if (loading) {
    return (
      <div className="loader-container">
        <GiSoccerBall size={48} className="balon-giratorio" />
        <p>Cargando la colección...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container" style={{ paddingTop: '80px' }}>
        <StatusAlert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="home-container" style={{ paddingTop: '80px' }}>
      <div className="section-title">
        <h2>
          <MdOutlineCategory style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Colección: {titulos[nombreCategoria] || nombreCategoria}
        </h2>
        <div className="title-underline"></div>
      </div>

      <main className="productos-grid container">
        {productosFiltrados.map((producto) => {
          
          // Lógica robusta para obtener la imagen principal (igual que en Home.jsx)
          const imagenPrincipal = (producto.imagenes && producto.imagenes.length > 0) 
            ? producto.imagenes[0] 
            : (producto.imagenUrl || "https://placehold.co/300x300?text=Sin+Imagen");

          return (
            <article key={producto.id} className="producto-card">
              <Link to={`/producto/${producto.id}`} className="producto-imagen">
                {/* Etiqueta img actualizada con soporte para errores */}
                <img 
                  src={imagenPrincipal} 
                  alt={`${producto.equipo} ${producto.anio}`}
                  onError={(e) => {
                    e.target.onerror = null; // Previene bucles infinitos
                    e.target.src = "https://placehold.co/300x300?text=Imagen+No+Disponible";
                  }}
                />
              </Link>
              <div className="producto-info">
                <span className="producto-anio">Temporada {producto.anio}</span>
                <Link to={`/producto/${producto.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className="producto-equipo">{producto.equipo}</h3>
                </Link>
                <p className="producto-precio">{Number(producto.precio).toFixed(2)} €</p>
                <button className="btn-comprar" onClick={() => navigate(`/producto/${producto.id}`)}>
                  <FiShoppingCart style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Elegir talla
                </button>
              </div>
            </article>
          );
        })}

        {productosFiltrados.length === 0 && (
          <p className="sin-productos" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            Aún no hay camisetas en esta categoría.
          </p>
        )}
      </main>
    </div>
  );
};

export default CategoriaView;
