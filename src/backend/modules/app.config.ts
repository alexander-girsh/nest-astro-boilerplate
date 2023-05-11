import { IsDefined, IsInt, IsNumber, IsPositive } from 'class-validator'

export class AppConfig {
	@IsNumber()
	@IsPositive()
	@IsInt()
	@IsDefined()
	public readonly BACKEND_PORT!: number
}
