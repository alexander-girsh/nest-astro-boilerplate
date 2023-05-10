import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import DotEnv from 'dotenv'
import path from 'node:path'

DotEnv.config({ path: path.resolve(process.cwd(), './.env/.env.dev') })
DotEnv.config({ path: path.resolve(process.cwd(), './.env/.env.secrets') })

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	await app.listen(process.env.BACKEND_PORT)
}
void bootstrap()
