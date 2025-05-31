const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener la lista de la compra
router.get('/', authMiddleware, shoppingListController.getShoppingList);

// Añadir un ítem manual a la lista
router.post('/manual', authMiddleware, shoppingListController.addManualItem);

// Eliminar un ítem manual de la lista
router.delete('/manual/:id', authMiddleware, shoppingListController.deleteManualItem);

// Actualizar un ítem manual de la lista
router.put('/manual/:id', authMiddleware, shoppingListController.updateManualItem);

module.exports = router;
