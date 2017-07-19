const MIN_DISTANCE = 50;
const MAX_DISTANCE = 800;
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
		let unit, genreSimilarity, minDistance, artistGenreCount;
		let matches = artist.genres
            .map((mainArtistGenre) => Statistics.matchArtistToRelatedGenres(mainArtistGenre, relatedArtist))
            .reduce((accumulator, match) => {
		        if (match) {
		            accumulator.push(match);
				}
		        return accumulator;
            }, []);
		artistGenreCount = artist.genres.length ? artist.genres.length : 1;
		unit = 1 / artistGenreCount;
		unit = unit === 1 ? 0 : unit;
		genreSimilarity = matches.length * unit;
		minDistance = ((artist.popularity * SIZE_SCALAR) + (relatedArtist.popularity * SIZE_SCALAR)) + MIN_DISTANCE;
		return {
			lineLength: Math.max(minDistance, MAX_DISTANCE - (MAX_DISTANCE * genreSimilarity)),
			genreSimilarity: Math.round(genreSimilarity * 100)
		};
	}

	static matchArtistToRelatedGenres(mainArtistGenre, relatedArtist) {
        return relatedArtist.genres
            .find((genre) => genre === mainArtistGenre);
    }
 }