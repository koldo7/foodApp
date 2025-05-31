const db = require('./db');

const createDish = (dish, callback) => {
  const sql = `INSERT INTO dishes (name, description, prep_time, cook_time, category, instructions, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [dish.name, dish.description, dish.prep_time, dish.cook_time, dish.category, dish.instructions, dish.photo], function (err) {
    callback(err, this ? this.lastID : null);
  });
};

const getAllDishes = (callback) => {
  db.all('SELECT * FROM dishes', [], (err, rows) => {
    callback(err, rows);
  });
};

const getDishById = (id, callback) => {
  db.get('SELECT * FROM dishes WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
};

const updateDish = (id, dish, callback) => {
  const sql = `UPDATE dishes SET name = ?, description = ?, prep_time = ?, cook_time = ?, category = ?, instructions = ?, photo = ? WHERE id = ?`;
  db.run(sql, [dish.name, dish.description, dish.prep_time, dish.cook_time, dish.category, dish.instructions, dish.photo, id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

const deleteDish = (id, callback) => {
  db.run('DELETE FROM dishes WHERE id = ?', [id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

// Relación Plato-Ingrediente
const addIngredientToDish = (dishId, ingredientId, quantity, unit, callback) => {
  const sql = `INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`;
  db.run(sql, [dishId, ingredientId, quantity, unit], function (err) {
    callback(err, this ? this.lastID : null);
  });
};

const getIngredientsByDish = (dishId, callback) => {
  const sql = `SELECT di.id, di.quantity, di.unit, i.id as ingredient_id, i.name, i.category
               FROM dish_ingredients di
               JOIN ingredients i ON di.ingredient_id = i.id
               WHERE di.dish_id = ?`;
  db.all(sql, [dishId], (err, rows) => {
    callback(err, rows);
  });
};

const updateDishIngredient = (id, quantity, unit, callback) => {
  const sql = `UPDATE dish_ingredients SET quantity = ?, unit = ? WHERE id = ?`;
  db.run(sql, [quantity, unit, id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

const removeDishIngredient = (id, callback) => {
  db.run('DELETE FROM dish_ingredients WHERE id = ?', [id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

module.exports = {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish,
  addIngredientToDish,
  getIngredientsByDish,
  updateDishIngredient,
  removeDishIngredient,
};

