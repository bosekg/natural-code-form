import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import nodemailer from "nodemailer";

// Simple in-memory rate-limiter.
// NOTE: On Vercel serverless, function instances are ephemeral and may be
// recycled between invocations, so this in-memory map does not guarantee
// perfectly consistent rate limiting across all requests globally (it works
// reliably within a warm instance, which covers most rapid-fire abuse).
// If stricter guarantees are needed later, swap this for Upstash Redis
// (already used elsewhere in this stack) to share state across instances.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3; // Max 3 requests per 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!limit) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count += 1;
  return true;
}

function escapeHtml(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeInput(text: string, maxLen?: number): string {
  if (typeof text !== "string") return "";
  let sanitized = text.trim();
  if (maxLen) {
    sanitized = sanitized.substring(0, maxLen);
  }
  return escapeHtml(sanitized);
}

function sanitizeHeader(text: string): string {
  if (typeof text !== "string") return "";
  return text.replace(/[\r\n]+/g, " ").trim();
}

function isAllowedOrigin(req: VercelRequest): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const host = req.headers.host;
  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
      if (originHost === "localhost" || originHost === "127.0.0.1") return true;
      // Allow Vercel preview deployment URLs
      if (originHost.endsWith(".vercel.app")) return true;
    } catch {
      return false;
    }
    return false;
  }

  if (referer && host) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) return true;
      if (refererHost === "localhost" || refererHost === "127.0.0.1") return true;
      if (refererHost.endsWith(".vercel.app")) return true;
    } catch {
      return false;
    }
    return false;
  }

  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  // 1. Origin checking (CORS lockdown)
  if (!isAllowedOrigin(req)) {
    console.warn(`[Security Alert] Rejected request from unauthorized origin: ${req.headers.origin || req.headers.referer || "Unknown"}`);
    return res.status(403).json({
      success: false,
      error: "Access denied. Unauthorized request origin.",
    });
  }

  // 2. IP Rate Limiting
  const rawIp = req.headers["x-forwarded-for"] || "unknown";
  const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp.split(",")[0].trim();

  if (!checkRateLimit(ip)) {
    console.warn(`[Rate Limit Exceeded] IP: ${ip} exceeded maximum requests.`);
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please try again in 10 minutes.",
    });
  }

  const { ime, prezime, dob, izazov, investicija, vrijeme, email, middle_name } = req.body || {};

  // 3. Honeypot check
  if (middle_name) {
    console.warn(`[Honeypot Triggered] Silently ignoring submission from spam bot.`);
    return res.json({
      success: true,
      message: "Application successfully submitted!",
      simulated: false,
    });
  }

  // 4. Strict server-side validation
  if (!ime || typeof ime !== "string" || !ime.trim() || ime.trim().length > 100) {
    return res.status(400).json({ success: false, error: "Please enter a valid first name (up to 100 characters)." });
  }

  if (!prezime || typeof prezime !== "string" || !prezime.trim() || prezime.trim().length > 100) {
    return res.status(400).json({ success: false, error: "Please enter a valid last name (up to 100 characters)." });
  }

  const numericDob = Number(dob);
  if (!dob || isNaN(numericDob) || numericDob < 20 || numericDob > 99) {
    return res.status(400).json({ success: false, error: "Please enter a valid age (between 20 and 99)." });
  }

  if (!email || typeof email !== "string" || !email.trim() || email.trim().length > 254) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }

  const allowedIzazovi = ["Results", "Technique", "Motivation / Discipline"];
  if (!izazov || typeof izazov !== "string" || !allowedIzazovi.includes(izazov.trim())) {
    return res.status(400).json({ success: false, error: "Please select a valid challenge option." });
  }

  const allowedInvestments = ["$100", "$150-200", "$250+"];
  if (!investicija || typeof investicija !== "string" || !allowedInvestments.includes(investicija.trim())) {
    return res.status(400).json({ success: false, error: "Please select a valid monthly investment option." });
  }

  const allowedTimings = ["Immediately, as soon as we align", "Within a Week"];
  if (!vrijeme || typeof vrijeme !== "string" || !allowedTimings.includes(vrijeme.trim())) {
    return res.status(400).json({ success: false, error: "Please select a valid start timeframe option." });
  }

  // 5. Sanitize before interpolation
  const safeIme = sanitizeInput(ime, 100);
  const safePrezime = sanitizeInput(prezime, 100);
  const safeDob = String(numericDob);
  const safeIzazov = sanitizeInput(izazov, 1000).replace(/\n/g, "<br />");
  const safeInvesticija = sanitizeInput(investicija, 50);
  const safeVrijeme = sanitizeInput(vrijeme, 100);
  const safeEmail = sanitizeInput(email, 254);

  const headerIme = sanitizeHeader(safeIme);
  const headerPrezime = sanitizeHeader(safePrezime);

  const clientEmail = process.env.CLIENT_EMAIL || "";
  if (!clientEmail) {
    console.warn("⚠️ SECURITY WARNING: process.env.CLIENT_EMAIL is not configured. Real delivery of notifications to the coach will fail.");
  }
  const resendApiKey = process.env.RESEND_API_KEY;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>New Application</title></head>
      <body style="background-color: #060607; color: #f5f5f5; font-family: Inter, -apple-system, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 12px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <h2 style="font-size: 14px; font-weight: 600; color: #8c1f2f; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 24px;">New Natural Crew Application</h2>
          <div style="margin-bottom: 24px; font-size: 15px; line-height: 1.6;">
            <div style="margin-bottom: 8px;"><strong style="color: #8a8a8a; font-weight: 500;">Name:</strong> <span style="color: #ffffff; font-weight: 600;">${safeIme} ${safePrezime}</span></div>
            <div style="margin-bottom: 8px;"><strong style="color: #8a8a8a; font-weight: 500;">Age:</strong> <span style="color: #ffffff;">${safeDob}</span></div>
            <div style="margin-bottom: 8px;"><strong style="color: #8a8a8a; font-weight: 500;">Contact Email:</strong> <a href="mailto:${safeEmail}" style="color: #8c1f2f; text-decoration: none; font-weight: 600;">${safeEmail}</a></div>
          </div>
          <hr style="border: 0; height: 1px; background-color: rgba(140, 31, 47, 0.25); margin-top: 24px; margin-bottom: 24px;" />
          <div style="font-size: 15px; line-height: 1.6;">
            <div style="margin-bottom: 16px;"><strong style="color: #8a8a8a; font-weight: 500; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Biggest Obstacle:</strong><span style="color: #ffffff; font-weight: 500;">${safeIzazov}</span></div>
            <div style="margin-bottom: 16px;"><strong style="color: #8a8a8a; font-weight: 500; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Monthly Investment:</strong><span style="color: #ffffff; font-weight: 500;">${safeInvesticija}</span></div>
            <div style="margin-bottom: 16px;"><strong style="color: #8a8a8a; font-weight: 500; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Timing:</strong><span style="color: #ffffff; font-weight: 500;">${safeVrijeme}</span></div>
          </div>
          <div style="margin-top: 40px; border-top: 1px solid #1f1f23; padding-top: 20px; font-size: 11px; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">
            Submitted via The Natural Code lead form.
          </div>
        </div>
      </body>
    </html>
  `;

  const leadEmailHtml = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Your application has been received</title></head>
      <body style="background-color: #060607; color: #f5f5f5; font-family: Inter, -apple-system, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 12px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 32px; letter-spacing: -0.01em;">Thanks for applying, ${safeIme}.</h2>
          <p style="color: #8a8a8a; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 32px;">Your application for Natural Crew 1:1 Coaching has been received.</p>
          <p style="color: #8a8a8a; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 32px;">David will personally review your answers and reach out shortly.</p>
          <p style="color: #8a8a8a; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 0;">Talk soon,<br />The Natural Code</p>
        </div>
      </body>
    </html>
  `;

  try {
    if (resendApiKey && resendApiKey !== "MY_GEMINI_API_KEY" && !resendApiKey.startsWith("MY_")) {
      const resend = new Resend(resendApiKey);

      try {
        const notificationResult = await resend.emails.send({
          from: "Lead Qualification <onboarding@resend.dev>",
          to: clientEmail,
          subject: `New Application: ${headerIme} ${headerPrezime}`,
          html: emailHtml,
        });
        if (notificationResult.error) {
          console.error("Resend error sending notification to David:", notificationResult.error);
        }
      } catch (err) {
        console.error("Failed to send notification email to David via Resend:", err);
      }

      try {
        const confirmationResult = await resend.emails.send({
          from: "The Natural Code <onboarding@resend.dev>",
          to: safeEmail,
          subject: `Your application has been received`,
          html: leadEmailHtml,
        });
        if (confirmationResult.error) {
          console.error("Resend error sending confirmation to Lead:", confirmationResult.error);
        }
      } catch (err) {
        console.error("Failed to send confirmation email to Lead via Resend:", err);
      }

      return res.json({ success: true, message: "Qualification successful! Thank you." });
    } else {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort || "587"),
          secure: smtpPort === "465",
          auth: { user: smtpUser, pass: smtpPass },
        });

        try {
          await transporter.sendMail({
            from: `"Lead Qualification" <${smtpUser}>`,
            to: clientEmail,
            subject: `New Application: ${headerIme} ${headerPrezime}`,
            html: emailHtml,
          });
        } catch (err) {
          console.error("Failed to send notification email to David via SMTP:", err);
        }

        try {
          await transporter.sendMail({
            from: `"The Natural Code" <${smtpUser}>`,
            to: safeEmail,
            subject: "Your application has been received",
            html: leadEmailHtml,
          });
        } catch (err) {
          console.error("Failed to send confirmation email to Lead via SMTP:", err);
        }

        return res.json({ success: true, message: "Qualification successful! Thank you." });
      } else {
        console.warn("⚠️ WARNING: Neither RESEND_API_KEY nor SMTP configuration parameters are set!");
        return res.json({
          success: true,
          message: "Qualification simulated! (Set RESEND_API_KEY or SMTP settings for real delivery)",
          simulated: true,
        });
      }
    }
  } catch (err: any) {
    console.error("DETAILED EMAIL SENDING ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "An error occurred while processing your application. Please try again later or contact the administrator.",
    });
  }
}
