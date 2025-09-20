-- إنشاء جداول الهيكل التنظيمي - مصحح
-- Organizational Hierarchy Migration - Fixed

-- جدول المديرين من المستوى الأول
-- Level 1 Managers Table
CREATE TABLE IF NOT EXISTS level1_managers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- جدول المديرين من المستوى الثاني
-- Level 2 Managers Table  
CREATE TABLE IF NOT EXISTS level2_managers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  level1_manager_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (level1_manager_id) REFERENCES level1_managers(id)
);

-- جدول الموظفين
-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  level2_manager_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (level2_manager_id) REFERENCES level2_managers(id)
);

-- جدول تنبيهات السعة
-- Capacity Alerts Table
CREATE TABLE IF NOT EXISTS capacity_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_type TEXT NOT NULL, -- 'needs_level2_manager', 'needs_employee', 'capacity_full'
  level1_manager_id INTEGER,
  level2_manager_id INTEGER,
  employee_id INTEGER,
  current_count INTEGER NOT NULL,
  capacity_limit INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (level1_manager_id) REFERENCES level1_managers(id),
  FOREIGN KEY (level2_manager_id) REFERENCES level2_managers(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- إنشاء الفهارس لتحسين الأداء
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_level2_managers_level1 ON level2_managers(level1_manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_level2 ON employees(level2_manager_id);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_type ON capacity_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_resolved ON capacity_alerts(is_resolved);