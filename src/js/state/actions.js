export const ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
export const UPDATE_DISPLAY_ARTIST = 'UPDATE_DISPLAY_ARTIST';
export const SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
export const RELATED_CLICK = 'RELATED_CLICK';
export const SHOW_RELATED_INFO_HOVER = 'SHOW_RELATED_INFO_HOVER';
export const SHOW_RELATED_INFO_CLICK = 'SHOW_RELATED_INFO_CLICK';
export const HIDE_RELATED_INFO = 'HIDE_RELATED_INFO';
export const CLEAR_SESSION = 'CLEAR_SESSION';
export const LOAD_ALBUM = 'LOAD_ALBUM';

export function artistDataAvailable(data) {
	return {
		type: ARTIST_DATA_AVAILABLE,
		data: data
	}
}

export function displayArtist(data) {
	return {
		type: UPDATE_DISPLAY_ARTIST,
		data: data
	}
}

export function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	}
}

export function relatedClick(relatedArtist) {
	return {
		type: RELATED_CLICK,
		data: relatedArtist
	}
}

export function showRelated(relatedArtist) {
	return {
		type: SHOW_RELATED_INFO_HOVER,
		data: relatedArtist
	}
}

export function showRelatedClick(relatedArtist) {
    return {
        type: SHOW_RELATED_INFO_CLICK,
        data: relatedArtist
    }
}

export function hideRelated() {
	return {
		type: HIDE_RELATED_INFO,
		data: null
	}
}

export function clearSession() {
	return {
		type: CLEAR_SESSION
	}
}

export function loadAlbum(albumId) {
	return {
		type: LOAD_ALBUM,
		data: albumId
	}
}
