import { writeFile } from 'node:fs/promises';
import tsconfigPaths from 'vite-tsconfig-paths';
import { checker } from 'vite-plugin-checker';
import type { PluginOption, UserConfigExport } from 'vite';
import swc from 'unplugin-swc';
import { compilerOptions as tsconfigRelease } from './tsconfig.release.json';
import { compilerOptions as tsconfig } from './tsconfig.json';
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
		sourcemap: tsconfigRelease.sourceMap,
		ssr: true,
		target: tsconfig.target,
		terserOptions: { keep_classnames: true },
	},
	// define: loadEnv(),
	plugins: [
		swc.vite({ tsconfigFile: 'tsconfig.release.json' }),
		tsconfigPaths(),
		checker({
			enableBuild: true,
			terminal: true,
			typescript: true,
		}),
	],
} satisfies UserConfigExport;

/**
 * Generates build package.json.
 */
function pkgJson(): PluginOption {
	return {
		name: 'package-json-gen',
		writeBundle: async () => {
			const pkg = {
				dependencies,
				type: 'module',
			};

			await writeFile('dist/package.json', JSON.stringify(pkg, null, 4));
		},
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

/**
 * Turns a record in a text-writable key pair format.
 *
 * @example
 * ```ts
 * const npmrc = toKeyPairContent({
 * 	'ignore-scripts': true,
 * 	'node-linker': 'hoisted',
 * 	'prefer-frozen-lockfile': false,
 * });
 *
 * await writeFile('dist/.npmrc', npmrc);
 * ```
 */
function toKeyPairContent(data: Record<string, string | boolean | number>) {
	let content = '';

	for (const key in data) {
		content += `${key}=${data[key]}\n`;
	}

	return content;
}
