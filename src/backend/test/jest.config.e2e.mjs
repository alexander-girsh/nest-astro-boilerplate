import { pathsToModuleNameMapper } from 'ts-jest'
import tsconfig from '../../../tsconfig.json' assert { type: 'json' }
export default {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '../../', // src
	testEnvironment: 'node',
	testRegex: 'src/backend/(.*)\\.e2e-spec.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths),
	modulePaths: ['<rootDir>'],
}
