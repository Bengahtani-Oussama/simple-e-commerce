import { sendEmail } from './sendEmail';

interface SectionDeactivationData {
  sectionId: string;
  sectionName: {
    ar: string;
    en: string;
    fr: string;
  };
  remainingProducts: number;
  minRequired: number;
  removedProducts: number;
  deactivatedAt: Date;
}

interface SectionLowStockData {
  sectionId: string;
  sectionName: {
    ar: string;
    en: string;
    fr: string;
  };
  currentProducts: number;
  minRequired: number;
  threshold: number; // e.g., 1 product away from minimum
}

interface CleanupSummaryData {
  totalCleaned: number;
  sectionsProcessed: number;
  deactivatedSections: number;
  cleanupDate: Date;
  details: Array<{
    sectionName: string;
    removedCount: number;
    status: string;
  }>;
}

/**
 * Email template for section deactivation
 */
export const getSectionDeactivationEmail = (
  data: SectionDeactivationData,
  lang: 'ar' | 'en' | 'fr' = 'en'
): string => {
  const content = {
    ar: {
      subject: 'تنبيه: تم إيقاف قسم المنتجات',
      title: '⚠️ تم إيقاف قسم تلقائياً',
      greeting: 'مرحباً',
      message: 'تم إيقاف أحد أقسام المنتجات تلقائياً بسبب نقص المنتجات المتاحة.',
      sectionName: 'اسم القسم',
      currentProducts: 'المنتجات المتبقية',
      minRequired: 'الحد الأدنى المطلوب',
      removedProducts: 'المنتجات المحذوفة',
      deactivatedAt: 'تاريخ الإيقاف',
      action: 'الإجراء المطلوب',
      actionText: 'يرجى إضافة منتجات جديدة لإعادة تفعيل القسم',
      viewSection: 'عرض القسم',
    },
    en: {
      subject: 'Alert: Product Section Deactivated',
      title: '⚠️ Section Automatically Deactivated',
      greeting: 'Hello Admin',
      message: 'A product section has been automatically deactivated due to insufficient available products.',
      sectionName: 'Section Name',
      currentProducts: 'Remaining Products',
      minRequired: 'Minimum Required',
      removedProducts: 'Products Removed',
      deactivatedAt: 'Deactivated At',
      action: 'Action Required',
      actionText: 'Please add new products to reactivate this section',
      viewSection: 'View Section',
    },
    fr: {
      subject: 'Alerte: Section de Produits Désactivée',
      title: '⚠️ Section Automatiquement Désactivée',
      greeting: 'Bonjour Admin',
      message: 'Une section de produits a été automatiquement désactivée en raison de produits disponibles insuffisants.',
      sectionName: 'Nom de la Section',
      currentProducts: 'Produits Restants',
      minRequired: 'Minimum Requis',
      removedProducts: 'Produits Supprimés',
      deactivatedAt: 'Désactivé Le',
      action: 'Action Requise',
      actionText: 'Veuillez ajouter de nouveaux produits pour réactiver cette section',
      viewSection: 'Voir la Section',
    },
  };

  const t = content[lang];
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .info-box {
          background: #FEF2F2;
          border-left: 4px solid #DC2626;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #6B7280;
        }
        .info-value {
          color: #111827;
          font-weight: 600;
        }
        .warning {
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #DC2626;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background: #B91C1C;
        }
        .footer {
          background: #F9FAFB;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${t.title}</h1>
        </div>
        <div class="content">
          <p>${t.greeting},</p>
          <p>${t.message}</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">${t.sectionName}:</span>
              <span class="info-value">${data.sectionName[lang]}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.currentProducts}:</span>
              <span class="info-value" style="color: #DC2626;">${data.remainingProducts}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.minRequired}:</span>
              <span class="info-value">${data.minRequired}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.removedProducts}:</span>
              <span class="info-value">${data.removedProducts}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.deactivatedAt}:</span>
              <span class="info-value">${data.deactivatedAt.toLocaleString()}</span>
            </div>
          </div>

          <div class="warning">
            <strong>${t.action}</strong><br>
            ${t.actionText}
          </div>

          <center>
            <a href="${adminUrl}/sections/${data.sectionId}" class="button">
              ${t.viewSection}
            </a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Algeria E-Commerce. All rights reserved.</p>
          <p>This is an automated notification from the section management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for low stock warning
 */
