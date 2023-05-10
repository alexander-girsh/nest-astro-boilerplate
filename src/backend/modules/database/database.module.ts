import { Module } from '@nestjs/common'
import { DBService } from './database.service'

@Module({
	providers: [DBService],
	exports: [DBService],
})
export class DBModule {}
