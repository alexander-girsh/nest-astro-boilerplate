/* example dto's */

export class AppRequestDTO {
	filter: {
		keyword: string
	}
}

export class AppResponseDTO {
	items: { title: string }[]
	applied: AppRequestDTO
}
