const DISTANCE_SCALAR = 50;
const SIZE_SCALAR = 1.5;
import {SceneUtils} from './scene-utils.class';

export class Statistics {
    static getArtistSphereSize(artist) {
        return Math.max(40, artist.popularity * SIZE_SCALAR);
    }

	/**
     * Map-reduce of two string arrays
	 * @param artist
	 * @param relatedArtist
	 * @returns {number}
	 */
	static getSharedGenreMetric(artist, relatedArtist) {
		let matches = artist.genres
            .map((mainArtistGenre) => Statistics.matchArtistToRelatedGenres(mainArtistGenre, relatedArtist))
            .reduce((accumulator, match) => {
		        if (match) {
		            accumulator.push(match);
				}
		        return accumulator;
            }, []);
		return Math.max(300, matches.length * DISTANCE_SCALAR);
	}

	static matchArtistToRelatedGenres(mainArtistGenre, relatedArtist) {
        return relatedArtist.genres
            .find((genre) => genre === mainArtistGenre);
    }
 }