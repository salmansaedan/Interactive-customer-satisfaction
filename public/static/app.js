// JavaScript لتطبيق عميلي أولاً

// متغيرات عامة
let currentTab = 'customers';
let customersData = [];
let ticketsData = [];
let surveysData = [];

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// تهيئة التطبيق
async function initializeApp() {
    setupTabNavigation();
    await loadStats();
    await loadCustomers();
    await loadTickets();
    await loadSurveys();
}

// إعداد التنقل بين التبويبات
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// التبديل بين التبويبات
function switchTab(tabId) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // إزالة التأثير من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // إظهار التبويب المحدد
    const targetTab = document.getElementById(tabId + '-tab');
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    // تفعيل الزر المحدد
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.remove('border-transparent', 'text-gray-500');
        activeButton.classList.add('border-blue-500', 'text-blue-600');
    }
    
    currentTab = tabId;
    
    // تحميل البيانات الخاصة بالتبويب
    if (tabId === 'organization') {
        loadOrganizationData();
    }
}

// تحميل الإحصائيات العامة
async function loadStats() {
    try {
        const response = await axios.get('/api/stats');
        const stats = response.data;
        
        document.getElementById('total-customers').textContent = stats.totalCustomers;
        document.getElementById('open-tickets').textContent = stats.openTickets;
        document.getElementById('avg-satisfaction').textContent = stats.avgSatisfaction + '%';
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        showNotification('خطأ في تحميل الإحصائيات', 'error');
    }
}

// تحميل قائمة العملاء
async function loadCustomers() {
    try {
        const response = await axios.get('/api/customers');
        customersData = response.data;
        renderCustomers();
    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
        showNotification('خطأ في تحميل العملاء', 'error');
    }
}

