(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],2:[function(require,module,exports){
(function (global){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":1,"./lib/rng":2}],4:[function(require,module,exports){
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

_reactDom2.default.render(React.createElement(
	_reactRedux.Provider,
	{ store: _store.store },
	React.createElement(_appComponent.AppComponent, null)
), document.getElementById('root'));

},{"./components/app.component.jsx":10,"./state/store":27,"react":undefined,"react-dom":undefined,"react-redux":undefined}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MotionLab = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * MotionLab deals with controlling each tick of the animation frame sequence
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * It's aim is to isolate code that happens over a number of frames (i.e. motion)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _props = require("./props");

var _sceneUtils = require("./scene-utils.class");

var _three = require("three");

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TRACK_CAM_TO_OBJ = 'TRACK_CAM_TO_OBJ';
var DEFAULT = 'DEFAULT';
var defaultJob = {
	type: DEFAULT
};

var MotionLab = exports.MotionLab = function () {
	function MotionLab() {
		_classCallCheck(this, MotionLab);

		this.job = defaultJob;
		this.animate();
	}

	_createClass(MotionLab, [{
		key: "animate",
		value: function animate() {
			var _this = this;

			_props.Props.t2 = Date.now();
			this.processScene();
			_props.Props.renderer.render(_props.Props.scene, _props.Props.camera);
			window.requestAnimationFrame(function () {
				_props.Props.t1 = _props.Props.t2;
				_this.animate.call(_this);
			});
		}
	}, {
		key: "processScene",
		value: function processScene() {
			switch (this.job.type) {
				case TRACK_CAM_TO_OBJ:
					this.translateTransitionObject();
					break;
				case DEFAULT:
					this.updateRotation();
					break;
			}
		}
	}, {
		key: "translateTransitionObject",
		value: function translateTransitionObject() {
			var shouldEnd = parseInt(this.job.currentTime) === 1;
			if (!shouldEnd) {
				this.followPath();
			} else {
				this.endAnimation();
			}
		}
	}, {
		key: "followPath",
		value: function followPath() {
			var p = this.job.path.getPoint(this.job.currentTime);
			this.job.object3D.position.copy(p);
			this.job.currentTime += 0.01;
		}
	}, {
		key: "endAnimation",
		value: function endAnimation() {
			this.job.callback && this.job.callback();
			this.job = defaultJob;
		}
	}, {
		key: "trackObjectToCamera",
		value: function trackObjectToCamera(object3D, callback) {
			this.job = {};
			this.job.type = TRACK_CAM_TO_OBJ;
			this.job.t = 0.0;
			this.job.currentTime = 0.0;
			this.job.callback = callback;
			this.job.object3D = object3D;
			this.job.ended = false;
			this.job.path = new THREE.CatmullRomCurve3([object3D.position.clone(), _props.Props.camera.position.clone()]);
		}

		/**
   * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
   * Rotation of camera is *inverse* of mouse movement direction
   */

	}, {
		key: "updateRotation",
		value: function updateRotation() {
			var camQuaternionUpdate = this.getNewCameraDirection();
			_props.Props.camera.position.set(camQuaternionUpdate.x * _props.Props.cameraDistance, camQuaternionUpdate.y * _props.Props.cameraDistance, camQuaternionUpdate.z * _props.Props.cameraDistance);
			_props.Props.camera.lookAt(_props.Props.cameraLookAt);
			// update rotation of text attached objects, to force them to look at camera
			// this makes them readable
			_props.Props.graphContainer.traverse(function (obj) {
				if (obj.type === _props.TEXT_GEOMETRY) {
					var cameraNorm = _props.Props.camera.position.clone().normalize();
					obj.position.set(cameraNorm.x * obj.parent.radius, cameraNorm.y * obj.parent.radius, cameraNorm.z * obj.parent.radius);
					obj.lookAt(_props.Props.graphContainer.worldToLocal(_props.Props.camera.position));
				}
			});
			this.reduceSpeed(0.0005);
		}
	}, {
		key: "getNewCameraDirection",
		value: function getNewCameraDirection() {
			var camQuaternionUpdate = void 0;
			var yMoreThanXMouse = _props.Props.mousePosDiffY >= _props.Props.mousePosDiffX;
			var xMoreThanYMouse = !yMoreThanXMouse;
			if (_props.Props.mousePosYIncreased && yMoreThanXMouse) {
				_props.Props.cameraRotation.x -= _props.Props.speedX;
			} else if (!_props.Props.mousePosYIncreased && yMoreThanXMouse) {
				_props.Props.cameraRotation.x += _props.Props.speedX;
			}

			if (_props.Props.mousePosXIncreased && xMoreThanYMouse) {
				_props.Props.cameraRotation.y += _props.Props.speedY;
			} else if (!_props.Props.mousePosXIncreased && xMoreThanYMouse) {
				_props.Props.cameraRotation.y -= _props.Props.speedY;
			}
			camQuaternionUpdate = _sceneUtils.SceneUtils.renormalizeQuaternion(_props.Props.camera);
			camQuaternionUpdate.setFromEuler(_props.Props.cameraRotation);
			return camQuaternionUpdate;
		}
	}, {
		key: "reduceSpeed",
		value: function reduceSpeed(amount) {
			if (_props.Props.speedX > 0.005) {
				_props.Props.speedX -= amount;
			}

			if (_props.Props.speedY > 0.005) {
				_props.Props.speedY -= amount;
			}
		}
	}]);

	return MotionLab;
}();

},{"./props":6,"./scene-utils.class":7,"three":undefined}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CONNECTING_LINE = exports.TEXT_GEOMETRY = exports.RELATED_ARTIST_SPHERE = exports.MAIN_ARTIST_SPHERE = exports.Props = undefined;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Props = exports.Props = {
	renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000),
	graphContainer: new THREE.Object3D(),
	cameraRotation: new THREE.Euler(0, -1, 0),
	cameraLookAt: new THREE.Vector3(0, 0, 0),
	cameraDistance: 3500,

	t1: 0.0, // old time
	t2: 0.0, // now time
	speedX: 0.005,
	speedY: 0.000,
	mousePosDiffX: 0.0,
	mousePosDiffY: 0.0,
	mousePosXIncreased: false,
	mousePosYIncreased: false,
	raycaster: new THREE.Raycaster(),
	mouseVector: new THREE.Vector2(),

	relatedArtistSpheres: [],
	mainArtistSphere: {},
	selectedArtistSphere: {}
};

var MAIN_ARTIST_SPHERE = exports.MAIN_ARTIST_SPHERE = 'MAIN_ARTIST_SPHERE';
var RELATED_ARTIST_SPHERE = exports.RELATED_ARTIST_SPHERE = 'RELATED_ARTIST_SPHERE';
var TEXT_GEOMETRY = exports.TEXT_GEOMETRY = 'TEXT_GEOMETRY';
var CONNECTING_LINE = exports.CONNECTING_LINE = 'CONNECTING_LINE';

},{"three":undefined}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SceneUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _colours = require('../config/colours');

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _props = require('./props');

var _statistics = require('./statistics.class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HELVETIKER = void 0;
var MAIN_ARTIST_FONT_SIZE = 34;
var RELATED_ARTIST_FONT_SIZE = 20;
var TOTAL_RELATED = 5;

var SceneUtils = function () {
	function SceneUtils() {
		_classCallCheck(this, SceneUtils);
	}

	_createClass(SceneUtils, null, [{
		key: 'init',
		value: function init() {
			return new Promise(function (resolve, reject) {
				var loader = new THREE.FontLoader();
				loader.load('./js/fonts/helvetiker_regular.typeface.json', function (font) {
					HELVETIKER = font;
					resolve();
				}, function () {}, reject);
			});
		}
		/**
   *
   * @param a - min
   * @param b - max
   * @param c - value to clamp
   * @returns {number}
   */

	}, {
		key: 'clamp',
		value: function clamp(a, b, c) {
			return Math.max(b, Math.min(c, a));
		}

		/**
   * Given positive x return 1, negative x return -1, or 0 otherwise
   * @param n
   * @returns {number}
   */

	}, {
		key: 'sign',
		value: function sign(n) {
			return n > 0 ? 1 : n < 0 ? -1 : 0;
		}
	}, {
		key: 'renormalizeQuaternion',
		value: function renormalizeQuaternion(object) {
			var clone = object.clone();
			var q = clone.quaternion;
			var magnitude = Math.sqrt(Math.pow(q.w, 2) + Math.pow(q.x, 2) + Math.pow(q.y, 2) + Math.pow(q.z, 2));
			q.w /= magnitude;
			q.x /= magnitude;
			q.y /= magnitude;
			q.z /= magnitude;
			return q;
		}
	}, {
		key: 'getIntersectsFromMousePos',
		value: function getIntersectsFromMousePos() {
			_props.Props.raycaster.setFromCamera(_props.Props.mouseVector, _props.Props.camera);
			return _props.Props.raycaster.intersectObjects(_props.Props.graphContainer.children, true);
		}
	}, {
		key: 'getMouseVector',
		value: function getMouseVector(event) {
			return new THREE.Vector2(event.clientX / _props.Props.renderer.domElement.clientWidth * 2 - 1, -(event.clientY / _props.Props.renderer.domElement.clientHeight) * 2 + 1);
		}
	}, {
		key: 'createMainArtistSphere',
		value: function createMainArtistSphere(artist) {
			var radius = _statistics.Statistics.getArtistSphereSize(artist);
			var geometry = new THREE.SphereGeometry(radius, 35, 35);
			var sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.mainArtist }));
			sphere.artistObj = artist;
			sphere.radius = radius;
			sphere.type = _props.MAIN_ARTIST_SPHERE;
			SceneUtils.addText(artist.name, MAIN_ARTIST_FONT_SIZE, sphere);
			return sphere;
		}
	}, {
		key: 'createRelatedSpheres',
		value: function createRelatedSpheres(artist, mainArtistSphere) {
			var relatedArtistsSphereArray = [];
			var relatedArtist = void 0;
			var sphereFaceIndex = 0;
			var facesCount = mainArtistSphere.geometry.faces.length - 1;
			var step = Math.round(facesCount / TOTAL_RELATED - 1);

			for (var i = 0, len = Math.min(TOTAL_RELATED, artist.related.length); i < len; i++) {
				relatedArtist = artist.related[i];
				var radius = _statistics.Statistics.getArtistSphereSize(relatedArtist);
				var geometry = new THREE.SphereGeometry(radius, 35, 35);
				var relatedArtistSphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.relatedArtist }));
				var genreMetrics = _statistics.Statistics.getSharedGenreMetric(artist, relatedArtist);
				relatedArtistSphere.artistObj = relatedArtist;
				relatedArtistSphere.artistObj.genreSimilarity = genreMetrics.genreSimilarity;
				relatedArtistSphere.distance = genreMetrics.lineLength;
				relatedArtistSphere.radius = radius;
				relatedArtistSphere.type = _props.RELATED_ARTIST_SPHERE;
				sphereFaceIndex += step;
				SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, sphereFaceIndex);
				SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
				SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere);
				relatedArtistsSphereArray.push(relatedArtistSphere);
			}
			return relatedArtistsSphereArray;
		}
	}, {
		key: 'appendObjectsToScene',
		value: function appendObjectsToScene(graphContainer, sphere, sphereArray) {
			var parent = new THREE.Object3D();
			parent.name = 'parent';
			parent.add(sphere);
			if (sphereArray) {
				for (var i = 0; i < sphereArray.length; i++) {
					parent.add(sphereArray[i]);
				}
			}
			graphContainer.add(parent);
		}
	}, {
		key: 'joinRelatedArtistSphereToMain',
		value: function joinRelatedArtistSphereToMain(mainArtistSphere, relatedSphere) {
			var material = new THREE.LineBasicMaterial({ color: _colours.Colours.relatedLineJoin });
			var geometry = new THREE.Geometry();
			var line = void 0;
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(relatedSphere.position.clone());
			line = new THREE.Line(geometry, material);
			line.type = _props.CONNECTING_LINE;
			mainArtistSphere.add(line);
		}
	}, {
		key: 'positionRelatedArtist',
		value: function positionRelatedArtist(mainArtistSphere, relatedSphere, sphereFaceIndex) {
			var mainArtistSphereFace = mainArtistSphere.geometry.faces[Math.floor(sphereFaceIndex)].normal.clone();
			relatedSphere.position.copy(mainArtistSphereFace.multiply(new THREE.Vector3(relatedSphere.distance, relatedSphere.distance, relatedSphere.distance)));
		}
	}, {
		key: 'addText',
		value: function addText(label, size, sphere) {
			var materialFront = new THREE.MeshBasicMaterial({ color: _colours.Colours.textOuter });
			var materialSide = new THREE.MeshBasicMaterial({ color: _colours.Colours.textInner });
			var materialArray = [materialFront, materialSide];
			var textGeom = new THREE.TextGeometry(label, {
				font: HELVETIKER,
				size: size,
				curveSegments: 4,
				bevelEnabled: true,
				bevelThickness: 2,
				bevelSize: 1,
				bevelSegments: 3
			});
			var textMesh = new THREE.Mesh(textGeom, materialArray);
			var cameraNorm = _props.Props.camera.position.clone().normalize();
			textMesh.type = _props.TEXT_GEOMETRY;
			sphere.add(textMesh);
			textMesh.position.set(cameraNorm.x * sphere.radius, cameraNorm.y * sphere.radius, cameraNorm.z * sphere.radius);
			textMesh.lookAt(_props.Props.graphContainer.worldToLocal(_props.Props.camera.position));
		}
	}, {
		key: 'lighting',
		value: function lighting() {
			var lightA = new THREE.DirectionalLight(0xcccccc, 1.725);
			var lightB = new THREE.DirectionalLight(0xaaaaaa, 1.5);
			lightA.position.setX(500);
			lightB.position.setY(-800);
			lightB.position.setX(-500);
			_props.Props.scene.add(lightA);
			_props.Props.scene.add(lightB);
		}
	}]);

	return SceneUtils;
}();

