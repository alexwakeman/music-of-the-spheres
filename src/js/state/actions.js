export const ARTIST_SEARCH_START = 'ARTIST_SEARCH_START';
export const ARTIST_SEARCH_DONE = 'ARTIST_SEARCH_DONE';


export function startSearch(term) {
    return {
        type: ARTIST_SEARCH_START,
        term: term
    }
}

export function searchDone(data) {
	return {
		type: ARTIST_SEARCH_START,
		data: data
	}
}