const mealPlanModel = require('../models/mealPlanModel');

const createOrUpdate = (req, res) => {
  const userId = req.user.id;
  const { date, slot, dish_id, servings, notes } = req.body;
  if (!date || !slot || !dish_id || !servings) {
    return res.status(400).json({ message: 'Faltan datos obligatorios.' });
  }
  mealPlanModel.createOrUpdateMeal(userId, date, slot, dish_id, servings, notes || '', (err, id) => {
    if (err) return res.status(500).json({ message: 'Error al guardar comida en el planificador.' });
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
  mealPlanModel.deleteMeal(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar comida.' });
    if (!changes) return res.status(404).json({ message: 'Comida no encontrada.' });
    res.json({ message: 'Comida eliminada.' });
  });
};

const clearDay = (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;
  if (!date) return res.status(400).json({ message: 'Debes indicar la fecha.' });
  mealPlanModel.clearDay(userId, date, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al limpiar el día.' });
    res.json({ message: 'Día limpiado.' });
  });
};

const clearWeek = (req, res) => {
  const userId = req.user.id;
  const { weekStart, weekEnd } = req.body;
  if (!weekStart || !weekEnd) return res.status(400).json({ message: 'Debes indicar weekStart y weekEnd.' });
  mealPlanModel.clearWeek(userId, weekStart, weekEnd, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al limpiar la semana.' });
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