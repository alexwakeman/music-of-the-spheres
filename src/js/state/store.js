import {createStore} from 'redux';
import artistSearch from "./reducers/artist-search";

export let store = createStore(artistSearch);


