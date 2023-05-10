import { IsDefined, IsNumber, IsPositive, IsInt } from 'class-validator'

export class AppConfig {
	@IsNumber()
	@IsPositive()
	@IsInt()
	@IsDefined()
	public readonly BACKEND_PORT!: number
}
