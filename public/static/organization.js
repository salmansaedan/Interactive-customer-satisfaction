// إدارة الهيكل التنظيمي
// Organizational Structure Management

let organizationData = {};
let capacityStats = {};

// تحميل بيانات الهيكل التنظيمي عند فتح التبويب
async function loadOrganizationData() {
  try {
    // تحميل إحصائيات السعة
    const statsResponse = await axios.get('/api/capacity/stats');
    capacityStats = statsResponse.data;
    updateCapacityStats();

    // تحميل التنبيهات النشطة
    await loadCapacityAlerts();

    // تحميل تقرير الهيكل التنظيمي
    const reportResponse = await axios.get('/api/organization/report');
    organizationData = reportResponse.data;
    
    // تحديث النظرة العامة
    updateOrganizationOverview();
    
  } catch (error) {
    console.error('Error loading organization data:', error);
    showNotification('خطأ في تحميل بيانات الهيكل التنظيمي', 'error');
  }
}

// تحديث إحصائيات السعة
function updateCapacityStats() {
  document.getElementById('level1-managers-count').textContent = capacityStats.level1_manager_count || 0;
  document.getElementById('level2-managers-count').textContent = capacityStats.level2_manager_count || 0;
  document.getElementById('employees-count').textContent = capacityStats.employee_count || 0;
  document.getElementById('assigned-customers-count').textContent = capacityStats.customers_assigned || 0;
}