export const getSectionLowStockEmail = (
  data: SectionLowStockData,
  lang: 'ar' | 'en' | 'fr' = 'en'
): string => {
  const content = {
    ar: {
      subject: 'تحذير: قسم قريب من الحد الأدنى',
      title: '⚡ تحذير: مخزون منخفض',
      greeting: 'مرحباً',
      message: 'أحد أقسام المنتجات قريب من الحد الأدنى المطلوب.',
      sectionName: 'اسم القسم',
      currentProducts: 'المنتجات الحالية',
      minRequired: 'الحد الأدنى المطلوب',
      warning: 'تحذير',
      warningText: 'إذا تم نفاد مخزون منتج واحد آخر، سيتم إيقاف القسم تلقائياً.',
      action: 'يرجى إضافة منتجات جديدة في أقرب وقت ممكن',
      viewSection: 'عرض القسم',
    },
    en: {
      subject: 'Warning: Section Near Minimum Threshold',
      title: '⚡ Warning: Low Stock Alert',
      greeting: 'Hello Admin',
      message: 'A product section is approaching the minimum product threshold.',
      sectionName: 'Section Name',
      currentProducts: 'Current Products',
      minRequired: 'Minimum Required',
      warning: 'Warning',
      warningText: 'If one more product goes out of stock, this section will be automatically deactivated.',
      action: 'Please add new products as soon as possible',
      viewSection: 'View Section',
    },
    fr: {
      subject: 'Avertissement: Section Proche du Seuil Minimum',
      title: '⚡ Avertissement: Alerte Stock Faible',
      greeting: 'Bonjour Admin',
      message: 'Une section de produits approche du seuil minimum de produits.',
      sectionName: 'Nom de la Section',
      currentProducts: 'Produits Actuels',
      minRequired: 'Minimum Requis',
      warning: 'Avertissement',
      warningText: 'Si un autre produit est en rupture de stock, cette section sera automatiquement désactivée.',
      action: 'Veuillez ajouter de nouveaux produits dès que possible',
      viewSection: 'Voir la Section',
    },
  };

  const t = content[lang];
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .info-box {
          background: #FFFBEB;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #6B7280;
        }
        .info-value {
          color: #111827;
          font-weight: 600;
        }
        .warning {
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #F59E0B;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background: #D97706;
        }
        .footer {
          background: #F9FAFB;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${t.title}</h1>
        </div>
        <div class="content">
          <p>${t.greeting},</p>
          <p>${t.message}</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">${t.sectionName}:</span>
              <span class="info-value">${data.sectionName[lang]}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.currentProducts}:</span>
              <span class="info-value" style="color: #F59E0B;">${data.currentProducts}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.minRequired}:</span>
              <span class="info-value">${data.minRequired}</span>
            </div>
          </div>

          <div class="warning">
            <strong>${t.warning}</strong><br>
            ${t.warningText}<br><br>
            <strong>${t.action}</strong>
          </div>

          <center>
            <a href="${adminUrl}/sections/${data.sectionId}" class="button">
              ${t.viewSection}
            </a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Algeria E-Commerce. All rights reserved.</p>
          <p>This is an automated notification from the section management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for daily cleanup summary
 */
