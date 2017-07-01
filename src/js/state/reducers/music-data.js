import {ARTIST_SEARCH_START, ARTIST_SEARCH_DONE} from './actions'

const musicSearch = (state = {}, action) => {
	switch (action.type) {
		case ARTIST_SEARCH_START:
			return {
				...state,
				term: action.term
			};
		case ARTIST_SEARCH_DONE:
			return {
				...state,
				artist: action.data // TODO: mapping to artist
			};
		default:
			return state;
	}
};

export default musicData;