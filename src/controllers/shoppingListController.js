const shoppingListModel = require('../models/shoppingListModel');

// Obtener la lista de la compra
const getShoppingList = async (req, res) => {
  try {
    console.log('getShoppingList controller: Starting...');
    const userId = req.user.id;
    console.log('getShoppingList controller: userId =', userId);
    
    if (!userId) {
      console.error('getShoppingList controller: No user ID provided');
      return res.status(400).json({ error: 'No user ID provided' });
    }

    console.log('getShoppingList controller: Fetching shopping list...');
    const shoppingList = await shoppingListModel.getShoppingList(userId);
    console.log('getShoppingList controller: Shopping list fetched successfully:', shoppingList);
    
    res.json(shoppingList);
  } catch (error) {
    console.error('getShoppingList controller: Error details:', error);
    console.error('getShoppingList controller: Error stack:', error.stack);
    res.status(500).json({ error: 'Error al obtener la lista de la compra: ' + error.message });
  }
};

// Añadir un ítem manual a la lista
const addManualItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const item = req.body;
    
    // Validar campos requeridos
    if (!item.name) {
      return res.status(400).json({ error: 'El nombre del ítem es requerido' });
    }

    const newItem = await shoppingListModel.addManualItem(userId, item);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error al añadir ítem a la lista:', error);
    res.status(500).json({ error: 'Error al añadir ítem a la lista' });
  }
};

// Añadir un ítem generado a la lista
const addGeneratedItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const item = req.body;
    
    // Validar campos requeridos
    if (!item.name || !item.dish_id || !item.dish_name) {
      return res.status(400).json({ error: 'El nombre del ítem, el ID del plato y el nombre del plato son requeridos' });
    }

    const newItem = await shoppingListModel.addGeneratedItem(userId, item);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error al añadir ítem generado a la lista:', error);
    res.status(500).json({ error: 'Error al añadir ítem generado a la lista' });
  }
};

// Eliminar un ítem manual de la lista
const deleteManualItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    
    const result = await shoppingListModel.deleteManualItem(userId, itemId);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }
    
    res.json({ message: 'Ítem eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ítem de la lista:', error);
    res.status(500).json({ error: 'Error al eliminar ítem de la lista' });
  }
};

// Actualizar un ítem manual de la lista
const updateManualItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const updates = req.body;
    
    const result = await shoppingListModel.updateManualItem(userId, itemId, updates);
    if (!result.updated) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }
    
    res.json({ message: 'Ítem actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar ítem de la lista:', error);
    res.status(500).json({ error: 'Error al actualizar ítem de la lista' });
  }
};

// Eliminar ítems generados por un plato
const deleteItemsByDish = async (req, res) => {
  try {
    const userId = req.user.id;
    const dishId = req.params.dish_id;

    const result = await shoppingListModel.deleteItemsByDish(userId, dishId);
    
    res.json({ message: 'Ítems del plato eliminados de la lista', count: result.deleted });
  } catch (error) {
    console.error('Error al eliminar ítems por plato:', error);
    res.status(500).json({ error: 'Error al eliminar ítems por plato' });
  }
};

module.exports = {
  getShoppingList,
  addManualItem,
  addGeneratedItem,
  deleteManualItem,
  updateManualItem,
  deleteItemsByDish
};
