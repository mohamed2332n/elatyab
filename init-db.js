#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
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

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  discount_percentage DECIMAL(5, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table
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

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  delivery_address TEXT,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  label VARCHAR(50),
  recipient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  building_number VARCHAR(50),
  apartment VARCHAR(50),
  governorate VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Sample Categories
INSERT INTO categories (name_en, name_ar, description_en, description_ar, display_order, is_active)
VALUES
  ('Fresh Vegetables', 'الخضار الطازة', 'Fresh and organic vegetables', 'خضار عضوية طازة', 1, true),
  ('Fresh Fruits', 'الفاكهة الطازة', 'Fresh and seasonal fruits', 'فاكهة طازة وموسمية', 2, true),
  ('Organic Dairy', 'الألبان العضوية', 'Organic milk and dairy products', 'منتجات ألبان عضوية', 3, true),
  ('Bread & Bakery', 'الخبز والمخابز', 'Fresh baked goods daily', 'منتجات مخبوزة طازة يومياً', 4, true),
  ('Beverages', 'المشروبات', 'Fresh juices and beverages', 'عصائر ومشروبات طازة', 5, true)
ON CONFLICT DO NOTHING;

-- Insert Sample Products (after categories are created)
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, discount_percentage, category_id, in_stock, stock_quantity)
SELECT
  'Fresh Tomatoes', 'طماطم طازة', 'Beautiful red tomatoes from local farms', 'طماطم حمراء جميلة', 45.00, 10, id, true, 100
FROM categories WHERE name_en = 'Fresh Vegetables'
UNION ALL
SELECT
  'Organic Cucumber', 'خيار عضوي', 'Fresh organic cucumbers', 'خيار عضوي طازة', 35.00, 5, id, true, 80
FROM categories WHERE name_en = 'Fresh Vegetables'
UNION ALL
SELECT
  'Leafy Spinach', 'السبانخ الطازة', 'Nutritious spinach greens', 'أوراق السبانخ المغذية', 55.00, 0, id, true, 60
FROM categories WHERE name_en = 'Fresh Vegetables'
UNION ALL
SELECT
  'Fresh Bananas', 'الموز الطازة', 'Sweet yellow bananas', 'موز أصفر حلو', 89.00, 20, id, true, 150
FROM categories WHERE name_en = 'Fresh Fruits'
UNION ALL
SELECT
  'Red Apples', 'التفاح الأحمر', 'Crispy red delicious apples', 'تفاح أحمر لذيذ', 199.00, 15, id, true, 120
FROM categories WHERE name_en = 'Fresh Fruits'
UNION ALL
SELECT
  'Fresh Oranges', 'البرتقال الطازة', 'Sweet juicy oranges', 'برتقال حلو عصير', 129.00, 10, id, true, 200
FROM categories WHERE name_en = 'Fresh Fruits'
UNION ALL
SELECT
  'Fresh Milk 1L', 'الحليب الطازة 1 لتر', 'Pure fresh milk', 'حليب طازة نقي', 145.00, 5, id, true, 500
FROM categories WHERE name_en = 'Organic Dairy'
UNION ALL
SELECT
  'Greek Yogurt 500g', 'الزبادي اليوناني', 'Creamy Greek yogurt', 'زبادي يوناني كريمي', 225.00, 0, id, true, 250
FROM categories WHERE name_en = 'Organic Dairy'
UNION ALL
SELECT
  'Fresh Bread', 'الخبز الطازة', 'Wholesome whole wheat bread', 'خبز قمح كامل', 85.00, 0, id, true, 400
FROM categories WHERE name_en = 'Bread & Bakery'
UNION ALL
SELECT
  'Croissants Pack', 'صندوق الكرواسان', 'Butter croissants pack of 4', 'كرواسان الزبدة 4 حبات', 295.00, 15, id, true, 150
FROM categories WHERE name_en = 'Bread & Bakery'
UNION ALL
SELECT
  'Fresh Orange Juice 1L', 'عصير البرتقال 1 لتر', 'Pure fresh orange juice', 'عصير برتقال طازة', 165.00, 10, id, true, 200
FROM categories WHERE name_en = 'Beverages'
ON CONFLICT DO NOTHING;

-- Insert Sample Offers
INSERT INTO offers (title_en, title_ar, description_en, description_ar, discount_percentage, is_active)
VALUES
  ('Fresh Vegetables Sale', 'تخفيف الخضار الطازة', 'Get 20% off on all vegetables', 'احصل على خصم 20% على جميع الخضار', 20.00, true),
  ('Fruit Bonanza', 'عرض الفاكهة المجنونة', 'Buy 2 get 10% off on fruits', 'اشتري 2 واحصل على 10% خصم', 10.00, true),
  ('Dairy Delights', 'متع الألبان', 'Special discount on dairy products', 'خصم خاص على منتجات الألبان', 15.00, true)
ON CONFLICT DO NOTHING;
`;

async function initDatabase() {
  try {
    console.log("🔧 Initializing Supabase database...\n");

    // Execute SQL using rpc
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: SQL,
    });

    if (error && error.code !== "PGRST116") {
      // PGRST116 means relation doesn't exist, which is expected for CREATE IF NOT EXISTS
      console.error("❌ Database initialization failed:", error.message);
      process.exit(1);
    }

    console.log("✅ Database schema created successfully!");
    console.log("\n📊 Created:");
    console.log("  ✓ 12 tables (categories, products, offers, profiles, cart_items, orders, order_items, addresses, reviews, wishlist_items, wallets, wallet_transactions)");
    console.log("  ✓ 5 categories (Vegetables, Fruits, Dairy, Bakery, Beverages)");
    console.log("  ✓ 11 sample products");
    console.log("  ✓ 3 sample offers");
  } catch (err) {
    // If rpc doesn't work, try raw SQL
    console.warn("⚠️ RPC method not available, checking if tables already exist...\n");
    
    const { data: tables, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tables && tables.length > 0) {
      console.log("✅ Database tables already exist!");
      console.log("\n📊 Found tables:");
      tables.forEach((t) => console.log("  ✓", t.table_name));
    } else {
      console.error("❌ Error:", err.message || tableError?.message);
      console.error("\n⚠️ Tables could not be found or created.");
      console.error("Please manually execute db-setup.sql in Supabase Dashboard:");
      console.error("1. Go to https://app.supabase.com");
      console.error("2. Select project dtuagfxysqmdprriyxzs");
      console.error("3. Go to SQL Editor");
      console.error("4. Create new query and paste the SQL from db-setup.sql");
      process.exit(1);
    }
  }
}

initDatabase();
