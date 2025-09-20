// JavaScript لتطبيق عميلي أولاً

// متغيرات عامة
let currentTab = 'customers';
let customersData = [];
let ticketsData = [];

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
                        <div>
                            <i class="fas fa-envelope ml-1"></i>
                            ${customer.email}
                        </div>
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
        // هنا سيتم تطبيق منطق إرسال استطلاع الرضا
        showNotification('تم إرسال استطلاع الرضا بنجاح', 'success');
    } catch (error) {
        showNotification('خطأ في إرسال استطلاع الرضا', 'error');
    }
}

// فتح ملف العميل
function openCustomerProfile(customerId) {
    // هنا سيتم فتح نافذة منبثقة أو صفحة جديدة لملف العميل
    console.log('فتح ملف العميل:', customerId);
    showNotification('سيتم تطوير هذه الميزة قريباً', 'info');
}

// إنشاء تذكرة جديدة لعميل
function createTicketForCustomer(customerId) {
    console.log('إنشاء تذكرة للعميل:', customerId);
    showNotification('سيتم تطوير هذه الميزة قريباً', 'info');
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

// تحديث البيانات كل دقيقة
setInterval(async () => {
    await loadStats();
}, 60000);