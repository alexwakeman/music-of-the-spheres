const MIN_DISTANCE = 10;
const MAX_DISTANCE = 1000;
const DISTANCE_SCALAR = 50;
const SIZE_SCALAR = 1.5;

export class Statistics {
    static getArtistSphereSize(artist) {
        return Math.max(40, artist.popularity * SIZE_SCALAR);
    }

	/**
     * Map-reduce of two string arrays
	 * @param artist
	 * @param relatedArtist
	 * @returns {object}
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
		let artistGenreCount = artist.genres.length ? artist.genres.length : 1;
		let unit = 1 / artistGenreCount;
		unit = unit === 1 ? 0 : unit;
		let genreSimilarity = Math.round((matches.length * unit) * 100);
		let minDistance = ((artist.popularity + relatedArtist.popularity) * SIZE_SCALAR) + MIN_DISTANCE;
		return {
			lineLength: Math.max(minDistance, MAX_DISTANCE - (matches.length * DISTANCE_SCALAR)),
			genreSimilarity: genreSimilarity
		};
	}

	static matchArtistToRelatedGenres(mainArtistGenre, relatedArtist) {
        return relatedArtist.genres
            .find((genre) => genre === mainArtistGenre);
    }
 }