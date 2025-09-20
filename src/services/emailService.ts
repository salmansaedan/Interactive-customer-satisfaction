/**
 * خدمة إرسال البريد الإلكتروني باستخدام Resend API
 * تدعم إرسال استطلاعات الرضا والإشعارات للعملاء
 */

export interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
  appUrl: string;
  appName: string;
  companyName: string;
}

export interface SatisfactionSurveyData {
  customerName: string;
  customerEmail: string;
  ticketTitle: string;
  ticketId: number;
  surveyToken: string;
}

export interface NotificationData {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * إرسال استطلاع رضا للعميل
   */
  async sendSatisfactionSurvey(data: SatisfactionSurveyData): Promise<boolean> {
    try {
      const surveyUrl = `${this.config.appUrl}/survey/${data.surveyToken}`;
      
      const emailContent = this.generateSurveyEmailHTML(data, surveyUrl);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.config.appName} <${this.config.fromEmail}>`,
          to: [data.customerEmail],
          subject: `استطلاع رضا - ${data.ticketTitle}`,
          html: emailContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('فشل إرسال البريد الإلكتروني:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('تم إرسال البريد الإلكتروني بنجاح:', result.id);
      return true;

    } catch (error) {
      console.error('خطأ في إرسال البريد الإلكتروني:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار للعميل
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const emailContent = this.generateNotificationEmailHTML(data);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.config.appName} <${this.config.fromEmail}>`,
          to: [data.customerEmail],
          subject: data.subject,
          html: emailContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('فشل إرسال الإشعار:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('تم إرسال الإشعار بنجاح:', result.id);
      return true;

    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  /**
   * إنشاء محتوى HTML لاستطلاع الرضا
   */
  private generateSurveyEmailHTML(data: SatisfactionSurveyData, surveyUrl: string): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>استطلاع رضا العملاء - ${this.config.appName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .ticket-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-right: 4px solid #667eea;
        }
        .question {
            font-size: 24px;
            color: #333;
            margin: 30px 0;
            font-weight: 600;
        }
        .rating-buttons {
            margin: 40px 0;
        }
        .rating-btn {
            display: inline-block;
            font-size: 80px;
            margin: 0 20px;
            text-decoration: none;
            transition: transform 0.2s ease;
            padding: 10px;
            border-radius: 10px;
        }
        .rating-btn:hover {
            transform: scale(1.1);
            background-color: #f0f0f0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .company-name {
            font-weight: bold;
            color: #667eea;
        }
        @media (max-width: 600px) {
            .rating-btn {
                font-size: 60px;
                margin: 0 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌟 ${this.config.appName}</h1>
            <p>نقدر رأيك ويهمنا رضاك</p>
        </div>
        
        <div class="content">
            <h2>مرحباً ${data.customerName},</h2>
            
            <div class="ticket-info">
                <h3>📋 تفاصيل الخدمة</h3>
                <p><strong>الموضوع:</strong> ${data.ticketTitle}</p>
                <p><strong>رقم التذكرة:</strong> #${data.ticketId}</p>
            </div>
            
            <div class="question">
                ما مدى رضاك عن الخدمة التي تلقيتها؟
            </div>
            
            <div class="rating-buttons">
                <a href="${surveyUrl}?rating=1" class="rating-btn" title="غير راضٍ">😞</a>
                <a href="${surveyUrl}?rating=2" class="rating-btn" title="محايد">😐</a>
                <a href="${surveyUrl}?rating=3" class="rating-btn" title="راضٍ جداً">😊</a>
            </div>
            
            <p style="color: #666; font-size: 16px; margin-top: 30px;">
                انقر على الوجه الذي يعبر عن مستوى رضاك<br>
                تقييمك يساعدنا على تحسين خدماتنا
            </p>
        </div>
        
        <div class="footer">
            <p>
                مع تحيات فريق <span class="company-name">${this.config.companyName}</span><br>
                هذا البريد الإلكتروني تم إرساله تلقائياً، لا تحتاج للرد عليه
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * إنشاء محتوى HTML للإشعارات
   */
  private generateNotificationEmailHTML(data: NotificationData): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject} - ${this.config.appName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
        }
        .message {
            font-size: 16px;
            color: #333;
            margin: 20px 0;
        }
        .action-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 5px;
            text-decoration: none;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📢 ${this.config.appName}</h1>
        </div>
        
        <div class="content">
            <h2>مرحباً ${data.customerName},</h2>
            <div class="message">${data.message}</div>
            
            ${data.actionUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.actionUrl}" class="action-button">
                        ${data.actionText || 'اضغط هنا'}
                    </a>
                </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>
                مع تحيات فريق <strong>${this.config.companyName}</strong><br>
                للتواصل: ${this.config.fromEmail}
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}

/**
 * إنشاء instance من خدمة البريد الإلكتروني باستخدام متغيرات البيئة
 */
export function createEmailService(env: any): EmailService {
  const config: EmailConfig = {
    resendApiKey: env.RESEND_API_KEY || 're_demo_key',
    fromEmail: env.FROM_EMAIL || 'noreply@example.com',
    appUrl: env.APP_URL || 'http://localhost:3000',
    appName: env.APP_NAME || 'عميلي أولاً',
    companyName: env.COMPANY_NAME || 'الشركة',
  };

  return new EmailService(config);
}