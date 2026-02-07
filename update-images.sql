-- Update Categories with Images
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1464226184081-280282068794?w=800&q=80' WHERE name_en = 'Fresh Vegetables';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80' WHERE name_en = 'Fresh Fruits';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1628185286519-3bda8aab5308?w=800&q=80' WHERE name_en = 'Organic Dairy';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80' WHERE name_en = 'Bread & Bakery';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80' WHERE name_en = 'Beverages';

-- Update Products with High-Quality Images

-- Fresh Vegetables
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592841494218-92ec4303e901?w=800&q=80' WHERE name_en = 'Fresh Tomatoes';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1610312048352-c3e06b9b88d2?w=800&q=80' WHERE name_en = 'Organic Cucumber';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1599599810694-b3b58ceaf60e?w=800&q=80' WHERE name_en = 'Leafy Spinach';

-- Fresh Fruits
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' WHERE name_en = 'Fresh Bananas';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80' WHERE name_en = 'Red Apples';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1582979191041-38161f08b60f?w=800&q=80' WHERE name_en = 'Oranges';

-- Organic Dairy
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-41c34cfb8f89?w=800&q=80' WHERE name_en = 'Fresh Milk 1L';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1488477181946-6428a0291840?w=800&q=80' WHERE name_en = 'Greek Yogurt 500g';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1618164436241-4473940571db?w=800&q=80' WHERE name_en = 'Fresh Cheese 200g';

-- Bread & Bakery
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80' WHERE name_en = 'Fresh Bread';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1585080420955-91baf5024856?w=800&q=80' WHERE name_en = 'Croissants Box';

-- Beverages
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80' WHERE name_en = 'Fresh Orange Juice 1L';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1599599810964-b70e6827e1e8?w=800&q=80' WHERE name_en = 'Almond Milk 500ml';

-- Update Offers with Images
UPDATE offers SET image_url = 'https://images.unsplash.com/photo-1491521089437-8c04eaf12e33?w=800&q=80' WHERE title_en = 'Fresh Vegetables Sale';
UPDATE offers SET image_url = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80' WHERE title_en = 'Fruit Bonanza';
UPDATE offers SET image_url = 'https://images.unsplash.com/photo-1628185286519-3bda8aab5308?w=800&q=80' WHERE title_en = 'Dairy Delights';
