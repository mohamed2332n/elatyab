#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  const env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
  }

  return env;
}

async function uploadImages() {
  try {
    const env = loadEnv();
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Error: Supabase credentials not found in .env.local");
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read products data
    const dataPath = path.join(__dirname, "products-with-images.json");
    if (!fs.existsSync(dataPath)) {
      console.error(`❌ File not found: ${dataPath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    console.log("🔧 Uploading images to Supabase...\n");

    // Update categories
    console.log("📂 Updating category images...");
    for (const category of data.categories) {
      try {
        const { error } = await supabase
          .from("categories")
          .update({ image_url: category.image_url })
          .eq("name_en", category.name_en);

        if (error) {
          console.log(`  ⚠️ ${category.name_en}: ${error.message}`);
        } else {
          console.log(`  ✅ ${category.name_en}`);
        }
      } catch (e) {
        console.log(`  ❌ ${category.name_en}: ${e.message}`);
      }
    }

    // Update products
    console.log("\n📦 Updating product images...");
    for (const product of data.products) {
      try {
        const { error } = await supabase
          .from("products")
          .update({ image_url: product.image_url })
          .eq("name_en", product.name_en);

        if (error) {
          console.log(`  ⚠️ ${product.name_en}: ${error.message}`);
        } else {
          console.log(`  ✅ ${product.name_en}`);
        }
      } catch (e) {
        console.log(`  ❌ ${product.name_en}: ${e.message}`);
      }
    }

    // Update offers
    console.log("\n🎁 Updating offer images...");
    for (const offer of data.offers) {
      try {
        const { error } = await supabase
          .from("offers")
          .update({ image_url: offer.image_url })
          .eq("title_en", offer.title_en);

        if (error) {
          console.log(`  ⚠️ ${offer.title_en}: ${error.message}`);
        } else {
          console.log(`  ✅ ${offer.title_en}`);
        }
      } catch (e) {
        console.log(`  ❌ ${offer.title_en}: ${e.message}`);
      }
    }

    console.log("\n✅ All images updated successfully!");
    console.log("🔄 Refresh your browser to see the changes.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

uploadImages();
