import path from 'node:path'

import { Module } from '@nestjs/common'
import { dotenvLoader, TypedConfigModule } from 'nest-typed-config'
import { LoggerModule } from 'nestjs-pino'

import { AppConfig } from './app.config.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { DatabaseConfig } from './database/database.config.js'
import { DBModule } from './database/database.module.js'

const isProduction = process.env.NODE_ENV === 'production'
const isTesting = !isProduction && process.env.NODE_ENV === 'test'
const isDev = !isProduction && !isTesting

const envFiles = []

if (isTesting) {
	envFiles.push(path.resolve(process.cwd(), './.env/.env.e2e'))
} else if (isDev) {
	envFiles.push(path.resolve(process.cwd(), './.env/.env.dev'))
}

if (!isProduction) {
	envFiles.push(path.resolve(process.cwd(), './.env/.env.secrets'))
}

export const useConfig = (schema) =>
	TypedConfigModule.forRoot({
		isGlobal: true,
		schema,
		load: [
			dotenvLoader({
				envFilePath: envFiles,
			}),
		],
		normalize: (env) => {
			// 'true' >> true, '123' >> 123, 'null' >> null etc.
			for (const key in env) {
				if (env[key] === 'undefined') {
					env[key] = undefined
				} else if (env[key] === 'null') {
					env[key] = null
				} else if (
					!Number.isNaN(parseFloat(env[key])) &&
					parseFloat(env[key]).toString() === env[key]
				) {
					env[key] = parseFloat(env[key])
				} else if (env[key] === 'true') {
					env[key] = true
				} else if (env[key] === 'false') {
					env[key] = false
				}
			}
			return env
		},
	})

export const useLogger = () =>
	LoggerModule.forRoot({
		pinoHttp: {
			transport: { target: 'pino-pretty' },
		},
	})

@Module({
	imports: [
		useLogger(),
		useConfig(AppConfig),
		useConfig(DatabaseConfig),
		DBModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
