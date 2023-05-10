import { IsString, IsInt, IsBoolean, IsDefined } from 'class-validator'

export class DatabaseConfig {
	@IsString()
	@IsDefined()
	public readonly PG_HOST!: string
	@IsInt()
	@IsDefined()
	public readonly PG_PORT!: number
	@IsString()
	@IsDefined()
	public readonly PG_DATABASE!: string
	@IsString()
	@IsDefined()
	public readonly PG_USERNAME!: string
	@IsString()
	@IsDefined()
	public readonly PG_PASSWORD!: string
	@IsBoolean()
	@IsDefined()
	public readonly PG_SSL_MODE_OFF!: boolean
	@IsInt()
	@IsDefined()
	public readonly RECONNECTION_ATTEMPTS = 100
	@IsInt()
	@IsDefined()
	public readonly RECONNECTION_DELAY = 500
	@IsInt()
	@IsDefined()
	public readonly DB_TRANSACTIONS_RETRIES_LIMIT = 10
	@IsBoolean()
	@IsDefined()
	public readonly PG_POOL_QUERIES_VERBOSE_MODE = false
}
