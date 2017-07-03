import {createStore} from 'redux';
import artistSearch from "./reducers/artist-search";

export let store = createStore(
	artistSearch,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);


