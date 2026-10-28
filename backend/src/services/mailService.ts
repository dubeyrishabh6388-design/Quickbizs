import nodemailer from "nodemailer";
import { env } from "../config/environment";
import { logger } from "../utils/logger";

export interface SendOtpEmailParams {
  to: string;
  code: string;
  type?: "CUSTOMER" | "MERCHANT" | "LOGIN" | "REGISTER" | string;
  userName?: string;
}

export class MailService {
  private transporter: any = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    try {
      if (env.smtpHost && env.smtpUser && env.smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: env.smtpHost,
          port: env.smtpPort,
          secure: env.smtpPort === 465,
          auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        logger.warn("[MailService] Incomplete SMTP configuration. Emails will be logged to console.");
      }
    } catch (err) {
      logger.error("[MailService] Failed to initialize Nodemailer transporter:", err);
    }
  }

  async verifyConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return { success: false, message: "SMTP transporter not initialized (missing credentials in .env)." };
    }
    try {
      await this.transporter.verify();
      return { success: true, message: "SMTP connection verified successfully with Brevo." };
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes("525") || msg.includes("Unauthorized IP address")) {
        return {
          success: false,
          message: "Brevo SMTP Error 525: Unauthorized IP address. Please whitelist your public IP in the Brevo Dashboard under SMTP & API > Authorized IP addresses.",
        };
      }
      return { success: false, message: `SMTP verification failed: ${msg}` };
    }
  }

  async sendOtpEmail(params: SendOtpEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, code, type, userName } = params;
    const recipientName = userName || (type === "MERCHANT" ? "Store Owner" : "Customer");
    const subject = `QuickBizs: Your Verification Code is ${code}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 24px 12px; }
    .card { max-width: 520px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f97316; }
    .logo-text { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
    .logo-text span { color: #f97316; }
    .logo-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #38bdf8; font-weight: 800; margin-top: 6px; }
    .tagline { display: inline-block; background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.3); color: #fb923c; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 10px; letter-spacing: 0.5px; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
    .message { font-size: 13px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    .otp-box { background: #1e293b; border: 2px dashed #f97316; border-radius: 16px; padding: 22px 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #f97316; margin-bottom: 8px; }
    .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; font-family: 'Courier New', monospace; margin: 0; }
    .validity { font-size: 12px; color: #cbd5e1; font-weight: 600; margin-top: 8px; }
    .features-strip { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px; margin: 20px 0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; }
    .features-strip strong { color: #38bdf8; }
    .security-note { background: rgba(249, 115, 22, 0.08); border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #cbd5e1; margin-top: 20px; }
    .footer { padding: 22px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-text">Quick<span>Bizs</span></div>
      <div class="logo-sub">Complete Business Management Software</div>
      <div class="tagline">POS • Billing • Inventory • Khata • Multi-Store</div>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${recipientName}</div>
      <div class="message">
        You requested a secure verification code to access your <strong>QuickBizs Business Management</strong> portal. Use this one-time password to complete your authentication.
      </div>

      <div class="otp-box">
        <div class="otp-label">Your One-Time Password</div>
        <div class="otp-code">${code}</div>
        <div class="validity">⏱ Valid for 5 minutes only</div>
      </div>

      <div class="features-strip">
        <strong>Manage Everything in One Place:</strong> Fast POS Billing, Real-Time Inventory, GST Invoices & Customer Khata Ledger — built for businesses of all sizes.
      </div>

      <div class="security-note">
        <strong>Security Tip:</strong> Never share this OTP with anyone. QuickBizs team will never ask for your verification code.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 QuickBizs Technologies. Smart Business Management OS for Retailers & Enterprises.<br>
      If you did not request this verification code, please ignore this email.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `Your QuickBizs Business Management verification code is: ${code}. It is valid for 5 minutes. Do not share this code with anyone. QuickBizs — Smart Business Management Software.`;

    // Fallback console log for development and local testing
    console.log(`\n======================================================`);
    console.log(`[Email OTP Generator] Recipient: ${to}`);
    console.log(`[Email OTP Generator] Verification Code: [ ${code} ]`);
    console.log(`[Email OTP Generator] Expiry: 5 minutes`);
    console.log(`======================================================\n`);

    if (!this.transporter) {
      logger.warn(`[MailService] SMTP not configured. OTP [${code}] logged to console for ${to}.`);
      return { success: true };
    }

    try {
      const fromAddress = `"${env.smtpFromName}" <${env.smtpFrom}>`;
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      logger.info(`[MailService] OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      const errStr = error.message || String(error);
      logger.error(`[MailService] Failed to send email via Brevo SMTP to ${to}: ${errStr}`);

      if (errStr.includes("525") || errStr.includes("Unauthorized IP address")) {
        console.warn(`\n[Brevo Notice] Brevo blocked this connection because your public IP is not whitelisted.`);
        console.warn(`[Brevo Notice] Please go to Brevo Dashboard -> SMTP & API -> Authorized IP addresses and add your IP.`);
        console.warn(`[Brevo Notice] Dev Fallback: Use OTP code [ ${code} ] from terminal to proceed.\n`);
      }

      // Return success with error info so registration/login flow continues smoothly during dev
      return { success: false, error: errStr };
    }
  }
}

export const mailService = new MailService();
