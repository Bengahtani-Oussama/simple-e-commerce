import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  const isConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!isConfigured) {
    console.log('ℹ️  Email service not configured (SMTP credentials missing)');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error.message);
      console.log('ℹ️  Email features will be disabled until SMTP is configured');
    } else {
      console.log('✅ Email server is ready');
    }
  });

  return transporter;
};

const transporter = createTransporter();

export default transporter;