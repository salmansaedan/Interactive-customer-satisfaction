import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// تعريف أنواع البيانات لـ Cloudflare Bindings
type Bindings = {
  DB: D1Database;
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
                    </nav>
                </div>

                <!-- محتوى التبويبات -->
                <div class="p-6">
                    <!-- تبويب العملاء -->
                    <div id="customers-tab" class="tab-content">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">قائمة العملاء</h2>
                            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-plus ml-2"></i>
                                إضافة عميل جديد
                            </button>
                        </div>
                        <div id="customers-list" class="space-y-4">
                            <!-- سيتم تحميل قائمة العملاء هنا -->
                        </div>
                    </div>

                    <!-- تبويب التذاكر -->
                    <div id="tickets-tab" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800">تذاكر الدعم</h2>
                            <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
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
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
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
    const { name, email, phone, company } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO customers (name, email, phone, company, updated_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(name, email, phone, company).run();

    return c.json({ 
      id: result.meta.last_row_id, 
      name, email, phone, company,
      message: 'تم إضافة العميل بنجاح' 
    });
  } catch (error) {
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

export default app