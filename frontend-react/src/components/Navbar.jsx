import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import "./Navbar.css";
// ✅ NUEVO: Importamos la bolsa de compra elegante de Feather Icons
import { FiShoppingBag } from 'react-icons/fi'; 

const Navbar = () => {
  const { usuario, logout } = useContext(AuthContext);
  const { carrito } = useContext(CartContext); // Ya no necesitamos totalPrecio aquí arriba
  const navigate = useNavigate();
  
  const location = useLocation(); 
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoginPage) {
    return (
      <nav className="navbar-complete login-navbar">
        <div className="main-header" style={{ justifyContent: 'center', padding: '1rem 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/" className="navbar-logo" style={{ margin: '0' }}>
              RetroMatch
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar-complete">
      <div className="pre-header">
        <div className="container">
          <p>Consultas y pedidos: info@retromatch.com</p>
          <div className="pre-header-right">
            <span>🇪🇸 ES - €</span>
            {usuario ? (
              <span className="user-info">
                Hola, {usuario.email.split("@")[0]}
              </span>
            ) : (
              <Link to="/login" className="login-small-link">
                Mi Cuenta / Registro
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="main-header">
        <div className="container">
          <Link to="/" className="navbar-logo">
            RetroMatch
          </Link>

          <div className="main-header-actions">
            {/* ✅ NUEVO: Diseño Premium estilo Nike/Adidas */}
            <Link to="/carrito" className="cart-widget-premium">
              <FiShoppingBag className="cart-icon-premium" />
              {/* Solo mostramos la burbuja si hay algo en el carrito */}
              {carrito.length > 0 && (
                <span className="cart-badge">{carrito.length}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {usuario && (
        <nav className="main-nav">
          <div className="container">
            
            <ul className="navbar-links">
              <li><Link to="/">Catálogo General</Link></li>
              <li><Link to="/categoria/Mundial86">Mundial '86</Link></li>
              <li><Link to="/categoria/LaLiga">La Liga Classic</Link></li>
              <li><Link to="/categoria/Premier">Premier Legend</Link></li>
              <li><Link to="/categoria/Selecciones">Selecciones</Link></li>
            </ul>

            <div className="nav-actions-group">
              {usuario.rol === 'ADMIN' && (
                <Link to="/admin" className="admin-link">⚙ Panel Admin</Link>
              )}
              <button onClick={handleLogout} className="btn-logout-small">Cerrar Sesión</button>
            </div>

          </div>
        </nav>
      )}
    </nav>
  );
};

export default Navbar;