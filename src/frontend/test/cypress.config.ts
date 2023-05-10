import { defineConfig } from 'cypress'
import DotEnv from 'dotenv'
import path from 'node:path'

DotEnv.config({ path: path.resolve(process.cwd(), '../../../.env/.env.dev') })
DotEnv.config({
	path: path.resolve(process.cwd(), '../../../.env/.env.secrets'),
})

export default defineConfig({
	e2e: {
		supportFile: false,
		// baseUrl: `http://localhost:${process.env.FRONTEND_PORT}/`,
	},
})
