import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SLOTS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

const successStyle = { color: 'green', marginBottom: 10, background: '#e6ffe6', padding: 8, borderRadius: 6, border: '1px solid #b2ffb2' };
const errorStyle = { color: 'red', marginBottom: 10, background: '#ffe6e6', padding: 8, borderRadius: 6, border: '1px solid #ffb2b2' };

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const Planner = () => {
  console.log('Rendering Planner component');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newMeal, setNewMeal] = useState({});

  // Calcular semana actual
  const today = new Date();
  const monday = getMonday(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(monday, i)));

  useEffect(() => {
    console.log('Planner: Initial fetch effect triggered');
    const fetchData = async () => {
      await Promise.all([fetchMealPlans(), fetchDishes()]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null); }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching meal plans for week:', weekDates[0], 'to', weekDates[6]);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('No estás autenticado');
        return;
      }
      
      const response = await axios.get('/api/meal-plan', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          startDate: weekDates[0],
          endDate: weekDates[6]
        }
      });
      console.log('Meal plans fetched successfully:', response.data);
      setMealPlans(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching meal plans:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Error al cargar el plan semanal');
      if (error.response?.status === 401) {
        // Token inválido o expirado
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      setLoading(true);
      console.log('Fetching dishes...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('No estás autenticado');
        return;
      }
      
      const response = await axios.get('/api/dishes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Dishes fetched successfully:', response.data);
      setDishes(response.data);
    } catch (error) {
      console.error('Error fetching dishes:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Error al cargar los platos');
      if (error.response?.status === 401) {
        // Token inválido o expirado
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleManageIngredients = () => {
    navigate('/ingredients');
  };

  const handleManageDishes = () => {
    navigate('/dishes');
  };

  const handleViewShoppingList = () => {
    navigate('/shopping-list');
  };

  const handleAddMeal = async (date, slot) => {
    const dish_id = newMeal[`${date}-${slot}`]?.dish_id;
    const servings = newMeal[`${date}-${slot}`]?.servings || 1;
    if (!dish_id) return;
    setError(null); setSuccess(null);
    try {
      console.log('Adding meal:', { date, slot, dish_id, servings });
      const response = await axios.post('/api/meal-plan', { date, slot, dish_id, servings });
      console.log('Meal added successfully:', response.data);
      setNewMeal({ ...newMeal, [`${date}-${slot}`]: { dish_id: '', servings: '' } });
      fetchMealPlans();
      setSuccess('Comida añadida al planificador.');
    } catch (err) {
      console.error('Error adding meal:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al añadir comida');
    }
  };

  const handleDeleteMeal = async (id) => {
    setError(null); setSuccess(null);
    try {
      console.log('Deleting meal:', id);
      const response = await axios.delete(`/api/meal-plan/${id}`);
      console.log('Meal deleted successfully:', response.data);
      fetchMealPlans();
      setSuccess('Comida eliminada del planificador.');
    } catch (err) {
      console.error('Error deleting meal:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al eliminar comida');
    }
  };

  const getMeal = (date, slot) =>
    mealPlans.filter(m => m.date === date && m.slot === slot);

  if (loading) {
    console.log('Planner: Still loading, showing loading message');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando planificador...</p>
        </div>
      </div>
    );
  }

  console.log('Planner: Rendering table with data:', { mealPlans, dishes });

  return (
    <div style={{ maxWidth: 1200, margin: '30px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#2a3d66', letterSpacing: 1 }}>Planificador Semanal</h2>
        <div>
          <button
            onClick={handleManageIngredients}
            style={{ marginRight: 8, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            Gestionar Ingredientes
          </button>
          <button
            onClick={handleManageDishes}
            style={{ marginRight: 8, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            Gestionar Platos
          </button>
          <button
            onClick={handleViewShoppingList}
            style={{ marginRight: 8, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            Lista de la Compra
          </button>
          <button
            onClick={handleLogout}
            style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {(error || success) && (
        <div style={error ? errorStyle : successStyle}>{error || success}</div>
      )}

      {/* Contenido del planificador semanal */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#e3e8f0' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bfc8e6' }}>Día</th>
              {SLOTS.map(slot => (
                <th key={slot} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bfc8e6' }}>{slot}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDates.map(date => (
              <tr key={date} style={{ borderBottom: '1px solid #e3e8f0' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', background: '#f9f9f9' }}>{date}</td>
                {SLOTS.map(slot => {
                  const meals = getMeal(date, slot);
                  return (
                    <td key={slot} style={{ padding: '12px', minWidth: '180px', background: '#fff' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Lista de platos existentes */}
                        {meals.map(meal => (
                          <div key={meal.id} style={{ 
                            padding: '8px', 
                            background: '#f9f9f9', 
                            borderRadius: '6px',
                            border: '1px solid #e3e8f0'
                          }}>
                            <div style={{ fontWeight: 'medium' }}>{meal.dish_name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>{meal.servings} persona(s)</div>
                            {meal.notes && (
                              <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>{meal.notes}</div>
                            )}
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              style={{ 
                                background: '#e57373', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: 6, 
                                padding: '6px 14px', 
                                cursor: 'pointer', 
                                marginTop: '8px' 
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}

                        {/* Formulario para añadir nuevo plato */}
                        <div style={{ 
                          padding: '8px', 
                          background: '#f0f4ff', 
                          borderRadius: '6px',
                          border: '1px dashed #bfc8e6'
                        }}>
                          <select
                            value={newMeal[`${date}-${slot}`]?.dish_id || ''}
                            onChange={e => setNewMeal({ ...newMeal, [`${date}-${slot}`]: { ...newMeal[`${date}-${slot}`], dish_id: e.target.value } })}
                            style={{ 
                              borderRadius: 6, 
                              border: '1px solid #bfc8e6', 
                              padding: '6px', 
                              width: '100%',
                              marginBottom: '8px'
                            }}
                          >
                            <option value="">--Seleccionar Plato--</option>
                            {dishes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={newMeal[`${date}-${slot}`]?.servings || ''}
                            onChange={e => setNewMeal({ ...newMeal, [`${date}-${slot}`]: { ...newMeal[`${date}-${slot}`], servings: parseInt(e.target.value) || 1 } })}
                            style={{ 
                              borderRadius: 6, 
                              border: '1px solid #bfc8e6', 
                              padding: '6px', 
                              width: '100%',
                              marginBottom: '8px'
                            }}
                            placeholder="Nº raciones"
                          />
                          <button
                            onClick={() => handleAddMeal(date, slot)}
                            style={{ 
                              background: '#2a3d66', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: 6, 
                              padding: '6px 14px', 
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            Añadir Plato
                          </button>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Planner; 