import {ARTIST_SEARCH_START, ARTIST_SEARCH_DONE} from '../actions'

const initialState = {
	artist: {},
	searchTerm: '',
	visitedArtists: []
};

const artistSearch = (state = initialState, action) => {
	switch (action.type) {
		case ARTIST_SEARCH_START:
			return {
				...state,
				searchTerm: action.searchTerm,
				visitedArtists: [
					...state.visitedArtists,
					state.artist
				]
			};
		case ARTIST_SEARCH_DONE:
			return {
				...state,
				artist: action.data
			};
		default:
			return state;
	}
};

export default artistSearch;