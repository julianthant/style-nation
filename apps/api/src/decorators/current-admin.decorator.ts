import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // JWT payload will contain admin data
  },
);

// Keep the old CurrentUser export for backwards compatibility during migration
export const CurrentUser = CurrentAdmin;