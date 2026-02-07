-- ============================================
-- SEED DATA FOR ELATYAB
-- ============================================

-- ============================================
-- INSERT CATEGORIES
-- ============================================
INSERT INTO public.categories (name_en, name_ar, icon, color, display_order, is_active) 
VALUES
  ('Deal Of The Day', 'عرض اليوم', '🔥', '#FF6B6B', 1, true),
  ('Fruits', 'فواكه', '🍎', '#FF8B94', 2, true),
  ('Fresh Vegetables', 'خضروات طازجة', '🥬', '#4CAF50', 3, true),
  ('Snacks', 'وجبات خفيفة', '🍿', '#FFA726', 4, true),
  ('Dates', 'تمور', '🫒', '#8D6E63', 5, true),
  ('Grapes', 'عنب', '🍇', '#9C27B0', 6, true),
  ('Winter Special', 'خاص بالشتاء', '❄️', '#42A5F5', 7, true),
  ('Nuts & Seeds', 'مكسرات وبذور', '🥜', '#D4A574', 8, true),
  ('Breakfast Products', 'منتجات الإفطار', '🥞', '#FFB74D', 9, true),
  ('Imported Fruits', 'فواكه مستوردة', '✈️', '#26C6DA', 10, true),
  ('Organic', 'عضوي', '🌿', '#66BB6A', 11, true),
  ('Citrus Fruits', 'حمضيات', '🍊', '#FF9800', 12, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT PRODUCTS
-- ============================================

-- Fruits
INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Strawberry', 'فراولة', 'Fresh sweet strawberries', 'فراولة طازجة حلوة',
  60, 130, 54, '500', 'gm', 50,
  true, ARRAY['https://images.unsplash.com/photo-1464965911861-746a04b4bca6'], 4.5, true
FROM public.categories WHERE name_en = 'Fruits'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Green Apple', 'تفاح أخضر', 'Crispy green apples', 'تفاح أخضر مقرمش',
  70, null, 0, '1', 'kg', 100,
  true, ARRAY['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'], 4.8, true
FROM public.categories WHERE name_en = 'Fruits'
ON CONFLICT DO NOTHING;

-- Vegetables
INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Spinach (Palak)', 'سبانخ (بالاك)', 'Fresh green spinach', 'سبانخ خضراء طازجة',
  7, 12, 41, '820-920', 'gm', 80,
  true, ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb'], 4.3, true
FROM public.categories WHERE name_en = 'Fresh Vegetables'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Baby Spinach', 'سبانخ صغيرة', 'Tender baby spinach leaves', 'أوراق سبانخ صغيرة طرية',
  11, 12, 11, '200', 'gm', 60,
  true, ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb'], 4.6, true
FROM public.categories WHERE name_en = 'Fresh Vegetables'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Tomato Hybrid', 'طماطم هجينة', 'Fresh hybrid tomatoes', 'طماطم هجينة طازجة',
  8, null, 0, '500', 'gm', 120,
  true, ARRAY['https://images.unsplash.com/photo-1546094096-0df4bcaaa337'], 4.4, true
FROM public.categories WHERE name_en = 'Fresh Vegetables'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Cucumber Seedless', 'خيار بدون بذور', 'Fresh seedless cucumbers', 'خيار طازج بدون بذور',
  13, null, 0, '500', 'gm', 70,
  true, ARRAY['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3'], 4.7, true
FROM public.categories WHERE name_en = 'Fresh Vegetables'
ON CONFLICT DO NOTHING;

-- Imported Fruits
INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Italian Apple', 'تفاح إيطالي', 'Premium imported Italian apples', 'تفاح إيطالي بريميوم',
  95, null, 0, '1', 'kg', 30,
  true, ARRAY['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb'], 4.9, true
FROM public.categories WHERE name_en = 'Imported Fruits'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'OZBLU Blueberry', 'توت أزرق أوزبلو', 'Premium blueberries', 'توت أزرق بريميوم',
  130, null, 0, '200', 'gm', 15,
  true, ARRAY['https://images.unsplash.com/photo-1498557850523-fd3d118b962e'], 5.0, true
FROM public.categories WHERE name_en = 'Imported Fruits'
ON CONFLICT DO NOTHING;

-- Dates
INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Medjool Dates Premium', 'تمر المجدول بريميوم', 'Premium medjool dates', 'تمر المجدول بريميوم',
  120, null, 0, '500', 'gm', 40,
  true, ARRAY['https://images.unsplash.com/photo-1578663899664-27b62f753fee'], 4.9, true
FROM public.categories WHERE name_en = 'Dates'
ON CONFLICT DO NOTHING;

-- Winter Special
INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Fresh Orange', 'برتقال طازج', 'Fresh orange', 'برتقال طازج',
  25, null, 0, '1', 'kg', 100,
  true, ARRAY['https://images.unsplash.com/photo-1547514701-42782101795e'], 4.6, true
FROM public.categories WHERE name_en = 'Winter Special'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Kinnow (Mandarin)', 'كينو (يوسفي)', 'Fresh mandarin', 'يوسفي طازج',
  20, null, 0, '1', 'kg', 90,
  true, ARRAY['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b'], 4.5, true
FROM public.categories WHERE name_en = 'Winter Special'
ON CONFLICT DO NOTHING;

-- Nuts & Seeds
INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Premium Almonds', 'لوز بريميوم', 'Premium almonds', 'لوز بريميوم',
  95, null, 0, '250', 'gm', 60,
  true, ARRAY['https://images.unsplash.com/photo-1508747703725-719777637510'], 4.8, true
FROM public.categories WHERE name_en = 'Nuts & Seeds'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (
  category_id, name_en, name_ar, description_en, description_ar, 
  price, old_price, discount_percent, weight, unit, stock_quantity, 
  is_in_stock, images, rating, is_active
) 
SELECT 
  id, 'Roasted Cashews', 'كاجو محمص', 'Roasted cashews', 'كاجو محمص',
  110, null, 0, '250', 'gm', 55,
  true, ARRAY['https://images.unsplash.com/photo-1585543805890-6051f7829f98'], 4.7, true
FROM public.categories WHERE name_en = 'Nuts & Seeds'
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT OFFERS
-- ============================================
INSERT INTO public.offers (title_en, title_ar, description_en, description_ar, type, valid_from, valid_till, is_active)
VALUES
  (
    'Fresh Vegetables Deal',
    'عرض الخضروات الطازجة',
    'Get fresh vegetables at unbeatable prices',
    'احصل على خضروات طازجة بأسعار لا تقبل المنافسة',
    'product_prices',
    NOW(),
    NOW() + INTERVAL '30 days',
    true
  ),
  (
    'Fruits Galore',
    'عرض الفواكة الرائع',
    'Premium imported fruits now available',
    'الفواكة المستوردة متاحة الآن',
    'announcement',
    NOW(),
    NOW() + INTERVAL '30 days',
    true
  ),
  (
    'Limited Time - Nuts Special',
    'عرض محدود - مكسرات خاصة',
    'Premium nuts at special prices - Limited time only!',
    'مكسرات بريميوم بأسعار خاصة - عرض محدود الوقت!',
    'call_to_action',
    NOW(),
    NOW() + INTERVAL '15 days',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SET SOME PRODUCTS AS FEATURED
-- ============================================
UPDATE public.products 
SET is_featured = true, updated_at = NOW()
WHERE name_en IN ('Strawberry', 'Premium Almonds', 'Fresh Orange', 'Medjool Dates Premium')
AND is_featured = false;
