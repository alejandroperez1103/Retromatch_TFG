import React from 'react';
import { FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content container">
        <div className="footer-brand">
          <h2>RETROMATCH</h2>
          <p>Pura pasión retro. Vistiendo la historia del fútbol. Proyecto desarrollado para demostrar habilidades Full-Stack.</p>
        </div>
        
        <div className="footer-social">
          <h3>Conecta conmigo</h3>
          <div className="social-icons">
            {/*Mis Redes Sociales*/}
            <a href="https://github.com/alejandroperez1103" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="https://www.linkedin.com/in/alejandro-p%C3%A9rez-gras-001750342/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RetroMatch. Desarrollado por Alejandro Pérez. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;