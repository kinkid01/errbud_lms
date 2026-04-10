const crypto = require('crypto');
const fetch = require('node-fetch');

// Generate secure verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email using Resend API (works on Railway)
const sendVerificationEmail = async (user, password) => {
  try {
    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend API key missing. Check RESEND_API_KEY environment variable.');
      return false;
    }

    // Log email attempt (for debugging)
    console.log(`Attempting to send verification email to ${user.email}...`);

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;

    const emailData = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [user.email],
      subject: 'Welcome! Please Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to Errbud Platform!</h2>
          
          <p>Dear <strong>${user.name}</strong>,</p>
          
          <p>Your student account has been created successfully. Here are your login credentials:</p>
          
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Your Email Address</a>
          </p>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Click the link above to activate your account</li>
            <li>Change your password after first login</li>
            <li>Link expires in 24 hours</li>
          </ul>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Support: ${process.env.SUPPORT_EMAIL || 'support@errbud.com'}<br>
            &copy; ${new Date().getFullYear()} Errbud Platform
          </p>
        </div>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Verification email sent successfully to ${user.email} via Resend API`);
      return true;
    } else {
      console.error('❌ Resend API error:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
};
