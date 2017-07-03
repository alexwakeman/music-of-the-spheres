import {store} from '../state/store';
import {searchDone} from "../state/actions";

export class MusicDataService {
	static getMainArtistData(artistName) {
		let searchURL = '/api/search/' + encodeURIComponent(artistName);
		return window.fetch(searchURL, (data) => {
			return store.dispatch(searchDone(data.json()));
		});
	}
}