import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login'
import Register from './components/Register'
import Planner from './components/Planner'
import IngredientsManager from './components/IngredientsManager'
import DishesManager from './components/DishesManager'
import ShoppingList from './components/ShoppingList'
import Layout from './components/Layout';
import api from './api'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Usar Layout para rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/meal-planner" />} /> {/* Ruta por defecto dentro del layout */}
        <Route path="meal-planner" element={<Planner />} />
        <Route path="ingredients" element={<IngredientsManager />} />
        <Route path="dishes" element={<DishesManager />} />
        <Route path="shopping-list" element={<ShoppingList />} />
      </Route>
      
      {/* Redirigir otras rutas no definidas al login si no autenticado */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App
