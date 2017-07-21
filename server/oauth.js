const ClientOAuth2 = require('client-oauth2');

/*
	Replace dev-config with your own config based off
	example-config.json
 */
const config = require('../dev-config');

function runAuth() {
	return new ClientOAuth2(config);
}

module.exports = runAuth;
