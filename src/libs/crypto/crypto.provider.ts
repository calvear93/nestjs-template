import { Injectable, Provider } from '@nestjs/common';
import crypto, {
    Cipher,
    CipherCCMTypes,
    CipherGCMTypes,
    Decipher
} from 'crypto';

// https://gist.github.com/reggi/4459803
export type CipherAlgorithm =
    | CipherCCMTypes
    | CipherGCMTypes
    | 'aes-192-cbc'
    | 'aes-256-cbc';

/**
 * Handles hashing, encryption and decryption using node crypto.
 *
 * @class CryptoProvider
 */
@Injectable()
export class CryptoProvider {
    /**
     * Crypto key.
     *
     * @private
     * @type {Buffer}
     */
    private readonly _key: Buffer;

    /**
     * Vector initializer.
     *
     * @private
     * @type {Buffer}
     */
    private readonly _vector: Buffer;

    /**
     * Creates an instance of CryptoProvider.
     *
     * @param {string} key crypto key, should be length 32
     * @param {string} vector vactor initializer, should be length 16
     * @param {CipherAlgorithm} _algorithm crypto algorithm
     */
    constructor(
        key: string,
        vector: string,
        private readonly _algorithm: CipherAlgorithm
    ) {
        this._key = Buffer.from(key);
        this._vector = Buffer.from(vector);
    }

    /**
     * Hashes a string.
     *
     * @param {string} str string for hash
     *
     * @returns {string} hashed string
     */
    hash(str: string): string {
        const hash = crypto.createHash('md5');

        return hash.update(str).digest('hex');
    }

    /**
     * Encrypts a string.
     *
     * @param {string} str string for encrypt
     *
     * @returns {string} encrypted string
     */
    encrypt(str: string): string {
        const cipher: Cipher = crypto.createCipheriv(
            this._algorithm,
            this._key,
            this._vector
        );

        return cipher.update(str, 'utf-8', 'hex') + cipher.final('hex');
    }

    /**
     * Decrypts a string.
     *
     * @param {string} str string for decrypt
     *
     * @returns {string} decrypted string
     */
    decrypt(str: string): string {
        const decipher: Decipher = crypto.createDecipheriv(
            this._algorithm,
            this._key,
            this._vector
        );

        return decipher.update(str, 'hex', 'utf-8') + decipher.final('utf8');
    }

    /**
     * Provider initializer for module.
     *
     * @static
     * @param {string} key crypto key, should be length 32
     * @param {string} vector vactor initializer, should be length 16
     * @param {CipherAlgorithm} algorithm crypto algorithm
     *
     * @returns {Provider} provider
     */
    static register(
        key: string,
        vector: string,
        algorithm: CipherAlgorithm
    ): Provider<CryptoProvider> {
        return {
            provide: CryptoProvider,
            useFactory: () => new CryptoProvider(key, vector, algorithm)
        };
    }
}
