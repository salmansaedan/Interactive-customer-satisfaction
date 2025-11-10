/**
 * نظام إدارة النوافذ المنبثقة للتطبيق
 */

// نافذة إضافة/تحرير عميل جديد
function showCustomerModal(customerId = null) {
    const isEdit = customerId !== null;
    const title = isEdit ? 'تحرير العميل' : 'إضافة عميل جديد';

    const modalHTML = `
        <div id="customerModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">${title}</h2>
                    <button onclick="closeModal('customerModal')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form id="customerForm" onsubmit="submitCustomerForm(event)">
                    <input type="hidden" id="customerId" value="${customerId || ''}">

                    <!-- معلومات الاسم -->
                    <div class="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 class="font-semibold text-gray-700 mb-3">
                            <i class="fas fa-user ml-2"></i>
                            معلومات الاسم
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="form-label">الاسم الأول *</label>
                                <input type="text" id="customerFirstName" class="form-input" required>
                            </div>
                            <div>
                                <label class="form-label">الاسم الأوسط</label>
                                <input type="text" id="customerMiddleName" class="form-input">
                            </div>
                            <div>
                                <label class="form-label">اسم العائلة *</label>
                                <input type="text" id="customerLastName" class="form-input" required>
                            </div>
                        </div>
                    </div>

                    <!-- معلومات الاتصال -->
                    <div class="bg-green-50 p-4 rounded-lg mb-4">
                        <h3 class="font-semibold text-gray-700 mb-3">
                            <i class="fas fa-phone ml-2"></i>
                            معلومات الاتصال
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">رقم الجوال *</label>
                                <input type="tel" id="customerPhone" class="form-input" required
                                       placeholder="05xxxxxxxx">
                            </div>
                            <div>
                                <label class="form-label">وسيلة التواصل *</label>
                                <select id="customerCommunicationMethod" class="form-input" required>
                                    <option value="whatsapp">واتساب</option>
                                    <option value="sms">رسائل نصية</option>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="form-label">البريد الإلكتروني</label>
                                <input type="email" id="customerEmail" class="form-input"
                                       placeholder="اختياري - لإرسال الاستطلاعات والإشعارات">
                            </div>
                        </div>
                    </div>

                    <!-- معلومات الموقع -->
                    <div class="bg-purple-50 p-4 rounded-lg mb-4">
                        <h3 class="font-semibold text-gray-700 mb-3">
                            <i class="fas fa-map-marker-alt ml-2"></i>
                            معلومات الموقع
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">المنطقة</label>
                                <input type="text" id="customerRegion" class="form-input"
                                       placeholder="مثال: الرياض، مكة، الشرقية">
                            </div>
                            <div>
                                <label class="form-label">المدينة</label>
                                <input type="text" id="customerCity" class="form-input"
                                       placeholder="مثال: الرياض، جدة، الدمام">
                            </div>
                        </div>
                    </div>

                    <!-- التخصص -->
                    <div class="bg-orange-50 p-4 rounded-lg mb-4">
                        <h3 class="font-semibold text-gray-700 mb-3">
                            <i class="fas fa-briefcase ml-2"></i>
                            التخصص والاهتمامات
                        </h3>
                        <div>
                            <label class="form-label">التخصص</label>
                            <select id="customerSpecialization" class="form-input">
                                <option value="">اختر التخصص</option>
                                <option value="بيع">بيع</option>
                                <option value="شراء">شراء</option>
                                <option value="استثمار">استثمار</option>
                                <option value="تطوير">تطوير</option>
                                <option value="تمويل">تمويل</option>
                                <option value="أخبار">أخبار</option>
                                <option value="مناسبات وأحداث">مناسبات وأحداث</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                        <button type="button" onclick="closeModal('customerModal')"
                                class="btn-secondary">إلغاء</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save ml-1"></i>
                            ${isEdit ? 'حفظ التغييرات' : 'إضافة العميل'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // إذا كان في وضع التحرير، املأ البيانات
    if (isEdit) {
        loadCustomerData(customerId);
    }
}

// نافذة إنشاء تذكرة جديدة
function showTicketModal(customerId = null) {
    const modalHTML = `
        <div id="ticketModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">إنشاء تذكرة جديدة</h2>
                    <button onclick="closeModal('ticketModal')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="ticketForm" onsubmit="submitTicketForm(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="form-label">العميل *</label>
                            <select id="ticketCustomer" class="form-input" required>
                                <option value="">اختر العميل</option>
                                ${customersData.map(customer => 
                                    `<option value="${customer.id}" ${customerId == customer.id ? 'selected' : ''}>
                                        ${customer.name} - ${customer.email}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="form-label">العنوان *</label>
                            <input type="text" id="ticketTitle" class="form-input" required 
                                   placeholder="وصف مختصر للمشكلة">
                        </div>
                        
                        <div>
                            <label class="form-label">الوصف التفصيلي *</label>
                            <textarea id="ticketDescription" class="form-input" rows="4" required
                                      placeholder="اشرح المشكلة بالتفصيل..."></textarea>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">الأولوية</label>
                                <select id="ticketPriority" class="form-input">
                                    <option value="low">منخفض</option>
                                    <option value="medium" selected>متوسط</option>
                                    <option value="high">عالي</option>
                                    <option value="urgent">عاجل</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="form-label">المسؤول</label>
                                <select id="ticketAssignee" class="form-input">
                                    <option value="">غير محدد</option>
                                    <option value="1">أحمد محمد</option>
                                    <option value="2">فاطمة علي</option>
                                    <option value="3">محمد سالم</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                        <button type="button" onclick="closeModal('ticketModal')" 
                                class="btn-secondary">إلغاء</button>
                        <button type="submit" class="btn-success">
                            <i class="fas fa-ticket-alt ml-1"></i>
                            إنشاء التذكرة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// نافذة تفاصيل العميل
function showCustomerProfileModal(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) return;
    
    const modalHTML = `
        <div id="profileModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">ملف العميل - ${customer.name}</h2>
                    <button onclick="closeModal('profileModal')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- معلومات العميل الأساسية -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 text-gray-700">
                            <i class="fas fa-user ml-2"></i>
                            المعلومات الأساسية
                        </h3>
                        <div class="space-y-2 text-sm">
                            <div><strong>الاسم:</strong> ${customer.name}</div>
                            <div><strong>البريد الإلكتروني:</strong> ${customer.email}</div>
                            ${customer.phone ? `<div><strong>الهاتف:</strong> ${customer.phone}</div>` : ''}
                            ${customer.company ? `<div><strong>الشركة:</strong> ${customer.company}</div>` : ''}
                            <div><strong>تاريخ الإنضمام:</strong> ${formatDate(customer.created_at)}</div>
                            ${customer.last_interaction_at ? 
                                `<div><strong>آخر تفاعل:</strong> ${formatDate(customer.last_interaction_at)}</div>` : 
                                '<div class="text-orange-600"><strong>لم يتم التفاعل بعد</strong></div>'
                            }
                        </div>
                    </div>
                    
                    <!-- مؤشر الصحة -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 text-gray-700">
                            <i class="fas fa-heartbeat ml-2"></i>
                            مؤشر صحة العميل
                        </h3>
                        <div class="text-center">
                            <div class="text-3xl font-bold mb-2" style="color: ${getHealthColor(customer.health_score)}">
                                ${customer.health_score}/10
                            </div>
                            <span class="health-indicator health-${customer.health_status}">
                                ${getHealthStatusText(customer.health_status)}
                            </span>
                        </div>
                        <div class="mt-4 space-y-2">
                            <button class="w-full btn-primary text-sm" onclick="sendProactiveMessage(${customer.id}, 'check_in')">
                                <i class="fas fa-heart ml-1"></i>
                                إرسال رسالة اطمئنان
                            </button>
                            <button class="w-full bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm" 
                                    onclick="showTicketModal(${customer.id})">
                                <i class="fas fa-ticket-alt ml-1"></i>
                                إنشاء تذكرة جديدة
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- التذاكر الحديثة -->
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-3 text-gray-700">
                        <i class="fas fa-history ml-2"></i>
                        التذاكر الحديثة
                    </h3>
                    <div id="customerTickets-${customer.id}">
                        <div class="text-center py-4 text-gray-500">
                            <i class="fas fa-spinner fa-spin"></i>
                            جاري تحميل التذاكر...
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end mt-6">
                    <button onclick="showCustomerModal(${customer.id})" class="btn-secondary ml-2">
                        <i class="fas fa-edit ml-1"></i>
                        تحرير البيانات
                    </button>
                    <button onclick="closeModal('profileModal')" class="btn-primary">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // تحميل تذاكر العميل
    loadCustomerTickets(customerId);
}

// إغلاق النافذة المنبثقة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// تحميل بيانات العميل للتحرير
async function loadCustomerData(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (customer) {
        document.getElementById('customerFirstName').value = customer.first_name || '';
        document.getElementById('customerMiddleName').value = customer.middle_name || '';
        document.getElementById('customerLastName').value = customer.last_name || '';
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerCommunicationMethod').value = customer.communication_method || 'whatsapp';
        document.getElementById('customerRegion').value = customer.region || '';
        document.getElementById('customerCity').value = customer.city || '';
        document.getElementById('customerSpecialization').value = customer.specialization || '';
    }
}

// إرسال نموذج العميل
async function submitCustomerForm(event) {
    event.preventDefault();

    const customerId = document.getElementById('customerId').value;
    const isEdit = customerId !== '';

    const customerData = {
        first_name: document.getElementById('customerFirstName').value,
        middle_name: document.getElementById('customerMiddleName').value,
        last_name: document.getElementById('customerLastName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        communication_method: document.getElementById('customerCommunicationMethod').value,
        region: document.getElementById('customerRegion').value,
        city: document.getElementById('customerCity').value,
        specialization: document.getElementById('customerSpecialization').value
    };

    try {
        showNotification('جاري حفظ البيانات...', 'info');

        let response;
        if (isEdit) {
            response = await axios.put(`/api/customers/${customerId}`, customerData);
        } else {
            response = await axios.post('/api/customers', customerData);
        }

        if (response.data) {
            showNotification(
                isEdit ? 'تم تحديث بيانات العميل بنجاح ✓' : 'تم إضافة العميل بنجاح ✓',
                'success'
            );
            closeModal('customerModal');
            await loadCustomers(); // إعادة تحميل قائمة العملاء
            await loadStats(); // تحديث الإحصائيات
        }
    } catch (error) {
        console.error('خطأ في حفظ بيانات العميل:', error);
        showNotification('خطأ في حفظ بيانات العميل', 'error');
    }
}

// إرسال نموذج التذكرة
async function submitTicketForm(event) {
    event.preventDefault();
    
    const ticketData = {
        customer_id: document.getElementById('ticketCustomer').value,
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        priority: document.getElementById('ticketPriority').value,
        assigned_to: document.getElementById('ticketAssignee').value || null
    };
    
    try {
        showNotification('جاري إنشاء التذكرة...', 'info');
        
        const response = await axios.post('/api/tickets', ticketData);
        
        if (response.data) {
            showNotification('تم إنشاء التذكرة بنجاح ✓', 'success');
            closeModal('ticketModal');
            await loadTickets(); // إعادة تحميل التذاكر
            await loadStats(); // تحديث الإحصائيات
        }
    } catch (error) {
        console.error('خطأ في إنشاء التذكرة:', error);
        showNotification('خطأ في إنشاء التذكرة', 'error');
    }
}

// تحميل تذاكر العميل
async function loadCustomerTickets(customerId) {
    try {
        const response = await axios.get(`/api/customers/${customerId}/tickets`);
        const tickets = response.data;
        
        const container = document.getElementById(`customerTickets-${customerId}`);
        
        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-inbox"></i>
                    <p>لا توجد تذاكر لهذا العميل بعد</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tickets.map(ticket => `
            <div class="border border-gray-200 rounded-lg p-3 mb-2">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold text-sm">${ticket.title}</h4>
                        <p class="text-xs text-gray-600 mt-1">${ticket.description.substring(0, 100)}...</p>
                        <div class="flex items-center space-x-3 space-x-reverse mt-2 text-xs text-gray-500">
                            <span class="ticket-status status-${ticket.status}">
                                ${getStatusText(ticket.status)}
                            </span>
                            <span>${formatDate(ticket.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل تذاكر العميل:', error);
        const container = document.getElementById(`customerTickets-${customerId}`);
        container.innerHTML = `
            <div class="text-center py-4 text-red-500">
                <i class="fas fa-exclamation-triangle"></i>
                <p>خطأ في تحميل التذاكر</p>
            </div>
        `;
    }
}

// دالة مساعدة للحصول على لون مؤشر الصحة
function getHealthColor(score) {
    if (score >= 7) return '#10b981'; // أخضر
    if (score >= 4) return '#f59e0b'; // برتقالي
    return '#ef4444'; // أحمر
}

// نافذة استيراد العملاء من Excel
function showImportCustomersModal() {
    const modalHTML = `
        <div id="importModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-file-excel ml-2"></i>
                        استيراد العملاء من Excel
                    </h2>
                    <button onclick="closeModal('importModal')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- التعليمات -->
                <div class="bg-blue-50 border-r-4 border-blue-500 p-4 mb-4">
                    <h3 class="font-bold text-blue-800 mb-2">
                        <i class="fas fa-info-circle ml-2"></i>
                        تعليمات الاستيراد
                    </h3>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• قم بتحضير ملف Excel بالأعمدة التالية:</li>
                        <li class="mr-4">- الاسم الأول (مطلوب)</li>
                        <li class="mr-4">- الاسم الأوسط</li>
                        <li class="mr-4">- اسم العائلة (مطلوب)</li>
                        <li class="mr-4">- رقم الجوال (مطلوب)</li>
                        <li class="mr-4">- البريد الإلكتروني</li>
                        <li class="mr-4">- وسيلة التواصل (واتساب أو رسائل نصية)</li>
                        <li class="mr-4">- المنطقة</li>
                        <li class="mr-4">- المدينة</li>
                        <li class="mr-4">- التخصص</li>
                        <li>• احفظ الملف بصيغة CSV</li>
                        <li>• تأكد من عدم وجود صف العناوين في الملف</li>
                    </ul>
                </div>

                <!-- نموذج تحميل الملف -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        اختر ملف CSV
                    </label>
                    <input type="file" id="csvFileInput" accept=".csv,.txt"
                           class="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                           onchange="previewCSVData()">
                </div>

                <!-- معاينة البيانات -->
                <div id="csvPreview" class="hidden mb-4">
                    <h3 class="font-semibold text-gray-700 mb-2">معاينة البيانات:</h3>
                    <div class="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <table class="w-full text-sm" id="previewTable">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-right p-2">الاسم الأول</th>
                                    <th class="text-right p-2">الاسم الأوسط</th>
                                    <th class="text-right p-2">اسم العائلة</th>
                                    <th class="text-right p-2">الجوال</th>
                                    <th class="text-right p-2">التخصص</th>
                                </tr>
                            </thead>
                            <tbody id="previewTableBody">
                            </tbody>
                        </table>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">
                        <span id="previewCount">0</span> عميل جاهز للاستيراد
                    </p>
                </div>

                <!-- الأزرار -->
                <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                    <button type="button" onclick="closeModal('importModal')"
                            class="btn-secondary">إلغاء</button>
                    <button type="button" onclick="importCustomersFromCSV()"
                            id="importButton" disabled
                            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-upload ml-1"></i>
                        استيراد العملاء
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// متغير لحفظ البيانات المحملة
let csvData = [];

// معاينة بيانات CSV
function previewCSVData() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        csvData = [];
        const preview = document.getElementById('csvPreview');
        const tbody = document.getElementById('previewTableBody');
        const importButton = document.getElementById('importButton');

        tbody.innerHTML = '';

        lines.forEach((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

            // تخطي صف العناوين إذا كان موجودًا
            if (index === 0 && (values[0].toLowerCase().includes('اسم') || values[0].toLowerCase().includes('name'))) {
                return;
            }

            if (values.length >= 4) {
                const customer = {
                    first_name: values[0] || '',
                    middle_name: values[1] || '',
                    last_name: values[2] || '',
                    phone: values[3] || '',
                    email: values[4] || '',
                    communication_method: values[5] || 'whatsapp',
                    region: values[6] || '',
                    city: values[7] || '',
                    specialization: values[8] || ''
                };

                csvData.push(customer);

                // إضافة صف للمعاينة (أول 5 فقط)
                if (csvData.length <= 5) {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td class="p-2 border-b">${customer.first_name}</td>
                        <td class="p-2 border-b">${customer.middle_name}</td>
                        <td class="p-2 border-b">${customer.last_name}</td>
                        <td class="p-2 border-b">${customer.phone}</td>
                        <td class="p-2 border-b">${customer.specialization}</td>
                    `;
                }
            }
        });

        if (csvData.length > 0) {
            preview.classList.remove('hidden');
            document.getElementById('previewCount').textContent = csvData.length;
            importButton.disabled = false;
        } else {
            showNotification('لم يتم العثور على بيانات صحيحة في الملف', 'error');
        }
    };

    reader.readAsText(file);
}

// استيراد العملاء من CSV
async function importCustomersFromCSV() {
    if (csvData.length === 0) {
        showNotification('لا توجد بيانات للاستيراد', 'error');
        return;
    }

    const importButton = document.getElementById('importButton');
    importButton.disabled = true;
    importButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i> جاري الاستيراد...';

    try {
        showNotification(`جاري استيراد ${csvData.length} عميل...`, 'info');

        const response = await axios.post('/api/customers/import', {
            customers: csvData
        });

        if (response.data) {
            showNotification(
                `${response.data.message}`,
                response.data.failed > 0 ? 'warning' : 'success'
            );

            // عرض الأخطاء إن وجدت
            if (response.data.errors && response.data.errors.length > 0) {
                console.error('أخطاء الاستيراد:', response.data.errors);
            }

            closeModal('importModal');
            await loadCustomers();
            await loadStats();
        }
    } catch (error) {
        console.error('خطأ في استيراد العملاء:', error);
        showNotification('خطأ في استيراد العملاء', 'error');
        importButton.disabled = false;
        importButton.innerHTML = '<i class="fas fa-upload ml-1"></i> استيراد العملاء';
    }
}