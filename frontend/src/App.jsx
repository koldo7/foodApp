import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login'
import Register from './components/Register'
import Planner from './components/Planner'
import IngredientsManager from './components/IngredientsManager'
import DishesManager from './components/DishesManager'
import ShoppingList from './components/ShoppingList'
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
      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute>
            <Planner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ingredients"
        element={
          <ProtectedRoute>
            <IngredientsManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dishes"
        element={
          <ProtectedRoute>
            <DishesManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping-list"
        element={
          <ProtectedRoute>
            <ShoppingList />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/meal-planner" />} />
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
