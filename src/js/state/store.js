import {createStore} from 'redux';
import {ARTIST_SEARCH_DONE, ARTIST_SEARCH_START} from "./actions";

function musicApp(state, action) {
    switch (action.type) {
        case ARTIST_SEARCH_START:
            return state;
        case ARTIST_SEARCH_DONE:
            return state;
        default:
            return state;
    }
}

export let store = createStore(musicApp);


