import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const successStyle = { color: 'green', marginBottom: 10, background: '#e6ffe6', padding: 8, borderRadius: 6, border: '1px solid #b2ffb2' };
const errorStyle = { color: 'red', marginBottom: 10, background: '#ffe6e6', padding: 8, borderRadius: 6, border: '1px solid #ffb2b2' };

// Estilos para el popup
const popupOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const popupContentStyle = {
  position: 'relative',
  maxWidth: '90%',
  maxHeight: '90%'
};

const popupImageStyle = {
  maxWidth: '100%',
  maxHeight: '90vh',
  objectFit: 'contain'
};

const closeButtonStyle = {
  position: 'absolute',
  top: -30,
  right: 0,
  background: 'white',
  border: 'none',
  borderRadius: '50%',
  width: 30,
  height: 30,
  fontSize: 20,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '80%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
};

const modalCloseButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666'
};

export default function DishesManager() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
  const [editId, setEditId] = useState(null);
  const [newDishId, setNewDishId] = useState(null);
  const [dishIngredients, setDishIngredients] = useState([]);
  const [newDishIng, setNewDishIng] = useState({ ingredient_id: '', quantity: '', unit: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: '' });
  const [pendingIngredients, setPendingIngredients] = useState([]);
  const [isDuplicateName, setIsDuplicateName] = useState(false);
  const [duplicateNameErrorMessage, setDuplicateNameErrorMessage] = useState('');

  useEffect(() => {
    fetchDishes();
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const fetchDishes = async () => {
    try {
      const res = await api.get('/dishes');
      setDishes(res.data);
    } catch (err) {
      setError('Error al cargar platos');
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/ingredients');
      setIngredients(res.data);
    } catch (err) {
      setIngredients([]);
    }
  };

  const fetchDishIngredients = async (dishId) => {
    try {
      const res = await api.get(`/dishes/${dishId}/ingredients`);
      setDishIngredients(res.data);
    } catch (err) {
      setDishIngredients([]);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));

    if (name === 'name') {
      const isNameTaken = dishes.some(dish => 
        dish.name.toLowerCase() === value.toLowerCase() && 
        dish.id !== editId
      );
      setIsDuplicateName(isNameTaken);
      if (isNameTaken) {
        setDuplicateNameErrorMessage('Ya existe un plato con este nombre.');
      } else {
        setDuplicateNameErrorMessage('');
        if (error === 'Ya existe un plato con este nombre.' || error === 'No se puede guardar: Ya existe un plato con este nombre.') {
          setError('');
        }
      }
    }
  };

  const validateForm = () => {
    if (isDuplicateName) {
      setError('No se puede guardar: Ya existe un plato con este nombre.');
      return false;
    }
    if (!form.name.trim() || !form.category.trim() || !form.instructions.trim()) {
      setError('Nombre, categoría e instrucciones son obligatorios.');
      return false;
    }
    if (form.prep_time && isNaN(Number(form.prep_time))) {
      setError('El tiempo de preparación debe ser numérico.');
      return false;
    }
    if (form.cook_time && isNaN(Number(form.cook_time))) {
      setError('El tiempo de cocción debe ser numérico.');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setDuplicateNameErrorMessage('');
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'photo' && form[key] instanceof File) {
        formData.append(key, form[key]);
      } else if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });

    try {
      if (editId) {
        await api.put(`/dishes/${editId}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });

        // Obtener los IDs de los ingredientes actuales
        const currentIngredientIds = pendingIngredients.map(ing => ing.id);
        
        // Obtener los ingredientes actuales del plato
        const response = await api.get(`/dishes/${editId}/ingredients`);
        const existingIngredients = response.data;

        // Eliminar ingredientes que ya no están en la lista
        for (const existingIng of existingIngredients) {
          if (!currentIngredientIds.includes(existingIng.id)) {
            await api.delete(`/dishes/${editId}/ingredients/${existingIng.id}`);
          }
        }

        // Añadir nuevos ingredientes
        for (const ingredient of pendingIngredients) {
          if (!existingIngredients.find(ei => ei.id === ingredient.id)) {
            await api.post(`/dishes/${editId}/ingredients`, {
              ingredient_id: ingredient.ingredient_id,
              quantity: ingredient.quantity,
              unit: ingredient.unit
            });
          }
        }

        setSuccess('Plato actualizado correctamente.');
      } else {
        const response = await api.post('/dishes', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
        const newDishId = response.data.id;

        // Añadir todos los ingredientes pendientes al nuevo plato
        for (const ingredient of pendingIngredients) {
          await api.post(`/dishes/${newDishId}/ingredients`, {
            ingredient_id: ingredient.ingredient_id,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          });
        }

        setSuccess('Plato creado correctamente con sus ingredientes.');
      }
      
      // Limpiar el formulario y cerrar el modal
      setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
      setEditId(null);
      setDishIngredients([]);
      setPendingIngredients([]);
      setShowModal(false);
      setShowNewIngredientForm(false);
      setNewIngredient({ name: '', unit: '' });
      setIngredientSearch('');
      setDuplicateNameErrorMessage('');
      
      // Actualizar la lista de platos
      await fetchDishes();
    } catch (err) {
      console.error('Error al guardar plato:', err);
      setError('Error al guardar plato: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = async dish => {
    setForm({
      name: dish.name,
      description: dish.description || '',
      prep_time: dish.prep_time || '',
      cook_time: dish.cook_time || '',
      category: dish.category || '',
      instructions: dish.instructions || '',
      photo: dish.photo || ''
    });
    setEditId(dish.id);
    setShowModal(true);
    try {
      const response = await api.get(`/dishes/${dish.id}/ingredients`);
      setPendingIngredients(response.data.map(ing => ({
        id: ing.id,
        ingredient_id: ing.ingredient_id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit
      })));
    } catch (err) {
      setError('Error al cargar ingredientes del plato');
      setPendingIngredients([]);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar plato?')) return;
    try {
      await api.delete(`/dishes/${id}`);
      fetchDishes();
      setEditId(null);
      setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
      setDishIngredients([]);
      setSuccess('Plato eliminado correctamente.');
    } catch (err) {
      setError('Error al eliminar plato');
    }
  };

  // --- Ingredientes del plato ---
  const handleAddDishIngredient = async () => {
    if (!newDishIng.ingredient_id || !newDishIng.quantity || !newDishIng.unit) {
      setError('Todos los campos del ingrediente son obligatorios.');
      return;
    }
    if (isNaN(Number(newDishIng.quantity)) || Number(newDishIng.quantity) <= 0) {
      setError('La cantidad debe ser un número positivo.');
      return;
    }

    // Encontrar el nombre del ingrediente seleccionado
    const selectedIngredient = ingredients.find(ing => ing.id === newDishIng.ingredient_id);
    if (!selectedIngredient) {
      setError('Ingrediente no encontrado');
      return;
    }

    // Crear un nuevo objeto de ingrediente con toda la información necesaria
    const newIngredient = {
      id: Date.now(), // ID temporal para la lista
      ingredient_id: newDishIng.ingredient_id,
      name: selectedIngredient.name,
      quantity: newDishIng.quantity,
      unit: newDishIng.unit
    };

    // Añadir a la lista de ingredientes pendientes
    setPendingIngredients([...pendingIngredients, newIngredient]);
    setNewDishIng({ ingredient_id: '', quantity: '', unit: '' });
    setIngredientSearch('');
    setSuccess('Ingrediente añadido al plato.');
  };

  const handleDeleteDishIngredient = async (id) => {
    if (editId) {
      try {
        await api.delete(`/dishes/${editId}/ingredients/${id}`);
        setPendingIngredients(pendingIngredients.filter(ing => ing.id !== id));
        setSuccess('Ingrediente eliminado del plato.');
      } catch (err) {
        setError('Error al eliminar ingrediente del plato');
      }
    } else {
      setPendingIngredients(pendingIngredients.filter(ing => ing.id !== id));
      setSuccess('Ingrediente eliminado del plato.');
    }
  };

  // Buscador de platos
  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(search.toLowerCase()) ||
    (dish.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
    }
  };

  const handleImageClick = (photo) => {
    if (photo) {
      setSelectedImage(photo);
    }
  };

  const closePopup = () => {
    setSelectedImage(null);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
    setDishIngredients([]);
    setNewDishId(null);
    setError('');
    setSuccess('');
    setIsDuplicateName(false);
    setDuplicateNameErrorMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowNewIngredientForm(false);
    setNewIngredient({ name: '', unit: '' });
  };

  const handleAddNewIngredient = async () => {
    if (!newIngredient.name.trim()) {
      setError('El nombre del ingrediente es obligatorio');
      return;
    }
    try {
      const response = await api.post('/ingredients', newIngredient);
      setIngredients([...ingredients, response.data]);
      setNewIngredient({ name: '', unit: '' });
      setShowNewIngredientForm(false);
      setSuccess('Ingrediente añadido correctamente');
    } catch (err) {
      setError('Error al añadir ingrediente');
    }
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  console.log('Rendering DishesManager component');

  return (
    <div style={{ maxWidth: 1600, margin: '30px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#2a3d66', letterSpacing: 1, fontSize: '28px' }}>Platos</h2>
        <div>
          <button
            onClick={handleOpenModal}
            style={{ marginRight: 8, background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: '15px' }}
          >
            Añadir nuevo plato
          </button>
          <button
            onClick={handleBack}
            style={{ marginRight: 8, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: '15px' }}
          >
            Volver
          </button>
          <button
            onClick={handleLogout}
            style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: '15px' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Modal para añadir nuevo plato */}
      {showModal && (
        <div style={modalStyle}>
          <div style={{...modalContentStyle, width: '95%', maxWidth: '1400px'}}>
            <button style={modalCloseButtonStyle} onClick={handleCloseModal}>×</button>
            <h2 style={{ color: '#2a3d66', marginBottom: '20px' }}>Añadir nuevo plato</h2>
            
            {(error || success) && (
              <div style={error ? errorStyle : successStyle}>{error || success}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '16px' }}>
                <input 
                  name="name" 
                  placeholder="Nombre" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  style={{ flex: 1, borderRadius: 6, border: isDuplicateName ? '1px solid red' : '1px solid #bfc8e6', padding: 6 }} 
                />
                {duplicateNameErrorMessage && 
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '-10px', width: '100%' }}>
                    {duplicateNameErrorMessage}
                  </div>
                }
                <input 
                  name="category" 
                  placeholder="Categoría" 
                  value={form.category} 
                  onChange={handleChange} 
                  required 
                  style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} 
                />
                <input 
                  name="prep_time" 
                  placeholder="Tiempo prep." 
                  value={form.prep_time} 
                  onChange={handleChange} 
                  style={{ width: 100, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} 
                />
                <input 
                  name="cook_time" 
                  placeholder="Tiempo cocción" 
                  value={form.cook_time} 
                  onChange={handleChange} 
                  style={{ width: 120, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} 
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ width: 180, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} 
                />
              </div>

              <textarea 
                name="description" 
                placeholder="Descripción" 
                value={form.description} 
                onChange={handleChange} 
                style={{ width: '99%', marginBottom: '16px', borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} 
              />
              
              <textarea 
                name="instructions" 
                placeholder="Instrucciones" 
                value={form.instructions} 
                onChange={handleChange} 
                style={{
                  width: '99%', 
                  marginBottom: '16px', 
                  borderRadius: 6, 
                  border: '1px solid #bfc8e6', 
                  padding: 6,
                  minHeight: '150px'
                }}
                required 
              />

              {/* Sección de ingredientes */}
              <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3 style={{ color: '#2a3d66', marginBottom: '16px' }}>Ingredientes</h3>
                
                {/* Búsqueda de ingredientes */}
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Buscar ingrediente..."
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bfc8e6' }}
                  />
                </div>

                {/* Lista de ingredientes filtrados */}
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                  {filteredIngredients.map(ing => (
                    <div 
                      key={ing.id}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        ':hover': { background: '#f0f0f0' }
                      }}
                      onClick={() => {
                        setNewDishIng({ ...newDishIng, ingredient_id: ing.id });
                        setIngredientSearch(ing.name);
                      }}
                    >
                      {ing.name}
                    </div>
                  ))}
                </div>

                {/* Formulario para añadir ingrediente al plato */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="number"
                    min={1}
                    placeholder="Cantidad"
                    value={newDishIng.quantity}
                    onChange={e => setNewDishIng({ ...newDishIng, quantity: e.target.value })}
                    style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #bfc8e6' }}
                  />
                  <input
                    placeholder="Unidad"
                    value={newDishIng.unit}
                    onChange={e => setNewDishIng({ ...newDishIng, unit: e.target.value })}
                    style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #bfc8e6' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDishIngredient}
                    style={{ padding: '8px 16px', background: '#2a3d66', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Añadir ingrediente
                  </button>
                </div>

                {/* Botón para añadir nuevo ingrediente */}
                <button
                  type="button"
                  onClick={() => setShowNewIngredientForm(true)}
                  style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Añadir nuevo ingrediente
                </button>

                {/* Formulario para nuevo ingrediente */}
                {showNewIngredientForm && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '4px', border: '1px solid #bfc8e6' }}>
                    <h4 style={{ marginBottom: '16px' }}>Nuevo ingrediente</h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <input
                        placeholder="Nombre del ingrediente"
                        value={newIngredient.name}
                        onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #bfc8e6' }}
                      />
                      <input
                        placeholder="Unidad por defecto"
                        value={newIngredient.unit}
                        onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                        style={{ width: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #bfc8e6' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewIngredient}
                        style={{ padding: '8px 16px', background: '#2a3d66', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewIngredientForm(false)}
                        style={{ padding: '8px 16px', background: '#e57373', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de ingredientes añadidos */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Ingredientes añadidos:</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Ingrediente</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Cantidad</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Unidad</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingIngredients.map(di => (
                        <tr key={di.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '8px' }}>{di.name}</td>
                          <td style={{ padding: '8px' }}>{di.quantity}</td>
                          <td style={{ padding: '8px' }}>{di.unit}</td>
                          <td style={{ padding: '8px' }}>
                            <button
                              onClick={() => handleDeleteDishIngredient(di.id)}
                              style={{ padding: '4px 8px', background: '#e57373', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#2a3d66', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Guardar plato
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: '8px 16px', background: '#e57373', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o categoría..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 6, border: '1px solid #bfc8e6', padding: 10, width: 500, fontSize: '15px' }}
        />
      </div>

      <table border="0" cellPadding={8} style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e8f0' }}>
        <thead style={{ background: '#e3e8f0' }}>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left', fontSize: '15px', width: '60%' }}>Nombre</th>
            <th style={{ padding: '28px', textAlign: 'left', fontSize: '15px', width: '20%' }}>Categoría</th>
            <th style={{ padding: '50px', textAlign: 'left', fontSize: '15px', width: '20%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredDishes.map(dish => (
            <tr key={dish.id} style={{ background: '#f9f9f9', borderBottom: '1px solid #e3e8f0' }}>
              <td style={{ padding: '8px', fontSize: '15px' }}>
                <span 
                  onClick={() => handleImageClick(dish.photo)} 
                  style={{ cursor: dish.photo ? 'pointer' : 'default', color: dish.photo ? '#2a3d66' : 'inherit' }}
                >
                  {dish.name}
                </span>
              </td>
              <td style={{ padding: '8px', fontSize: '15px' }}>{dish.category}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleEdit(dish)} style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '15px' }}>Editar</button>
                <button onClick={() => handleDelete(dish.id)} style={{ marginLeft: 8, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '15px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <div style={popupOverlayStyle} onClick={closePopup}>
          <div style={popupContentStyle} onClick={e => e.stopPropagation()}>
            <button style={closeButtonStyle} onClick={closePopup}>×</button>
            <img 
              src={`http://localhost:3001${selectedImage}`} 
              alt="Plato" 
              style={popupImageStyle} 
            />
          </div>
        </div>
      )}
    </div>
  );
}