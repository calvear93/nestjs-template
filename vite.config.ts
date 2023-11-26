import { writeFile } from 'node:fs/promises';
import type { UserConfigExport } from 'vite';
import swc from 'unplugin-swc';
import { compilerOptions } from './tsconfig.release.json';
import { dependencies } from './package.json';

export default {
	build: {
		minify: 'terser',
		rollupOptions: {
			input: {
				main: 'src/main.ts',
			},
			output: {
				compact: true,
				format: 'esm',
				preserveModules: true,
				preserveModulesRoot: 'src',
			},
			plugins: [pkgJson()],
		},
		sourcemap: compilerOptions.sourceMap,
		ssr: true,
		target: process.env.TARGET,
		terserOptions: { keep_classnames: true },
	},
	// define: loadEnv(),
	plugins: [swc.vite({ tsconfigFile: 'tsconfig.release.json' })],
} satisfies UserConfigExport;

/**
 * Generates build package.json.
 */
function pkgJson() {
	return {
		closeBundle: () => {
			const pkg = {
				dependencies,
				type: 'module',
			};

			return writeFile('dist/package.json', JSON.stringify(pkg, null, 4));
		},
		name: 'package-json-gen',
	};
}

/**
 * Loads environment variables for define injector.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadEnv() {
	if (process.env.NODE_ENV === 'production') {
		return Object.fromEntries(
			Object.entries(process.env).map(([key, value]) => [
				`process.env.${key}`,
				`"${value}"`,
			]),
		);
	}
}
