const dishModel = require('../models/dishModel');

const create = (req, res) => {
  const { name, description, prep_time, cook_time, category, instructions, photo } = req.body;
  if (!name || !category || !instructions) {
    return res.status(400).json({ message: 'Nombre, categoría e instrucciones son requeridos.' });
  }
  const dish = { name, description, prep_time, cook_time, category, instructions, photo };
  dishModel.createDish(dish, (err, id) => {
    if (err) return res.status(500).json({ message: 'Error al crear plato.' });
    res.status(201).json({ id, ...dish });
  });
};

const getAll = (req, res) => {
  dishModel.getAllDishes((err, dishes) => {
    if (err) return res.status(500).json({ message: 'Error al obtener platos.' });
    res.json(dishes);
  });
};

const getById = (req, res) => {
  dishModel.getDishById(req.params.id, (err, dish) => {
    if (err) return res.status(500).json({ message: 'Error al obtener plato.' });
    if (!dish) return res.status(404).json({ message: 'Plato no encontrado.' });
    res.json(dish);
  });
};

const update = (req, res) => {
  const { name, description, prep_time, cook_time, category, instructions, photo } = req.body;
  const dish = { name, description, prep_time, cook_time, category, instructions, photo };
  dishModel.updateDish(req.params.id, dish, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar plato.' });
    if (!changes) return res.status(404).json({ message: 'Plato no encontrado.' });
    res.json({ message: 'Plato actualizado.' });
  });
};

const remove = (req, res) => {
  dishModel.deleteDish(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar plato.' });
    if (!changes) return res.status(404).json({ message: 'Plato no encontrado.' });
    res.json({ message: 'Plato eliminado.' });
  });
};

// Ingredientes de un plato
const addIngredient = (req, res) => {
  const { ingredient_id, quantity, unit } = req.body;
  const dishId = req.params.id;
  if (!ingredient_id || !quantity || !unit) {
    return res.status(400).json({ message: 'Faltan datos para añadir ingrediente.' });
  }
  dishModel.addIngredientToDish(dishId, ingredient_id, quantity, unit, (err, id) => {
    if (err) return res.status(500).json({ message: 'Error al añadir ingrediente al plato.' });
    res.status(201).json({ id, ingredient_id, quantity, unit });
  });
};

const getIngredients = (req, res) => {
  const dishId = req.params.id;
  dishModel.getIngredientsByDish(dishId, (err, ingredients) => {
    if (err) return res.status(500).json({ message: 'Error al obtener ingredientes del plato.' });
    res.json(ingredients);
  });
};

const updateIngredient = (req, res) => {
  const { quantity, unit } = req.body;
  const id = req.params.ingredientId;
  dishModel.updateDishIngredient(id, quantity, unit, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar ingrediente del plato.' });
    if (!changes) return res.status(404).json({ message: 'Ingrediente no encontrado en el plato.' });
    res.json({ message: 'Ingrediente actualizado.' });
  });
};

const removeIngredient = (req, res) => {
  const id = req.params.ingredientId;
  dishModel.removeDishIngredient(id, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar ingrediente del plato.' });
    if (!changes) return res.status(404).json({ message: 'Ingrediente no encontrado en el plato.' });
    res.json({ message: 'Ingrediente eliminado del plato.' });
  });
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  addIngredient,
  getIngredients,
  updateIngredient,
  removeIngredient,
};

