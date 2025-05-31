const db = require('./db');

const createIngredient = (name, unit, category, stock, callback) => {
  const sql = 'INSERT INTO ingredients (name, unit, category, stock) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, unit, category, stock], function (err) {
    callback(err, this ? this.lastID : null);
  });
};

const getAllIngredients = (callback) => {
  db.all('SELECT * FROM ingredients', [], (err, rows) => {
    callback(err, rows);
  });
};

const getIngredientById = (id, callback) => {
  db.get('SELECT * FROM ingredients WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
};

const updateIngredient = (id, name, unit, category, stock, callback) => {
  const sql = 'UPDATE ingredients SET name = ?, unit = ?, category = ?, stock = ? WHERE id = ?';
  db.run(sql, [name, unit, category, stock, id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

const deleteIngredient = (id, callback) => {
  db.run('DELETE FROM ingredients WHERE id = ?', [id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

module.exports = {
  createIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
};

