import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app.module.js'
import { AppConfig } from './modules/app.config.js'
import { Logger, PinoLogger } from 'nestjs-pino'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true })
	app.useLogger(app.get(Logger))

	const appConfig = app.get(AppConfig)

	await app.listen(appConfig.BACKEND_PORT, async () => {
		const logger = await app.resolve(PinoLogger)
		logger.info(`listening on :${appConfig.BACKEND_PORT}`)
	})
}
void bootstrap()
