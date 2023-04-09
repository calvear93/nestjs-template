import { type SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import { ApiKeyGuardFactory } from '../../libs/decorators/api-key.guard.js';
export { AllowAnonymous } from '../../libs/decorators/api-key.guard.js';

export const APY_KEY_GUARD_NAME = 'API_KEY_GUARD';
const ENABLED = process.env.SECURITY_ENABLED === 'true';
const HEADER_NAME = process.env.SECURITY_HEADER_NAME;
const API_KEY = process.env.SECURITY_API_KEY;

export const SECURITY_API_SCHEMA: SecuritySchemeObject = {
	name: HEADER_NAME,
	type: 'apiKey',
	description: 'Security Api Key',
	in: 'header',
};

export const ApiKey = ApiKeyGuardFactory(
	HEADER_NAME,
	API_KEY,
	APY_KEY_GUARD_NAME,
	ENABLED,
);
