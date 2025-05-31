import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const successStyle = { color: 'green', marginBottom: 10, background: '#e6ffe6', padding: 8, borderRadius: 6, border: '1px solid #b2ffb2' };
const errorStyle = { color: 'red', marginBottom: 10, background: '#ffe6e6', padding: 8, borderRadius: 6, border: '1px solid #ffb2b2' };

export default function IngredientsManager({ onBack, onLogout }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ name: '', unit: '', category: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/ingredients');
      setIngredients(res.data);
    } catch (err) {
      setError('Error al cargar ingredientes');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.unit.trim()) {
      setError('Nombre y unidad son obligatorios.');
      return false;
    }
    if (form.stock && (isNaN(Number(form.stock)) || Number(form.stock) < 0)) {
      setError('El stock debe ser un número positivo.');
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
        await api.put(`/ingredients/${editId}`, form);
        setSuccess('Ingrediente actualizado correctamente.');
      } else {
        await api.post('/ingredients', form);
        setSuccess('Ingrediente creado correctamente.');
      }
      setForm({ name: '', unit: '', category: '', stock: '' });
      setEditId(null);
      fetchIngredients();
    } catch (err) {
      setError('Error al guardar ingrediente');
    }
  };

  const handleEdit = ing => {
    setForm({ name: ing.name, unit: ing.unit, category: ing.category || '', stock: ing.stock || '' });
    setEditId(ing.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar ingrediente?')) return;
    try {
      await api.delete(`/ingredients/${id}`);
      fetchIngredients();
      setSuccess('Ingrediente eliminado correctamente.');
    } catch (err) {
      setError('Error al eliminar ingrediente');
    }
  };

  // Buscador de ingredientes
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(search.toLowerCase()) ||
    (ing.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/');
  };

  console.log('Rendering IngredientsManager component');

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#2a3d66', letterSpacing: 1 }}>Ingredientes</h2>
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
          <input name="unit" placeholder="Unidad" value={form.unit} onChange={handleChange} required style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="category" placeholder="Categoría" value={form.category} onChange={handleChange} style={{ flex: 1, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
          <input name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} style={{ width: 80, borderRadius: 6, border: '1px solid #bfc8e6', padding: 6 }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>{editId ? 'Actualizar' : 'Añadir'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', unit: '', category: '', stock: '' }); }} style={{ marginLeft: 8, background: '#e3e8f0', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Cancelar</button>}
        </div>
      </form>
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
            <th>Unidad</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredIngredients.map(ing => (
            <tr key={ing.id} style={{ background: '#f9f9f9', borderBottom: '1px solid #e3e8f0' }}>
              <td>{ing.name}</td>
              <td>{ing.unit}</td>
              <td>{ing.category}</td>
              <td>{ing.stock}</td>
              <td>
                <button onClick={() => handleEdit(ing)} style={{ background: '#2a3d66', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(ing.id)} style={{ marginLeft: 8, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 