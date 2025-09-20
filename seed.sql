-- بيانات تجريبية لتطبيق عميلي أولاً

-- إدراج موظفين تجريبيين
INSERT OR IGNORE INTO employees (id, name, email, department, role) VALUES 
  (1, 'أحمد محمد', 'ahmed@company.com', 'خدمة العملاء', 'مسؤول دعم فني'),
  (2, 'فاطمة علي', 'fatima@company.com', 'خدمة العملاء', 'مدير حسابات'),
  (3, 'محمد سالم', 'mohammed@company.com', 'الإدارة', 'مدير خدمة العملاء');

-- إدراج عملاء تجريبيين
INSERT OR IGNORE INTO customers (id, name, email, phone, company, last_interaction_at, health_score, health_status) VALUES 
  (1, 'سالم سعدان', 'info@salmansaedan.com', '0533361154', 'شركة سالم سعدان للتطوير العقاري', datetime('now', '-2 days'), 8.5, 'healthy'),
  (2, 'عبدالله أحمد', 'abdullah@example.com', '0501234567', 'شركة الخليج للاستثمار', datetime('now', '-5 days'), 6.2, 'needs_attention'),
  (3, 'نور محمد', 'noor@example.com', '0509876543', 'مؤسسة النور التجارية', datetime('now', '-15 days'), 3.8, 'at_risk'),
  (4, 'خالد العتيبي', 'khalid@example.com', '0512345678', 'شركة الرياض للتطوير', datetime('now', '-1 day'), 9.1, 'healthy');

-- إدراج تذاكر تجريبية
INSERT OR IGNORE INTO tickets (id, title, description, customer_id, assigned_to, status, priority, created_at, updated_at) VALUES 
  (1, 'تأخر في طلب رقم #12345', 'العميل يشكو من تأخر في تسليم طلبه المقرر تسليمه أمس', 1, 1, 'resolved', 'high', datetime('now', '-3 days'), datetime('now', '-1 day')),
  (2, 'مشكلة في الفاتورة', 'هناك خطأ في قيمة الفاتورة الشهرية', 2, 2, 'in_progress', 'medium', datetime('now', '-2 days'), datetime('now', '-1 day')),
  (3, 'طلب معلومات إضافية', 'العميل يحتاج معلومات حول الخدمات الجديدة', 4, 1, 'new', 'low', datetime('now', '-1 day'), datetime('now', '-1 day'));

-- إدراج ملاحظات على التذاكر
INSERT OR IGNORE INTO ticket_notes (ticket_id, employee_id, note, is_internal, created_at) VALUES 
  (1, 1, 'تم التواصل مع قسم الشحن، سيتم إرسال الطلب خلال 24 ساعة', FALSE, datetime('now', '-2 days')),
  (1, 1, 'تم تأكيد التسليم من العميل', FALSE, datetime('now', '-1 day')),
  (2, 2, 'مراجعة نظام الفوترة لإيجاد سبب الخطأ', TRUE, datetime('now', '-1 day'));

-- إدراج استطلاعات رضا تجريبية
INSERT OR IGNORE INTO satisfaction_surveys (id, ticket_id, customer_id, survey_token, rating, comment, sent_at, responded_at) VALUES 
  (1, 1, 1, 'survey_token_123456', 3, 'خدمة ممتازة، تم حل المشكلة بسرعة', datetime('now', '-1 day'), datetime('now', '-1 day')),
  (2, 2, 2, 'survey_token_789012', NULL, NULL, datetime('now', '-6 hours'), NULL);

-- إدراج قاعدة معرفة تجريبية
INSERT OR IGNORE INTO knowledge_base (title, problem_keywords, solution, category, usage_count, created_by) VALUES 
  ('حل مشكلة تأخر الطلبات', 'تأخر طلب شحن تسليم', 'التحقق من حالة الطلب في نظام الشحن والتواصل مع قسم اللوجستيات لتحديث موعد التسليم', 'الشحن والتوصيل', 5, 1),
  ('معالجة أخطاء الفواتير', 'فاتورة خطأ مبلغ قيمة', 'مراجعة تفاصيل الفاتورة في النظام والتحقق من صحة البيانات المدخلة', 'المحاسبة والفوترة', 3, 2),
  ('تقديم معلومات الخدمات الجديدة', 'خدمات جديدة معلومات', 'إرسال كتيب الخدمات الجديدة وجدولة مكالمة توضيحية مع العميل', 'المبيعات والتسويق', 2, 1);