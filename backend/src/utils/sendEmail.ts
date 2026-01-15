import transporter from '../config/email';
import { EmailOptions } from '../types';

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Skip if email is not configured
  if (!transporter) {
    console.log('⚠️  Email not sent (SMTP not configured):', options.subject);
    return;
  }

  const mailOptions = {
    from: `"Algeria E-Commerce" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Don't throw error - allow app to continue without email
  }
};

// Email templates
export const getPasswordResetEmailTemplate = (resetUrl: string, lang: 'ar' | 'en' | 'fr' = 'ar'): string => {
  const content = {
    ar: {
      title: 'إعادة تعيين كلمة المرور',
      greeting: 'مرحباً',
      message: 'لقد تلقيت هذا البريد الإلكتروني لأنك (أو شخص آخر) طلبت إعادة تعيين كلمة المرور لحسابك.',
      instruction: 'يرجى النقر على الزر أدناه لإعادة تعيين كلمة المرور:',
      button: 'إعادة تعيين كلمة المرور',
      expire: 'سينتهي هذا الرابط خلال 10 دقائق.',
      ignore: 'إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.',
    },
    en: {
      title: 'Password Reset',
      greeting: 'Hello',
      message: 'You are receiving this email because you (or someone else) requested a password reset for your account.',
      instruction: 'Please click the button below to reset your password:',
      button: 'Reset Password',
      expire: 'This link will expire in 10 minutes.',
      ignore: 'If you did not request this, please ignore this email.',
    },
    fr: {
      title: 'Réinitialisation du mot de passe',
      greeting: 'Bonjour',
      message: 'Vous recevez cet email parce que vous (ou quelqu\'un d\'autre) avez demandé la réinitialisation du mot de passe de votre compte.',
      instruction: 'Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe:',
      button: 'Réinitialiser le mot de passe',
      expire: 'Ce lien expirera dans 10 minutes.',
      ignore: 'Si vous n\'avez pas demandé cela, veuillez ignorer cet email.',
    },
  };

  const t = content[lang];

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${t.title}</h2>
        <p>${t.greeting},</p>
        <p>${t.message}</p>
        <p>${t.instruction}</p>
        <a href="${resetUrl}" class="button">${t.button}</a>
        <p><strong>${t.expire}</strong></p>
        <p>${t.ignore}</p>
        <div class="footer">
          <p>© 2026 Algeria E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getWelcomeEmailTemplate = (name: string, lang: 'ar' | 'en' | 'fr' = 'ar'): string => {
  const content = {
    ar: {
      title: 'مرحباً بك!',
      greeting: `مرحباً ${name}،`,
      message: 'شكراً لتسجيلك معنا! نحن سعداء بانضمامك إلى متجرنا.',
      button: 'ابدأ التسوق',
    },
    en: {
      title: 'Welcome!',
      greeting: `Hello ${name},`,
      message: 'Thank you for registering with us! We are happy to have you in our store.',
      button: 'Start Shopping',
    },
    fr: {
      title: 'Bienvenue!',
      greeting: `Bonjour ${name},`,
      message: 'Merci de vous être inscrit! Nous sommes heureux de vous avoir dans notre boutique.',
      button: 'Commencer les achats',
    },
  };

  const t = content[lang];
  const storeUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${t.title}</h2>
        <p>${t.greeting}</p>
        <p>${t.message}</p>
        <a href="${storeUrl}" class="button">${t.button}</a>
        <div class="footer">
          <p>© 2026 Algeria E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};