import { writeFile } from 'node:fs/promises';
import swc from 'unplugin-swc';
import type { PluginOption, UserConfigExport } from 'vite';
import { checker } from 'vite-plugin-checker';
import { dependencies } from './package.json';
import { compilerOptions as tsconfig } from './tsconfig.json';
import { compilerOptions as tsconfigRelease } from './tsconfig.release.json';

const CODE_OPTIMIZE = process.env.NODE_ENV === 'production';

export default {
	build: {
		minify: CODE_OPTIMIZE ? 'terser' : false,
		rollupOptions: {
			input: {
				main: 'src/main.ts',
			},
			output: {
				compact: CODE_OPTIMIZE,
				format: 'esm',
				preserveModules: true,
				preserveModulesRoot: 'src',
			},
			plugins: [packageJson()],
			treeshake: CODE_OPTIMIZE,
		},
		sourcemap: tsconfigRelease.sourceMap,
		ssr: true,
		target: tsconfig.target,
		terserOptions: { keep_classnames: true },
	},
	clearScreen: false,
	// define: loadEnv(),
	plugins: [
		swc.vite({ tsconfigFile: 'tsconfig.release.json' }),
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
function packageJson(): PluginOption {
	return {
		name: 'package-json-gen',
		writeBundle: async () => {
			const package_ = {
				dependencies,
				type: 'module',
			};

			await writeFile(
				'dist/package.json',
				JSON.stringify(package_, null, 4),
			);
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toKeyPairContent(data: Record<string, boolean | number | string>) {
	let content = '';

	for (const key in data) {
		content += `${key}=${data[key]}\n`;
	}

	return content;
}
