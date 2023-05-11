import { Controller, Get, Post, Body } from '@nestjs/common'
import { AppService } from './app.service.js'
import { AppRequestDTO, AppResponseDTO } from './dto/app.dto.js'

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello() {
		return this.appService.getHello()
	}

	@Post('/examplePost')
	examplePost(@Body() { filter }: AppRequestDTO): AppResponseDTO {
		return {
			items: [{ title: '12345' }],
			applied: { filter },
		}
	}
}
