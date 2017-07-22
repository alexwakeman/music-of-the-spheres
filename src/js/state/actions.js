export const ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
export const ARTIST_ALBUMS_AVAILABLE = 'ARTIST_ALBUMS_AVAILABLE';
export const SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
export const RELATED_CLICK = 'RELATED_CLICK';
export const SHOW_RELATED = 'SHOW_RELATED';
export const HIDE_RELATED = 'HIDE_RELATED';
export const CLEAR_SESSION = 'CLEAR_SESSION';

export function artistDataAvailable(data) {
	return {
		type: ARTIST_DATA_AVAILABLE,
		data: data
	}
}

export function artistAlbumsAvailable(data) {
	return {
		type: ARTIST_ALBUMS_AVAILABLE,
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

export function showRelated(relatedArtist) {
	return {
		type: SHOW_RELATED,
		data: relatedArtist
	}
}

export function hideRelated() {
	return {
		type: HIDE_RELATED,
		data: null
	}
}

export function clearSession() {
	return {
		type: CLEAR_SESSION
	}
}
