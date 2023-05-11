const isProductionLinting = process.env.NODE_ENV === 'production'

console.log({ isProductionLinting })

module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['tsconfig.json'],
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:astro/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
		browser: true,
	},
	rules: {
		'prettier/prettier': [
			'error',
			{
				trailingComma: 'all',
				semi: false,
				singleQuote: true,
				bracketSpacing: true,
				useTabs: true,
			},
		],
		quotes: isProductionLinting
			? ['error', 'single', { avoidEscape: true }]
			: 'off',
		indent: isProductionLinting ? ['warn', 'tab'] : 'off',
		'no-mixed-spaces-and-tabs': isProductionLinting ? 'error' : 'off',

		'no-console': isProductionLinting ? 'error' : 'off',
		'no-debugger': isProductionLinting ? 'error' : 'off',

		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': isProductionLinting ? 'error' : 'off',
		'no-unused-expressions': isProductionLinting ? 'error' : 'off',

		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-ts-comment': isProductionLinting ? 'error' : 'off',

		// the rule below still does not cover the cases of awaiting in 'for await...of' loops
		'no-await-in-loop': 'error',

		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/no-floating-promises': 'error',

		// TODO: temporary disabled. talk, decide [and enable]
		'@typescript-eslint/require-await': 'off',
		'no-var': 'off',
		'simple-import-sort/imports': isProductionLinting ? 'error' : 'off',
		'simple-import-sort/exports': isProductionLinting ? 'error' : 'off',
	},
	overrides: [
		{
			// Define the configuration for `.astro` file.
			files: ['**/*.astro'],
			// Allows Astro components to be parsed.
			parser: 'astro-eslint-parser',
			// Parse the script in `.astro` as TypeScript by adding the following configuration.
			// It's the setting you need when using TypeScript.
			parserOptions: {
				project: ['tsconfig.json'],
				tsconfigRootDir: __dirname,
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro'],
			},
		},
	],
}
