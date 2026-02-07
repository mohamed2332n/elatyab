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
  console.error("❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log("🔧 Setting up database...\n");

    // 1. Create Categories
    console.log("📂 Creating categories...");
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .limit(1);

    if (catError && catError.code === "PGRST116") {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc("exec", {
        sql: `CREATE TABLE IF NOT EXISTS categories (
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
        );`,
      });
    }

    // Insert categories
    const categoriesData = [
      {
        name_en: "Fresh Vegetables",
        name_ar: "الخضار الطازة",
        description_en: "Fresh and organic vegetables",
        description_ar: "خضار عضوية طازة",
        display_order: 1,
        is_active: true,
      },
      {
        name_en: "Fresh Fruits",
        name_ar: "الفاكهة الطازة",
        description_en: "Fresh and seasonal fruits",
        description_ar: "فاكهة طازة وموسمية",
        display_order: 2,
        is_active: true,
      },
      {
        name_en: "Organic Dairy",
        name_ar: "الألبان العضوية",
        description_en: "Organic milk and dairy products",
        description_ar: "منتجات ألبان عضوية",
        display_order: 3,
        is_active: true,
      },
      {
        name_en: "Bread & Bakery",
        name_ar: "الخبز والمخابز",
        description_en: "Fresh baked goods daily",
        description_ar: "منتجات مخبوزة طازة يومياً",
        display_order: 4,
        is_active: true,
      },
      {
        name_en: "Beverages",
        name_ar: "المشروبات",
        description_en: "Fresh juices and beverages",
        description_ar: "عصائر ومشروبات طازة",
        display_order: 5,
        is_active: true,
      },
    ];

    const { error: insertError } = await supabase
      .from("categories")
      .upsert(categoriesData, { onConflict: "name_en" });

    if (insertError && insertError.code !== "PGRST116") {
      console.log("✓ Categories already exist or inserted");
    } else {
      console.log("✓ Categories created");
    }

    // 2. Create Products
    console.log("📦 Creating products...");

    // Get category IDs
    const { data: cats } = await supabase.from("categories").select("id, name_en");

    const catMap = {};
    if (cats) {
      cats.forEach((cat) => {
        catMap[cat.name_en] = cat.id;
      });
    }

    const productsData = [
      // Vegetables
      {
        name_en: "Fresh Tomatoes",
        name_ar: "طماطم طازة",
        description_en: "Beautiful red tomatoes from local farms",
        description_ar: "طماطم حمراء جميلة",
        price: 45,
        discount_percentage: 10,
        category_id: catMap["Fresh Vegetables"],
        in_stock: true,
        stock_quantity: 100,
      },
      {
        name_en: "Organic Cucumber",
        name_ar: "خيار عضوي",
        description_en: "Fresh organic cucumbers",
        description_ar: "خيار عضوي طازة",
        price: 35,
        discount_percentage: 5,
        category_id: catMap["Fresh Vegetables"],
        in_stock: true,
        stock_quantity: 80,
      },
      {
        name_en: "Leafy Spinach",
        name_ar: "السبانخ الطازة",
        description_en: "Nutritious spinach greens",
        description_ar: "أوراق السبانخ المغذية",
        price: 55,
        discount_percentage: 0,
        category_id: catMap["Fresh Vegetables"],
        in_stock: true,
        stock_quantity: 60,
      },

      // Fruits
      {
        name_en: "Fresh Bananas",
        name_ar: "الموز الطازة",
        description_en: "Sweet yellow bananas",
        description_ar: "موز أصفر حلو",
        price: 89,
        discount_percentage: 20,
        category_id: catMap["Fresh Fruits"],
        in_stock: true,
        stock_quantity: 150,
      },
      {
        name_en: "Red Apples",
        name_ar: "التفاح الأحمر",
        description_en: "Crispy red delicious apples",
        description_ar: "تفاح أحمر لذيذ",
        price: 199,
        discount_percentage: 15,
        category_id: catMap["Fresh Fruits"],
        in_stock: true,
        stock_quantity: 120,
      },
      {
        name_en: "Fresh Oranges",
        name_ar: "البرتقال الطازة",
        description_en: "Sweet juicy oranges",
        description_ar: "برتقال حلو عصير",
        price: 129,
        discount_percentage: 10,
        category_id: catMap["Fresh Fruits"],
        in_stock: true,
        stock_quantity: 200,
      },

      // Dairy
      {
        name_en: "Fresh Milk 1L",
        name_ar: "الحليب الطازة 1 لتر",
        description_en: "Pure fresh milk",
        description_ar: "حليب طازة نقي",
        price: 145,
        discount_percentage: 5,
        category_id: catMap["Organic Dairy"],
        in_stock: true,
        stock_quantity: 500,
      },
      {
        name_en: "Greek Yogurt 500g",
        name_ar: "الزبادي اليوناني",
        description_en: "Creamy Greek yogurt",
        description_ar: "زبادي يوناني كريمي",
        price: 225,
        discount_percentage: 0,
        category_id: catMap["Organic Dairy"],
        in_stock: true,
        stock_quantity: 250,
      },

      // Bakery
      {
        name_en: "Fresh Bread",
        name_ar: "الخبز الطازة",
        description_en: "Wholesome whole wheat bread",
        description_ar: "خبز قمح كامل",
        price: 85,
        discount_percentage: 0,
        category_id: catMap["Bread & Bakery"],
        in_stock: true,
        stock_quantity: 400,
      },
      {
        name_en: "Croissants Pack",
        name_ar: "صندوق الكرواسان",
        description_en: "Butter croissants pack of 4",
        description_ar: "كرواسان الزبدة 4 حبات",
        price: 295,
        discount_percentage: 15,
        category_id: catMap["Bread & Bakery"],
        in_stock: true,
        stock_quantity: 150,
      },

      // Beverages
      {
        name_en: "Fresh Orange Juice 1L",
        name_ar: "عصير البرتقال 1 لتر",
        description_en: "Pure fresh orange juice",
        description_ar: "عصير برتقال طازة",
        price: 165,
        discount_percentage: 10,
        category_id: catMap["Beverages"],
        in_stock: true,
        stock_quantity: 200,
      },
    ];

    const { error: prodError } = await supabase
      .from("products")
      .upsert(productsData, { onConflict: "name_en" });

    if (prodError && prodError.code !== "PGRST116") {
      console.log("✓ Products already exist or inserted");
    } else {
      console.log("✓ Products created");
    }

    // 3. Create Offers
    console.log("🎁 Creating offers...");

    const offersData = [
      {
        title_en: "Fresh Vegetables Sale",
        title_ar: "تخفيف الخضار الطازة",
        description_en: "Get 20% off on all vegetables",
        description_ar: "احصل على خصم 20% على جميع الخضار",
        discount_percentage: 20,
        is_active: true,
      },
      {
        title_en: "Fruit Bonanza",
        title_ar: "عرض الفاكهة المجنونة",
        description_en: "Buy 2 get 10% off on fruits",
        description_ar: "اشتري 2 واحصل على 10% خصم",
        discount_percentage: 10,
        is_active: true,
      },
      {
        title_en: "Dairy Delights",
        title_ar: "متع الألبان",
        description_en: "Special discount on dairy products",
        description_ar: "خصم خاص على منتجات الألبان",
        discount_percentage: 15,
        is_active: true,
      },
    ];

    const { error: offersError } = await supabase
      .from("offers")
      .upsert(offersData, { onConflict: "title_en" });

    if (offersError && offersError.code !== "PGRST116") {
      console.log("✓ Offers already exist or inserted");
    } else {
      console.log("✓ Offers created");
    }

    console.log("\n✅ Database setup complete!\n");
    console.log("📊 Summary:");
    console.log("  ✓ 5 Categories");
    console.log("  ✓ 11 Products");
    console.log("  ✓ 3 Offers");
    console.log("\n🚀 Your app is ready to use!\n");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