exports.SceneUtils = SceneUtils;

},{"../config/colours":17,"./props":6,"./statistics.class":9,"three":undefined,"uuid/v4":3}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpheresScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * SpheresScene is designed to handle adding and removing entities from the scene,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * and handling events.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * It aims to deal not with changes over time, only immediate changes in one frame.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _sceneUtils = require("./scene-utils.class");

var _colours = require("../config/colours");

var _motionLab = require("./motion-lab.class");

var _musicData = require("../services/music-data.service");

var _props = require("./props");

var _store = require("../state/store");

var _actions = require("../state/actions");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpheresScene = exports.SpheresScene = function () {
	function SpheresScene(container) {
		_classCallCheck(this, SpheresScene);

		var artistId = void 0;
		this.hoveredRelatedSphere = null;
		this.motionLab = new _motionLab.MotionLab();

		// attach to dom
		_props.Props.renderer.setSize(window.innerWidth, window.innerHeight);
		_props.Props.renderer.domElement.id = 'renderer';
		_props.Props.container = container;
		_props.Props.container.appendChild(_props.Props.renderer.domElement);

		// init the scene
		_props.Props.graphContainer.position.set(1, 5, 0);
		_props.Props.scene.add(_props.Props.graphContainer);
		_props.Props.scene.add(_props.Props.camera);
		_props.Props.camera.position.set(0, 250, _props.Props.cameraDistance);
		_props.Props.camera.lookAt(_props.Props.scene.position);
		_sceneUtils.SceneUtils.lighting(_props.Props.scene);

		// check for query string
		artistId = decodeURIComponent(window.location.hash.replace('#', ''));
		if (artistId) {
			_musicData.MusicDataService.getArtist(artistId);
		}
	}

	_createClass(SpheresScene, [{
		key: "composeScene",
		value: function composeScene(artist) {
			this.clearGraph();
			window.location.hash = encodeURIComponent(artist.id);
			_props.Props.mainArtistSphere = _sceneUtils.SceneUtils.createMainArtistSphere(artist);
			_props.Props.relatedArtistSpheres = _sceneUtils.SceneUtils.createRelatedSpheres(artist, _props.Props.mainArtistSphere);
			_props.Props.selectedArtistSphere = _props.Props.mainArtistSphere;
			_sceneUtils.SceneUtils.appendObjectsToScene(_props.Props.graphContainer, _props.Props.mainArtistSphere, _props.Props.relatedArtistSpheres);
		}
	}, {
		key: "onSceneMouseHover",
		value: function onSceneMouseHover(event) {
			var selected = void 0;
			var intersects = void 0;
			var isOverRelated = false;
			_props.Props.mouseVector = _sceneUtils.SceneUtils.getMouseVector(event);
			_props.Props.mouseIsOverRelated = false;
			intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos();
			this.unhighlightRelatedSphere();
			if (intersects.length) {
				selected = intersects[0].object;
				if (this.hoveredSphere && selected.id === this.hoveredSphere.id) {
					return true;
				}
				if (_props.Props.selectedArtistSphere && selected.id === _props.Props.selectedArtistSphere.id) {
					return true;
				}
				switch (selected.type) {
					case _props.RELATED_ARTIST_SPHERE:
						this.hoveredSphere = selected;
						this.highlightRelatedSphere(_colours.Colours.relatedArtistHover);
						break;
					case _props.TEXT_GEOMETRY:
						this.hoveredSphere = selected.parent;
						this.highlightRelatedSphere(_colours.Colours.relatedArtistHover);
						break;
					case _props.MAIN_ARTIST_SPHERE:
					default:
						this.hoveredSphere = selected;
						if (this.hoveredRelatedSphere && _props.Props.selectedArtistSphere.id !== this.hoveredRelatedSphere.id) {
							this.highlightRelatedSphere(_colours.Colours.relatedArtistHover);
						}
						break;
				}
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
			return isOverRelated;
		}
	}, {
		key: "onSceneMouseClick",
		value: function onSceneMouseClick(event) {
			_props.Props.mouseVector = _sceneUtils.SceneUtils.getMouseVector(event);
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos();
			if (intersects.length) {
				var selected = intersects[0].object;
				if (_props.Props.selectedArtistSphere && selected.id === _props.Props.selectedArtistSphere.id) {
					return;
				}
				this.resetClickedSphere();
				switch (selected.type) {
					case _props.RELATED_ARTIST_SPHERE:
						_props.Props.selectedArtistSphere = selected;
						this.setupClickedSphere(_colours.Colours.relatedArtistClicked);
						break;
					case _props.TEXT_GEOMETRY:
						_props.Props.selectedArtistSphere = selected.parent;
						this.setupClickedSphere(_colours.Colours.relatedArtistClicked);
						break;
					case _props.MAIN_ARTIST_SPHERE:
						_props.Props.selectedArtistSphere = selected;
						this.setupClickedSphere(_colours.Colours.mainArtist);
						break;
				}
			}
		}
	}, {
		key: "onSceneMouseDrag",
		value: function onSceneMouseDrag(event) {
			var dt = _props.Props.t2 - _props.Props.t1;
			_props.Props.mouseVector = _sceneUtils.SceneUtils.getMouseVector(event);
			_props.Props.mousePosXIncreased = _props.Props.mouseVector.x > _props.Props.oldMouseVector.x;
			_props.Props.mousePosYIncreased = _props.Props.mouseVector.y > _props.Props.oldMouseVector.y;
			_props.Props.mousePosDiffX = Math.abs(Math.abs(_props.Props.mouseVector.x) - Math.abs(_props.Props.oldMouseVector.x));
			_props.Props.mousePosDiffY = Math.abs(Math.abs(_props.Props.mouseVector.y) - Math.abs(_props.Props.oldMouseVector.y));
			_props.Props.speedX = (1 + _props.Props.mousePosDiffX) / dt;
			_props.Props.speedY = (1 + _props.Props.mousePosDiffY) / dt;
			_props.Props.oldMouseVector = _props.Props.mouseVector;
		}
	}, {
		key: "unhighlightRelatedSphere",
		value: function unhighlightRelatedSphere() {
			this.hoveredSphere && this.hoveredSphere.material.color.setHex(_colours.Colours.relatedArtist);
			this.hoveredSphere = null;
			_store.store.dispatch((0, _actions.hideRelated)());
		}
	}, {
		key: "highlightRelatedSphere",
		value: function highlightRelatedSphere(colour) {
			this.hoveredSphere.material.color.setHex(colour);
			_store.store.dispatch((0, _actions.showRelated)(this.hoveredSphere.artistObj));
		}
	}, {
		key: "setupClickedSphere",
		value: function setupClickedSphere(colour) {
			_props.Props.selectedArtistSphere.material.color.setHex(colour);
			_musicData.MusicDataService.fetchDisplayAlbums(_props.Props.selectedArtistSphere.artistObj);
		}
	}, {
		key: "resetClickedSphere",
		value: function resetClickedSphere() {
			if (!_props.Props.selectedArtistSphere.type) {
				return;
			}
			switch (_props.Props.selectedArtistSphere.type) {
				case _props.RELATED_ARTIST_SPHERE:
					_props.Props.selectedArtistSphere.material.color.setHex(_colours.Colours.relatedArtist);
					break;
				case _props.MAIN_ARTIST_SPHERE:
					_props.Props.selectedArtistSphere.material.color.setHex(_colours.Colours.mainArtist);
					break;
			}
			_props.Props.selectedArtistSphere = {};
		}
	}, {
		key: "getRelatedArtist",
		value: function getRelatedArtist(selectedSphere) {
			var _this = this;

			this.clearGraph();
			_sceneUtils.SceneUtils.appendObjectsToScene(_props.Props.graphContainer, selectedSphere);
			this.motionLab.trackObjectToCamera(selectedSphere, function () {
				_this.clearGraph();
				_musicData.MusicDataService.getArtist(selectedSphere.artistObj.id);
			});
		}
	}, {
		key: "clearGraph",
		value: function clearGraph() {
			var parent = _props.Props.graphContainer.getObjectByName('parent');
			if (parent) {
				_props.Props.graphContainer.remove(parent);
			}
		}
	}, {
		key: "clearAddress",
		value: function clearAddress() {
			window.location.hash = '';
		}
	}, {
		key: "zoom",
		value: function zoom(direction) {
			switch (direction) {
				case 'in':
					_props.Props.cameraDistance -= 35;
					break;
				case 'out':
					_props.Props.cameraDistance += 35;
					break;
			}
		}
	}, {
		key: "updateCameraAspect",
		value: function updateCameraAspect() {
			_props.Props.camera.aspect = window.innerWidth / window.innerHeight;
			_props.Props.camera.updateProjectionMatrix();
			_props.Props.renderer.setSize(window.innerWidth, window.innerHeight);
		}
	}]);

	return SpheresScene;
}();

},{"../config/colours":17,"../services/music-data.service":24,"../state/actions":25,"../state/store":27,"./motion-lab.class":5,"./props":6,"./scene-utils.class":7}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_DISTANCE = 800;
var SIZE_SCALAR_SMALL = 1.25;
var SIZE_SCALAR_BIG = 1.75;

var Statistics = exports.Statistics = function () {
	function Statistics() {
		_classCallCheck(this, Statistics);
	}

	_createClass(Statistics, null, [{
		key: "getArtistSphereSize",
		value: function getArtistSphereSize(artist) {
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

	}, {
		key: "getSharedGenreMetric",
		value: function getSharedGenreMetric(artist, relatedArtist) {
			var unit = void 0,
			    genreSimilarity = void 0,
			    relativeMinDistance = void 0,
			    artistGenreCount = void 0;
			var matches = artist.genres.map(function (mainArtistGenre) {
				return Statistics.matchArtistToRelatedGenres(mainArtistGenre, relatedArtist);
			}).reduce(function (accumulator, match) {
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
				lineLength: MAX_DISTANCE - MAX_DISTANCE * genreSimilarity + relativeMinDistance,
				genreSimilarity: Math.round(genreSimilarity * 100)
			};
		}
	}, {
		key: "matchArtistToRelatedGenres",
		value: function matchArtistToRelatedGenres(mainArtistGenre, relatedArtist) {
			return relatedArtist.genres.find(function (genre) {
				return genre === mainArtistGenre;
			});
		}
	}]);

	return Statistics;
}();

},{}],10:[function(require,module,exports){
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

var _relatedArtistInfo = require("../containers/related-artist-info.container");

var _relatedArtistInfo2 = _interopRequireDefault(_relatedArtistInfo);

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
                React.createElement(_relatedArtistInfo2.default, null),
                React.createElement(_artistInfo2.default, null),
                React.createElement(_artistList2.default, null)
            );
        }
    }]);

    return AppComponent;
}(React.Component);

},{"../containers/artist-info.container":18,"../containers/artist-list.container":19,"../containers/related-artist-info.container":20,"../containers/scene.container":21,"../containers/search-input.container":22,"../containers/spotify-player.container":23,"react":undefined}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ArtistInfoComponent = ArtistInfoComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ArtistInfoComponent(_ref) {
	var artist = _ref.artist,
	    isHidden = _ref.isHidden;

	var genres = artist.genres.map(function (genre) {
		return React.createElement(
			'span',
			{ className: 'pill', key: genre },
			genre
		);
	});
	var classes = isHidden ? 'hidden info-container main' : 'info-container main';
	return React.createElement(
		'div',
		{ className: classes },
		React.createElement(
			'div',
			{ className: 'artist-name-tag main' },
			artist.name
		),
		React.createElement(
			'div',
			{ className: 'popularity' },
			React.createElement(
				'span',
				{ className: 'title' },
				'Popularity:'
			),
			' ',
			React.createElement(
				'span',
				{ className: 'pill' },
				artist.popularity
			)
		),
		React.createElement(
			'div',
			{ className: 'genres' },
			genres
		)
	);
}

},{"react":undefined}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ArtistListComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

