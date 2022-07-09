import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleDirectories: ['node_modules', 'src'],
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.*\\.(spec|test)\\.ts$',
    bail: 1,
    verbose: true,
    testTimeout: 30_000,
    slowTestThreshold: 10,
    coverageDirectory: '__reports__/coverage',
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coveragePathIgnorePatterns: [
        'index.ts',
        'main.ts',
        '.d.ts',
        '.mock.ts',
        '.config.ts',
        '.database.ts',
        'src/app/config',
        '__tests__',
        '__mocks__',
        '__fixtures__',
        '__migrations__',
        '__reports__'
    ],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
} as Config.InitialOptions;
