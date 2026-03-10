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
      // No mail config: log and skip (e.g. in tests or when MAIL_HOST not set)
      console.warn('[Mail] MAIL_HOST not set, skipping send:', options.to, options.subject);
      return;
    }
    const from = process.env.MAIL_FROM ?? 'noreply@screenriot.local';
    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
