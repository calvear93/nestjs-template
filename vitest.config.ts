import type { UserConfigExport } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';

export default {
	test: {
		silent: false,
		testTimeout: 6000,
		include: ['src/**/*.{spec,test}.{ts,cts,mts}'],
		reporters: ['verbose'],
		coverage: {
			all: true,
			reportsDirectory: '.reports/coverage',
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			include: ['src/**/*.{ts,cts,mts}'],
			exclude: [
				'**/*.{d,config,mock,fixture}.{ts,cts,mts}',
				'**/{index,main}.{ts,cts,mts}',
				'**/__{tests,mocks,fixtures}__',
			],
		},
	},
	plugins: [typescript({ tsconfig: 'tsconfig.test.json' })],
} satisfies UserConfigExport;
