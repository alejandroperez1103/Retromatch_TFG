import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';

const TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

const AdminDashboard = () => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoActual, setProductoActual] = useState({
    equipo: '', anio: '', precio: '', imagenes: [''], descripcionHistorica: '', categoria: ''
  });
  const [stock, setStock] = useState(TALLAS.map(t => ({ talla: t, cantidad: 0 })));

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/productos', {
          headers: {
            'Authorization': `Bearer ${usuario.token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`Error de servidor: ${response.status}`);
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };

    if (!usuario || usuario.rol !== 'ADMIN') {
      navigate('/');
    } else {
      cargarProductos();
    }
  }, [usuario, navigate]);

  const handleNuevo = () => {
    setProductoActual({ equipo: '', anio: '', precio: '', imagenes: [''], descripcionHistorica: '', categoria: '' });
    setStock(TALLAS.map(t => ({ talla: t, cantidad: 0 })));
    setMostrarFormulario(true);
  };

  const handleEditar = async (producto) => {
    const imagenesArray = producto.imagenes ? producto.imagenes : (producto.imagenUrl ? [producto.imagenUrl] : ['']);
    setProductoActual({ ...producto, imagenes: imagenesArray });

    try {
      const res = await fetch(`http://localhost:8080/api/productos/${producto.id}/stock`, {
        headers: { 'Authorization': `Bearer ${usuario.token}` }
      });
      const stockData = await res.json();
      setStock(TALLAS.map(t => {
        const encontrado = stockData.find(s => s.talla === t);
        return { talla: t, cantidad: encontrado ? encontrado.cantidad : 0 };
      }));
    } catch {
      setStock(TALLAS.map(t => ({ talla: t, cantidad: 0 })));
    }

    setMostrarFormulario(true);
  };

  const handleImagenChange = (index, valor) => {
    const nuevasImagenes = [...productoActual.imagenes];
    nuevasImagenes[index] = valor;
    setProductoActual({ ...productoActual, imagenes: nuevasImagenes });
  };

  const agregarImagen = () => {
    if (productoActual.imagenes.length < 3) {
      setProductoActual({ ...productoActual, imagenes: [...productoActual.imagenes, ""] });
    }
  };

  const eliminarImagen = (index) => {
    const nuevasImagenes = productoActual.imagenes.filter((_, i) => i !== index);
    setProductoActual({ ...productoActual, imagenes: nuevasImagenes });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const metodo = productoActual.id ? 'PUT' : 'POST';
    const url = productoActual.id
      ? `http://localhost:8080/api/productos/${productoActual.id}`
      : 'http://localhost:8080/api/productos';

    const payload = {
      ...productoActual,
      anio: Number(productoActual.anio),
      imagenes: (productoActual.imagenes || [])
        .map((s) => (s ?? '').toString().trim())
        .filter((s) => s.length > 0),
    };

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${usuario.token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const productoGuardado = await response.json();
        const idProducto = productoActual.id || productoGuardado.id;

        await fetch(`http://localhost:8080/api/productos/${idProducto}/stock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${usuario.token}`
          },
          body: JSON.stringify(stock.map(s => ({ talla: s.talla, cantidad: s.cantidad })))
        });

        alert('¡Camiseta guardada con éxito!');
        setMostrarFormulario(false);
        window.location.reload();
      } else {
        if (response.status === 403) {
          logout?.();
          alert('Sesión inválida (403). Vuelve a iniciar sesión e intenta de nuevo.');
          navigate('/login');
          return;
        }
        const bodyText = await response.text();
        alert(`Error al guardar (${response.status}).\n${bodyText}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleBorrar = async (id) => {
    if (window.confirm('¿Seguro que quieres borrar esta camiseta legendaria?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${usuario.token}` }
        });
        if (response.ok) {
          setProductos(productos.filter(p => p.id !== id));
        } else if (response.status === 403) {
          logout?.();
          alert('Sesión inválida (403). Vuelve a iniciar sesión.');
          navigate('/login');
        }
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  };

  return (
    <div className="admin-container container">
      <header className="admin-header">
        <h2><MdAdminPanelSettings style={{ marginRight: '8px', verticalAlign: 'middle' }} />Panel de Control - Inventario</h2>
        {!mostrarFormulario && (
          <button className="btn-primary" onClick={handleNuevo}>
            <FiPlus style={{ marginRight: '6px', verticalAlign: 'middle' }} />Añadir Camiseta
          </button>
        )}
      </header>

      {mostrarFormulario ? (
        <form className="admin-form" onSubmit={handleGuardar}>
          <h3>{productoActual.id ? 'Editar Camiseta' : 'Nueva Camiseta'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Equipo</label>
              <input type="text" placeholder="Ej: Argentina" value={productoActual.equipo} onChange={(e) => setProductoActual({...productoActual, equipo: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Año</label>
              <input type="number" placeholder="Ej: 1986" value={productoActual.anio} onChange={(e) => setProductoActual({...productoActual, anio: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Precio (€)</label>
              <input type="number" step="0.01" placeholder="Ej: 89.99" value={productoActual.precio} onChange={(e) => setProductoActual({...productoActual, precio: parseFloat(e.target.value)})} required />
            </div>

            {/* IMÁGENES */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>IMÁGENES (URL) - Máximo 3</label>
              {productoActual.imagenes.map((url, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={`https://... (Vista ${index + 1})`}
                    value={url}
                    onChange={(e) => handleImagenChange(index, e.target.value)}
                    style={{ flex: 1 }}
                    required={index === 0}
                  />
                  {productoActual.imagenes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarImagen(index)}
                      style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
              {productoActual.imagenes.length < 3 && (
                <button
                  type="button"
                  onClick={agregarImagen}
                  style={{ padding: '8px 12px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '13px', marginTop: '5px' }}
                >
                  <FiPlus style={{ marginRight: '5px' }} /> Añadir otra vista
                </button>
              )}
            </div>

            {/* STOCK POR TALLAS */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>STOCK POR TALLAS</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                {stock.map((item, index) => (
                  <div key={item.talla} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#555', textTransform: 'uppercase' }}>{item.talla}</span>
                    <input
                      type="number"
                      min="0"
                      value={item.cantidad}
                      onChange={(e) => {
                        const nuevo = [...stock];
                        nuevo[index] = { ...nuevo[index], cantidad: parseInt(e.target.value) || 0 };
                        setStock(nuevo);
                      }}
                      style={{ width: '65px', textAlign: 'center', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORÍA */}
            <div className="form-group description-group">
              <label>Categoría del Catálogo</label>
              <select value={productoActual.categoria} onChange={(e) => setProductoActual({...productoActual, categoria: e.target.value})} required className="admin-select">
                <option value="">-- Selecciona una categoría --</option>
                <option value="Mundial86">Mundial '86</option>
                <option value="LaLiga">La Liga Classic</option>
                <option value="Premier">Premier Legend</option>
                <option value="Selecciones">Selecciones Nacionales</option>
              </select>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="form-group description-group" style={{ marginTop: '1rem' }}>
            <label>Descripción Histórica</label>
            <textarea placeholder="Describe la historia..." value={productoActual.descripcionHistorica} onChange={(e) => setProductoActual({...productoActual, descripcionHistorica: e.target.value})} rows="4" required></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setMostrarFormulario(false)}>
              <FiX style={{ marginRight: '6px', verticalAlign: 'middle' }} />Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <FiSave style={{ marginRight: '6px', verticalAlign: 'middle' }} />Guardar Producto
            </button>
          </div>
        </form>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipo</th>
                <th>Año</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td><strong>{p.equipo}</strong></td>
                  <td>{p.anio}</td>
                  <td><span className="categoria-badge">{p.categoria || 'Sin clasificar'}</span></td>
                  <td>{p.precio.toFixed(2)} €</td>
                  <td className="acciones-td">
                    <button className="btn-edit" onClick={() => handleEditar(p)}>
                      <FiEdit2 style={{ marginRight: '4px', verticalAlign: 'middle' }} />Editar
                    </button>
                    <button className="btn-delete" onClick={() => handleBorrar(p.id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;