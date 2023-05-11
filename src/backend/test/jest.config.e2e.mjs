export default {
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '../../', // src
	testEnvironment: 'node',
	testRegex: 'src/backend/(.*)\\.e2e-spec.ts$',
	transform: {
		'^.+\\.(t|j)s$': ['ts-jest', { useESM: true }],
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
}
