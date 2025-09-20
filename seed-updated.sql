-- بيانات محدثة تشمل عملاء مع وبدون بريد إلكتروني

-- إدراج موظفين تجريبيين
INSERT OR IGNORE INTO employees (id, name, email, department, role) VALUES 
  (1, 'أحمد محمد', 'ahmed@company.com', 'خدمة العملاء', 'مسؤول دعم فني'),
  (2, 'فاطمة علي', 'fatima@company.com', 'خدمة العملاء', 'مدير حسابات'),
  (3, 'محمد سالم', 'mohammed@company.com', 'الإدارة', 'مدير خدمة العملاء');

-- إدراج عملاء تجريبيين (مع وبدون بريد إلكتروني)
INSERT OR IGNORE INTO customers (id, name, email, phone, company, last_interaction_at, health_score, health_status) VALUES 
  -- عملاء لديهم بريد إلكتروني
  (1, 'سالم سعدان', 'info@salmansaedan.com', '0533361154', 'شركة سالم سعدان للتطوير العقاري', datetime('now', '-2 days'), 8.5, 'healthy'),
  (2, 'عبدالله أحمد', 'abdullah@example.com', '0501234567', 'شركة الخليج للاستثمار', datetime('now', '-5 days'), 6.2, 'needs_attention'),
  -- عملاء بدون بريد إلكتروني (يعتمدون على الهاتف فقط)
  (3, 'أبو خالد العتيبي', NULL, '0512345678', 'مؤسسة العتيبي التجارية', datetime('now', '-1 day'), 7.8, 'healthy'),
  (4, 'أم أحمد الزهراني', NULL, '0509876543', NULL, datetime('now', '-35 days'), 4.2, 'needs_attention'),
  (5, 'عثمان بن سعد', NULL, '0551122334', 'مكتب المحاماة المتخصص', datetime('now', '-90 days'), 2.1, 'at_risk');

-- إدراج تذاكر تجريبية
INSERT OR IGNORE INTO tickets (id, title, description, customer_id, assigned_to, status, priority, created_at, updated_at) VALUES 
  (1, 'تأخر في طلب رقم #12345', 'العميل يشكو من تأخر في تسليم طلبه المقرر تسليمه أمس', 1, 1, 'resolved', 'high', datetime('now', '-3 days'), datetime('now', '-1 day')),
  (2, 'مشكلة في الفاتورة', 'هناك خطأ في قيمة الفاتورة الشهرية', 2, 2, 'in_progress', 'medium', datetime('now', '-2 days'), datetime('now', '-1 day')),
  (3, 'استفسار هاتفي حول الخدمات', 'العميل اتصل يستفسر عن الخدمات الجديدة المتاحة', 3, 1, 'resolved', 'low', datetime('now', '-1 day'), datetime('now', '-1 day')),
  (4, 'شكوى حول التأخير', 'العميل غاضب من التأخير المتكرر في الخدمة', 4, 2, 'new', 'high', datetime('now', '-1 hour'), datetime('now', '-1 hour')),
  (5, 'طلب إلغاء الخدمة', 'العميل يريد إلغاء الخدمة نهائياً', 5, 3, 'waiting_customer', 'urgent', datetime('now', '-2 hours'), datetime('now', '-1 hour'));

-- إدراج ملاحظات على التذاكر
INSERT OR IGNORE INTO ticket_notes (ticket_id, employee_id, note, is_internal, created_at) VALUES 
  (1, 1, 'تم التواصل مع قسم الشحن، سيتم إرسال الطلب خلال 24 ساعة', FALSE, datetime('now', '-2 days')),
  (1, 1, 'تم تأكيد التسليم من العميل هاتفياً', FALSE, datetime('now', '-1 day')),
  (2, 2, 'مراجعة نظام الفوترة لإيجاد سبب الخطأ', TRUE, datetime('now', '-1 day')),
  (3, 1, 'تم توضيح جميع الخدمات المتاحة للعميل عبر الهاتف', FALSE, datetime('now', '-1 day')),
  (4, 2, 'العميلة تحتاج اهتمام عاجل - لم تتفاعل منذ شهر', TRUE, datetime('now', '-1 hour')),
  (5, 3, 'عميل في خطر فقدان - يحتاج تدخل من المدير', TRUE, datetime('now', '-1 hour'));

-- إدراج استطلاعات رضا (فقط للعملاء الذين لديهم بريد إلكتروني)
INSERT OR IGNORE INTO satisfaction_surveys (id, ticket_id, customer_id, survey_token, rating, comment, sent_at, responded_at) VALUES 
  (1, 1, 1, 'survey_token_123456', 3, 'خدمة ممتازة، تم حل المشكلة بسرعة', datetime('now', '-1 day'), datetime('now', '-1 day')),
  (2, 2, 2, 'survey_token_789012', NULL, NULL, datetime('now', '-6 hours'), NULL);

-- إدراج قاعدة معرفة تجريبية
INSERT OR IGNORE INTO knowledge_base (title, problem_keywords, solution, category, usage_count, created_by) VALUES 
  ('حل مشكلة تأخر الطلبات', 'تأخر طلب شحن تسليم', 'التحقق من حالة الطلب في نظام الشحن والتواصل مع قسم اللوجستيات لتحديث موعد التسليم', 'الشحن والتوصيل', 8, 1),
  ('معالجة أخطاء الفواتير', 'فاتورة خطأ مبلغ قيمة', 'مراجعة تفاصيل الفاتورة في النظام والتحقق من صحة البيانات المدخلة', 'المحاسبة والفوترة', 5, 2),
  ('التعامل مع العملاء بدون بريد إلكتروني', 'هاتف اتصال تواصل شفهي', 'التواصل المباشر عبر الهاتف، توثيق المحادثة في الملاحظات، إرسال رسائل نصية قصيرة', 'التواصل والمتابعة', 12, 1),
  ('إدارة العملاء في خطر الفقدان', 'إلغاء فقدان عميل رحيل', 'اتصال فوري من المدير، تقديم عروض خاصة، حل جميع المشاكل المعلقة، جدولة اجتماع شخصي', 'الاحتفاظ بالعملاء', 3, 3);