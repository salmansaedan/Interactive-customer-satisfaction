-- ملف الهجرة الأولى لتطبيق عميلي أولاً
-- إنشاء جميع الجداول المطلوبة لوحدة قياس الرضا والإرضاء

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE, -- البريد الإلكتروني اختياري
    phone TEXT,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at DATETIME,
    health_score REAL DEFAULT 5.0,
    health_status TEXT DEFAULT 'healthy' -- healthy, needs_attention, at_risk
);

-- جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول التذاكر
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    customer_id INTEGER NOT NULL,
    assigned_to INTEGER, -- employee_id
    status TEXT DEFAULT 'new', -- new, in_progress, waiting_customer, resolved, closed
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    closed_at DATETIME,
    customer_confirmed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- جدول ملاحظات التذاكر
CREATE TABLE IF NOT EXISTS ticket_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- جدول استطلاعات الرضا
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    survey_token TEXT UNIQUE NOT NULL, -- للوصول الآمن للاستطلاع
    rating INTEGER, -- 1=حزين, 2=محايد, 3=سعيد
    comment TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول قاعدة المعرفة للحلول
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    problem_keywords TEXT, -- للبحث الذكي
    solution TEXT NOT NULL,
    category TEXT,
    usage_count INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES employees(id)
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(health_status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_notes_ticket_id ON ticket_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_surveys_token ON satisfaction_surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_surveys_ticket_id ON satisfaction_surveys(ticket_id);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON knowledge_base(problem_keywords);