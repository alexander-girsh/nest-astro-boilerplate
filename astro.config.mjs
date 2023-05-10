import { defineConfig } from 'astro/config'
import DotEnv from 'dotenv'
import path from 'node:path'

DotEnv.config({ path: path.resolve(process.cwd(), './.env/.env.dev') })

// https://astro.build/config
export default defineConfig({
	srcDir: 'src/frontend',
	server: {
		port: parseInt(process.env.FRONTEND_PORT),
	},
})
