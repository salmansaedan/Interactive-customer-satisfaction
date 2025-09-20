/**
 * خدمة التنبيهات الاستباقية لمراقبة صحة العملاء
 * تقوم بتحليل بيانات العملاء وإرسال تنبيهات للفريق والعملاء
 */

import { createEmailService, EmailService } from './emailService';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  health_score: number;
  health_status: 'healthy' | 'needs_attention' | 'at_risk';
  last_interaction_at?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  customerId: number;
  type: 'health_decline' | 'no_interaction' | 'multiple_complaints' | 'low_satisfaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  createdAt: string;
}

export class AlertService {
  private emailService: EmailService;
  private db: D1Database;

  constructor(db: D1Database, env: any) {
    this.db = db;
    this.emailService = createEmailService(env);
  }

  /**
   * فحص جميع العملاء وإنشاء التنبيهات اللازمة
   */
  async checkAllCustomers(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    try {
      // الحصول على جميع العملاء
      const customers = await this.db.prepare(`
        SELECT * FROM customers ORDER BY health_score ASC
      `).all();

      for (const customer of customers.results as Customer[]) {
        const customerAlerts = await this.analyzeCustomer(customer);
        alerts.push(...customerAlerts);
      }

      return alerts;
    } catch (error) {
      console.error('خطأ في فحص العملاء:', error);
      return [];
    }
  }

  /**
   * تحليل عميل واحد وإنشاء التنبيهات المناسبة
   */
  private async analyzeCustomer(customer: Customer): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // تنبيه صحة العميل منخفضة
    if (customer.health_score < 4) {
      alerts.push({
        id: `health_${customer.id}_${Date.now()}`,
        customerId: customer.id,
        type: 'health_decline',
        severity: customer.health_score < 2 ? 'critical' : 'high',
        message: `مؤشر صحة العميل ${customer.name} منخفض: ${customer.health_score}/10`,
        actionRequired: 'تواصل فوري مع العميل لحل المشاكل المعلقة',
        createdAt: new Date().toISOString()
      });
    }

    // تنبيه عدم التفاعل لفترة طويلة
    if (customer.last_interaction_at) {
      const daysSinceLastInteraction = this.getDaysSince(customer.last_interaction_at);
      
      if (daysSinceLastInteraction > 30) {
        alerts.push({
          id: `interaction_${customer.id}_${Date.now()}`,
          customerId: customer.id,
          type: 'no_interaction',
          severity: daysSinceLastInteraction > 90 ? 'high' : 'medium',
          message: `لم يتم التفاعل مع العميل ${customer.name} منذ ${daysSinceLastInteraction} يوم`,
          actionRequired: 'جدولة مكالمة متابعة أو إرسال رسالة ترحيب',
          createdAt: new Date().toISOString()
        });
      }
    }

    // تنبيه الشكاوى المتعددة
    const openComplaints = await this.getOpenComplaints(customer.id);
    if (openComplaints > 2) {
      alerts.push({
        id: `complaints_${customer.id}_${Date.now()}`,
        customerId: customer.id,
        type: 'multiple_complaints',
        severity: 'high',
        message: `العميل ${customer.name} لديه ${openComplaints} شكوى مفتوحة`,
        actionRequired: 'مراجعة عاجلة للشكاوى المفتوحة وحلها بأسرع وقت',
        createdAt: new Date().toISOString()
      });
    }

