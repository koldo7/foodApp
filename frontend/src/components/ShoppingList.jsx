import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash, FaCheck, FaEdit, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const successStyle = { color: 'green', marginBottom: 10, background: '#e6ffe6', padding: 8, borderRadius: 6, border: '1px solid #b2ffb2' };
const errorStyle = { color: 'red', marginBottom: 10, background: '#ffe6e6', padding: 8, borderRadius: 6, border: '1px solid #ffb2b2' };

const ShoppingList = () => {
  const navigate = useNavigate();
  const [shoppingList, setShoppingList] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Estado para mensajes de error
  const [success, setSuccess] = useState(null); // Estado para mensajes de éxito
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: ''
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);

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
    console.log('ShoppingList: useEffect triggered, fetching list');
    fetchShoppingList();
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await axios.get('/api/ingredients');
      setIngredients(response.data);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  };

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/shopping-list?_t=${Date.now()}`);
      console.log('ShoppingList: API Response:', response.data);
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
      setShowIngredientSearch(false);
      setShowNewIngredientForm(false); // Hide the new ingredient form after adding an item
    } catch (err) {
      setError('Error al añadir el ítem');
      console.error('Error:', err);
    }
  };

  const handleAddNewIngredient = async () => {
    if (!newItem.name.trim()) {
      setError('El nombre del ingrediente es obligatorio');
      return;
    }
    try {
      const response = await axios.post('/api/ingredients', {
        name: newItem.name,
        unit: newItem.unit,
        category: newItem.category
      });
      setIngredients(prev => [...prev, response.data]);
      setNewItem({
        name: '',
        quantity: '',
        unit: '',
        category: ''
      });
      setShowNewIngredientForm(false);
      setError(null);
    } catch (err) {
      setError('Error al añadir ingrediente');
      console.error('Error:', err);
    }
  };

  const handleSelectIngredient = (ingredient) => {
    setNewItem({
      name: ingredient.name,
      quantity: '',
      unit: ingredient.unit,
      category: ingredient.category || ''
    });
    setIngredientSearch(ingredient.name);
    setShowIngredientSearch(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este ítem de la lista?')) {
      return;
    }
    try {
      await axios.delete(`/api/shopping-list/${itemId}`);
      setShoppingList(prev => prev.filter(item => item.id !== itemId));
      setSuccess('Ítem eliminado correctamente.');
      setError(null);
    } catch (err) {
      setError('Error al eliminar el ítem');
      setSuccess(null);
      console.error('Error:', err);
    }
  };

  const handleToggleChecked = async (item) => {
    try {
      const updatedItem = { ...item, is_checked: !item.is_checked };
      await axios.put(`/api/shopping-list/manual/${item.id}`, updatedItem);
      
      setShoppingList(prev => prev.map(i => 
        i.id === item.id ? updatedItem : i
      ));
      setError(null);
    } catch (err) {
      setError('Error al actualizar el ítem');
      console.error('Error:', err);
    }
  };

  const handleEditItem = async (item) => {
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

  // Filtrar ingredientes basados en la búsqueda
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: 48, width: 48, borderTop: '2px solid #2196F3', borderBottom: '2px solid #2196F3', margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#2a3d66', letterSpacing: 1 }}>Lista de la Compra</h2>
        <button
          onClick={() => navigate('/meal-planner')}
          style={{ marginRight: 8, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
        >
          Volver al Planificador
        </button>
      </div>

      {(error || success) && (
        <div style={error ? errorStyle : successStyle}>{error || success}</div>
      )}

      <div style={{ marginBottom: 20, background: '#f9f9f9', padding: 16, borderRadius: 10, boxShadow: '0 2px 8px #e3e8f0' }}>
        <h3 style={{ color: '#2a3d66', marginBottom: 16 }}>Añadir ítem</h3>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => {
              setShowIngredientSearch(!showIngredientSearch);
              setShowNewIngredientForm(false);
              setNewItem({ name: '', quantity: '', unit: '', category: '' });
            }}
            style={{ flex: 1, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            <FaSearch style={{ marginRight: 8 }} />
            {showIngredientSearch ? 'Ocultar búsqueda' : 'Buscar ingrediente existente'}
          </button>
          <button
            onClick={() => {
              setShowNewIngredientForm(!showNewIngredientForm);
              setShowIngredientSearch(false);
              setNewItem({ name: '', quantity: '', unit: '', category: '' });
            }}
            style={{ flex: 1, background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            <FaPlus style={{ marginRight: 8 }} />
            {showNewIngredientForm ? 'Cancelar nuevo ingrediente' : 'Añadir nuevo ingrediente'}
          </button>
        </div>

        {showIngredientSearch && (
          <div style={{ marginBottom: 16, padding: 16, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
            <input
              type="text"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Buscar ingrediente por nombre..."
              style={{ border: '1px solid #bfc8e6', borderRadius: 6, padding: 8, width: '100%', marginBottom: 8 }}
            />
            <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #e3e8f0', borderRadius: 6 }}>
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map(ingredient => (
                  <div
                    key={ingredient.id}
                    onClick={() => handleSelectIngredient(ingredient)}
                    style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #e3e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseOut={e => e.currentTarget.style.background = ''}
                  >
                    <span style={{ fontWeight: 'bold' }}>{ingredient.name}</span>
                    <span style={{ fontSize: '0.9em', color: '#666' }}>{ingredient.unit}</span>
                  </div>
                ))
              ) : (
                <p style={{ padding: 8, textAlign: 'center', color: '#888' }}>No se encontraron ingredientes.</p>
              )}
            </div>
          </div>
        )}

        {showNewIngredientForm && (
          <div style={{ marginBottom: 16, padding: 16, background: '#e6ffe6', borderRadius: 8, border: '1px solid #b2ffb2' }}>
            <h4 style={{ marginBottom: 16 }}>Nuevo Ingrediente</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Nombre del ingrediente"
                style={{ flex: 1, border: '1px solid #bfc8e6', borderRadius: 6, padding: 8 }}
                required
              />
              <select
                name="unit"
                value={newItem.unit}
                onChange={handleInputChange}
                style={{ flex: 1, border: '1px solid #bfc8e6', borderRadius: 6, padding: 8 }}
              >
                <option value="">Seleccionar unidad</option>
                {units.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
              </select>
              <select
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
                style={{ flex: 1, border: '1px solid #bfc8e6', borderRadius: 6, padding: 8 }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (<option key={category} value={category}>{category}</option>))}
              </select>
            </div>
            <button
              onClick={handleAddNewIngredient}
              style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', width: '100%' }}
            >
              Guardar ingrediente
            </button>
          </div>
        )}

        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            placeholder="Nombre del ítem"
            style={{ flex: 2, border: '1px solid #bfc8e6', borderRadius: 6, padding: 8 }}
            required
          />
          <input
            type="number"
            name="quantity"
            value={newItem.quantity}
            onChange={handleInputChange}
            placeholder="Cantidad"
            style={{ flex: 1, border: '1px solid #bfc8e6', borderRadius: 6, padding: 8 }}
            step="0.01"
            required
          />
          <input
            type="text"
            name="unit"
            value={newItem.unit}
            onChange={handleInputChange}
            placeholder="Unidad"
            list="unitsList"
            style={{ flex: 1, border: '1px solid #bfc8e6', borderRadius: 6, padding: 8 }}
          />
          <datalist id="unitsList">
            {units.map(unit => <option key={unit} value={unit} />)}
          </datalist>
          <button
            type="submit"
            style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}
          >
            <FaPlus style={{ marginRight: 8 }} />
            Añadir a la lista
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o categoría..."
          value={ingredientSearch} 
          onChange={e => setIngredientSearch(e.target.value)}
          style={{ borderRadius: 6, border: '1px solid #bfc8e6', padding: 6, width: 300 }}
        />
      </div>

      <table border="0" cellPadding={6} style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e8f0' }}>
        <thead style={{ background: '#e3e8f0' }}>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Cantidad</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Unidad</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Categoría</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Plato</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedItems).map(([category, items]) => (
            <React.Fragment key={category}>
              <tr>
                <td colSpan="6" style={{ background: '#f0f4ff', padding: '8px', fontWeight: 'bold', color: '#2a3d66', borderTop: '1px solid #bfc8e6' }}>
                  {category}
                </td>
              </tr>
              {items.filter(item => 
                item.name.toLowerCase().includes(ingredientSearch.toLowerCase()) || 
                (item.category || '').toLowerCase().includes(ingredientSearch.toLowerCase())
              ).map(item => (
                <tr 
                  key={item.id || `${item.name}-${item.unit}`}
                  style={{ background: item.is_checked ? '#e6ffe6' : '#f9f9f9', borderBottom: '1px solid #e3e8f0' }}
                >
                  <td style={{ padding: '8px', textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? '#888' : '#333' }}>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editingItem.name || ''}
                        onChange={handleEditInputChange}
                        style={{ border: '1px solid #bfc8e6', borderRadius: 4, padding: 4, width: '100%' }}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td style={{ padding: '8px', textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? '#888' : '#333' }}>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="number"
                        name="quantity"
                        value={editingItem.quantity || ''}
                        onChange={handleEditInputChange}
                        style={{ border: '1px solid #bfc8e6', borderRadius: 4, padding: 4, width: '100%' }}
                      />
                    ) : (
                      item.total_quantity
                    )}
                  </td>
                  <td style={{ padding: '8px', textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? '#888' : '#333' }}>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="text"
                        name="unit"
                        value={editingItem.unit || ''}
                        onChange={handleEditInputChange}
                        style={{ border: '1px solid #bfc8e6', borderRadius: 4, padding: 4, width: '100%' }}
                      />
                    ) : (
                      item.unit
                    )}
                  </td>
                  <td style={{ padding: '8px', textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? '#888' : '#333' }}>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="text"
                        name="category"
                        value={editingItem.category || ''}
                        onChange={handleEditInputChange}
                        style={{ border: '1px solid #bfc8e6', borderRadius: 4, padding: 4, width: '100%' }}
                      />
                    ) : (
                      item.category
                    )}
                  </td>
                  <td style={{ padding: '8px', textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? '#888' : '#333' }}>
                    {item.dish_name || '-'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {item.source === 'manual' ? (
                      <>
                        <button onClick={() => handleToggleChecked(item)} style={{ background: item.is_checked ? '#e57373' : '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', marginRight: 4 }}>
                          {item.is_checked ? <FaCheck /> : <FaCheck />}
                        </button>
                        <button onClick={() => handleEditItem(item)} style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', marginRight: 4 }}>
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setError('Los ítems generados desde el planificador no se pueden eliminar ni modificar directamente desde aquí. Elimínalos o edítalos desde el Planificador Semanal si no los necesitas.')}
                        style={{ background: '#ccc', color: '#666', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'not-allowed' }}
                        title="Este ítem es generado por el planificador semanal y no puede ser eliminado ni modificado desde aquí."
                      >
                        <FaTrash /> <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShoppingList;