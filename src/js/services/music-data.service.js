import {store} from '../state/store';
import {Props} from '../classes/props';
import {artistDataAvailable, displayArtist} from "../state/actions";

export class MusicDataService {
    static search(artistName) {
        let searchURL = '/api/search/' + encodeURIComponent(artistName);
        return window.fetch(searchURL, {
            credentials: 'same-origin'
        })
            .then((data) => data.json())
            .then((json) => {
                store.dispatch(artistDataAvailable(json));
                Props.sceneInst.composeScene(json);
            });
    }

    static getArtist(artistId) {
        let artistURL = '/api/artist/' + artistId;
        return window.fetch(artistURL, {
            credentials: 'same-origin'
        })
            .then((data) => data.json())
            .then((json) => {
                store.dispatch(displayArtist(json));
                return json;
            });
    }

    static fetchDisplayAlbums(artist) {
        let artistURL = '/api/albums/' + artist.id;
        if (artist.albums && artist.albums.length) { // we've already downloaded the album list so just trigger UI update
            return store.dispatch(displayArtist(artist));
        }

        return window.fetch(artistURL, {
            credentials: 'same-origin'
        })
            .then((data) => data.json())
            .then((json) => {
                artist.albums = json;
                store.dispatch(displayArtist(artist))
            });
    }
}