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

_reactDom2.default.render(React.createElement(
	_reactRedux.Provider,
	{ store: _store.store },
	React.createElement(_appComponent.AppComponent, null)
), document.getElementById('root'));

},{"./components/app.component.jsx":3,"./state/store":17,"react":undefined,"react-dom":undefined,"react-redux":undefined}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
    function Utils() {
        _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
        key: 'clamp',

        /**
         *
         * @param a - min
         * @param b - max
         * @param c - value to clamp
         * @returns {number}
         */
        value: function clamp(a, b, c) {
            return Math.max(b, Math.min(c, a));
        }

        /**
         * Given positive x return 1, negative x return -1, or 0 otherwise
         * @param x
         * @returns {number}
         */

    }, {
        key: 'sign',
        value: function sign(x) {
            return x > 0 ? 1 : x < 0 ? -1 : 0;
        }
    }, {
        key: 'renormalizeQuarternion',
        value: function renormalizeQuarternion(object) {
            var clone = object.clone();
            var q = clone.quaternion;
            var magnitude = Math.sqrt(Math.pow(q.w, 2) + Math.pow(q.x, 2) + Math.pow(q.y, 2) + Math.pow(q.z, 2));
            q.w /= magnitude;
            q.x /= magnitude;
            q.y /= magnitude;
            q.z /= magnitude;
            return q;
        }
    }]);

    return Utils;
}();

exports.default = Utils;

},{"three":undefined}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AppComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _searchInput = require("../containers/search-input.container");

var _searchInput2 = _interopRequireDefault(_searchInput);

var _spotifyPlayer = require("../containers/spotify-player.container");

var _spotifyPlayer2 = _interopRequireDefault(_spotifyPlayer);

var _scene = require("../containers/scene.container");

var _scene2 = _interopRequireDefault(_scene);

var _artistList = require("../containers/artist-list.container");

var _artistList2 = _interopRequireDefault(_artistList);

var _artistInfo = require("../containers/artist-info.container");

