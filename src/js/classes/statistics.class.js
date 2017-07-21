const MAX_DISTANCE = 800;
const SIZE_SCALAR_SMALL = 1.25;
const SIZE_SCALAR_BIG = 1.75;

export class Statistics {
    static getArtistSphereSize(artist) {
    	if (artist.popularity >= 50) {
			return artist.popularity * SIZE_SCALAR_BIG;
		} else {
			return artist.popularity * SIZE_SCALAR_SMALL;
		}

    }

	/**
     * Map-reduce of two string arrays
	 * @param artist
	 * @param relatedArtist
	 * @returns {object}
	 */
	static getSharedGenreMetric(artist, relatedArtist) {
		let unit, genreSimilarity, relativeMinDistance, artistGenreCount;
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
		relativeMinDistance = Statistics.getArtistSphereSize(artist) + Statistics.getArtistSphereSize(relatedArtist);
		return {
			lineLength: (MAX_DISTANCE - (MAX_DISTANCE * genreSimilarity)) + relativeMinDistance,
			genreSimilarity: Math.round(genreSimilarity * 100)
		};
	}

	static matchArtistToRelatedGenres(mainArtistGenre, relatedArtist) {
        return relatedArtist.genres
            .find((genre) => genre === mainArtistGenre);
    }
 }