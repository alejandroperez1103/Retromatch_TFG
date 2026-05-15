import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import "./Navbar.css";
import { FiShoppingBag, FiMenu, FiX, FiMail, FiGlobe } from 'react-icons/fi';


const Navbar = () => {
  const { usuario, logout } = useContext(AuthContext);
  const { cantidadArticulos } = useContext(CartContext);
  const navigate = useNavigate();
  
  const location = useLocation(); 
  const isLoginPage = location.pathname === '/login';
  const isAdmin = usuario?.rol === 'ADMIN';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
          <div className="pre-header-left">
            <FiMail style={{ marginRight: '8px', verticalAlign: 'middle', color: '#D11D25' }} />
            <span>info@retromatch.com</span>
          </div>
          <div className="pre-header-right">
            <div className="locale-selector">
              <FiGlobe style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              <span>ES - EUR (€)</span>
            </div>
            <span className="divider">|</span>
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
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            RetroMatch
          </Link>

          <div className="main-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <Link to="/carrito" className="cart-widget-premium" onClick={closeMobileMenu}>
              <FiShoppingBag className="cart-icon-premium" />
              {cantidadArticulos > 0 && (
                <span className="cart-badge">{cantidadArticulos}</span>
              )}
            </Link>

            {usuario && (
              <button 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {usuario && (
        <nav className={`main-nav ${isMobileMenuOpen ? "mobile-active" : ""}`}>
          <div className={`container ${isAdmin ? 'has-admin' : ''}`}>
            
            <ul className="navbar-links">
              <li><Link to="/" onClick={closeMobileMenu}>Catálogo General</Link></li>
              <li><Link to="/categoria/Mundial86" onClick={closeMobileMenu}>Mundial '86</Link></li>
              <li><Link to="/categoria/LaLiga" onClick={closeMobileMenu}>La Liga Classic</Link></li>
              <li><Link to="/categoria/Premier" onClick={closeMobileMenu}>Premier Legend</Link></li>
              <li><Link to="/categoria/Selecciones" onClick={closeMobileMenu}>Selecciones</Link></li>
              {!isAdmin && (
                <li><Link to="/mis-pedidos" onClick={closeMobileMenu}>Mis Pedidos</Link></li>
              )}
            </ul>

            <div className="nav-actions-group">
              {isAdmin && (
                <Link to="/admin" className="admin-link" onClick={closeMobileMenu}>⚙ Panel Admin</Link>
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