// تحميل التنبيهات النشطة
async function loadCapacityAlerts() {
  try {
    const response = await axios.get('/api/capacity/alerts');
    const alerts = response.data;
    
    const alertsContainer = document.getElementById('capacity-alerts');
    
    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="text-green-600 text-center py-4">
          <i class="fas fa-check-circle text-2xl mb-2"></i>
          <p>لا توجد تنبيهات سعة نشطة</p>
        </div>
      `;
      return;
    }

    alertsContainer.innerHTML = alerts.map(alert => `
      <div class="bg-white border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <div class="flex items-center">
          <div class="p-2 rounded-full bg-red-100 ml-3">
            <i class="fas ${getAlertIcon(alert.alert_type)} text-red-600"></i>
          </div>
          <div>
            <p class="font-medium text-gray-900">${alert.message}</p>
            <p class="text-sm text-gray-500">
              ${formatDate(alert.created_at)} - ${getAlertTypeText(alert.alert_type)}
            </p>
          </div>
        </div>
        <button 
          class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          onclick="resolveAlert(${alert.id})"
        >
          حل
        </button>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
}

// الحصول على أيقونة التنبيه
function getAlertIcon(alertType) {
  switch(alertType) {
    case 'needs_level2_manager': return 'fa-user-plus';
    case 'needs_employee': return 'fa-users';
    case 'capacity_full': return 'fa-exclamation-triangle';
    default: return 'fa-bell';
  }
}

// الحصول على نص نوع التنبيه
function getAlertTypeText(alertType) {
  switch(alertType) {
    case 'needs_level2_manager': return 'يحتاج مدير أول إضافي';
    case 'needs_employee': return 'يحتاج مدير مستوى ثاني إضافي';
    case 'capacity_full': return 'السعة ممتلئة';
    default: return 'تنبيه عام';
  }
}

// حل تنبيه
async function resolveAlert(alertId) {
  try {
    await axios.post(`/api/capacity/alerts/${alertId}/resolve`);
    showNotification('تم حل التنبيه بنجاح', 'success');
    await loadCapacityAlerts();
  } catch (error) {
    console.error('Error resolving alert:', error);
    showNotification('خطأ في حل التنبيه', 'error');
  }
}

// فحص السعة وإنشاء تنبيهات
async function checkCapacityAlerts() {
  try {
    const response = await axios.post('/api/capacity/check');
    showNotification(`تم فحص السعة - تم إنشاء ${response.data.count} تنبيه`, 'success');
    await loadCapacityAlerts();
  } catch (error) {
    console.error('Error checking capacity:', error);
    showNotification('خطأ في فحص السعة', 'error');
  }
}

// توزيع العملاء غير المربوطين
async function distributeCustomers() {
  try {
    const response = await axios.post('/api/capacity/distribute');
    showNotification(response.data.message, 'success');
    await loadOrganizationData();
  } catch (error) {
    console.error('Error distributing customers:', error);
    showNotification('خطأ في توزيع العملاء', 'error');
  }
}

// تحديث النظرة العامة
function updateOrganizationOverview() {
  if (!organizationData.level1_manager) return;

  // إنشاء خريطة الهيكل التنظيمي
  const orgChart = document.getElementById('org-chart');
  orgChart.innerHTML = `
    <div class="space-y-4">
      <!-- المدير الأول -->
      <div class="text-center">
        <div class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg">
          <i class="fas fa-crown ml-2"></i>
          ${organizationData.level1_manager.name}
          <br>
          <span class="text-xs">مدير المستوى الأول</span>
        </div>
      </div>
      
      <!-- مديرين المستوى الثاني -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        ${organizationData.level2_managers.map(manager => `
          <div class="bg-green-600 text-white px-2 py-1 rounded text-center">
            <i class="fas fa-user-tie"></i>
            ${manager.name}
            <br>
            <span class="text-xs">${manager.employees_count} موظف</span>
          </div>
        `).join('')}
      </div>
      
      <!-- إحصائية الموظفين -->
      <div class="text-center text-sm text-gray-600">
        <i class="fas fa-users ml-1"></i>
        إجمالي ${organizationData.employees.length} موظف يتابعون ${capacityStats.customers_assigned} عميل
      </div>
    </div>
  `;

  // الإحصائيات المفصلة
  const detailedStats = document.getElementById('detailed-stats');
  detailedStats.innerHTML = `
    <div class="space-y-3">
      <div class="flex justify-between items-center py-2 border-b">
        <span class="text-gray-600">الحد الأقصى للعملاء لكل موظف:</span>
        <span class="font-bold text-blue-600">${organizationData.limits?.CUSTOMERS_PER_EMPLOYEE || 500}</span>
      </div>
      
      <div class="flex justify-between items-center py-2 border-b">
        <span class="text-gray-600">الحد الأقصى للموظفين لكل مدير مستوى ثاني:</span>
        <span class="font-bold text-green-600">${organizationData.limits?.EMPLOYEES_PER_LEVEL2_MANAGER || 7}</span>
      </div>
      
      <div class="flex justify-between items-center py-2 border-b">
        <span class="text-gray-600">الحد الأقصى للمديرين مستوى ثاني لكل مدير أول:</span>
        <span class="font-bold text-purple-600">${organizationData.limits?.LEVEL2_MANAGERS_PER_LEVEL1_MANAGER || 7}</span>
      </div>
      
      <div class="flex justify-between items-center py-2 border-b">
        <span class="text-gray-600">العملاء غير المربوطين:</span>
        <span class="font-bold ${capacityStats.customers_unassigned > 0 ? 'text-red-600' : 'text-green-600'}">
          ${capacityStats.customers_unassigned}
        </span>
      </div>
      
      <div class="flex justify-between items-center py-2">
        <span class="text-gray-600">معدل الإشغال:</span>
        <span class="font-bold text-blue-600">
          ${Math.round((capacityStats.customers_assigned / (capacityStats.employee_count * 500)) * 100)}%
        </span>
      </div>
    </div>
  `;
}

// تحميل قائمة الموظفين
async function loadEmployeesList() {
  try {
    const response = await axios.get('/api/employees');
    const employees = response.data;
    
    const employeesList = document.getElementById('employees-list');
    
    if (employees.length === 0) {
      employeesList.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-user-plus text-4xl mb-4"></i>
          <p>لا توجد موظفين مضافين</p>
        </div>
      `;
      return;
    }

    employeesList.innerHTML = `
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدير المباشر</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد العملاء</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعة</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التواصل</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${employees.map(employee => {
            const capacityPercentage = Math.round((employee.customers_count / 500) * 100);
            const capacityColor = capacityPercentage > 80 ? 'text-red-600' : capacityPercentage > 60 ? 'text-yellow-600' : 'text-green-600';
            
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="fas fa-user text-gray-400 ml-3"></i>
                    <div>
                      <div class="text-sm font-medium text-gray-900">${employee.name}</div>
                      ${employee.email ? `<div class="text-sm text-gray-500">${employee.email}</div>` : ''}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${employee.manager_name || 'غير محدد'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${employee.customers_count}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                      <div class="bg-blue-600 h-2 rounded-full" style="width: ${capacityPercentage}%"></div>
                    </div>
                    <span class="text-sm font-medium ${capacityColor}">${capacityPercentage}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  ${employee.phone ? `
                    <a href="tel:${employee.phone}" class="text-blue-600 hover:text-blue-900">
                      <i class="fas fa-phone ml-1"></i>
                      ${employee.phone}
                    </a>
                  ` : 'لا يوجد رقم'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
  } catch (error) {
    console.error('Error loading employees:', error);
    showNotification('خطأ في تحميل قائمة الموظفين', 'error');
  }
}

// تحميل قائمة المديرين
async function loadManagersList() {
  try {
    const response = await axios.get('/api/level2-managers');
    const managers = response.data;
    
    const managersList = document.getElementById('managers-list');
    
    if (managers.length === 0) {
      managersList.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-user-tie text-4xl mb-4"></i>
          <p>لا توجد مديرين مضافين</p>
        </div>
      `;
      return;
    }

    managersList.innerHTML = `
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدير الأعلى</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الموظفين</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي العملاء</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التواصل</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${managers.map(manager => `
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <i class="fas fa-user-tie text-gray-400 ml-3"></i>
                  <div>
                    <div class="text-sm font-medium text-gray-900">${manager.name}</div>
                    ${manager.email ? `<div class="text-sm text-gray-500">${manager.email}</div>` : ''}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${manager.level1_manager_name || 'غير محدد'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${manager.employees_count}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${manager.total_customers_count}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${manager.phone ? `
                  <a href="tel:${manager.phone}" class="text-blue-600 hover:text-blue-900">
                    <i class="fas fa-phone ml-1"></i>
                    ${manager.phone}
                  </a>
                ` : 'لا يوجد رقم'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
  } catch (error) {
    console.error('Error loading managers:', error);
    showNotification('خطأ في تحميل قائمة المديرين', 'error');
  }
}

// إدارة التبويبات الفرعية للهيكل التنظيمي
document.addEventListener('DOMContentLoaded', function() {
  // التبويبات الفرعية للهيكل التنظيمي
  const orgTabButtons = document.querySelectorAll('.org-tab-btn');
  const orgTabContents = document.querySelectorAll('.org-tab-content');

  orgTabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.dataset.orgTab;
      
      // إخفاء جميع المحتويات
      orgTabContents.forEach(content => {
        content.classList.add('hidden');
      });
      
      // إزالة التفعيل من جميع الأزرار
      orgTabButtons.forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
      });
      
      // تفعيل التبويب المحدد
      this.classList.remove('border-transparent', 'text-gray-500');
      this.classList.add('border-blue-500', 'text-blue-600');
      
      // إظهار المحتوى المحدد
      const targetContent = document.getElementById(`${targetTab}-org-tab`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        
        // تحميل البيانات حسب التبويب
        switch(targetTab) {
          case 'employees':
            loadEmployeesList();
            break;
          case 'managers':
            loadManagersList();
            break;
          case 'reports':
            // TODO: تحميل التقارير
            break;
        }
      }
    });
  });
});

// فتح modal إضافة موظف
function openAddEmployeeModal() {
  // TODO: إنشاء modal لإضافة موظف جديد
  showNotification('سيتم إضافة modal إضافة الموظف قريباً', 'info');
}

// فتح modal إضافة مدير
function openAddManagerModal() {
  // TODO: إنشاء modal لإضافة مدير جديد
  showNotification('سيتم إضافة modal إضافة المدير قريباً', 'info');
}

// تحميل البيانات عند فتح تبويب الهيكل التنظيمي
window.loadOrganizationData = loadOrganizationData;
window.checkCapacityAlerts = checkCapacityAlerts;
window.distributeCustomers = distributeCustomers;