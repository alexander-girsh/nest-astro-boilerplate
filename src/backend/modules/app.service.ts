import { Injectable } from '@nestjs/common'
import { DBService } from './database/database.service'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class AppService {
	constructor(
		private readonly dbService: DBService,
		private readonly logger: PinoLogger,
	) {
		// dbService and injected logger usage example
	}
	getHello(): string {
		return 'Hello World!'
	}

	async checkDBConnection() {
		await this.dbService
			.query(`SELECT 1`)
			.then((r) => r.rows)
			.then((r) => this.logger.info(r))
		return true
	}
}
