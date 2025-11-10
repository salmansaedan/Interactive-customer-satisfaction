import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { createEmailService } from './services/emailService'
import { createAlertService } from './services/alertService'
import CapacityService from './services/capacityService'

// تعريف أنواع البيانات لـ Cloudflare Bindings
type Bindings = {
  DB: D1Database;
  // متغيرات البيئة لخدمة البريد الإلكتروني
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  APP_URL?: string;
  APP_NAME?: string;
  COMPANY_NAME?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// تفعيل CORS للـ API routes
app.use('/api/*', cors())

// تقديم الملفات الثابتة من مجلد public
app.use('/static/*', serveStatic({ root: './public' }))

// الصفحة الرئيسية
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>عميلي أولاً - نظام إدارة العملاء</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <script>
          // إعداد Tailwind للعربية
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  arabic: ['Cairo', 'system-ui', 'sans-serif']
                }
              }
            }
          }
        </script>
        <style>
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        </style>
    </head>
    <body class="bg-gray-50 font-arabic">
        <!-- شريط التنقل العلوي -->
        <nav class="bg-blue-600 shadow-lg">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-users text-white text-2xl ml-3"></i>
                        <h1 class="text-white text-xl font-bold">عميلي أولاً</h1>
                    </div>
                    <div class="flex items-center space-x-4 space-x-reverse">
                        <button class="text-white hover:text-blue-200">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="text-white hover:text-blue-200">
                            <i class="fas fa-user-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto py-6 px-4">
            <!-- لوحة المعلومات الرئيسية -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- إجمالي العملاء -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100">
                            <i class="fas fa-users text-blue-600 text-xl"></i>
                        </div>
                        <div class="mr-4">
                            <h3 class="text-lg font-semibold text-gray-700">إجمالي العملاء</h3>
                            <p class="text-2xl font-bold text-gray-900" id="total-customers">0</p>
                        </div>
                    </div>
                </div>

                <!-- التذاكر المفتوحة -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100">
                            <i class="fas fa-ticket-alt text-yellow-600 text-xl"></i>
                        </div>
                        <div class="mr-4">
                            <h3 class="text-lg font-semibold text-gray-700">التذاكر المفتوحة</h3>
                            <p class="text-2xl font-bold text-gray-900" id="open-tickets">0</p>
                        </div>
                    </div>
                </div>

                <!-- متوسط الرضا -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100">
                            <i class="fas fa-smile text-green-600 text-xl"></i>
                        </div>
                        <div class="mr-4">
                            <h3 class="text-lg font-semibold text-gray-700">متوسط الرضا</h3>
                            <p class="text-2xl font-bold text-gray-900" id="avg-satisfaction">0%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- التبويبات الرئيسية -->
            <div class="bg-white rounded-lg shadow">
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8 space-x-reverse px-6">
                        <button class="tab-btn py-4 border-b-2 border-blue-500 text-blue-600 font-medium" data-tab="customers">
                            <i class="fas fa-users ml-2"></i>
                            العملاء
                        </button>
                        <button class="tab-btn py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="tickets">
                            <i class="fas fa-ticket-alt ml-2"></i>
                            التذاكر
                        </button>
                        <button class="tab-btn py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="surveys">
                            <i class="fas fa-chart-line ml-2"></i>
                            استطلاعات الرضا
                        </button>
                        <button class="tab-btn py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="knowledge">
                            <i class="fas fa-book ml-2"></i>
                            قاعدة المعرفة
                        </button>
                        <button class="tab-btn py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="organization">
                            <i class="fas fa-sitemap ml-2"></i>
                            الهيكل التنظيمي
                        </button>
                    </nav>
                </div>

                <!-- محتوى التبويبات -->
                <div class="p-6">
                    <!-- تبويب العملاء -->
                    <div id="customers-tab" class="tab-content">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">قائمة العملاء</h2>
                            <div class="flex space-x-2 space-x-reverse">
                                <button class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700" onclick="checkAlerts()">
                                    <i class="fas fa-bell ml-2"></i>
                                    فحص التنبيهات
                                </button>
                                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onclick="showImportCustomersModal()">
                                    <i class="fas fa-file-excel ml-2"></i>
                                    استيراد من Excel
                                </button>
                                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onclick="showCustomerModal()">
                                    <i class="fas fa-plus ml-2"></i>
                                    إضافة عميل جديد
                                </button>
                            </div>
                        </div>
                        <div id="customers-list" class="space-y-4">
                            <!-- سيتم تحميل قائمة العملاء هنا -->
                        </div>
                    </div>

                    <!-- تبويب التذاكر -->
                    <div id="tickets-tab" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">تذاكر الدعم</h2>
                            <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onclick="showTicketModal()">
                                <i class="fas fa-plus ml-2"></i>
                                إنشاء تذكرة جديدة
                            </button>
                        </div>
                        <div id="tickets-list" class="space-y-4">
                            <!-- سيتم تحميل قائمة التذاكر هنا -->
                        </div>
                    </div>

                    <!-- تبويب استطلاعات الرضا -->
                    <div id="surveys-tab" class="tab-content hidden">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">استطلاعات الرضا</h2>
                        <div id="surveys-list" class="space-y-4">
                            <!-- سيتم تحميل استطلاعات الرضا هنا -->
                        </div>
                    </div>

                    <!-- تبويب قاعدة المعرفة -->
                    <div id="knowledge-tab" class="tab-content hidden">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">قاعدة المعرفة</h2>
                        <div id="knowledge-list" class="space-y-4">
                            <!-- سيتم تحميل قاعدة المعرفة هنا -->
                        </div>
                    </div>

                    <!-- تبويب الهيكل التنظيمي -->
                    <div id="organization-tab" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-gray-800">إدارة الهيكل التنظيمي</h2>
                            <div class="flex space-x-2 space-x-reverse">
                                <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" onclick="checkCapacityAlerts()">
                                    <i class="fas fa-exclamation-triangle ml-2"></i>
                                    فحص السعة
                                </button>
                                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onclick="distributeCustomers()">
                                    <i class="fas fa-users ml-2"></i>
                                    توزيع العملاء
                                </button>
                            </div>
                        </div>

                        <!-- إحصائيات الهيكل التنظيمي -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div class="bg-blue-50 border-r-4 border-blue-400 p-4">
                                <div class="flex items-center">
                                    <i class="fas fa-user-tie text-blue-600 text-2xl ml-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-blue-900">مديرين المستوى الأول</p>
                                        <p class="text-2xl font-bold text-blue-800" id="level1-managers-count">0</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-green-50 border-r-4 border-green-400 p-4">
                                <div class="flex items-center">
                                    <i class="fas fa-users text-green-600 text-2xl ml-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-green-900">مديرين المستوى الثاني</p>
                                        <p class="text-2xl font-bold text-green-800" id="level2-managers-count">0</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-yellow-50 border-r-4 border-yellow-400 p-4">
                                <div class="flex items-center">
                                    <i class="fas fa-user text-yellow-600 text-2xl ml-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-yellow-900">الموظفين</p>
                                        <p class="text-2xl font-bold text-yellow-800" id="employees-count">0</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-purple-50 border-r-4 border-purple-400 p-4">
                                <div class="flex items-center">
                                    <i class="fas fa-handshake text-purple-600 text-2xl ml-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-purple-900">العملاء المربوطين</p>
                                        <p class="text-2xl font-bold text-purple-800" id="assigned-customers-count">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- التنبيهات النشطة -->
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <h3 class="text-lg font-semibold text-red-800 mb-3">
                                <i class="fas fa-bell ml-2"></i>
                                التنبيهات النشطة
                            </h3>
                            <div id="capacity-alerts" class="space-y-2">
                                <!-- سيتم تحميل التنبيهات هنا -->
                            </div>
                        </div>

                        <!-- التبويبات الفرعية -->
                        <div class="border-b border-gray-200 mb-4">
                            <nav class="flex space-x-4 space-x-reverse">
                                <button class="org-tab-btn py-2 px-4 border-b-2 border-blue-500 text-blue-600 font-medium" data-org-tab="overview">
                                    نظرة عامة
                                </button>
                                <button class="org-tab-btn py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-org-tab="employees">
                                    الموظفين
                                </button>
                                <button class="org-tab-btn py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-org-tab="managers">
                                    المديرين
                                </button>
                                <button class="org-tab-btn py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-org-tab="reports">
                                    التقارير
                                </button>
                            </nav>
                        </div>

                        <!-- النظرة العامة -->
                        <div id="overview-org-tab" class="org-tab-content">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- خريطة الهيكل التنظيمي -->
                                <div class="bg-white border rounded-lg p-4">
                                    <h4 class="font-semibold text-gray-800 mb-4">خريطة الهيكل التنظيمي</h4>
                                    <div id="org-chart" class="text-center">
                                        <!-- سيتم إنشاء الخريطة هنا -->
                                    </div>
                                </div>

                                <!-- إحصائيات مفصلة -->
                                <div class="bg-white border rounded-lg p-4">
                                    <h4 class="font-semibold text-gray-800 mb-4">إحصائيات مفصلة</h4>
                                    <div id="detailed-stats" class="space-y-3">
                                        <!-- سيتم تحميل الإحصائيات المفصلة هنا -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- قائمة الموظفين -->
                        <div id="employees-org-tab" class="org-tab-content hidden">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-semibold text-gray-800">قائمة الموظفين</h4>
                                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onclick="openAddEmployeeModal()">
                                    <i class="fas fa-plus ml-2"></i>
                                    إضافة موظف
                                </button>
                            </div>
                            <div id="employees-list" class="bg-white border rounded-lg overflow-hidden">
                                <!-- سيتم تحميل قائمة الموظفين هنا -->
                            </div>
                        </div>

                        <!-- قائمة المديرين -->
                        <div id="managers-org-tab" class="org-tab-content hidden">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-semibold text-gray-800">قائمة مديري المستوى الثاني</h4>
                                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onclick="openAddManagerModal()">
                                    <i class="fas fa-plus ml-2"></i>
                                    إضافة مدير
                                </button>
                            </div>
                            <div id="managers-list" class="bg-white border rounded-lg overflow-hidden">
                                <!-- سيتم تحميل قائمة المديرين هنا -->
                            </div>
                        </div>

                        <!-- التقارير -->
                        <div id="reports-org-tab" class="org-tab-content hidden">
                            <h4 class="font-semibold text-gray-800 mb-4">تقارير الأداء والسعة</h4>
                            <div id="capacity-reports" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- سيتم تحميل التقارير هنا -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script src="/static/modals.js"></script>
        <script src="/static/organization.js"></script>
    </body>
    </html>
  `)
})

// API Routes

// الحصول على إحصائيات عامة
app.get('/api/stats', async (c) => {
  try {
    const db = c.env.DB;
    
    // إجمالي العملاء
    const totalCustomers = await db.prepare('SELECT COUNT(*) as count FROM customers').first();
    
    // التذاكر المفتوحة
    const openTickets = await db.prepare(
      "SELECT COUNT(*) as count FROM tickets WHERE status IN ('new', 'in_progress', 'waiting_customer')"
    ).first();
    
    // متوسط الرضا
    const avgSatisfaction = await db.prepare(
      'SELECT AVG(rating) as avg FROM satisfaction_surveys WHERE rating IS NOT NULL'
    ).first();

    return c.json({
      totalCustomers: totalCustomers?.count || 0,
      openTickets: openTickets?.count || 0,
      avgSatisfaction: Math.round((avgSatisfaction?.avg || 0) * 33.33) // تحويل من 1-3 إلى نسبة مئوية
    });
  } catch (error) {
    return c.json({ error: 'خطأ في تحميل الإحصائيات' }, 500);
  }
});

// الحصول على قائمة العملاء
app.get('/api/customers', async (c) => {
  try {
    const db = c.env.DB;
    const customers = await db.prepare(`
      SELECT
        id, name, email, phone, company,
        first_name, middle_name, last_name,
        communication_method, region, city, specialization,
        employee_id,
        health_score, health_status,
        last_interaction_at, created_at
      FROM customers
      ORDER BY updated_at DESC
    `).all();

    return c.json(customers.results || []);
  } catch (error) {
    return c.json({ error: 'خطأ في تحميل العملاء' }, 500);
  }
});

// إنشاء عميل جديد
app.post('/api/customers', async (c) => {
  try {
    const db = c.env.DB;
    const {
      first_name, middle_name, last_name,
      email, phone,
      communication_method = 'whatsapp',
      region, city,
      specialization,
      employee_id,
      company
    } = await c.req.json();

    // بناء الاسم الكامل من الأجزاء
    const fullName = [first_name, middle_name, last_name].filter(Boolean).join(' ');

    const result = await db.prepare(`
      INSERT INTO customers (
        name, first_name, middle_name, last_name,
        email, phone,
        communication_method, region, city, specialization,
        employee_id, company,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      fullName, first_name, middle_name, last_name,
      email, phone,
      communication_method, region, city, specialization,
      employee_id, company
    ).run();

    return c.json({
      id: result.meta.last_row_id,
      first_name, middle_name, last_name,
      email, phone,
      communication_method, region, city, specialization,
      message: 'تم إضافة العميل بنجاح'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return c.json({ error: 'خطأ في إضافة العميل' }, 500);
  }
});

