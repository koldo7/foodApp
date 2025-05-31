require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const ingredientRoutes = require('./routes/ingredients');
const dishRoutes = require('./routes/dishes');
const mealPlanRoutes = require('./routes/mealPlan');
const shoppingListRoutes = require('./routes/shoppingList');

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('FoodArt API funcionando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

