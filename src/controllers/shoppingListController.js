const shoppingListModel = require('../models/shoppingListModel');

// Obtener la lista de la compra
const getShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching shopping list for userId:', userId);
    const shoppingList = await shoppingListModel.getShoppingList(userId);
    res.json(shoppingList);
  } catch (error) {
    console.error('Error al obtener la lista de la compra:', error);
    res.status(500).json({ error: 'Error al obtener la lista de la compra' });
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

module.exports = {
  getShoppingList,
  addManualItem,
  deleteManualItem,
  updateManualItem
};
