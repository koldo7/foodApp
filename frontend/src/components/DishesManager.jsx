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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
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
        setSuccess('Plato actualizado correctamente.');
      } else {
        const response = await api.post('/dishes', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
        setNewDishId(response.data.id);
        setSuccess('Plato creado correctamente.');
      }
      setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
      setEditId(null);
      setDishIngredients([]);
      fetchDishes();
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
    await fetchDishIngredients(dish.id);
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
    const dishId = editId || newDishId;
    if (!dishId || !newDishIng.ingredient_id || !newDishIng.quantity || !newDishIng.unit) {
      setError('Todos los campos del ingrediente son obligatorios.');
      return;
    }
    if (isNaN(Number(newDishIng.quantity)) || Number(newDishIng.quantity) <= 0) {
      setError('La cantidad debe ser un número positivo.');
      return;
    }
    try {
      await api.post(`/dishes/${dishId}/ingredients`, newDishIng);
      setNewDishIng({ ingredient_id: '', quantity: '', unit: '' });
      fetchDishIngredients(dishId);
      setSuccess('Ingrediente añadido al plato.');
    } catch (err) {
      setError('Error al añadir ingrediente al plato');
    }
  };

  const handleDeleteDishIngredient = async (id) => {
    const dishId = editId || newDishId;
    try {
      await api.delete(`/dishes/${dishId}/ingredients/${id}`);
      fetchDishIngredients(dishId);
      setSuccess('Ingrediente eliminado del plato.');
    } catch (err) {
      setError('Error al eliminar ingrediente del plato');
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

  console.log('Rendering DishesManager component');

  return (
    <div style={{ maxWidth: 900, margin: '30px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#2a3d66', letterSpacing: 1 }}>Platos</h2>
        <div>
          <button
            onClick={handleBack}
            style={{ marginRight: 8, background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            Volver
          </button>
          <button
            onClick={handleLogout}
            style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, background: '#f9f9f9', padding: 16, borderRadius: 10, boxShadow: '0 2px 8px #e3e8f0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="category" placeholder="Categoría" value={form.category} onChange={handleChange} required style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="prep_time" placeholder="Tiempo prep." value={form.prep_time} onChange={handleChange} style={{ width: 100, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="cook_time" placeholder="Tiempo cocción" value={form.cook_time} onChange={handleChange} style={{ width: 120, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ width: 180, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} 
          />
        </div>
        <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} style={{ width: '99%', marginTop: 8, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
        <textarea 
          name="instructions" 
          placeholder="Instrucciones" 
          value={form.instructions} 
          onChange={handleChange} 
          style={{
            width: '99%', 
            marginTop: 8, 
            borderRadius: 6, 
            border: '1px solid #bfc8e6', 
            padding: 6,
            minHeight: '150px'
          }}
          required 
        />
        <div style={{ marginTop: 8 }}>
          <button type="submit" style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>{editId ? 'Actualizar' : 'Añadir'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' }); setDishIngredients([]); }} style={{ marginLeft: 8, background: '#e3e8f0', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Cancelar</button>}
        </div>
      </form>
      {(editId || newDishId) && (
        <div style={{ background: '#eef', padding: 12, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h4 style={{ color: '#2a3d66' }}>Ingredientes del plato</h4>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <select value={newDishIng.ingredient_id} onChange={e => setNewDishIng({ ...newDishIng, ingredient_id: e.target.value })} style={{ borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }}>
              <option value="">--Ingrediente--</option>
              {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
            </select>
            <input type="number" min={1} placeholder="Cantidad" value={newDishIng.quantity} onChange={e => setNewDishIng({ ...newDishIng, quantity: e.target.value })} style={{ width: 80, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
            <input placeholder="Unidad" value={newDishIng.unit} onChange={e => setNewDishIng({ ...newDishIng, unit: e.target.value })} style={{ width: 80, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
            <button type="button" onClick={handleAddDishIngredient} style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Añadir</button>
          </div>
          <table border="0" cellPadding={6} style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e8f0' }}>
            <thead style={{ background: '#e3e8f0' }}>
              <tr>
                <th>Ingrediente</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dishIngredients.map(di => (
                <tr key={di.id} style={{ background: '#f9f9f9', borderBottom: '1px solid #e3e8f0' }}>
                  <td>{di.name}</td>
                  <td>{di.quantity}</td>
                  <td>{di.unit}</td>
                  <td><button onClick={() => handleDeleteDishIngredient(di.id)} style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(error || success) && (
        <div style={error ? errorStyle : successStyle}>{error || success}</div>
      )}
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o categoría..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 6, border: '1px solid #bfc8e6', padding: 6, width: 300 }}
        />
      </div>
      <table border="0" cellPadding={6} style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e8f0' }}>
        <thead style={{ background: '#e3e8f0' }}>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredDishes.map(dish => (
            <tr key={dish.id} style={{ background: '#f9f9f9', borderBottom: '1px solid #e3e8f0' }}>
              <td>
                <span 
                  onClick={() => handleImageClick(dish.photo)} 
                  style={{ cursor: dish.photo ? 'pointer' : 'default', color: dish.photo ? '#2a3d66' : 'inherit' }}
                >
                  {dish.name}
                </span>
              </td>
              <td>{dish.category}</td>
              <td>
                <button onClick={() => handleEdit(dish)} style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(dish.id)} style={{ marginLeft: 8, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Eliminar</button>
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