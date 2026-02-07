#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Supabase credentials from the client file
function loadSupabaseCredentials() {
  const clientPath = path.join(__dirname, "src/integrations/supabase/client.ts");
  const content = fs.readFileSync(clientPath, "utf-8");
  
  const urlMatch = content.match(/const SUPABASE_URL = "(.*?)";/);
  const keyMatch = content.match(/const SUPABASE_PUBLISHABLE_KEY = "(.*?)";/);

  if (!urlMatch || !keyMatch) {
    throw new Error("Could not find SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in src/integrations/supabase/client.ts");
  }

  return {
    url: urlMatch[1],
    key: keyMatch[1]
  };
}

async function uploadImages() {
  try {
    const { url: supabaseUrl, key: supabaseKey } = loadSupabaseCredentials();

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

    // Update offers (assuming an 'offers' table exists with 'title_en')
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
    console.log("🔄 Please run 'npm run rebuild' or 'npm run restart' to ensure the app fetches the new data.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

uploadImages();