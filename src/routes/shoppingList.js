const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener la lista de la compra
router.get('/', authMiddleware, shoppingListController.getShoppingList);

// Añadir un ítem manual a la lista
router.post('/manual', authMiddleware, shoppingListController.addManualItem);

// Añadir un ítem generado a la lista
router.post('/generated', authMiddleware, shoppingListController.addGeneratedItem);

// Eliminar un ítem manual de la lista
router.delete('/:id', authMiddleware, shoppingListController.deleteManualItem);

// Actualizar un ítem manual de la lista
router.put('/manual/:id', authMiddleware, shoppingListController.updateManualItem);

// Eliminar ítems de un plato de la lista
router.delete('/dish/:dish_id', authMiddleware, shoppingListController.deleteItemsByDish);

module.exports = router;
