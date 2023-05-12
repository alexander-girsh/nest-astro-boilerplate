import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../modules/app.module.js';
import { AppService } from '../modules/app.service.js';
import { DBService } from '../modules/database/database.service.js';

let app: INestApplication;
let appService: AppService;
let dbService: DBService;

beforeEach(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();
	appService = app.get(AppService);
	dbService = app.get(DBService);
});

afterAll(async () => {
	await dbService.closeAllConnections();
});

describe('AppController (e2e)', () => {
	it('/(GET)', () => {
		return request(app.getHttpServer())
			.get('/')
			.expect(200)
			.expect('Hello World!');
	});

	it('/examplePost (POST)', () => {
		return request(app.getHttpServer()).post('/examplePost');
	});
});

describe('AppService (e2e)', () => {
	it('establishes the DB connection', async () => {
		await expect(appService.checkDBConnection()).resolves.toBe(true);
	});
});