var _musicData = require('../services/music-data.service');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArtistListComponent = exports.ArtistListComponent = function (_React$Component) {
	_inherits(ArtistListComponent, _React$Component);

	function ArtistListComponent() {
		_classCallCheck(this, ArtistListComponent);

		return _possibleConstructorReturn(this, (ArtistListComponent.__proto__ || Object.getPrototypeOf(ArtistListComponent)).call(this));
	}

	_createClass(ArtistListComponent, [{
		key: 'handleGetArtist',
		value: function handleGetArtist(evt, artistId) {
			evt.preventDefault();
			_musicData.MusicDataService.getArtist(artistId);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			var artists = this.props.visitedArtists.map(function (artist) {
				var href = '/app/#' + encodeURIComponent(artist.id);
				var imgUrl = artist.images && artist.images.length ? artist.images[artist.images.length - 1].url : '';
				var imgStyle = { backgroundImage: 'url(' + imgUrl + ')' };
				return React.createElement(
					'div',
					{ className: 'artist', key: artist.id },
					React.createElement(
						'a',
						{ href: href, id: artist.id, className: 'nav-artist-link',
							onClick: function onClick(event) {
								_this2.handleGetArtist(event, artist.id);
							} },
						React.createElement(
							'div',
							{ className: 'picture-holder' },
							React.createElement('div', { className: 'picture', style: imgStyle })
						),
						React.createElement(
							'span',
							{ className: 'name' },
							artist.name
						)
					)
				);
			});
			var classes = this.props.isHidden ? 'hidden artist-navigation' : 'artist-navigation';
			return React.createElement(
				'div',
				{ className: classes, ref: function ref(elem) {
						return _this2.artistListDom = elem;
					} },
				artists
			);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.artistListDom.scrollTop = this.artistListDom.scrollHeight;
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.artistListDom.scrollTop = this.artistListDom.scrollHeight;
		}
	}]);

	return ArtistListComponent;
}(React.Component);

},{"../services/music-data.service":24,"../state/store":27,"react":undefined}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RelatedArtistInfoComponent = RelatedArtistInfoComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function RelatedArtistInfoComponent(_ref) {
	var relatedArtist = _ref.relatedArtist,
	    hideRelated = _ref.hideRelated,
	    hideInfo = _ref.hideInfo;

	var hiddenClass = hideRelated || hideInfo ? 'hidden info-container related' : 'info-container related';
	return React.createElement(
		'div',
		{ className: hiddenClass },
		React.createElement(
			'div',
			{ className: 'artist-name-tag related' },
			relatedArtist.name
		),
		React.createElement(
			'div',
			{ className: 'popularity' },
			React.createElement(
				'span',
				{ className: 'title' },
				'Popularity:'
			),
			' ',
			React.createElement(
				'span',
				{ className: 'pill' },
				relatedArtist.popularity
			)
		),
		React.createElement(
			'div',
			{ className: 'genres' },
			React.createElement(
				'span',
				{ className: 'title' },
				'Genre similarity:'
			),
			' ',
			React.createElement(
				'span',
				{ className: 'pill' },
				relatedArtist.genreSimilarity,
				'%'
			)
		)
	);
}

},{"react":undefined}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SceneComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _store = require('../state/store');

var _sceneUtils = require('../classes/scene-utils.class');

var _spheresScene = require('../classes/spheres-scene.class');

var _actions = require('../state/actions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SceneComponent = exports.SceneComponent = function (_React$Component) {
	_inherits(SceneComponent, _React$Component);

	function SceneComponent() {
		_classCallCheck(this, SceneComponent);

		var _this = _possibleConstructorReturn(this, (SceneComponent.__proto__ || Object.getPrototypeOf(SceneComponent)).call(this));

		_this.artist = _store.store.getState().artist;
		_this.mouseIsDown = false;
		return _this;
	}

	_createClass(SceneComponent, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			return React.createElement('div', { className: 'spheres-scene', ref: function ref(elem) {
					return _this2.sceneDom = elem;
				} });
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this3 = this;

			_sceneUtils.SceneUtils.init().then(function () {
				// load the font first (async)
				_this3.scene = new _spheresScene.SpheresScene(_this3.sceneDom);
				_this3.initScene();
			});
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.initScene();
		}
	}, {
		key: 'initScene',
		value: function initScene() {
			var artist = this.props.artist;

			this.sceneDom.addEventListener('contextmenu', function (event) {
				return event.preventDefault();
			}); // remove right click
			this.sceneDom.addEventListener('click', this, true);
			this.sceneDom.addEventListener('mousewheel', this, true);
			this.sceneDom.addEventListener('mousemove', this, true);
			this.sceneDom.addEventListener('mousedown', this, true);
			this.sceneDom.addEventListener('mouseup', this, true);
			window.addEventListener('resize', this, false);
			if (artist.id) {
				this.scene.composeScene(artist);
			} else {
				this.scene.clearGraph();
				this.scene.clearAddress();
			}
		}
	}, {
		key: 'handleEvent',
		value: function handleEvent(event) {
			this[event.type](event);
		}
	}, {
		key: 'click',
		value: function click(event) {
			this.sceneDom.className = 'spheres-scene grab';
			if (!this.isDragging) {
				this.scene.onSceneMouseClick(event);
			} else {
				this.isDragging = false;
			}
		}
	}, {
		key: 'mousemove',
		value: function mousemove(event) {
			var isOverRelated = false;
			this.sceneDom.className = 'spheres-scene grab';
			if (this.mouseIsDown) {
				this.isDragging = true;
				this.scene.onSceneMouseDrag(event);
			} else {
				isOverRelated = this.scene.onSceneMouseHover(event);
			}
			if (isOverRelated && !this.isDragging) {
				this.sceneDom.className = 'spheres-scene pointer';
			}
			if (this.isDragging) {
				this.sceneDom.className = 'spheres-scene grabbed';
			}
		}
	}, {
		key: 'mousedown',
		value: function mousedown() {
			this.mouseIsDown = true;
		}
	}, {
		key: 'mouseup',
		value: function mouseup() {
			this.mouseIsDown = false;
		}
	}, {
		key: 'mousewheel',
		value: function mousewheel(event) {
			switch (_sceneUtils.SceneUtils.sign(event.wheelDeltaY)) {
				case -1:
					this.scene.zoom('out');
					break;
				case 1:
					this.scene.zoom('in');
					break;
			}
		}
	}, {
		key: 'resize',
		value: function resize() {
			this.scene.updateCameraAspect();
		}
	}]);

	return SceneComponent;
}(React.Component);

},{"../classes/scene-utils.class":7,"../classes/spheres-scene.class":8,"../state/actions":25,"../state/store":27,"react":undefined}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SearchInputComponent = SearchInputComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SearchInputComponent(_ref) {
    var searchTerm = _ref.searchTerm,
        artist = _ref.artist,
        handleSearch = _ref.handleSearch,
        handleSearchTermUpdate = _ref.handleSearchTermUpdate,
        clearSession = _ref.clearSession;

    var clearBtnClass = artist.id ? 'clear-session' : 'hidden clear-session';
    return React.createElement(
        'div',
        { className: 'search-form-container' },
        React.createElement(
            'form',
            { className: 'artist-search', onSubmit: function onSubmit(evt) {
                    return handleSearch(evt, searchTerm);
                } },
            React.createElement('input', { type: 'text', id: 'search-input', placeholder: 'e.g. Jimi Hendrix', value: searchTerm, onChange: handleSearchTermUpdate }),
            React.createElement(
                'button',
                { type: 'submit', onClick: function onClick(evt) {
                        return handleSearch(evt, searchTerm);
                    } },
                'Go'
            ),
            React.createElement(
                'button',
                { className: clearBtnClass, type: 'button', onClick: function onClick(evt) {
                        return clearSession(evt);
                    } },
                'Clear Session'
            )
        )
    );
}

},{"react":undefined}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpotifyPlayerComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SpotifyPlayerComponent = exports.SpotifyPlayerComponent = function (_React$Component) {
	_inherits(SpotifyPlayerComponent, _React$Component);

	function SpotifyPlayerComponent(_ref) {
		var albumClickHandler = _ref.albumClickHandler;

		_classCallCheck(this, SpotifyPlayerComponent);

		var _this = _possibleConstructorReturn(this, (SpotifyPlayerComponent.__proto__ || Object.getPrototypeOf(SpotifyPlayerComponent)).call(this));

		_this.albumClickHandler = albumClickHandler;
		return _this;
	}

	_createClass(SpotifyPlayerComponent, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			var _props = this.props,
			    displayAlbumIndex = _props.displayAlbumIndex,
			    displayArtist = _props.displayArtist,
			    isHidden = _props.isHidden;

			var embedUrl = 'https://open.spotify.com/embed?uri=spotify:album:';
			var classes = isHidden ? 'hidden spotify-player-container' : 'spotify-player-container';
			var albums = displayArtist.albums;
			var artistEmbedUrl = void 0,
			    iFrameMarkup = '',
			    albumsListMarkup = '',
			    albumId = void 0;

			if (albums && albums.length) {
				albumId = albums[displayAlbumIndex].id;
				artistEmbedUrl = '' + embedUrl + albumId;
				iFrameMarkup = React.createElement(
					'div',
					{ className: 'spotify-player' },
					React.createElement('iframe', { src: artistEmbedUrl, width: '300', height: '380', frameBorder: '0', allowTransparency: 'true' })
				);
				albumsListMarkup = albums.map(function (album, index) {
					return React.createElement(
						'div',
						{ className: 'album', key: album.id },
						React.createElement(
							'a',
							{ href: 'javascript:void(0);', onClick: function onClick(evt) {
									return _this2.albumClickHandler(evt, index);
								} },
							album.name
						)
					);
				});
			}
			return React.createElement(
				'div',
				{ className: classes },
				iFrameMarkup,
				React.createElement(
					'div',
					{ className: 'albums-list' },
					albumsListMarkup
				)
			);
		}
	}]);

	return SpotifyPlayerComponent;
}(React.Component);

},{"react":undefined}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var Colours = exports.Colours = {
	background: 0x003366,
	relatedArtist: 0xcc3300,
	relatedArtistHover: 0x99cc99,
	relatedArtistClicked: 0xec9253,
	relatedLineJoin: 0xffffcc,
	mainArtist: 0xffcc00,
	textOuter: 0xffffcc,
	textInner: 0x000033
};

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require('react-redux');

var _artistInfo = require('../components/artist-info.component');

var mapStateToProps = function mapStateToProps(state) {
	return {
		artist: state.artist,
		isHidden: state.hideInfo
	};
};

var ArtistInfoContainer = (0, _reactRedux.connect)(mapStateToProps)(_artistInfo.ArtistInfoComponent);

exports.default = ArtistInfoContainer;

},{"../components/artist-info.component":11,"react-redux":undefined}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require("react-redux");

var _artistList = require("../components/artist-list.component");

var _musicData = require("../services/music-data.service");

var mapStateToProps = function mapStateToProps(state) {
	return {
		visitedArtists: state.visitedArtists,
		isHidden: state.hideInfo
	};
};

var ArtistListContainer = (0, _reactRedux.connect)(mapStateToProps)(_artistList.ArtistListComponent);

exports.default = ArtistListContainer;

},{"../components/artist-list.component":12,"../services/music-data.service":24,"react-redux":undefined}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require('react-redux');

var _relatedArtistInfo = require('../components/related-artist-info.component');

var mapStateToProps = function mapStateToProps(state) {
	return {
		relatedArtist: state.relatedArtist,
		hideRelated: state.hideRelated,
		hideInfo: state.hideInfo
	};
};

var RelatedArtistInfoContainer = (0, _reactRedux.connect)(mapStateToProps)(_relatedArtistInfo.RelatedArtistInfoComponent);

exports.default = RelatedArtistInfoContainer;

},{"../components/related-artist-info.component":13,"react-redux":undefined}],21:[function(require,module,exports){
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

},{"../components/scene.component":14,"react-redux":undefined}],22:[function(require,module,exports){
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
		searchTerm: state.searchTerm,
		artist: state.artist
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		handleSearch: function handleSearch(evt, artistName) {
			evt.preventDefault();
			_musicData.MusicDataService.search(artistName);
		},
		handleSearchTermUpdate: function handleSearchTermUpdate(evt) {
			dispatch((0, _actions.updateSearchTerm)(evt.target.value));
		},
		clearSession: function clearSession(evt) {
			evt.preventDefault();
			dispatch((0, _actions.clearSession)());
		}
	};
};

