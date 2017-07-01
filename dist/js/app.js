(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _appComponent = require('./components/app.component.jsx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// cancel right click
document.onmousedown = function (event) {
    return event.button !== 2;
};

(0, _reactDom2.default)(React.createElement(_appComponent.AppComponent, null), document.getElementById('root'));

},{"./components/app.component.jsx":2,"react":"react","react-dom":"react-dom"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AppComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _sceneComponent = require("./scene.component.jsx");

var _searchInputComponent = require("./search-input.component.jsx");

var _spotifyPlayerComponent = require("./spotify-player.component.jsx");

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
                React.createElement(_searchInputComponent.SearchInputComponent, null),
                React.createElement(_sceneComponent.SceneComponent, null),
                React.createElement(_spotifyPlayerComponent.SpotifyPlayerComponent, null)
            );
        }
    }]);

    return AppComponent;
}(React.Component);

},{"./scene.component.jsx":3,"./search-input.component.jsx":4,"./spotify-player.component.jsx":5,"react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SceneComponent = undefined;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SceneComponent = exports.SceneComponent = function (_React$Component) {
    _inherits(SceneComponent, _React$Component);

    function SceneComponent() {
        _classCallCheck(this, SceneComponent);

        return _possibleConstructorReturn(this, (SceneComponent.__proto__ || Object.getPrototypeOf(SceneComponent)).call(this));
    }

    return SceneComponent;
}(React.Component);

},{"react":"react"}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SearchInputComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchInputComponent = exports.SearchInputComponent = function (_React$Component) {
    _inherits(SearchInputComponent, _React$Component);

    function SearchInputComponent(props) {
        _classCallCheck(this, SearchInputComponent);

        var _this = _possibleConstructorReturn(this, (SearchInputComponent.__proto__ || Object.getPrototypeOf(SearchInputComponent)).call(this));

        _this.handleSearch.bind(_this);
        _this.props = props;
        return _this;
    }

    _createClass(SearchInputComponent, [{
        key: "handleSearch",
        value: function handleSearch(event) {
            this.setState({ searchTerm: event.target.value });
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "search-form-container" },
                React.createElement(
                    "form",
                    { className: "artist-search", onSubmit: this.handleSearch },
                    React.createElement("input", { type: "text", id: "search-input", placeholder: "e.g. Jimi Hendrix", value: this.props.searchTerm })
                )
            );
        }
    }]);

    return SearchInputComponent;
}(React.Component);

},{"react":"react"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SpotifyPlayerComponent = undefined;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SpotifyPlayerComponent = exports.SpotifyPlayerComponent = function (_React$Component) {
    _inherits(SpotifyPlayerComponent, _React$Component);

    function SpotifyPlayerComponent() {
        _classCallCheck(this, SpotifyPlayerComponent);

        return _possibleConstructorReturn(this, (SpotifyPlayerComponent.__proto__ || Object.getPrototypeOf(SpotifyPlayerComponent)).call(this));
    }

    return SpotifyPlayerComponent;
}(React.Component);

},{"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7O0lBQVksSzs7QUFDWjs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBLFNBQVMsV0FBVCxHQUF1QixVQUFDLEtBQUQ7QUFBQSxXQUFXLE1BQU0sTUFBTixLQUFpQixDQUE1QjtBQUFBLENBQXZCOztBQUVBLHdCQUNJLHFEQURKLEVBRUMsU0FBUyxjQUFULENBQXdCLE1BQXhCLENBRkQ7Ozs7Ozs7Ozs7OztBQ1BBOztJQUFZLEs7O0FBQ1o7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7SUFFYSxZLFdBQUEsWTs7O0FBRVQsNEJBQWM7QUFBQTs7QUFBQTtBQUViOzs7O2lDQUVRO0FBQ0wsbUJBQ0k7QUFBQTtBQUFBLGtCQUFLLFdBQVUsZUFBZjtBQUNJLHFGQURKO0FBRUkseUVBRko7QUFHSTtBQUhKLGFBREo7QUFPSDs7OztFQWQ2QixNQUFNLFM7Ozs7Ozs7Ozs7QUNMeEM7O0lBQVksSzs7Ozs7Ozs7OztJQUVDLGMsV0FBQSxjOzs7QUFDVCw4QkFBYztBQUFBOztBQUFBO0FBRWI7OztFQUgrQixNQUFNLFM7Ozs7Ozs7Ozs7OztBQ0YxQzs7SUFBWSxLOzs7Ozs7Ozs7O0lBRUMsb0IsV0FBQSxvQjs7O0FBRVQsa0NBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBOztBQUVmLGNBQUssWUFBTCxDQUFrQixJQUFsQjtBQUNBLGNBQUssS0FBTCxHQUFhLEtBQWI7QUFIZTtBQUlsQjs7OztxQ0FFWSxLLEVBQU87QUFDaEIsaUJBQUssUUFBTCxDQUFjLEVBQUMsWUFBWSxNQUFNLE1BQU4sQ0FBYSxLQUExQixFQUFkO0FBQ0g7OztpQ0FFUTtBQUNMLG1CQUNJO0FBQUE7QUFBQSxrQkFBSyxXQUFVLHVCQUFmO0FBQ0k7QUFBQTtBQUFBLHNCQUFNLFdBQVUsZUFBaEIsRUFBZ0MsVUFBVSxLQUFLLFlBQS9DO0FBQ0ksbURBQU8sTUFBSyxNQUFaLEVBQW1CLElBQUcsY0FBdEIsRUFBcUMsYUFBWSxtQkFBakQsRUFBcUUsT0FBTyxLQUFLLEtBQUwsQ0FBVyxVQUF2RjtBQURKO0FBREosYUFESjtBQU9IOzs7O0VBcEJxQyxNQUFNLFM7Ozs7Ozs7Ozs7QUNGaEQ7O0lBQVksSzs7Ozs7Ozs7OztJQUVDLHNCLFdBQUEsc0I7OztBQUNULHNDQUFjO0FBQUE7O0FBQUE7QUFFYjs7O0VBSHVDLE1BQU0sUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgcmVuZGVyIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0FwcENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4J1xuXG4vLyBjYW5jZWwgcmlnaHQgY2xpY2tcbmRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50KSA9PiBldmVudC5idXR0b24gIT09IDI7XG5cbnJlbmRlcihcbiAgICA8QXBwQ29tcG9uZW50IC8+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pOyIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gXCIuL3NjZW5lLmNvbXBvbmVudC5qc3hcIjtcbmltcG9ydCB7U2VhcmNoSW5wdXRDb21wb25lbnR9IGZyb20gXCIuL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4XCI7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudC5qc3hcIjtcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8U2VhcmNoSW5wdXRDb21wb25lbnQgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb21wb25lbnQvPlxuICAgICAgICAgICAgICAgIDxTcG90aWZ5UGxheWVyQ29tcG9uZW50IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hJbnB1dENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgcHJvcHM7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5oYW5kbGVTZWFyY2guYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIH1cblxuICAgIGhhbmRsZVNlYXJjaChldmVudCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWFyY2hUZXJtOiBldmVudC50YXJnZXQudmFsdWV9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImFydGlzdC1zZWFyY2hcIiBvblN1Ym1pdD17dGhpcy5oYW5kbGVTZWFyY2h9PlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17dGhpcy5wcm9wcy5zZWFyY2hUZXJtfSAvPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgY2xhc3MgU3BvdGlmeVBsYXllckNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxufVxuIl19
