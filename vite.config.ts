import { writeFile } from 'node:fs/promises';
import { viteStaticCopy as assets } from 'vite-plugin-static-copy';
import type { UserConfigExport } from 'vite';
import typescript from '@rollup/plugin-typescript';
import { dependencies } from './package.json';

export default {
	build: {
		ssr: 'src/main.ts',
		minify: 'terser',
		target: process.env.TARGET,
		sourcemap: false,
		rollupOptions: {
			output: {
				format: 'esm',
				compact: true,
				preserveModules: true,
				preserveModulesRoot: 'src',
			},
		},
		terserOptions: { keep_classnames: true },
	},
	plugins: [
		typescript({ tsconfig: 'tsconfig.release.json' }),
		pkgJson(),
		assets({
			targets: [
				{
					src: 'src/**/*.html',
					dest: '.',
				},
			],
		}),
	],
	define: loadEnv(),
} satisfies UserConfigExport;

/**
 * Generates build package.json.
 */
function pkgJson() {
	return {
		name: 'package-json-gen',
		closeBundle: () => {
			const pkg = {
				type: 'module',
				dependencies,
			};

			return writeFile('dist/package.json', JSON.stringify(pkg, null, 4));
		},
	};
}

/**
 * Loads environment variables for define injector.
 */
function loadEnv() {
	if (process.env.NODE_ENV === 'production') {
		return Object.fromEntries(
			Object.entries(process.env).map(([key, value]) => [
				`process.env.${key}`,
				`"${value}"`,
			]),
		);
	}

	return void 0;
}
