import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

import { DBService } from './database/database.service.js'

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
			.query('SELECT 1')
			.then((r) => r.rows)
			.then((r) => this.logger.info(r))
		return true
	}
}
