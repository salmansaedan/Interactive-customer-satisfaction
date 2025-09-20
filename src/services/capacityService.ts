// خدمة مراقبة السعة التنظيمية
// Organizational Capacity Monitoring Service

interface CapacityLimits {
  CUSTOMERS_PER_EMPLOYEE: number;
  EMPLOYEES_PER_LEVEL2_MANAGER: number;
  LEVEL2_MANAGERS_PER_LEVEL1_MANAGER: number;
}

interface CapacityAlert {
  id?: number;
  alert_type: 'needs_level2_manager' | 'needs_employee' | 'capacity_full';
  level1_manager_id?: number;
  level2_manager_id?: number;
  employee_id?: number;
  current_count: number;
  capacity_limit: number;
  message: string;
  is_resolved: boolean;
  created_at?: string;
  resolved_at?: string;
}

interface CapacityStats {
  level1_manager_count: number;
  level2_manager_count: number;
  employee_count: number;
  customer_count: number;
  customers_assigned: number;
  customers_unassigned: number;
}

class CapacityService {
  private static readonly LIMITS: CapacityLimits = {
    CUSTOMERS_PER_EMPLOYEE: 500,
    EMPLOYEES_PER_LEVEL2_MANAGER: 7,
    LEVEL2_MANAGERS_PER_LEVEL1_MANAGER: 7
  };

  // الحصول على إحصائيات السعة الحالية
  // Get current capacity statistics
  static async getCapacityStats(db: D1Database): Promise<CapacityStats> {
    try {
      // عدد المديرين من المستوى الأول
      const level1Count = await db.prepare(`
        SELECT COUNT(*) as count FROM level1_managers WHERE is_active = 1
      `).first();

      // عدد المديرين من المستوى الثاني
      const level2Count = await db.prepare(`
        SELECT COUNT(*) as count FROM level2_managers WHERE is_active = 1
      `).first();

      // عدد الموظفين
      const employeeCount = await db.prepare(`
        SELECT COUNT(*) as count FROM employees WHERE is_active = 1
      `).first();

      // عدد العملاء الإجمالي
      const customerCount = await db.prepare(`
        SELECT COUNT(*) as count FROM customers
      `).first();

      // عدد العملاء المربوطين بموظفين
      const assignedCustomers = await db.prepare(`
        SELECT COUNT(*) as count FROM customers WHERE employee_id IS NOT NULL
      `).first();

      return {
        level1_manager_count: level1Count?.count || 0,
        level2_manager_count: level2Count?.count || 0,
        employee_count: employeeCount?.count || 0,
        customer_count: customerCount?.count || 0,
        customers_assigned: assignedCustomers?.count || 0,
        customers_unassigned: (customerCount?.count || 0) - (assignedCustomers?.count || 0)
      };
    } catch (error) {
      console.error('Error getting capacity stats:', error);
      throw new Error('Failed to get capacity statistics');
    }
  }

