const db = require('./db');

const createOrUpdateMeal = (userId, date, slot, dishId, servings, notes, callback) => {
  // Siempre insertar un nuevo registro
  const sql = `INSERT INTO meal_plans (user_id, date, slot, dish_id, servings, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  console.log('Inserting meal plan:', { userId, date, slot, dishId, servings, notes });
  
  db.run(sql, [userId, date, slot, dishId, servings, notes], function (err) {
    if (err) {
      console.error('Error executing createOrUpdateMeal SQL:', err);
      return callback(err);
    }
    console.log('Meal plan inserted successfully with ID:', this.lastID);
    callback(null, this.lastID);
  });
};

const getWeekPlan = (userId, weekStart, weekEnd, callback) => {
  const sql = `SELECT mp.*, d.name as dish_name, d.category as dish_category 
               FROM meal_plans mp
               JOIN dishes d ON mp.dish_id = d.id
               WHERE mp.user_id = ? AND mp.date BETWEEN ? AND ?
               ORDER BY mp.date, mp.slot`;
  
  console.log('Getting week plan:', { userId, weekStart, weekEnd });
  
  db.all(sql, [userId, weekStart, weekEnd], (err, rows) => {
    if (err) {
      console.error('Error getting week plan:', err);
    }
    console.log('Week plan retrieved:', rows);
    callback(err, rows);
  });
};

const deleteMeal = (id, callback) => {
  console.log('Deleting meal:', id);
  
  db.run('DELETE FROM meal_plans WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting meal:', err);
    }
    console.log('Meal deleted, changes:', this.changes);
    callback(err, this.changes);
  });
};

const clearDay = (userId, date, callback) => {
  console.log('Clearing day:', { userId, date });
  
  db.run('DELETE FROM meal_plans WHERE user_id = ? AND date = ?', [userId, date], function (err) {
    if (err) {
      console.error('Error clearing day:', err);
    }
    console.log('Day cleared, changes:', this.changes);
    callback(err, this.changes);
  });
};

const clearWeek = (userId, weekStart, weekEnd, callback) => {
  console.log('Clearing week:', { userId, weekStart, weekEnd });
  
  db.run('DELETE FROM meal_plans WHERE user_id = ? AND date BETWEEN ? AND ?', [userId, weekStart, weekEnd], function (err) {
    if (err) {
      console.error('Error clearing week:', err);
    }
    console.log('Week cleared, changes:', this.changes);
    callback(err, this.changes);
  });
};

module.exports = {
  createOrUpdateMeal,
  getWeekPlan,
  deleteMeal,
  clearDay,
  clearWeek,
}; 