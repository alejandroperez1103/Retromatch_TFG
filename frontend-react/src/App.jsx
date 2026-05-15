import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx'; 
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';
import Carrito from './components/Carrito.jsx';
import AdminDashboard from './components/AdminDashboard';
import CategoriaView from './components/CategoriaView';
import Checkout from './components/Checkout';
import ProductoDetalle from './components/ProductoDetalle';
import MisPedidos from './components/MisPedidos.jsx';
import Footer from './components/Footer'; // Ajusta la ruta si es necesario

function App() {
  return (
    <>
      <Navbar /> 
      <main className="page-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/categoria/:nombreCategoria" element={<CategoriaView />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;