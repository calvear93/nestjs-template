import { type FastifyRequest } from 'fastify';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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
