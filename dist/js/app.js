(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _appComponent = require('./components/app.component.jsx');

var _store = require('./state/store');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// cancel right click
document.onmousedown = function (event) {
	return event.button !== 2;
};

(0, _reactDom2.default)(React.createElement(
	_reactRedux.Provider,
	{ store: _store.store },
	React.createElement(_appComponent.AppComponent, null)
), document.getElementById('root'));

},{"./components/app.component.jsx":2,"./state/store":12,"react":"react","react-dom":"react-dom","react-redux":"react-redux"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AppComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _sceneComponent = require("./scene.component.jsx");

var _spotifyPlayerComponent = require("./spotify-player.component.jsx");

var _artistListComponent = require("./artist-list.component.jsx");

var _artistInfoComponent = require("./artist-info.component.jsx");

var _searchInput = require("../containers/search-input.container");

var _searchInput2 = _interopRequireDefault(_searchInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppComponent = exports.AppComponent = function (_React$Component) {
    _inherits(AppComponent, _React$Component);

    function AppComponent() {
        _classCallCheck(this, AppComponent);

        return _possibleConstructorReturn(this, (AppComponent.__proto__ || Object.getPrototypeOf(AppComponent)).call(this));
    }

    _createClass(AppComponent, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "app-container" },
                React.createElement(_searchInput2.default, null),
                React.createElement(_sceneComponent.SceneComponent, null),
                React.createElement(_spotifyPlayerComponent.SpotifyPlayerComponent, null),
                React.createElement(_artistListComponent.ArtistListComponent, null),
                React.createElement(_artistInfoComponent.ArtistInfoComponent, null)
            );
        }
    }]);

    return AppComponent;
}(React.Component);

},{"../containers/search-input.container":8,"./artist-info.component.jsx":3,"./artist-list.component.jsx":4,"./scene.component.jsx":5,"./spotify-player.component.jsx":7,"react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ArtistInfoComponent = ArtistInfoComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ArtistInfoComponent() {
	var artist = _store.store.getState().artist;
	_store.store.subscribe(function () {
		artist = _store.store.getState().artist;
	});
	var genres = artist.genres.map(function (genre) {
		return React.createElement(
			'span',
			{ className: 'artist-genre' },
			genre
		);
	});
	return React.createElement(
		'div',
		{ className: 'artist-info' },
		React.createElement(
			'ul',
			null,
			React.createElement(
				'li',
				null,
				'Popularity: ',
				artist.popularity
			),
			React.createElement(
				'li',
				null,
				'Genres: ',
				genres
			)
		)
	);
}

},{"../state/store":12,"react":"react"}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ArtistListComponent = ArtistListComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ArtistListComponent() {
	var visitedArtists = _store.store.getState().visitedArtists;
	_store.store.subscribe(function () {
		visitedArtists = _store.store.getState().visitedArtists;
	});
	var artists = visitedArtists.map(function (artist) {
		var href = '/?artist=' + artist.name;
		return React.createElement(
			'div',
			{ className: 'artist' },
			React.createElement(
				'a',
				{ href: href, id: artist.id, className: 'nav-artist-link' },
				React.createElement('img', { className: 'picture', src: artist.imgUrl }),
				React.createElement(
					'span',
					{ className: 'name' },
					artist.name
				)
			)
		);
	});
	return React.createElement(
		'div',
		{ className: 'artists-container' },
		artists
	);
}

},{"../state/store":12,"react":"react"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SceneComponent = SceneComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SceneComponent() {
	var artist = _store.store.getState().artist;
	_store.store.subscribe(function () {
		artist = _store.store.getState().artist;
	});
	return React.createElement(
		'div',
		{ id: 'three-scene' },
		artist.name
	);
}

},{"../state/store":12,"react":"react"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SearchInputComponent = SearchInputComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SearchInputComponent(_ref) {
    var searchTerm = _ref.searchTerm,
        handleSearch = _ref.handleSearch,
        handleSearchTermUpdate = _ref.handleSearchTermUpdate;

    return React.createElement(
        'div',
        { className: 'search-form-container' },
        React.createElement(
            'form',
            { className: 'artist-search', onSubmit: function onSubmit() {
                    return handleSearch(event);
                } },
            React.createElement('input', { type: 'text', id: 'search-input', placeholder: 'e.g. Jimi Hendrix', value: searchTerm, onKeyPress: function onKeyPress() {
                    return handleSearchTermUpdate(event);
                } }),
            React.createElement(
                'button',
                { type: 'submit', onClick: function onClick() {
                        return handleSearch(event);
                    } },
                'Go'
            )
        )
    );
}

SearchInputComponent.propTypes = {
    term: _propTypes2.default.string,
    handleSearch: _propTypes2.default.func.required,
    handleSearchTermUpdate: _propTypes2.default.func.required
};

},{"prop-types":"prop-types","react":"react"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpotifyPlayerComponent = SpotifyPlayerComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SpotifyPlayerComponent() {
	var embedUrl = 'https://open.spotify.com/embed/artist/';
	var artistEmbedUrl = '' + embedUrl + _store.store.getState().artist.id;
	_store.store.subscribe(function () {
		artistEmbedUrl = '' + embedUrl + _store.store.getState().artist.id;
	});
	return React.createElement('iframe', { src: artistEmbedUrl, width: '300', height: '80' });
}

},{"../state/store":12,"react":"react"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require('react-redux');

var _searchInputComponent = require('../components/search-input.component.jsx');

var _musicData = require('../services/music-data.service');

var _actions = require('../state/actions');

var mapStateToProps = function mapStateToProps(state) {
	return {
		searchTerm: state.searchTerm
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
	return {
		handleSearch: function handleSearch() {
			_musicData.MusicDataService.getMainArtistData(ownProps.searchTerm);
		},
		handleSearchTermUpdate: function handleSearchTermUpdate(event) {
			dispatch((0, _actions.updateSearchTerm)(event.target.value));
		}
	};
};

var SearchContainer = (0, _reactRedux.connect)({
	mapStateToProps: mapStateToProps,
	mapDispatchToProps: mapDispatchToProps
})(_searchInputComponent.SearchInputComponent);

exports.default = SearchContainer;

},{"../components/search-input.component.jsx":6,"../services/music-data.service":9,"../state/actions":10,"react-redux":"react-redux"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MusicDataService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _store = require('../state/store');

var _actions = require('../state/actions');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MusicDataService = exports.MusicDataService = function () {
	function MusicDataService() {
		_classCallCheck(this, MusicDataService);
	}

	_createClass(MusicDataService, null, [{
		key: 'getMainArtistData',
		value: function getMainArtistData(artistName) {
			var searchURL = '/api/search/' + encodeURIComponent(artistName);
			return window.fetch(searchURL, function (data) {
				return _store.store.dispatch((0, _actions.searchDone)(data.json()));
			});
		}
	}]);

	return MusicDataService;
}();

},{"../state/actions":10,"../state/store":12}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.searchDone = searchDone;
exports.updateSearchTerm = updateSearchTerm;
var ARTIST_SEARCH_DONE = exports.ARTIST_SEARCH_DONE = 'ARTIST_SEARCH_DONE';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';

function searchDone(data) {
	return {
		type: ARTIST_SEARCH_DONE,
		data: data
	};
}

function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	};
}

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actions = require('../actions');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = {
	artist: {
		id: '',
		name: '',
		imgUrl: ''
	},
	searchTerm: '',
	visitedArtists: []
};

