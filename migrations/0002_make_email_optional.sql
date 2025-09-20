-- تحديث جدول العملاء لجعل البريد الإلكتروني اختياري
-- إزالة قيد NOT NULL من عمود email

-- في SQLite، لا يمكن تعديل العمود مباشرة، لذا سنستخدم طريقة أخرى
-- نقوم بإنشاء جدول جديد، نقل البيانات، حذف القديم، إعادة تسمية

-- إنشاء جدول مؤقت بالبنية الجديدة
CREATE TABLE customers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE, -- البريد الإلكتروني اختياري الآن
    phone TEXT,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at DATETIME,
    health_score REAL DEFAULT 5.0,
    health_status TEXT DEFAULT 'healthy'
);

-- نسخ البيانات من الجدول القديم للجديد
INSERT INTO customers_new (id, name, email, phone, company, created_at, updated_at, last_interaction_at, health_score, health_status)
SELECT id, name, email, phone, company, created_at, updated_at, last_interaction_at, health_score, health_status
FROM customers;

-- حذف الجدول القديم
DROP TABLE customers;

-- إعادة تسمية الجدول الجديد
ALTER TABLE customers_new RENAME TO customers;

-- إعادة إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(health_status);