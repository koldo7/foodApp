-- Crear la tabla de lista de la compra
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT,
    category TEXT,
    is_checked INTEGER DEFAULT 0,
    dish_id INTEGER,
    dish_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_dish_id ON shopping_list_items(dish_id); 