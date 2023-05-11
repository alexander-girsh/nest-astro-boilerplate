import { Injectable, Scope } from '@nestjs/common'
import PG from 'pg'
import { PinoLogger } from 'nestjs-pino'
import createSubscriber from 'pg-listen'
import type { Subscriber } from 'pg-listen'
import { DatabaseConfig } from './database.config.js'

PG.types.setTypeParser(PG.types.builtins.NUMERIC, (value) =>
	value === null ? value : +value,
)

PG.types.setTypeParser(
	// @ts-ignore
	PG.types.builtins.BIGINT,
	(value) => (value === null ? value : +value),
)

export type PGAfterCommitCallbackFn = () => void | Promise<void>

export interface PGTransactionClient extends PG.PoolClient {
	afterTransactionCommit: (callbackFn: PGAfterCommitCallbackFn) => void
	afterCommitCallbacks: PGAfterCommitCallbackFn[]
}

export function isDatabaseError(err: unknown): err is PG.DatabaseError {
	return err instanceof Error && 'code' in err
}

export enum PGTransactionIsolationLevels {
	'READ COMMITTED' = 'READ COMMITTED',
	'REPEATABLE READ' = 'REPEATABLE READ',
	'SERIALIZABLE' = 'SERIALIZABLE',
}

@Injectable({ scope: Scope.DEFAULT }) // singleton
export class DBService {
	private pool: PG.Pool
	private isReconnecting = false

	constructor(
		private readonly config: DatabaseConfig,
		private readonly logger: PinoLogger,
	) {
		this.createPool()
	}

	private get poolConfig() {
		return {
			host: this.config.PG_HOST,
			port: this.config.PG_PORT,
			database: this.config.PG_DATABASE,
			user: this.config.PG_USERNAME,
			password: this.config.PG_PASSWORD,

			ssl: this.config.PG_SSL_MODE_OFF
				? false
				: {
						rejectUnauthorized: false,
				  },
		}
	}

	private createPool() {
		this.pool = new PG.Pool(this.poolConfig)

		this.pool.on('error', (err) => {
			this.logger.error({ err }, `Unexpected error of database connection`)

			this.reconnect()
		})
	}

	private reconnect() {
		if (!this.isReconnecting) {
			this.isReconnecting = true
			let currentAttempt = 0
			const reconnectionInterval = setInterval(() => {
				if (currentAttempt >= this.config.RECONNECTION_ATTEMPTS) {
					this.logger.fatal('Can not reconnect to DB')
					clearInterval(reconnectionInterval)
					this.isReconnecting = false
					process.exit(1)
				}
				currentAttempt++
				this.logger.info('Reconnection attempt #' + currentAttempt)
				this.pool
					.connect()
					.then((client) => {
						this.onClientConnected(client)
						this.isReconnecting = false
						clearInterval(reconnectionInterval)
					})
					.catch((err) => this.pool.emit('error', err))
			}, this.config.RECONNECTION_DELAY)
		}
	}