  // فحص السعة وإنشاء التنبيهات
  // Check capacity and generate alerts
  static async checkCapacityAndGenerateAlerts(db: D1Database): Promise<CapacityAlert[]> {
    const alerts: CapacityAlert[] = [];

    try {
      // فحص سعة الموظفين (500 عميل لكل موظف)
      // Check employee capacity (500 customers per employee)
      const employeeCapacity = await db.prepare(`
        SELECT 
          e.id,
          e.name,
          e.level2_manager_id,
          COUNT(c.id) as customer_count
        FROM employees e
        LEFT JOIN customers c ON c.employee_id = e.id
        WHERE e.is_active = 1
        GROUP BY e.id, e.name, e.level2_manager_id
        HAVING COUNT(c.id) >= ?
      `).bind(this.LIMITS.CUSTOMERS_PER_EMPLOYEE * 0.8).all(); // تنبيه عند 80% من السعة

      for (const emp of employeeCapacity.results) {
        alerts.push({
          alert_type: 'capacity_full',
          employee_id: emp.id,
          level2_manager_id: emp.level2_manager_id,
          current_count: emp.customer_count,
          capacity_limit: this.LIMITS.CUSTOMERS_PER_EMPLOYEE,
          message: `الموظف ${emp.name} يتابع ${emp.customer_count} عميل من أصل ${this.LIMITS.CUSTOMERS_PER_EMPLOYEE} (${Math.round((emp.customer_count / this.LIMITS.CUSTOMERS_PER_EMPLOYEE) * 100)}%)`,
          is_resolved: false
        });
      }

      // فحص سعة مديري المستوى الثاني (7 موظفين لكل مدير)
      // Check level 2 manager capacity (7 employees per manager)
      const level2Capacity = await db.prepare(`
        SELECT 
          lm.id,
          lm.name,
          lm.level1_manager_id,
          COUNT(e.id) as employee_count
        FROM level2_managers lm
        LEFT JOIN employees e ON e.level2_manager_id = lm.id AND e.is_active = 1
        WHERE lm.is_active = 1
        GROUP BY lm.id, lm.name, lm.level1_manager_id
        HAVING COUNT(e.id) >= ?
      `).bind(this.LIMITS.EMPLOYEES_PER_LEVEL2_MANAGER).all();

      for (const manager of level2Capacity.results) {
        alerts.push({
          alert_type: 'needs_employee',
          level2_manager_id: manager.id,
          level1_manager_id: manager.level1_manager_id,
          current_count: manager.employee_count,
          capacity_limit: this.LIMITS.EMPLOYEES_PER_LEVEL2_MANAGER,
          message: `المدير ${manager.name} يدير ${manager.employee_count} موظف من أصل ${this.LIMITS.EMPLOYEES_PER_LEVEL2_MANAGER} - يحتاج لمدير مستوى ثاني إضافي`,
          is_resolved: false
        });
      }

      // فحص سعة المدير من المستوى الأول (7 مديرين مستوى ثاني)
      // Check level 1 manager capacity (7 level 2 managers)
      const level1Capacity = await db.prepare(`
        SELECT 
          lm1.id,
          lm1.name,
          COUNT(lm2.id) as manager_count
        FROM level1_managers lm1
        LEFT JOIN level2_managers lm2 ON lm2.level1_manager_id = lm1.id AND lm2.is_active = 1
        WHERE lm1.is_active = 1
        GROUP BY lm1.id, lm1.name
        HAVING COUNT(lm2.id) >= ?
      `).bind(this.LIMITS.LEVEL2_MANAGERS_PER_LEVEL1_MANAGER).all();

      for (const manager of level1Capacity.results) {
        alerts.push({
          alert_type: 'needs_level2_manager',
          level1_manager_id: manager.id,
          current_count: manager.manager_count,
          capacity_limit: this.LIMITS.LEVEL2_MANAGERS_PER_LEVEL1_MANAGER,
          message: `المدير الأول ${manager.name} يدير ${manager.manager_count} مدير مستوى ثاني من أصل ${this.LIMITS.LEVEL2_MANAGERS_PER_LEVEL1_MANAGER} - يحتاج لمدير أول إضافي`,
          is_resolved: false
        });
      }

      // حفظ التنبيهات في قاعدة البيانات
      // Save alerts to database
      for (const alert of alerts) {
        await this.saveAlert(db, alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking capacity:', error);
      throw new Error('Failed to check organizational capacity');
    }
  }

  // حفظ تنبيه في قاعدة البيانات
  // Save alert to database
  private static async saveAlert(db: D1Database, alert: CapacityAlert): Promise<void> {
    try {
      // تحقق من وجود تنبيه مشابه غير محلول
      // Check for existing unresolved similar alert
      const existingAlert = await db.prepare(`
        SELECT id FROM capacity_alerts 
        WHERE alert_type = ? 
        AND level1_manager_id IS ? 
        AND level2_manager_id IS ? 
        AND employee_id IS ? 
        AND is_resolved = 0
      `).bind(
        alert.alert_type,
        alert.level1_manager_id || null,
        alert.level2_manager_id || null,
        alert.employee_id || null
      ).first();

      if (!existingAlert) {
        await db.prepare(`
          INSERT INTO capacity_alerts (
            alert_type, level1_manager_id, level2_manager_id, employee_id,
            current_count, capacity_limit, message, is_resolved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          alert.alert_type,
          alert.level1_manager_id || null,
          alert.level2_manager_id || null,
          alert.employee_id || null,
          alert.current_count,
          alert.capacity_limit,
          alert.message,
          alert.is_resolved ? 1 : 0
        ).run();
      }
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  }

  // الحصول على التنبيهات النشطة
  // Get active alerts
  static async getActiveAlerts(db: D1Database): Promise<CapacityAlert[]> {
    try {
      const result = await db.prepare(`
        SELECT 
          ca.*,
          lm1.name as level1_manager_name,
          lm2.name as level2_manager_name,
          e.name as employee_name
        FROM capacity_alerts ca
        LEFT JOIN level1_managers lm1 ON lm1.id = ca.level1_manager_id
        LEFT JOIN level2_managers lm2 ON lm2.id = ca.level2_manager_id
        LEFT JOIN employees e ON e.id = ca.employee_id
        WHERE ca.is_resolved = 0
        ORDER BY ca.created_at DESC
      `).all();

      return result.results.map((alert: any) => ({
        id: alert.id,
        alert_type: alert.alert_type,
        level1_manager_id: alert.level1_manager_id,
        level2_manager_id: alert.level2_manager_id,
        employee_id: alert.employee_id,
        current_count: alert.current_count,
        capacity_limit: alert.capacity_limit,
        message: alert.message,
        is_resolved: !!alert.is_resolved,
        created_at: alert.created_at,
        resolved_at: alert.resolved_at
      }));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw new Error('Failed to get active alerts');
    }
  }

  // حل تنبيه
  // Resolve alert
  static async resolveAlert(db: D1Database, alertId: number): Promise<void> {
    try {
      await db.prepare(`
        UPDATE capacity_alerts 
        SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(alertId).run();
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  }

  // توزيع العملاء غير المربوطين على الموظفين المتاحين
  // Distribute unassigned customers to available employees
  static async distributeUnassignedCustomers(db: D1Database): Promise<{ assigned: number; message: string }> {
    try {
      // الحصول على العملاء غير المربوطين
      // Get unassigned customers
      const unassignedCustomers = await db.prepare(`
        SELECT id FROM customers WHERE employee_id IS NULL LIMIT 100
      `).all();

      if (unassignedCustomers.results.length === 0) {
        return { assigned: 0, message: 'لا توجد عملاء غير مربوطين' };
      }

      // الحصول على الموظفين المتاحين (أقل من 500 عميل)
      // Get available employees (less than 500 customers)
      const availableEmployees = await db.prepare(`
        SELECT 
          e.id,
          e.name,
          COUNT(c.id) as customer_count
        FROM employees e
        LEFT JOIN customers c ON c.employee_id = e.id
        WHERE e.is_active = 1
        GROUP BY e.id, e.name
        HAVING COUNT(c.id) < ?
        ORDER BY COUNT(c.id) ASC
      `).bind(this.LIMITS.CUSTOMERS_PER_EMPLOYEE).all();

      if (availableEmployees.results.length === 0) {
        return { assigned: 0, message: 'جميع الموظفين وصلوا للحد الأقصى من العملاء' };
      }

      let assignedCount = 0;
      let employeeIndex = 0;

      // توزيع العملاء على الموظفين المتاحين
      // Distribute customers to available employees
      for (const customer of unassignedCustomers.results) {
        const employee = availableEmployees.results[employeeIndex];
        
        await db.prepare(`
          UPDATE customers SET employee_id = ? WHERE id = ?
        `).bind(employee.id, customer.id).run();

        assignedCount++;

        // التنقل للموظف التالي (توزيع متوازن)
        // Move to next employee (balanced distribution)
        employeeIndex = (employeeIndex + 1) % availableEmployees.results.length;
      }

      return { 
        assigned: assignedCount, 
        message: `تم ربط ${assignedCount} عميل بالموظفين المتاحين` 
      };
    } catch (error) {
      console.error('Error distributing customers:', error);
      throw new Error('Failed to distribute unassigned customers');
    }
  }

  // الحصول على تقرير مفصل للهيكل التنظيمي
  // Get detailed organizational structure report
  static async getOrganizationalReport(db: D1Database) {
    try {
      // المدير من المستوى الأول مع مديريه
      const level1Manager = await db.prepare(`
        SELECT 
          lm1.*,
          COUNT(DISTINCT lm2.id) as level2_managers_count,
          COUNT(DISTINCT e.id) as total_employees_count,
          COUNT(DISTINCT c.id) as total_customers_count
        FROM level1_managers lm1
        LEFT JOIN level2_managers lm2 ON lm2.level1_manager_id = lm1.id AND lm2.is_active = 1
        LEFT JOIN employees e ON e.level2_manager_id = lm2.id AND e.is_active = 1
        LEFT JOIN customers c ON c.employee_id = e.id
        WHERE lm1.is_active = 1
        GROUP BY lm1.id
      `).first();

      // مديري المستوى الثاني مع موظفيهم
      const level2Managers = await db.prepare(`
        SELECT 
          lm2.*,
          COUNT(DISTINCT e.id) as employees_count,
          COUNT(DISTINCT c.id) as customers_count
        FROM level2_managers lm2
        LEFT JOIN employees e ON e.level2_manager_id = lm2.id AND e.is_active = 1
        LEFT JOIN customers c ON c.employee_id = e.id
        WHERE lm2.is_active = 1
        GROUP BY lm2.id
        ORDER BY lm2.name
      `).all();

      // الموظفين مع عملائهم
      const employees = await db.prepare(`
        SELECT 
          e.*,
          lm2.name as manager_name,
          COUNT(c.id) as customers_count,
          ROUND((COUNT(c.id) * 100.0) / ?, 1) as capacity_percentage
        FROM employees e
        LEFT JOIN level2_managers lm2 ON lm2.id = e.level2_manager_id
        LEFT JOIN customers c ON c.employee_id = e.id
        WHERE e.is_active = 1
        GROUP BY e.id
        ORDER BY e.name
      `).bind(this.LIMITS.CUSTOMERS_PER_EMPLOYEE).all();

      return {
        level1_manager: level1Manager,
        level2_managers: level2Managers.results,
        employees: employees.results,
        limits: this.LIMITS
      };
    } catch (error) {
      console.error('Error getting organizational report:', error);
      throw new Error('Failed to get organizational report');
    }
  }
}

export default CapacityService;