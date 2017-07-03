import {SEARCH_TERM_UPDATE, ARTIST_SEARCH_DONE} from '../actions'

const initialState = {
	artist: {
		id: '',
		name: '',
		imgUrl: ''
	},
	searchTerm: '',
	visitedArtists: [],
};

const artistSearch = (state = initialState, action) => {
	switch (action.type) {
		case SEARCH_TERM_UPDATE:
			return {
				...state,
				searchTerm: action.searchTerm,
			};
		case ARTIST_SEARCH_DONE:
			return {
				...state,
				artist: action.data,
				visitedArtists: [
					...state.visitedArtists,
					state.artist
				]
			};
		default:
			return state;
	}
};

export default artistSearch;