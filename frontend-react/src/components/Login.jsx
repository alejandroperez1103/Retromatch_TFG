import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import authService from '../services/authService.js';
import './Login.css';
import { FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiKey } from 'react-icons/fi';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '', codigoAdmin: '' });
  const [infoMessage, setInfoMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfoMessage({ text: '', type: '' });
    try {
      if (isLogin) {
        await login(credentials.email, credentials.password);
        setInfoMessage({ text: '¡Acceso concedido!', type: 'success' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        await authService.registro(credentials.email, credentials.password, credentials.codigoAdmin);
        setInfoMessage({ text: '¡Cuenta creada! Ya puedes entrar.', type: 'success' });
        setCredentials({ email: '', password: '', codigoAdmin: '' });
        setTimeout(() => setIsLogin(true), 3000);
      }
    } catch (error) {
      setInfoMessage({ text: 'Error: ' + error.message, type: 'error' });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>RetroMatch — {isLogin ? 'Login' : 'Registro'}</h2>

        {infoMessage.text && (
          <div className={`status-message ${infoMessage.type}`}>
            {infoMessage.text}
          </div>
        )}

        <input name="email" type="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />

        <div className="input-with-icon">
          <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={credentials.password} onChange={handleChange} required />
          <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
            {/* ✅ FiEye / FiEyeOff en lugar de emojis */}
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        {!isLogin && (
          <div className="input-with-icon">
            <input name="codigoAdmin" type="text" placeholder="Código de Invitación (Opcional)" value={credentials.codigoAdmin} onChange={handleChange} style={{ backgroundColor: '#f9f9f9', borderStyle: 'dashed' }} />
            {/* ✅ Icono de llave para el campo admin */}
            <span className="input-icon-static"><FiKey size={16} color="#aaa" /></span>
          </div>
        )}

        <button type="submit" className="btn-primary">
          {/* ✅ Icono según modo login/registro */}
          {isLogin
            ? <><FiLogIn style={{ marginRight: '8px', verticalAlign: 'middle' }} />Entrar</>
            : <><FiUserPlus style={{ marginRight: '8px', verticalAlign: 'middle' }} />Crear Cuenta</>
          }
        </button>

        <p onClick={() => setIsLogin(!isLogin)} className="toggle-link">
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Haz login'}
        </p>
      </form>
    </div>
  );
};

export default Login;