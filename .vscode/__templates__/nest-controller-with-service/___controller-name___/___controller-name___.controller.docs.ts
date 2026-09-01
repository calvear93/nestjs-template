import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import type { DecoratorsLookUp } from '#libs/decorators';
import { ___ControllerName___Schema } from './___controller-name___.schema.ts';
import { type ___ControllerName___Controller } from './___controller-name___.controller.ts';

export const ___ControllerName___ControllerDocs: DecoratorsLookUp<___ControllerName___Controller> =
	{
		class: [ApiTags('___ControllerName___')],
		method: {
			run: [
				ApiOperation({ summary: 'A Description' }),
				ApiResponse({
					description: 'DTO',
					status: HttpStatus.OK,
					type: String,
				}),
			],
			create: [
				ApiOperation({
					summary: 'Receives, validates and returns a body',
				}),
				ApiBody({
					// `schema` here is inert: NestJS always overwrites it with the
					// schema derived (and correctly registered) from
					// @Body({ schema }) on the controller method — see
					// #libs/zod's README, "OpenAPI Integration".
					schema: { type: 'object' },
				}),
				ApiResponse({
					description: 'The created resource',
					standardSchema: ___ControllerName___Schema,
					status: HttpStatus.CREATED,
				}),
			],
		},
	};
