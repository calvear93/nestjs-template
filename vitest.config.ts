import swc from 'unplugin-swc';
import { checker } from 'vite-plugin-checker';
import type { UserConfigExport } from 'vitest/config';

export default {
	clearScreen: false,
	plugins: [
		swc.vite({ tsconfigFile: 'tsconfig.release.json' }),
		checker({
			terminal: true,
			typescript: true,
		}),
	],
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
