import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import redos from 'eslint-plugin-redos';
import regexp from 'eslint-plugin-regexp';
import sonarjs from 'eslint-plugin-sonarjs';
import tsdoc from 'eslint-plugin-tsdoc';
import unicorn from 'eslint-plugin-unicorn';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';
import typescript from 'typescript-eslint';

const SRC_GLOB = '**/*.{js,cjs,mjs,ts,cts,mts}';
const TYPESCRIPT_GLOB = '**/*.{ts,cts,mts}';
const TEST_GLOB = 'src/**/*.{spec,test}.{js,mjs,cjs,ts,cts,mts}';
const CODE_STYLE_GLOB = '**/*.{js,mjs,cjs,ts,cts,mts,json}';

const ERROR = 'error';
const WARN = 'warn';
const OFF = 'off';

export default [
	{
		ignores: [
			'build/**/*',
			'dist/**/*',
			'**/node_modules/**/*',
			'.reports/**/*',
			'.wireit/**/*',
			'.vscode/**/*',
		],
	},
	// #region ecmascript
	{
		files: [SRC_GLOB],
		languageOptions: {
			ecmaVersion: 2023,
			globals: { ...globals.node },
			sourceType: 'module',
		},
		rules: {
			'array-callback-return': ERROR,
			'capitalized-comments': [
				WARN,
				'never',
				{
					block: { ignorePattern: '.*' },
					line: {
						ignoreConsecutiveComments: true,
						ignorePattern: '[A-Z]*:.*',
					},
				},
			],
			complexity: [WARN, 15],
			'constructor-super': ERROR,
			'default-case': WARN,
			'default-case-last': WARN,
			'default-param-last': WARN,
			eqeqeq: WARN,
			'for-direction': ERROR,
			'func-style': [WARN, 'declaration', { allowArrowFunctions: true }],
			'getter-return': [ERROR, { allowImplicit: true }],
			'grouped-accessor-pairs': WARN,
			'max-classes-per-file': [WARN, { ignoreExpressions: true, max: 1 }],
			'max-params': [WARN, 5],
			'no-async-promise-executor': ERROR,
			'no-case-declarations': ERROR,
			'no-class-assign': ERROR,
			'no-compare-neg-zero': ERROR,
			'no-cond-assign': ERROR,
			'no-console': [WARN, { allow: ['info', ERROR, WARN] }],
			'no-const-assign': ERROR,
			'no-constant-binary-expression': ERROR,
			'no-constant-condition': ERROR,
			'no-control-regex': ERROR,
			'no-debugger': WARN,
			'no-delete-var': ERROR,
			'no-dupe-args': ERROR,
			'no-dupe-class-members': ERROR,
			'no-dupe-else-if': ERROR,
			'no-dupe-keys': ERROR,
			'no-duplicate-case': ERROR,
			'no-empty': ERROR,
			'no-empty-character-class': ERROR,
			'no-empty-pattern': ERROR,
			'no-empty-static-block': ERROR,
			'no-ex-assign': ERROR,
			'no-extra-boolean-cast': ERROR,
			'no-extra-label': WARN,
			'no-fallthrough': ERROR,
			'no-func-assign': ERROR,
			'no-global-assign': ERROR,
			'no-import-assign': ERROR,
			'no-invalid-regexp': ERROR,
			'no-irregular-whitespace': ERROR,
			'no-lonely-if': WARN,
			'no-loss-of-precision': ERROR,
			'no-misleading-character-class': ERROR,
			'no-mixed-spaces-and-tabs': [WARN, 'smart-tabs'],
			'no-new-native-nonconstructor': ERROR,
			'no-new-wrappers': WARN,
			'no-nonoctal-decimal-escape': ERROR,
			'no-obj-calls': ERROR,
			'no-octal': ERROR,
			'no-prototype-builtins': ERROR,
			'no-redeclare': ERROR,
			'no-regex-spaces': ERROR,
			'no-return-await': WARN,
			'no-self-assign': ERROR,
			'no-setter-return': ERROR,
			'no-shadow-restricted-names': ERROR,
			'no-sparse-arrays': ERROR,
			'no-this-before-super': ERROR,
			'no-throw-literal': ERROR,
			'no-undef': ERROR,
			'no-undef-init': WARN,
			'no-unexpected-multiline': ERROR,
			'no-unneeded-ternary': WARN,
			'no-unreachable': ERROR,
			'no-unsafe-finally': ERROR,
			'no-unsafe-negation': ERROR,
			'no-unsafe-optional-chaining': ERROR,
			'no-unused-labels': ERROR,
			'no-unused-private-class-members': ERROR,
			'no-unused-vars': ERROR,
			'no-useless-backreference': ERROR,
			'no-useless-catch': ERROR,
			'no-useless-computed-key': WARN,
			'no-useless-escape': ERROR,
			'no-with': ERROR,
			'object-shorthand': WARN,
			'prefer-arrow-callback': WARN,
			'prefer-exponentiation-operator': WARN,
			'prefer-promise-reject-errors': WARN,
			'prefer-regex-literals': WARN,
			'prefer-template': WARN,
			'quote-props': [WARN, 'as-needed'],
			quotes: [
				WARN,
				'single',
				{
					allowTemplateLiterals: false,
					avoidEscape: true,
				},
			],
			radix: [WARN, 'as-needed'],
			'require-await': ERROR,
			'require-yield': ERROR,
			'use-isnan': ERROR,
			'valid-typeof': ERROR,
			yoda: WARN,
		},
	},
	// #endregion

	// #region typescript
	typescript.configs.strict[0],
	{
		files: [TYPESCRIPT_GLOB],
		languageOptions: {
			parserOptions: {
				emitDecoratorMetadata: true,
				project: ['tsconfig.json'],
			},
		},
		rules: {
			...typescript.configs.strict[1].rules,
			...typescript.configs.strict[2].rules,
			'@typescript-eslint/ban-types': [
				ERROR,
				{
					types: { Function: false },
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				WARN,
				{
					fixStyle: 'inline-type-imports',
					prefer: 'type-imports',
				},
			],
			'@typescript-eslint/explicit-function-return-type': OFF,
			'@typescript-eslint/explicit-module-boundary-types': OFF,
			'@typescript-eslint/interface-name-prefix': OFF,
			'@typescript-eslint/no-empty-function': WARN,
			'@typescript-eslint/no-empty-interface': [
				ERROR,
				{ allowSingleExtends: true },
			],
			'@typescript-eslint/no-explicit-any': OFF,
			'@typescript-eslint/no-extraneous-class': OFF,
			'@typescript-eslint/no-floating-promises': [
				WARN,
				{
					ignoreIIFE: true,
					ignoreVoid: true,
				},
			],
			'@typescript-eslint/no-namespace': [
				WARN,
				{ allowDeclarations: true },
			],
			'@typescript-eslint/no-non-null-assertion': OFF,
			'@typescript-eslint/no-redundant-type-constituents': ERROR,
			'@typescript-eslint/no-unused-vars': [
				WARN,
				{
					args: 'after-used',
					caughtErrors: 'all',
					vars: 'local',
					varsIgnorePattern: '^_.*',
				},
			],
			'@typescript-eslint/no-use-before-define': [
				WARN,
				{
					classes: true,
					enums: true,
					functions: false,
					ignoreTypeReferences: true,
					typedefs: true,
					variables: true,
				},
			],
			'@typescript-eslint/sort-type-constituents': [
				WARN,
				{
					checkIntersections: true,
					checkUnions: true,
					groupOrder: [
						'named',
						'keyword',
						'operator',
						'literal',
						'function',
						'import',
						'conditional',
						'object',
						'tuple',
						'intersection',
						'union',
						'nullish',
					],
				},
			],
		},
	},
	// #endregion

	// #region sonar
	{
		files: [SRC_GLOB],
		plugins: { sonarjs },
		rules: {
			'sonarjs/cognitive-complexity': [WARN, 16],
			'sonarjs/max-switch-cases': [WARN, 12],
			'sonarjs/no-all-duplicated-branches': ERROR,
			'sonarjs/no-collapsible-if': ERROR,
			'sonarjs/no-collection-size-mischeck': ERROR,
			'sonarjs/no-duplicate-string': [WARN, { threshold: 5 }],
			'sonarjs/no-duplicated-branches': ERROR,
			'sonarjs/no-element-overwrite': ERROR,
			'sonarjs/no-identical-conditions': ERROR,
			'sonarjs/no-identical-expressions': ERROR,
			'sonarjs/no-identical-functions': ERROR,
			'sonarjs/no-ignored-return': ERROR,
			'sonarjs/no-inverted-boolean-check': ERROR,
			'sonarjs/no-nested-switch': ERROR,
			'sonarjs/no-nested-template-literals': ERROR,
			'sonarjs/no-redundant-boolean': ERROR,
			'sonarjs/no-same-line-conditional': ERROR,
			'sonarjs/no-small-switch': ERROR,
			'sonarjs/no-useless-catch': ERROR,
			'sonarjs/non-existent-operator': ERROR,
			'sonarjs/prefer-object-literal': ERROR,
			'sonarjs/prefer-single-boolean-return': ERROR,
			'sonarjs/prefer-while': ERROR,
		},
	},
	// #endregion

	// #region unicorn
	{
		files: [SRC_GLOB],
		plugins: { unicorn },
		rules: {
			'no-negated-condition': OFF,
			'no-nested-ternary': OFF,
			'unicorn/better-regex': WARN,
			'unicorn/catch-error-name': WARN,
			'unicorn/consistent-destructuring': ERROR,
			'unicorn/consistent-function-scoping': WARN,
			'unicorn/error-message': ERROR,
			'unicorn/escape-case': WARN,
			'unicorn/expiring-todo-comments': ERROR,
			'unicorn/explicit-length-check': WARN,
			'unicorn/filename-case': [
				ERROR,
				{
					cases: { kebabCase: true, pascalCase: true },
				},
			],
			'unicorn/new-for-builtins': ERROR,
			'unicorn/no-array-for-each': WARN,
			'unicorn/no-array-method-this-argument': ERROR,
			'unicorn/no-array-push-push': ERROR,
			'unicorn/no-await-expression-member': WARN,
			'unicorn/no-await-in-promise-methods': ERROR,
			'unicorn/no-console-spaces': WARN,
			'unicorn/no-empty-file': ERROR,
			'unicorn/no-hex-escape': WARN,
			'unicorn/no-instanceof-array': WARN,
			'unicorn/no-keyword-prefix': WARN,
			'unicorn/no-lonely-if': WARN,
			'unicorn/no-negated-condition': ERROR,
			'unicorn/no-new-array': ERROR,
			'unicorn/no-new-buffer': ERROR,
			'unicorn/no-process-exit': ERROR,
			'unicorn/no-single-promise-in-promise-methods': WARN,
			'unicorn/no-thenable': ERROR,
			'unicorn/no-this-assignment': WARN,
			'unicorn/no-typeof-undefined': WARN,
			'unicorn/no-unnecessary-await': ERROR,
			'unicorn/no-unreadable-array-destructuring': ERROR,
			'unicorn/no-unreadable-iife': ERROR,
			'unicorn/no-unused-properties': WARN,
			'unicorn/no-useless-fallback-in-spread': ERROR,
			'unicorn/no-useless-length-check': WARN,
			'unicorn/no-useless-spread': WARN,
			'unicorn/no-useless-switch-case': WARN,
			'unicorn/no-useless-undefined': WARN,
			'unicorn/no-zero-fractions': WARN,
			'unicorn/number-literal-case': WARN,
			'unicorn/numeric-separators-style': WARN,
			'unicorn/prefer-array-find': WARN,
			'unicorn/prefer-array-flat': WARN,
			'unicorn/prefer-array-flat-map': WARN,
			'unicorn/prefer-array-index-of': WARN,
			'unicorn/prefer-array-some': WARN,
			'unicorn/prefer-blob-reading-methods': WARN,
			'unicorn/prefer-code-point': WARN,
			'unicorn/prefer-date-now': WARN,
			'unicorn/prefer-default-parameters': WARN,
			'unicorn/prefer-event-target': WARN,
			'unicorn/prefer-export-from': WARN,
			'unicorn/prefer-includes': WARN,
			'unicorn/prefer-json-parse-buffer': WARN,
			'unicorn/prefer-logical-operator-over-ternary': WARN,
			'unicorn/prefer-math-trunc': WARN,
			'unicorn/prefer-modern-math-apis': WARN,
			'unicorn/prefer-module': ERROR,
			'unicorn/prefer-native-coercion-functions': WARN,
			'unicorn/prefer-negative-index': WARN,
			'unicorn/prefer-node-protocol': ERROR,
			'unicorn/prefer-number-properties': WARN,
			'unicorn/prefer-object-from-entries': WARN,
			'unicorn/prefer-prototype-methods': WARN,
			'unicorn/prefer-reflect-apply': WARN,
			'unicorn/prefer-regexp-test': WARN,
			'unicorn/prefer-set-has': WARN,
			'unicorn/prefer-set-size': WARN,
			'unicorn/prefer-spread': WARN,
			'unicorn/prefer-string-replace-all': WARN,
			'unicorn/prefer-string-slice': WARN,
			'unicorn/prefer-string-starts-ends-with': WARN,
			'unicorn/prefer-string-trim-start-end': WARN,
			'unicorn/prefer-switch': WARN,
			'unicorn/prefer-top-level-await': WARN,
			'unicorn/prefer-type-error': WARN,
			'unicorn/require-array-join-separator': WARN,
			'unicorn/require-number-to-fixed-digits-argument': ERROR,
			'unicorn/string-content': WARN,
			'unicorn/template-indent': WARN,
			'unicorn/text-encoding-identifier-case': WARN,
			'unicorn/throw-new-error': ERROR,
		},
	},
	// #endregion

	// #region perfectionist
	{
		files: [SRC_GLOB],
		plugins: { perfectionist },
		rules: {
			'perfectionist/sort-array-includes': [
				WARN,
				{
					'ignore-case': false,
					order: 'asc',
					'spread-last': true,
					type: 'natural',
				},
			],
			'perfectionist/sort-classes': [
				WARN,
				{
					groups: [
						'method',
						'private-method',
						'constructor',
						'property',
						'private-property',
						['get-method', 'set-method'],
						'index-signature',
						'static-property',
						'static-method',
						'unknown',
					],
					'ignore-case': false,
					order: 'asc',
					type: 'natural',
				},
			],
			'perfectionist/sort-enums': [
				WARN,
				{ 'ignore-case': false, order: 'asc', type: 'natural' },
			],
			'perfectionist/sort-exports': [
				WARN,
				{ 'ignore-case': false, order: 'asc', type: 'natural' },
			],
			'perfectionist/sort-imports': [
				WARN,
				{
					groups: [
						'type',
						'internal-type',
						['builtin', 'external'],
						'internal',
						['parent-type', 'sibling-type', 'index-type'],
						['parent', 'sibling', 'index'],
						'object',
						'unknown',
					],
					'ignore-case': false,
					'internal-pattern': ['~/**'],
					'newlines-between': 'ignore',
					order: 'asc',
					type: 'natural',
				},
			],
			'perfectionist/sort-interfaces': [
				WARN,
				{
					'custom-groups': { top: 'id' },
					groups: ['top', 'unknown'],
					'ignore-case': false,
					order: 'asc',
					'partition-by-new-line': true,
					type: 'natural',
				},
			],
			'perfectionist/sort-jsx-props': [
				WARN,
				{ 'ignore-case': false, order: 'asc', type: 'natural' },
			],
			'perfectionist/sort-maps': [
				WARN,
				{ 'ignore-case': false, order: 'asc', type: 'natural' },
			],
			'perfectionist/sort-named-exports': [
				WARN,
				{ 'ignore-case': false, order: 'asc', type: 'natural' },
			],
			'perfectionist/sort-named-imports': [
				WARN,
				{ 'ignore-case': false, order: 'asc', type: 'natural' },
			],
			'perfectionist/sort-object-types': [
				WARN,
				{
					'custom-groups': { top: 'id' },
					groups: ['top', 'unknown'],
					'ignore-case': false,
					order: 'asc',
					'partition-by-new-line': true,
					type: 'natural',
				},
			],
			'perfectionist/sort-objects': [
				WARN,
				{
					'custom-groups': { top: 'id' },
					groups: ['top', 'unknown'],
					'ignore-case': false,
					order: 'asc',
					'partition-by-comment': '#region**',
					'partition-by-new-line': true,
					type: 'natural',
				},
			],
		},
	},
	// #endregion

	// #region promise
	{
		files: [SRC_GLOB],
		plugins: { promise },
		rules: {
			'promise/always-return': WARN,
			'promise/catch-or-return': ERROR,
			'promise/no-callback-in-promise': WARN,
			'promise/no-new-statics': ERROR,
			'promise/no-return-in-finally': WARN,
			'promise/param-names': ERROR,
			'promise/valid-params': WARN,
		},
	},
	// #endregion

	// #region regexp
	{
		files: [SRC_GLOB],
		plugins: { regexp },
		rules: {
			'no-control-regex': ERROR,
			'no-empty-character-class': OFF,
			'no-invalid-regexp': OFF,
			'no-misleading-character-class': ERROR,
			'no-regex-spaces': ERROR,
			'no-useless-backreference': OFF,
			'prefer-regex-literals': WARN,
			'regexp/confusing-quantifier': WARN,
			'regexp/control-character-escape': ERROR,
			'regexp/grapheme-string-literal': ERROR,
			'regexp/hexadecimal-escape': ERROR,
			'regexp/letter-case': ERROR,
			'regexp/match-any': ERROR,
			'regexp/negation': ERROR,
			'regexp/no-contradiction-with-assertion': ERROR,
			'regexp/no-control-character': ERROR,
			'regexp/no-dupe-characters-character-class': ERROR,
			'regexp/no-dupe-disjunctions': ERROR,
			'regexp/no-empty-alternative': WARN,
			'regexp/no-empty-capturing-group': ERROR,
			'regexp/no-empty-character-class': ERROR,
			'regexp/no-empty-group': ERROR,
			'regexp/no-empty-lookarounds-assertion': ERROR,
			'regexp/no-empty-string-literal': ERROR,
			'regexp/no-escape-backspace': ERROR,
			'regexp/no-extra-lookaround-assertions': ERROR,
			'regexp/no-invalid-regexp': ERROR,
			'regexp/no-invisible-character': ERROR,
			'regexp/no-lazy-ends': WARN,
			'regexp/no-legacy-features': ERROR,
			'regexp/no-misleading-capturing-group': ERROR,
			'regexp/no-misleading-unicode-character': ERROR,
			'regexp/no-missing-g-flag': ERROR,
			'regexp/no-non-standard-flag': ERROR,
			'regexp/no-obscure-range': ERROR,
			'regexp/no-octal': ERROR,
			'regexp/no-optional-assertion': ERROR,
			'regexp/no-potentially-useless-backreference': WARN,
			'regexp/no-standalone-backslash': ERROR,
			'regexp/no-super-linear-backtracking': ERROR,
			'regexp/no-super-linear-move': ERROR,
			'regexp/no-trivially-nested-assertion': ERROR,
			'regexp/no-trivially-nested-quantifier': ERROR,
			'regexp/no-unused-capturing-group': ERROR,
			'regexp/no-useless-assertions': ERROR,
			'regexp/no-useless-backreference': ERROR,
			'regexp/no-useless-character-class': ERROR,
			'regexp/no-useless-dollar-replacements': ERROR,
			'regexp/no-useless-escape': ERROR,
			'regexp/no-useless-flag': WARN,
			'regexp/no-useless-lazy': ERROR,
			'regexp/no-useless-non-capturing-group': ERROR,
			'regexp/no-useless-quantifier': ERROR,
			'regexp/no-useless-range': ERROR,
			'regexp/no-useless-set-operand': ERROR,
			'regexp/no-useless-string-literal': ERROR,
			'regexp/no-useless-two-nums-quantifier': ERROR,
			'regexp/no-zero-quantifier': ERROR,
			'regexp/optimal-lookaround-quantifier': WARN,
			'regexp/optimal-quantifier-concatenation': ERROR,
			'regexp/prefer-character-class': ERROR,
			'regexp/prefer-d': ERROR,
			'regexp/prefer-escape-replacement-dollar-char': ERROR,
			'regexp/prefer-lookaround': ERROR,
			'regexp/prefer-named-backreference': ERROR,
			'regexp/prefer-named-capture-group': ERROR,
			'regexp/prefer-named-replacement': ERROR,
			'regexp/prefer-plus-quantifier': ERROR,
			'regexp/prefer-predefined-assertion': ERROR,
			'regexp/prefer-quantifier': ERROR,
			'regexp/prefer-question-quantifier': ERROR,
			'regexp/prefer-range': ERROR,
			'regexp/prefer-regexp-exec': ERROR,
			'regexp/prefer-regexp-test': ERROR,
			'regexp/prefer-result-array-groups': ERROR,
			'regexp/prefer-set-operation': ERROR,
			'regexp/prefer-star-quantifier': ERROR,
			'regexp/prefer-unicode-codepoint-escapes': ERROR,
			'regexp/prefer-w': ERROR,
			'regexp/require-unicode-regexp': ERROR,
			'regexp/require-unicode-sets-regexp': ERROR,
			'regexp/simplify-set-operations': ERROR,
			'regexp/sort-alternatives': ERROR,
			'regexp/sort-character-class-elements': ERROR,
			'regexp/sort-flags': ERROR,
			'regexp/strict': ERROR,
			'regexp/unicode-escape': ERROR,
			'regexp/unicode-property': ERROR,
			'regexp/use-ignore-case': ERROR,
		},
	},
	// #endregion

	// #region redos
	{
		files: [SRC_GLOB],
		plugins: { redos },
		rules: { 'redos/no-vulnerable': ERROR },
	},
	// #endregion

	// #region prettier
	{
		files: [CODE_STYLE_GLOB],
		...prettier,
		rules: { 'prettier/prettier': WARN },
	},
	// #endregion

	// #region tsdoc
	{
		files: [SRC_GLOB],
		plugins: { tsdoc },
		rules: { 'tsdoc/syntax': WARN },
	},
	// #endregion

	// #region vitest
	{
		files: [TEST_GLOB],
		plugins: { vitest },
		rules: {
			'max-classes-per-file': OFF,
			'unicorn/consistent-function-scoping': OFF,
			'unicorn/no-unsafe-regex': OFF,
			'vitest/expect-expect': OFF,
			'vitest/max-expects': WARN,
			'vitest/max-nested-describe': WARN,
			'vitest/no-alias-methods': ERROR,
			'vitest/no-conditional-expect': WARN,
			'vitest/no-conditional-in-test': WARN,
			'vitest/no-conditional-tests': WARN,
			'vitest/no-disabled-tests': WARN,
			'vitest/no-done-callback': WARN,
			'vitest/no-duplicate-hooks': WARN,
			'vitest/no-focused-tests': WARN,
			'vitest/no-large-snapshots': WARN,
			'vitest/no-mocks-import': OFF,
			'vitest/no-restricted-matchers': WARN,
			'vitest/no-restricted-vi-methods': WARN,
			'vitest/no-standalone-expect': WARN,
			'vitest/no-test-prefixes': WARN,
			'vitest/no-test-return-statement': WARN,
			'vitest/prefer-called-exactly-once-with': OFF,
			'vitest/prefer-comparison-matcher': WARN,
			'vitest/prefer-each': WARN,
			'vitest/prefer-equality-matcher': WARN,
			'vitest/prefer-expect-assertions': OFF,
			'vitest/prefer-expect-resolves': WARN,
			'vitest/prefer-hooks-in-order': WARN,
			'vitest/prefer-hooks-on-top': WARN,
			'vitest/prefer-mock-promise-shorthand': WARN,
			'vitest/prefer-snapshot-hint': WARN,
			'vitest/prefer-spy-on': OFF,
			'vitest/prefer-strict-equal': WARN,
			'vitest/prefer-to-be': WARN,
			'vitest/prefer-to-be-object': WARN,
			'vitest/prefer-to-contain': WARN,
			'vitest/prefer-to-have-length': WARN,
			'vitest/prefer-todo': WARN,
			'vitest/valid-title': OFF,
		},
	},
	// #endregion
];
