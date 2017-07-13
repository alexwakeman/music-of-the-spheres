import {SEARCH_TERM_UPDATE, ARTIST_DATA_AVAILABLE, RELATED_CLICK, SHOW_RELATED, HIDE_RELATED} from '../actions'
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
		visitedArtists: [],
		hideInfo: true,
			relatedArtist: {
				genres: [],
				popularity: 0,
				id: '',
				name: ''
			},
		showRelated: false
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
					hideInfo: false
				};
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				newState = state;
			}
			break;
		case RELATED_CLICK:
			newState = {
				...state,
				hideInfo: true
			};
			break;
		case SHOW_RELATED:
			newState = {
				...state,
				relatedArtist: action.data,
				showRelated: true
			};
			break;
		case HIDE_RELATED:
			newState = {
				...state,
				relatedArtist: {
					genres: [],
					popularity: 0,
					id: '',
					name: ''
				},
				showRelated: false
			};
			break;
		default:
			newState = state;
	}
	window.sessionStorage.setItem('state', JSON.stringify(newState));
	return newState;
};

export default artistSearch;