const db = require('./db');

// Obtener la lista de la compra para un usuario
const getShoppingList = (userId) => {
  return new Promise((resolve, reject) => {
    // Obtener ítems generados del plan semanal
    const generatedItems = `
      SELECT 
        i.name,
        SUM(di.quantity * mp.servings) as total_quantity,
        di.unit,
        i.category,
        0 as is_checked,
        'generated' as source
      FROM meal_plans mp
      JOIN dishes d ON mp.dish_id = d.id
      JOIN dish_ingredients di ON d.id = di.dish_id
      JOIN ingredients i ON di.ingredient_id = i.id
      WHERE mp.user_id = ? 
      AND date(mp.date) >= date('now', 'start of week')
      AND date(mp.date) <= date('now', 'start of week', '+6 days')
      GROUP BY i.name, di.unit, i.category
    `;

    // Obtener ítems manuales
    const manualItems = `
      SELECT 
        name,
        quantity as total_quantity,
        unit,
        category,
        is_checked,
        'manual' as source,
        id
      FROM shopping_list_items
      WHERE user_id = ?
    `;

    db.all(generatedItems, [userId], (err, generated) => {
      if (err) {
        reject(err);
        return;
      }

      db.all(manualItems, [userId], (err, manual) => {
        if (err) {
          reject(err);
          return;
        }

        // Combinar y ordenar los resultados
        const allItems = [...generated, ...manual].sort((a, b) => {
          // Primero por categoría
          if (a.category !== b.category) {
            return (a.category || '').localeCompare(b.category || '');
          }
          // Luego por nombre
          return a.name.localeCompare(b.name);
        });

        resolve(allItems);
      });
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

module.exports = {
  getShoppingList,
  addManualItem,
  deleteManualItem,
  updateManualItem
};
