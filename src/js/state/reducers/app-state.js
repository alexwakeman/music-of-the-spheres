import {
	SEARCH_TERM_UPDATE, ARTIST_DATA_AVAILABLE,
	CLEAR_SESSION, UPDATE_DISPLAY_ARTIST, SHOW_RELATED_INFO_HOVER, SHOW_RELATED_INFO_CLICK, HIDE_RELATED_INFO, LOAD_ALBUM
} from '../actions'
let initialState = sessionStorage.getItem('state');
const emptyArtist = {
	id: '',
	name: '',
	imgUrl: '',
	genres: [],
	popularity: 0,
	images: [],
	albums: []
};
const emptyState = {
	artist: emptyArtist,
	relatedArtist: emptyArtist,
	searchTerm: '',
	visitedArtists: [],
	displayArtist: emptyArtist,
	displayAlbumIndex: 0,
	showRelated: false,
	showExploreButton: false,
	showUI: false
};

if (!initialState) {
	initialState = {
		...emptyState
	};
} else {
	initialState = JSON.parse(initialState);
}

const appState = (state = initialState, action) => {
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
				let alreadyVisited = !!state.visitedArtists.length
					&& state.visitedArtists.some((artist) => artist.id === action.data.id);
				let visitedArtists = alreadyVisited ? state.visitedArtists : [...state.visitedArtists, action.data];
				newState = {
					...state,
					artist: action.data,
					displayArtist: action.data,
					visitedArtists: [
						...visitedArtists,
					],
					searchTerm: action.data.name,
					showRelated: false,
					showUI: true,
					relatedArtist: {
						...emptyArtist
					},
					displayAlbumIndex: 0
				};
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				newState = state;
			}
			break;
		case UPDATE_DISPLAY_ARTIST:
            let alreadyVisited = !!state.visitedArtists.length
                && state.visitedArtists.some((artist) => artist.id === action.data.id);
            let visitedArtists = alreadyVisited ? state.visitedArtists : [...state.visitedArtists, action.data];
			newState = {
				...state,
                artist: action.data,
                searchTerm: action.data.name,
                showRelated: false,
				displayArtist: action.data,
				displayAlbumIndex: 0,
				showExploreButton: true,
                visitedArtists: [
                    ...visitedArtists,
                ],
			};
			break;
		case LOAD_ALBUM:
			newState = {
				...state,
				displayAlbumIndex: action.data
			};
			break;
		case SHOW_RELATED_INFO_HOVER:
			newState = {
				...state,
				relatedArtist: action.data,
				showRelated: true,
				showExploreButton: false
			};
			break;
        case SHOW_RELATED_INFO_CLICK:
            newState = {
                ...state,
                relatedArtist: action.data,
                showRelated: true,
                showExploreButton: true
            };
            break;
		case HIDE_RELATED_INFO:
			newState = {
				...state,
				relatedArtist: {
					...emptyArtist
				},
				showRelated: false,
				showExploreButton: false
			};
			break;
		case CLEAR_SESSION:
			newState = {
				...emptyState
			};
			break;
		default:
			newState = state;
	}
	window.sessionStorage.setItem('state', JSON.stringify(newState));
	return newState;
};

export default appState;