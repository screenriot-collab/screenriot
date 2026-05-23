import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserOptional = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { id: string; role: string } | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: { id: string; role: string } }>();
    return request.user ?? null;
  },
);
