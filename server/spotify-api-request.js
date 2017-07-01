const request = require('request');
const apiAddress = 'https://api.spotify.com/v1';

module.exports = class SpotifyRequests {
	static performSearch(apiToken, artistName) {
		return SpotifyRequests
			.search(apiToken, artistName)
			.then((artistObj) => SpotifyRequests.getAlbums(apiToken, artistObj))
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
					}
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
	static getPlayer(artistId) {
		return new Promise((resolve, reject) => {
			let options = {
				url: `https://open.spotify.com/embed?uri=spotify:artist:${artistId}`,
			};
			request(options, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					return resolve(body);
				}
				reject();
			});
		})
	}
};