var artistSearch = function artistSearch() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
	var action = arguments[1];

	switch (action.type) {
		case _actions.SEARCH_TERM_UPDATE:
			return _extends({}, state, {
				searchTerm: action.searchTerm
			});
		case _actions.ARTIST_SEARCH_DONE:
			return _extends({}, state, {
				artist: action.data,
				visitedArtists: [].concat(_toConsumableArray(state.visitedArtists), [state.artist])
			});
		default:
			return state;
	}
};

exports.default = artistSearch;

},{"../actions":10}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = undefined;

var _redux = require("redux");

var _artistSearch = require("./reducers/artist-search");

var _artistSearch2 = _interopRequireDefault(_artistSearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = exports.store = (0, _redux.createStore)(_artistSearch2.default);

},{"./reducers/artist-search":11,"redux":"redux"}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoLmpzIiwic3JjL2pzL3N0YXRlL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBO0FBQ0EsU0FBUyxXQUFULEdBQXVCLFVBQUMsS0FBRDtBQUFBLFFBQVcsTUFBTSxNQUFOLEtBQWlCLENBQTVCO0FBQUEsQ0FBdkI7O0FBRUEsd0JBQ0M7QUFBQTtBQUFBLEdBQVUsbUJBQVY7QUFDQztBQURELENBREQsRUFJQyxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FKRDs7Ozs7Ozs7Ozs7O0FDVEE7O0lBQVksSzs7QUFDWjs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7SUFFYSxZLFdBQUEsWTs7O0FBRVQsNEJBQWM7QUFBQTs7QUFBQTtBQUViOzs7O2lDQUVRO0FBQ0wsbUJBQ0k7QUFBQTtB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Ozs7Ozs7OztBQ2pDZjs7QUFDQTs7Ozs7O0FBRU8sSUFBSSx3QkFBUSwrQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgcmVuZGVyIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0FwcENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5cbi8vIGNhbmNlbCByaWdodCBjbGlja1xuZG9jdW1lbnQub25tb3VzZWRvd24gPSAoZXZlbnQpID0+IGV2ZW50LmJ1dHRvbiAhPT0gMjtcblxucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9e3N0b3JlfT5cblx0XHQ8QXBwQ29tcG9uZW50IC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pOyIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gXCIuL3NjZW5lLmNvbXBvbmVudC5qc3hcIjtcbmltcG9ydCB7U3BvdGlmeVBsYXllckNvbXBvbmVudH0gZnJvbSBcIi4vc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeFwiO1xuaW1wb3J0IHtBcnRpc3RMaXN0Q29tcG9uZW50fSBmcm9tIFwiLi9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4XCI7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gXCIuL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3hcIjtcbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8U2VhcmNoQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29tcG9uZW50IC8+XG4gICAgICAgICAgICAgICAgPFNwb3RpZnlQbGF5ZXJDb21wb25lbnQgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbXBvbmVudCAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29tcG9uZW50IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdEluZm9Db21wb25lbnQoKSB7XG5cdGxldCBhcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0c3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcblx0XHRhcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0fSk7XG5cdGNvbnN0IGdlbnJlcyA9IGFydGlzdC5nZW5yZXMubWFwKChnZW5yZSkgPT4ge1xuXHRcdHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJhcnRpc3QtZ2VucmVcIj57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0cmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcnRpc3QtaW5mb1wiPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5Qb3B1bGFyaXR5OiB7YXJ0aXN0LnBvcHVsYXJpdHl9PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+R2VucmVzOiB7Z2VucmVzfTwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0TGlzdENvbXBvbmVudCgpIHtcblx0bGV0IHZpc2l0ZWRBcnRpc3RzID0gc3RvcmUuZ2V0U3RhdGUoKS52aXNpdGVkQXJ0aXN0cztcblx0c3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcblx0XHR2aXNpdGVkQXJ0aXN0cyA9IHN0b3JlLmdldFN0YXRlKCkudmlzaXRlZEFydGlzdHM7XG5cdH0pO1xuXHRsZXQgYXJ0aXN0cyA9IHZpc2l0ZWRBcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiB7XG5cdFx0bGV0IGhyZWYgPSAnLz9hcnRpc3Q9JyArIGFydGlzdC5uYW1lO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdFwiPlxuXHRcdFx0XHQ8YSBocmVmPXtocmVmfSBpZD17YXJ0aXN0LmlkfSBjbGFzc05hbWU9XCJuYXYtYXJ0aXN0LWxpbmtcIj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzcmM9e2FydGlzdC5pbWdVcmx9IC8+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibmFtZVwiPnthcnRpc3QubmFtZX08L3NwYW4+XG5cdFx0XHRcdDwvYT5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fSk7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RzLWNvbnRhaW5lclwiPlxuXHRcdFx0e2FydGlzdHN9XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIFNjZW5lQ29tcG9uZW50KCkge1xuXHRsZXQgYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdHN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG5cdFx0YXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdH0pO1xuICAgIHJldHVybiAoXG5cdFx0PGRpdiBpZD1cInRocmVlLXNjZW5lXCI+e2FydGlzdC5uYW1lfTwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGhhbmRsZVNlYXJjaCwgaGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoKSA9PiBoYW5kbGVTZWFyY2goZXZlbnQpfT5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17c2VhcmNoVGVybX0gb25LZXlQcmVzcz17KCkgPT4gaGFuZGxlU2VhcmNoVGVybVVwZGF0ZShldmVudCl9IC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgb25DbGljaz17KCkgPT4gaGFuZGxlU2VhcmNoKGV2ZW50KX0+R288L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cblxuU2VhcmNoSW5wdXRDb21wb25lbnQucHJvcFR5cGVzID0ge1xuXHR0ZXJtOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRoYW5kbGVTZWFyY2g6IFByb3BUeXBlcy5mdW5jLnJlcXVpcmVkLFxuXHRoYW5kbGVTZWFyY2hUZXJtVXBkYXRlOiBQcm9wVHlwZXMuZnVuYy5yZXF1aXJlZFxufTtcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQoKSB7XG5cdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZC9hcnRpc3QvJztcblx0bGV0IGFydGlzdEVtYmVkVXJsID0gYCR7ZW1iZWRVcmx9JHtzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdC5pZH1gO1xuXHRzdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuXHRcdGFydGlzdEVtYmVkVXJsID0gYCR7ZW1iZWRVcmx9JHtzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdC5pZH1gO1xuXHR9KTtcbiAgICByZXR1cm4gKFxuICAgICAgICA8aWZyYW1lIHNyYz17YXJ0aXN0RW1iZWRVcmx9IHdpZHRoPVwiMzAwXCIgaGVpZ2h0PVwiODBcIiAvPlxuICAgIClcbn0iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuaW1wb3J0IHt1cGRhdGVTZWFyY2hUZXJtfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSBzdGF0ZSA9PiB7XG5cdHJldHVybiB7XG5cdFx0c2VhcmNoVGVybTogc3RhdGUuc2VhcmNoVGVybVxuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gsIG93blByb3BzKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoKSA9PiB7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldE1haW5BcnRpc3REYXRhKG93blByb3BzLnNlYXJjaFRlcm0pO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2ZW50KSA9PiB7XG5cdFx0XHRkaXNwYXRjaCh1cGRhdGVTZWFyY2hUZXJtKGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuXHRcdH1cblx0fVxufTtcblxuY29uc3QgU2VhcmNoQ29udGFpbmVyID0gY29ubmVjdCh7XG5cdG1hcFN0YXRlVG9Qcm9wcyxcblx0bWFwRGlzcGF0Y2hUb1Byb3BzXG59KShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjsiLCJpbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge3NlYXJjaERvbmV9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBNdXNpY0RhdGFTZXJ2aWNlIHtcblx0c3RhdGljIGdldE1haW5BcnRpc3REYXRhKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIChkYXRhKSA9PiB7XG5cdFx0XHRyZXR1cm4gc3RvcmUuZGlzcGF0Y2goc2VhcmNoRG9uZShkYXRhLmpzb24oKSkpO1xuXHRcdH0pO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9TRUFSQ0hfRE9ORSA9ICdBUlRJU1RfU0VBUkNIX0RPTkUnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoRG9uZShkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQVJUSVNUX1NFQVJDSF9ET05FLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufSIsImltcG9ydCB7U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfU0VBUkNIX0RPTkV9IGZyb20gJy4uL2FjdGlvbnMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcblx0YXJ0aXN0OiB7XG5cdFx0aWQ6ICcnLFxuXHRcdG5hbWU6ICcnLFxuXHRcdGltZ1VybDogJydcblx0fSxcblx0c2VhcmNoVGVybTogJycsXG5cdHZpc2l0ZWRBcnRpc3RzOiBbXSxcbn07XG5cbmNvbnN0IGFydGlzdFNlYXJjaCA9IChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSA9PiB7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uc2VhcmNoVGVybSxcblx0XHRcdH07XG5cdFx0Y2FzZSBBUlRJU1RfU0VBUkNIX0RPTkU6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHQuLi5zdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRcdFx0XHRzdGF0ZS5hcnRpc3Rcblx0XHRcdFx0XVxuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhcnRpc3RTZWFyY2g7IiwiaW1wb3J0IHtjcmVhdGVTdG9yZX0gZnJvbSAncmVkdXgnO1xuaW1wb3J0IGFydGlzdFNlYXJjaCBmcm9tIFwiLi9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoXCI7XG5cbmV4cG9ydCBsZXQgc3RvcmUgPSBjcmVhdGVTdG9yZShhcnRpc3RTZWFyY2gpO1xuXG5cbiJdfQ==