export const getCleanupSummaryEmail = (
  data: CleanupSummaryData,
  lang: 'ar' | 'en' | 'fr' = 'en'
): string => {
  const content = {
    ar: {
      subject: 'تقرير التنظيف اليومي للأقسام',
      title: '📊 تقرير التنظيف التلقائي',
      greeting: 'مرحباً',
      message: 'إليك ملخص عملية تنظيف الأقسام التلقائية.',
      summary: 'الملخص',
      totalCleaned: 'إجمالي المنتجات المحذوفة',
      sectionsProcessed: 'الأقسام المعالجة',
      deactivatedSections: 'الأقسام المعطلة',
      cleanupDate: 'تاريخ التنظيف',
      details: 'التفاصيل',
      noChanges: 'لم يتم إجراء أي تغييرات',
      viewDashboard: 'عرض لوحة التحكم',
    },
    en: {
      subject: 'Daily Section Cleanup Report',
      title: '📊 Automatic Cleanup Report',
      greeting: 'Hello Admin',
      message: 'Here is the summary of the automatic section cleanup process.',
      summary: 'Summary',
      totalCleaned: 'Total Products Removed',
      sectionsProcessed: 'Sections Processed',
      deactivatedSections: 'Sections Deactivated',
      cleanupDate: 'Cleanup Date',
      details: 'Details',
      noChanges: 'No changes were made',
      viewDashboard: 'View Dashboard',
    },
    fr: {
      subject: 'Rapport de Nettoyage Quotidien des Sections',
      title: '📊 Rapport de Nettoyage Automatique',
      greeting: 'Bonjour Admin',
      message: 'Voici le résumé du processus de nettoyage automatique des sections.',
      summary: 'Résumé',
      totalCleaned: 'Total des Produits Supprimés',
      sectionsProcessed: 'Sections Traitées',
      deactivatedSections: 'Sections Désactivées',
      cleanupDate: 'Date de Nettoyage',
      details: 'Détails',
      noChanges: 'Aucun changement effectué',
      viewDashboard: 'Voir le Tableau de Bord',
    },
  };

  const t = content[lang];
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';

  const detailsHtml = data.details.length > 0
    ? data.details.map(detail => `
        <div class="detail-row">
          <span class="detail-name">${detail.sectionName}</span>
          <span class="detail-info">
            ${detail.removedCount} removed
            ${detail.status === 'deactivated' ? ' - <strong style="color: #DC2626;">DEACTIVATED</strong>' : ''}
          </span>
        </div>
      `).join('')
    : `<p style="text-align: center; color: #6B7280;">${t.noChanges}</p>`;

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .summary-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .summary-item {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #E5E7EB;
        }
        .summary-value {
          font-size: 32px;
          font-weight: bold;
          color: #4F46E5;
          margin: 10px 0;
        }
        .summary-label {
          font-size: 14px;
          color: #6B7280;
        }
        .details-section {
          margin: 30px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          border-bottom: 1px solid #E5E7EB;
          background: #F9FAFB;
          margin-bottom: 5px;
          border-radius: 5px;
        }
        .detail-name {
          font-weight: 600;
          color: #111827;
        }
        .detail-info {
          color: #6B7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background: #4338CA;
        }
        .footer {
          background: #F9FAFB;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${t.title}</h1>
        </div>
        <div class="content">
          <p>${t.greeting},</p>
          <p>${t.message}</p>
          
          <h3>${t.summary}</h3>
          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-value">${data.totalCleaned}</div>
              <div class="summary-label">${t.totalCleaned}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.sectionsProcessed}</div>
              <div class="summary-label">${t.sectionsProcessed}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" style="color: ${data.deactivatedSections > 0 ? '#DC2626' : '#10B981'};">
                ${data.deactivatedSections}
              </div>
              <div class="summary-label">${t.deactivatedSections}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" style="font-size: 18px;">
                ${data.cleanupDate.toLocaleDateString()}
              </div>
              <div class="summary-label">${t.cleanupDate}</div>
            </div>
          </div>

          <h3>${t.details}</h3>
          <div class="details-section">
            ${detailsHtml}
          </div>

          <center>
            <a href="${adminUrl}/sections" class="button">
              ${t.viewDashboard}
            </a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Algeria E-Commerce. All rights reserved.</p>
          <p>This is an automated notification from the section management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send section deactivation notification
 */
export const sendSectionDeactivationNotification = async (
  adminEmail: string,
  data: SectionDeactivationData,
  lang: 'ar' | 'en' | 'fr' = 'en'
): Promise<void> => {
  try {
    const content = {
      ar: { subject: 'تنبيه: تم إيقاف قسم المنتجات' },
      en: { subject: 'Alert: Product Section Deactivated' },
      fr: { subject: 'Alerte: Section de Produits Désactivée' },
    };

    await sendEmail({
      to: adminEmail,
      subject: content[lang].subject,
      html: getSectionDeactivationEmail(data, lang),
    });

    console.log(`✉️  Deactivation email sent to ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to send deactivation email:', error);
  }
};

/**
 * Send low stock warning notification
 */
export const sendSectionLowStockNotification = async (
  adminEmail: string,
  data: SectionLowStockData,
  lang: 'ar' | 'en' | 'fr' = 'en'
): Promise<void> => {
  try {
    const content = {
      ar: { subject: 'تحذير: قسم قريب من الحد الأدنى' },
      en: { subject: 'Warning: Section Near Minimum Threshold' },
      fr: { subject: 'Avertissement: Section Proche du Seuil Minimum' },
    };

    await sendEmail({
      to: adminEmail,
      subject: content[lang].subject,
      html: getSectionLowStockEmail(data, lang),
    });

    console.log(`✉️  Low stock email sent to ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to send low stock email:', error);
  }
};

/**
 * Send cleanup summary notification
 */
export const sendCleanupSummaryNotification = async (
  adminEmail: string,
  data: CleanupSummaryData,
  lang: 'ar' | 'en' | 'fr' = 'en'
): Promise<void> => {
  try {
    const content = {
      ar: { subject: 'تقرير التنظيف اليومي للأقسام' },
      en: { subject: 'Daily Section Cleanup Report' },
      fr: { subject: 'Rapport de Nettoyage Quotidien des Sections' },
    };

    await sendEmail({
      to: adminEmail,
      subject: content[lang].subject,
      html: getCleanupSummaryEmail(data, lang),
    });

    console.log(`✉️  Cleanup summary sent to ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to send cleanup summary:', error);
  }
};