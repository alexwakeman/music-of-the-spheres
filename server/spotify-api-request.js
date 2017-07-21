const request = require('request');
const apiAddress = 'https://api.spotify.com/v1';

module.exports = class SpotifyRequests {
	static performSearch(apiToken, artistName) {
		return SpotifyRequests
			.search(apiToken, artistName)
			.then((artistObj) => SpotifyRequests.getReleated(apiToken, artistObj));
	}
	static fetchArtist(apiToken, artistId) {
		return SpotifyRequests
			.getArtist(apiToken, artistId)
			.then((artistObj) => SpotifyRequests.getReleated(apiToken, artistObj));
	}
	static search(apiToken, artistName) {
		return new Promise((resolve, reject) => {
			let options = {
				url: `${apiAddress}/search?q=${encodeURI(artistName)}&type=artist`,
				headers: {
					'Authorization': `Bearer ${apiToken}`
				}
			};
			request(options, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					const data = JSON.parse(body);
					if (data.artists && data.artists.total) {
						return resolve(data.artists.items[0]);
					} else {
						return resolve({}); // resolve with empty object if no matching artist was found on Spotify
					}
				}
				reject();
			});
		});
	}
	static getArtist(apiToken, artistId) {
		return new Promise((resolve, reject) => {
			let options = {
				url: `${apiAddress}/artists/${artistId}`,
				headers: {
					'Authorization': 'Bearer ' + apiToken
				}
			};
			request(options, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					const artist = JSON.parse(body);
					return resolve(artist);
				}
				reject();
			});
		});
	}
	static getAlbums(apiToken, artist) {
		return new Promise((resolve, reject) => {
			let artistId = artist.id;
			let options = {
				url: `${apiAddress}/artists/${artistId}/albums`,
				headers: {
					'Authorization': 'Bearer ' + apiToken
				}
			};
			request(options, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					const data = JSON.parse(body);
					if (data.total) {
						artist.albums = data.items;

					}
					return resolve(artist);
				}
				reject();
			});
		});
	}
	static getReleated(apiToken, artist) {
		return new Promise((resolve, reject) => {
			let artistId = artist.id;
			let options = {
				url: `${apiAddress}/artists/${artistId}/related-artists`,
				headers: {
					'Authorization': 'Bearer ' + apiToken
				}
			};
			request(options, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					const data = JSON.parse(body);
					if (data.artists.length) {
						artist.related = data.artists;

					}
					return resolve(artist);
				}
				reject();
			});
		})
	}
};