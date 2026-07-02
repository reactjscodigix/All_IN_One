const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing SMTP with user:', process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test System" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'SMTP Test - Enterprise CRM',
      text: 'If you received this, your SMTP settings are working correctly!',
      html: '<b>If you received this, your SMTP settings are working correctly!</b>'
    });
    console.log('✅ Success! Message sent:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error.message);
  }
}

testEmail();