// عرض قائمة العملاء
function renderCustomers() {
    const customersList = document.getElementById('customers-list');
    
    if (customersData.length === 0) {
        customersList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-4"></i>
                <p>لا توجد عملاء مسجلين بعد</p>
            </div>
        `;
        return;
    }
    
    customersList.innerHTML = customersData.map(customer => `
        <div class="customer-card bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">${customer.name}</h3>
                        <span class="health-indicator health-${customer.health_status} mr-3">
                            ${getHealthStatusText(customer.health_status)}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        ${customer.email ? `
                            <div>
                                <i class="fas fa-envelope ml-1"></i>
                                ${customer.email}
                            </div>
                        ` : `
                            <div class="text-gray-400">
                                <i class="fas fa-envelope-slash ml-1"></i>
                                لا يوجد بريد إلكتروني
                            </div>
                        `}
                        ${customer.phone ? `
                            <div>
                                <i class="fas fa-phone ml-1"></i>
                                ${customer.phone}
                            </div>
                        ` : ''}
                        ${customer.company ? `
                            <div>
                                <i class="fas fa-building ml-1"></i>
                                ${customer.company}
                            </div>
                        ` : ''}
                        <div>
                            <i class="fas fa-heart ml-1"></i>
                            مؤشر الصحة: ${customer.health_score}/10
                        </div>
                    </div>
                </div>
                <div class="flex flex-col space-y-2">
                    <button class="btn-primary text-sm" onclick="openCustomerProfile(${customer.id})">
                        <i class="fas fa-eye ml-1"></i>
                        عرض الملف
                    </button>
                    <button class="btn-success text-sm" onclick="createTicketForCustomer(${customer.id})">
                        <i class="fas fa-ticket-alt ml-1"></i>
                        إنشاء تذكرة
                    </button>
                    ${customer.health_status === 'needs_attention' || customer.health_status === 'at_risk' ? `
                        <button class="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700" 
                                onclick="sendProactiveMessage(${customer.id}, 'check_in')" 
                                ${!customer.email ? 'disabled title="لا يوجد بريد إلكتروني"' : ''}>
                            <i class="fas fa-heart ml-1"></i>
                            ${customer.email ? 'رسالة اطمئنان' : 'اتصال مطلوب'}
                        </button>
                    ` : ''}
                    ${getLastInteractionDays(customer.last_interaction_at) > 30 ? `
                        <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700" 
                                onclick="sendProactiveMessage(${customer.id}, 'welcome_back')"
                                ${!customer.email ? 'disabled title="لا يوجد بريد إلكتروني"' : ''}>
                            <i class="fas fa-handshake ml-1"></i>
                            ${customer.email ? 'رسالة ترحيب' : 'اتصال مطلوب'}
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// تحميل قائمة التذاكر
async function loadTickets() {
    try {
        const response = await axios.get('/api/tickets');
        ticketsData = response.data;
        renderTickets();
    } catch (error) {
        console.error('خطأ في تحميل التذاكر:', error);
        showNotification('خطأ في تحميل التذاكر', 'error');
    }
}

// عرض قائمة التذاكر
function renderTickets() {
    const ticketsList = document.getElementById('tickets-list');
    
    if (ticketsData.length === 0) {
        ticketsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-ticket-alt text-4xl mb-4"></i>
                <p>لا توجد تذاكر دعم بعد</p>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = ticketsData.map(ticket => `
        <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">${ticket.title}</h3>
                        <span class="ticket-status status-${ticket.status} mr-3">
                            ${getStatusText(ticket.status)}
                        </span>
                        <span class="priority-${ticket.priority} mr-2">
                            <i class="fas fa-flag"></i>
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${ticket.description}</p>
                    <div class="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                        <span>
                            <i class="fas fa-user ml-1"></i>
                            ${ticket.customer_name}
                        </span>
                        ${ticket.assigned_to_name ? `
                            <span>
                                <i class="fas fa-user-tie ml-1"></i>
                                ${ticket.assigned_to_name}
                            </span>
                        ` : ''}
                        <span>
                            <i class="fas fa-clock ml-1"></i>
                            ${formatDate(ticket.created_at)}
                        </span>
                    </div>
                </div>
                <div class="flex flex-col space-y-2">
                    <button class="btn-primary text-sm" onclick="openTicket(${ticket.id})">
                        <i class="fas fa-eye ml-1"></i>
                        عرض التذكرة
                    </button>
                    ${ticket.status === 'resolved' ? `
                        <button class="btn-success text-sm" onclick="sendSatisfactionSurvey(${ticket.id})">
                            <i class="fas fa-poll ml-1"></i>
                            استطلاع الرضا
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// إرسال استطلاع رضا
async function sendSatisfactionSurvey(ticketId) {
    try {
        // إظهار رسالة تحميل
        showNotification('جاري إرسال استطلاع الرضا...', 'info');
        
        const response = await axios.post(`/api/tickets/${ticketId}/send-survey`);
        
        if (response.data.success) {
            showNotification('تم إرسال استطلاع الرضا بنجاح 📧', 'success');
            // إعادة تحميل التذاكر لتحديث الحالة
            await loadTickets();
        } else {
            showNotification(response.data.message || 'فشل في إرسال الاستطلاع', 'error');
        }
    } catch (error) {
        console.error('خطأ في إرسال استطلاع الرضا:', error);
        if (error.response?.data?.error) {
            showNotification(error.response.data.error, 'error');
        } else {
            showNotification('خطأ في إرسال استطلاع الرضا', 'error');
        }
    }
}

// فتح ملف العميل
function openCustomerProfile(customerId) {
    showCustomerProfileModal(customerId);
}

// إنشاء تذكرة جديدة لعميل
function createTicketForCustomer(customerId) {
    showTicketModal(customerId);
}

// فتح تذكرة
function openTicket(ticketId) {
    console.log('فتح التذكرة:', ticketId);
    showNotification('سيتم تطوير هذه الميزة قريباً', 'info');
}

// دوال مساعدة
function getHealthStatusText(status) {
    switch (status) {
        case 'healthy': return 'صحي';
        case 'needs_attention': return 'يحتاج اهتمام';
        case 'at_risk': return 'في خطر';
        default: return 'غير محدد';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'new': return 'جديد';
        case 'in_progress': return 'قيد المعالجة';
        case 'waiting_customer': return 'في انتظار العميل';
        case 'resolved': return 'تم الحل';
        case 'closed': return 'مغلق';
        default: return 'غير محدد';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getLastInteractionDays(dateString) {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// نظام الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-4 p-4 rounded-lg text-white font-medium z-50 ${getNotificationColor(type)}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'bg-green-600';
        case 'error': return 'bg-red-600';
        case 'warning': return 'bg-yellow-600';
        default: return 'bg-blue-600';
    }
}

// تحميل استطلاعات الرضا
async function loadSurveys() {
    try {
        const response = await axios.get('/api/surveys');
        surveysData = response.data;
        renderSurveys();
    } catch (error) {
        console.error('خطأ في تحميل استطلاعات الرضا:', error);
        showNotification('خطأ في تحميل استطلاعات الرضا', 'error');
    }
}

// عرض استطلاعات الرضا
function renderSurveys() {
    const surveysList = document.getElementById('surveys-list');
    
    if (surveysData.length === 0) {
        surveysList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-poll text-4xl mb-4"></i>
                <p>لا توجد استطلاعات رضا بعد</p>
            </div>
        `;
        return;
    }
    
    surveysList.innerHTML = surveysData.map(survey => `
        <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">${survey.ticket_title}</h3>
                        ${survey.rating ? `
                            <span class="mr-3 text-2xl">
                                ${getRatingEmoji(survey.rating)}
                            </span>
                        ` : `
                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm mr-3">
                                في الانتظار
                            </span>
                        `}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                            <i class="fas fa-user ml-1"></i>
                            ${survey.customer_name}
                        </div>
                        <div>
                            <i class="fas fa-envelope ml-1"></i>
                            ${survey.customer_email}
                        </div>
                        <div>
                            <i class="fas fa-paper-plane ml-1"></i>
                            أُرسل: ${formatDate(survey.sent_at)}
                        </div>
                        ${survey.responded_at ? `
                            <div>
                                <i class="fas fa-check ml-1"></i>
                                رد: ${formatDate(survey.responded_at)}
                            </div>
                        ` : ''}
                    </div>
                    ${survey.comment ? `
                        <div class="mt-3 p-3 bg-gray-50 rounded border-r-4 border-blue-500">
                            <p class="text-sm text-gray-700">💬 "${survey.comment}"</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// الحصول على الإيموجي المناسب للتقييم
function getRatingEmoji(rating) {
    switch (rating) {
        case 1: return '😞';
        case 2: return '😐';
        case 3: return '😊';
        default: return '❓';
    }
}

// فحص التنبيهات
async function checkAlerts() {
    try {
        showNotification('جاري فحص تنبيهات العملاء...', 'info');
        
        const response = await axios.post('/api/alerts/check');
        
        if (response.data.success) {
            const alertsCount = response.data.alertsFound;
            if (alertsCount > 0) {
                showNotification(`تم اكتشاف ${alertsCount} تنبيه وإرسالها للفريق 🚨`, 'warning');
                // إعادة تحميل البيانات
                await loadStats();
                await loadCustomers();
            } else {
                showNotification('لا توجد تنبيهات جديدة 👍', 'success');
            }
        }
    } catch (error) {
        console.error('خطأ في فحص التنبيهات:', error);
        showNotification('خطأ في فحص التنبيهات', 'error');
    }
}

// إرسال رسالة استباقية للعميل
async function sendProactiveMessage(customerId, messageType) {
    try {
        // البحث عن العميل للتحقق من وجود بريد إلكتروني
        const customer = customersData.find(c => c.id === customerId);
        
        if (!customer || !customer.email) {
            showNotification('⚠️ لا يمكن إرسال رسالة - العميل لا يملك بريد إلكتروني. يُنصح بالاتصال الهاتفي', 'warning');
            return;
        }
        
        showNotification('جاري إرسال الرسالة...', 'info');
        
        const response = await axios.post(`/api/customers/${customerId}/proactive-message`, {
            type: messageType // 'check_in' أو 'welcome_back'
        });
        
        if (response.data.success) {
            const messageTypes = {
                'check_in': 'رسالة اطمئنان',
                'welcome_back': 'رسالة ترحيب'
            };
            showNotification(`تم إرسال ${messageTypes[messageType]} بنجاح 📧`, 'success');
            // تحديث تاريخ آخر تفاعل
            await loadCustomers();
        } else {
            showNotification(response.data.message || 'فشل في إرسال الرسالة', 'error');
        }
    } catch (error) {
        console.error('خطأ في إرسال الرسالة الاستباقية:', error);
        if (error.response?.status === 400) {
            showNotification('لا يمكن إرسال الرسالة - العميل لا يملك بريد إلكتروني', 'warning');
        } else {
            showNotification('خطأ في إرسال الرسالة الاستباقية', 'error');
        }
    }
}

// إرسال إشعار للعميل
async function sendCustomerNotification(customerId) {
    // هذه الوظيفة ستُطوَّر لاحقاً مع النوافذ المنبثقة
    showNotification('سيتم تطوير هذه الميزة قريباً', 'info');
}

// تحديث البيانات كل دقيقة
setInterval(async () => {
    await loadStats();
    if (currentTab === 'surveys') {
        await loadSurveys();
    }
}, 60000);