import type { UserConfigExport } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';

export default {
	test: {
		silent: true,
		include: ['src/**/*.{spec,test}.{ts,cts,mts}'],
		reporters: ['junit', 'verbose'],
		outputFile: {
			junit: '.reports/junit.xml',
		},
		coverage: {
			all: true,
			reportsDirectory: '.reports/coverage',
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			include: ['src/**/*.{ts,cts,mts}'],
			exclude: [
				'**/*.d.{ts,cts,mts}',
				'**/*.mock.{ts,cts,mts}',
				'**/*.config.{ts,cts,mts}',
				'**/{index,main}.{ts,cts,mts}',
				'**/__{tests,mocks,fixtures}__',
			],
		},
	},
	// include only src for vitest debugging
	plugins: [typescript({ tsconfig: 'tsconfig.test.json' })],
} satisfies UserConfigExport;
