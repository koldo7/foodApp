import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash, FaCheck, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ShoppingList = () => {
  const navigate = useNavigate();
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: ''
  });
  const [editingItem, setEditingItem] = useState(null);

  // Categorías predefinidas
  const categories = [
    'Frutas y Verduras',
    'Carnes y Pescados',
    'Lácteos',
    'Panadería',
    'Bebidas',
    'Congelados',
    'Despensa',
    'Limpieza',
    'Otros'
  ];

  // Unidades predefinidas
  const units = [
    'kg',
    'g',
    'l',
    'ml',
    'unidad',
    'paquete',
    'lata',
    'botella'
  ];

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/shopping-list');
      setShoppingList(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la lista de la compra');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/shopping-list/manual', newItem);
      setShoppingList(prev => [...prev, response.data]);
      setNewItem({
        name: '',
        quantity: '',
        unit: '',
        category: ''
      });
      setError(null);
    } catch (err) {
      setError('Error al añadir el ítem');
      console.error('Error:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/shopping-list/manual/${itemId}`);
      setShoppingList(prev => prev.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error al eliminar el ítem');
      console.error('Error:', err);
    }
  };

  const handleToggleChecked = async (item) => {
    if (item.source === 'generated') return; // No permitir marcar ítems generados
    
    try {
      await axios.put(`/api/shopping-list/manual/${item.id}`, {
        ...item,
        is_checked: !item.is_checked
      });
      setShoppingList(prev => prev.map(i => 
        i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
      ));
      setError(null);
    } catch (err) {
      setError('Error al actualizar el ítem');
      console.error('Error:', err);
    }
  };

  const handleEditItem = async (item) => {
    if (item.source === 'generated') return; // No permitir editar ítems generados
    
    if (editingItem?.id === item.id) {
      try {
        await axios.put(`/api/shopping-list/manual/${item.id}`, editingItem);
        setShoppingList(prev => prev.map(i => 
          i.id === item.id ? editingItem : i
        ));
        setEditingItem(null);
        setError(null);
      } catch (err) {
        setError('Error al actualizar el ítem');
        console.error('Error:', err);
      }
    } else {
      setEditingItem(item);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Agrupar ítems por categoría
  const groupedItems = shoppingList.reduce((acc, item) => {
    const category = item.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lista de la Compra</h1>
        <button
          onClick={() => navigate('/meal-planner')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Volver al Planificador
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulario para añadir ítems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Añadir ítem manual</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            placeholder="Nombre del ítem"
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="quantity"
            value={newItem.quantity}
            onChange={handleInputChange}
            placeholder="Cantidad"
            className="border rounded p-2"
            step="0.01"
          />
          <select
            name="unit"
            value={newItem.unit}
            onChange={handleInputChange}
            className="border rounded p-2"
          >
            <option value="">Unidad</option>
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <select
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            className="border rounded p-2"
          >
            <option value="">Categoría</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" />
            Añadir
          </button>
        </form>
      </motion.div>

      {/* Lista de la compra */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{category}</h2>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id || `${item.name}-${item.unit}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.is_checked ? 'bg-gray-100' : 'bg-white'
                  } border`}
                >
                  <div className="flex items-center space-x-4">
                    {item.source === 'manual' && (
                      <button
                        onClick={() => handleToggleChecked(item)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          item.is_checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}
                      >
                        {item.is_checked && <FaCheck className="text-white" />}
                      </button>
                    )}
                    <div>
                      <span className={`font-medium ${item.is_checked ? 'line-through text-gray-500' : ''}`}>
                        {editingItem?.id === item.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editingItem.name}
                            onChange={handleEditInputChange}
                            className="border rounded p-1"
                          />
                        ) : (
                          item.name
                        )}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {item.total_quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.source === 'manual' && (
                      <>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList; 