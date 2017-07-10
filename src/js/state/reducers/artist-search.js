import {SEARCH_TERM_UPDATE, ARTIST_DATA_AVAILABLE} from '../actions'
let initialState = sessionStorage.getItem('state');

if (!initialState) {
	initialState = {
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
} else {
	initialState = JSON.parse(sessionStorage.getItem('state'));
}

const artistSearch = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case SEARCH_TERM_UPDATE:
			newState = {
				...state,
				searchTerm: action.searchTerm,
			};
			break;
		case ARTIST_DATA_AVAILABLE:
			if (action.data.id) {
				let alreadyVisited = !!state.visitedArtists.length && state.visitedArtists.some((artist) => {
						return artist.id === action.data.id;
					});
				let visitedArtists = alreadyVisited ? state.visitedArtists : [...state.visitedArtists, action.data];
				newState = {
					...state,
					artist: action.data,
					visitedArtists: [
						...visitedArtists,
					],
					searchTerm: action.data.name,
				};
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				newState = state;
			}
			break;
		default:
			newState = state;
	}
	window.sessionStorage.setItem('state', JSON.stringify(newState));
	return newState;
};

export default artistSearch;