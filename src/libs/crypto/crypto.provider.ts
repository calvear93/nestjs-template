import crypto, {
	type Cipher,
	type CipherCCMTypes,
	type CipherGCMTypes,
	type Decipher,
	type RandomUUIDOptions,
} from 'node:crypto';
import { Injectable, type Provider } from '@nestjs/common';

// https://gist.github.com/reggi/4459803
export type CipherAlgorithm =
	| CipherCCMTypes
	| CipherGCMTypes
	| 'aes-192-cbc'
	| 'aes-256-cbc';

// openssl list -digest-algorithms
export type HashAlgorithm =
	| 'RSA-MD4'
	| 'RSA-MD5'
	| 'RSA-RIPEMD160'
	| 'RSA-SHA1'
	| 'RSA-SHA1-2'
	| 'RSA-SHA224'
	| 'RSA-SHA256'
	| 'RSA-SHA3-224'
	| 'RSA-SHA3-256'
	| 'RSA-SHA3-384'
	| 'RSA-SHA3-512'
	| 'RSA-SHA384'
	| 'RSA-SHA512'
	| 'RSA-SHA512/224'
	| 'RSA-SHA512/256'
	| 'RSA-SM3'
	| 'BLAKE2B512'
	| 'BLAKE2S256'
	| 'ID-RSASSA-PKCS1-V1_5-WITH-SHA3-224'
	| 'ID-RSASSA-PKCS1-V1_5-WITH-SHA3-256'
	| 'ID-RSASSA-PKCS1-V1_5-WITH-SHA3-384'
	| 'ID-RSASSA-PKCS1-V1_5-WITH-SHA3-512'
	| 'MD4'
	| 'MD4WithRSAEncryption'
	| 'MD5'
	| 'MD5-SHA1'
	| 'MD5WithRSAEncryption'
	| 'RIPEMD'
	| 'RIPEMD160'
	| 'RIPEMD160WithRSA'
	| 'RMD160'
	| 'SHA1'
	| 'SHA1WithRSAEncryption'
	| 'SHA224'
	| 'SHA224WithRSAEncryption'
	| 'SHA256'
	| 'SHA256WithRSAEncryption'
	| 'SHA3-224'
	| 'SHA3-256'
	| 'SHA3-384'
	| 'SHA3-512'
	| 'SHA384'
	| 'SHA384WithRSAEncryption'
	| 'SHA512'
	| 'SHA512-224'
	| 'SHA512-224WithRSAEncryption'
	| 'SHA512-256'
	| 'SHA512-256WithRSAEncryption'
	| 'SHA512WithRSAEncryption'
	| 'SHAKE128'
	| 'SHAKE256'
	| 'SM3'
	| 'SM3WithRSAEncryption'
	| 'SSL3-MD5'
	| 'SSL3-SHA1'
	| 'Whirlpool';

/**
 * Handles hashing, encryption and decryption using node crypto.
 */
@Injectable()
export class CryptoProvider {
	/**
	 * Crypto key.
	 */
	private readonly _key: Buffer;

	/**
	 * Vector initializer.
	 */
	private readonly _vector: Buffer;

	/**
	 * Creates an instance of CryptoProvider.
	 *
	 * @param key - crypto key, should be length 32
	 * @param vector - vactor initializer, should be length 16
	 * @param _algorithm - crypto algorithm
	 */
	constructor(
		key: string,
		vector: string,
		private readonly _algorithm: CipherAlgorithm,
	) {
		this._key = Buffer.from(key);
		this._vector = Buffer.from(vector);
	}

	/**
	 * Generates a random UUID.
	 */
	uuid(options?: RandomUUIDOptions): string {
		return crypto.randomUUID(options);
	}

	/**
	 * Hashes a string.
	 *
	 * @param str - string for hash
	 * @param algorithm - hash algorithm
	 *
	 * @returns hashed string
	 */
	hash(str: string, algorithm: HashAlgorithm = 'SHA256'): string {
		const hash = crypto.createHash(algorithm);

		return hash.update(str).digest('hex');
	}

	/**
	 * Encrypts a string.
	 *
	 * @param str - string for encrypt
	 *
	 * @returns encrypted string
	 */
	encrypt(str: string): string {
		const cipher: Cipher = crypto.createCipheriv(
			this._algorithm,
			this._key,
			this._vector,
		);

		return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
	}

	/**
	 * Decrypts a string.
	 *
	 * @param str - string for decrypt
	 *
	 * @returns decrypted string
	 */
	decrypt(str: string): string {
		const decipher: Decipher = crypto.createDecipheriv(
			this._algorithm,
			this._key,
			this._vector,
		);

		return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
	}

	/**
	 * Provider initializer for module.
	 *
	 * @param key - crypto key, should be length 32
	 * @param vector - vactor initializer, should be length 16
	 * @param algorithm - crypto algorithm
	 *
	 * @returns provider
	 */
	static register(
		key: string,
		vector: string,
		algorithm: CipherAlgorithm,
	): Provider<CryptoProvider> {
		return {
			provide: CryptoProvider,
			useFactory: () => new CryptoProvider(key, vector, algorithm),
		};
	}
}