var SearchContainer = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_searchInputComponent.SearchInputComponent);

exports.default = SearchContainer;

},{"../components/search-input.component.jsx":15,"../services/music-data.service":24,"../state/actions":25,"react-redux":undefined}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require("react-redux");

var _spotifyPlayer = require("../components/spotify-player.component");

var _actions = require("../state/actions");

var mapStateToProps = function mapStateToProps(state) {
	return {
		isHidden: state.hideInfo,
		displayArtist: state.displayArtist,
		displayAlbumIndex: state.displayAlbumIndex
	};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
	return {
		albumClickHandler: function albumClickHandler(evt, albumIndex) {
			evt.preventDefault();
			dispatch((0, _actions.loadAlbum)(albumIndex));
		}
	};
};

var SpotifyPlayerContainer = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_spotifyPlayer.SpotifyPlayerComponent);

exports.default = SpotifyPlayerContainer;

},{"../components/spotify-player.component":16,"../state/actions":25,"react-redux":undefined}],24:[function(require,module,exports){
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
		key: 'search',
		value: function search(artistName) {
			var searchURL = '/api/search/' + encodeURIComponent(artistName);
			return window.fetch(searchURL, {
				credentials: 'same-origin'
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				return _store.store.dispatch((0, _actions.artistDataAvailable)(json));
			});
		}
	}, {
		key: 'getArtist',
		value: function getArtist(artistId) {
			var artistURL = '/api/artist/' + artistId;
			return window.fetch(artistURL, {
				credentials: 'same-origin'
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				return _store.store.dispatch((0, _actions.artistDataAvailable)(json));
			});
		}
	}, {
		key: 'fetchDisplayAlbums',
		value: function fetchDisplayAlbums(artist) {
			var artistURL = '/api/albums/' + artist.id;
			if (artist.albums && artist.albums.length) {
				// we've already downloaded the album list so just trigger UI update
				return _store.store.dispatch((0, _actions.displayArtist)(artist));
			}

			return window.fetch(artistURL, {
				credentials: 'same-origin'
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				artist.albums = json;
				_store.store.dispatch((0, _actions.displayArtist)(artist));
			});
		}
	}]);

	return MusicDataService;
}();

},{"../state/actions":25,"../state/store":27}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.artistDataAvailable = artistDataAvailable;
exports.displayArtist = displayArtist;
exports.updateSearchTerm = updateSearchTerm;
exports.relatedClick = relatedClick;
exports.showRelated = showRelated;
exports.hideRelated = hideRelated;
exports.clearSession = clearSession;
exports.loadAlbum = loadAlbum;
var ARTIST_DATA_AVAILABLE = exports.ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
var UPDATE_DISPLAY_ARTIST = exports.UPDATE_DISPLAY_ARTIST = 'UPDATE_DISPLAY_ARTIST';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
var RELATED_CLICK = exports.RELATED_CLICK = 'RELATED_CLICK';
var SHOW_RELATED_INFO = exports.SHOW_RELATED_INFO = 'SHOW_RELATED_INFO';
var HIDE_RELATED_INFO = exports.HIDE_RELATED_INFO = 'HIDE_RELATED_INFO';
var CLEAR_SESSION = exports.CLEAR_SESSION = 'CLEAR_SESSION';
var LOAD_ALBUM = exports.LOAD_ALBUM = 'LOAD_ALBUM';

function artistDataAvailable(data) {
	return {
		type: ARTIST_DATA_AVAILABLE,
		data: data
	};
}

function displayArtist(data) {
	return {
		type: UPDATE_DISPLAY_ARTIST,
		data: data
	};
}

function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	};
}

function relatedClick(relatedArtist) {
	return {
		type: RELATED_CLICK,
		data: relatedArtist
	};
}

function showRelated(relatedArtist) {
	return {
		type: SHOW_RELATED_INFO,
		data: relatedArtist
	};
}

function hideRelated() {
	return {
		type: HIDE_RELATED_INFO,
		data: null
	};
}

function clearSession() {
	return {
		type: CLEAR_SESSION
	};
}

function loadAlbum(albumId) {
	return {
		type: LOAD_ALBUM,
		data: albumId
	};
}

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actions = require('../actions');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = sessionStorage.getItem('state');
var emptyArtist = {
	id: '',
	name: '',
	imgUrl: '',
	genres: [],
	popularity: 0,
	images: [],
	albums: []
};
var emptyState = {
	artist: emptyArtist,
	relatedArtist: emptyArtist,
	searchTerm: '',
	visitedArtists: [],
	hideInfo: true,
	showRelated: false,
	displayArtist: emptyArtist,
	displayAlbumIndex: 0
};

if (!initialState) {
	initialState = _extends({}, emptyState);
} else {
	initialState = JSON.parse(initialState);
}

var appState = function appState() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
	var action = arguments[1];

	var newState = void 0;
	switch (action.type) {
		case _actions.SEARCH_TERM_UPDATE:
			newState = _extends({}, state, {
				searchTerm: action.searchTerm
			});
			break;
		case _actions.ARTIST_DATA_AVAILABLE:
			if (action.data.id) {
				var alreadyVisited = !!state.visitedArtists.length && state.visitedArtists.some(function (artist) {
					return artist.id === action.data.id;
				});
				var visitedArtists = alreadyVisited ? state.visitedArtists : [].concat(_toConsumableArray(state.visitedArtists), [action.data]);
				newState = _extends({}, state, {
					artist: action.data,
					displayArtist: action.data,
					visitedArtists: [].concat(_toConsumableArray(visitedArtists)),
					searchTerm: action.data.name,
					hideInfo: false,
					hideRelated: true,
					relatedArtist: _extends({}, emptyArtist),
					displayAlbumIndex: 0
				});
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				newState = state;
			}
			break;
		case _actions.UPDATE_DISPLAY_ARTIST:
			newState = _extends({}, state, {
				displayArtist: action.data,
				displayAlbumIndex: 0
			});
			break;
		case _actions.LOAD_ALBUM:
			newState = _extends({}, state, {
				displayAlbumIndex: action.data
			});
			break;
		case _actions.SHOW_RELATED_INFO:
			newState = _extends({}, state, {
				relatedArtist: action.data,
				hideRelated: false
			});
			break;
		case _actions.HIDE_RELATED_INFO:
			newState = _extends({}, state, {
				relatedArtist: _extends({}, emptyArtist),
				hideRelated: true
			});
			break;
		case _actions.CLEAR_SESSION:
			newState = _extends({}, emptyState);
			break;
		default:
			newState = state;
	}
	window.sessionStorage.setItem('state', JSON.stringify(newState));
	return newState;
};

exports.default = appState;

},{"../actions":25}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.store = undefined;

var _redux = require("redux");

var _appState = require("./reducers/app-state");

