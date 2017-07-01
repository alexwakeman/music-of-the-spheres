import {store} from '../state/store';
import {SearchDoneAction} from "../state/actions";

export class MusicDataService {
	static getMainArtistData(artistName) {
		let searchURL = '/api/search/' + encodeURIComponent(artistName);
		return window.fetch(searchURL, (response) => {
			return store.dispatch(new SearchDoneAction({payload: response.json()}));
		});
	}
}