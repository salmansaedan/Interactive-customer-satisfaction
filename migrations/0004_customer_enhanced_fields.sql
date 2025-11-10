-- إضافة الحقول الموسعة لجدول العملاء
-- التاريخ: 2025-11-10
-- الوصف: إضافة حقول الاسم التفصيلي، وسائل التواصل، الموقع، والتخصص

-- إضافة حقول الاسم التفصيلي
ALTER TABLE customers ADD COLUMN first_name TEXT;
ALTER TABLE customers ADD COLUMN middle_name TEXT;
ALTER TABLE customers ADD COLUMN last_name TEXT;

-- إضافة وسيلة التواصل (واتساب أو رسائل نصية)
ALTER TABLE customers ADD COLUMN communication_method TEXT DEFAULT 'whatsapp';
-- القيم المسموحة: 'whatsapp', 'sms'

-- إضافة حقول الموقع
ALTER TABLE customers ADD COLUMN region TEXT;
ALTER TABLE customers ADD COLUMN city TEXT;

-- إضافة التخصص
ALTER TABLE customers ADD COLUMN specialization TEXT;
-- القيم المسموحة: 'بيع', 'شراء', 'استثمار', 'تطوير', 'تمويل', 'أخبار', 'مناسبات وأحداث'

-- إضافة حقل employee_id إذا لم يكن موجودًا (للربط مع الموظفين)
-- تم التعامل معه في migration 0003

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_customers_region ON customers(region);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_specialization ON customers(specialization);
CREATE INDEX IF NOT EXISTS idx_customers_communication ON customers(communication_method);

-- تحديث البيانات الموجودة: نسخ الاسم الكامل إلى first_name
UPDATE customers
SET first_name = name
WHERE first_name IS NULL;
