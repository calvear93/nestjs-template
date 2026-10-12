import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

/**
 * __DecoratorName___ decorator.
 *
 * @see https://docs.nestjs.com/custom-decorators
 */
export const ___DecoratorName___ = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const { params }: FastifyRequest = ctx.switchToHttp().getRequest();

		return params;
	},
);
