const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Crear o actualizar un slot de comida
router.post('/', mealPlanController.createOrUpdate);
// Obtener el planificador de una semana
router.get('/', mealPlanController.getWeek);
// Eliminar una comida
router.delete('/:id', mealPlanController.deleteMeal);
// Limpiar un día
router.post('/clear-day', mealPlanController.clearDay);
// Limpiar una semana
router.post('/clear-week', mealPlanController.clearWeek);

module.exports = router; 