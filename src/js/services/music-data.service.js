import {store} from '../state/store';
import {artistDataAvailable} from "../state/actions";

export class MusicDataService {
	static search(artistName) {
		let searchURL = '/api/search/' + encodeURIComponent(artistName);
		return window.fetch(searchURL, {
			credentials: "same-origin"
		})
		.then((data) => data.json())
		.then((json) => store.dispatch(artistDataAvailable(json)));
	}

	static getArtist(artistId) {
		let artistURL = '/api/artist/' + artistId;
		return window.fetch(artistURL, {
			credentials: "same-origin"
		})
		.then((data) => data.json())
		.then((json) => store.dispatch(artistDataAvailable(json)));
	}

	static getArtistAlbums(artistId) {
		let artistURL = '/api/albums/' + artistId;
		return window.fetch(artistURL, {
			credentials: "same-origin"
		})
		.then((data) => data.json())
		.then((json) => store.dispatch(artistAlbumsAvailable(json)));
	}
}