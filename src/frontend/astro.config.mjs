import { defineConfig } from 'astro/config'
import DotEnv from 'dotenv'
import path from 'path'

const isProduction = process.env.NODE_ENV === 'production'
const isTesting = !isProduction && process.env.NODE_ENV === 'test'
const isDev = !isProduction && !isTesting

DotEnv.config({ path: path.resolve(process.cwd(), '.env/.env.secrets') })

if (isDev) {
	DotEnv.config({ path: path.resolve(process.cwd(), '.env/.env.dev') })
} else if (isTesting) {
	DotEnv.config({ path: path.resolve(process.cwd(), '.env/.env.e2e') })
}

// https://astro.build/config
export default defineConfig({
	vite: {
		optimizeDeps: { exclude: ['fsevents'] },
	},
	srcDir: 'src/frontend',
	server: {
		port: parseInt(process.env.FRONTEND_PORT),
	},
})
