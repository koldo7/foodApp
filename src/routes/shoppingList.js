const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener la lista de la compra
router.get('/', authMiddleware, shoppingListController.getShoppingList);

// Añadir un ítem manual
router.post('/manual', authMiddleware, shoppingListController.addManualItem);

// Añadir un ítem generado (desde un plato)
router.post('/generated', authMiddleware, shoppingListController.addGeneratedItem);

// Actualizar un ítem
router.put('/:id', authMiddleware, shoppingListController.updateManualItem);

// Eliminar un ítem por su ID
router.delete('/:id', authMiddleware, shoppingListController.deleteManualItem);

// Eliminar todos los ítems asociados a un plato
router.delete('/by-dish/:dishId', authMiddleware, shoppingListController.deleteItemsByDish);

module.exports = router;
