import { Module } from '@nestjs/common'
import { DBService } from './database.service.js'

@Module({
	providers: [DBService],
	exports: [DBService],
})
export class DBModule {}
