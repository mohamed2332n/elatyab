#!/usr/bin/env python3
"""
سكريبت لتحميل الصور إلى المنتجات في Supabase
Script to upload images to products in Supabase
"""

import json
import os
import sys
from pathlib import Path

# إضافة المسار للوحدات
sys.path.insert(0, str(Path(__file__).parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ طلب التثبيت: pip install supabase")
    print("❌ Install required: pip install supabase")
    sys.exit(1)


def load_env():
    """تحميل متغيرات البيئة من .env.local"""
    env_path = Path(__file__).parent / ".env.local"
    env_vars = {}
    
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    
    return env_vars


def update_products_images():
    """تحديث صور المنتجات في Supabase"""
    
    # تحميل البيانات
    env = load_env()
    supabase_url = env.get("VITE_SUPABASE_URL")
    supabase_key = env.get("VITE_SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ خطأ: لم يتم العثور على بيانات Supabase في .env.local")
        print("❌ Error: Supabase credentials not found in .env.local")
        return False
    
    # إنشاء اتصال Supabase
    supabase = create_client(supabase_url, supabase_key)
    
    # قراءة بيانات الصور
    products_file = Path(__file__).parent / "products-with-images.json"
    
    if not products_file.exists():
        print(f"❌ لم يتم العثور على الملف: {products_file}")
        return False
    
    with open(products_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("🔧 تحديث الصور في Supabase...\n")
    
    # تحديث الفئات
    print("📂 تحديث صور الفئات...")
    for category in data.get("categories", []):
        try:
            response = supabase.table("categories").update({
                "image_url": category["image_url"]
            }).eq("name_en", category["name_en"]).execute()
            print(f"  ✅ {category['name_en']}")
        except Exception as e:
            print(f"  ❌ {category['name_en']}: {str(e)}")
    
    # تحديث المنتجات
    print("\n📦 تحديث صور المنتجات...")
    for product in data.get("products", []):
        try:
            response = supabase.table("products").update({
                "image_url": product["image_url"]
            }).eq("name_en", product["name_en"]).execute()
            print(f"  ✅ {product['name_en']}")
        except Exception as e:
            print(f"  ❌ {product['name_en']}: {str(e)}")
    
    # تحديث العروضات
    print("\n🎁 تحديث صور العروضات...")
    for offer in data.get("offers", []):
        try:
            response = supabase.table("offers").update({
                "image_url": offer["image_url"]
            }).eq("title_en", offer["title_en"]).execute()
            print(f"  ✅ {offer['title_en']}")
        except Exception as e:
            print(f"  ❌ {offer['title_en']}: {str(e)}")
    
    print("\n✅ تم تحديث جميع الصور بنجاح!")
    print("✅ All images updated successfully!")
    return True


if __name__ == "__main__":
    success = update_products_images()
    sys.exit(0 if success else 1)