var _artistInfo2 = _interopRequireDefault(_artistInfo);

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
                React.createElement(_scene2.default, null),
                React.createElement(_spotifyPlayer2.default, null),
                React.createElement(_artistList2.default, null),
                React.createElement(_artistInfo2.default, null)
            );
        }
    }]);

    return AppComponent;
}(React.Component);

},{"../containers/artist-info.container":9,"../containers/artist-list.container":10,"../containers/scene.container":11,"../containers/search-input.container":12,"../containers/spotify-player.container":13,"react":undefined}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ArtistInfoComponent = ArtistInfoComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ArtistInfoComponent(_ref) {
	var artist = _ref.artist;

	var artistInfoMarkup = '';
	var genres = artist.genres.map(function (genre) {
		return React.createElement(
			'span',
			{ className: 'artist-genre', key: genre },
			genre
		);
	});
	if (artist.id) {
		artistInfoMarkup = React.createElement(
			'div',
			{ className: 'info-container' },
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
	return React.createElement(
		'div',
		null,
		artistInfoMarkup
	);
}

},{"../state/store":17,"react":undefined}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ArtistListComponent = ArtistListComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ArtistListComponent(_ref) {
	var visitedArtists = _ref.visitedArtists;

	var artists = visitedArtists.map(function (artist) {
		var href = '/?artist=' + artist.name;
		var imgUrl = artist.images.length ? artist.images[artist.images.length - 1].url : '';
		return React.createElement(
			'div',
			{ className: 'artist', key: artist.id },
			React.createElement(
				'a',
				{ href: href, id: artist.id, className: 'nav-artist-link' },
				React.createElement('img', { className: 'picture', src: imgUrl }),
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
		{ className: 'artist-navigation' },
		artists
	);
}

},{"../state/store":17,"react":undefined}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SceneComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

var _trigUtils = require('../classes/trig-utils.class');

var _trigUtils2 = _interopRequireDefault(_trigUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SceneComponent = exports.SceneComponent = function (_React$Component) {
	_inherits(SceneComponent, _React$Component);

	function SceneComponent() {
		_classCallCheck(this, SceneComponent);

		var _this = _possibleConstructorReturn(this, (SceneComponent.__proto__ || Object.getPrototypeOf(SceneComponent)).call(this));

		_this.assignMouseWheel();
		_this.artist = _store.store.getState().artist;
		_store.store.subscribe(function () {
			_this.artist = _store.store.getState().artist;
			_this.forceUpdate();
		});
		return _this;
	}

	_createClass(SceneComponent, [{
		key: 'render',
		value: function render() {
			return React.createElement('div', { className: 'three-scene',
				onClick: this.onClickHandler,
				onMouseMove: this.onMouseMoveHandler,
				onMouseDown: this.onMouseDownHandler,
				onMouseUp: this.onMouseUpHandler
			});
		}
	}, {
		key: 'onClickHandler',
		value: function onClickHandler() {}
	}, {
		key: 'onMouseMoveHandler',
		value: function onMouseMoveHandler() {}
	}, {
		key: 'onMouseDownHandler',
		value: function onMouseDownHandler() {}
	}, {
		key: 'onMouseUpHandler',
		value: function onMouseUpHandler() {}
	}, {
		key: 'assignMouseWheel',
		value: function assignMouseWheel() {
			var _this2 = this;

			document.getElementById('three-scene').addEventListener('mousewheel', function (event) {
				// is wheelDeltaY positive or negative (up or down)?
				switch (_trigUtils2.default.sign(event.wheelDeltaY)) {
					case -1:
						// mouse scroll down / zoom out
						_this2.zoom('out');
						break;
					case 1:
						// mouse scroll up / zoom in
						_this2.zoom('in');
						break;
					case 0:
						return false;
				}
			}, true);
		}
	}]);

	return SceneComponent;
}(React.Component);

},{"../classes/trig-utils.class":2,"../state/store":17,"react":undefined}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SearchInputComponent = SearchInputComponent;

var _react = require("react");

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SearchInputComponent(_ref) {
    var searchTerm = _ref.searchTerm,
        handleSearch = _ref.handleSearch,
        handleSearchTermUpdate = _ref.handleSearchTermUpdate;

    return React.createElement(
        "div",
        { className: "search-form-container" },
        React.createElement(
            "form",
            { className: "artist-search", onSubmit: function onSubmit(evt) {
                    return handleSearch(evt, searchTerm);
                } },
            React.createElement("input", { type: "text", id: "search-input", placeholder: "e.g. Jimi Hendrix", value: searchTerm, onChange: handleSearchTermUpdate }),
            React.createElement(
                "button",
                { type: "submit", onClick: function onClick(evt) {
                        return handleSearch(evt, searchTerm);
                    } },
                "Go"
            )
        )
    );
}

},{"react":undefined}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpotifyPlayerComponent = SpotifyPlayerComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SpotifyPlayerComponent(_ref) {
	var artist = _ref.artist;

	var embedUrl = 'https://open.spotify.com/embed/artist/';
	var artistEmbedUrl = '' + embedUrl + artist.id;
	var iFrameMarkup = '';
	if (artist.id) {
		iFrameMarkup = React.createElement(
			'div',
			{ id: 'spotify-player' },
			React.createElement('iframe', { src: artistEmbedUrl, width: '300', height: '80' }),
			React.createElement(
				'div',
				{ className: 'album-nav' },
				React.createElement(
					'a',
					{ href: '#' },
					'Prev'
				),
				React.createElement(
					'a',
					{ href: '#' },
					'Next'
				)
			)
		);
	}
	return React.createElement(
		'div',
		{ className: 'spotify-player-container' },
		iFrameMarkup
	);
}

},{"react":undefined}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require('react-redux');

var _artistInfo = require('../components/artist-info.component');

var mapStateToProps = function mapStateToProps(state) {
	return {
		artist: state.artist
	};
};

var ArtistInfoContainer = (0, _reactRedux.connect)(mapStateToProps)(_artistInfo.ArtistInfoComponent);

exports.default = ArtistInfoContainer;

},{"../components/artist-info.component":4,"react-redux":undefined}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require("react-redux");

var _artistList = require("../components/artist-list.component");

var mapStateToProps = function mapStateToProps(state) {
	return {
		visitedArtists: state.visitedArtists
	};
};

var ArtistListContainer = (0, _reactRedux.connect)(mapStateToProps)(_artistList.ArtistListComponent);

exports.default = ArtistListContainer;

},{"../components/artist-list.component":5,"react-redux":undefined}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require('react-redux');

var _scene = require('../components/scene.component');

var mapStateToProps = function mapStateToProps(state) {
	return {
		artist: state.artist
	};
};

