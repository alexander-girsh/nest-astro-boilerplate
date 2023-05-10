import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import DotEnv from 'dotenv'
import path from 'node:path'

const isProduction = process.env.NODE_ENV === 'production'
const isTesting = !isProduction && process.env.NODE_ENV === 'test'
const isDev = !isProduction && !isTesting

DotEnv.config({ path: path.resolve(process.cwd(), '.env/.env.secrets') })

if (isDev) {
	DotEnv.config({ path: path.resolve(process.cwd(), '.env/.env.dev') })
} else if (isTesting) {
	DotEnv.config({ path: path.resolve(process.cwd(), '.env/.env.e2e') })
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	await app.listen(process.env.BACKEND_PORT)
}
void bootstrap()