// الحصول على قائمة التذاكر
app.get('/api/tickets', async (c) => {
  try {
    const db = c.env.DB;
    const tickets = await db.prepare(`
      SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.created_at, t.updated_at,
        c.name as customer_name, c.email as customer_email,
        e.name as assigned_to_name
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN employees e ON t.assigned_to = e.id
      ORDER BY t.updated_at DESC
    `).all();

    return c.json(tickets.results || []);
  } catch (error) {
    return c.json({ error: 'خطأ في تحميل التذاكر' }, 500);
  }
});

// تحديث بيانات العميل
app.put('/api/customers/:customerId', async (c) => {
  try {
    const db = c.env.DB;
    const customerId = c.req.param('customerId');
    const {
      first_name, middle_name, last_name,
      email, phone,
      communication_method,
      region, city,
      specialization,
      employee_id,
      company
    } = await c.req.json();

    // بناء الاسم الكامل من الأجزاء
    const fullName = [first_name, middle_name, last_name].filter(Boolean).join(' ');

    await db.prepare(`
      UPDATE customers
      SET
        name = ?, first_name = ?, middle_name = ?, last_name = ?,
        email = ?, phone = ?,
        communication_method = ?, region = ?, city = ?, specialization = ?,
        employee_id = ?, company = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      fullName, first_name, middle_name, last_name,
      email, phone,
      communication_method, region, city, specialization,
      employee_id, company,
      customerId
    ).run();

    return c.json({
      id: customerId,
      first_name, middle_name, last_name,
      email, phone,
      communication_method, region, city, specialization,
      message: 'تم تحديث بيانات العميل بنجاح'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return c.json({ error: 'خطأ في تحديث بيانات العميل' }, 500);
  }
});

// إنشاء تذكرة جديدة
app.post('/api/tickets', async (c) => {
  try {
    const db = c.env.DB;
    const { customer_id, title, description, priority, assigned_to } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO tickets (customer_id, title, description, priority, assigned_to, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(customer_id, title, description, priority, assigned_to).run();

    // تحديث تاريخ آخر تفاعل للعميل
    await db.prepare(`
      UPDATE customers SET last_interaction_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(customer_id).run();

    return c.json({ 
      id: result.meta.last_row_id,
      message: 'تم إنشاء التذكرة بنجاح' 
    });
  } catch (error) {
    return c.json({ error: 'خطأ في إنشاء التذكرة' }, 500);
  }
});

// الحصول على تذاكر عميل معين
app.get('/api/customers/:customerId/tickets', async (c) => {
  try {
    const db = c.env.DB;
    const customerId = c.req.param('customerId');
    
    const tickets = await db.prepare(`
      SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.created_at, t.updated_at,
        e.name as assigned_to_name
      FROM tickets t
      LEFT JOIN employees e ON t.assigned_to = e.id
      WHERE t.customer_id = ?
      ORDER BY t.created_at DESC
    `).bind(customerId).all();

    return c.json(tickets.results || []);
  } catch (error) {
    return c.json({ error: 'خطأ في تحميل تذاكر العميل' }, 500);
  }
});

// إرسال استطلاع رضا للعميل
app.post('/api/tickets/:ticketId/send-survey', async (c) => {
  try {
    const db = c.env.DB;
    const ticketId = c.req.param('ticketId');
    
    // الحصول على معلومات التذكرة والعميل
    const ticket = await db.prepare(`
      SELECT 
        t.id, t.title, t.customer_id,
        c.name as customer_name, c.email as customer_email
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = ? AND t.status = 'resolved'
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'التذكرة غير موجودة أو غير محلولة' }, 404);
    }

    // التحقق من وجود بريد إلكتروني للعميل
    if (!ticket.customer_email) {
      return c.json({ error: 'لا يمكن إرسال الاستطلاع - العميل لا يملك بريد إلكتروني' }, 400);
    }

    // إنشاء token فريد للاستطلاع
    const surveyToken = `survey_${ticketId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // إدراج استطلاع جديد في قاعدة البيانات
    await db.prepare(`
      INSERT INTO satisfaction_surveys (ticket_id, customer_id, survey_token)
      VALUES (?, ?, ?)
    `).bind(ticket.id, ticket.customer_id, surveyToken).run();

    // إرسال البريد الإلكتروني
    const emailService = createEmailService(c.env);
    const emailSent = await emailService.sendSatisfactionSurvey({
      customerName: ticket.customer_name,
      customerEmail: ticket.customer_email,
      ticketTitle: ticket.title,
      ticketId: ticket.id,
      surveyToken: surveyToken,
    });

    if (emailSent) {
      return c.json({ 
        success: true, 
        message: 'تم إرسال استطلاع الرضا بنجاح',
        surveyToken 
      });
    } else {
      return c.json({ 
        success: false, 
        message: 'فشل في إرسال البريد الإلكتروني' 
      }, 500);
    }

  } catch (error) {
    console.error('خطأ في إرسال استطلاع الرضا:', error);
    return c.json({ error: 'خطأ في إرسال استطلاع الرضا' }, 500);
  }
});

// الحصول على قائمة استطلاعات الرضا
app.get('/api/surveys', async (c) => {
  try {
    const db = c.env.DB;
    const surveys = await db.prepare(`
      SELECT 
        s.id, s.ticket_id, s.survey_token, s.rating, s.comment,
        s.sent_at, s.responded_at,
        c.name as customer_name, c.email as customer_email,
        t.title as ticket_title
      FROM satisfaction_surveys s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN tickets t ON s.ticket_id = t.id
      ORDER BY s.sent_at DESC
    `).all();

    return c.json(surveys.results || []);
  } catch (error) {
    return c.json({ error: 'خطأ في تحميل استطلاعات الرضا' }, 500);
  }
});

// إرسال إشعار للعميل
app.post('/api/customers/:customerId/send-notification', async (c) => {
  try {
    const db = c.env.DB;
    const customerId = c.req.param('customerId');
    const { subject, message, actionUrl, actionText } = await c.req.json();
    
    // الحصول على معلومات العميل
    const customer = await db.prepare(`
      SELECT name, email FROM customers WHERE id = ?
    `).bind(customerId).first();

    if (!customer) {
      return c.json({ error: 'العميل غير موجود' }, 404);
    }

    // إرسال الإشعار
    const emailService = createEmailService(c.env);
    const emailSent = await emailService.sendNotification({
      customerName: customer.name,
      customerEmail: customer.email,
      subject,
      message,
      actionUrl,
      actionText,
    });

    if (emailSent) {
      return c.json({ 
        success: true, 
        message: 'تم إرسال الإشعار بنجاح'
      });
    } else {
      return c.json({ 
        success: false, 
        message: 'فشل في إرسال الإشعار' 
      }, 500);
    }

  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    return c.json({ error: 'خطأ في إرسال الإشعار' }, 500);
  }
});

// فحص التنبيهات وإرسالها
app.post('/api/alerts/check', async (c) => {
  try {
    const db = c.env.DB;
    const alertService = createAlertService(db, c.env);
    
    const alerts = await alertService.checkAllCustomers();
    
    if (alerts.length > 0) {
      await alertService.sendTeamAlerts(alerts);
    }
    
    return c.json({ 
      success: true, 
      alertsFound: alerts.length,
      alerts: alerts.map(alert => ({
        customerId: alert.customerId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message
      }))
    });
  } catch (error) {
    console.error('خطأ في فحص التنبيهات:', error);
    return c.json({ error: 'خطأ في فحص التنبيهات' }, 500);
  }
});

// إرسال رسالة استباقية لعميل
app.post('/api/customers/:customerId/proactive-message', async (c) => {
  try {
    const db = c.env.DB;
    const customerId = c.req.param('customerId');
    const { type } = await c.req.json(); // 'check_in' أو 'welcome_back'
    
    const alertService = createAlertService(db, c.env);
    const success = await alertService.sendProactiveMessage(parseInt(customerId), type);
    
    if (success) {
      return c.json({ 
        success: true, 
        message: 'تم إرسال الرسالة الاستباقية بنجاح' 
      });
    } else {
      return c.json({ 
        success: false, 
        message: 'فشل في إرسال الرسالة الاستباقية' 
      }, 500);
    }
  } catch (error) {
    console.error('خطأ في إرسال الرسالة الاستباقية:', error);
    return c.json({ error: 'خطأ في إرسال الرسالة الاستباقية' }, 500);
  }
});

// الحصول على تحليل صحة العملاء
app.get('/api/customers/health-analysis', async (c) => {
  try {
    const db = c.env.DB;
    
    // إحصائيات حسب حالة الصحة
    const healthStats = await db.prepare(`
      SELECT 
        health_status,
        COUNT(*) as count,
        AVG(health_score) as avg_score
      FROM customers 
      GROUP BY health_status
    `).all();
    
    // العملاء في خطر (health_score < 4)
    const atRiskCustomers = await db.prepare(`
      SELECT id, name, email, health_score, last_interaction_at
      FROM customers 
      WHERE health_score < 4 
      ORDER BY health_score ASC
    `).all();
    
    // العملاء الذين لم يتفاعلوا لفترة طويلة (> 30 يوم)
    const inactiveCustomers = await db.prepare(`
      SELECT id, name, email, last_interaction_at,
             ROUND(JULIANDAY('now') - JULIANDAY(last_interaction_at)) as days_inactive
      FROM customers 
      WHERE last_interaction_at IS NOT NULL 
        AND JULIANDAY('now') - JULIANDAY(last_interaction_at) > 30
      ORDER BY days_inactive DESC
    `).all();
    
    return c.json({
      healthStats: healthStats.results || [],
      atRiskCustomers: atRiskCustomers.results || [],
      inactiveCustomers: inactiveCustomers.results || []
    });
  } catch (error) {
    console.error('خطأ في تحليل صحة العملاء:', error);
    return c.json({ error: 'خطأ في تحليل صحة العملاء' }, 500);
  }
});

// صفحة استطلاع الرضا العامة
app.get('/survey/:token', async (c) => {
  const token = c.req.param('token');
  const rating = c.req.query('rating');
  
  if (rating) {
    // تسجيل التقييم
    try {
      const db = c.env.DB;
      
      // البحث عن الاستطلاع
      const survey = await db.prepare('SELECT * FROM satisfaction_surveys WHERE survey_token = ?')
        .bind(token).first();
      
      if (!survey) {
        return c.html('<h1>استطلاع غير موجود</h1>');
      }
      
      // تحديث التقييم
      await db.prepare(`
        UPDATE satisfaction_surveys 
        SET rating = ?, responded_at = CURRENT_TIMESTAMP 
        WHERE survey_token = ?
      `).bind(parseInt(rating), token).run();
      
      // تحديث مؤشر صحة العميل
      await updateCustomerHealth(db, survey.customer_id);
      
      return c.html(`
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>شكراً لك</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .thank-you { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="thank-you">🙏 شكراً لك على تقييمك!</div>
          <p>تم تسجيل رأيك بنجاح وسنعمل على تحسين خدماتنا.</p>
        </body>
        </html>
      `);
      
    } catch (error) {
      return c.html('<h1>خطأ في تسجيل التقييم</h1>');
    }
  }
  
  // عرض صفحة الاستطلاع
  return c.html(`
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>استطلاع رضا العملاء</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 500px; 
          margin: 50px auto; 
          padding: 20px;
          text-align: center;
        }
        .rating-buttons { margin: 30px 0; }
        .rating-btn { 
          font-size: 60px; 
          margin: 0 15px; 
          text-decoration: none;
          transition: transform 0.2s;
        }
        .rating-btn:hover { transform: scale(1.1); }
        .subtitle { color: #666; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h2>ما مدى رضاك عن الخدمة التي تلقيتها؟</h2>
      <div class="rating-buttons">
        <a href="/survey/${token}?rating=1" class="rating-btn">😞</a>
        <a href="/survey/${token}?rating=2" class="rating-btn">😐</a>
        <a href="/survey/${token}?rating=3" class="rating-btn">😊</a>
      </div>
      <p class="subtitle">انقر على الوجه الذي يعبر عن مستوى رضاك</p>
    </body>
    </html>
  `);
});

// وظيفة مساعدة لتحديث مؤشر صحة العميل
async function updateCustomerHealth(db: D1Database, customerId: number) {
  try {
    // حساب متوسط التقييمات
    const avgRating = await db.prepare(
      'SELECT AVG(rating) as avg FROM satisfaction_surveys WHERE customer_id = ? AND rating IS NOT NULL'
    ).bind(customerId).first();
    
    // عدد التذاكر المفتوحة
    const openTickets = await db.prepare(
      "SELECT COUNT(*) as count FROM tickets WHERE customer_id = ? AND status IN ('new', 'in_progress', 'waiting_customer')"
    ).bind(customerId).first();
    
    // حساب مؤشر الصحة
    let score = 5.0;
    
    if (avgRating?.avg) {
      score = (score * 0.5) + (avgRating.avg * 1.67 * 0.5);
    }
    
    if (openTickets?.count > 3) score -= 1.0;
    else if (openTickets?.count > 1) score -= 0.5;
    
    score = Math.max(1, Math.min(10, score));
    
    let status;
    if (score >= 7) status = 'healthy';
    else if (score >= 4) status = 'needs_attention';
    else status = 'at_risk';
    
    // تحديث قاعدة البيانات
    await db.prepare(`
      UPDATE customers 
      SET health_score = ?, health_status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(Math.round(score * 10) / 10, status, customerId).run();
    
  } catch (error) {
    console.error('Error updating customer health:', error);
  }
}

// ========================================
// API endpoints للهيكل التنظيمي
// Organizational Structure API endpoints
// ========================================

// الحصول على إحصائيات السعة التنظيمية
// Get organizational capacity statistics
app.get('/api/capacity/stats', async (c) => {
  try {
    const { env } = c;
    const stats = await CapacityService.getCapacityStats(env.DB);
    return c.json(stats);
  } catch (error) {
    console.error('Error getting capacity stats:', error);
    return c.json({ error: 'Failed to get capacity statistics' }, 500);
  }
});

// فحص السعة وإنشاء التنبيهات
// Check capacity and generate alerts
app.post('/api/capacity/check', async (c) => {
  try {
    const { env } = c;
    const alerts = await CapacityService.checkCapacityAndGenerateAlerts(env.DB);
    return c.json({ alerts, count: alerts.length });
  } catch (error) {
    console.error('Error checking capacity:', error);
    return c.json({ error: 'Failed to check capacity' }, 500);
  }
});

// الحصول على التنبيهات النشطة
// Get active capacity alerts
app.get('/api/capacity/alerts', async (c) => {
  try {
    const { env } = c;
    const alerts = await CapacityService.getActiveAlerts(env.DB);
    return c.json(alerts);
  } catch (error) {
    console.error('Error getting alerts:', error);
    return c.json({ error: 'Failed to get alerts' }, 500);
  }
});

// حل تنبيه
// Resolve alert
app.post('/api/capacity/alerts/:id/resolve', async (c) => {
  try {
    const { env } = c;
    const alertId = parseInt(c.req.param('id'));
    await CapacityService.resolveAlert(env.DB, alertId);
    return c.json({ success: true, message: 'تم حل التنبيه بنجاح' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return c.json({ error: 'Failed to resolve alert' }, 500);
  }
});

// توزيع العملاء غير المربوطين
// Distribute unassigned customers
app.post('/api/capacity/distribute', async (c) => {
  try {
    const { env } = c;
    const result = await CapacityService.distributeUnassignedCustomers(env.DB);
    return c.json(result);
  } catch (error) {
    console.error('Error distributing customers:', error);
    return c.json({ error: 'Failed to distribute customers' }, 500);
  }
});

// الحصول على تقرير الهيكل التنظيمي
// Get organizational structure report
app.get('/api/organization/report', async (c) => {
  try {
    const { env } = c;
    const report = await CapacityService.getOrganizationalReport(env.DB);
    return c.json(report);
  } catch (error) {
    console.error('Error getting organizational report:', error);
    return c.json({ error: 'Failed to get organizational report' }, 500);
  }
});

// إضافة موظف جديد
// Add new employee
app.post('/api/employees', async (c) => {
  try {
    const { env } = c;
    const { name, email, phone, level2_manager_id } = await c.req.json();
    
    const result = await env.DB.prepare(`
      INSERT INTO employees (name, email, phone, level2_manager_id) 
      VALUES (?, ?, ?, ?)
    `).bind(name, email || null, phone || null, level2_manager_id).run();
    
    return c.json({ 
      success: true, 
      employee_id: result.meta.last_row_id,
      message: 'تم إضافة الموظف بنجاح' 
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    return c.json({ error: 'Failed to add employee' }, 500);
  }
});

// إضافة مدير مستوى ثاني جديد
// Add new level 2 manager
app.post('/api/level2-managers', async (c) => {
  try {
    const { env } = c;
    const { name, email, phone, level1_manager_id } = await c.req.json();
    
    const result = await env.DB.prepare(`
      INSERT INTO level2_managers (name, email, phone, level1_manager_id) 
      VALUES (?, ?, ?, ?)
    `).bind(name, email || null, phone || null, level1_manager_id).run();
    
    return c.json({ 
      success: true, 
      manager_id: result.meta.last_row_id,
      message: 'تم إضافة المدير بنجاح' 
    });
  } catch (error) {
    console.error('Error adding level 2 manager:', error);
    return c.json({ error: 'Failed to add manager' }, 500);
  }
});

// الحصول على قائمة الموظفين
// Get employees list
app.get('/api/employees', async (c) => {
  try {
    const { env } = c;
    const employees = await env.DB.prepare(`
      SELECT 
        e.*,
        lm2.name as manager_name,
        COUNT(c.id) as customers_count
      FROM employees e
      LEFT JOIN level2_managers lm2 ON lm2.id = e.level2_manager_id
      LEFT JOIN customers c ON c.employee_id = e.id
      WHERE e.is_active = 1
      GROUP BY e.id
      ORDER BY e.name
    `).all();
    
    return c.json(employees.results);
  } catch (error) {
    console.error('Error getting employees:', error);
    return c.json({ error: 'Failed to get employees' }, 500);
  }
});

// الحصول على قائمة مديري المستوى الثاني
// Get level 2 managers list
app.get('/api/level2-managers', async (c) => {
  try {
    const { env } = c;
    const managers = await env.DB.prepare(`
      SELECT 
        lm2.*,
        lm1.name as level1_manager_name,
        COUNT(DISTINCT e.id) as employees_count,
        COUNT(DISTINCT c.id) as total_customers_count
      FROM level2_managers lm2
      LEFT JOIN level1_managers lm1 ON lm1.id = lm2.level1_manager_id
      LEFT JOIN employees e ON e.level2_manager_id = lm2.id AND e.is_active = 1
      LEFT JOIN customers c ON c.employee_id = e.id
      WHERE lm2.is_active = 1
      GROUP BY lm2.id
      ORDER BY lm2.name
    `).all();
    
    return c.json(managers.results);
  } catch (error) {
    console.error('Error getting level 2 managers:', error);
    return c.json({ error: 'Failed to get managers' }, 500);
  }
});

// استيراد العملاء من Excel (CSV format)
// Import customers from Excel (CSV format)
app.post('/api/customers/import', async (c) => {
  try {
    const db = c.env.DB;
    const { customers } = await c.req.json();

    if (!Array.isArray(customers) || customers.length === 0) {
      return c.json({ error: 'يجب إرسال قائمة بالعملاء' }, 400);
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // معالجة كل عميل
    for (const customer of customers) {
      try {
        const {
          first_name, middle_name, last_name,
          email, phone,
          communication_method = 'whatsapp',
          region, city,
          specialization,
          employee_id
        } = customer;

        // التحقق من الحقول المطلوبة
        if (!first_name || !phone) {
          results.failed++;
          results.errors.push(`العميل ${first_name || 'غير معروف'}: الاسم الأول ورقم الجوال مطلوبان`);
          continue;
        }

        // بناء الاسم الكامل
        const fullName = [first_name, middle_name, last_name].filter(Boolean).join(' ');

        await db.prepare(`
          INSERT INTO customers (
            name, first_name, middle_name, last_name,
            email, phone,
            communication_method, region, city, specialization,
            employee_id,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          fullName, first_name, middle_name, last_name,
          email, phone,
          communication_method, region, city, specialization,
          employee_id
        ).run();

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`العميل ${customer.first_name || 'غير معروف'}: ${error.message}`);
      }
    }

    return c.json({
      message: `تم استيراد ${results.success} عميل بنجاح${results.failed > 0 ? ` وفشل ${results.failed}` : ''}`,
      ...results
    });
  } catch (error) {
    console.error('Error importing customers:', error);
    return c.json({ error: 'خطأ في استيراد العملاء' }, 500);
  }
});

// حذف عميل
// Delete customer
app.delete('/api/customers/:customerId', async (c) => {
  try {
    const db = c.env.DB;
    const customerId = c.req.param('customerId');

    // التحقق من عدم وجود تذاكر نشطة للعميل
    const activeTickets = await db.prepare(`
      SELECT COUNT(*) as count FROM tickets
      WHERE customer_id = ? AND status NOT IN ('closed', 'resolved')
    `).bind(customerId).first();

    if (activeTickets && activeTickets.count > 0) {
      return c.json({
        error: 'لا يمكن حذف العميل لأنه يمتلك تذاكر نشطة'
      }, 400);
    }

    await db.prepare(`
      DELETE FROM customers WHERE id = ?
    `).bind(customerId).run();

    return c.json({
      message: 'تم حذف العميل بنجاح'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return c.json({ error: 'خطأ في حذف العميل' }, 500);
  }
});

export default app