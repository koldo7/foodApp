const db = require('./db');

// Obtener la lista de la compra para un usuario
const getShoppingList = (userId) => {
  return new Promise((resolve, reject) => {
    // Primero verificar si la tabla meal_plans existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='meal_plans'", (err, result) => {
      if (err) {
        console.error('Error checking meal_plans table:', err);
        reject(err);
        return;
      }

      // Si la tabla meal_plans no existe, solo obtener ítems manuales
      if (!result) {
        console.log('meal_plans table does not exist, only fetching manual items');
        getManualItems(userId)
          .then(manual => resolve(manual))
          .catch(err => reject(err));
        return;
      }

      // Si la tabla existe, obtener tanto ítems generados como manuales
      const generatedItems = `
        SELECT 
          COALESCE(i.name, '') as name,
          SUM(di.quantity * mp.servings) as total_quantity,
          COALESCE(di.unit, '') as unit,
          COALESCE(i.category, '') as category,
          0 as is_checked,
          'generated' as source,
          d.id as dish_id,
          d.name as dish_name
        FROM meal_plans mp
        LEFT JOIN dishes d ON mp.dish_id = d.id
        LEFT JOIN dish_ingredients di ON d.id = di.dish_id
        LEFT JOIN ingredients i ON di.ingredient_id = i.id
        WHERE mp.user_id = ? 
        AND date(mp.date) >= date('now')
        GROUP BY i.name, di.unit, i.category, d.id, d.name
      `;

      console.log('Executing generatedItems query for userId:', userId);
      console.log('Query:', generatedItems);

      db.all(generatedItems, [userId], (err, generated) => {
        if (err) {
          console.error('Error executing generatedItems query:', err);
          reject(err);
          return;
        }
        console.log('Generated items result (from query):', generated);

        getManualItems(userId)
          .then(manual => {
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
          })
          .catch(err => reject(err));
      });
    });
  });
};

// Función auxiliar para obtener ítems manuales
const getManualItems = (userId) => {
  return new Promise((resolve, reject) => {
    const manualItems = `
      SELECT 
        name,
        quantity as total_quantity,
        unit,
        category,
        is_checked,
        'manual' as source,
        id,
        COALESCE(dish_id, NULL) as dish_id,
        COALESCE(dish_name, NULL) as dish_name
      FROM shopping_list_items
      WHERE user_id = ?
    `;

    console.log('Executing manualItems query for userId:', userId);
    console.log('Query:', manualItems);

    db.all(manualItems, [userId], (err, manual) => {
      if (err) {
        console.error('Error executing manualItems query:', err);
        reject(err);
        return;
      }
      console.log('Manual items result:', manual);
      resolve(manual);
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
