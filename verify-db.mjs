import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://dtuagfxysqmdprriyxzs.supabase.co", "sb_publishable_LXbf3vmX31BmVFPCRFLotw_sAXk1pc2");

const { data, error } = await supabase.from("categories").select("*");
if (error) console.error("Error:", error.message);
else {
  console.log("✅ Categories: " + data.length);
  data.forEach(c => console.log("  •", c.name_en));
}

const { data: prods } = await supabase.from("products").select("id,name_en,price").limit(5);
console.log("\n✅ Products: " + (prods?.length || 0));
prods?.forEach(p => console.log("  •", p.name_en, "-", p.price + " EGP"));
