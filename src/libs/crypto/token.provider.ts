import { createHash } from 'node:crypto';
import type { FactoryProvider } from '@nestjs/common';

export type HashAlgorithm =
	| 'blake2b512'
	| 'blake2s256'
	| 'id-rsassa-pkcs1-v1_5-with-sha3-224'
	| 'id-rsassa-pkcs1-v1_5-with-sha3-256'
	| 'id-rsassa-pkcs1-v1_5-with-sha3-384'
	| 'id-rsassa-pkcs1-v1_5-with-sha3-512'
	| 'md5-sha1'
	| 'md5'
	| 'md5WithRSAEncryption'
	| 'ripemd'
	| 'ripemd160'
	| 'ripemd160WithRSA'
	| 'rmd160'
	| 'RSA-MD5'
	| 'RSA-RIPEMD160'
	| 'RSA-SHA1-2'
	| 'RSA-SHA1'
	| 'RSA-SHA3-224'
	| 'RSA-SHA3-256'
	| 'RSA-SHA3-384'
	| 'RSA-SHA3-512'
	| 'RSA-SHA224'
	| 'RSA-SHA256'
	| 'RSA-SHA384'
	| 'RSA-SHA512'
	| 'RSA-SHA512/224'
	| 'RSA-SHA512/256'
	| 'RSA-SM3'
	| 'sha1'
	| 'sha1WithRSAEncryption'
	| 'sha3-224'
	| 'sha3-256'
	| 'sha3-384'
	| 'sha3-512'
	| 'sha224'
	| 'sha224WithRSAEncryption'
	| 'sha256'
	| 'sha256WithRSAEncryption'
	| 'sha384'
	| 'sha384WithRSAEncryption'
	| 'sha512-224'
	| 'sha512-224WithRSAEncryption'
	| 'sha512-256'
	| 'sha512-256WithRSAEncryption'
	| 'sha512'
	| 'sha512WithRSAEncryption'
	| 'shake128'
	| 'shake256'
	| 'sm3'
	| 'sm3WithRSAEncryption'
	| 'ssl3-md5'
	| 'ssl3-sha1';

export type JSONPrimitive = bigint | boolean | number | string | null;

export type JSONValue =
	| JSONPrimitive
	| JSONValue[]
	| {
			[key: string]: JSONValue;
	  };

export class TokenProvider {
	token(content: JSONValue): string {
		const serialized = this._serialize(content);
		const signature = this.sign(serialized);

		return `${serialized}.${signature}`;
	}

	verify(token: string): JSONValue | null {
		const [serialized, currentSignature] = token.split('.');
		const signature = this.sign(serialized);

		if (signature !== currentSignature) return null;

		return this._deserialize(serialized);
	}

	private _deserialize(serialized: string) {
		return JSON.parse(
			Buffer.from(serialized, 'base64url').toString(),
		) as JSONValue;
	}

	private _serialize(content: JSONValue) {
		return Buffer.from(JSON.stringify(content)).toString('base64url');
	}

	private sign(data: string) {
		return createHash(this.algorithm)
			.update(`${data}#${this.secret}`)
			.digest('base64url');
	}

	constructor({ algorithm = 'shake256', secret }: DigitalSignProviderConfig) {
		this.algorithm = algorithm;
		this.secret = secret;
	}

	private readonly algorithm: HashAlgorithm;

	private readonly secret: string;

	static register(
		config: DigitalSignProviderConfig,
	): FactoryProvider<TokenProvider> {
		return {
			provide: TokenProvider,
			useFactory: () => new TokenProvider(config),
		};
	}
}

export interface DigitalSignProviderConfig {
	algorithm: HashAlgorithm;
	secret: string;
}
