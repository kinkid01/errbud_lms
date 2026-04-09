const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate secure verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (user, password) => {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing. Check environment variables.');
      return false;
    }

    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Errbud Platform'}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome! Please Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Errbud Platform</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #007bff;
            }
            .header h1 {
              color: #007bff;
              margin: 0;
              font-size: 28px;
            }
            .welcome-message {
              margin-bottom: 25px;
              font-size: 16px;
            }
            .credentials {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #007bff;
            }
            .credentials h3 {
              margin-top: 0;
              color: #007bff;
            }
            .credential-item {
              margin: 10px 0;
              font-size: 14px;
            }
            .credential-item strong {
              color: #333;
            }
            .verification-button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .verification-button:hover {
              background-color: #0056b3;
            }
            .instructions {
              background-color: #fff3cd;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #ffc107;
            }
            .security-notice {
              background-color: #f8d7da;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #dc3545;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Errbud Platform!</h1>
            </div>
            
            <div class="welcome-message">
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Welcome aboard! Your student account has been created successfully. Below you'll find your login credentials and instructions to get started.</p>
            </div>
            
            <div class="credentials">
              <h3>Your Login Credentials</h3>
              <div class="credential-item">
                <strong>Email:</strong> ${user.email}
              </div>
              <div class="credential-item">
                <strong>Password:</strong> <span style="font-family: monospace; background: #e9ecef; padding: 2px 4px; border-radius: 3px;">${password}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="verification-button">Verify Your Email Address</a>
            </div>
            
            <div class="instructions">
              <h4>Important Instructions:</h4>
              <ul>
                <li>Please click the button above to verify your email address and activate your account</li>
                <li>After verification, we strongly recommend you change your password for security</li>
                <li>The verification link will expire in 24 hours</li>
                <li>If you didn't request this account, please contact our support team</li>
              </ul>
            </div>
            
            <div class="security-notice">
              <h4>Security Notice:</h4>
              <p>Please keep your credentials secure and never share them with anyone. Our support team will never ask for your password via email.</p>
            </div>
            
            <div class="footer">
              <p>If you have any questions or need assistance, please contact us at:</p>
              <p><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'support@errbud.com'}</p>
              <p><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || 'N/A'}</p>
              <p>&copy; ${new Date().getFullYear()} Errbud Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    
    // In production, you might want to use a proper logging service
    if (process.env.NODE_ENV === 'production') {
      console.error(`Failed to send email to ${user.email}:`, error);
    }
    
    return false;
  }
};

// Clean up expired tokens (optional utility)
const cleanupExpiredTokens = async () => {
  try {
    const User = require('../models/User');
    const result = await User.deleteMany({
      emailVerificationExpires: { $lt: new Date() },
      emailVerified: false,
    });
    console.log(`Cleaned up ${result.deletedCount} expired verification tokens`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  cleanupExpiredTokens,
};