	private onClientConnected(client: PG.PoolClient) {
		this.pool.emit('connect')
		this.logger.info(`DB client connected to ${this.config.PG_HOST}`)
		client.on('error', (err: Error) => {
			this.logger.error(`DB client disconnected, trying to reconnect...`, {
				err,
			})
			if (isDatabaseError(err)) {
				if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
					this.reconnect()
				}
			}
		})
	}

	public async addSubscriber(
		subscriberPayload: (subscriber: Subscriber<any>) => Promise<void>,
	) {
		try {
			const subscriber = createSubscriber(this.poolConfig)
			await subscriber.connect()

			return await subscriberPayload(subscriber)
		} catch (err) {
			this.logger.error({ err }, `addSubscriber() err:`, err)
		}
	}

	private async createNewClient() {
		const client = await this.pool.connect()

		this.logger.info({
			labels: ['pg-pool'],
			request: 'createNewClient',
			status: 'SUCCESS',
			pool_state: {
				totalCount: this.pool.totalCount,
				idleCount: this.pool.idleCount,
				waitingCount: this.pool.waitingCount,
			},
		})

		return client
	}

	public async execRepeatableTransaction(
		payload: (transactionClient: PGTransactionClient) => any,
		{
			ISOLATION_LEVEL = PGTransactionIsolationLevels['READ COMMITTED'],
			retriesLimit = this.config.DB_TRANSACTIONS_RETRIES_LIMIT,
		},
	) {
		let client: PGTransactionClient

		try {
			client = (await this.pool.connect()) as PGTransactionClient
			client.afterCommitCallbacks = []
			client.afterTransactionCommit = (callback) => {
				if (typeof callback !== 'function') {
					throw new Error('.callback should be of type Function')
				}

				if (client.afterCommitCallbacks.includes(callback)) {
					throw new Error(
						`callback ${callback} already added to after transaction commit callbacks queue`,
					)
				}

				client.afterCommitCallbacks.push(callback)

				this.logger.debug('afterTransactionCommit callback added', {
					callback: callback.toString(),
				})
			}

			/* eslint-disable no-await-in-loop */
			for (
				let retries_count = 0;
				retries_count < retriesLimit;
				retries_count++
			) {
				try {
					await client.query('BEGIN')

					await client.query('START TRANSACTION')

					await client.query(
						`SET LOCAL TRANSACTION ISOLATION LEVEL ${ISOLATION_LEVEL}`,
					)

					const result = await payload(client)

					await client.query('COMMIT')

					this.logger.debug(
						'transaction committed, doing after commit callbacks',
						{
							callbacksCount: client.afterCommitCallbacks.length,
						},
					)
					for await (const callback of client.afterCommitCallbacks) {
						const callbackResult = await callback()
						this.logger.debug('after commit callback returned result', {
							callback: callback.toString(),
							callbackResult,
						})
					}

					this.logger.debug('after commit callbacks done')

					return result
				} catch (err) {
					if (isDatabaseError(err)) {
						/* need try to do & commit payload again */
						if (
							err.routine === 'PreCommit_CheckForSerializationFailure' ||
							Number(err.code) === 40001
						) {
							// could not serialize access due to concurrent update
							await client.query('ROLLBACK')
							await client.query('END')
							continue
						}
					}

					/* unknown err, stopping */
					throw err
				}
				/* eslint-enable no-await-in-loop */
			}
		} catch (err) {
			this.logger.fatal(err)

			if (client) {
				await client.query('ROLLBACK')
				this.logger.debug('transaction rolled back')
			}

			const e: Error & { initialError?: typeof err } = new Error(
				'Transaction was rolled back',
			)
			e.initialError = err
			throw e
		} finally {
			if (client) {
				await client.query('END')
			}

			this.releaseClientSilly(client)
		}
	}

	private releaseClientSilly(client: PG.PoolClient) {
		try {
			client.release()
		} catch (e) {
			if (
				isDatabaseError(e) &&
				e.message !==
					'Release called on client which has already been released to the pool.'
			) {
				this.logger.error(`releaseClientSilly() err:`, e)
				throw e
			}
			/** doing nothing */
		}
	}

	public async query(query: string, params?: any[]): Promise<PG.QueryResult> {
		let query_start_timestamp: number
		let query_result: PG.QueryResult

		try {
			/** adding new connection to pool if there is no free connections */
			if (!this.pool.idleCount || this.pool.waitingCount) {
				const client = await this.pool.connect()
				this.onClientConnected(client)
				this.releaseClientSilly(client)
			}

			query_start_timestamp = Date.now()

			return await this.pool.query(query, params)
		} catch (e) {
			throw e
		} finally {
			const query_end_timestamp = Date.now()
			if (this.config.PG_POOL_QUERIES_VERBOSE_MODE) {
				process.nextTick(() => {
					this.logger.info({
						labels: ['pg-pool'],
						query,
						params,
						query_result_status:
							query_result instanceof Error ? 'ERROR' : 'SUCCESS',
						time_spent_ms: query_end_timestamp - query_start_timestamp,
						pool_state: {
							total_count: this.pool.totalCount,
							idle_count: this.pool.idleCount,
							waiting_count: this.pool.waitingCount,
						},
					})
				})
			}
		}
	}

	public async closeAllConnections() {
		await this.pool.end()
	}
}
