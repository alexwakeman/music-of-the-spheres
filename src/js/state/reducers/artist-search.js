import {SEARCH_TERM_UPDATE, ARTIST_DATA_AVAILABLE} from '../actions'

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
		case ARTIST_DATA_AVAILABLE:
			if (action.data.id) {
				let alreadyVisited = !!state.visitedArtists.length && state.visitedArtists.some((artist) => {
						return artist.id === action.data.id;
					});
				let visitedArtists = alreadyVisited ? state.visitedArtists : [...state.visitedArtists, action.data];
				return {
					...state,
					artist: action.data,
					visitedArtists: [
						...visitedArtists,
					],
					searchTerm: action.data.name,
				};
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				return state;
			}
		default:
			return state;
	}
};

export default artistSearch;