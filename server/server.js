const express = require('express'),
	app = express(),
	router = express.Router(),
	path = require('path'),
	session = require('express-session'),
	MongoStore = require('express-session-mongo'),
	SpotifyRequests = require('./spotify-api-request'),
	auth = require('./oauth')();

app.use(session({
	secret: 'test-test',
	resave: true,
	saveUninitialized: true,
	cookie: { secure: false },
	store: new MongoStore()
}));
app.use('/', express.static(path.join(__dirname, '../dist/login/')));
app.use('/app/', express.static(path.join(__dirname, '../dist/')));

router.route('/auth')
	.get((req, res) => {
		let uri = auth.code.getUri();
		res.redirect(uri);
	});

router.route('/auth/callback')
	.get((req, res) => {
		let sess = req.session;
		return auth.code.getToken(req.originalUrl)
			.then((user) => {
				sess.user = user.data;
				res.redirect('/app');
			}, (err) => {
				res.send(err.message);
			});
	});

router.route('/api/search/:artist')
	.get((req, res) => {
		let sess = req.session;
		let artist = req.params.artist;
		let token = sess.user.access_token;
		SpotifyRequests.performSearch(token, artist)
			.then((artistData) => {
				res.json(artistData);
			})
			.catch(() => res.status(401).json({error: 'Could not get Spotify API data.'}));
	});

router.route('/api/artist/:artistId')
	.get((req, res) => {
		let sess = req.session;
		let id = req.params.artistId;
		let token = sess.user.access_token;
		SpotifyRequests.fetchArtist(token, id)
			.then((artistData) => {
				res.json(artistData);
			})
			.catch(() => res.status(401).json({error: 'Could not get Spotify API data.'}));
	});


app.use(router);
app.listen(3000, () => console.log('App listening on port 3000!'));
