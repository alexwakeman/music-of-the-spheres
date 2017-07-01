const ClientOAuth2 = require('client-oauth2');

function runAuth() {
	return new ClientOAuth2({
		clientId: 'b5cc5e9c4f9942c99efa9540546e3827',
		clientSecret: '2c53a2dca367418391f284ce8f7d3cf8',
		accessTokenUri: 'https://accounts.spotify.com/api/token',
		authorizationUri: 'https://accounts.spotify.com/authorize',
		redirectUri: 'http://localhost:3000/auth/callback'
	});
}

module.exports = { runAuth: runAuth };

