const db = require('./db');

// Obtener la lista de la compra para un usuario
const getShoppingList = (userId) => {
  return new Promise((resolve, reject) => {
    // La única fuente de verdad para la lista de la compra es la tabla shopping_list_items.
    const sql = `
      SELECT 
        id,
        name,
        quantity,
        unit,
        category,
        is_checked,
        dish_id,
        dish_name,
        CASE
          WHEN dish_id IS NOT NULL THEN 'generated'
          ELSE 'manual'
        END as source
      FROM shopping_list_items
      WHERE user_id = ?
      ORDER BY category, name
    `;
    
    db.all(sql, [userId], (err, items) => {
      if (err) {
        reject(err);
        return;
      }
      // Renombrar 'quantity' a 'total_quantity' para mantener la consistencia con el frontend
      const result = items.map(item => ({ ...item, total_quantity: item.quantity }));
      resolve(result);
    });
  });
};

// Añadir un ítem manual a la lista
const addManualItem = (userId, item) => {
  return new Promise((resolve, reject) => {
    const { name, quantity, unit, category } = item;
    const sql = `
      INSERT INTO shopping_list_items (user_id, name, quantity, unit, category)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [userId, name, quantity, unit, category], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, ...item });
    });
  });
};

// Añadir un ítem generado a la lista
const addGeneratedItem = (userId, item) => {
  return new Promise((resolve, reject) => {
    const { name, quantity, unit, category, dish_id, dish_name } = item;
    const sql = `
      INSERT INTO shopping_list_items (user_id, name, quantity, unit, category, dish_id, dish_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [userId, name, quantity, unit, category, dish_id, dish_name], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, ...item });
    });
  });
};

// Eliminar un ítem manual de la lista
const deleteManualItem = (userId, itemId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM shopping_list_items 
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(sql, [itemId, userId], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ deleted: this.changes > 0 });
    });
  });
};

// Actualizar un ítem manual de la lista
const updateManualItem = (userId, itemId, updates) => {
  return new Promise((resolve, reject) => {
    const { name, quantity, unit, category, is_checked } = updates;
    const sql = `
      UPDATE shopping_list_items 
      SET name = ?, quantity = ?, unit = ?, category = ?, is_checked = ?
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(sql, [name, quantity, unit, category, is_checked, itemId, userId], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ updated: this.changes > 0 });
    });
  });
};

// Eliminar ítems generados por un plato específico
const deleteItemsByDish = (userId, dishId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM shopping_list_items 
      WHERE user_id = ? AND dish_id = ?
    `;
    
    db.run(sql, [userId, dishId], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ deleted: this.changes });
    });
  });
};

module.exports = {
  getShoppingList,
  addManualItem,
  addGeneratedItem,
  deleteManualItem,
  updateManualItem,
  deleteItemsByDish
};
