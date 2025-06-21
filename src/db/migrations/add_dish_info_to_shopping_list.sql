-- Añadir columnas para información del plato
ALTER TABLE shopping_list_items ADD COLUMN dish_id INTEGER;
ALTER TABLE shopping_list_items ADD COLUMN dish_name TEXT;

-- Añadir índice para búsquedas por plato
CREATE INDEX idx_shopping_list_dish_id ON shopping_list_items(dish_id); 