import { CryptoProvider } from './crypto.provider';

describe('CryptoProvider', () => {
    // provider instance
    let provider: CryptoProvider;

    // crypto config
    const alg = 'aes-256-cbc';
    const key = 'vomNEievqNGNuLkKzcWnUnmyaosDfTyf';
    const vector = 'KUoNpTcoJmawbJbe';

    // for encrypt/decrypt testing
    const phrases = [
        'This is an encrypted message',
        'Hello World',
        "I'm happy",
        'My phone is +56 9 6993 1233'
    ];

    // initialization
    beforeAll(() => {
        provider = new CryptoProvider(key, vector, alg);
    });

    test('encryption and decryption capabilities', () => {
        for (const phrase of phrases) {
            const encrypted = provider.encrypt(phrase);
            const decrypted = provider.decrypt(encrypted);

            expect(phrase).not.toBe(encrypted);
            expect(phrase).toBe(decrypted);
        }
    });

    test('hashing capabilities', () => {
        for (const phrase of phrases) {
            const hashed = provider.hash(phrase);

            expect(phrase).not.toBe(hashed);
        }
    });
});
