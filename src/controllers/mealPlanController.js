const mealPlanModel = require('../models/mealPlanModel');

const createOrUpdate = (req, res) => {
  const userId = req.user.id;
  const { date, slot, dish_id, servings, notes } = req.body;
  
  console.log('Creating/Updating meal plan:', { userId, date, slot, dish_id, servings, notes });
  
  if (!date || !slot || !dish_id || !servings) {
    console.log('Missing required fields:', { date, slot, dish_id, servings });
    return res.status(400).json({ message: 'Faltan datos obligatorios.' });
  }

  mealPlanModel.createOrUpdateMeal(userId, date, slot, dish_id, servings, notes || '', (err, id) => {
    if (err) {
      console.error('Error in createOrUpdateMeal:', err);
      return res.status(500).json({ 
        message: 'Error al guardar comida en el planificador.',
        error: err.message 
      });
    }
    console.log('Meal plan created/updated successfully with ID:', id);
    res.status(201).json({ id, date, slot, dish_id, servings, notes });
  });
};

const getWeek = (req, res) => {
  console.log('getWeek called with query:', req.query);
  console.log('User from request:', req.user);
  
  const userId = req.user.id;
  const { startDate, endDate } = req.query;
  
  console.log('Parsed parameters:', { userId, startDate, endDate });
  
  if (!startDate || !endDate) {
    console.log('Missing parameters');
    return res.status(400).json({ message: 'Debes indicar startDate y endDate (YYYY-MM-DD).' });
  }
  
  mealPlanModel.getWeekPlan(userId, startDate, endDate, (err, plan) => {
    if (err) {
      console.error('Error in getWeekPlan:', err);
      return res.status(500).json({ message: 'Error al obtener el planificador.', error: err.message });
    }
    console.log('Plan retrieved successfully:', plan);
    res.json(plan);
  });
};

const deleteMeal = (req, res) => {
  console.log('Deleting meal with ID:', req.params.id);
  
  mealPlanModel.deleteMeal(req.params.id, (err, changes) => {
    if (err) {
      console.error('Error in deleteMeal:', err);
      return res.status(500).json({ message: 'Error al eliminar comida.', error: err.message });
    }
    if (!changes) {
      console.log('No meal found with ID:', req.params.id);
      return res.status(404).json({ message: 'Comida no encontrada.' });
    }
    console.log('Meal deleted successfully, changes:', changes);
    res.json({ message: 'Comida eliminada.' });
  });
};

const clearDay = (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;
  
  console.log('Clearing day:', { userId, date });
  
  if (!date) {
    console.log('Missing date parameter');
    return res.status(400).json({ message: 'Debes indicar la fecha.' });
  }
  
  mealPlanModel.clearDay(userId, date, (err, changes) => {
    if (err) {
      console.error('Error in clearDay:', err);
      return res.status(500).json({ message: 'Error al limpiar el día.', error: err.message });
    }
    console.log('Day cleared successfully, changes:', changes);
    res.json({ message: 'Día limpiado.' });
  });
};

const clearWeek = (req, res) => {
  const userId = req.user.id;
  const { weekStart, weekEnd } = req.body;
  
  console.log('Clearing week:', { userId, weekStart, weekEnd });
  
  if (!weekStart || !weekEnd) {
    console.log('Missing week parameters');
    return res.status(400).json({ message: 'Debes indicar weekStart y weekEnd.' });
  }
  
  mealPlanModel.clearWeek(userId, weekStart, weekEnd, (err, changes) => {
    if (err) {
      console.error('Error in clearWeek:', err);
      return res.status(500).json({ message: 'Error al limpiar la semana.', error: err.message });
    }
    console.log('Week cleared successfully, changes:', changes);
    res.json({ message: 'Semana limpiada.' });
  });
};

module.exports = {
  createOrUpdate,
  getWeek,
  deleteMeal,
  clearDay,
  clearWeek,
}; 