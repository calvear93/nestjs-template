import type { UserConfigExport } from 'vitest/config';
import vite from './vite.config.ts';

export default {
	clearScreen: false,
	plugins: vite.plugins,
	test: {
		coverage: {
			exclude: [
				'**/*.{d,config,mock,fixture,bench}.{ts,cts,mts}',
				'**/{index,main,app}.{ts,cts,mts}',
				'**/__{tests,mocks,fixtures}__',
			],
			include: ['src/**/*.{ts,cts,mts}'],
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			reportsDirectory: '.reports/coverage',
		},
		include: ['src/**/*.{spec,test}.{ts,cts,mts}'],
		reporters: ['verbose'],
	},
} satisfies UserConfigExport;
