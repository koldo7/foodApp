import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 30px', 
        background: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef' 
      }}>
        <h1 style={{ color: '#2a3d66', fontSize: '1.5rem', margin: 0 }}>Dovakin Planner</h1>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#555', fontSize: '1rem' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                background: '#e57373',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 16px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          // Opcional: podrías poner un enlace a login/registro aquí si no estuviera protegido
          <span></span>
        )}
      </header>
      <main>
        <Outlet /> {/* Aquí se renderizarán los componentes de ruta anidados */}
      </main>
    </div>
  );
};

export default Layout; 