    // تنبيه رضا منخفض
    const avgSatisfaction = await this.getCustomerSatisfaction(customer.id);
    if (avgSatisfaction !== null && avgSatisfaction < 2) {
      alerts.push({
        id: `satisfaction_${customer.id}_${Date.now()}`,
        customerId: customer.id,
        type: 'low_satisfaction',
        severity: 'critical',
        message: `متوسط رضا العميل ${customer.name} منخفض: ${avgSatisfaction}/3`,
        actionRequired: 'اتصال فوري من المدير لمعرفة أسباب عدم الرضا وحلها',
        createdAt: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * إرسال تنبيهات للفريق الداخلي
   */
  async sendTeamAlerts(alerts: Alert[]): Promise<boolean> {
    if (alerts.length === 0) return true;

    const highPriorityAlerts = alerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'high'
    );

    if (highPriorityAlerts.length === 0) return true;

    try {
      // في بيئة حقيقية، سنرسل لفريق الدعم
      // هنا سنستخدم البريد المُكوَّن في البيئة
      const teamEmail = 'info@salmansaedan.com'; // يمكن جعله متغير بيئة

      const alertsHTML = this.generateTeamAlertsHTML(highPriorityAlerts);
      
      const success = await this.emailService.sendNotification({
        customerName: 'فريق الدعم',
        customerEmail: teamEmail,
        subject: `🚨 تنبيهات عاجلة لصحة العملاء - ${highPriorityAlerts.length} تنبيه`,
        message: alertsHTML,
      });

      return success;
    } catch (error) {
      console.error('خطأ في إرسال تنبيهات الفريق:', error);
      return false;
    }
  }

  /**
   * إرسال رسالة استباقية للعميل
   */
  async sendProactiveMessage(customerId: number, type: 'check_in' | 'welcome_back'): Promise<boolean> {
    try {
      const customer = await this.db.prepare(
        'SELECT * FROM customers WHERE id = ?'
      ).bind(customerId).first() as Customer;

      if (!customer) return false;

      const messages = {
        check_in: {
          subject: 'كيف حالك؟ نهتم بتجربتك معنا',
          message: `
            <h2>مرحباً ${customer.name}،</h2>
            <p>نتواصل معك للتأكد من أن تجربتك مع خدماتنا تسير على أكمل وجه.</p>
            <p>إذا كان لديك أي استفسارات أو تحتاج أي مساعدة، فلا تتردد في التواصل معنا.</p>
            <p>رضاك هو أولويتنا القصوى! 🌟</p>
          `,
          actionUrl: 'tel:0533361154',
          actionText: 'اتصل بنا الآن'
        },
        welcome_back: {
          subject: 'نشتاق إليك! عروض خاصة في انتظارك',
          message: `
            <h2>أهلاً وسهلاً ${customer.name}،</h2>
            <p>لاحظنا أنك لم تتفاعل معنا منذ فترة، ونحن نشتاق إليك!</p>
            <p>لدينا تحديثات وعروض جديدة قد تهمك.</p>
            <p>نحن هنا دائماً لخدمتك، ونتطلع لسماع أخبارك قريباً! 💙</p>
          `,
          actionUrl: 'mailto:info@salmansaedan.com',
          actionText: 'تواصل معنا'
        }
      };

      const messageData = messages[type];
      
      const success = await this.emailService.sendNotification({
        customerName: customer.name,
        customerEmail: customer.email,
        subject: messageData.subject,
        message: messageData.message,
        actionUrl: messageData.actionUrl,
        actionText: messageData.actionText,
      });

      // تحديث تاريخ آخر تفاعل
      if (success) {
        await this.db.prepare(
          'UPDATE customers SET last_interaction_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(customerId).run();
      }

      return success;
    } catch (error) {
      console.error('خطأ في إرسال رسالة استباقية:', error);
      return false;
    }
  }

  /**
   * دوال مساعدة
   */
  private getDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async getOpenComplaints(customerId: number): Promise<number> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count FROM tickets 
      WHERE customer_id = ? AND status IN ('new', 'in_progress', 'waiting_customer')
    `).bind(customerId).first();
    
    return result?.count || 0;
  }

  private async getCustomerSatisfaction(customerId: number): Promise<number | null> {
    const result = await this.db.prepare(`
      SELECT AVG(rating) as avg FROM satisfaction_surveys 
      WHERE customer_id = ? AND rating IS NOT NULL
    `).bind(customerId).first();
    
    return result?.avg || null;
  }

  private generateTeamAlertsHTML(alerts: Alert[]): string {
    return `
      <div style="font-family: Arial, sans-serif;">
        <h2>🚨 تنبيهات عاجلة لصحة العملاء</h2>
        <p>تم اكتشاف ${alerts.length} تنبيه يتطلب انتباهكم الفوري:</p>
        
        ${alerts.map(alert => `
          <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; 
                      border-right: 4px solid ${this.getSeverityColor(alert.severity)};">
            <h3 style="margin: 0 0 10px 0; color: ${this.getSeverityColor(alert.severity)};">
              ${this.getSeverityIcon(alert.severity)} ${alert.message}
            </h3>
            <p style="margin: 5px 0;"><strong>الإجراء المطلوب:</strong> ${alert.actionRequired}</p>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">
              📅 ${new Date(alert.createdAt).toLocaleString('ar-SA')}
            </p>
          </div>
        `).join('')}
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          هذا التنبيه تم إنشاؤه تلقائياً بواسطة نظام عميلي أولاً
        </p>
      </div>
    `;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      default: return '#059669';
    }
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  }
}

/**
 * إنشاء instance من خدمة التنبيهات
 */
export function createAlertService(db: D1Database, env: any): AlertService {
  return new AlertService(db, env);
}