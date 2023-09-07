import type { UserConfigExport } from 'vitest/config';
import swc from 'unplugin-swc';

export default {
	plugins: [swc.vite({ tsconfigFile: 'tsconfig.test.json' })],
	test: {
		coverage: {
			all: true,
			exclude: [
				'**/*.{d,config,mock,fixture}.{ts,cts,mts}',
				'**/{index,main}.{ts,cts,mts}',
				'**/__{tests,mocks,fixtures}__',
			],
			include: ['src/**/*.{ts,cts,mts}'],
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			reportsDirectory: '.reports/coverage',
		},
		include: ['src/**/*.{spec,test}.{ts,cts,mts}'],
		reporters: ['verbose'],
		silent: false,
		testTimeout: 6000,
	},
} satisfies UserConfigExport;
