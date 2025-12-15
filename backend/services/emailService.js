const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'flyrehan96@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'R@csharp786',
  },
});

const sendReportEmail = async (to, patientName, orderNumber, reportUrl) => {
    console.log('to', to);
    console.log('patientName', patientName);
    console.log('orderNumber', orderNumber);
    console.log('reportUrl', reportUrl);
    console.log('sendReportEmail');
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'iLab'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: to,
      subject: `Your Lab Report #${orderNumber} is Ready`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${patientName},</h2>
          <p>Your lab test report for Order #${orderNumber} is now ready.</p>
          <p>You can view and download your report by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #0d6efd; 
                      color: white; text-decoration: none; border-radius: 4px;">
              View Report
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${reportUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendReportEmail,
};