var SceneContainer = (0, _reactRedux.connect)(mapStateToProps)(_scene.SceneComponent);

exports.default = SceneContainer;

},{"../components/scene.component":6,"react-redux":undefined}],12:[function(require,module,exports){
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

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		handleSearch: function handleSearch(evt, searchTerm) {
			evt.preventDefault();
			_musicData.MusicDataService.getMainArtistData(searchTerm);
		},
		handleSearchTermUpdate: function handleSearchTermUpdate(evt) {
			dispatch((0, _actions.updateSearchTerm)(evt.target.value));
		}
	};
};

var SearchContainer = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_searchInputComponent.SearchInputComponent);

exports.default = SearchContainer;

},{"../components/search-input.component.jsx":7,"../services/music-data.service":14,"../state/actions":15,"react-redux":undefined}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require("react-redux");

var _spotifyPlayer = require("../components/spotify-player.component");

var mapStateToProps = function mapStateToProps(state) {
	return {
		artist: state.artist
	};
};

var SpotifyPlayerContainer = (0, _reactRedux.connect)(mapStateToProps)(_spotifyPlayer.SpotifyPlayerComponent);

exports.default = SpotifyPlayerContainer;

},{"../components/spotify-player.component":8,"react-redux":undefined}],14:[function(require,module,exports){
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
			return window.fetch(searchURL, {
				credentials: "same-origin"
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				return _store.store.dispatch((0, _actions.searchDone)(json));
			});
		}
	}]);

	return MusicDataService;
}();

},{"../state/actions":15,"../state/store":17}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
		imgUrl: '',
		genres: [],
		popularity: 0,
		images: []
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
				visitedArtists: [].concat(_toConsumableArray(state.visitedArtists), [action.data])
			});
		default:
			return state;
	}
};

exports.default = artistSearch;

},{"../actions":15}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.store = undefined;

var _redux = require("redux");

var _artistSearch = require("./reducers/artist-search");

