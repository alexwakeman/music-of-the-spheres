export const ARTIST_SEARCH_DONE = 'ARTIST_SEARCH_DONE';
export const SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';

export function searchDone(data) {
	return {
		type: ARTIST_SEARCH_DONE,
		data: data
	}
}

export function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	}
}