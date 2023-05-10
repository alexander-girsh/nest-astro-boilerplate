/* example dto's */

export class AppRequestDTO {
	pagination: {
		offset: number
		limit: number
	}
}

export class AppResponseDTO {
	totalFound: number
	items: { title: string; price: number }[]
}
