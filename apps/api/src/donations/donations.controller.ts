import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DonationsService } from './donations.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('donations')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donations: DonationsService) {}

  /**
   * List current user's donations (for Investor Dashboard and Tracked Films).
   */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser('id') userId: string) {
    return this.donations.getMine(userId);
  }

  /**
   * Create Stripe Checkout Session for film donation. Returns redirect URL.
   */
  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ url: string }> {
    return this.donations.createCheckoutSession(
      userId,
      dto.filmId,
      dto.amount,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  /**
   * Stripe webhook. Requires raw body; stripe-signature header.
   * Configure Stripe CLI: stripe listen --forward-to localhost:3001/donations/webhook
   */
  @Post('webhook')
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const rawBody = req.body;
    if (!(rawBody instanceof Buffer)) {
      throw new BadRequestException('Webhook must receive raw body');
    }
    await this.donations.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
