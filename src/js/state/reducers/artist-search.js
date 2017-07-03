import {SEARCH_TERM_UPDATE, ARTIST_SEARCH_DONE} from '../actions'

const initialState = {
	artist: {
		id: '',
		name: '',
		imgUrl: '',
		genres: [],
		popularity: 0,
		images: []
	},
	searchTerm: '',
	visitedArtists: []
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
					action.data
				]
			};
		default:
			return state;
	}
};

export default artistSearch;