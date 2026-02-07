-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  delivery_address TEXT,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'debit' or 'credit'
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  discount_percentage INTEGER,
  code VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  label VARCHAR(50),
  recipient_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  street_address TEXT NOT NULL,
  building_number VARCHAR(20),
  apartment VARCHAR(20),
  governorate VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Data

-- Insert Categories
INSERT INTO categories (name_en, name_ar, description_en, description_ar, display_order, is_active) VALUES
('Fresh Vegetables', 'الخضار الطازة', 'Fresh and organic vegetables', 'خضار عضوية طازة', 1, true),
('Fresh Fruits', 'الفاكهة الطازة', 'Fresh and seasonal fruits', 'فاكهة طازة وموسمية', 2, true),
('Organic Dairy', 'الألبان العضوية', 'Organic milk and dairy products', 'منتجات ألبان عضوية', 3, true),
('Bread & Bakery', 'الخبز والمخابز', 'Fresh baked goods daily', 'منتجات مخبوزة طازة يومياً', 4, true),
('Beverages', 'المشروبات', 'Fresh juices and beverages', 'عصائر ومشروبات طازة', 5, true);

-- Insert Products
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, discount_percentage, category_id, in_stock, stock_quantity) VALUES
-- Vegetables
('Fresh Tomatoes', 'طماطم طازة', 'Beautiful red tomatoes from local farms', 'طماطم حمراء جميلة من المزارع المحلية', 45, 10, (SELECT id FROM categories WHERE name_en = 'Fresh Vegetables' LIMIT 1), true, 100),
('Organic Cucumber', 'خيار عضوي', 'Fresh organic cucumbers', 'خيار عضوي طازة', 35, 5, (SELECT id FROM categories WHERE name_en = 'Fresh Vegetables' LIMIT 1), true, 80),
('Leafy Spinach', 'السبانخ الطازة', 'Nutritious spinach greens', 'أوراق السبانخ المغذية', 55, 0, (SELECT id FROM categories WHERE name_en = 'Fresh Vegetables' LIMIT 1), true, 60),

-- Fruits
('Fresh Bananas', 'الموز الطازة', 'Sweet yellow bananas', 'موز أصفر حلو', 89, 20, (SELECT id FROM categories WHERE name_en = 'Fresh Fruits' LIMIT 1), true, 150),
('Red Apples', 'التفاح الأحمر', 'Crispy red delicious apples', 'تفاح أحمر لذيذ وهش', 199, 15, (SELECT id FROM categories WHERE name_en = 'Fresh Fruits' LIMIT 1), true, 120),
('Oranges', 'البرتقال', 'Sweet oranges full of vitamin C', 'برتقال حلو غني بفيتامين سي', 129, 10, (SELECT id FROM categories WHERE name_en = 'Fresh Fruits' LIMIT 1), true, 200),

-- Dairy
('Fresh Milk 1L', 'الحليب الطازة 1 لتر', 'Pure fresh milk', 'حليب طازة نقي', 145, 5, (SELECT id FROM categories WHERE name_en = 'Organic Dairy' LIMIT 1), true, 500),
('Greek Yogurt 500g', 'الزبادي اليوناني 500جم', 'Creamy Greek yogurt', 'زبادي يوناني كريمي', 225, 0, (SELECT id FROM categories WHERE name_en = 'Organic Dairy' LIMIT 1), true, 250),
('Fresh Cheese 200g', 'الجبن الطازة 200جم', 'Soft white cheese', 'جبن أبيض ناعم', 185, 10, (SELECT id FROM categories WHERE name_en = 'Organic Dairy' LIMIT 1), true, 300),

-- Bakery
('Fresh Bread', 'الخبز الطازة', 'Wholesome whole wheat bread', 'خبز قمح كامل صحي', 85, 0, (SELECT id FROM categories WHERE name_en = 'Bread & Bakery' LIMIT 1), true, 400),
('Croissants Box', 'صندوق الكرواسان', 'Butter croissants pack of 4', 'كرواسان الزبدة مجموعة 4', 295, 15, (SELECT id FROM categories WHERE name_en = 'Bread & Bakery' LIMIT 1), true, 150),

-- Beverages
('Fresh Orange Juice 1L', 'عصير البرتقال الطازة 1 لتر', 'Pure orange juice', 'عصير برتقال خالص', 165, 10, (SELECT id FROM categories WHERE name_en = 'Beverages' LIMIT 1), true, 200),
('Almond Milk 500ml', 'حليب اللوز 500 مل', 'Plant-based almond milk', 'حليب اللوز النباتي', 125, 5, (SELECT id FROM categories WHERE name_en = 'Beverages' LIMIT 1), true, 180);

-- Insert Offers
INSERT INTO offers (title_en, title_ar, description_en, description_ar, discount_percentage, is_active) VALUES
('Fresh Vegetables Sale', 'تخفيف الخضار الطازة', 'Get 20% off on all vegetables', 'احصل على خصم 20% على جميع الخضار', 20, true),
('Fruit Bonanza', 'عرض الفاكهة المجنونة', 'Buy 2 get 10% off on fruits', 'اشتري 2 واحصل على 10% خصم على الفاكهة', 10, true),
('Dairy Delights', 'متع الألبان', 'Special discount on dairy products', 'خصم خاص على منتجات الألبان', 15, true);

-- Create RLS Policies

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Cart Items Policy
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders Policy
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Addresses Policy
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Wishlist Policy
CREATE POLICY "Users can view own wishlist" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist" ON wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist" ON wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Wallets Policy
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Public Access for Categories and Products
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view offers" ON offers
  FOR SELECT USING (true);
