import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthenticatedUser = {
    id: number;
    email: string;
    role: string;
};

export const CurrentUser = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as AuthenticatedUser;
    },
);
