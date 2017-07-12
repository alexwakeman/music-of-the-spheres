export const ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
export const SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
export const RELATED_CLICK = 'RELATED_CLICK';

export function artistDataAvailable(data) {
	return {
		type: ARTIST_DATA_AVAILABLE,
		data: data
	}
}

export function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	}
}

export function relatedClick() {
	return {
		type: RELATED_CLICK
	}
}
