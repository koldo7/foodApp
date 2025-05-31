const db = require('./db');

const createOrUpdateMeal = (userId, date, slot, dishId, servings, notes, callback) => {
  // Si ya existe un registro para ese usuario, fecha y slot, actualiza; si no, inserta
  const sql = `INSERT INTO meal_plans (user_id, date, slot, dish_id, servings, notes)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id, date, slot) DO UPDATE SET dish_id=excluded.dish_id, servings=excluded.servings, notes=excluded.notes`;
  db.run(sql, [userId, date, slot, dishId, servings, notes], function (err) {
    if (err) {
      console.error('Error executing createOrUpdateMeal SQL:', err);
      return callback(err);
    }
    callback(null, this ? this.lastID : null);
  });
};

const getWeekPlan = (userId, weekStart, weekEnd, callback) => {
  const sql = `SELECT mp.*, d.name as dish_name, d.category as dish_category FROM meal_plans mp
               JOIN dishes d ON mp.dish_id = d.id
               WHERE mp.user_id = ? AND mp.date BETWEEN ? AND ?
               ORDER BY mp.date, mp.slot`;
  db.all(sql, [userId, weekStart, weekEnd], (err, rows) => {
    callback(err, rows);
  });
};

const deleteMeal = (id, callback) => {
  db.run('DELETE FROM meal_plans WHERE id = ?', [id], function (err) {
    callback(err, this ? this.changes : null);
  });
};

const clearDay = (userId, date, callback) => {
  db.run('DELETE FROM meal_plans WHERE user_id = ? AND date = ?', [userId, date], function (err) {
    callback(err, this ? this.changes : null);
  });
};

const clearWeek = (userId, weekStart, weekEnd, callback) => {
  db.run('DELETE FROM meal_plans WHERE user_id = ? AND date BETWEEN ? AND ?', [userId, weekStart, weekEnd], function (err) {
    callback(err, this ? this.changes : null);
  });
};

module.exports = {
  createOrUpdateMeal,
  getWeekPlan,
  deleteMeal,
  clearDay,
  clearWeek,
}; 