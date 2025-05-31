import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SLOTS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

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
      setNewMeal({ ...newMeal, [`${date}-${slot}`]: {} });
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
    mealPlans.find(m => m.date === date && m.slot === slot);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Planificador Semanal</h1>
        <div className="space-x-4">
          <button
            onClick={handleManageIngredients}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Gestionar Ingredientes
          </button>
          <button
            onClick={handleManageDishes}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Gestionar Platos
          </button>
          <button
            onClick={handleViewShoppingList}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Lista de la Compra
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Contenido del planificador semanal */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-md border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 border-b-2">Día</th>
              {SLOTS.map(slot => <th key={slot} className="text-left p-4 border-b-2">{slot}</th>)}
            </tr>
          </thead>
          <tbody>
            {weekDates.map(date => (
              <tr key={date} className="border-b last:border-b-0">
                <td className="p-4 font-semibold">{date}</td>
                {SLOTS.map(slot => {
                  const meal = getMeal(date, slot);
                  return (
                    <td key={slot} className="p-4 min-w-[180px]">
                      {meal ? (
                        <div className="flex flex-col space-y-2">
                          <div className="font-medium">{meal.dish_name}</div>
                          <div className="text-sm text-gray-600">{meal.servings} persona(s)</div>
                          {meal.notes && <div className="text-xs text-gray-500 italic">{meal.notes}</div>}
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors self-start"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <select
                            value={newMeal[`${date}-${slot}`]?.dish_id || ''}
                            onChange={e => setNewMeal({ ...newMeal, [`${date}-${slot}`]: { ...newMeal[`${date}-${slot}`], dish_id: e.target.value } })}
                            className="border rounded p-1 text-sm w-full"
                          >
                            <option value="">--Seleccionar Plato--</option>
                            {dishes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={newMeal[`${date}-${slot}`]?.servings || ''}
                            onChange={e => setNewMeal({ ...newMeal, [`${date}-${slot}`]: { ...newMeal[`${date}-${slot}`], servings: parseInt(e.target.value) || 1 } })}
                            className="border rounded p-1 text-sm w-full"
                            placeholder="Nº raciones"
                          />
                          <button
                            onClick={() => handleAddMeal(date, slot)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors self-start"
                          >
                            Añadir
                          </button>
                        </div>
                      )}
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