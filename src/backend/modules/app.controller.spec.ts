import { Test, TestingModule } from '@nestjs/testing'
import { LoggerModule } from 'nestjs-pino'

import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { DBService } from './database/database.service.js'

describe('AppController', () => {
	let appController: AppController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
			imports: [LoggerModule.forRoot()],
		})
			.useMocker((token) => {
				if (token === DBService) {
					return {
						query: jest
							.fn()
							.mockResolvedValue({ rows: [{ mockedColumn: 'mockedValue' }] }),
						execRepeatableTransaction: jest.fn().mockResolvedValue(null),
					}
				}
			})
			.compile()

		appController = app.get<AppController>(AppController)
	})

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(appController.getHello()).toBe('Hello World!')
		})
		it('should return a json', () => {
			expect(
				appController.examplePost({ filter: { keyword: '123' } }),
			).toMatchObject({
				items: [{ title: '12345' }],
				applied: { filter: { keyword: '123' } },
			})
		})
	})
})
