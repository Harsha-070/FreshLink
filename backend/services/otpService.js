const nodemailer = require('nodemailer');

// ============================================================
// EMAIL OTP (Gmail SMTP - Free)
// ============================================================

let emailTransporter = null;

function initEmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log('  [OTP] Gmail not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    console.log('  [OTP] Email OTPs will be shown in console only');
    return null;
  }

  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  // Verify connection
  emailTransporter.verify((err) => {
    if (err) {
      console.log('  [OTP] Gmail SMTP connection failed:', err.message);
      emailTransporter = null;
    } else {
      console.log('  [OTP] Gmail SMTP connected - emails will be sent to real addresses');
    }
  });

  return emailTransporter;
}

async function sendEmailOtp(email, otp) {
  if (!emailTransporter) {
    console.log(`  [OTP] Email (console only): ${otp} → ${email}`);
    return { sent: false, otp };
  }

  const mailOptions = {
    from: `"FreshLink" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${otp} is your FreshLink verification code`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #059669; padding: 12px; border-radius: 12px;">
            <span style="font-size: 28px; color: white; font-weight: bold;">🌿</span>
          </div>
          <h1 style="margin: 12px 0 4px; color: #0f172a; font-size: 22px;">FreshLink</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Hyperlocal Fresh Produce Platform</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 28px; text-align: center; border: 1px solid #e2e8f0;">
          <p style="color: #475569; font-size: 15px; margin: 0 0 16px;">Your verification code is:</p>
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #059669; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">This code expires in <strong>5 minutes</strong></p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request this code, please ignore this email.<br>
          — Team FreshLink
        </p>
      </div>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`  [OTP] Email sent: ${otp} → ${email}`);
    return { sent: true };
  } catch (err) {
    console.error(`  [OTP] Email failed: ${err.message}`);
    console.log(`  [OTP] Fallback (console): ${otp} → ${email}`);
    return { sent: false, otp };
  }
}

// ============================================================
// SMS OTP (Fast2SMS - Free tier for India)
// ============================================================

async function sendSmsOtp(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  // Clean phone number - remove +91 prefix if present
  const cleanPhone = phone.replace(/^\+?91/, '').replace(/\s/g, '');

  if (!apiKey) {
    console.log(`  [OTP] SMS (console only): ${otp} → ${phone}`);
    return { sent: false, otp };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();

    if (data.return) {
      console.log(`  [OTP] SMS sent: ${otp} → ${phone}`);
      return { sent: true };
    } else {
      console.log(`  [OTP] SMS failed: ${data.message}`);
      console.log(`  [OTP] Fallback (console): ${otp} → ${phone}`);
      return { sent: false, otp };
    }
  } catch (err) {
    console.error(`  [OTP] SMS error: ${err.message}`);
    console.log(`  [OTP] Fallback (console): ${otp} → ${phone}`);
    return { sent: false, otp };
  }
}

// ============================================================
// MAIN SEND FUNCTION
// ============================================================

async function sendOtp(identifier, type, otp) {
  if (type === 'email') {
    return sendEmailOtp(identifier, otp);
  } else {
    return sendSmsOtp(identifier, otp);
  }
}

module.exports = { initEmailTransporter, sendOtp };
