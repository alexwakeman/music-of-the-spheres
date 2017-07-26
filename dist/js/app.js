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
	selectedArtistSphere: { id: 0 }
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
		this.motionLab = new _motionLab.MotionLab();
		this.hoveredSphere = null;

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
				switch (selected.type) {
					case _props.RELATED_ARTIST_SPHERE:
						this.hoveredSphere = selected;
						this.highlightRelatedSphere(_colours.Colours.relatedArtistHover);
						break;
					case _props.TEXT_GEOMETRY:
						if (selected.parent.type !== _props.MAIN_ARTIST_SPHERE) {
							this.hoveredSphere = selected.parent;
							this.highlightRelatedSphere(_colours.Colours.relatedArtistHover);
						}
						break;
				}
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
			return isOverRelated;
		}
	}, {
		key: "unhighlightRelatedSphere",
		value: function unhighlightRelatedSphere() {
			if (this.hoveredSphere && this.hoveredSphere.id !== _props.Props.selectedArtistSphere.id) {
				this.hoveredSphere.material.color.setHex(_colours.Colours.relatedArtist);
				this.hoveredSphere = null;
				_store.store.dispatch((0, _actions.hideRelated)());
			}
		}
	}, {
		key: "highlightRelatedSphere",
		value: function highlightRelatedSphere(colour) {
			this.hoveredSphere.material.color.setHex(colour);
			_store.store.dispatch((0, _actions.showRelated)(this.hoveredSphere.artistObj));
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
			_props.Props.selectedArtistSphere = { id: 0 };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdXVpZC9saWIvYnl0ZXNUb1V1aWQuanMiLCJub2RlX21vZHVsZXMvdXVpZC9saWIvcm5nLWJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXVpZC92NC5qcyIsInNyYy9qcy9ib290c3RyYXAuanN4Iiwic3JjL2pzL2NsYXNzZXMvbW90aW9uLWxhYi5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3Byb3BzLmpzIiwic3JjL2pzL2NsYXNzZXMvc2NlbmUtdXRpbHMuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9zcGhlcmVzLXNjZW5lLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3RhdGlzdGljcy5jbGFzcy5qcyIsInNyYy9qcy9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbmZpZy9jb2xvdXJzLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvYXJ0aXN0LWxpc3QuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zY2VuZS5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyLmpzIiwic3JjL2pzL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZS5qcyIsInNyYy9qcy9zdGF0ZS9hY3Rpb25zLmpzIiwic3JjL2pzL3N0YXRlL3JlZHVjZXJzL2FwcC1zdGF0ZS5qcyIsInNyYy9qcy9zdGF0ZS9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdCQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLE1BQVQsQ0FDQztBQUFBO0FBQUEsR0FBVSxtQkFBVjtBQUNDO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOzs7Ozs7Ozs7O3FqQkNOQTs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0lBQVksSzs7Ozs7O0FBRVosSUFBTSxtQkFBbUIs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LENBQWEsc0VBQWI7QUFDQSxlQUFXLEtBQVg7QUFDQTtBQUNEO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsbUJBQWUsT0FBTyxJQUZ2QjtBQUdDLHVCQUFtQjtBQUhwQjtBQUtBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsdUJBQW1CLE9BQU87QUFGM0I7QUFJQTtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLG1CQUFlLE9BQU8sSUFGdkI7QUFHQyxpQkFBYTtBQUhkO0FBS0E7QUFDRDtBQUNDLDJCQUNJLEtBREo7QUFFQyxnQ0FDSSxXQURKLENBRkQ7QUFLQyxpQkFBYTtBQUxkO0FBT0E7QUFDRDtBQUNDLDJCQUNJLFVBREo7QUFHQTtBQUNEO0FBQ0MsY0FBVyxLQUFYO0FBbkVGO0FBcUVBLFFBQU8sY0FBUCxDQUFzQixPQUF0QixDQUE4QixPQUE5QixFQUF1QyxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXZDO0FBQ0EsUUFBTyxRQUFQO0FBQ0EsQ0F6RUQ7O2tCQTJFZSxROzs7Ozs7Ozs7O0FDNUdmOztBQUNBOzs7Ozs7QUFFTyxJQUFJLHdCQUFRLDRDQUVsQixPQUFPLDRCQUFQLElBQXVDLE9BQU8sNEJBQVAsRUFGckIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cbnZhciBieXRlVG9IZXggPSBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbn1cblxuZnVuY3Rpb24gYnl0ZXNUb1V1aWQoYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBvZmZzZXQgfHwgMDtcbiAgdmFyIGJ0aCA9IGJ5dGVUb0hleDtcbiAgcmV0dXJuIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBieXRlc1RvVXVpZDtcbiIsIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBJbiB0aGVcbi8vIGJyb3dzZXIgdGhpcyBpcyBhIGxpdHRsZSBjb21wbGljYXRlZCBkdWUgdG8gdW5rbm93biBxdWFsaXR5IG9mIE1hdGgucmFuZG9tKClcbi8vIGFuZCBpbmNvbnNpc3RlbnQgc3VwcG9ydCBmb3IgdGhlIGBjcnlwdG9gIEFQSS4gIFdlIGRvIHRoZSBiZXN0IHdlIGNhbiB2aWFcbi8vIGZlYXR1cmUtZGV0ZWN0aW9uXG52YXIgcm5nO1xuXG52YXIgY3J5cHRvID0gZ2xvYmFsLmNyeXB0byB8fCBnbG9iYWwubXNDcnlwdG87IC8vIGZvciBJRSAxMVxuaWYgKGNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gIC8vIFdIQVRXRyBjcnlwdG8gUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICB2YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiAgcm5nID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocm5kczgpO1xuICAgIHJldHVybiBybmRzODtcbiAgfTtcbn1cblxuaWYgKCFybmcpIHtcbiAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAvL1xuICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAvLyBxdWFsaXR5LlxuICB2YXIgcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gIHJuZyA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICBybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgIH1cblxuICAgIHJldHVybiBybmRzO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJuZztcbiIsInZhciBybmcgPSByZXF1aXJlKCcuL2xpYi9ybmcnKTtcbnZhciBieXRlc1RvVXVpZCA9IHJlcXVpcmUoJy4vbGliL2J5dGVzVG9VdWlkJyk7XG5cbmZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEFycmF5KDE2KSA6IG51bGw7XG4gICAgb3B0aW9ucyA9IG51bGw7XG4gIH1cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpO1xuXG4gIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gIGlmIChidWYpIHtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7ICsraWkpIHtcbiAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZiB8fCBieXRlc1RvVXVpZChybmRzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2NDtcbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiLyoqXG4gKiBNb3Rpb25MYWIgZGVhbHMgd2l0aCBjb250cm9sbGluZyBlYWNoIHRpY2sgb2YgdGhlIGFuaW1hdGlvbiBmcmFtZSBzZXF1ZW5jZVxuICogSXQncyBhaW0gaXMgdG8gaXNvbGF0ZSBjb2RlIHRoYXQgaGFwcGVucyBvdmVyIGEgbnVtYmVyIG9mIGZyYW1lcyAoaS5lLiBtb3Rpb24pXG4gKi9cbmltcG9ydCB7UHJvcHMsIFRFWFRfR0VPTUVUUll9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNvbnN0IFRSQUNLX0NBTV9UT19PQkogPSAnVFJBQ0tfQ0FNX1RPX09CSic7XG5jb25zdCBERUZBVUxUID0gJ0RFRkFVTFQnO1xuY29uc3QgZGVmYXVsdEpvYiA9IHtcblx0dHlwZTogREVGQVVMVFxufTtcblxuZXhwb3J0IGNsYXNzIE1vdGlvbkxhYiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHRcdHRoaXMuYW5pbWF0ZSgpO1xuXHR9XG5cblx0YW5pbWF0ZSgpIHtcblx0XHRQcm9wcy50MiA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5wcm9jZXNzU2NlbmUoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5yZW5kZXIoUHJvcHMuc2NlbmUsIFByb3BzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRQcm9wcy50MSA9IFByb3BzLnQyO1xuXHRcdFx0dGhpcy5hbmltYXRlLmNhbGwodGhpcyk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm9jZXNzU2NlbmUoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi50eXBlKSB7XG5cdFx0XHRjYXNlIFRSQUNLX0NBTV9UT19PQko6XG5cdFx0XHRcdHRoaXMudHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgREVGQVVMVDpcblx0XHRcdFx0dGhpcy51cGRhdGVSb3RhdGlvbigpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCkge1xuXHRcdGNvbnN0IHNob3VsZEVuZCA9IHBhcnNlSW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKSA9PT0gMTtcblx0XHRpZiAoIXNob3VsZEVuZCkge1xuXHRcdFx0dGhpcy5mb2xsb3dQYXRoKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5lbmRBbmltYXRpb24oKTtcblx0XHR9XG5cdH1cblxuXHRmb2xsb3dQYXRoKCkge1xuXHRcdGNvbnN0IHAgPSB0aGlzLmpvYi5wYXRoLmdldFBvaW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKTtcblx0XHR0aGlzLmpvYi5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHApO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lICs9IDAuMDE7XG5cdH1cblxuXHRlbmRBbmltYXRpb24oKSB7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgJiYgdGhpcy5qb2IuY2FsbGJhY2soKTtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdH1cblxuXHR0cmFja09iamVjdFRvQ2FtZXJhKG9iamVjdDNELCBjYWxsYmFjaykge1xuICAgIFx0dGhpcy5qb2IgPSB7fTtcbiAgICBcdHRoaXMuam9iLnR5cGUgPSBUUkFDS19DQU1fVE9fT0JKO1xuXHRcdHRoaXMuam9iLnQgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLmpvYi5vYmplY3QzRCA9IG9iamVjdDNEO1xuXHRcdHRoaXMuam9iLmVuZGVkID0gZmFsc2U7XG5cdFx0dGhpcy5qb2IucGF0aCA9IG5ldyBUSFJFRS5DYXRtdWxsUm9tQ3VydmUzKFtcblx0XHRcdG9iamVjdDNELnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKVxuXHRcdF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRjb25zdCBjYW1RdWF0ZXJuaW9uVXBkYXRlID0gdGhpcy5nZXROZXdDYW1lcmFEaXJlY3Rpb24oKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS54ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnkgKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIFByb3BzLmNhbWVyYURpc3RhbmNlXG5cdFx0KTtcblx0XHRQcm9wcy5jYW1lcmEubG9va0F0KFByb3BzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmoudHlwZSA9PT0gVEVYVF9HRU9NRVRSWSkge1xuXHRcdFx0XHRsZXQgY2FtZXJhTm9ybSA9IFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmoucG9zaXRpb24uc2V0KFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueCAqIG9iai5wYXJlbnQucmFkaXVzLFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueSAqIG9iai5wYXJlbnQucmFkaXVzLFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueiAqIG9iai5wYXJlbnQucmFkaXVzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdG9iai5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdGdldE5ld0NhbWVyYURpcmVjdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSBQcm9wcy5tb3VzZVBvc0RpZmZZID49IFByb3BzLm1vdXNlUG9zRGlmZlg7XG5cdFx0Y29uc3QgeE1vcmVUaGFuWU1vdXNlID0gIXlNb3JlVGhhblhNb3VzZTtcblx0XHRpZiAoUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCAtPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54ICs9IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSArPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55IC09IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZSA9IFNjZW5lVXRpbHMucmVub3JtYWxpemVRdWF0ZXJuaW9uKFByb3BzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIoUHJvcHMuY2FtZXJhUm90YXRpb24pO1xuXHRcdHJldHVybiBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHR9XG5cblx0cmVkdWNlU3BlZWQoYW1vdW50KSB7XG5cdFx0aWYgKFByb3BzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFggLT0gYW1vdW50O1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5zcGVlZFkgPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmV4cG9ydCBjb25zdCBQcm9wcyA9IHtcblx0cmVuZGVyZXI6IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSksXG5cdHNjZW5lOiBuZXcgVEhSRUUuU2NlbmUoKSxcblx0Y2FtZXJhOiBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCksXG5cdGdyYXBoQ29udGFpbmVyOiBuZXcgVEhSRUUuT2JqZWN0M0QoKSxcblx0Y2FtZXJhUm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigwLCAtMSwgMCksXG5cdGNhbWVyYUxvb2tBdDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXG5cdGNhbWVyYURpc3RhbmNlOiAzNTAwLFxuXHRcblx0dDE6IDAuMCwgLy8gb2xkIHRpbWVcblx0dDI6IDAuMCwgLy8gbm93IHRpbWVcblx0c3BlZWRYOiAwLjAwNSxcblx0c3BlZWRZOiAwLjAwMCxcblx0bW91c2VQb3NEaWZmWDogMC4wLFxuXHRtb3VzZVBvc0RpZmZZOiAwLjAsXG5cdG1vdXNlUG9zWEluY3JlYXNlZDogZmFsc2UsXG5cdG1vdXNlUG9zWUluY3JlYXNlZDogZmFsc2UsXG5cdHJheWNhc3RlcjogbmV3IFRIUkVFLlJheWNhc3RlcigpLFxuXHRtb3VzZVZlY3RvcjogbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XG5cdHJlbGF0ZWRBcnRpc3RTcGhlcmVzOiBbXSxcblx0bWFpbkFydGlzdFNwaGVyZToge30sXG5cdHNlbGVjdGVkQXJ0aXN0U3BoZXJlOiB7aWQ6IDB9XG59O1xuXG5leHBvcnQgY29uc3QgTUFJTl9BUlRJU1RfU1BIRVJFID0gJ01BSU5fQVJUSVNUX1NQSEVSRSc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9BUlRJU1RfU1BIRVJFID0gJ1JFTEFURURfQVJUSVNUX1NQSEVSRSc7XG5leHBvcnQgY29uc3QgVEVYVF9HRU9NRVRSWSA9ICdURVhUX0dFT01FVFJZJztcbmV4cG9ydCBjb25zdCBDT05ORUNUSU5HX0xJTkUgPSAnQ09OTkVDVElOR19MSU5FJzsiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSAnLi4vY29uZmlnL2NvbG91cnMnO1xuaW1wb3J0IHV1aWQgZnJvbSAndXVpZC92NCc7XG5pbXBvcnQge0NPTk5FQ1RJTkdfTElORSwgTUFJTl9BUlRJU1RfU1BIRVJFLCBSRUxBVEVEX0FSVElTVF9TUEhFUkUsIFRFWFRfR0VPTUVUUlksIFByb3BzfSBmcm9tIFwiLi9wcm9wc1wiO1xuaW1wb3J0IHtTdGF0aXN0aWNzfSBmcm9tIFwiLi9zdGF0aXN0aWNzLmNsYXNzXCI7XG5cbmxldCBIRUxWRVRJS0VSO1xuY29uc3QgTUFJTl9BUlRJU1RfRk9OVF9TSVpFID0gMzQ7XG5jb25zdCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUgPSAyMDtcbmNvbnN0IFRPVEFMX1JFTEFURUQgPSA1O1xuXG5jbGFzcyBTY2VuZVV0aWxzIHtcblx0c3RhdGljIGluaXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0XHRsb2FkZXIubG9hZCgnLi9qcy9mb250cy9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbicsIChmb250KSA9PiB7XG5cdFx0XHRcdEhFTFZFVElLRVIgPSBmb250O1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAoKT0+e30sIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhIC0gbWluXG5cdCAqIEBwYXJhbSBiIC0gbWF4XG5cdCAqIEBwYXJhbSBjIC0gdmFsdWUgdG8gY2xhbXBcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBjbGFtcChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KGIsIE1hdGgubWluKGMsIGEpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBwb3NpdGl2ZSB4IHJldHVybiAxLCBuZWdhdGl2ZSB4IHJldHVybiAtMSwgb3IgMCBvdGhlcndpc2Vcblx0ICogQHBhcmFtIG5cblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBzaWduKG4pIHtcblx0XHRyZXR1cm4gbiA+IDAgPyAxIDogbiA8IDAgPyAtMSA6IDA7XG5cdH07XG5cdFxuXHRzdGF0aWMgcmVub3JtYWxpemVRdWF0ZXJuaW9uKG9iamVjdCkge1xuXHRcdGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpIHtcblx0XHRQcm9wcy5yYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShQcm9wcy5tb3VzZVZlY3RvciwgUHJvcHMuY2FtZXJhKTtcblx0XHRyZXR1cm4gUHJvcHMucmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoUHJvcHMuZ3JhcGhDb250YWluZXIuY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGdldE1vdXNlVmVjdG9yKGV2ZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKChldmVudC5jbGllbnRYIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCkge1xuXHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IGFydGlzdDtcblx0XHRzcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdHNwaGVyZS50eXBlID0gTUFJTl9BUlRJU1RfU1BIRVJFO1xuXHRcdFNjZW5lVXRpbHMuYWRkVGV4dChhcnRpc3QubmFtZSwgTUFJTl9BUlRJU1RfRk9OVF9TSVpFLCBzcGhlcmUpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBtYWluQXJ0aXN0U3BoZXJlKSB7XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkgPSBbXTtcblx0XHRsZXQgcmVsYXRlZEFydGlzdDtcblx0XHRsZXQgc3BoZXJlRmFjZUluZGV4ID0gMDtcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIFRPVEFMX1JFTEFURUQgLSAxKTtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbihUT1RBTF9SRUxBVEVELCBhcnRpc3QucmVsYXRlZC5sZW5ndGgpOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHJlbGF0ZWRBcnRpc3QgPSBhcnRpc3QucmVsYXRlZFtpXTtcblx0XHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRsZXQgZ2VucmVNZXRyaWNzID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmogPSByZWxhdGVkQXJ0aXN0O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmouZ2VucmVTaW1pbGFyaXR5ID0gZ2VucmVNZXRyaWNzLmdlbnJlU2ltaWxhcml0eTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuZGlzdGFuY2UgPSBnZW5yZU1ldHJpY3MubGluZUxlbmd0aDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS50eXBlID0gUkVMQVRFRF9BUlRJU1RfU1BIRVJFO1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0Lm5hbWUsIFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5LnB1c2gocmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5O1xuXHR9XG5cblx0c3RhdGljIGFwcGVuZE9iamVjdHNUb1NjZW5lKGdyYXBoQ29udGFpbmVyLCBzcGhlcmUsIHNwaGVyZUFycmF5KSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cdFx0cGFyZW50Lm5hbWUgPSAncGFyZW50Jztcblx0XHRwYXJlbnQuYWRkKHNwaGVyZSk7XG5cdFx0aWYgKHNwaGVyZUFycmF5KSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwaGVyZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHBhcmVudC5hZGQoc3BoZXJlQXJyYXlbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRncmFwaENvbnRhaW5lci5hZGQocGFyZW50KTtcblx0fVxuXG5cdHN0YXRpYyBqb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkTGluZUpvaW59KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRsZXQgbGluZTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHJlbGF0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0bGluZSA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdFx0bGluZS50eXBlID0gQ09OTkVDVElOR19MSU5FO1xuXHRcdG1haW5BcnRpc3RTcGhlcmUuYWRkKGxpbmUpO1xuXHR9XG5cblx0c3RhdGljIHBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpIHtcblx0XHRsZXQgbWFpbkFydGlzdFNwaGVyZUZhY2UgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzW01hdGguZmxvb3Ioc3BoZXJlRmFjZUluZGV4KV0ubm9ybWFsLmNsb25lKCk7XG5cdFx0cmVsYXRlZFNwaGVyZS5wb3NpdGlvblxuXHRcdFx0LmNvcHkobWFpbkFydGlzdFNwaGVyZUZhY2UubXVsdGlwbHkobmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2Vcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgYWRkVGV4dChsYWJlbCwgc2l6ZSwgc3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsRnJvbnQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRPdXRlcn0pO1xuXHRcdGxldCBtYXRlcmlhbFNpZGUgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRJbm5lcn0pO1xuXHRcdGxldCBtYXRlcmlhbEFycmF5ID0gW21hdGVyaWFsRnJvbnQsIG1hdGVyaWFsU2lkZV07XG5cdFx0bGV0IHRleHRHZW9tID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeShsYWJlbCwge1xuXHRcdFx0Zm9udDogSEVMVkVUSUtFUixcblx0XHRcdHNpemU6IHNpemUsXG5cdFx0XHRjdXJ2ZVNlZ21lbnRzOiA0LFxuXHRcdFx0YmV2ZWxFbmFibGVkOiB0cnVlLFxuXHRcdFx0YmV2ZWxUaGlja25lc3M6IDIsXG5cdFx0XHRiZXZlbFNpemU6IDEsXG5cdFx0XHRiZXZlbFNlZ21lbnRzOiAzXG5cdFx0fSk7XG5cdFx0bGV0IHRleHRNZXNoID0gbmV3IFRIUkVFLk1lc2godGV4dEdlb20sIG1hdGVyaWFsQXJyYXkpO1xuXHRcdGxldCBjYW1lcmFOb3JtID0gUHJvcHMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCkubm9ybWFsaXplKCk7XG5cdFx0dGV4dE1lc2gudHlwZSA9IFRFWFRfR0VPTUVUUlk7XG5cdFx0c3BoZXJlLmFkZCh0ZXh0TWVzaCk7XG5cdFx0dGV4dE1lc2gucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtZXJhTm9ybS54ICogc3BoZXJlLnJhZGl1cyxcblx0XHRcdGNhbWVyYU5vcm0ueSAqIHNwaGVyZS5yYWRpdXMsXG5cdFx0XHRjYW1lcmFOb3JtLnogKiBzcGhlcmUucmFkaXVzXG5cdFx0KTtcblx0XHR0ZXh0TWVzaC5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHR9XG5cblx0c3RhdGljIGxpZ2h0aW5nKCkge1xuXHRcdGxldCBsaWdodEEgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGNjY2NjYywgMS43MjUpO1xuXHRcdGxldCBsaWdodEIgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGFhYWFhYSwgMS41KTtcblx0XHRsaWdodEEucG9zaXRpb24uc2V0WCg1MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRZKC04MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRYKC01MDApO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEEpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEIpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiLyoqXG4gKiBTcGhlcmVzU2NlbmUgaXMgZGVzaWduZWQgdG8gaGFuZGxlIGFkZGluZyBhbmQgcmVtb3ZpbmcgZW50aXRpZXMgZnJvbSB0aGUgc2NlbmUsXG4gKiBhbmQgaGFuZGxpbmcgZXZlbnRzLlxuICpcbiAqIEl0IGFpbXMgdG8gZGVhbCBub3Qgd2l0aCBjaGFuZ2VzIG92ZXIgdGltZSwgb25seSBpbW1lZGlhdGUgY2hhbmdlcyBpbiBvbmUgZnJhbWUuXG4gKi9cbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSBcIi4uL2NvbmZpZy9jb2xvdXJzXCI7XG5pbXBvcnQge01vdGlvbkxhYn0gZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5pbXBvcnQge01BSU5fQVJUSVNUX1NQSEVSRSwgUHJvcHMsIFJFTEFURURfQVJUSVNUX1NQSEVSRSwgVEVYVF9HRU9NRVRSWX0gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2hpZGVSZWxhdGVkLCByZWxhdGVkQ2xpY2ssIHNob3dSZWxhdGVkfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0bGV0IGFydGlzdElkO1xuXHRcdHRoaXMubW90aW9uTGFiID0gbmV3IE1vdGlvbkxhYigpO1xuXHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IG51bGw7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMSwgNSwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IFByb3BzLm1haW5BcnRpc3RTcGhlcmU7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMubWFpbkFydGlzdFNwaGVyZSwgUHJvcHMucmVsYXRlZEFydGlzdFNwaGVyZXMpO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpIHtcblx0XHRsZXQgc2VsZWN0ZWQ7XG5cdFx0bGV0IGludGVyc2VjdHM7XG5cdFx0bGV0IGlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoKTtcblx0XHR0aGlzLnVuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZSgpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdHN3aXRjaCAoc2VsZWN0ZWQudHlwZSkge1xuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLmhpZ2hsaWdodFJlbGF0ZWRTcGhlcmUoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0SG92ZXIpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRFWFRfR0VPTUVUUlk6XG5cdFx0XHRcdFx0aWYgKHNlbGVjdGVkLnBhcmVudC50eXBlICE9PSBNQUlOX0FSVElTVF9TUEhFUkUpIHtcblx0XHRcdFx0XHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IHNlbGVjdGVkLnBhcmVudDtcblx0XHRcdFx0XHRcdHRoaXMuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZShDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHRcdHJldHVybiBpc092ZXJSZWxhdGVkO1xuXHR9XG5cblx0dW5oaWdobGlnaHRSZWxhdGVkU3BoZXJlKCkge1xuXHRcdGlmICh0aGlzLmhvdmVyZWRTcGhlcmUgJiYgdGhpcy5ob3ZlcmVkU3BoZXJlLmlkICE9PSBQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5pZCkge1xuXHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gbnVsbDtcblx0XHRcdHN0b3JlLmRpc3BhdGNoKGhpZGVSZWxhdGVkKCkpO1xuXHRcdH1cblx0fVxuXG5cdGhpZ2hsaWdodFJlbGF0ZWRTcGhlcmUoY29sb3VyKSB7XG5cdFx0dGhpcy5ob3ZlcmVkU3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvdXIpO1xuXHRcdHN0b3JlLmRpc3BhdGNoKHNob3dSZWxhdGVkKHRoaXMuaG92ZXJlZFNwaGVyZS5hcnRpc3RPYmopKTtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSAmJiBzZWxlY3RlZC5pZCA9PT0gUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUuaWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZXNldENsaWNrZWRTcGhlcmUoKTtcblx0XHRcdHN3aXRjaCAoc2VsZWN0ZWQudHlwZSkge1xuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdENsaWNrZWQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRFWFRfR0VPTUVUUlk6XG5cdFx0XHRcdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUgPSBzZWxlY3RlZC5wYXJlbnQ7XG5cdFx0XHRcdFx0dGhpcy5zZXR1cENsaWNrZWRTcGhlcmUoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0Q2xpY2tlZCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgTUFJTl9BUlRJU1RfU1BIRVJFOlxuXHRcdFx0XHRcdFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlID0gc2VsZWN0ZWQ7XG5cdFx0XHRcdFx0dGhpcy5zZXR1cENsaWNrZWRTcGhlcmUoQ29sb3Vycy5tYWluQXJ0aXN0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZXR1cENsaWNrZWRTcGhlcmUoY29sb3VyKSB7XG5cdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KGNvbG91cik7XG5cdFx0TXVzaWNEYXRhU2VydmljZS5mZXRjaERpc3BsYXlBbGJ1bXMoUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqKTtcblx0fVxuXG5cdHJlc2V0Q2xpY2tlZFNwaGVyZSgpIHtcblx0XHRpZiAoIVByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlLnR5cGUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c3dpdGNoIChQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS50eXBlKSB7XG5cdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBNQUlOX0FSVElTVF9TUEhFUkU6XG5cdFx0XHRcdFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLm1haW5BcnRpc3QpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUgPSB7aWQ6IDB9O1xuXHR9XG5cblx0b25TY2VuZU1vdXNlRHJhZyhldmVudCkge1xuXHRcdGNvbnN0IGR0ID0gUHJvcHMudDIgLSBQcm9wcy50MTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci54ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueCk7XG5cdFx0UHJvcHMubW91c2VQb3NZSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnkgPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci55KTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZYID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueCkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci54KSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWSA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLnkpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueSkpO1xuXHRcdFByb3BzLnNwZWVkWCA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlgpIC8gZHQpO1xuXHRcdFByb3BzLnNwZWVkWSA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlkpIC8gZHQpO1xuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdH1cblxuXHRnZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgc2VsZWN0ZWRTcGhlcmUpO1xuXHRcdHRoaXMubW90aW9uTGFiLnRyYWNrT2JqZWN0VG9DYW1lcmEoc2VsZWN0ZWRTcGhlcmUsICgpID0+IHtcblx0XHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqLmlkKTtcblx0XHR9KTtcblx0fVxuXG5cdGNsZWFyR3JhcGgoKSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gUHJvcHMuZ3JhcGhDb250YWluZXIuZ2V0T2JqZWN0QnlOYW1lKCdwYXJlbnQnKTtcblx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5yZW1vdmUocGFyZW50KTtcblx0XHR9XG5cdH1cblxuXHRjbGVhckFkZHJlc3MoKSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcblx0fVxuXG5cdHpvb20oZGlyZWN0aW9uKSB7XG5cdFx0c3dpdGNoIChkaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgJ2luJzpcblx0XHRcdFx0UHJvcHMuY2FtZXJhRGlzdGFuY2UgLT0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb3V0Jzpcblx0XHRcdFx0UHJvcHMuY2FtZXJhRGlzdGFuY2UgKz0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZUNhbWVyYUFzcGVjdCgpIHtcblx0XHRQcm9wcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0UHJvcHMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHR9XG59XG4iLCJjb25zdCBNQVhfRElTVEFOQ0UgPSA4MDA7XG5jb25zdCBTSVpFX1NDQUxBUl9TTUFMTCA9IDEuMjU7XG5jb25zdCBTSVpFX1NDQUxBUl9CSUcgPSAxLjc1O1xuXG5leHBvcnQgY2xhc3MgU3RhdGlzdGljcyB7XG4gICAgc3RhdGljIGdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KSB7XG4gICAgXHRpZiAoYXJ0aXN0LnBvcHVsYXJpdHkgPj0gNTApIHtcblx0XHRcdHJldHVybiBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSX0JJRztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGFydGlzdC5wb3B1bGFyaXR5ICogU0laRV9TQ0FMQVJfU01BTEw7XG5cdFx0fVxuXG4gICAgfVxuXG5cdC8qKlxuICAgICAqIE1hcC1yZWR1Y2Ugb2YgdHdvIHN0cmluZyBhcnJheXNcblx0ICogQHBhcmFtIGFydGlzdFxuXHQgKiBAcGFyYW0gcmVsYXRlZEFydGlzdFxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fVxuXHQgKi9cblx0c3RhdGljIGdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCkge1xuXHRcdGxldCB1bml0LCBnZW5yZVNpbWlsYXJpdHksIHJlbGF0aXZlTWluRGlzdGFuY2UsIGFydGlzdEdlbnJlQ291bnQ7XG5cdFx0bGV0IG1hdGNoZXMgPSBhcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAubWFwKChtYWluQXJ0aXN0R2VucmUpID0+IFN0YXRpc3RpY3MubWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBtYXRjaCkgPT4ge1xuXHRcdCAgICAgICAgaWYgKG1hdGNoKSB7XG5cdFx0ICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChtYXRjaCk7XG5cdFx0XHRcdH1cblx0XHQgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgICAgICAgIH0sIFtdKTtcblx0XHRhcnRpc3RHZW5yZUNvdW50ID0gYXJ0aXN0LmdlbnJlcy5sZW5ndGggPyBhcnRpc3QuZ2VucmVzLmxlbmd0aCA6IDE7XG5cdFx0dW5pdCA9IDEgLyBhcnRpc3RHZW5yZUNvdW50O1xuXHRcdHVuaXQgPSB1bml0ID09PSAxID8gMCA6IHVuaXQ7XG5cdFx0Z2VucmVTaW1pbGFyaXR5ID0gbWF0Y2hlcy5sZW5ndGggKiB1bml0O1xuXHRcdHJlbGF0aXZlTWluRGlzdGFuY2UgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KSArIFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShyZWxhdGVkQXJ0aXN0KTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGluZUxlbmd0aDogKE1BWF9ESVNUQU5DRSAtIChNQVhfRElTVEFOQ0UgKiBnZW5yZVNpbWlsYXJpdHkpKSArIHJlbGF0aXZlTWluRGlzdGFuY2UsXG5cdFx0XHRnZW5yZVNpbWlsYXJpdHk6IE1hdGgucm91bmQoZ2VucmVTaW1pbGFyaXR5ICogMTAwKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgbWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiByZWxhdGVkQXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLmZpbmQoKGdlbnJlKSA9PiBnZW5yZSA9PT0gbWFpbkFydGlzdEdlbnJlKTtcbiAgICB9XG4gfSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5pbXBvcnQgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb250YWluZXJcIjtcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250YWluZXJcIj5cblx0XHRcdFx0PFNlYXJjaENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTY2VuZUNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTcG90aWZ5UGxheWVyQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RJbmZvQ29tcG9uZW50KHthcnRpc3QsIGlzSGlkZGVufSkge1xuXHRjb25zdCBnZW5yZXMgPSBhcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIG1haW4nIDogJ2luZm8tY29udGFpbmVyIG1haW4nO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hbWUtdGFnIG1haW5cIj57YXJ0aXN0Lm5hbWV9PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBvcHVsYXJpdHlcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPlBvcHVsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e2FydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+e2dlbnJlc308L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmV4cG9ydCBjbGFzcyBBcnRpc3RMaXN0Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdGhhbmRsZUdldEFydGlzdChldnQsIGFydGlzdElkKSB7XG5cdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBhcnRpc3RzID0gdGhpcy5wcm9wcy52aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdFx0bGV0IGhyZWYgPSAnL2FwcC8jJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFx0bGV0IGltZ1VybCA9IGFydGlzdC5pbWFnZXMgJiYgYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0XHRsZXQgaW1nU3R5bGUgPSB7IGJhY2tncm91bmRJbWFnZTogYHVybCgke2ltZ1VybH0pYCB9O1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdFx0PGEgaHJlZj17aHJlZn0gaWQ9e2FydGlzdC5pZH0gY2xhc3NOYW1lPVwibmF2LWFydGlzdC1saW5rXCJcblx0XHRcdFx0XHQgICBvbkNsaWNrPXsoZXZlbnQpID0+IHsgdGhpcy5oYW5kbGVHZXRBcnRpc3QoZXZlbnQsIGFydGlzdC5pZCkgfX0+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmUtaG9sZGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGljdHVyZVwiIHN0eWxlPXtpbWdTdHlsZX0gLz5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibmFtZVwiPnthcnRpc3QubmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdClcblx0XHR9KTtcblx0XHRjb25zdCBjbGFzc2VzID0gdGhpcy5wcm9wcy5pc0hpZGRlbiA/ICdoaWRkZW4gYXJ0aXN0LW5hdmlnYXRpb24nIDogJ2FydGlzdC1uYXZpZ2F0aW9uJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9IHJlZj17ZWxlbSA9PiB0aGlzLmFydGlzdExpc3REb20gPSBlbGVtfT5cblx0XHRcdFx0e2FydGlzdHN9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmFydGlzdExpc3REb20uc2Nyb2xsVG9wID0gdGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbEhlaWdodDtcblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcblx0XHR0aGlzLmFydGlzdExpc3REb20uc2Nyb2xsVG9wID0gdGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbEhlaWdodDtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVsYXRlZEFydGlzdEluZm9Db21wb25lbnQoe3JlbGF0ZWRBcnRpc3QsIGhpZGVSZWxhdGVkLCBoaWRlSW5mb30pIHtcblx0Y29uc3QgaGlkZGVuQ2xhc3MgPSBoaWRlUmVsYXRlZCB8fCBoaWRlSW5mbyA/ICdoaWRkZW4gaW5mby1jb250YWluZXIgcmVsYXRlZCcgOiAnaW5mby1jb250YWluZXIgcmVsYXRlZCc7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2hpZGRlbkNsYXNzfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hbWUtdGFnIHJlbGF0ZWRcIj57cmVsYXRlZEFydGlzdC5uYW1lfTwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwb3B1bGFyaXR5XCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5Qb3B1bGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJnZW5yZXNcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPkdlbnJlIHNpbWlsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e3JlbGF0ZWRBcnRpc3QuZ2VucmVTaW1pbGFyaXR5fSU8L3NwYW4+PC9kaXY+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4uL2NsYXNzZXMvc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7U3BoZXJlc1NjZW5lfSBmcm9tIFwiLi4vY2xhc3Nlcy9zcGhlcmVzLXNjZW5lLmNsYXNzXCI7XG5pbXBvcnQge3JlbGF0ZWRDbGlja30gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFydGlzdCA9IHN0b3JlLmdldFN0YXRlKCkuYXJ0aXN0O1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSBmYWxzZTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJzcGhlcmVzLXNjZW5lXCIgcmVmPXtlbGVtID0+IHRoaXMuc2NlbmVEb20gPSBlbGVtfSAvPlxuXHRcdClcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdFNjZW5lVXRpbHMuaW5pdCgpLnRoZW4oKCkgPT4geyAvLyBsb2FkIHRoZSBmb250IGZpcnN0IChhc3luYylcblx0XHRcdHRoaXMuc2NlbmUgPSBuZXcgU3BoZXJlc1NjZW5lKHRoaXMuc2NlbmVEb20pO1xuXHRcdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0XHR9KTtcblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcblx0XHR0aGlzLmluaXRTY2VuZSgpO1xuXHR9XG5cblx0aW5pdFNjZW5lKCkge1xuXHRcdGNvbnN0IHsgYXJ0aXN0IH0gPSB0aGlzLnByb3BzO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBldmVudCA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKTsgLy8gcmVtb3ZlIHJpZ2h0IGNsaWNrXG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLCB0cnVlKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcywgZmFsc2UpO1xuXHRcdGlmIChhcnRpc3QuaWQpIHtcblx0XHRcdHRoaXMuc2NlbmUuY29tcG9zZVNjZW5lKGFydGlzdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2NlbmUuY2xlYXJHcmFwaCgpO1xuXHRcdFx0dGhpcy5zY2VuZS5jbGVhckFkZHJlc3MoKTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVFdmVudChldmVudCkge1xuXHRcdHRoaXNbZXZlbnQudHlwZV0oZXZlbnQpO1xuXHR9XG5cblx0Y2xpY2soZXZlbnQpIHtcblx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWInO1xuXHRcdGlmICghdGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vtb3ZlKGV2ZW50KSB7XG5cdFx0bGV0IGlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWInO1xuXHRcdGlmICh0aGlzLm1vdXNlSXNEb3duKSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VEcmFnKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRoaXMuc2NlbmUub25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpO1xuXHRcdH1cblx0XHRpZiAoaXNPdmVyUmVsYXRlZCAmJiAhdGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIHBvaW50ZXInO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWJiZWQnO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlZG93bigpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gdHJ1ZTtcblx0fVxuXG5cdG1vdXNldXAoKSB7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0bW91c2V3aGVlbChldmVudCkge1xuXHRcdHN3aXRjaCAoU2NlbmVVdGlscy5zaWduKGV2ZW50LndoZWVsRGVsdGFZKSkge1xuXHRcdFx0Y2FzZSAtMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdvdXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnaW4nKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmVzaXplKCkge1xuXHRcdHRoaXMuc2NlbmUudXBkYXRlQ2FtZXJhQXNwZWN0KCk7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFNlYXJjaElucHV0Q29tcG9uZW50KHtzZWFyY2hUZXJtLCBhcnRpc3QsIGhhbmRsZVNlYXJjaCwgaGFuZGxlU2VhcmNoVGVybVVwZGF0ZSwgY2xlYXJTZXNzaW9ufSkge1xuICAgIGNvbnN0IGNsZWFyQnRuQ2xhc3MgPSBhcnRpc3QuaWQgPyAnY2xlYXItc2Vzc2lvbicgOiAnaGlkZGVuIGNsZWFyLXNlc3Npb24nO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VhcmNoLWZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJhcnRpc3Qtc2VhcmNoXCIgb25TdWJtaXQ9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17c2VhcmNoVGVybX0gb25DaGFuZ2U9e2hhbmRsZVNlYXJjaFRlcm1VcGRhdGV9IC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgb25DbGljaz17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PkdvPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9e2NsZWFyQnRuQ2xhc3N9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoZXZ0KSA9PiBjbGVhclNlc3Npb24oZXZ0KX0+Q2xlYXIgU2Vzc2lvbjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgY2xhc3MgU3BvdGlmeVBsYXllckNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHthbGJ1bUNsaWNrSGFuZGxlcn0pIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYWxidW1DbGlja0hhbmRsZXIgPSBhbGJ1bUNsaWNrSGFuZGxlcjtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRjb25zdCB7IGRpc3BsYXlBbGJ1bUluZGV4LCBkaXNwbGF5QXJ0aXN0LCBpc0hpZGRlbiB9ID0gdGhpcy5wcm9wcztcblx0XHRjb25zdCBlbWJlZFVybCA9ICdodHRwczovL29wZW4uc3BvdGlmeS5jb20vZW1iZWQ/dXJpPXNwb3RpZnk6YWxidW06Jztcblx0XHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIHNwb3RpZnktcGxheWVyLWNvbnRhaW5lcicgOiAnc3BvdGlmeS1wbGF5ZXItY29udGFpbmVyJztcblx0XHRjb25zdCBhbGJ1bXMgPSBkaXNwbGF5QXJ0aXN0LmFsYnVtcztcblx0XHRsZXQgYXJ0aXN0RW1iZWRVcmwsXG5cdFx0XHRpRnJhbWVNYXJrdXAgPSAnJyxcblx0XHRcdGFsYnVtc0xpc3RNYXJrdXAgPSAnJyxcblx0XHRcdGFsYnVtSWQ7XG5cdFx0XG5cdFx0aWYgKGFsYnVtcyAmJiBhbGJ1bXMubGVuZ3RoKSB7XG5cdFx0XHRhbGJ1bUlkID0gYWxidW1zW2Rpc3BsYXlBbGJ1bUluZGV4XS5pZDtcblx0XHRcdGFydGlzdEVtYmVkVXJsID0gYCR7ZW1iZWRVcmx9JHthbGJ1bUlkfWA7XG5cdFx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BvdGlmeS1wbGF5ZXJcIj5cblx0XHRcdFx0XHQ8aWZyYW1lIHNyYz17YXJ0aXN0RW1iZWRVcmx9IHdpZHRoPVwiMzAwXCIgaGVpZ2h0PVwiMzgwXCIgZnJhbWVCb3JkZXI9XCIwXCIgYWxsb3dUcmFuc3BhcmVuY3k9XCJ0cnVlXCIvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0XHRhbGJ1bXNMaXN0TWFya3VwID0gYWxidW1zLm1hcCgoYWxidW0sIGluZGV4KSA9PiB7XG5cdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhbGJ1bVwiIGtleT17YWxidW0uaWR9PlxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIiBvbkNsaWNrPXsoZXZ0KSA9PiB0aGlzLmFsYnVtQ2xpY2tIYW5kbGVyKGV2dCwgaW5kZXgpfT57YWxidW0ubmFtZX08L2E+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0XHR7aUZyYW1lTWFya3VwfVxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFsYnVtcy1saXN0XCI+XG5cdFx0XHRcdFx0e2FsYnVtc0xpc3RNYXJrdXB9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG59XG4iLCJleHBvcnQgY29uc3QgQ29sb3VycyA9IHtcblx0YmFja2dyb3VuZDogMHgwMDMzNjYsXG5cdHJlbGF0ZWRBcnRpc3Q6IDB4Y2MzMzAwLFxuXHRyZWxhdGVkQXJ0aXN0SG92ZXI6IDB4OTljYzk5LFxuXHRyZWxhdGVkQXJ0aXN0Q2xpY2tlZDogMHhlYzkyNTMsXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3QsXG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cbmNvbnN0IEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdEluZm9Db250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RMaXN0Q29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnRcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHR2aXNpdGVkQXJ0aXN0czogc3RhdGUudmlzaXRlZEFydGlzdHMsXG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RMaXN0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0TGlzdENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1JlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0cmVsYXRlZEFydGlzdDogc3RhdGUucmVsYXRlZEFydGlzdCxcblx0XHRoaWRlUmVsYXRlZDogc3RhdGUuaGlkZVJlbGF0ZWQsXG5cdFx0aGlkZUluZm86IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cbmNvbnN0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFJlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTY2VuZUNvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTY2VuZUNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShTY2VuZUNvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7IFNlYXJjaElucHV0Q29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy9zZWFyY2gtaW5wdXQuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQgeyBNdXNpY0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7Y2xlYXJTZXNzaW9uLCB1cGRhdGVTZWFyY2hUZXJtfSBmcm9tICcuLi9zdGF0ZS9hY3Rpb25zJztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0c2VhcmNoVGVybTogc3RhdGUuc2VhcmNoVGVybSxcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYW5kbGVTZWFyY2g6IChldnQsIGFydGlzdE5hbWUpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5zZWFyY2goYXJ0aXN0TmFtZSk7XG5cdFx0fSxcblx0XHRoYW5kbGVTZWFyY2hUZXJtVXBkYXRlOiAoZXZ0KSA9PiB7XG5cdFx0XHRkaXNwYXRjaCh1cGRhdGVTZWFyY2hUZXJtKGV2dC50YXJnZXQudmFsdWUpKTtcblx0XHR9LFxuXHRcdGNsZWFyU2Vzc2lvbjogKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRkaXNwYXRjaChjbGVhclNlc3Npb24oKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuaW1wb3J0IHtsb2FkQWxidW19IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mbyxcblx0XHRkaXNwbGF5QXJ0aXN0OiBzdGF0ZS5kaXNwbGF5QXJ0aXN0LFxuXHRcdGRpc3BsYXlBbGJ1bUluZGV4OiBzdGF0ZS5kaXNwbGF5QWxidW1JbmRleFxuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhbGJ1bUNsaWNrSGFuZGxlcjogKGV2dCwgYWxidW1JbmRleCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRkaXNwYXRjaChsb2FkQWxidW0oYWxidW1JbmRleCkpO1xuXHRcdH1cblx0fVxufTtcblxuY29uc3QgU3BvdGlmeVBsYXllckNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHthcnRpc3REYXRhQXZhaWxhYmxlLCBkaXNwbGF5QWxidW1zLCBkaXNwbGF5QXJ0aXN0fSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBzZWFyY2goYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGdldEFydGlzdChhcnRpc3RJZCkge1xuXHRcdGxldCBhcnRpc3RVUkwgPSAnL2FwaS9hcnRpc3QvJyArIGFydGlzdElkO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goYXJ0aXN0VVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZmV0Y2hEaXNwbGF5QWxidW1zKGFydGlzdCkge1xuXHRcdGxldCBhcnRpc3RVUkwgPSAnL2FwaS9hbGJ1bXMvJyArIGFydGlzdC5pZDtcblx0XHRpZiAoYXJ0aXN0LmFsYnVtcyAmJiBhcnRpc3QuYWxidW1zLmxlbmd0aCkgeyAvLyB3ZSd2ZSBhbHJlYWR5IGRvd25sb2FkZWQgdGhlIGFsYnVtIGxpc3Qgc28ganVzdCB0cmlnZ2VyIFVJIHVwZGF0ZVxuXHRcdFx0IHJldHVybiBzdG9yZS5kaXNwYXRjaChkaXNwbGF5QXJ0aXN0KGFydGlzdCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goYXJ0aXN0VVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiB7XG5cdFx0XHRhcnRpc3QuYWxidW1zID0ganNvbjtcblx0XHRcdHN0b3JlLmRpc3BhdGNoKGRpc3BsYXlBcnRpc3QoYXJ0aXN0KSlcblx0XHR9KTtcblx0fVxufSIsImV4cG9ydCBjb25zdCBBUlRJU1RfREFUQV9BVkFJTEFCTEUgPSAnQVJUSVNUX0RBVEFfQVZBSUxBQkxFJztcbmV4cG9ydCBjb25zdCBVUERBVEVfRElTUExBWV9BUlRJU1QgPSAnVVBEQVRFX0RJU1BMQVlfQVJUSVNUJztcbmV4cG9ydCBjb25zdCBTRUFSQ0hfVEVSTV9VUERBVEUgPSAnU0VBUkNIX1RFUk1fVVBEQVRFJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0NMSUNLID0gJ1JFTEFURURfQ0xJQ0snO1xuZXhwb3J0IGNvbnN0IFNIT1dfUkVMQVRFRF9JTkZPID0gJ1NIT1dfUkVMQVRFRF9JTkZPJztcbmV4cG9ydCBjb25zdCBISURFX1JFTEFURURfSU5GTyA9ICdISURFX1JFTEFURURfSU5GTyc7XG5leHBvcnQgY29uc3QgQ0xFQVJfU0VTU0lPTiA9ICdDTEVBUl9TRVNTSU9OJztcbmV4cG9ydCBjb25zdCBMT0FEX0FMQlVNID0gJ0xPQURfQUxCVU0nO1xuXG5leHBvcnQgZnVuY3Rpb24gYXJ0aXN0RGF0YUF2YWlsYWJsZShkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQVJUSVNUX0RBVEFfQVZBSUxBQkxFLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheUFydGlzdChkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogVVBEQVRFX0RJU1BMQVlfQVJUSVNULFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRlZENsaWNrKHJlbGF0ZWRBcnRpc3QpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBSRUxBVEVEX0NMSUNLLFxuXHRcdGRhdGE6IHJlbGF0ZWRBcnRpc3Rcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JlbGF0ZWQocmVsYXRlZEFydGlzdCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNIT1dfUkVMQVRFRF9JTkZPLFxuXHRcdGRhdGE6IHJlbGF0ZWRBcnRpc3Rcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZVJlbGF0ZWQoKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogSElERV9SRUxBVEVEX0lORk8sXG5cdFx0ZGF0YTogbnVsbFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclNlc3Npb24oKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQ0xFQVJfU0VTU0lPTlxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQWxidW0oYWxidW1JZCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IExPQURfQUxCVU0sXG5cdFx0ZGF0YTogYWxidW1JZFxuXHR9XG59XG4iLCJpbXBvcnQge1xuXHRTRUFSQ0hfVEVSTV9VUERBVEUsIEFSVElTVF9EQVRBX0FWQUlMQUJMRSwgUkVMQVRFRF9DTElDSyxcblx0Q0xFQVJfU0VTU0lPTiwgVVBEQVRFX0RJU1BMQVlfQVJUSVNULCBTSE9XX1JFTEFURURfSU5GTywgSElERV9SRUxBVEVEX0lORk8sIExPQURfQUxCVU1cbn0gZnJvbSAnLi4vYWN0aW9ucydcbmxldCBpbml0aWFsU3RhdGUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdzdGF0ZScpO1xuY29uc3QgZW1wdHlBcnRpc3QgPSB7XG5cdGlkOiAnJyxcblx0bmFtZTogJycsXG5cdGltZ1VybDogJycsXG5cdGdlbnJlczogW10sXG5cdHBvcHVsYXJpdHk6IDAsXG5cdGltYWdlczogW10sXG5cdGFsYnVtczogW11cbn07XG5jb25zdCBlbXB0eVN0YXRlID0ge1xuXHRhcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRyZWxhdGVkQXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0c2VhcmNoVGVybTogJycsXG5cdHZpc2l0ZWRBcnRpc3RzOiBbXSxcblx0aGlkZUluZm86IHRydWUsXG5cdHNob3dSZWxhdGVkOiBmYWxzZSxcblx0ZGlzcGxheUFydGlzdDogZW1wdHlBcnRpc3QsXG5cdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG59O1xuXG5pZiAoIWluaXRpYWxTdGF0ZSkge1xuXHRpbml0aWFsU3RhdGUgPSB7XG5cdFx0Li4uZW1wdHlTdGF0ZVxuXHR9O1xufSBlbHNlIHtcblx0aW5pdGlhbFN0YXRlID0gSlNPTi5wYXJzZShpbml0aWFsU3RhdGUpO1xufVxuXG5jb25zdCBhcHBTdGF0ZSA9IChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSA9PiB7XG5cdGxldCBuZXdTdGF0ZTtcblx0c3dpdGNoIChhY3Rpb24udHlwZSkge1xuXHRcdGNhc2UgU0VBUkNIX1RFUk1fVVBEQVRFOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uc2VhcmNoVGVybSxcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFSVElTVF9EQVRBX0FWQUlMQUJMRTpcblx0XHRcdGlmIChhY3Rpb24uZGF0YS5pZCkge1xuXHRcdFx0XHRsZXQgYWxyZWFkeVZpc2l0ZWQgPSAhIXN0YXRlLnZpc2l0ZWRBcnRpc3RzLmxlbmd0aFxuXHRcdFx0XHRcdCYmIHN0YXRlLnZpc2l0ZWRBcnRpc3RzLnNvbWUoKGFydGlzdCkgPT4gYXJ0aXN0LmlkID09PSBhY3Rpb24uZGF0YS5pZCk7XG5cdFx0XHRcdGxldCB2aXNpdGVkQXJ0aXN0cyA9IGFscmVhZHlWaXNpdGVkID8gc3RhdGUudmlzaXRlZEFydGlzdHMgOiBbLi4uc3RhdGUudmlzaXRlZEFydGlzdHMsIGFjdGlvbi5kYXRhXTtcblx0XHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0XHRkaXNwbGF5QXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0XHR2aXNpdGVkQXJ0aXN0czogW1xuXHRcdFx0XHRcdFx0Li4udmlzaXRlZEFydGlzdHMsXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uZGF0YS5uYW1lLFxuXHRcdFx0XHRcdGhpZGVJbmZvOiBmYWxzZSxcblx0XHRcdFx0XHRoaWRlUmVsYXRlZDogdHJ1ZSxcblx0XHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiB7XG5cdFx0XHRcdFx0XHQuLi5lbXB0eUFydGlzdFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZGlzcGxheUFsYnVtSW5kZXg6IDBcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybignTm8gQVBJIGRhdGEgYXZhaWxhYmxlIGZvciBnaXZlbiBhcnRpc3QuIE5lZWQgdG8gcmVmcmVzaCBBUEkgc2Vzc2lvbj8nKTtcblx0XHRcdFx0bmV3U3RhdGUgPSBzdGF0ZTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVVBEQVRFX0RJU1BMQVlfQVJUSVNUOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRkaXNwbGF5QXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0ZGlzcGxheUFsYnVtSW5kZXg6IDBcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIExPQURfQUxCVU06XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiBhY3Rpb24uZGF0YVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgU0hPV19SRUxBVEVEX0lORk86XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHJlbGF0ZWRBcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRoaWRlUmVsYXRlZDogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEhJREVfUkVMQVRFRF9JTkZPOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiB7XG5cdFx0XHRcdFx0Li4uZW1wdHlBcnRpc3Rcblx0XHRcdFx0fSxcblx0XHRcdFx0aGlkZVJlbGF0ZWQ6IHRydWVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIENMRUFSX1NFU1NJT046XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uZW1wdHlTdGF0ZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRuZXdTdGF0ZSA9IHN0YXRlO1xuXHR9XG5cdHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzdGF0ZScsIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlKSk7XG5cdHJldHVybiBuZXdTdGF0ZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFwcFN0YXRlOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcHBTdGF0ZSBmcm9tIFwiLi9yZWR1Y2Vycy9hcHAtc3RhdGVcIjtcblxuZXhwb3J0IGxldCBzdG9yZSA9IGNyZWF0ZVN0b3JlKFxuXHRhcHBTdGF0ZSxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
