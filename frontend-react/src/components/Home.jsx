import { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import './Home.css';
import { FiShoppingCart } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { agregarAlCarrito } = useContext(CartContext);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };

        if (token && token !== "null" && token !== "undefined") {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:8080/api/productos', {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) throw new Error('Error al cargar el catálogo');

        const data = await response.json();
        setProductos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <GiSoccerBall size={48} className="balon-giratorio" />
        <p>Cargando la colección...</p>
      </div>
    );
  }

  if (error) return <div className="estado-mensaje error">{error}</div>;

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Pura Pasión Retro</h1>
          <p>Viste la historia. Descubre nuestra colección de camisetas legendarias.</p>
        </div>
      </section>

      <div className="section-title">
        <h2>Novedades Históricas</h2>
        <div className="title-underline"></div>
      </div>

      <main className="productos-grid container">
        {productos.map((producto) => {
          
          // Lógica robusta para obtener la imagen principal del array
          const imagenPrincipal = (producto.imagenes && producto.imagenes.length > 0) 
            ? producto.imagenes[0] 
            : (producto.imagenUrl || "https://placehold.co/300x300?text=Sin+Imagen");

          return (
            <article key={producto.id} className="producto-card">
              <Link to={`/producto/${producto.id}`} className="producto-imagen">
                <img
                  src={imagenPrincipal}
                  alt={`${producto.equipo} ${producto.anio}`}
                  // TFG Tip: Si la URL de la imagen falla al cargar, mostramos el placeholder
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

                <p className="producto-precio">{producto.precio.toFixed(2)} €</p>

                <button className="btn-comprar" onClick={() => agregarAlCarrito(producto)}>
                  <FiShoppingCart style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Añadir al Carrito
                </button>
              </div>
            </article>
          );
        })}

        {productos.length === 0 && (
          <p className="sin-productos">Aún no hay camisetas en el catálogo. ¡Añade algunas desde el panel admin!</p>
        )}
      </main>
    </div>
  );
};

export default Home;