var _artistSearch2 = _interopRequireDefault(_artistSearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = exports.store = (0, _redux.createStore)(_artistSearch2.default, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

},{"./reducers/artist-search":16,"redux":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL3RyaWctdXRpbHMuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXIuanMiLCJzcmMvanMvc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlLmpzIiwic3JjL2pzL3N0YXRlL2FjdGlvbnMuanMiLCJzcmMvanMvc3RhdGUvcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaC5qcyIsInNyYy9qcy9zdGF0ZS9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7O0lBQVksSzs7QUFDWjs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNBLFNBQVMsV0FBVCxHQUF1QixVQUFDLEtBQUQ7QUFBQSxRQUFXLE1BQU0sTUFBTixLQUFpQixDQUE1QjtBQUFBLENBQXZCOztB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OztBQUVNLFNBQVMsZ0JBQVQsQ0FBMEIsVUFBMUIsRUFBc0M7QUFDNUMsUUFBTztBQUNOLFFBQU0sa0JBREE7QUFFTixjQUFZO0FBRk4sRUFBUDtBQUlBOzs7Ozs7Ozs7OztBQ2ZEOzs7O0FBRUEsSUFBTSxlQUFlO0FBQ3BCLFNBQVE7QUFDUCxNQUFJLEVBREc7QUFFUCxRQUFNLEVBRkM7QUFHUCxVQUFRLEVBSEQ7QUFJUCxVQUFRLEVBSkQ7QUFLUCxjQUFZLENBTEw7QUFNUCxVQUFRO0FBTkQsRUFEWTtBQVNwQixhQUFZLEVBVFE7QUFVcEIsaUJBQWdCO0FBVkksQ0FBckI7O0FBYUEsSUFBTSxlQUFlLFNBQWYsWUFBZSxHQUFrQztBQUFBLEtBQWpDLEtBQWlDLHVFQUF6QixZQUF5QjtBQUFBLEtBQVgsTUFBVzs7QUFDdEQsU0FBUSxPQUFPLElBQWY7QUFDQztBQUNDLHVCQUNJLEtBREo7QUFFQyxnQkFBWSxPQUFPO0FBRnBCO0FBSUQ7QUFDQyx1QkFDSSxLQURKO0FBRUMsWUFBUSxPQUFPLElBRmhCO0FBR0MsaURBQ0ksTUFBTSxjQURWLElBRUMsT0FBTyxJQUZSO0FBSEQ7QUFRRDtBQUNDLFVBQU8sS0FBUDtBQWhCRjtBQWtCQSxDQW5CRDs7a0JBcUJlLFk7Ozs7Ozs7Ozs7QUNwQ2Y7O0FBQ0E7Ozs7OztBQUVPLElBQUksd0JBQVEsZ0RBRWxCLE9BQU8sNEJBQVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG4vLyBjYW5jZWwgcmlnaHQgY2xpY2tcbmRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50KSA9PiBldmVudC5idXR0b24gIT09IDI7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG5cdFx0PEFwcENvbXBvbmVudCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTsiLCJpbXBvcnQge09iamVjdDNELCBRdWF0ZXJuaW9ufSBmcm9tICd0aHJlZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFV0aWxzIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhIC0gbWluXG4gICAgICogQHBhcmFtIGIgLSBtYXhcbiAgICAgKiBAcGFyYW0gYyAtIHZhbHVlIHRvIGNsYW1wXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY2xhbXAoYSwgYiwgYykge1xuICAgICAgIHJldHVybiBNYXRoLm1heChiLE1hdGgubWluKGMsYSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIHBvc2l0aXZlIHggcmV0dXJuIDEsIG5lZ2F0aXZlIHggcmV0dXJuIC0xLCBvciAwIG90aGVyd2lzZVxuICAgICAqIEBwYXJhbSB4XG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2lnbih4KSB7XG4gICAgICAgIHJldHVybiB4ID4gMCA/IDEgOiB4IDwgMCA/IC0xIDogMDtcbiAgICB9O1xuXG4gICAgc3RhdGljIHJlbm9ybWFsaXplUXVhcnRlcm5pb24ob2JqZWN0KSB7XG4gICAgICAgIGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG4gICAgfVxufSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHAtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxTZWFyY2hDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U3BvdGlmeVBsYXllckNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RMaXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0SW5mb0NvbXBvbmVudCh7YXJ0aXN0fSkge1xuXHRsZXQgYXJ0aXN0SW5mb01hcmt1cCA9ICcnO1xuXHRjb25zdCBnZW5yZXMgPSBhcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwiYXJ0aXN0LWdlbnJlXCIga2V5PXtnZW5yZX0+e2dlbnJlfTwvc3Bhbj5cblx0fSk7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRhcnRpc3RJbmZvTWFya3VwID0gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpbmZvLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8dWw+XG5cdFx0XHRcdFx0PGxpPlBvcHVsYXJpdHk6IHthcnRpc3QucG9wdWxhcml0eX08L2xpPlxuXHRcdFx0XHRcdDxsaT5HZW5yZXM6IHtnZW5yZXN9PC9saT5cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXHRyZXR1cm4gKFxuXHRcdDxkaXY+e2FydGlzdEluZm9NYXJrdXB9PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdExpc3RDb21wb25lbnQoe3Zpc2l0ZWRBcnRpc3RzfSkge1xuXHRsZXQgYXJ0aXN0cyA9IHZpc2l0ZWRBcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiB7XG5cdFx0bGV0IGhyZWYgPSAnLz9hcnRpc3Q9JyArIGFydGlzdC5uYW1lO1xuXHRcdGxldCBpbWdVcmwgPSBhcnRpc3QuaW1hZ2VzLmxlbmd0aCA/IGFydGlzdC5pbWFnZXNbYXJ0aXN0LmltYWdlcy5sZW5ndGggLSAxXS51cmwgOiAnJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiPlxuXHRcdFx0XHRcdDxpbWcgY2xhc3NOYW1lPVwicGljdHVyZVwiIHNyYz17aW1nVXJsfSAvPlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH0pO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hdmlnYXRpb25cIj5cblx0XHRcdHthcnRpc3RzfVxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQgVHJpZ1V0aWxzIGZyb20gXCIuLi9jbGFzc2VzL3RyaWctdXRpbHMuY2xhc3NcIjtcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0YXJ0aXN0O1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXNzaWduTW91c2VXaGVlbCgpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0c3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcblx0XHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0XHR0aGlzLmZvcmNlVXBkYXRlKCk7XG5cdFx0fSk7XG5cdH1cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInRocmVlLXNjZW5lXCJcblx0XHRcdFx0IG9uQ2xpY2s9e3RoaXMub25DbGlja0hhbmRsZXJ9XG5cdFx0XHRcdCBvbk1vdXNlTW92ZT17dGhpcy5vbk1vdXNlTW92ZUhhbmRsZXJ9XG5cdFx0XHRcdCBvbk1vdXNlRG93bj17dGhpcy5vbk1vdXNlRG93bkhhbmRsZXJ9XG5cdFx0XHRcdCBvbk1vdXNlVXA9e3RoaXMub25Nb3VzZVVwSGFuZGxlcn1cblx0XHRcdC8+XG5cdFx0KVxuXHR9XG5cblx0b25DbGlja0hhbmRsZXIoKSB7XG5cblx0fVxuXG5cdG9uTW91c2VNb3ZlSGFuZGxlcigpIHtcblxuXHR9XG5cblx0b25Nb3VzZURvd25IYW5kbGVyKCkge1xuXG5cdH1cblxuXHRvbk1vdXNlVXBIYW5kbGVyKCkge1xuXG5cdH1cblxuXHRhc3NpZ25Nb3VzZVdoZWVsKCkge1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHJlZS1zY2VuZScpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQpID0+IHtcblx0XHRcdC8vIGlzIHdoZWVsRGVsdGFZIHBvc2l0aXZlIG9yIG5lZ2F0aXZlICh1cCBvciBkb3duKT9cblx0XHRcdHN3aXRjaCAoVHJpZ1V0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRcdGNhc2UgLTE6IC8vIG1vdXNlIHNjcm9sbCBkb3duIC8gem9vbSBvdXRcblx0XHRcdFx0XHR0aGlzLnpvb20oJ291dCcpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDE6IC8vIG1vdXNlIHNjcm9sbCB1cCAvIHpvb20gaW5cblx0XHRcdFx0XHR0aGlzLnpvb20oJ2luJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMDpcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSwgdHJ1ZSk7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFNlYXJjaElucHV0Q29tcG9uZW50KHtzZWFyY2hUZXJtLCBoYW5kbGVTZWFyY2gsIGhhbmRsZVNlYXJjaFRlcm1VcGRhdGV9KSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWFyY2gtZm9ybS1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImFydGlzdC1zZWFyY2hcIiBvblN1Ym1pdD17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwic2VhcmNoLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJlLmcuIEppbWkgSGVuZHJpeFwiIHZhbHVlPXtzZWFyY2hUZXJtfSBvbkNoYW5nZT17aGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0gLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBvbkNsaWNrPXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+R288L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQoe2FydGlzdH0pIHtcblx0Y29uc3QgZW1iZWRVcmwgPSAnaHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL2VtYmVkL2FydGlzdC8nO1xuXHRjb25zdCBhcnRpc3RFbWJlZFVybCA9IGAke2VtYmVkVXJsfSR7YXJ0aXN0LmlkfWA7XG5cdGxldCBpRnJhbWVNYXJrdXAgPSAnJztcblx0aWYgKGFydGlzdC5pZCkge1xuXHRcdGlGcmFtZU1hcmt1cCA9IChcblx0XHRcdDxkaXYgaWQ9XCJzcG90aWZ5LXBsYXllclwiPlxuXHRcdFx0XHQ8aWZyYW1lIHNyYz17YXJ0aXN0RW1iZWRVcmx9IHdpZHRoPVwiMzAwXCIgaGVpZ2h0PVwiODBcIiAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFsYnVtLW5hdlwiPlxuXHRcdFx0XHRcdDxhIGhyZWY9XCIjXCI+UHJldjwvYT5cblx0XHRcdFx0XHQ8YSBocmVmPVwiI1wiPk5leHQ8L2E+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJzcG90aWZ5LXBsYXllci1jb250YWluZXJcIj5cblx0XHRcdHtpRnJhbWVNYXJrdXB9XG5cdFx0PC9kaXY+XG5cdClcbn0iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RJbmZvQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdEluZm9Db250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RMaXN0Q29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnRcIjtcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dmlzaXRlZEFydGlzdHM6IHN0YXRlLnZpc2l0ZWRBcnRpc3RzXG5cdH1cbn07XG5cbmNvbnN0IEFydGlzdExpc3RDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0TGlzdENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdExpc3RDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTY2VuZUNvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTY2VuZUNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShTY2VuZUNvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7IFNlYXJjaElucHV0Q29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy9zZWFyY2gtaW5wdXQuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQgeyBNdXNpY0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IHVwZGF0ZVNlYXJjaFRlcm0gfSBmcm9tICcuLi9zdGF0ZS9hY3Rpb25zJztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0c2VhcmNoVGVybTogc3RhdGUuc2VhcmNoVGVybVxuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYW5kbGVTZWFyY2g6IChldnQsIHNlYXJjaFRlcm0pID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRNYWluQXJ0aXN0RGF0YShzZWFyY2hUZXJtKTtcblx0XHR9LFxuXHRcdGhhbmRsZVNlYXJjaFRlcm1VcGRhdGU6IChldnQpID0+IHtcblx0XHRcdGRpc3BhdGNoKHVwZGF0ZVNlYXJjaFRlcm0oZXZ0LnRhcmdldC52YWx1ZSkpO1xuXHRcdH1cblx0fVxufTtcblxuY29uc3QgU2VhcmNoQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoU2VhcmNoSW5wdXRDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTcG90aWZ5UGxheWVyQ29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnRcIjtcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU3BvdGlmeVBsYXllckNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShTcG90aWZ5UGxheWVyQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU3BvdGlmeVBsYXllckNvbnRhaW5lcjtcbiIsImltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7c2VhcmNoRG9uZX0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIE11c2ljRGF0YVNlcnZpY2Uge1xuXHRzdGF0aWMgZ2V0TWFpbkFydGlzdERhdGEoYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIlxuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiB7XG5cdFx0XHRyZXR1cm4gc3RvcmUuZGlzcGF0Y2goc2VhcmNoRG9uZShqc29uKSk7XG5cdFx0fSk7XG5cdH1cbn0iLCJleHBvcnQgY29uc3QgQVJUSVNUX1NFQVJDSF9ET05FID0gJ0FSVElTVF9TRUFSQ0hfRE9ORSc7XG5leHBvcnQgY29uc3QgU0VBUkNIX1RFUk1fVVBEQVRFID0gJ1NFQVJDSF9URVJNX1VQREFURSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hEb25lKGRhdGEpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBBUlRJU1RfU0VBUkNIX0RPTkUsXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZWFyY2hUZXJtKHNlYXJjaFRlcm0pIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTRUFSQ0hfVEVSTV9VUERBVEUsXG5cdFx0c2VhcmNoVGVybTogc2VhcmNoVGVybVxuXHR9XG59IiwiaW1wb3J0IHtTRUFSQ0hfVEVSTV9VUERBVEUsIEFSVElTVF9TRUFSQ0hfRE9ORX0gZnJvbSAnLi4vYWN0aW9ucydcblxuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuXHRhcnRpc3Q6IHtcblx0XHRpZDogJycsXG5cdFx0bmFtZTogJycsXG5cdFx0aW1nVXJsOiAnJyxcblx0XHRnZW5yZXM6IFtdLFxuXHRcdHBvcHVsYXJpdHk6IDAsXG5cdFx0aW1hZ2VzOiBbXVxuXHR9LFxuXHRzZWFyY2hUZXJtOiAnJyxcblx0dmlzaXRlZEFydGlzdHM6IFtdXG59O1xuXG5jb25zdCBhcnRpc3RTZWFyY2ggPSAoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikgPT4ge1xuXHRzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBTRUFSQ0hfVEVSTV9VUERBVEU6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLnNlYXJjaFRlcm0sXG5cdFx0XHR9O1xuXHRcdGNhc2UgQVJUSVNUX1NFQVJDSF9ET05FOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdGFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdHZpc2l0ZWRBcnRpc3RzOiBbXG5cdFx0XHRcdFx0Li4uc3RhdGUudmlzaXRlZEFydGlzdHMsXG5cdFx0XHRcdFx0YWN0aW9uLmRhdGFcblx0XHRcdFx0XVxuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhcnRpc3RTZWFyY2g7IiwiaW1wb3J0IHtjcmVhdGVTdG9yZX0gZnJvbSAncmVkdXgnO1xuaW1wb3J0IGFydGlzdFNlYXJjaCBmcm9tIFwiLi9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoXCI7XG5cbmV4cG9ydCBsZXQgc3RvcmUgPSBjcmVhdGVTdG9yZShcblx0YXJ0aXN0U2VhcmNoLFxuXHR3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXyAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXygpXG4pO1xuXG5cbiJdfQ==
