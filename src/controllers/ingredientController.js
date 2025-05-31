const ingredientModel = require('../models/ingredientModel');

const create = (req, res) => {
  const { name, unit, category, stock } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ message: 'Nombre y unidad son requeridos.' });
  }
  ingredientModel.createIngredient(name, unit, category || '', stock || 0, (err, id) => {
    if (err) return res.status(500).json({ message: 'Error al crear ingrediente.' });
    res.status(201).json({ id, name, unit, category, stock });
  });
};

const getAll = (req, res) => {
  ingredientModel.getAllIngredients((err, ingredients) => {
    if (err) return res.status(500).json({ message: 'Error al obtener ingredientes.' });
    res.json(ingredients);
  });
};

const getById = (req, res) => {
  ingredientModel.getIngredientById(req.params.id, (err, ingredient) => {
    if (err) return res.status(500).json({ message: 'Error al obtener ingrediente.' });
    if (!ingredient) return res.status(404).json({ message: 'Ingrediente no encontrado.' });
    res.json(ingredient);
  });
};

const update = (req, res) => {
  const { name, unit, category, stock } = req.body;
  ingredientModel.updateIngredient(req.params.id, name, unit, category, stock, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar ingrediente.' });
    if (!changes) return res.status(404).json({ message: 'Ingrediente no encontrado.' });
    res.json({ message: 'Ingrediente actualizado.' });
  });
};

const remove = (req, res) => {
  ingredientModel.deleteIngredient(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar ingrediente.' });
    if (!changes) return res.status(404).json({ message: 'Ingrediente no encontrado.' });
    res.json({ message: 'Ingrediente eliminado.' });
  });
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};