var _appState2 = _interopRequireDefault(_appState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = exports.store = (0, _redux.createStore)(_appState2.default, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

},{"./reducers/app-state":26,"redux":undefined}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdXVpZC9saWIvYnl0ZXNUb1V1aWQuanMiLCJub2RlX21vZHVsZXMvdXVpZC9saWIvcm5nLWJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXVpZC92NC5qcyIsInNyYy9qcy9ib290c3RyYXAuanN4Iiwic3JjL2pzL2NsYXNzZXMvbW90aW9uLWxhYi5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3Byb3BzLmpzIiwic3JjL2pzL2NsYXNzZXMvc2NlbmUtdXRpbHMuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9zcGhlcmVzLXNjZW5lLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3RhdGlzdGljcy5jbGFzcy5qcyIsInNyYy9qcy9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbmZpZy9jb2xvdXJzLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvYXJ0aXN0LWxpc3QuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zY2VuZS5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyLmpzIiwic3JjL2pzL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZS5qcyIsInNyYy9qcy9zdGF0ZS9hY3Rpb25zLmpzIiwic3JjL2pzL3N0YXRlL3JlZHVjZXJzL2FwcC1zdGF0ZS5qcyIsInNyYy9qcy9zdGF0ZS9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdCQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLE1BQVQsQ0FDQztBQUFBO0FBQUEsR0FBVSxtQkFBVjtBQUNDO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOzs7Ozs7Ozs7O3FqQkNOQTs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0lBQVksSzs7Ozs7O0FBRVosSUFBTSxtQkFBbUIs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Q0ksS0FESjtBQUVDLGFBQVEsT0FBTyxJQUZoQjtBQUdDLG9CQUFlLE9BQU8sSUFIdkI7QUFJQyxrREFDSSxjQURKLEVBSkQ7QUFPQyxpQkFBWSxPQUFPLElBQVAsQ0FBWSxJQVB6QjtBQVFDLGVBQVUsS0FSWDtBQVNDLGtCQUFhLElBVGQ7QUFVQyxpQ0FDSSxXQURKLENBVkQ7QUFhQyx3QkFBbUI7QUFicEI7QUFlQSxJQW5CRCxNQW1CTztBQUNOLFlBQVEsSUFBUixDQUFhLHNFQUFiO0FBQ0EsZUFBVyxLQUFYO0FBQ0E7QUFDRDtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLG1CQUFlLE9BQU8sSUFGdkI7QUFHQyx1QkFBbUI7QUFIcEI7QUFLQTtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLHVCQUFtQixPQUFPO0FBRjNCO0FBSUE7QUFDRDtBQUNDLDJCQUNJLEtBREo7QUFFQyxtQkFBZSxPQUFPLElBRnZCO0FBR0MsaUJBQWE7QUFIZDtBQUtBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsZ0NBQ0ksV0FESixDQUZEO0FBS0MsaUJBQWE7QUFMZDtBQU9BO0FBQ0Q7QUFDQywyQkFDSSxVQURKO0FBR0E7QUFDRDtBQUNDLGNBQVcsS0FBWDtBQW5FRjtBQXFFQSxRQUFPLGNBQVAsQ0FBc0IsT0FBdEIsQ0FBOEIsT0FBOUIsRUFBdUMsS0FBSyxTQUFMLENBQWUsUUFBZixDQUF2QztBQUNBLFFBQU8sUUFBUDtBQUNBLENBekVEOztrQkEyRWUsUTs7Ozs7Ozs7OztBQzVHZjs7QUFDQTs7Ozs7O0FBRU8sSUFBSSx3QkFBUSw0Q0FFbEIsT0FBTyw0QkFBUCxJQUF1QyxPQUFPLDRCQUFQLEVBRnJCLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG52YXIgYnl0ZVRvSGV4ID0gW107XG5mb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgKytpKSB7XG4gIGJ5dGVUb0hleFtpXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7XG59XG5cbmZ1bmN0aW9uIGJ5dGVzVG9VdWlkKGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBpID0gb2Zmc2V0IHx8IDA7XG4gIHZhciBidGggPSBieXRlVG9IZXg7XG4gIHJldHVybiBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnl0ZXNUb1V1aWQ7XG4iLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgSW4gdGhlXG4vLyBicm93c2VyIHRoaXMgaXMgYSBsaXR0bGUgY29tcGxpY2F0ZWQgZHVlIHRvIHVua25vd24gcXVhbGl0eSBvZiBNYXRoLnJhbmRvbSgpXG4vLyBhbmQgaW5jb25zaXN0ZW50IHN1cHBvcnQgZm9yIHRoZSBgY3J5cHRvYCBBUEkuICBXZSBkbyB0aGUgYmVzdCB3ZSBjYW4gdmlhXG4vLyBmZWF0dXJlLWRldGVjdGlvblxudmFyIHJuZztcblxudmFyIGNyeXB0byA9IGdsb2JhbC5jcnlwdG8gfHwgZ2xvYmFsLm1zQ3J5cHRvOyAvLyBmb3IgSUUgMTFcbmlmIChjcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAvLyBXSEFUV0cgY3J5cHRvIFJORyAtIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9DcnlwdG9cbiAgdmFyIHJuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4gIHJuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbiAgICByZXR1cm4gcm5kczg7XG4gIH07XG59XG5cbmlmICghcm5nKSB7XG4gIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgLy9cbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgLy8gcXVhbGl0eS5cbiAgdmFyIHJuZHMgPSBuZXcgQXJyYXkoMTYpO1xuICBybmcgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICB9XG5cbiAgICByZXR1cm4gcm5kcztcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBybmc7XG4iLCJ2YXIgcm5nID0gcmVxdWlyZSgnLi9saWIvcm5nJyk7XG52YXIgYnl0ZXNUb1V1aWQgPSByZXF1aXJlKCcuL2xpYi9ieXRlc1RvVXVpZCcpO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcblxuICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgYnVmID0gb3B0aW9ucyA9PSAnYmluYXJ5JyA/IG5ldyBBcnJheSgxNikgOiBudWxsO1xuICAgIG9wdGlvbnMgPSBudWxsO1xuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTtcblxuICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICBpZiAoYnVmKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyArK2lpKSB7XG4gICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgfHwgYnl0ZXNUb1V1aWQocm5kcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdjQ7XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7QXBwQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvYXBwLmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9e3N0b3JlfT5cblx0XHQ8QXBwQ29tcG9uZW50IC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pOyIsIi8qKlxuICogTW90aW9uTGFiIGRlYWxzIHdpdGggY29udHJvbGxpbmcgZWFjaCB0aWNrIG9mIHRoZSBhbmltYXRpb24gZnJhbWUgc2VxdWVuY2VcbiAqIEl0J3MgYWltIGlzIHRvIGlzb2xhdGUgY29kZSB0aGF0IGhhcHBlbnMgb3ZlciBhIG51bWJlciBvZiBmcmFtZXMgKGkuZS4gbW90aW9uKVxuICovXG5pbXBvcnQge1Byb3BzLCBURVhUX0dFT01FVFJZfSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jb25zdCBUUkFDS19DQU1fVE9fT0JKID0gJ1RSQUNLX0NBTV9UT19PQkonO1xuY29uc3QgREVGQVVMVCA9ICdERUZBVUxUJztcbmNvbnN0IGRlZmF1bHRKb2IgPSB7XG5cdHR5cGU6IERFRkFVTFRcbn07XG5cbmV4cG9ydCBjbGFzcyBNb3Rpb25MYWIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0XHR0aGlzLmFuaW1hdGUoKTtcblx0fVxuXG5cdGFuaW1hdGUoKSB7XG5cdFx0UHJvcHMudDIgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucHJvY2Vzc1NjZW5lKCk7XG5cdFx0UHJvcHMucmVuZGVyZXIucmVuZGVyKFByb3BzLnNjZW5lLCBQcm9wcy5jYW1lcmEpO1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXHRcdFx0UHJvcHMudDEgPSBQcm9wcy50Mjtcblx0XHRcdHRoaXMuYW5pbWF0ZS5jYWxsKHRoaXMpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvY2Vzc1NjZW5lKCkge1xuXHRcdHN3aXRjaCAodGhpcy5qb2IudHlwZSkge1xuXHRcdFx0Y2FzZSBUUkFDS19DQU1fVE9fT0JKOlxuXHRcdFx0XHR0aGlzLnRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERFRkFVTFQ6XG5cdFx0XHRcdHRoaXMudXBkYXRlUm90YXRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpIHtcblx0XHRjb25zdCBzaG91bGRFbmQgPSBwYXJzZUludCh0aGlzLmpvYi5jdXJyZW50VGltZSkgPT09IDE7XG5cdFx0aWYgKCFzaG91bGRFbmQpIHtcblx0XHRcdHRoaXMuZm9sbG93UGF0aCgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuZW5kQW5pbWF0aW9uKCk7XG5cdFx0fVxuXHR9XG5cblx0Zm9sbG93UGF0aCgpIHtcblx0XHRjb25zdCBwID0gdGhpcy5qb2IucGF0aC5nZXRQb2ludCh0aGlzLmpvYi5jdXJyZW50VGltZSk7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QucG9zaXRpb24uY29weShwKTtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSArPSAwLjAxO1xuXHR9XG5cblx0ZW5kQW5pbWF0aW9uKCkge1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrICYmIHRoaXMuam9iLmNhbGxiYWNrKCk7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHR9XG5cblx0dHJhY2tPYmplY3RUb0NhbWVyYShvYmplY3QzRCwgY2FsbGJhY2spIHtcbiAgICBcdHRoaXMuam9iID0ge307XG4gICAgXHR0aGlzLmpvYi50eXBlID0gVFJBQ0tfQ0FNX1RPX09CSjtcblx0XHR0aGlzLmpvYi50ID0gMC4wO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lID0gMC4wO1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QgPSBvYmplY3QzRDtcblx0XHR0aGlzLmpvYi5lbmRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuam9iLnBhdGggPSBuZXcgVEhSRUUuQ2F0bXVsbFJvbUN1cnZlMyhbXG5cdFx0XHRvYmplY3QzRC5wb3NpdGlvbi5jbG9uZSgpLFxuXHRcdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKClcblx0XHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUT0RPOiBvcHRpbWlzYXRpb24gLSBvbmx5IHVzZSB1cGRhdGVSb3RhdGlvbigpIGlmIHRoZSBtb3VzZSBpcyBkcmFnZ2luZyAvIHNwZWVkIGlzIGFib3ZlIGRlZmF1bHQgbWluaW11bVxuXHQgKiBSb3RhdGlvbiBvZiBjYW1lcmEgaXMgKmludmVyc2UqIG9mIG1vdXNlIG1vdmVtZW50IGRpcmVjdGlvblxuXHQgKi9cblx0dXBkYXRlUm90YXRpb24oKSB7XG5cdFx0Y29uc3QgY2FtUXVhdGVybmlvblVwZGF0ZSA9IHRoaXMuZ2V0TmV3Q2FtZXJhRGlyZWN0aW9uKCk7XG5cdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLnNldChcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueCAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS55ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnogKiBQcm9wcy5jYW1lcmFEaXN0YW5jZVxuXHRcdCk7XG5cdFx0UHJvcHMuY2FtZXJhLmxvb2tBdChQcm9wcy5jYW1lcmFMb29rQXQpO1xuXHRcdC8vIHVwZGF0ZSByb3RhdGlvbiBvZiB0ZXh0IGF0dGFjaGVkIG9iamVjdHMsIHRvIGZvcmNlIHRoZW0gdG8gbG9vayBhdCBjYW1lcmFcblx0XHQvLyB0aGlzIG1ha2VzIHRoZW0gcmVhZGFibGVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci50cmF2ZXJzZSgob2JqKSA9PiB7XG5cdFx0XHRpZiAob2JqLnR5cGUgPT09IFRFWFRfR0VPTUVUUlkpIHtcblx0XHRcdFx0bGV0IGNhbWVyYU5vcm0gPSBQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqLnBvc2l0aW9uLnNldChcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnggKiBvYmoucGFyZW50LnJhZGl1cyxcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnkgKiBvYmoucGFyZW50LnJhZGl1cyxcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnogKiBvYmoucGFyZW50LnJhZGl1c1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRvYmoubG9va0F0KFByb3BzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbChQcm9wcy5jYW1lcmEucG9zaXRpb24pKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnJlZHVjZVNwZWVkKDAuMDAwNSk7XG5cdH1cblxuXHRnZXROZXdDYW1lcmFEaXJlY3Rpb24oKSB7XG5cdFx0bGV0IGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdFx0Y29uc3QgeU1vcmVUaGFuWE1vdXNlID0gUHJvcHMubW91c2VQb3NEaWZmWSA+PSBQcm9wcy5tb3VzZVBvc0RpZmZYO1xuXHRcdGNvbnN0IHhNb3JlVGhhbllNb3VzZSA9ICF5TW9yZVRoYW5YTW91c2U7XG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggLT0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCArPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgKz0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSAtPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUgPSBTY2VuZVV0aWxzLnJlbm9ybWFsaXplUXVhdGVybmlvbihQcm9wcy5jYW1lcmEpO1xuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUuc2V0RnJvbUV1bGVyKFByb3BzLmNhbWVyYVJvdGF0aW9uKTtcblx0XHRyZXR1cm4gY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmIChQcm9wcy5zcGVlZFggPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRYIC09IGFtb3VudDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWSAtPSBhbW91bnQ7XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5leHBvcnQgY29uc3QgUHJvcHMgPSB7XG5cdHJlbmRlcmVyOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBhbHBoYTogdHJ1ZX0pLFxuXHRzY2VuZTogbmV3IFRIUkVFLlNjZW5lKCksXG5cdGNhbWVyYTogbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgNTAwLCAxNTAwMDApLFxuXHRncmFwaENvbnRhaW5lcjogbmV3IFRIUkVFLk9iamVjdDNEKCksXG5cdGNhbWVyYVJvdGF0aW9uOiBuZXcgVEhSRUUuRXVsZXIoMCwgLTEsIDApLFxuXHRjYW1lcmFMb29rQXQ6IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXHRjYW1lcmFEaXN0YW5jZTogMzUwMCxcblx0XG5cdHQxOiAwLjAsIC8vIG9sZCB0aW1lXG5cdHQyOiAwLjAsIC8vIG5vdyB0aW1lXG5cdHNwZWVkWDogMC4wMDUsXG5cdHNwZWVkWTogMC4wMDAsXG5cdG1vdXNlUG9zRGlmZlg6IDAuMCxcblx0bW91c2VQb3NEaWZmWTogMC4wLFxuXHRtb3VzZVBvc1hJbmNyZWFzZWQ6IGZhbHNlLFxuXHRtb3VzZVBvc1lJbmNyZWFzZWQ6IGZhbHNlLFxuXHRyYXljYXN0ZXI6IG5ldyBUSFJFRS5SYXljYXN0ZXIoKSxcblx0bW91c2VWZWN0b3I6IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFxuXHRyZWxhdGVkQXJ0aXN0U3BoZXJlczogW10sXG5cdG1haW5BcnRpc3RTcGhlcmU6IHt9LFxuXHRzZWxlY3RlZEFydGlzdFNwaGVyZToge31cbn07XG5cbmV4cG9ydCBjb25zdCBNQUlOX0FSVElTVF9TUEhFUkUgPSAnTUFJTl9BUlRJU1RfU1BIRVJFJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0FSVElTVF9TUEhFUkUgPSAnUkVMQVRFRF9BUlRJU1RfU1BIRVJFJztcbmV4cG9ydCBjb25zdCBURVhUX0dFT01FVFJZID0gJ1RFWFRfR0VPTUVUUlknO1xuZXhwb3J0IGNvbnN0IENPTk5FQ1RJTkdfTElORSA9ICdDT05ORUNUSU5HX0xJTkUnOyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5pbXBvcnQgdXVpZCBmcm9tICd1dWlkL3Y0JztcbmltcG9ydCB7Q09OTkVDVElOR19MSU5FLCBNQUlOX0FSVElTVF9TUEhFUkUsIFJFTEFURURfQVJUSVNUX1NQSEVSRSwgVEVYVF9HRU9NRVRSWSwgUHJvcHN9IGZyb20gXCIuL3Byb3BzXCI7XG5pbXBvcnQge1N0YXRpc3RpY3N9IGZyb20gXCIuL3N0YXRpc3RpY3MuY2xhc3NcIjtcblxubGV0IEhFTFZFVElLRVI7XG5jb25zdCBNQUlOX0FSVElTVF9GT05UX1NJWkUgPSAzNDtcbmNvbnN0IFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSA9IDIwO1xuY29uc3QgVE9UQUxfUkVMQVRFRCA9IDU7XG5cbmNsYXNzIFNjZW5lVXRpbHMge1xuXHRzdGF0aWMgaW5pdCgpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Y29uc3QgbG9hZGVyID0gbmV3IFRIUkVFLkZvbnRMb2FkZXIoKTtcblx0XHRcdGxvYWRlci5sb2FkKCcuL2pzL2ZvbnRzL2hlbHZldGlrZXJfcmVndWxhci50eXBlZmFjZS5qc29uJywgKGZvbnQpID0+IHtcblx0XHRcdFx0SEVMVkVUSUtFUiA9IGZvbnQ7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0sICgpPT57fSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGEgLSBtaW5cblx0ICogQHBhcmFtIGIgLSBtYXhcblx0ICogQHBhcmFtIGMgLSB2YWx1ZSB0byBjbGFtcFxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIGNsYW1wKGEsIGIsIGMpIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgoYiwgTWF0aC5taW4oYywgYSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdpdmVuIHBvc2l0aXZlIHggcmV0dXJuIDEsIG5lZ2F0aXZlIHggcmV0dXJuIC0xLCBvciAwIG90aGVyd2lzZVxuXHQgKiBAcGFyYW0gblxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIHNpZ24obikge1xuXHRcdHJldHVybiBuID4gMCA/IDEgOiBuIDwgMCA/IC0xIDogMDtcblx0fTtcblx0XG5cdHN0YXRpYyByZW5vcm1hbGl6ZVF1YXRlcm5pb24ob2JqZWN0KSB7XG5cdFx0bGV0IGNsb25lID0gb2JqZWN0LmNsb25lKCk7XG5cdFx0bGV0IHEgPSBjbG9uZS5xdWF0ZXJuaW9uO1xuXHRcdGxldCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoTWF0aC5wb3cocS53LCAyKSArIE1hdGgucG93KHEueCwgMikgKyBNYXRoLnBvdyhxLnksIDIpICsgTWF0aC5wb3cocS56LCAyKSk7XG5cdFx0cS53IC89IG1hZ25pdHVkZTtcblx0XHRxLnggLz0gbWFnbml0dWRlO1xuXHRcdHEueSAvPSBtYWduaXR1ZGU7XG5cdFx0cS56IC89IG1hZ25pdHVkZTtcblx0XHRyZXR1cm4gcTtcblx0fVxuXG5cdHN0YXRpYyBnZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKCkge1xuXHRcdFByb3BzLnJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKFByb3BzLm1vdXNlVmVjdG9yLCBQcm9wcy5jYW1lcmEpO1xuXHRcdHJldHVybiBQcm9wcy5yYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhQcm9wcy5ncmFwaENvbnRhaW5lci5jaGlsZHJlbiwgdHJ1ZSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0TW91c2VWZWN0b3IoZXZlbnQpIHtcblx0XHRyZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjIoKGV2ZW50LmNsaWVudFggLyBQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudFdpZHRoKSAqIDIgLSAxLFxuXHRcdFx0LShldmVudC5jbGllbnRZIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRIZWlnaHQpICogMiArIDEpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KSB7XG5cdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0bGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMubWFpbkFydGlzdH0pKTtcblx0XHRzcGhlcmUuYXJ0aXN0T2JqID0gYXJ0aXN0O1xuXHRcdHNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0c3BoZXJlLnR5cGUgPSBNQUlOX0FSVElTVF9TUEhFUkU7XG5cdFx0U2NlbmVVdGlscy5hZGRUZXh0KGFydGlzdC5uYW1lLCBNQUlOX0FSVElTVF9GT05UX1NJWkUsIHNwaGVyZSk7XG5cdFx0cmV0dXJuIHNwaGVyZTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIG1haW5BcnRpc3RTcGhlcmUpIHtcblx0XHRsZXQgcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheSA9IFtdO1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0O1xuXHRcdGxldCBzcGhlcmVGYWNlSW5kZXggPSAwO1xuXHRcdGxldCBmYWNlc0NvdW50ID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxO1xuXHRcdGxldCBzdGVwID0gTWF0aC5yb3VuZChmYWNlc0NvdW50IC8gVE9UQUxfUkVMQVRFRCAtIDEpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbiA9IE1hdGgubWluKFRPVEFMX1JFTEFURUQsIGFydGlzdC5yZWxhdGVkLmxlbmd0aCk7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdCA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShyZWxhdGVkQXJ0aXN0KTtcblx0XHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0XHRsZXQgcmVsYXRlZEFydGlzdFNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZEFydGlzdH0pKTtcblx0XHRcdGxldCBnZW5yZU1ldHJpY3MgPSBTdGF0aXN0aWNzLmdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iaiA9IHJlbGF0ZWRBcnRpc3Q7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iai5nZW5yZVNpbWlsYXJpdHkgPSBnZW5yZU1ldHJpY3MuZ2VucmVTaW1pbGFyaXR5O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5kaXN0YW5jZSA9IGdlbnJlTWV0cmljcy5saW5lTGVuZ3RoO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnR5cGUgPSBSRUxBVEVEX0FSVElTVF9TUEhFUkU7XG5cdFx0XHRzcGhlcmVGYWNlSW5kZXggKz0gc3RlcDtcblx0XHRcdFNjZW5lVXRpbHMucG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCk7XG5cdFx0XHRTY2VuZVV0aWxzLmpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0U2NlbmVVdGlscy5hZGRUZXh0KHJlbGF0ZWRBcnRpc3QubmFtZSwgUkVMQVRFRF9BUlRJU1RfRk9OVF9TSVpFLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkucHVzaChyZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXk7XG5cdH1cblxuXHRzdGF0aWMgYXBwZW5kT2JqZWN0c1RvU2NlbmUoZ3JhcGhDb250YWluZXIsIHNwaGVyZSwgc3BoZXJlQXJyYXkpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblx0XHRwYXJlbnQubmFtZSA9ICdwYXJlbnQnO1xuXHRcdHBhcmVudC5hZGQoc3BoZXJlKTtcblx0XHRpZiAoc3BoZXJlQXJyYXkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BoZXJlQXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0cGFyZW50LmFkZChzcGhlcmVBcnJheVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGdyYXBoQ29udGFpbmVyLmFkZChwYXJlbnQpO1xuXHR9XG5cblx0c3RhdGljIGpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRMaW5lSm9pbn0pO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdGxldCBsaW5lO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gocmVsYXRlZFNwaGVyZS5wb3NpdGlvbi5jbG9uZSgpKTtcblx0XHRsaW5lID0gbmV3IFRIUkVFLkxpbmUoZ2VvbWV0cnksIG1hdGVyaWFsKTtcblx0XHRsaW5lLnR5cGUgPSBDT05ORUNUSU5HX0xJTkU7XG5cdFx0bWFpbkFydGlzdFNwaGVyZS5hZGQobGluZSk7XG5cdH1cblxuXHRzdGF0aWMgcG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCkge1xuXHRcdGxldCBtYWluQXJ0aXN0U3BoZXJlRmFjZSA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXNbTWF0aC5mbG9vcihzcGhlcmVGYWNlSW5kZXgpXS5ub3JtYWwuY2xvbmUoKTtcblx0XHRyZWxhdGVkU3BoZXJlLnBvc2l0aW9uXG5cdFx0XHQuY29weShtYWluQXJ0aXN0U3BoZXJlRmFjZS5tdWx0aXBseShuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBhZGRUZXh0KGxhYmVsLCBzaXplLCBzcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogc2l6ZSxcblx0XHRcdGN1cnZlU2VnbWVudHM6IDQsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMixcblx0XHRcdGJldmVsU2l6ZTogMSxcblx0XHRcdGJldmVsU2VnbWVudHM6IDNcblx0XHR9KTtcblx0XHRsZXQgdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0ZXh0R2VvbSwgbWF0ZXJpYWxBcnJheSk7XG5cdFx0bGV0IGNhbWVyYU5vcm0gPSBQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5ub3JtYWxpemUoKTtcblx0XHR0ZXh0TWVzaC50eXBlID0gVEVYVF9HRU9NRVRSWTtcblx0XHRzcGhlcmUuYWRkKHRleHRNZXNoKTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1lcmFOb3JtLnggKiBzcGhlcmUucmFkaXVzLFxuXHRcdFx0Y2FtZXJhTm9ybS55ICogc3BoZXJlLnJhZGl1cyxcblx0XHRcdGNhbWVyYU5vcm0ueiAqIHNwaGVyZS5yYWRpdXNcblx0XHQpO1xuXHRcdHRleHRNZXNoLmxvb2tBdChQcm9wcy5ncmFwaENvbnRhaW5lci53b3JsZFRvTG9jYWwoUHJvcHMuY2FtZXJhLnBvc2l0aW9uKSk7XG5cdH1cblxuXHRzdGF0aWMgbGlnaHRpbmcoKSB7XG5cdFx0bGV0IGxpZ2h0QSA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4Y2NjY2NjLCAxLjcyNSk7XG5cdFx0bGV0IGxpZ2h0QiA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4YWFhYWFhLCAxLjUpO1xuXHRcdGxpZ2h0QS5wb3NpdGlvbi5zZXRYKDUwMCk7XG5cdFx0bGlnaHRCLnBvc2l0aW9uLnNldFkoLTgwMCk7XG5cdFx0bGlnaHRCLnBvc2l0aW9uLnNldFgoLTUwMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKGxpZ2h0QSk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKGxpZ2h0Qik7XG5cdH1cbn1cblxuZXhwb3J0IHsgU2NlbmVVdGlscyB9XG4iLCIvKipcbiAqIFNwaGVyZXNTY2VuZSBpcyBkZXNpZ25lZCB0byBoYW5kbGUgYWRkaW5nIGFuZCByZW1vdmluZyBlbnRpdGllcyBmcm9tIHRoZSBzY2VuZSxcbiAqIGFuZCBoYW5kbGluZyBldmVudHMuXG4gKlxuICogSXQgYWltcyB0byBkZWFsIG5vdCB3aXRoIGNoYW5nZXMgb3ZlciB0aW1lLCBvbmx5IGltbWVkaWF0ZSBjaGFuZ2VzIGluIG9uZSBmcmFtZS5cbiAqL1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tIFwiLi4vY29uZmlnL2NvbG91cnNcIjtcbmltcG9ydCB7TW90aW9uTGFifSBmcm9tIFwiLi9tb3Rpb24tbGFiLmNsYXNzXCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcbmltcG9ydCB7TUFJTl9BUlRJU1RfU1BIRVJFLCBQcm9wcywgUkVMQVRFRF9BUlRJU1RfU1BIRVJFLCBURVhUX0dFT01FVFJZfSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7aGlkZVJlbGF0ZWQsIHJlbGF0ZWRDbGljaywgc2hvd1JlbGF0ZWR9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmVzU2NlbmUge1xuXHRjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcblx0XHRsZXQgYXJ0aXN0SWQ7XG5cdFx0dGhpcy5ob3ZlcmVkUmVsYXRlZFNwaGVyZSA9IG51bGw7XG5cdFx0dGhpcy5tb3Rpb25MYWIgPSBuZXcgTW90aW9uTGFiKCk7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMSwgNSwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IFByb3BzLm1haW5BcnRpc3RTcGhlcmU7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMubWFpbkFydGlzdFNwaGVyZSwgUHJvcHMucmVsYXRlZEFydGlzdFNwaGVyZXMpO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpIHtcblx0XHRsZXQgc2VsZWN0ZWQ7XG5cdFx0bGV0IGludGVyc2VjdHM7XG5cdFx0bGV0IGlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoKTtcblx0XHR0aGlzLnVuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZSgpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmICh0aGlzLmhvdmVyZWRTcGhlcmUgJiYgc2VsZWN0ZWQuaWQgPT09IHRoaXMuaG92ZXJlZFNwaGVyZS5pZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSAmJiBzZWxlY3RlZC5pZCA9PT0gUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUuaWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRzd2l0Y2ggKHNlbGVjdGVkLnR5cGUpIHtcblx0XHRcdFx0Y2FzZSBSRUxBVEVEX0FSVElTVF9TUEhFUkU6XG5cdFx0XHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gc2VsZWN0ZWQ7XG5cdFx0XHRcdFx0dGhpcy5oaWdobGlnaHRSZWxhdGVkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdEhvdmVyKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBURVhUX0dFT01FVFJZOlxuXHRcdFx0XHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IHNlbGVjdGVkLnBhcmVudDtcblx0XHRcdFx0XHR0aGlzLmhpZ2hsaWdodFJlbGF0ZWRTcGhlcmUoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0SG92ZXIpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHRpZiAodGhpcy5ob3ZlcmVkUmVsYXRlZFNwaGVyZSAmJiBQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5pZCAhPT0gdGhpcy5ob3ZlcmVkUmVsYXRlZFNwaGVyZS5pZCkge1xuXHRcdFx0XHRcdFx0dGhpcy5oaWdobGlnaHRSZWxhdGVkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdEhvdmVyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdFx0cmV0dXJuIGlzT3ZlclJlbGF0ZWQ7XG5cdH1cblxuXHRvblNjZW5lTW91c2VDbGljayhldmVudCkge1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0bGV0IGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoKTtcblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUgJiYgc2VsZWN0ZWQuaWQgPT09IFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlLmlkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVzZXRDbGlja2VkU3BoZXJlKCk7XG5cdFx0XHRzd2l0Y2ggKHNlbGVjdGVkLnR5cGUpIHtcblx0XHRcdFx0Y2FzZSBSRUxBVEVEX0FSVElTVF9TUEhFUkU6XG5cdFx0XHRcdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLnNldHVwQ2xpY2tlZFNwaGVyZShDb2xvdXJzLnJlbGF0ZWRBcnRpc3RDbGlja2VkKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBURVhUX0dFT01FVFJZOlxuXHRcdFx0XHRcdFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdENsaWNrZWQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKENvbG91cnMubWFpbkFydGlzdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0b25TY2VuZU1vdXNlRHJhZyhldmVudCkge1xuXHRcdGNvbnN0IGR0ID0gUHJvcHMudDIgLSBQcm9wcy50MTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci54ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueCk7XG5cdFx0UHJvcHMubW91c2VQb3NZSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnkgPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci55KTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZYID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueCkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci54KSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWSA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLnkpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueSkpO1xuXHRcdFByb3BzLnNwZWVkWCA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlgpIC8gZHQpO1xuXHRcdFByb3BzLnNwZWVkWSA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlkpIC8gZHQpO1xuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdH1cblxuXHR1bmhpZ2hsaWdodFJlbGF0ZWRTcGhlcmUoKSB7XG5cdFx0dGhpcy5ob3ZlcmVkU3BoZXJlICYmXG5cdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdCk7XG5cdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gbnVsbDtcblx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0fVxuXG5cdGhpZ2hsaWdodFJlbGF0ZWRTcGhlcmUoY29sb3VyKSB7XG5cdFx0dGhpcy5ob3ZlcmVkU3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvdXIpO1xuXHRcdHN0b3JlLmRpc3BhdGNoKHNob3dSZWxhdGVkKHRoaXMuaG92ZXJlZFNwaGVyZS5hcnRpc3RPYmopKTtcblx0fVxuXG5cdHNldHVwQ2xpY2tlZFNwaGVyZShjb2xvdXIpIHtcblx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgoY29sb3VyKTtcblx0XHRNdXNpY0RhdGFTZXJ2aWNlLmZldGNoRGlzcGxheUFsYnVtcyhQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmopO1xuXHR9XG5cblx0cmVzZXRDbGlja2VkU3BoZXJlKCkge1xuXHRcdGlmICghUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUudHlwZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRzd2l0Y2ggKFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlLnR5cGUpIHtcblx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfU1BIRVJFOlxuXHRcdFx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMubWFpbkFydGlzdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IHt9O1xuXHR9XG5cblx0Z2V0UmVsYXRlZEFydGlzdChzZWxlY3RlZFNwaGVyZSkge1xuXHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFNjZW5lVXRpbHMuYXBwZW5kT2JqZWN0c1RvU2NlbmUoUHJvcHMuZ3JhcGhDb250YWluZXIsIHNlbGVjdGVkU3BoZXJlKTtcblx0XHR0aGlzLm1vdGlvbkxhYi50cmFja09iamVjdFRvQ2FtZXJhKHNlbGVjdGVkU3BoZXJlLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KHNlbGVjdGVkU3BoZXJlLmFydGlzdE9iai5pZCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjbGVhckdyYXBoKCkge1xuXHRcdGNvbnN0IHBhcmVudCA9IFByb3BzLmdyYXBoQ29udGFpbmVyLmdldE9iamVjdEJ5TmFtZSgncGFyZW50Jyk7XG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0UHJvcHMuZ3JhcGhDb250YWluZXIucmVtb3ZlKHBhcmVudCk7XG5cdFx0fVxuXHR9XG5cblx0Y2xlYXJBZGRyZXNzKCkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG5cdH1cblxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVDYW1lcmFBc3BlY3QoKSB7XG5cdFx0UHJvcHMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdFByb3BzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufVxuIiwiY29uc3QgTUFYX0RJU1RBTkNFID0gODAwO1xuY29uc3QgU0laRV9TQ0FMQVJfU01BTEwgPSAxLjI1O1xuY29uc3QgU0laRV9TQ0FMQVJfQklHID0gMS43NTtcblxuZXhwb3J0IGNsYXNzIFN0YXRpc3RpY3Mge1xuICAgIHN0YXRpYyBnZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkge1xuICAgIFx0aWYgKGFydGlzdC5wb3B1bGFyaXR5ID49IDUwKSB7XG5cdFx0XHRyZXR1cm4gYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUl9CSUc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSX1NNQUxMO1xuXHRcdH1cblxuICAgIH1cblxuXHQvKipcbiAgICAgKiBNYXAtcmVkdWNlIG9mIHR3byBzdHJpbmcgYXJyYXlzXG5cdCAqIEBwYXJhbSBhcnRpc3Rcblx0ICogQHBhcmFtIHJlbGF0ZWRBcnRpc3Rcblx0ICogQHJldHVybnMge29iamVjdH1cblx0ICovXG5cdHN0YXRpYyBnZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpIHtcblx0XHRsZXQgdW5pdCwgZ2VucmVTaW1pbGFyaXR5LCByZWxhdGl2ZU1pbkRpc3RhbmNlLCBhcnRpc3RHZW5yZUNvdW50O1xuXHRcdGxldCBtYXRjaGVzID0gYXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLm1hcCgobWFpbkFydGlzdEdlbnJlKSA9PiBTdGF0aXN0aWNzLm1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkpXG4gICAgICAgICAgICAucmVkdWNlKChhY2N1bXVsYXRvciwgbWF0Y2gpID0+IHtcblx0XHQgICAgICAgIGlmIChtYXRjaCkge1xuXHRcdCAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHR9XG5cdFx0ICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgICAgICAgICB9LCBbXSk7XG5cdFx0YXJ0aXN0R2VucmVDb3VudCA9IGFydGlzdC5nZW5yZXMubGVuZ3RoID8gYXJ0aXN0LmdlbnJlcy5sZW5ndGggOiAxO1xuXHRcdHVuaXQgPSAxIC8gYXJ0aXN0R2VucmVDb3VudDtcblx0XHR1bml0ID0gdW5pdCA9PT0gMSA/IDAgOiB1bml0O1xuXHRcdGdlbnJlU2ltaWxhcml0eSA9IG1hdGNoZXMubGVuZ3RoICogdW5pdDtcblx0XHRyZWxhdGl2ZU1pbkRpc3RhbmNlID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkgKyBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxpbmVMZW5ndGg6IChNQVhfRElTVEFOQ0UgLSAoTUFYX0RJU1RBTkNFICogZ2VucmVTaW1pbGFyaXR5KSkgKyByZWxhdGl2ZU1pbkRpc3RhbmNlLFxuXHRcdFx0Z2VucmVTaW1pbGFyaXR5OiBNYXRoLnJvdW5kKGdlbnJlU2ltaWxhcml0eSAqIDEwMClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIG1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkge1xuICAgICAgICByZXR1cm4gcmVsYXRlZEFydGlzdC5nZW5yZXNcbiAgICAgICAgICAgIC5maW5kKChnZW5yZSkgPT4gZ2VucmUgPT09IG1haW5BcnRpc3RHZW5yZSk7XG4gICAgfVxuIH0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuaW1wb3J0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyXCI7XG5pbXBvcnQgU2NlbmVDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0TGlzdENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtbGlzdC5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuaW1wb3J0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHAtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxTZWFyY2hDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U3BvdGlmeVBsYXllckNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdExpc3RDb250YWluZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0SW5mb0NvbXBvbmVudCh7YXJ0aXN0LCBpc0hpZGRlbn0pIHtcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIiBrZXk9e2dlbnJlfT57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBpbmZvLWNvbnRhaW5lciBtYWluJyA6ICdpbmZvLWNvbnRhaW5lciBtYWluJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyBtYWluXCI+e2FydGlzdC5uYW1lfTwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwb3B1bGFyaXR5XCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5Qb3B1bGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPnthcnRpc3QucG9wdWxhcml0eX08L3NwYW4+PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPntnZW5yZXN9PC9kaXY+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5leHBvcnQgY2xhc3MgQXJ0aXN0TGlzdENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdH1cblxuXHRoYW5kbGVHZXRBcnRpc3QoZXZ0LCBhcnRpc3RJZCkge1xuXHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KGFydGlzdElkKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgYXJ0aXN0cyA9IHRoaXMucHJvcHMudmlzaXRlZEFydGlzdHMubWFwKChhcnRpc3QpID0+IHtcblx0XHRcdGxldCBocmVmID0gJy9hcHAvIycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0LmlkKTtcblx0XHRcdGxldCBpbWdVcmwgPSBhcnRpc3QuaW1hZ2VzICYmIGFydGlzdC5pbWFnZXMubGVuZ3RoID8gYXJ0aXN0LmltYWdlc1thcnRpc3QuaW1hZ2VzLmxlbmd0aCAtIDFdLnVybCA6ICcnO1xuXHRcdFx0bGV0IGltZ1N0eWxlID0geyBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpbWdVcmx9KWAgfTtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0XCIga2V5PXthcnRpc3QuaWR9PlxuXHRcdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiXG5cdFx0XHRcdFx0ICAgb25DbGljaz17KGV2ZW50KSA9PiB7IHRoaXMuaGFuZGxlR2V0QXJ0aXN0KGV2ZW50LCBhcnRpc3QuaWQpIH19PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlLWhvbGRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzdHlsZT17aW1nU3R5bGV9IC8+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpXG5cdFx0fSk7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IHRoaXMucHJvcHMuaXNIaWRkZW4gPyAnaGlkZGVuIGFydGlzdC1uYXZpZ2F0aW9uJyA6ICdhcnRpc3QtbmF2aWdhdGlvbic7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSByZWY9e2VsZW0gPT4gdGhpcy5hcnRpc3RMaXN0RG9tID0gZWxlbX0+XG5cdFx0XHRcdHthcnRpc3RzfVxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbFRvcCA9IHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxIZWlnaHQ7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbFRvcCA9IHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxIZWlnaHQ7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50KHtyZWxhdGVkQXJ0aXN0LCBoaWRlUmVsYXRlZCwgaGlkZUluZm99KSB7XG5cdGNvbnN0IGhpZGRlbkNsYXNzID0gaGlkZVJlbGF0ZWQgfHwgaGlkZUluZm8gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIHJlbGF0ZWQnIDogJ2luZm8tY29udGFpbmVyIHJlbGF0ZWQnO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtoaWRkZW5DbGFzc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyByZWxhdGVkXCI+e3JlbGF0ZWRBcnRpc3QubmFtZX08L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57cmVsYXRlZEFydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5HZW5yZSBzaW1pbGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LmdlbnJlU2ltaWxhcml0eX0lPC9zcGFuPjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuLi9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge1NwaGVyZXNTY2VuZX0gZnJvbSBcIi4uL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzc1wiO1xuaW1wb3J0IHtyZWxhdGVkQ2xpY2t9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTY2VuZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiIHJlZj17ZWxlbSA9PiB0aGlzLnNjZW5lRG9tID0gZWxlbX0gLz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKS50aGVuKCgpID0+IHsgLy8gbG9hZCB0aGUgZm9udCBmaXJzdCAoYXN5bmMpXG5cdFx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0fVxuXG5cdGluaXRTY2VuZSgpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNsZWFyR3JhcGgoKTtcblx0XHRcdHRoaXMuc2NlbmUuY2xlYXJBZGRyZXNzKCk7XG5cdFx0fVxuXHR9XG5cblx0aGFuZGxlRXZlbnQoZXZlbnQpIHtcblx0XHR0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcblx0fVxuXG5cdGNsaWNrKGV2ZW50KSB7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAoIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VDbGljayhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlbW92ZShldmVudCkge1xuXHRcdGxldCBpc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAodGhpcy5tb3VzZUlzRG93bikge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlRHJhZyhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KTtcblx0XHR9XG5cdFx0aWYgKGlzT3ZlclJlbGF0ZWQgJiYgIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBwb2ludGVyJztcblx0XHR9XG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiYmVkJztcblx0XHR9XG5cdH1cblxuXHRtb3VzZWRvd24oKSB7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IHRydWU7XG5cdH1cblxuXHRtb3VzZXVwKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSBmYWxzZTtcblx0fVxuXG5cdG1vdXNld2hlZWwoZXZlbnQpIHtcblx0XHRzd2l0Y2ggKFNjZW5lVXRpbHMuc2lnbihldmVudC53aGVlbERlbHRhWSkpIHtcblx0XHRcdGNhc2UgLTE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnb3V0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ2luJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLnNjZW5lLnVwZGF0ZUNhbWVyYUFzcGVjdCgpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgYXJ0aXN0LCBoYW5kbGVTZWFyY2gsIGhhbmRsZVNlYXJjaFRlcm1VcGRhdGUsIGNsZWFyU2Vzc2lvbn0pIHtcbiAgICBjb25zdCBjbGVhckJ0bkNsYXNzID0gYXJ0aXN0LmlkID8gJ2NsZWFyLXNlc3Npb24nIDogJ2hpZGRlbiBjbGVhci1zZXNzaW9uJztcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPXtjbGVhckJ0bkNsYXNzfSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KGV2dCkgPT4gY2xlYXJTZXNzaW9uKGV2dCl9PkNsZWFyIFNlc3Npb248L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGNsYXNzIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcih7YWxidW1DbGlja0hhbmRsZXJ9KSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFsYnVtQ2xpY2tIYW5kbGVyID0gYWxidW1DbGlja0hhbmRsZXI7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgeyBkaXNwbGF5QWxidW1JbmRleCwgZGlzcGxheUFydGlzdCwgaXNIaWRkZW4gfSA9IHRoaXMucHJvcHM7XG5cdFx0Y29uc3QgZW1iZWRVcmwgPSAnaHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL2VtYmVkP3VyaT1zcG90aWZ5OmFsYnVtOic7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBzcG90aWZ5LXBsYXllci1jb250YWluZXInIDogJ3Nwb3RpZnktcGxheWVyLWNvbnRhaW5lcic7XG5cdFx0Y29uc3QgYWxidW1zID0gZGlzcGxheUFydGlzdC5hbGJ1bXM7XG5cdFx0bGV0IGFydGlzdEVtYmVkVXJsLFxuXHRcdFx0aUZyYW1lTWFya3VwID0gJycsXG5cdFx0XHRhbGJ1bXNMaXN0TWFya3VwID0gJycsXG5cdFx0XHRhbGJ1bUlkO1xuXHRcdFxuXHRcdGlmIChhbGJ1bXMgJiYgYWxidW1zLmxlbmd0aCkge1xuXHRcdFx0YWxidW1JZCA9IGFsYnVtc1tkaXNwbGF5QWxidW1JbmRleF0uaWQ7XG5cdFx0XHRhcnRpc3RFbWJlZFVybCA9IGAke2VtYmVkVXJsfSR7YWxidW1JZH1gO1xuXHRcdFx0aUZyYW1lTWFya3VwID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdFx0PGlmcmFtZSBzcmM9e2FydGlzdEVtYmVkVXJsfSB3aWR0aD1cIjMwMFwiIGhlaWdodD1cIjM4MFwiIGZyYW1lQm9yZGVyPVwiMFwiIGFsbG93VHJhbnNwYXJlbmN5PVwidHJ1ZVwiLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdFx0YWxidW1zTGlzdE1hcmt1cCA9IGFsYnVtcy5tYXAoKGFsYnVtLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYWxidW1cIiBrZXk9e2FsYnVtLmlkfT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgb25DbGljaz17KGV2dCkgPT4gdGhpcy5hbGJ1bUNsaWNrSGFuZGxlcihldnQsIGluZGV4KX0+e2FsYnVtLm5hbWV9PC9hPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhbGJ1bXMtbGlzdFwiPlxuXHRcdFx0XHRcdHthbGJ1bXNMaXN0TWFya3VwfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxufVxuIiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZEFydGlzdENsaWNrZWQ6IDB4ZWM5MjUzLFxuXHRyZWxhdGVkTGluZUpvaW46IDB4ZmZmZmNjLFxuXHRtYWluQXJ0aXN0OiAweGZmY2MwMCxcblx0dGV4dE91dGVyOiAweGZmZmZjYyxcblx0dGV4dElubmVyOiAweDAwMDAzM1xufTsiLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RJbmZvQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0LFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBBcnRpc3RJbmZvQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0TGlzdENvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvYXJ0aXN0LWxpc3QuY29tcG9uZW50XCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dmlzaXRlZEFydGlzdHM6IHN0YXRlLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5cbmNvbnN0IEFydGlzdExpc3RDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0TGlzdENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdExpc3RDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHJlbGF0ZWRBcnRpc3Q6IHN0YXRlLnJlbGF0ZWRBcnRpc3QsXG5cdFx0aGlkZVJlbGF0ZWQ6IHN0YXRlLmhpZGVSZWxhdGVkLFxuXHRcdGhpZGVJbmZvOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQge2NsZWFyU2Vzc2lvbiwgdXBkYXRlU2VhcmNoVGVybX0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm0sXG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBhcnRpc3ROYW1lKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2Uuc2VhcmNoKGFydGlzdE5hbWUpO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fSxcblx0XHRjbGVhclNlc3Npb246IChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZGlzcGF0Y2goY2xlYXJTZXNzaW9uKCkpO1xuXHRcdH1cblx0fVxufTtcblxuY29uc3QgU2VhcmNoQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoU2VhcmNoSW5wdXRDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTcG90aWZ5UGxheWVyQ29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnRcIjtcbmltcG9ydCB7bG9hZEFsYnVtfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm8sXG5cdFx0ZGlzcGxheUFydGlzdDogc3RhdGUuZGlzcGxheUFydGlzdCxcblx0XHRkaXNwbGF5QWxidW1JbmRleDogc3RhdGUuZGlzcGxheUFsYnVtSW5kZXhcblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YWxidW1DbGlja0hhbmRsZXI6IChldnQsIGFsYnVtSW5kZXgpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZGlzcGF0Y2gobG9hZEFsYnVtKGFsYnVtSW5kZXgpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTcG90aWZ5UGxheWVyQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU3BvdGlmeVBsYXllckNvbnRhaW5lcjtcbiIsImltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7YXJ0aXN0RGF0YUF2YWlsYWJsZSwgZGlzcGxheUFsYnVtcywgZGlzcGxheUFydGlzdH0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIE11c2ljRGF0YVNlcnZpY2Uge1xuXHRzdGF0aWMgc2VhcmNoKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdERhdGFBdmFpbGFibGUoanNvbikpKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRBcnRpc3QoYXJ0aXN0SWQpIHtcblx0XHRsZXQgYXJ0aXN0VVJMID0gJy9hcGkvYXJ0aXN0LycgKyBhcnRpc3RJZDtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKGFydGlzdFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGZldGNoRGlzcGxheUFsYnVtcyhhcnRpc3QpIHtcblx0XHRsZXQgYXJ0aXN0VVJMID0gJy9hcGkvYWxidW1zLycgKyBhcnRpc3QuaWQ7XG5cdFx0aWYgKGFydGlzdC5hbGJ1bXMgJiYgYXJ0aXN0LmFsYnVtcy5sZW5ndGgpIHsgLy8gd2UndmUgYWxyZWFkeSBkb3dubG9hZGVkIHRoZSBhbGJ1bSBsaXN0IHNvIGp1c3QgdHJpZ2dlciBVSSB1cGRhdGVcblx0XHRcdCByZXR1cm4gc3RvcmUuZGlzcGF0Y2goZGlzcGxheUFydGlzdChhcnRpc3QpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2luZG93LmZldGNoKGFydGlzdFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4ge1xuXHRcdFx0YXJ0aXN0LmFsYnVtcyA9IGpzb247XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChkaXNwbGF5QXJ0aXN0KGFydGlzdCkpXG5cdFx0fSk7XG5cdH1cbn0iLCJleHBvcnQgY29uc3QgQVJUSVNUX0RBVEFfQVZBSUxBQkxFID0gJ0FSVElTVF9EQVRBX0FWQUlMQUJMRSc7XG5leHBvcnQgY29uc3QgVVBEQVRFX0RJU1BMQVlfQVJUSVNUID0gJ1VQREFURV9ESVNQTEFZX0FSVElTVCc7XG5leHBvcnQgY29uc3QgU0VBUkNIX1RFUk1fVVBEQVRFID0gJ1NFQVJDSF9URVJNX1VQREFURSc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9DTElDSyA9ICdSRUxBVEVEX0NMSUNLJztcbmV4cG9ydCBjb25zdCBTSE9XX1JFTEFURURfSU5GTyA9ICdTSE9XX1JFTEFURURfSU5GTyc7XG5leHBvcnQgY29uc3QgSElERV9SRUxBVEVEX0lORk8gPSAnSElERV9SRUxBVEVEX0lORk8nO1xuZXhwb3J0IGNvbnN0IENMRUFSX1NFU1NJT04gPSAnQ0xFQVJfU0VTU0lPTic7XG5leHBvcnQgY29uc3QgTE9BRF9BTEJVTSA9ICdMT0FEX0FMQlVNJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFydGlzdERhdGFBdmFpbGFibGUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9EQVRBX0FWQUlMQUJMRSxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlBcnRpc3QoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFVQREFURV9ESVNQTEFZX0FSVElTVCxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlYXJjaFRlcm0oc2VhcmNoVGVybSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNFQVJDSF9URVJNX1VQREFURSxcblx0XHRzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0ZWRDbGljayhyZWxhdGVkQXJ0aXN0KSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogUkVMQVRFRF9DTElDSyxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dSZWxhdGVkKHJlbGF0ZWRBcnRpc3QpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTSE9XX1JFTEFURURfSU5GTyxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVSZWxhdGVkKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEhJREVfUkVMQVRFRF9JTkZPLFxuXHRcdGRhdGE6IG51bGxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IENMRUFSX1NFU1NJT05cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEFsYnVtKGFsYnVtSWQpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBMT0FEX0FMQlVNLFxuXHRcdGRhdGE6IGFsYnVtSWRcblx0fVxufVxuIiwiaW1wb3J0IHtcblx0U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEUsIFJFTEFURURfQ0xJQ0ssXG5cdENMRUFSX1NFU1NJT04sIFVQREFURV9ESVNQTEFZX0FSVElTVCwgU0hPV19SRUxBVEVEX0lORk8sIEhJREVfUkVMQVRFRF9JTkZPLCBMT0FEX0FMQlVNXG59IGZyb20gJy4uL2FjdGlvbnMnXG5sZXQgaW5pdGlhbFN0YXRlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc3RhdGUnKTtcbmNvbnN0IGVtcHR5QXJ0aXN0ID0ge1xuXHRpZDogJycsXG5cdG5hbWU6ICcnLFxuXHRpbWdVcmw6ICcnLFxuXHRnZW5yZXM6IFtdLFxuXHRwb3B1bGFyaXR5OiAwLFxuXHRpbWFnZXM6IFtdLFxuXHRhbGJ1bXM6IFtdXG59O1xuY29uc3QgZW1wdHlTdGF0ZSA9IHtcblx0YXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0cmVsYXRlZEFydGlzdDogZW1wdHlBcnRpc3QsXG5cdHNlYXJjaFRlcm06ICcnLFxuXHR2aXNpdGVkQXJ0aXN0czogW10sXG5cdGhpZGVJbmZvOiB0cnVlLFxuXHRzaG93UmVsYXRlZDogZmFsc2UsXG5cdGRpc3BsYXlBcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRkaXNwbGF5QWxidW1JbmRleDogMFxufTtcblxuaWYgKCFpbml0aWFsU3RhdGUpIHtcblx0aW5pdGlhbFN0YXRlID0ge1xuXHRcdC4uLmVtcHR5U3RhdGVcblx0fTtcbn0gZWxzZSB7XG5cdGluaXRpYWxTdGF0ZSA9IEpTT04ucGFyc2UoaW5pdGlhbFN0YXRlKTtcbn1cblxuY29uc3QgYXBwU3RhdGUgPSAoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikgPT4ge1xuXHRsZXQgbmV3U3RhdGU7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLnNlYXJjaFRlcm0sXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBUlRJU1RfREFUQV9BVkFJTEFCTEU6XG5cdFx0XHRpZiAoYWN0aW9uLmRhdGEuaWQpIHtcblx0XHRcdFx0bGV0IGFscmVhZHlWaXNpdGVkID0gISFzdGF0ZS52aXNpdGVkQXJ0aXN0cy5sZW5ndGhcblx0XHRcdFx0XHQmJiBzdGF0ZS52aXNpdGVkQXJ0aXN0cy5zb21lKChhcnRpc3QpID0+IGFydGlzdC5pZCA9PT0gYWN0aW9uLmRhdGEuaWQpO1xuXHRcdFx0XHRsZXQgdmlzaXRlZEFydGlzdHMgPSBhbHJlYWR5VmlzaXRlZCA/IHN0YXRlLnZpc2l0ZWRBcnRpc3RzIDogWy4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLCBhY3Rpb24uZGF0YV07XG5cdFx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRcdGFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0ZGlzcGxheUFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHRcdC4uLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLmRhdGEubmFtZSxcblx0XHRcdFx0XHRoaWRlSW5mbzogZmFsc2UsXG5cdFx0XHRcdFx0aGlkZVJlbGF0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdFx0Li4uZW1wdHlBcnRpc3Rcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ05vIEFQSSBkYXRhIGF2YWlsYWJsZSBmb3IgZ2l2ZW4gYXJ0aXN0LiBOZWVkIHRvIHJlZnJlc2ggQVBJIHNlc3Npb24/Jyk7XG5cdFx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVQREFURV9ESVNQTEFZX0FSVElTVDpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0ZGlzcGxheUFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBMT0FEX0FMQlVNOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRkaXNwbGF5QWxidW1JbmRleDogYWN0aW9uLmRhdGFcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFNIT1dfUkVMQVRFRF9JTkZPOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0aGlkZVJlbGF0ZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBISURFX1JFTEFURURfSU5GTzpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdC4uLmVtcHR5QXJ0aXN0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhpZGVSZWxhdGVkOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBDTEVBUl9TRVNTSU9OOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLmVtcHR5U3RhdGVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0bmV3U3RhdGUgPSBzdGF0ZTtcblx0fVxuXHR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnc3RhdGUnLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSkpO1xuXHRyZXR1cm4gbmV3U3RhdGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhcHBTdGF0ZTsiLCJpbXBvcnQge2NyZWF0ZVN0b3JlfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgYXBwU3RhdGUgZnJvbSBcIi4vcmVkdWNlcnMvYXBwLXN0YXRlXCI7XG5cbmV4cG9ydCBsZXQgc3RvcmUgPSBjcmVhdGVTdG9yZShcblx0YXBwU3RhdGUsXG5cdHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fICYmIHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fKClcbik7XG5cblxuIl19
