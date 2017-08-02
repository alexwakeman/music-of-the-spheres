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

_reactDom2.default.render(React.createElement(
	_reactRedux.Provider,
	{ store: _store.store },
	React.createElement(_appComponent.AppComponent, null)
), document.getElementById('root'));

},{"./components/app.component.jsx":7,"./state/store":24,"react":undefined,"react-dom":undefined,"react-redux":undefined}],2:[function(require,module,exports){
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
				if (obj.type === _props.MAIN_ARTIST_TEXT || obj.type === _props.RELATED_ARTIST_TEXT) {
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

},{"./props":3,"./scene-utils.class":4,"three":undefined}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CONNECTING_LINE = exports.RELATED_ARTIST_TEXT = exports.MAIN_ARTIST_TEXT = exports.RELATED_ARTIST_SPHERE = exports.MAIN_ARTIST_SPHERE = exports.Props = undefined;

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
var MAIN_ARTIST_TEXT = exports.MAIN_ARTIST_TEXT = 'MAIN_ARTIST_TEXT';
var RELATED_ARTIST_TEXT = exports.RELATED_ARTIST_TEXT = 'RELATED_ARTIST_TEXT';
var CONNECTING_LINE = exports.CONNECTING_LINE = 'CONNECTING_LINE';

},{"three":undefined}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SceneUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _colours = require('../config/colours');

var _props = require('./props');

var _statistics = require('./statistics.class');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HELVETIKER = void 0;
var MAIN_ARTIST_FONT_SIZE = 34;
var RELATED_ARTIST_FONT_SIZE = 20;
var TOTAL_RELATED = 6;
var RELATED_POSTIONS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];

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
	}, {
		key: 'clamp',
		value: function clamp(a, b, c) {
			return Math.max(b, Math.min(c, a));
		}
	}, {
		key: 'sign',
		value: function sign(n) {
			return n > 0 ? 1 : n < 0 ? -1 : 0;
		}
	}, {
		key: 'negateVector',
		value: function negateVector(vector) {
			return new THREE.Vector3(SceneUtils.negateNumber(vector.x), SceneUtils.negateNumber(vector.y), SceneUtils.negateNumber(vector.z));
		}
	}, {
		key: 'negateNumber',
		value: function negateNumber(n) {
			if (n === 0) {
				return n;
			} else if (n < 0) {
				return Math.abs(n);
			} else {
				return -n;
			}
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
		value: function createMainArtistSphere(mainArtist) {
			var relatedArtistExplored = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			var radius = _statistics.Statistics.getArtistSphereSize(mainArtist);
			var geometry = new THREE.SphereGeometry(radius, 35, 35);
			var sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.mainArtist }));
			sphere.artistObj = mainArtist;
			sphere.radius = radius;
			sphere.type = _props.MAIN_ARTIST_SPHERE;
			sphere.colours = {};
			sphere.colours.default = _colours.Colours.mainArtist;
			sphere.colours.hover = _colours.Colours.mainArtistHover;
			sphere.colours.selected = _colours.Colours.mainArtist;
			if (relatedArtistExplored) {
				sphere.position.copy(relatedArtistExplored.position);
				sphere.exitPosition = SceneUtils.negateVector(relatedArtistExplored.directionNorm);
			}
			SceneUtils.addText(mainArtist.name, MAIN_ARTIST_FONT_SIZE, sphere, _props.MAIN_ARTIST_TEXT);
			return sphere;
		}
	}, {
		key: 'createRelatedSpheres',
		value: function createRelatedSpheres(mainArtist, mainArtistSphere) {
			var relatedArtistsSphereArray = [];
			var relatedArtist = void 0;
			var limit = Math.min(TOTAL_RELATED, mainArtist.related.length);
			if (mainArtistSphere.exitPosition && limit === TOTAL_RELATED) {
				limit -= 1;
			}

			for (var i = 0; i < limit; i++) {
				relatedArtist = mainArtist.related[i];
				var radius = _statistics.Statistics.getArtistSphereSize(relatedArtist);
				var geometry = new THREE.SphereGeometry(radius, 35, 35);
				var relatedArtistSphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.relatedArtist }));
				var genreMetrics = _statistics.Statistics.getSharedGenreMetric(mainArtist, relatedArtist);
				relatedArtistSphere.type = _props.RELATED_ARTIST_SPHERE;
				relatedArtistSphere.artistObj = relatedArtist;
				relatedArtistSphere.artistObj.genreSimilarity = genreMetrics.genreSimilarity;
				relatedArtistSphere.distance = genreMetrics.lineLength;
				relatedArtistSphere.radius = radius;
				relatedArtistSphere.colours = {};
				relatedArtistSphere.colours.default = _colours.Colours.relatedArtist;
				relatedArtistSphere.colours.hover = _colours.Colours.relatedArtistHover;
				relatedArtistSphere.colours.selected = _colours.Colours.relatedArtistClicked;
				SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, i);
				SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
				SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere, _props.RELATED_ARTIST_TEXT);
				relatedArtistsSphereArray.push(relatedArtistSphere);
			}
			return relatedArtistsSphereArray;
		}
	}, {
		key: 'appendObjectsToScene',
		value: function appendObjectsToScene(sphere) {
			var sphereArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

			var parent = _props.Props.graphContainer.getObjectByName('parent');
			if (!parent) {
				parent = new THREE.Object3D();
				parent.name = 'parent';
				_props.Props.graphContainer.add(parent);
			}

			parent.add(sphere);
			for (var i = 0; i < sphereArray.length; i++) {
				parent.add(sphereArray[i]);
			}
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
		value: function positionRelatedArtist(mainArtistSphere, relatedSphere, positionIndex) {
			var mainArtistSpherePos = mainArtistSphere.position.clone();
			var direction = RELATED_POSTIONS[positionIndex];
			relatedSphere.position.copy(mainArtistSpherePos.add(new THREE.Vector3(direction.x * relatedSphere.distance, direction.y * relatedSphere.distance, direction.z * relatedSphere.distance)));
			relatedSphere.directionNorm = direction;
		}
	}, {
		key: 'addText',
		value: function addText(label, size, sphere, textType) {
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
			textMesh.type = textType;
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

},{"../config/colours":14,"./props":3,"./statistics.class":6,"three":undefined}],5:[function(require,module,exports){
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
		this.hoveredSphere = { id: NaN }; // set to NaN as optimisation (NaN !== NaN) and simpler branching
		this.selectedSphere = { id: NaN };

		// attach to dom
		_props.Props.renderer.setSize(window.innerWidth, window.innerHeight);
		_props.Props.renderer.domElement.id = 'renderer';
		_props.Props.container = container;
		_props.Props.container.appendChild(_props.Props.renderer.domElement);

		// init the scene
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
			this.selectedSphere = _props.Props.mainArtistSphere;
			_sceneUtils.SceneUtils.appendObjectsToScene(_props.Props.mainArtistSphere, _props.Props.relatedArtistSpheres);
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

			if (intersects.length) {
				selected = intersects[0].object;
				if (selected.id === this.hoveredSphere.id) {
					return;
				}
				switch (selected.type) {
					case _props.MAIN_ARTIST_SPHERE:
					case _props.RELATED_ARTIST_SPHERE:
						this.unHighlightHoveredSphere();
						this.hoveredSphere = selected;
						this.highlightHoveredSphere();
						isOverRelated = true;
						break;
					case _props.MAIN_ARTIST_TEXT:
					case _props.RELATED_ARTIST_TEXT:
						this.unHighlightHoveredSphere();
						this.hoveredSphere = selected.parent;
						this.highlightHoveredSphere();
						isOverRelated = true;
						break;
				}
			} else {
				this.unHighlightHoveredSphere();
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
			return isOverRelated;
		}
	}, {
		key: "unHighlightHoveredSphere",
		value: function unHighlightHoveredSphere() {
			if (this.hoveredSphere.id && !this.hoveredSphereIsSelected()) {
				this.hoveredSphere.material.color.setHex(this.hoveredSphere.colours.default);
				this.hoveredSphere = { id: NaN };
				if (this.selectedSphere.type !== _props.RELATED_ARTIST_SPHERE) {
					_store.store.dispatch((0, _actions.hideRelated)());
				}
			}
		}
	}, {
		key: "highlightHoveredSphere",
		value: function highlightHoveredSphere() {
			if (!this.hoveredSphereIsSelected()) {
				this.hoveredSphere.material.color.setHex(this.hoveredSphere.colours.hover);
				if (this.selectedSphere.type !== _props.RELATED_ARTIST_SPHERE) {
					_store.store.dispatch((0, _actions.showRelated)(this.hoveredSphere.artistObj));
				}
			}
		}
	}, {
		key: "hoveredSphereIsSelected",
		value: function hoveredSphereIsSelected() {
			return this.hoveredSphere.id === this.selectedSphere.id;
		}
	}, {
		key: "onSceneMouseClick",
		value: function onSceneMouseClick(event) {
			_props.Props.mouseVector = _sceneUtils.SceneUtils.getMouseVector(event);
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos();
			if (intersects.length) {
				var selected = intersects[0].object;
				if (this.selectedSphere && selected.id === this.selectedSphere.id) {
					return;
				}
				switch (selected.type) {
					case _props.RELATED_ARTIST_SPHERE:
						this.resetClickedSphere();
						this.selectedSphere = selected;
						this.setupClickedSphere();
						_store.store.dispatch((0, _actions.showRelated)(this.selectedSphere.artistObj));
						break;
					case _props.RELATED_ARTIST_TEXT:
						this.resetClickedSphere();
						this.selectedSphere = selected.parent;
						this.setupClickedSphere();
						_store.store.dispatch((0, _actions.showRelated)(this.selectedSphere.artistObj));
						break;
					case _props.MAIN_ARTIST_SPHERE:
						this.resetClickedSphere();
						this.selectedSphere = selected;
						this.setupClickedSphere();
						_store.store.dispatch((0, _actions.hideRelated)());
						break;
					case _props.MAIN_ARTIST_TEXT:
						this.resetClickedSphere();
						this.selectedSphere = selected.parent;
						this.setupClickedSphere();
						_store.store.dispatch((0, _actions.hideRelated)());
						break;
				}
			} else {
				this.resetClickedSphere();
				_store.store.dispatch((0, _actions.hideRelated)());
			}
		}
	}, {
		key: "setupClickedSphere",
		value: function setupClickedSphere() {
			this.selectedSphere.material.color.setHex(this.selectedSphere.colours.selected);
			_musicData.MusicDataService.fetchDisplayAlbums(this.selectedSphere.artistObj);
		}
	}, {
		key: "resetClickedSphere",
		value: function resetClickedSphere() {
			if (!this.selectedSphere.id) {
				return;
			}
			this.selectedSphere.material.color.setHex(this.selectedSphere.colours.default);
			this.selectedSphere = { id: NaN };
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
			// remove the selectedSphere from the graph
			// replace it with duplicate as 'mainArtistSphere',
			// attach related artists to it (avoiding inverted direction norm)
			_musicData.MusicDataService.getArtist(selectedSphere.artistObj.id).then(function (artistObj) {});
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

},{"../config/colours":14,"../services/music-data.service":21,"../state/actions":22,"../state/store":24,"./motion-lab.class":2,"./props":3,"./scene-utils.class":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"../containers/artist-info.container":15,"../containers/artist-list.container":16,"../containers/related-artist-info.container":17,"../containers/scene.container":18,"../containers/search-input.container":19,"../containers/spotify-player.container":20,"react":undefined}],8:[function(require,module,exports){
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

},{"react":undefined}],9:[function(require,module,exports){
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

},{"../services/music-data.service":21,"../state/store":24,"react":undefined}],10:[function(require,module,exports){
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

},{"react":undefined}],11:[function(require,module,exports){
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

},{"../classes/scene-utils.class":4,"../classes/spheres-scene.class":5,"../state/actions":22,"../state/store":24,"react":undefined}],12:[function(require,module,exports){
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

},{"react":undefined}],13:[function(require,module,exports){
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

},{"react":undefined}],14:[function(require,module,exports){
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
	mainArtistHover: 0xfff2bc,
	textOuter: 0xffffcc,
	textInner: 0x000033
};

},{}],15:[function(require,module,exports){
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

},{"../components/artist-info.component":8,"react-redux":undefined}],16:[function(require,module,exports){
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

},{"../components/artist-list.component":9,"../services/music-data.service":21,"react-redux":undefined}],17:[function(require,module,exports){
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

},{"../components/related-artist-info.component":10,"react-redux":undefined}],18:[function(require,module,exports){
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

},{"../components/scene.component":11,"react-redux":undefined}],19:[function(require,module,exports){
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

},{"../components/search-input.component.jsx":12,"../services/music-data.service":21,"../state/actions":22,"react-redux":undefined}],20:[function(require,module,exports){
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

},{"../components/spotify-player.component":13,"../state/actions":22,"react-redux":undefined}],21:[function(require,module,exports){
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

},{"../state/actions":22,"../state/store":24}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"../actions":22}],24:[function(require,module,exports){
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

},{"./reducers/app-state":23,"redux":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcHAtc3RhdGUuanMiLCJzcmMvanMvc3RhdGUvc3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOztJQUFZLEs7O0FBQ1o7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsbUJBQVMsTUFBVCxDQUNDO0FBQUE7QUFBQSxHQUFVLG1CQUFWO0FBQ0M7QUFERCxDQURELEVBSUMsU0FBUyxjQUFULENBQXdCLE1BQXhCLENBSkQ7Ozs7Ozs7Ozs7cWpCQ05BOzs7Ozs7QUFJQTs7QUFDQTs7QUFDQTs7SUFBWSxLOzs7Ozs7QUFFWixJQUFNLG1CQUFtQixrQkFBekI7QUFDQSxJQUFNLFVBQVUsU0FBaEI7QUFDQSxJQUFNLGFBQWE7QUFDbEIsT0FBTTtBQURZLENBQW5COztJQUlhLFMsV0FBQSxTO0FBQ1Qsc0JBQWM7QUFBQTs7QUFDaEIsT0FBSyxHQUFMLEdBQVcsVUFBWDtBQUNBLE9BQUssT0FBTDtBQUNBOzs7OzRCQUVTO0FBQUE7O0FBQ1QsZ0JBQU0sRUFBTixHQUFXLEtBQUssR0FBTCxFQUFYO0FBQ0EsUUFBSyxZQUFMO0FBQ0EsZ0JBQU0sUUFBTixDQUFlLE1BQWYsQ0FBc0IsYUFBTSxLQUE1QixFQUFtQyxhQUFNLE1BQXpDO0FBQ0EsVUFBTyxxQkFBUCxDQUE2QixZQUFNO0FBQ2xDLGlCQUFNLEVBQU4sR0FBVyxhQUFNLEVBQWpCO0FBQ0EsVUFBSyxPQUFMLENBQWEsSUFBYjtBQUNBLElBSEQ7QUFJQTs7O2lDQUVjO0FBQ2QsV0FBUSxLQUFLLEdBQUwsQ0FBUyxJQUFqQjtBQUNDLFNBQUssZ0JBQUw7QUFDQyxVQUFLLHlCQUFMO0FBQ0E7QUFDRCxTQUFLLE9BQUw7QUFDQyxVQUFLLGNBQUw7QUFDQTtBQU5GO0FBUUE7Ozs4Q0FFMkI7QUFDM0IsT0FBTSxZQUFZLFNBQVMsS0FBSyxHQUFMLENBQVMsV0FBbEIsTUFBbUMsQ0FBckQ7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LE1BQU0sY0FBdkIsZ0NBQTRDLE1BQU0sY0FBbEQsSUFBa0UsT0FBTyxJQUF6RSxFQUFyQjtBQUNBLDRCQUNJLEtBREo7QUFFQyxhQUFRLE9BQU8sSUFGaEI7QUFHQyxvQkFBZSxPQUFPLElBSHZCO0FBSUMsa0RBQ0ksY0FESixFQUpEO0FBT0MsaUJBQVksT0FBTyxJQUFQLENBQVksSUFQekI7QUFRQyxlQUFVLEtBUlg7QUFTQyxrQkFBYSxJQVRkO0FBVUMsaUNBQ0ksV0FESixDQVZEO0FBYUMsd0JBQW1CO0FBYnBCO0FBZUEsSUFuQkQsTUFtQk87QUFDTixZQUFRLElBQVIsQ0FBYSxzRUFBYjtBQUNBLGVBQVcsS0FBWDtBQUNBO0FBQ0Q7QUFDRDtBQUNDLDJCQUNJLEtBREo7QUFFQyxtQkFBZSxPQUFPLElBRnZCO0FBR0MsdUJBQW1CO0FBSHBCO0FBS0E7QUFDRDtBQUNDLDJCQUNJLEtBREo7QUFFQyx1QkFBbUIsT0FBTztBQUYzQjtBQUlBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsbUJBQWUsT0FBTyxJQUZ2QjtBQUdDLGlCQUFhO0FBSGQ7QUFLQTtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLGdDQUNJLFdBREosQ0FGRDtBQUtDLGlCQUFhO0FBTGQ7QUFPQTtBQUNEO0FBQ0MsMkJBQ0ksVUFESjtBQUdBO0FBQ0Q7QUFDQyxjQUFXLEtBQVg7QUFuRUY7QUFxRUEsUUFBTyxjQUFQLENBQXNCLE9BQXRCLENBQThCLE9BQTlCLEVBQXVDLEtBQUssU0FBTCxDQUFlLFFBQWYsQ0FBdkM7QUFDQSxRQUFPLFFBQVA7QUFDQSxDQXpFRDs7a0JBMkVlLFE7Ozs7Ozs7Ozs7QUM1R2Y7O0FBQ0E7Ozs7OztBQUVPLElBQUksd0JBQVEsNENBRWxCLE9BQU8sNEJBQVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiLyoqXG4gKiBNb3Rpb25MYWIgZGVhbHMgd2l0aCBjb250cm9sbGluZyBlYWNoIHRpY2sgb2YgdGhlIGFuaW1hdGlvbiBmcmFtZSBzZXF1ZW5jZVxuICogSXQncyBhaW0gaXMgdG8gaXNvbGF0ZSBjb2RlIHRoYXQgaGFwcGVucyBvdmVyIGEgbnVtYmVyIG9mIGZyYW1lcyAoaS5lLiBtb3Rpb24pXG4gKi9cbmltcG9ydCB7UHJvcHMsIE1BSU5fQVJUSVNUX1RFWFQsIFJFTEFURURfQVJUSVNUX1RFWFR9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNvbnN0IFRSQUNLX0NBTV9UT19PQkogPSAnVFJBQ0tfQ0FNX1RPX09CSic7XG5jb25zdCBERUZBVUxUID0gJ0RFRkFVTFQnO1xuY29uc3QgZGVmYXVsdEpvYiA9IHtcblx0dHlwZTogREVGQVVMVFxufTtcblxuZXhwb3J0IGNsYXNzIE1vdGlvbkxhYiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHRcdHRoaXMuYW5pbWF0ZSgpO1xuXHR9XG5cblx0YW5pbWF0ZSgpIHtcblx0XHRQcm9wcy50MiA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5wcm9jZXNzU2NlbmUoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5yZW5kZXIoUHJvcHMuc2NlbmUsIFByb3BzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRQcm9wcy50MSA9IFByb3BzLnQyO1xuXHRcdFx0dGhpcy5hbmltYXRlLmNhbGwodGhpcyk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm9jZXNzU2NlbmUoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi50eXBlKSB7XG5cdFx0XHRjYXNlIFRSQUNLX0NBTV9UT19PQko6XG5cdFx0XHRcdHRoaXMudHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgREVGQVVMVDpcblx0XHRcdFx0dGhpcy51cGRhdGVSb3RhdGlvbigpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCkge1xuXHRcdGNvbnN0IHNob3VsZEVuZCA9IHBhcnNlSW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKSA9PT0gMTtcblx0XHRpZiAoIXNob3VsZEVuZCkge1xuXHRcdFx0dGhpcy5mb2xsb3dQYXRoKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5lbmRBbmltYXRpb24oKTtcblx0XHR9XG5cdH1cblxuXHRmb2xsb3dQYXRoKCkge1xuXHRcdGNvbnN0IHAgPSB0aGlzLmpvYi5wYXRoLmdldFBvaW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKTtcblx0XHR0aGlzLmpvYi5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHApO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lICs9IDAuMDE7XG5cdH1cblxuXHRlbmRBbmltYXRpb24oKSB7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgJiYgdGhpcy5qb2IuY2FsbGJhY2soKTtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdH1cblxuXHR0cmFja09iamVjdFRvQ2FtZXJhKG9iamVjdDNELCBjYWxsYmFjaykge1xuICAgIFx0dGhpcy5qb2IgPSB7fTtcbiAgICBcdHRoaXMuam9iLnR5cGUgPSBUUkFDS19DQU1fVE9fT0JKO1xuXHRcdHRoaXMuam9iLnQgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLmpvYi5vYmplY3QzRCA9IG9iamVjdDNEO1xuXHRcdHRoaXMuam9iLmVuZGVkID0gZmFsc2U7XG5cdFx0dGhpcy5qb2IucGF0aCA9IG5ldyBUSFJFRS5DYXRtdWxsUm9tQ3VydmUzKFtcblx0XHRcdG9iamVjdDNELnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKVxuXHRcdF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRjb25zdCBjYW1RdWF0ZXJuaW9uVXBkYXRlID0gdGhpcy5nZXROZXdDYW1lcmFEaXJlY3Rpb24oKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS54ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnkgKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIFByb3BzLmNhbWVyYURpc3RhbmNlXG5cdFx0KTtcblx0XHRQcm9wcy5jYW1lcmEubG9va0F0KFByb3BzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmoudHlwZSA9PT0gTUFJTl9BUlRJU1RfVEVYVCB8fCBvYmoudHlwZSA9PT0gUkVMQVRFRF9BUlRJU1RfVEVYVCkge1xuXHRcdFx0XHRsZXQgY2FtZXJhTm9ybSA9IFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmoucG9zaXRpb24uc2V0KFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueCAqIG9iai5wYXJlbnQucmFkaXVzLFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueSAqIG9iai5wYXJlbnQucmFkaXVzLFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueiAqIG9iai5wYXJlbnQucmFkaXVzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdG9iai5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdGdldE5ld0NhbWVyYURpcmVjdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSBQcm9wcy5tb3VzZVBvc0RpZmZZID49IFByb3BzLm1vdXNlUG9zRGlmZlg7XG5cdFx0Y29uc3QgeE1vcmVUaGFuWU1vdXNlID0gIXlNb3JlVGhhblhNb3VzZTtcblx0XHRpZiAoUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCAtPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54ICs9IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSArPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55IC09IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZSA9IFNjZW5lVXRpbHMucmVub3JtYWxpemVRdWF0ZXJuaW9uKFByb3BzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIoUHJvcHMuY2FtZXJhUm90YXRpb24pO1xuXHRcdHJldHVybiBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHR9XG5cblx0cmVkdWNlU3BlZWQoYW1vdW50KSB7XG5cdFx0aWYgKFByb3BzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFggLT0gYW1vdW50O1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5zcGVlZFkgPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmV4cG9ydCBjb25zdCBQcm9wcyA9IHtcblx0cmVuZGVyZXI6IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSksXG5cdHNjZW5lOiBuZXcgVEhSRUUuU2NlbmUoKSxcblx0Y2FtZXJhOiBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCksXG5cdGdyYXBoQ29udGFpbmVyOiBuZXcgVEhSRUUuT2JqZWN0M0QoKSxcblx0Y2FtZXJhUm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigwLCAtMSwgMCksXG5cdGNhbWVyYUxvb2tBdDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXG5cdGNhbWVyYURpc3RhbmNlOiAzNTAwLFxuXHRcblx0dDE6IDAuMCwgLy8gb2xkIHRpbWVcblx0dDI6IDAuMCwgLy8gbm93IHRpbWVcblx0c3BlZWRYOiAwLjAwNSxcblx0c3BlZWRZOiAwLjAwMCxcblx0bW91c2VQb3NEaWZmWDogMC4wLFxuXHRtb3VzZVBvc0RpZmZZOiAwLjAsXG5cdG1vdXNlUG9zWEluY3JlYXNlZDogZmFsc2UsXG5cdG1vdXNlUG9zWUluY3JlYXNlZDogZmFsc2UsXG5cdHJheWNhc3RlcjogbmV3IFRIUkVFLlJheWNhc3RlcigpLFxuXHRtb3VzZVZlY3RvcjogbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XG5cdHJlbGF0ZWRBcnRpc3RTcGhlcmVzOiBbXSxcblx0bWFpbkFydGlzdFNwaGVyZToge30sXG5cdHNlbGVjdGVkQXJ0aXN0U3BoZXJlOiB7aWQ6IDB9XG59O1xuXG5leHBvcnQgY29uc3QgTUFJTl9BUlRJU1RfU1BIRVJFID0gJ01BSU5fQVJUSVNUX1NQSEVSRSc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9BUlRJU1RfU1BIRVJFID0gJ1JFTEFURURfQVJUSVNUX1NQSEVSRSc7XG5leHBvcnQgY29uc3QgTUFJTl9BUlRJU1RfVEVYVCA9ICdNQUlOX0FSVElTVF9URVhUJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0FSVElTVF9URVhUID0gJ1JFTEFURURfQVJUSVNUX1RFWFQnO1xuZXhwb3J0IGNvbnN0IENPTk5FQ1RJTkdfTElORSA9ICdDT05ORUNUSU5HX0xJTkUnOyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSAnLi4vY29uZmlnL2NvbG91cnMnO1xuaW1wb3J0IHtcblx0Q09OTkVDVElOR19MSU5FLCBNQUlOX0FSVElTVF9TUEhFUkUsIFJFTEFURURfQVJUSVNUX1NQSEVSRSwgUHJvcHMsXG5cdFJFTEFURURfQVJUSVNUX1RFWFQsIE1BSU5fQVJUSVNUX1RFWFRcbn0gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge1N0YXRpc3RpY3N9IGZyb20gJy4vc3RhdGlzdGljcy5jbGFzcyc7XG5cbmxldCBIRUxWRVRJS0VSO1xuY29uc3QgTUFJTl9BUlRJU1RfRk9OVF9TSVpFID0gMzQ7XG5jb25zdCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUgPSAyMDtcbmNvbnN0IFRPVEFMX1JFTEFURUQgPSA2O1xuY29uc3QgUkVMQVRFRF9QT1NUSU9OUyA9IFtcblx0bmV3IFRIUkVFLlZlY3RvcjMoMSwgMCwgMCksIG5ldyBUSFJFRS5WZWN0b3IzKC0xLCAwLCAwKSxcblx0bmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCksIG5ldyBUSFJFRS5WZWN0b3IzKDAsIC0xLCAwKSxcblx0bmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMSksIG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIC0xKVxuXTtcblxuY2xhc3MgU2NlbmVVdGlscyB7XG5cdHN0YXRpYyBpbml0KCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRjb25zdCBsb2FkZXIgPSBuZXcgVEhSRUUuRm9udExvYWRlcigpO1xuXHRcdFx0bG9hZGVyLmxvYWQoJy4vanMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nLCAoZm9udCkgPT4ge1xuXHRcdFx0XHRIRUxWRVRJS0VSID0gZm9udDtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSwgKCk9Pnt9LCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG5cblx0c3RhdGljIGNsYW1wKGEsIGIsIGMpIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgoYiwgTWF0aC5taW4oYywgYSkpO1xuXHR9XG5cblx0c3RhdGljIHNpZ24obikge1xuXHRcdHJldHVybiBuID4gMCA/IDEgOiBuIDwgMCA/IC0xIDogMDtcblx0fVxuXG5cdHN0YXRpYyBuZWdhdGVWZWN0b3IodmVjdG9yKSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0U2NlbmVVdGlscy5uZWdhdGVOdW1iZXIodmVjdG9yLngpLFxuXHRcdFx0U2NlbmVVdGlscy5uZWdhdGVOdW1iZXIodmVjdG9yLnkpLFxuXHRcdFx0U2NlbmVVdGlscy5uZWdhdGVOdW1iZXIodmVjdG9yLnopXG5cdFx0KVxuXHR9XG5cblx0c3RhdGljIG5lZ2F0ZU51bWJlcihuKSB7XG5cdFx0aWYgKG4gPT09IDApIHtcblx0XHRcdHJldHVybiBuO1xuXHRcdH0gZWxzZSBpZiAobiA8IDApIHtcblx0XHRcdHJldHVybiBNYXRoLmFicyhuKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIC1uO1xuXHRcdH1cblx0fVxuXHRcblx0c3RhdGljIHJlbm9ybWFsaXplUXVhdGVybmlvbihvYmplY3QpIHtcblx0XHRsZXQgY2xvbmUgPSBvYmplY3QuY2xvbmUoKTtcblx0XHRsZXQgcSA9IGNsb25lLnF1YXRlcm5pb247XG5cdFx0bGV0IG1hZ25pdHVkZSA9IE1hdGguc3FydChNYXRoLnBvdyhxLncsIDIpICsgTWF0aC5wb3cocS54LCAyKSArIE1hdGgucG93KHEueSwgMikgKyBNYXRoLnBvdyhxLnosIDIpKTtcblx0XHRxLncgLz0gbWFnbml0dWRlO1xuXHRcdHEueCAvPSBtYWduaXR1ZGU7XG5cdFx0cS55IC89IG1hZ25pdHVkZTtcblx0XHRxLnogLz0gbWFnbml0dWRlO1xuXHRcdHJldHVybiBxO1xuXHR9XG5cblx0c3RhdGljIGdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoKSB7XG5cdFx0UHJvcHMucmF5Y2FzdGVyLnNldEZyb21DYW1lcmEoUHJvcHMubW91c2VWZWN0b3IsIFByb3BzLmNhbWVyYSk7XG5cdFx0cmV0dXJuIFByb3BzLnJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKFByb3BzLmdyYXBoQ29udGFpbmVyLmNoaWxkcmVuLCB0cnVlKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRNb3VzZVZlY3RvcihldmVudCkge1xuXHRcdHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMigoZXZlbnQuY2xpZW50WCAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGgpICogMiAtIDEsXG5cdFx0XHQtKGV2ZW50LmNsaWVudFkgLyBQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMSk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlTWFpbkFydGlzdFNwaGVyZShtYWluQXJ0aXN0LCByZWxhdGVkQXJ0aXN0RXhwbG9yZWQgPSBudWxsKSB7XG5cdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShtYWluQXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IG1haW5BcnRpc3Q7XG5cdFx0c3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRzcGhlcmUudHlwZSA9IE1BSU5fQVJUSVNUX1NQSEVSRTtcblx0XHRzcGhlcmUuY29sb3VycyA9IHt9O1xuXHRcdHNwaGVyZS5jb2xvdXJzLmRlZmF1bHQgPSBDb2xvdXJzLm1haW5BcnRpc3Q7XG5cdFx0c3BoZXJlLmNvbG91cnMuaG92ZXIgPSBDb2xvdXJzLm1haW5BcnRpc3RIb3Zlcjtcblx0XHRzcGhlcmUuY29sb3Vycy5zZWxlY3RlZCA9IENvbG91cnMubWFpbkFydGlzdDtcblx0XHRpZiAocmVsYXRlZEFydGlzdEV4cGxvcmVkKSB7XG5cdFx0XHRzcGhlcmUucG9zaXRpb24uY29weShyZWxhdGVkQXJ0aXN0RXhwbG9yZWQucG9zaXRpb24pO1xuXHRcdFx0c3BoZXJlLmV4aXRQb3NpdGlvbiA9IFNjZW5lVXRpbHMubmVnYXRlVmVjdG9yKHJlbGF0ZWRBcnRpc3RFeHBsb3JlZC5kaXJlY3Rpb25Ob3JtKTtcblx0XHR9XG5cdFx0U2NlbmVVdGlscy5hZGRUZXh0KG1haW5BcnRpc3QubmFtZSwgTUFJTl9BUlRJU1RfRk9OVF9TSVpFLCBzcGhlcmUsIE1BSU5fQVJUSVNUX1RFWFQpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMobWFpbkFydGlzdCwgbWFpbkFydGlzdFNwaGVyZSkge1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5ID0gW107XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3Q7XG5cdFx0bGV0IGxpbWl0ID0gTWF0aC5taW4oVE9UQUxfUkVMQVRFRCwgbWFpbkFydGlzdC5yZWxhdGVkLmxlbmd0aCk7XG5cdFx0aWYgKG1haW5BcnRpc3RTcGhlcmUuZXhpdFBvc2l0aW9uICYmIGxpbWl0ID09PSBUT1RBTF9SRUxBVEVEKSB7XG5cdFx0XHRsaW1pdCAtPSAxO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGltaXQ7IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdCA9IG1haW5BcnRpc3QucmVsYXRlZFtpXTtcblx0XHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRsZXQgZ2VucmVNZXRyaWNzID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhtYWluQXJ0aXN0LCByZWxhdGVkQXJ0aXN0KTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUudHlwZSA9IFJFTEFURURfQVJUSVNUX1NQSEVSRTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqID0gcmVsYXRlZEFydGlzdDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqLmdlbnJlU2ltaWxhcml0eSA9IGdlbnJlTWV0cmljcy5nZW5yZVNpbWlsYXJpdHk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmRpc3RhbmNlID0gZ2VucmVNZXRyaWNzLmxpbmVMZW5ndGg7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuY29sb3VycyA9IHt9O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5jb2xvdXJzLmRlZmF1bHQgPSBDb2xvdXJzLnJlbGF0ZWRBcnRpc3Q7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmNvbG91cnMuaG92ZXIgPSBDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcjtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuY29sb3Vycy5zZWxlY3RlZCA9IENvbG91cnMucmVsYXRlZEFydGlzdENsaWNrZWQ7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBpKTtcblx0XHRcdFNjZW5lVXRpbHMuam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRTY2VuZVV0aWxzLmFkZFRleHQocmVsYXRlZEFydGlzdC5uYW1lLCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUsIFJFTEFURURfQVJUSVNUX1RFWFQpO1xuXHRcdFx0cmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheS5wdXNoKHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheTtcblx0fVxuXG5cdHN0YXRpYyBhcHBlbmRPYmplY3RzVG9TY2VuZShzcGhlcmUsIHNwaGVyZUFycmF5ID0gW10pIHtcblx0XHRsZXQgcGFyZW50ID0gUHJvcHMuZ3JhcGhDb250YWluZXIuZ2V0T2JqZWN0QnlOYW1lKCdwYXJlbnQnKTtcblx0XHRpZiAoIXBhcmVudCkge1xuXHRcdFx0cGFyZW50ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cdFx0XHRwYXJlbnQubmFtZSA9ICdwYXJlbnQnO1xuXHRcdFx0UHJvcHMuZ3JhcGhDb250YWluZXIuYWRkKHBhcmVudCk7XG5cdFx0fVxuXG5cdFx0cGFyZW50LmFkZChzcGhlcmUpO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BoZXJlQXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdHBhcmVudC5hZGQoc3BoZXJlQXJyYXlbaV0pO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBqb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkTGluZUpvaW59KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRsZXQgbGluZTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHJlbGF0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0bGluZSA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdFx0bGluZS50eXBlID0gQ09OTkVDVElOR19MSU5FO1xuXHRcdG1haW5BcnRpc3RTcGhlcmUuYWRkKGxpbmUpO1xuXHR9XG5cblx0c3RhdGljIHBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlLCBwb3NpdGlvbkluZGV4KSB7XG5cdFx0bGV0IG1haW5BcnRpc3RTcGhlcmVQb3MgPSBtYWluQXJ0aXN0U3BoZXJlLnBvc2l0aW9uLmNsb25lKCk7XG5cdFx0bGV0IGRpcmVjdGlvbiA9IFJFTEFURURfUE9TVElPTlNbcG9zaXRpb25JbmRleF07XG5cdFx0cmVsYXRlZFNwaGVyZS5wb3NpdGlvblxuXHRcdFx0LmNvcHkobWFpbkFydGlzdFNwaGVyZVBvcy5hZGQobmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFx0ZGlyZWN0aW9uLnggKiByZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdGRpcmVjdGlvbi55ICogcmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRkaXJlY3Rpb24ueiAqIHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2Vcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdFx0cmVsYXRlZFNwaGVyZS5kaXJlY3Rpb25Ob3JtID0gZGlyZWN0aW9uO1xuXHR9XG5cblx0c3RhdGljIGFkZFRleHQobGFiZWwsIHNpemUsIHNwaGVyZSwgdGV4dFR5cGUpIHtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogc2l6ZSxcblx0XHRcdGN1cnZlU2VnbWVudHM6IDQsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMixcblx0XHRcdGJldmVsU2l6ZTogMSxcblx0XHRcdGJldmVsU2VnbWVudHM6IDNcblx0XHR9KTtcblx0XHRsZXQgdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0ZXh0R2VvbSwgbWF0ZXJpYWxBcnJheSk7XG5cdFx0bGV0IGNhbWVyYU5vcm0gPSBQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5ub3JtYWxpemUoKTtcblx0XHR0ZXh0TWVzaC50eXBlID0gdGV4dFR5cGU7XG5cdFx0c3BoZXJlLmFkZCh0ZXh0TWVzaCk7XG5cdFx0dGV4dE1lc2gucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtZXJhTm9ybS54ICogc3BoZXJlLnJhZGl1cyxcblx0XHRcdGNhbWVyYU5vcm0ueSAqIHNwaGVyZS5yYWRpdXMsXG5cdFx0XHRjYW1lcmFOb3JtLnogKiBzcGhlcmUucmFkaXVzXG5cdFx0KTtcblx0XHR0ZXh0TWVzaC5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHR9XG5cblx0c3RhdGljIGxpZ2h0aW5nKCkge1xuXHRcdGxldCBsaWdodEEgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGNjY2NjYywgMS43MjUpO1xuXHRcdGxldCBsaWdodEIgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGFhYWFhYSwgMS41KTtcblx0XHRsaWdodEEucG9zaXRpb24uc2V0WCg1MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRZKC04MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRYKC01MDApO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEEpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEIpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiLyoqXG4gKiBTcGhlcmVzU2NlbmUgaXMgZGVzaWduZWQgdG8gaGFuZGxlIGFkZGluZyBhbmQgcmVtb3ZpbmcgZW50aXRpZXMgZnJvbSB0aGUgc2NlbmUsXG4gKiBhbmQgaGFuZGxpbmcgZXZlbnRzLlxuICpcbiAqIEl0IGFpbXMgdG8gZGVhbCBub3Qgd2l0aCBjaGFuZ2VzIG92ZXIgdGltZSwgb25seSBpbW1lZGlhdGUgY2hhbmdlcyBpbiBvbmUgZnJhbWUuXG4gKi9cbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSBcIi4uL2NvbmZpZy9jb2xvdXJzXCI7XG5pbXBvcnQge01vdGlvbkxhYn0gZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5pbXBvcnQge1xuXHRNQUlOX0FSVElTVF9TUEhFUkUsIE1BSU5fQVJUSVNUX1RFWFQsIFByb3BzLCBSRUxBVEVEX0FSVElTVF9TUEhFUkUsIFJFTEFURURfQVJUSVNUX1RFWFQsXG5cdFRFWFRfR0VPTUVUUllcbn0gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2hpZGVSZWxhdGVkLCByZWxhdGVkQ2xpY2ssIHNob3dSZWxhdGVkfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0bGV0IGFydGlzdElkO1xuXHRcdHRoaXMubW90aW9uTGFiID0gbmV3IE1vdGlvbkxhYigpO1xuXHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IHtpZDogTmFOfTsgLy8gc2V0IHRvIE5hTiBhcyBvcHRpbWlzYXRpb24gKE5hTiAhPT0gTmFOKSBhbmQgc2ltcGxlciBicmFuY2hpbmdcblx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0ge2lkOiBOYU59O1xuXG5cdFx0Ly8gYXR0YWNoIHRvIGRvbVxuXHRcdFByb3BzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5pZCA9ICdyZW5kZXJlcic7XG5cdFx0UHJvcHMuY29udGFpbmVyID0gY29udGFpbmVyO1xuXHRcdFByb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50KTtcblxuXHRcdC8vIGluaXQgdGhlIHNjZW5lXG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0gUHJvcHMubWFpbkFydGlzdFNwaGVyZTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLm1haW5BcnRpc3RTcGhlcmUsIFByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzKTtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KSB7XG5cdFx0bGV0IHNlbGVjdGVkO1xuXHRcdGxldCBpbnRlcnNlY3RzO1xuXHRcdGxldCBpc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRQcm9wcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHRpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKCk7XG5cblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHtcblx0XHRcdHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoc2VsZWN0ZWQuaWQgPT09IHRoaXMuaG92ZXJlZFNwaGVyZS5pZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzd2l0Y2ggKHNlbGVjdGVkLnR5cGUpIHtcblx0XHRcdFx0Y2FzZSBNQUlOX0FSVElTVF9TUEhFUkU6XG5cdFx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfU1BIRVJFOlxuXHRcdFx0XHRcdHRoaXMudW5IaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCk7XG5cdFx0XHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gc2VsZWN0ZWQ7XG5cdFx0XHRcdFx0dGhpcy5oaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCk7XG5cdFx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgTUFJTl9BUlRJU1RfVEVYVDpcblx0XHRcdFx0Y2FzZSBSRUxBVEVEX0FSVElTVF9URVhUOlxuXHRcdFx0XHRcdHRoaXMudW5IaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCk7XG5cdFx0XHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRcdHRoaXMuaGlnaGxpZ2h0SG92ZXJlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnVuSGlnaGxpZ2h0SG92ZXJlZFNwaGVyZSgpO1xuXHRcdH1cblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHRcdHJldHVybiBpc092ZXJSZWxhdGVkO1xuXHR9XG5cblx0dW5IaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCkge1xuXHRcdGlmICh0aGlzLmhvdmVyZWRTcGhlcmUuaWQgJiYgIXRoaXMuaG92ZXJlZFNwaGVyZUlzU2VsZWN0ZWQoKSkge1xuXHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleCh0aGlzLmhvdmVyZWRTcGhlcmUuY29sb3Vycy5kZWZhdWx0KTtcblx0XHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IHtpZDogTmFOfTtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkU3BoZXJlLnR5cGUgIT09IFJFTEFURURfQVJUSVNUX1NQSEVSRSkge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRoaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCkge1xuXHRcdGlmICghdGhpcy5ob3ZlcmVkU3BoZXJlSXNTZWxlY3RlZCgpKSB7XG5cdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KHRoaXMuaG92ZXJlZFNwaGVyZS5jb2xvdXJzLmhvdmVyKTtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkU3BoZXJlLnR5cGUgIT09IFJFTEFURURfQVJUSVNUX1NQSEVSRSkge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChzaG93UmVsYXRlZCh0aGlzLmhvdmVyZWRTcGhlcmUuYXJ0aXN0T2JqKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aG92ZXJlZFNwaGVyZUlzU2VsZWN0ZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaG92ZXJlZFNwaGVyZS5pZCA9PT0gdGhpcy5zZWxlY3RlZFNwaGVyZS5pZDtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkU3BoZXJlICYmIHNlbGVjdGVkLmlkID09PSB0aGlzLnNlbGVjdGVkU3BoZXJlLmlkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAoc2VsZWN0ZWQudHlwZSkge1xuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHR0aGlzLnJlc2V0Q2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLnNldHVwQ2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHN0b3JlLmRpc3BhdGNoKHNob3dSZWxhdGVkKHRoaXMuc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfVEVYVDpcblx0XHRcdFx0XHR0aGlzLnJlc2V0Q2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUgPSBzZWxlY3RlZC5wYXJlbnQ7XG5cdFx0XHRcdFx0dGhpcy5zZXR1cENsaWNrZWRTcGhlcmUoKTtcblx0XHRcdFx0XHRzdG9yZS5kaXNwYXRjaChzaG93UmVsYXRlZCh0aGlzLnNlbGVjdGVkU3BoZXJlLmFydGlzdE9iaikpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHR0aGlzLnJlc2V0Q2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLnNldHVwQ2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHN0b3JlLmRpc3BhdGNoKGhpZGVSZWxhdGVkKCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1RFWFQ6XG5cdFx0XHRcdFx0dGhpcy5yZXNldENsaWNrZWRTcGhlcmUoKTtcblx0XHRcdFx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKCk7XG5cdFx0XHRcdFx0c3RvcmUuZGlzcGF0Y2goaGlkZVJlbGF0ZWQoKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVzZXRDbGlja2VkU3BoZXJlKCk7XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHR9XG5cdH1cblxuXHRzZXR1cENsaWNrZWRTcGhlcmUoKSB7XG5cdFx0dGhpcy5zZWxlY3RlZFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgodGhpcy5zZWxlY3RlZFNwaGVyZS5jb2xvdXJzLnNlbGVjdGVkKTtcblx0XHRNdXNpY0RhdGFTZXJ2aWNlLmZldGNoRGlzcGxheUFsYnVtcyh0aGlzLnNlbGVjdGVkU3BoZXJlLmFydGlzdE9iaik7XG5cdH1cblxuXHRyZXNldENsaWNrZWRTcGhlcmUoKSB7XG5cdFx0aWYgKCF0aGlzLnNlbGVjdGVkU3BoZXJlLmlkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KHRoaXMuc2VsZWN0ZWRTcGhlcmUuY29sb3Vycy5kZWZhdWx0KTtcblx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0ge2lkOiBOYU59O1xuXHR9XG5cblx0b25TY2VuZU1vdXNlRHJhZyhldmVudCkge1xuXHRcdGNvbnN0IGR0ID0gUHJvcHMudDIgLSBQcm9wcy50MTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci54ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueCk7XG5cdFx0UHJvcHMubW91c2VQb3NZSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnkgPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci55KTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZYID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueCkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci54KSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWSA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLnkpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueSkpO1xuXHRcdFByb3BzLnNwZWVkWCA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlgpIC8gZHQpO1xuXHRcdFByb3BzLnNwZWVkWSA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlkpIC8gZHQpO1xuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdH1cblxuXHRnZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0Ly8gcmVtb3ZlIHRoZSBzZWxlY3RlZFNwaGVyZSBmcm9tIHRoZSBncmFwaFxuXHRcdC8vIHJlcGxhY2UgaXQgd2l0aCBkdXBsaWNhdGUgYXMgJ21haW5BcnRpc3RTcGhlcmUnLFxuXHRcdC8vIGF0dGFjaCByZWxhdGVkIGFydGlzdHMgdG8gaXQgKGF2b2lkaW5nIGludmVydGVkIGRpcmVjdGlvbiBub3JtKVxuXHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KHNlbGVjdGVkU3BoZXJlLmFydGlzdE9iai5pZClcblx0XHRcdC50aGVuKChhcnRpc3RPYmopID0+IHtcblxuXHRcdFx0fSk7XG5cdH1cblxuXHRjbGVhckdyYXBoKCkge1xuXHRcdGNvbnN0IHBhcmVudCA9IFByb3BzLmdyYXBoQ29udGFpbmVyLmdldE9iamVjdEJ5TmFtZSgncGFyZW50Jyk7XG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0UHJvcHMuZ3JhcGhDb250YWluZXIucmVtb3ZlKHBhcmVudCk7XG5cdFx0fVxuXHR9XG5cblx0Y2xlYXJBZGRyZXNzKCkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG5cdH1cblxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVDYW1lcmFBc3BlY3QoKSB7XG5cdFx0UHJvcHMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdFByb3BzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufVxuIiwiY29uc3QgTUFYX0RJU1RBTkNFID0gODAwO1xuY29uc3QgU0laRV9TQ0FMQVJfU01BTEwgPSAxLjI1O1xuY29uc3QgU0laRV9TQ0FMQVJfQklHID0gMS43NTtcblxuZXhwb3J0IGNsYXNzIFN0YXRpc3RpY3Mge1xuICAgIHN0YXRpYyBnZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkge1xuICAgIFx0aWYgKGFydGlzdC5wb3B1bGFyaXR5ID49IDUwKSB7XG5cdFx0XHRyZXR1cm4gYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUl9CSUc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSX1NNQUxMO1xuXHRcdH1cblxuICAgIH1cblxuXHQvKipcbiAgICAgKiBNYXAtcmVkdWNlIG9mIHR3byBzdHJpbmcgYXJyYXlzXG5cdCAqIEBwYXJhbSBhcnRpc3Rcblx0ICogQHBhcmFtIHJlbGF0ZWRBcnRpc3Rcblx0ICogQHJldHVybnMge29iamVjdH1cblx0ICovXG5cdHN0YXRpYyBnZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpIHtcblx0XHRsZXQgdW5pdCwgZ2VucmVTaW1pbGFyaXR5LCByZWxhdGl2ZU1pbkRpc3RhbmNlLCBhcnRpc3RHZW5yZUNvdW50O1xuXHRcdGxldCBtYXRjaGVzID0gYXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLm1hcCgobWFpbkFydGlzdEdlbnJlKSA9PiBTdGF0aXN0aWNzLm1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkpXG4gICAgICAgICAgICAucmVkdWNlKChhY2N1bXVsYXRvciwgbWF0Y2gpID0+IHtcblx0XHQgICAgICAgIGlmIChtYXRjaCkge1xuXHRcdCAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHR9XG5cdFx0ICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgICAgICAgICB9LCBbXSk7XG5cdFx0YXJ0aXN0R2VucmVDb3VudCA9IGFydGlzdC5nZW5yZXMubGVuZ3RoID8gYXJ0aXN0LmdlbnJlcy5sZW5ndGggOiAxO1xuXHRcdHVuaXQgPSAxIC8gYXJ0aXN0R2VucmVDb3VudDtcblx0XHR1bml0ID0gdW5pdCA9PT0gMSA/IDAgOiB1bml0O1xuXHRcdGdlbnJlU2ltaWxhcml0eSA9IG1hdGNoZXMubGVuZ3RoICogdW5pdDtcblx0XHRyZWxhdGl2ZU1pbkRpc3RhbmNlID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkgKyBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxpbmVMZW5ndGg6IChNQVhfRElTVEFOQ0UgLSAoTUFYX0RJU1RBTkNFICogZ2VucmVTaW1pbGFyaXR5KSkgKyByZWxhdGl2ZU1pbkRpc3RhbmNlLFxuXHRcdFx0Z2VucmVTaW1pbGFyaXR5OiBNYXRoLnJvdW5kKGdlbnJlU2ltaWxhcml0eSAqIDEwMClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIG1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkge1xuICAgICAgICByZXR1cm4gcmVsYXRlZEFydGlzdC5nZW5yZXNcbiAgICAgICAgICAgIC5maW5kKChnZW5yZSkgPT4gZ2VucmUgPT09IG1haW5BcnRpc3RHZW5yZSk7XG4gICAgfVxuIH0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuaW1wb3J0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyXCI7XG5pbXBvcnQgU2NlbmVDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0TGlzdENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtbGlzdC5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuaW1wb3J0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHAtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxTZWFyY2hDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U3BvdGlmeVBsYXllckNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdExpc3RDb250YWluZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0SW5mb0NvbXBvbmVudCh7YXJ0aXN0LCBpc0hpZGRlbn0pIHtcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIiBrZXk9e2dlbnJlfT57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBpbmZvLWNvbnRhaW5lciBtYWluJyA6ICdpbmZvLWNvbnRhaW5lciBtYWluJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyBtYWluXCI+e2FydGlzdC5uYW1lfTwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwb3B1bGFyaXR5XCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5Qb3B1bGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPnthcnRpc3QucG9wdWxhcml0eX08L3NwYW4+PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPntnZW5yZXN9PC9kaXY+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5leHBvcnQgY2xhc3MgQXJ0aXN0TGlzdENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdH1cblxuXHRoYW5kbGVHZXRBcnRpc3QoZXZ0LCBhcnRpc3RJZCkge1xuXHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KGFydGlzdElkKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgYXJ0aXN0cyA9IHRoaXMucHJvcHMudmlzaXRlZEFydGlzdHMubWFwKChhcnRpc3QpID0+IHtcblx0XHRcdGxldCBocmVmID0gJy9hcHAvIycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0LmlkKTtcblx0XHRcdGxldCBpbWdVcmwgPSBhcnRpc3QuaW1hZ2VzICYmIGFydGlzdC5pbWFnZXMubGVuZ3RoID8gYXJ0aXN0LmltYWdlc1thcnRpc3QuaW1hZ2VzLmxlbmd0aCAtIDFdLnVybCA6ICcnO1xuXHRcdFx0bGV0IGltZ1N0eWxlID0geyBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpbWdVcmx9KWAgfTtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0XCIga2V5PXthcnRpc3QuaWR9PlxuXHRcdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiXG5cdFx0XHRcdFx0ICAgb25DbGljaz17KGV2ZW50KSA9PiB7IHRoaXMuaGFuZGxlR2V0QXJ0aXN0KGV2ZW50LCBhcnRpc3QuaWQpIH19PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlLWhvbGRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzdHlsZT17aW1nU3R5bGV9IC8+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpXG5cdFx0fSk7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IHRoaXMucHJvcHMuaXNIaWRkZW4gPyAnaGlkZGVuIGFydGlzdC1uYXZpZ2F0aW9uJyA6ICdhcnRpc3QtbmF2aWdhdGlvbic7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSByZWY9e2VsZW0gPT4gdGhpcy5hcnRpc3RMaXN0RG9tID0gZWxlbX0+XG5cdFx0XHRcdHthcnRpc3RzfVxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbFRvcCA9IHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxIZWlnaHQ7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbFRvcCA9IHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxIZWlnaHQ7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50KHtyZWxhdGVkQXJ0aXN0LCBoaWRlUmVsYXRlZCwgaGlkZUluZm99KSB7XG5cdGNvbnN0IGhpZGRlbkNsYXNzID0gaGlkZVJlbGF0ZWQgfHwgaGlkZUluZm8gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIHJlbGF0ZWQnIDogJ2luZm8tY29udGFpbmVyIHJlbGF0ZWQnO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtoaWRkZW5DbGFzc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyByZWxhdGVkXCI+e3JlbGF0ZWRBcnRpc3QubmFtZX08L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57cmVsYXRlZEFydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5HZW5yZSBzaW1pbGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LmdlbnJlU2ltaWxhcml0eX0lPC9zcGFuPjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuLi9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge1NwaGVyZXNTY2VuZX0gZnJvbSBcIi4uL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzc1wiO1xuaW1wb3J0IHtyZWxhdGVkQ2xpY2t9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTY2VuZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiIHJlZj17ZWxlbSA9PiB0aGlzLnNjZW5lRG9tID0gZWxlbX0gLz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKS50aGVuKCgpID0+IHsgLy8gbG9hZCB0aGUgZm9udCBmaXJzdCAoYXN5bmMpXG5cdFx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0fVxuXG5cdGluaXRTY2VuZSgpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNsZWFyR3JhcGgoKTtcblx0XHRcdHRoaXMuc2NlbmUuY2xlYXJBZGRyZXNzKCk7XG5cdFx0fVxuXHR9XG5cblx0aGFuZGxlRXZlbnQoZXZlbnQpIHtcblx0XHR0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcblx0fVxuXG5cdGNsaWNrKGV2ZW50KSB7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAoIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VDbGljayhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlbW92ZShldmVudCkge1xuXHRcdGxldCBpc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAodGhpcy5tb3VzZUlzRG93bikge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlRHJhZyhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KTtcblx0XHR9XG5cdFx0aWYgKGlzT3ZlclJlbGF0ZWQgJiYgIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBwb2ludGVyJztcblx0XHR9XG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiYmVkJztcblx0XHR9XG5cdH1cblxuXHRtb3VzZWRvd24oKSB7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IHRydWU7XG5cdH1cblxuXHRtb3VzZXVwKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSBmYWxzZTtcblx0fVxuXG5cdG1vdXNld2hlZWwoZXZlbnQpIHtcblx0XHRzd2l0Y2ggKFNjZW5lVXRpbHMuc2lnbihldmVudC53aGVlbERlbHRhWSkpIHtcblx0XHRcdGNhc2UgLTE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnb3V0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ2luJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLnNjZW5lLnVwZGF0ZUNhbWVyYUFzcGVjdCgpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgYXJ0aXN0LCBoYW5kbGVTZWFyY2gsIGhhbmRsZVNlYXJjaFRlcm1VcGRhdGUsIGNsZWFyU2Vzc2lvbn0pIHtcbiAgICBjb25zdCBjbGVhckJ0bkNsYXNzID0gYXJ0aXN0LmlkID8gJ2NsZWFyLXNlc3Npb24nIDogJ2hpZGRlbiBjbGVhci1zZXNzaW9uJztcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPXtjbGVhckJ0bkNsYXNzfSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KGV2dCkgPT4gY2xlYXJTZXNzaW9uKGV2dCl9PkNsZWFyIFNlc3Npb248L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGNsYXNzIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcih7YWxidW1DbGlja0hhbmRsZXJ9KSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFsYnVtQ2xpY2tIYW5kbGVyID0gYWxidW1DbGlja0hhbmRsZXI7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgeyBkaXNwbGF5QWxidW1JbmRleCwgZGlzcGxheUFydGlzdCwgaXNIaWRkZW4gfSA9IHRoaXMucHJvcHM7XG5cdFx0Y29uc3QgZW1iZWRVcmwgPSAnaHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL2VtYmVkP3VyaT1zcG90aWZ5OmFsYnVtOic7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBzcG90aWZ5LXBsYXllci1jb250YWluZXInIDogJ3Nwb3RpZnktcGxheWVyLWNvbnRhaW5lcic7XG5cdFx0Y29uc3QgYWxidW1zID0gZGlzcGxheUFydGlzdC5hbGJ1bXM7XG5cdFx0bGV0IGFydGlzdEVtYmVkVXJsLFxuXHRcdFx0aUZyYW1lTWFya3VwID0gJycsXG5cdFx0XHRhbGJ1bXNMaXN0TWFya3VwID0gJycsXG5cdFx0XHRhbGJ1bUlkO1xuXHRcdFxuXHRcdGlmIChhbGJ1bXMgJiYgYWxidW1zLmxlbmd0aCkge1xuXHRcdFx0YWxidW1JZCA9IGFsYnVtc1tkaXNwbGF5QWxidW1JbmRleF0uaWQ7XG5cdFx0XHRhcnRpc3RFbWJlZFVybCA9IGAke2VtYmVkVXJsfSR7YWxidW1JZH1gO1xuXHRcdFx0aUZyYW1lTWFya3VwID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdFx0PGlmcmFtZSBzcmM9e2FydGlzdEVtYmVkVXJsfSB3aWR0aD1cIjMwMFwiIGhlaWdodD1cIjM4MFwiIGZyYW1lQm9yZGVyPVwiMFwiIGFsbG93VHJhbnNwYXJlbmN5PVwidHJ1ZVwiLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdFx0YWxidW1zTGlzdE1hcmt1cCA9IGFsYnVtcy5tYXAoKGFsYnVtLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYWxidW1cIiBrZXk9e2FsYnVtLmlkfT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgb25DbGljaz17KGV2dCkgPT4gdGhpcy5hbGJ1bUNsaWNrSGFuZGxlcihldnQsIGluZGV4KX0+e2FsYnVtLm5hbWV9PC9hPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhbGJ1bXMtbGlzdFwiPlxuXHRcdFx0XHRcdHthbGJ1bXNMaXN0TWFya3VwfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxufVxuIiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZEFydGlzdENsaWNrZWQ6IDB4ZWM5MjUzLFxuXHRyZWxhdGVkTGluZUpvaW46IDB4ZmZmZmNjLFxuXHRtYWluQXJ0aXN0OiAweGZmY2MwMCxcblx0bWFpbkFydGlzdEhvdmVyOiAweGZmZjJiYyxcblx0dGV4dE91dGVyOiAweGZmZmZjYyxcblx0dGV4dElubmVyOiAweDAwMDAzM1xufTsiLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RJbmZvQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0LFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBBcnRpc3RJbmZvQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0TGlzdENvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvYXJ0aXN0LWxpc3QuY29tcG9uZW50XCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dmlzaXRlZEFydGlzdHM6IHN0YXRlLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5cbmNvbnN0IEFydGlzdExpc3RDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0TGlzdENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdExpc3RDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHJlbGF0ZWRBcnRpc3Q6IHN0YXRlLnJlbGF0ZWRBcnRpc3QsXG5cdFx0aGlkZVJlbGF0ZWQ6IHN0YXRlLmhpZGVSZWxhdGVkLFxuXHRcdGhpZGVJbmZvOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQge2NsZWFyU2Vzc2lvbiwgdXBkYXRlU2VhcmNoVGVybX0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm0sXG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBhcnRpc3ROYW1lKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2Uuc2VhcmNoKGFydGlzdE5hbWUpO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fSxcblx0XHRjbGVhclNlc3Npb246IChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZGlzcGF0Y2goY2xlYXJTZXNzaW9uKCkpO1xuXHRcdH1cblx0fVxufTtcblxuY29uc3QgU2VhcmNoQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoU2VhcmNoSW5wdXRDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTcG90aWZ5UGxheWVyQ29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnRcIjtcbmltcG9ydCB7bG9hZEFsYnVtfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm8sXG5cdFx0ZGlzcGxheUFydGlzdDogc3RhdGUuZGlzcGxheUFydGlzdCxcblx0XHRkaXNwbGF5QWxidW1JbmRleDogc3RhdGUuZGlzcGxheUFsYnVtSW5kZXhcblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YWxidW1DbGlja0hhbmRsZXI6IChldnQsIGFsYnVtSW5kZXgpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZGlzcGF0Y2gobG9hZEFsYnVtKGFsYnVtSW5kZXgpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTcG90aWZ5UGxheWVyQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU3BvdGlmeVBsYXllckNvbnRhaW5lcjtcbiIsImltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7YXJ0aXN0RGF0YUF2YWlsYWJsZSwgZGlzcGxheUFsYnVtcywgZGlzcGxheUFydGlzdH0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIE11c2ljRGF0YVNlcnZpY2Uge1xuXHRzdGF0aWMgc2VhcmNoKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdERhdGFBdmFpbGFibGUoanNvbikpKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRBcnRpc3QoYXJ0aXN0SWQpIHtcblx0XHRsZXQgYXJ0aXN0VVJMID0gJy9hcGkvYXJ0aXN0LycgKyBhcnRpc3RJZDtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKGFydGlzdFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGZldGNoRGlzcGxheUFsYnVtcyhhcnRpc3QpIHtcblx0XHRsZXQgYXJ0aXN0VVJMID0gJy9hcGkvYWxidW1zLycgKyBhcnRpc3QuaWQ7XG5cdFx0aWYgKGFydGlzdC5hbGJ1bXMgJiYgYXJ0aXN0LmFsYnVtcy5sZW5ndGgpIHsgLy8gd2UndmUgYWxyZWFkeSBkb3dubG9hZGVkIHRoZSBhbGJ1bSBsaXN0IHNvIGp1c3QgdHJpZ2dlciBVSSB1cGRhdGVcblx0XHRcdCByZXR1cm4gc3RvcmUuZGlzcGF0Y2goZGlzcGxheUFydGlzdChhcnRpc3QpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2luZG93LmZldGNoKGFydGlzdFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4ge1xuXHRcdFx0YXJ0aXN0LmFsYnVtcyA9IGpzb247XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChkaXNwbGF5QXJ0aXN0KGFydGlzdCkpXG5cdFx0fSk7XG5cdH1cbn0iLCJleHBvcnQgY29uc3QgQVJUSVNUX0RBVEFfQVZBSUxBQkxFID0gJ0FSVElTVF9EQVRBX0FWQUlMQUJMRSc7XG5leHBvcnQgY29uc3QgVVBEQVRFX0RJU1BMQVlfQVJUSVNUID0gJ1VQREFURV9ESVNQTEFZX0FSVElTVCc7XG5leHBvcnQgY29uc3QgU0VBUkNIX1RFUk1fVVBEQVRFID0gJ1NFQVJDSF9URVJNX1VQREFURSc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9DTElDSyA9ICdSRUxBVEVEX0NMSUNLJztcbmV4cG9ydCBjb25zdCBTSE9XX1JFTEFURURfSU5GTyA9ICdTSE9XX1JFTEFURURfSU5GTyc7XG5leHBvcnQgY29uc3QgSElERV9SRUxBVEVEX0lORk8gPSAnSElERV9SRUxBVEVEX0lORk8nO1xuZXhwb3J0IGNvbnN0IENMRUFSX1NFU1NJT04gPSAnQ0xFQVJfU0VTU0lPTic7XG5leHBvcnQgY29uc3QgTE9BRF9BTEJVTSA9ICdMT0FEX0FMQlVNJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFydGlzdERhdGFBdmFpbGFibGUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9EQVRBX0FWQUlMQUJMRSxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlBcnRpc3QoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFVQREFURV9ESVNQTEFZX0FSVElTVCxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlYXJjaFRlcm0oc2VhcmNoVGVybSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNFQVJDSF9URVJNX1VQREFURSxcblx0XHRzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0ZWRDbGljayhyZWxhdGVkQXJ0aXN0KSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogUkVMQVRFRF9DTElDSyxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dSZWxhdGVkKHJlbGF0ZWRBcnRpc3QpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTSE9XX1JFTEFURURfSU5GTyxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVSZWxhdGVkKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEhJREVfUkVMQVRFRF9JTkZPLFxuXHRcdGRhdGE6IG51bGxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IENMRUFSX1NFU1NJT05cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEFsYnVtKGFsYnVtSWQpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBMT0FEX0FMQlVNLFxuXHRcdGRhdGE6IGFsYnVtSWRcblx0fVxufVxuIiwiaW1wb3J0IHtcblx0U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEUsIFJFTEFURURfQ0xJQ0ssXG5cdENMRUFSX1NFU1NJT04sIFVQREFURV9ESVNQTEFZX0FSVElTVCwgU0hPV19SRUxBVEVEX0lORk8sIEhJREVfUkVMQVRFRF9JTkZPLCBMT0FEX0FMQlVNXG59IGZyb20gJy4uL2FjdGlvbnMnXG5sZXQgaW5pdGlhbFN0YXRlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc3RhdGUnKTtcbmNvbnN0IGVtcHR5QXJ0aXN0ID0ge1xuXHRpZDogJycsXG5cdG5hbWU6ICcnLFxuXHRpbWdVcmw6ICcnLFxuXHRnZW5yZXM6IFtdLFxuXHRwb3B1bGFyaXR5OiAwLFxuXHRpbWFnZXM6IFtdLFxuXHRhbGJ1bXM6IFtdXG59O1xuY29uc3QgZW1wdHlTdGF0ZSA9IHtcblx0YXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0cmVsYXRlZEFydGlzdDogZW1wdHlBcnRpc3QsXG5cdHNlYXJjaFRlcm06ICcnLFxuXHR2aXNpdGVkQXJ0aXN0czogW10sXG5cdGhpZGVJbmZvOiB0cnVlLFxuXHRzaG93UmVsYXRlZDogZmFsc2UsXG5cdGRpc3BsYXlBcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRkaXNwbGF5QWxidW1JbmRleDogMFxufTtcblxuaWYgKCFpbml0aWFsU3RhdGUpIHtcblx0aW5pdGlhbFN0YXRlID0ge1xuXHRcdC4uLmVtcHR5U3RhdGVcblx0fTtcbn0gZWxzZSB7XG5cdGluaXRpYWxTdGF0ZSA9IEpTT04ucGFyc2UoaW5pdGlhbFN0YXRlKTtcbn1cblxuY29uc3QgYXBwU3RhdGUgPSAoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikgPT4ge1xuXHRsZXQgbmV3U3RhdGU7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLnNlYXJjaFRlcm0sXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBUlRJU1RfREFUQV9BVkFJTEFCTEU6XG5cdFx0XHRpZiAoYWN0aW9uLmRhdGEuaWQpIHtcblx0XHRcdFx0bGV0IGFscmVhZHlWaXNpdGVkID0gISFzdGF0ZS52aXNpdGVkQXJ0aXN0cy5sZW5ndGhcblx0XHRcdFx0XHQmJiBzdGF0ZS52aXNpdGVkQXJ0aXN0cy5zb21lKChhcnRpc3QpID0+IGFydGlzdC5pZCA9PT0gYWN0aW9uLmRhdGEuaWQpO1xuXHRcdFx0XHRsZXQgdmlzaXRlZEFydGlzdHMgPSBhbHJlYWR5VmlzaXRlZCA/IHN0YXRlLnZpc2l0ZWRBcnRpc3RzIDogWy4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLCBhY3Rpb24uZGF0YV07XG5cdFx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRcdGFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0ZGlzcGxheUFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHRcdC4uLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLmRhdGEubmFtZSxcblx0XHRcdFx0XHRoaWRlSW5mbzogZmFsc2UsXG5cdFx0XHRcdFx0aGlkZVJlbGF0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdFx0Li4uZW1wdHlBcnRpc3Rcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ05vIEFQSSBkYXRhIGF2YWlsYWJsZSBmb3IgZ2l2ZW4gYXJ0aXN0LiBOZWVkIHRvIHJlZnJlc2ggQVBJIHNlc3Npb24/Jyk7XG5cdFx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVQREFURV9ESVNQTEFZX0FSVElTVDpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0ZGlzcGxheUFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBMT0FEX0FMQlVNOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRkaXNwbGF5QWxidW1JbmRleDogYWN0aW9uLmRhdGFcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFNIT1dfUkVMQVRFRF9JTkZPOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0aGlkZVJlbGF0ZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBISURFX1JFTEFURURfSU5GTzpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdC4uLmVtcHR5QXJ0aXN0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhpZGVSZWxhdGVkOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBDTEVBUl9TRVNTSU9OOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLmVtcHR5U3RhdGVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0bmV3U3RhdGUgPSBzdGF0ZTtcblx0fVxuXHR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnc3RhdGUnLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSkpO1xuXHRyZXR1cm4gbmV3U3RhdGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhcHBTdGF0ZTsiLCJpbXBvcnQge2NyZWF0ZVN0b3JlfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgYXBwU3RhdGUgZnJvbSBcIi4vcmVkdWNlcnMvYXBwLXN0YXRlXCI7XG5cbmV4cG9ydCBsZXQgc3RvcmUgPSBjcmVhdGVTdG9yZShcblx0YXBwU3RhdGUsXG5cdHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fICYmIHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fKClcbik7XG5cblxuIl19
