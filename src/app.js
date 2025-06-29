require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const authRoutes = require('./routes/auth');
const ingredientRoutes = require('./routes/ingredients');
const dishRoutes = require('./routes/dishes');
const mealPlanRoutes = require('./routes/mealPlan');
const shoppingListRoutes = require('./routes/shoppingList');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Servir archivos estáticos

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

// --- Servir Frontend en Producción ---
// Construir la ruta correcta para salir de /src y encontrar la carpeta /frontend
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Para cualquier otra ruta, servir el index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('FoodArt API funcionando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

