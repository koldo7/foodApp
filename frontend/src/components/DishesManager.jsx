import { useEffect, useState } from 'react';
import api from '../api';

const successStyle = { color: 'green', marginBottom: 10, background: '#e6ffe6', padding: 8, borderRadius: 6, border: '1px solid #b2ffb2' };
const errorStyle = { color: 'red', marginBottom: 10, background: '#ffe6e6', padding: 8, borderRadius: 6, border: '1px solid #ffb2b2' };

export default function DishesManager({ onBack, onLogout }) {
  const [dishes, setDishes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
  const [editId, setEditId] = useState(null);
  const [dishIngredients, setDishIngredients] = useState([]);
  const [newDishIng, setNewDishIng] = useState({ ingredient_id: '', quantity: '', unit: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

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
    try {
      if (editId) {
        await api.put(`/dishes/${editId}`, form);
        setSuccess('Plato actualizado correctamente.');
      } else {
        await api.post('/dishes', form);
        setSuccess('Plato creado correctamente.');
      }
      setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' });
      setEditId(null);
      setDishIngredients([]);
      fetchDishes();
    } catch (err) {
      setError('Error al guardar plato');
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
    if (!editId || !newDishIng.ingredient_id || !newDishIng.quantity || !newDishIng.unit) {
      setError('Todos los campos del ingrediente son obligatorios.');
      return;
    }
    if (isNaN(Number(newDishIng.quantity)) || Number(newDishIng.quantity) <= 0) {
      setError('La cantidad debe ser un número positivo.');
      return;
    }
    try {
      await api.post(`/dishes/${editId}/ingredients`, newDishIng);
      setNewDishIng({ ingredient_id: '', quantity: '', unit: '' });
      fetchDishIngredients(editId);
      setSuccess('Ingrediente añadido al plato.');
    } catch (err) {
      setError('Error al añadir ingrediente al plato');
    }
  };

  const handleDeleteDishIngredient = async (id) => {
    try {
      await api.delete(`/dishes/${editId}/ingredients/${id}`);
      fetchDishIngredients(editId);
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

  console.log('Rendering DishesManager component');

  return (
    <div style={{ maxWidth: 900, margin: '30px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#2a3d66', letterSpacing: 1 }}>Platos</h2>
        <div>
          <button onClick={onBack} style={{ marginRight: 8, background: '#e3e8f0', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}>Volver</button>
          <button onClick={onLogout} style={{ background: '#e3e8f0', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}>Cerrar sesión</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, background: '#f9f9f9', padding: 16, borderRadius: 10, boxShadow: '0 2px 8px #e3e8f0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="category" placeholder="Categoría" value={form.category} onChange={handleChange} required style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="prep_time" placeholder="Tiempo prep." value={form.prep_time} onChange={handleChange} style={{ width: 100, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="cook_time" placeholder="Tiempo cocción" value={form.cook_time} onChange={handleChange} style={{ width: 120, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="photo" placeholder="URL foto" value={form.photo} onChange={handleChange} style={{ width: 180, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
        </div>
        <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} style={{ width: '99%', marginTop: 8, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
        <textarea name="instructions" placeholder="Instrucciones" value={form.instructions} onChange={handleChange} style={{ width: '99%', marginTop: 8, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} required />
        <div style={{ marginTop: 8 }}>
          <button type="submit" style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>{editId ? 'Actualizar' : 'Añadir'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', prep_time: '', cook_time: '', category: '', instructions: '', photo: '' }); setDishIngredients([]); }} style={{ marginLeft: 8, background: '#e3e8f0', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Cancelar</button>}
        </div>
      </form>
      {editId && (
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
              <td>{dish.name}</td>
              <td>{dish.category}</td>
              <td>
                <button onClick={() => handleEdit(dish)} style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(dish.id)} style={{ marginLeft: 8, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}