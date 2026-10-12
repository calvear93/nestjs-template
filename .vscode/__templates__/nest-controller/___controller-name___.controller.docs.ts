import type { DecoratorsLookUp } from '#libs/decorators';
import { HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
		},
	};
