import swc from 'unplugin-swc';
import { checker } from 'vite-plugin-checker';
import type { UserConfigExport } from 'vitest/config';

export default {
	clearScreen: false,
	plugins: [
		swc.vite({ tsconfigFile: 'tsconfig.release.json' }),
		checker({
			eslint: {
				dev: { logLevel: ['error'] },
				lintCommand: 'eslint --cache',
				useFlatConfig: true,
			},
			terminal: true,
			typescript: true,
		}),
	] as any,
	test: {
		benchmark: {
			include: ['src/**/*.{bench,benchmark}.?(c|m)[jt]s'],
		},
		coverage: {
			exclude: [
				'**/*.{d,config,mock,fixture,bench}.?(c|m)[jt]s',
				'**/{index,main,app}.?(c|m)[jt]s',
				'**/__{tests,mocks,fixtures}__/**/*',
			],
			include: ['src/**/*.?(c|m)[jt]s'],
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			reportsDirectory: '.reports/coverage',
		},
		include: ['src/**/*.{spec,test}.?(c|m)[jt]s'],
		reporters: ['verbose'],
	},
} satisfies UserConfigExport;
