import {store} from '../state/store';
import {artistDataAvailable, displayAlbums} from "../state/actions";

export class MusicDataService {
	static search(artistName) {
		let searchURL = '/api/search/' + encodeURIComponent(artistName);
		return window.fetch(searchURL, {
			credentials: 'same-origin'
		})
		.then((data) => data.json())
		.then((json) => store.dispatch(artistDataAvailable(json)));
	}

	static getArtist(artistId) {
		let artistURL = '/api/artist/' + artistId;
		return window.fetch(artistURL, {
			credentials: 'same-origin'
		})
		.then((data) => data.json())
		.then((json) => store.dispatch(artistDataAvailable(json)));
	}

	static fetchDisplayAlbums(artist) {
		let artistURL = '/api/albums/' + artist.id;
		if (artist.albums.length) { // we've already downloaded the album list so just trigger UI update
			 return store.dispatch(displayAlbums(artist.albums));
		}

		return window.fetch(artistURL, {
			credentials: 'same-origin'
		})
		.then((data) => data.json())
		.then((json) => store.dispatch(displayAlbums(json)));
	}
}