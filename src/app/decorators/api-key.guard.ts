import { type SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import { SecurityGuardFactory } from '../../libs/decorators/security-guard.factory.js';
import { ApiKeyGuard } from '../../libs/decorators/api-key.guard.js';

const HEADER_NAME = process.env.SECURITY_HEADER_NAME;
const API_KEY = process.env.SECURITY_API_KEY;
const ENABLED = process.env.SECURITY_ENABLED === 'true' && !!API_KEY;

export const APY_KEY_GUARD_NAME = 'API_KEY_GUARD';

export const SECURITY_API_SCHEMA: SecuritySchemeObject = {
	name: HEADER_NAME,
	type: 'apiKey',
	description: 'Security Api Key',
	in: 'header',
};

export const [ApiKey, AllowAnonymous] = SecurityGuardFactory(
	ApiKeyGuard,
	APY_KEY_GUARD_NAME,
	ENABLED,
	HEADER_NAME,
	API_KEY,
);
