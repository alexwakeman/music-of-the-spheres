import {store} from '../state/store';
import {searchDone} from "../state/actions";

export class MusicDataService {
	static getMainArtistData(artistName) {
		let searchURL = '/api/search/' + encodeURIComponent(artistName);
		return window.fetch(searchURL, {
			credentials: "same-origin"
		})
		.then((data) => data.json())
		.then((json) => {
			return store.dispatch(searchDone(json));
		});
	}
}