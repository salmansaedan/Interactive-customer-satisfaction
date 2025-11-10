# دليل نظام إدارة العملاء الشامل

## نظرة عامة
تم تطوير نظام إدارة عملاء متقدم يتضمن جميع الحقول المطلوبة لتسجيل وإدارة العملاء بشكل شامل.

## الميزات الجديدة

### 1. معلومات الاسم التفصيلية
- **الاسم الأول** (مطلوب)
- **الاسم الأوسط** (اختياري)
- **اسم العائلة** (مطلوب)

يتم تجميع هذه الحقول تلقائياً لتكوين الاسم الكامل للعميل.

### 2. معلومات الاتصال
- **رقم الجوال** (مطلوب) - للتواصل مع العميل
- **وسيلة التواصل** (مطلوبة):
  - واتساب (WhatsApp)
  - رسائل نصية (SMS)
- **البريد الإلكتروني** (اختياري) - لإرسال الاستطلاعات والإشعارات

### 3. معلومات الموقع
- **المنطقة** - مثال: الرياض، مكة، الشرقية
- **المدينة** - مثال: الرياض، جدة، الدمام

### 4. التخصصات
يمكن اختيار تخصص العميل من القائمة التالية:
- بيع
- شراء
- استثمار
- تطوير
- تمويل
- أخبار
- مناسبات وأحداث

## طرق إضافة العملاء

### الطريقة الأولى: الإضافة المباشرة
1. انتقل إلى تبويب "العملاء"
2. اضغط على زر "إضافة عميل جديد"
3. املأ النموذج بجميع المعلومات المطلوبة
4. اضغط "حفظ"

### الطريقة الثانية: الاستيراد من Excel
1. انتقل إلى تبويب "العملاء"
2. اضغط على زر "استيراد من Excel"
3. قم بتحضير ملف CSV بالتنسيق التالي:

```csv
الاسم الأول,الاسم الأوسط,اسم العائلة,رقم الجوال,البريد الإلكتروني,وسيلة التواصل,المنطقة,المدينة,التخصص
محمد,أحمد,العلي,0501234567,mohamed@example.com,whatsapp,الرياض,الرياض,بيع
فاطمة,حسن,السالم,0509876543,fatima@example.com,sms,مكة,جدة,شراء
```

**ملاحظات مهمة:**
- احفظ الملف بصيغة CSV
- الحقول المطلوبة: الاسم الأول، اسم العائلة، رقم الجوال
- وسيلة التواصل: استخدم `whatsapp` أو `sms`
- يمكن ترك الحقول الاختيارية فارغة

## API Endpoints

### إضافة عميل جديد
```http
POST /api/customers
Content-Type: application/json

{
  "first_name": "محمد",
  "middle_name": "أحمد",
  "last_name": "العلي",
  "phone": "0501234567",
  "communication_method": "whatsapp",
  "email": "mohamed@example.com",
  "region": "الرياض",
  "city": "الرياض",
  "specialization": "بيع"
}
```

### تحديث بيانات عميل
```http
PUT /api/customers/:customerId
Content-Type: application/json

{
  "first_name": "محمد",
  "middle_name": "أحمد",
  "last_name": "العلي",
  "phone": "0501234567",
  "communication_method": "whatsapp",
  "email": "mohamed@example.com",
  "region": "الرياض",
  "city": "الرياض",
  "specialization": "بيع"
}
```

### الحصول على قائمة العملاء
```http
GET /api/customers
```

### استيراد عملاء من CSV
```http
POST /api/customers/import
Content-Type: application/json

{
  "customers": [
    {
      "first_name": "محمد",
      "middle_name": "أحمد",
      "last_name": "العلي",
      "phone": "0501234567",
      "communication_method": "whatsapp",
      "email": "mohamed@example.com",
      "region": "الرياض",
      "city": "الرياض",
      "specialization": "بيع"
    }
  ]
}
```

### حذف عميل
```http
DELETE /api/customers/:customerId
```

**ملاحظة:** لا يمكن حذف عميل لديه تذاكر نشطة (غير مغلقة).

## قاعدة البيانات

### الحقول الجديدة في جدول customers

| الحقل | النوع | مطلوب | الوصف |
|------|-------|-------|-------|
| first_name | TEXT | نعم | الاسم الأول |
| middle_name | TEXT | لا | الاسم الأوسط |
| last_name | TEXT | نعم | اسم العائلة |
| communication_method | TEXT | نعم | وسيلة التواصل (whatsapp/sms) |
| region | TEXT | لا | المنطقة |
| city | TEXT | لا | المدينة |
| specialization | TEXT | لا | التخصص |

### Migration
تم إنشاء migration جديد: `0004_customer_enhanced_fields.sql`

لتطبيق التغييرات على قاعدة البيانات:
```bash
npm run db:migrate:local  # للتطوير المحلي
npm run db:migrate:prod   # للإنتاج
```

## واجهة المستخدم

### نموذج إضافة/تعديل العميل
النموذج مقسم إلى أقسام واضحة:

1. **معلومات الاسم** (خلفية زرقاء)
   - الاسم الأول
   - الاسم الأوسط
   - اسم العائلة

2. **معلومات الاتصال** (خلفية خضراء)
   - رقم الجوال
   - وسيلة التواصل
   - البريد الإلكتروني

3. **معلومات الموقع** (خلفية بنفسجية)
   - المنطقة
   - المدينة

4. **التخصص والاهتمامات** (خلفية برتقالية)
   - التخصص

### عرض قائمة العملاء
تم تحديث عرض العملاء ليشمل:
- أيقونة واتساب/SMS بجانب رقم الجوال
- عرض المنطقة والمدينة
- عرض التخصص
- تصميم محسّن مع ألوان مميزة لكل نوع معلومة

## الاختبار

لاختبار النظام:

1. **تشغيل التطبيق محلياً:**
```bash
npm run build
npm run dev:d1
```

2. **إضافة عميل تجريبي:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "محمد",
    "middle_name": "أحمد",
    "last_name": "العلي",
    "phone": "0501234567",
    "communication_method": "whatsapp",
    "region": "الرياض",
    "city": "الرياض",
    "specialization": "بيع"
  }'
```

3. **استيراد عملاء من CSV:**
قم بإنشاء ملف `customers.csv` وارفعه من خلال الواجهة

## الملفات المعدلة

### Backend (API)
- `src/index.tsx`:
  - تحديث GET /api/customers
  - تحديث POST /api/customers
  - تحديث PUT /api/customers/:customerId
  - إضافة POST /api/customers/import
  - إضافة DELETE /api/customers/:customerId

### Frontend
- `public/static/modals.js`:
  - تحديث دالة showCustomerModal()
  - تحديث دالة submitCustomerForm()
  - تحديث دالة loadCustomerData()
  - إضافة دالة showImportCustomersModal()
  - إضافة دالة previewCSVData()
  - إضافة دالة importCustomersFromCSV()

- `public/static/app.js`:
  - تحديث دالة renderCustomers()

### Database
- `migrations/0004_customer_enhanced_fields.sql`:
  - إضافة الحقول الجديدة
  - إنشاء الفهارس

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- GitHub: https://github.com/salmansaedan/Interactive-customer-satisfaction

---

**تاريخ التحديث:** 2025-11-10
**الإصدار:** 2.0.0
