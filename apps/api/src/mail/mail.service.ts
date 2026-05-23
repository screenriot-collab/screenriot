import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.MAIL_HOST?.trim();
    const port = process.env.MAIL_PORT?.trim();
    if (host && port) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: false,
        auth:
          process.env.MAIL_USER && process.env.MAIL_PASSWORD
            ? {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
              }
            : undefined,
      });
      console.log(`[Mail] Configured: ${host}:${port} (verification emails will be sent)`);
    } else {
      console.warn(
        '[Mail] Not configured: set MAIL_HOST and MAIL_PORT in .env (e.g. MAIL_HOST=localhost MAIL_PORT=1025 for MailHog). Verification emails will be skipped.',
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      console.warn('[Mail] MAIL_HOST not set, skipping send:', options.to, options.subject);
      this.logDevPreview(options);
      return;
    }

    const from = process.env.MAIL_FROM ?? 'noreply@screenriot.local';
    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[Mail] Failed to send to ${options.to} (${options.subject}): ${message}`,
      );
      this.logDevPreview(options);
      // Do not throw: auth flows (forgot-password, verify-email) must not 500 when SMTP is down.
    }
  }

  /** Log link/text locally when SMTP is unavailable (e.g. MailHog not running). */
  private logDevPreview(options: SendMailOptions): void {
    if (process.env.NODE_ENV === 'production') return;
    if (options.text) {
      console.log(`[Mail] Dev preview for ${options.to}:\n${options.text}`);
    }
  }
}
