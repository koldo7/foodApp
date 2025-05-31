import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider: Initializing...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthProvider: Checking authentication...');
      const token = localStorage.getItem('token');
      console.log('AuthProvider: Token from localStorage:', token ? 'exists' : 'not found');
      
      if (token) {
        try {
          console.log('AuthProvider: Raw token:', token);
          // Verificar que el token tiene el formato correcto (tres partes separadas por puntos)
          const tokenParts = token.split('.');
          console.log('AuthProvider: Token parts:', tokenParts.length);
          
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
          
          // Decodificar el token para obtener la información del usuario
          const tokenData = JSON.parse(atob(tokenParts[1]));
          console.log('AuthProvider: Token decoded successfully:', tokenData);
          
          // Verificar que el token no ha expirado
          const currentTime = Math.floor(Date.now() / 1000);
          if (tokenData.exp && tokenData.exp < currentTime) {
            throw new Error('Token has expired');
          }
          
          // Configurar el token en axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
          setUser(tokenData);
          console.log('AuthProvider: Authentication successful');
        } catch (error) {
          console.error('AuthProvider: Error during authentication:', error);
          console.error('AuthProvider: Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('AuthProvider: No token found, user is not authenticated');
      }
      setLoading(false);
      console.log('AuthProvider: Authentication check completed');
    };

    checkAuth();
  }, []);

  const login = (token) => {
    console.log('AuthProvider: Login attempt...');
    try {
      // Decodificar el token para obtener la información del usuario
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('AuthProvider: Token decoded successfully:', tokenData);
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(tokenData);
      console.log('AuthProvider: Login successful');
    } catch (error) {
      console.error('AuthProvider: Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logging out...');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    console.log('AuthProvider: Logout successful');
  };

  if (loading) {
    console.log('AuthProvider: Still loading, showing loading message');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Rendering children with state:', { isAuthenticated, user });
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 