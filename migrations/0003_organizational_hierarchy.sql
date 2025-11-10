-- إنشاء جداول الهيكل التنظيمي
-- Organizational Hierarchy Migration

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

-- تحديث جدول الموظفين الموجود
-- Update existing employees table
ALTER TABLE employees ADD COLUMN phone TEXT;
ALTER TABLE employees ADD COLUMN level2_manager_id INTEGER REFERENCES level2_managers(id);
ALTER TABLE employees ADD COLUMN is_active BOOLEAN DEFAULT 1;

-- تحديث جدول العملاء لربطه بالموظف المسؤول
-- Update customers table to link with responsible employee
ALTER TABLE customers ADD COLUMN employee_id INTEGER REFERENCES employees(id);

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
CREATE INDEX IF NOT EXISTS idx_customers_employee ON customers(employee_id);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_type ON capacity_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_resolved ON capacity_alerts(is_resolved);

-- إدراج بيانات تجريبية للهيكل التنظيمي
-- Insert sample organizational data

-- مدير المستوى الأول
INSERT OR IGNORE INTO level1_managers (id, name, email, phone) VALUES 
(1, 'سلمان سعدان', 'info@salmansaedan.com', '0533361154');

-- مديرين المستوى الثاني (7 مديرين تحت المدير الأول)
INSERT OR IGNORE INTO level2_managers (id, name, email, phone, level1_manager_id) VALUES 
(1, 'أحمد محمد', 'ahmed.mohammed@company.com', '0501234567', 1),
(2, 'فاطمة علي', 'fatima.ali@company.com', '0509876543', 1),
(3, 'محمد خالد', 'mohammed.khalid@company.com', '0502468135', 1),
(4, 'نورا عبدالله', 'nora.abdullah@company.com', '0505555555', 1),
(5, 'يوسف إبراهيم', 'youssef.ibrahim@company.com', '0507777777', 1),
(6, 'مريم حسن', 'mariam.hassan@company.com', '0508888888', 1),
(7, 'عبدالرحمن سالم', 'abdulrahman.salem@company.com', '0509999999', 1);

-- موظفين (7 موظفين تحت كل مدير مستوى ثاني)
INSERT OR IGNORE INTO employees (name, email, phone, level2_manager_id) VALUES 
-- موظفين تحت أحمد محمد
('علي أحمد', 'ali.ahmed@company.com', '0511111111', 1),
('سارة محمود', 'sara.mahmoud@company.com', '0512222222', 1),
('خالد عمر', 'khalid.omar@company.com', '0513333333', 1),
('هند سعد', 'hind.saad@company.com', '0514444444', 1),
('عمر فيصل', 'omar.faisal@company.com', '0515555555', 1),
('ليلى قاسم', 'laila.qasim@company.com', '0516666666', 1),
('تامر وليد', 'tamer.walid@company.com', '0517777777', 1),

-- موظفين تحت فاطمة علي
('رانيا عادل', 'rania.adel@company.com', '0518888888', 2),
('محمود رشيد', 'mahmoud.rashid@company.com', '0519999999', 2),
('دينا كريم', 'dina.karim@company.com', '0521111111', 2),
('أسامة نبيل', 'osama.nabil@company.com', '0522222222', 2),
('نادية عصام', 'nadia.essam@company.com', '0523333333', 2),
('حسام طارق', 'hussam.tarek@company.com', '0524444444', 2),
('سمر باسل', 'samar.basel@company.com', '0525555555', 2),

-- موظفين تحت محمد خالد
('ياسر مراد', 'yasser.murad@company.com', '0526666666', 3),
('إيمان زياد', 'iman.ziad@company.com', '0527777777', 3),
('بسام جمال', 'bassam.jamal@company.com', '0528888888', 3),
('رغد صلاح', 'raghad.salah@company.com', '0529999999', 3),
('كريم وائل', 'karim.wael@company.com', '0531111111', 3),
('هالة فهد', 'hala.fahd@company.com', '0532222222', 3),
('عادل شريف', 'adel.sherif@company.com', '0533333333', 3),

-- موظفين تحت نورا عبدالله
('لينا عماد', 'lina.emad@company.com', '0534444444', 4),
('فراس منير', 'firas.munir@company.com', '0535555555', 4),
('ضحى رامي', 'doha.rami@company.com', '0536666666', 4),
('معاذ سليم', 'muath.saleem@company.com', '0537777777', 4),
('شيماء يزن', 'shaima.yazan@company.com', '0538888888', 4),
('وليد حاتم', 'walid.hatem@company.com', '0539999999', 4),
('غادة أنور', 'ghada.anwar@company.com', '0541111111', 4),

-- موظفين تحت يوسف إبراهيم
('مها جعفر', 'maha.jaafar@company.com', '0542222222', 5),
('طلال عامر', 'talal.amer@company.com', '0543333333', 5),
('رولا ماهر', 'rola.maher@company.com', '0544444444', 5),
('نبيل صادق', 'nabil.sadiq@company.com', '0545555555', 5),
('سلوى باسم', 'salwa.basem@company.com', '0546666666', 5),
('عدنان قيس', 'adnan.qais@company.com', '0547777777', 5),
('ريم طاهر', 'reem.taher@company.com', '0548888888', 5),

-- موظفين تحت مريم حسن
('زين عدي', 'zain.adi@company.com', '0549999999', 6),
('جود فادي', 'jood.fadi@company.com', '0551111111', 6),
('بدر حكيم', 'badr.hakeem@company.com', '0552222222', 6),
('نغم سامي', 'nagham.sami@company.com', '0553333333', 6),
('عزام عاصم', 'azzam.asem@company.com', '0554444444', 6),
('رؤى حسين', 'ruaa.hussein@company.com', '0555555555', 6),
('جابر نايف', 'jaber.naif@company.com', '0556666666', 6),

-- موظفين تحت عبدالرحمن سالم
('لؤي راكان', 'louay.rakan@company.com', '0557777777', 7),
('ميس عبيد', 'mais.obaid@company.com', '0558888888', 7),
('صهيب حازم', 'sohaib.hazem@company.com', '0559999999', 7),
('رهف عدنان', 'rahaf.adnan@company.com', '0561111111', 7),
('حمزة شاهين', 'hamza.shahin@company.com', '0562222222', 7),
('دانا سهيل', 'dana.suhail@company.com', '0563333333', 7),
('فهد نواف', 'fahad.nawaf@company.com', '0564444444', 7);