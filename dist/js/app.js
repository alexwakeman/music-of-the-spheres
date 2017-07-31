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
var RELATED_POSTIONS = [new _three.Vector3(1, 0, 0), new _three.Vector3(-1, 0, 0), new _three.Vector3(0, 1, 0), new _three.Vector3(0, -1, 0), new _three.Vector3(0, 0, 1), new _three.Vector3(0, 0, -1)];

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
			sphere.colours = {};
			sphere.colours.default = _colours.Colours.mainArtist;
			sphere.colours.hover = _colours.Colours.mainArtistHover;
			sphere.colours.selected = _colours.Colours.mainArtist;
			SceneUtils.addText(artist.name, MAIN_ARTIST_FONT_SIZE, sphere, _props.MAIN_ARTIST_TEXT);
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
				relatedArtistSphere.type = _props.RELATED_ARTIST_SPHERE;
				relatedArtistSphere.artistObj = relatedArtist;
				relatedArtistSphere.artistObj.genreSimilarity = genreMetrics.genreSimilarity;
				relatedArtistSphere.distance = genreMetrics.lineLength;
				relatedArtistSphere.radius = radius;
				relatedArtistSphere.colours = {};
				relatedArtistSphere.colours.default = _colours.Colours.relatedArtist;
				relatedArtistSphere.colours.hover = _colours.Colours.relatedArtistHover;
				relatedArtistSphere.colours.selected = _colours.Colours.relatedArtistClicked;
				SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, sphereFaceIndex);
				SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
				SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere, _props.RELATED_ARTIST_TEXT);
				relatedArtistsSphereArray.push(relatedArtistSphere);
				sphereFaceIndex += step;
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
		this.hoveredSphere = null;
		this.selectedSphere = null;

		// attach to dom
		_props.Props.renderer.setSize(window.innerWidth, window.innerHeight);
		_props.Props.renderer.domElement.id = 'renderer';
		_props.Props.container = container;
		_props.Props.container.appendChild(_props.Props.renderer.domElement);

		// init the scene
		_props.Props.graphContainer.position.set(0, 0, 0);
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
			this.unHighlightHoveredSphere();
			if (intersects.length) {
				selected = intersects[0].object;
				switch (selected.type) {
					case _props.MAIN_ARTIST_SPHERE:
					case _props.RELATED_ARTIST_SPHERE:
						isOverRelated = true;
						this.hoveredSphere = selected;
						this.highlightHoveredSphere();
						break;
					case _props.MAIN_ARTIST_TEXT:
					case _props.RELATED_ARTIST_TEXT:
						isOverRelated = true;
						this.hoveredSphere = selected.parent;
						this.highlightHoveredSphere();
						break;
				}
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
			return isOverRelated;
		}
	}, {
		key: "unHighlightHoveredSphere",
		value: function unHighlightHoveredSphere() {
			if (!this.hoveredSphereIsSelected()) {
				this.hoveredSphere.material.color.setHex(this.hoveredSphere.colours.default);
				this.hoveredSphere = null;
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
			return !(this.selectedSphere && this.hoveredSphere && this.hoveredSphere.id !== this.selectedSphere.id);
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
			if (!this.selectedSphere) {
				return;
			}
			this.selectedSphere.material.color.setHex(this.selectedSphere.colours.default);
			this.selectedSphere = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcHAtc3RhdGUuanMiLCJzcmMvanMvc3RhdGUvc3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOztJQUFZLEs7O0FBQ1o7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsbUJBQVMsTUFBVCxDQUNDO0FBQUE7QUFBQSxHQUFVLG1CQUFWO0FBQ0M7QUFERCxDQURELEVBSUMsU0FBUyxjQUFULENBQXdCLE1BQXhCLENBSkQ7Ozs7Ozs7Ozs7cWpCQ05BOzs7Ozs7QUFJQTs7QUFDQTs7QUFDQTs7SUFBWSxLOzs7Ozs7QUFFWixJQUFNLG1CQUFtQixrQkFBekI7QUFDQSxJQUFNLFVBQVUsU0FBaEI7QUFDQSxJQUFNLGFBQWE7QUFDbEIsT0FBTTtBQURZLENBQW5COztJQUlhLFMsV0FBQSxTO0FBQ1Qsc0JBQWM7QUFBQTs7QUFDaEIsT0FBSyxHQUFMLEdBQVcsVUFBWDtBQUNBLE9BQUssT0FBTDtBQUNBOzs7OzRCQUVTO0FBQUE7O0FBQ1QsZ0JBQU0sRUFBTixHQUFXLEtBQUssR0FBTCxFQUFYO0FBQ0EsUUFBSyxZQUFMO0FBQ0EsZ0JBQU0sUUFBTixDQUFlLE1BQWYsQ0FBc0IsYUFBTSxLQUE1QixFQUFtQyxhQUFNLE1BQXpDO0FBQ0EsVUFBTyxxQkFBUCxDQUE2QixZQUFNO0FBQ2xDLGlCQUFNLEVBQU4sR0FBVyxhQUFNLEVBQWpCO0FBQ0EsVUFBSyxPQUFMLENBQWEsSUFBYjtBQUNBLElBSEQ7QUFJQTs7O2lDQUVjO0FBQ2QsV0FBUSxLQUFLLEdBQUwsQ0FBUyxJQUFqQjtBQUNDLFNBQUssZ0JBQUw7QUFDQyxVQUFLLHlCQUFMO0FBQ0E7QUFDRCxTQUFLLE9BQUw7QUFDQyxVQUFLLGNBQUw7QUFDQTtBQU5GO0FBUUE7Ozs4Q0FFMkI7QUFDM0IsT0FBTSxZQUFZLFNBQVMsS0FBSyxHQUFMLENBQVMsV0FBbEIsTUFBbUMsQ0FBckQ7QUFDQSxPQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNmLFNBQUssVUFBTDtBQUNBLElBRkQsTUFHSztBQUNKLFNBQUssWUFBTDtBQUNBO0FBQ0Q7OzsrQkFFWTtBQUNaLE9BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsUUFBZCxDQUF1QixLQUFLLEdBQUwsQ0FBUyxXQUFoQyxDQUFWO0FBQ0EsUUFBSyxHQUFMLENBQVMsUUFBVCxDQUFrQixRQUFsQixDQUEyQixJQUEzQixDQUFnQyxDQUFoQztBQUNBLFFBQUssR0FBTCxDQUFTLFdBQVQsSUFBd0IsSUFBeEI7QUFDQTs7O2lDQUVjO0FBQ2QsUUFBSyxHQUFMLENBQVMsUUFBVCxJQUFxQixLQUFLLEdBQUwsQ0FBUyxRQUFULEVBQXJCO0FBQ0EsUUFBSyxHQUFMLEdBQVcsVUFBWDtBQUNBOzs7c0NBRW1CLFEsRUFBVSxRLEVBQVU7QUFDcEMsUUFBSyxHQUFMLEdBQVcsRUFBWDtBQUNBLFFBQUssR0FBTCxDQUFTLElBQVQsR0FBZ0IsZ0JBQWhCO0FBQ0gsUUFBSyxHQUFMLENBQVMsQ0FBVCxHQUFhLEdBQWI7QUFDQSxRQUFLLEdBQUwsQ0FBUyxXQUFULEdBQXVCLEdBQXZCO0FBQ0EsUUFBSyxHQUFMLENBQVMsUUFBVCxHQUFvQixRQUFwQjtBQUNBLFFBQUssR0FBTCxDQUFTLFFBQVQsR0FBb0IsUUFBcEI7QUFDQSxRQUFLLEdBQUwsQ0FBUyxLQUFULEdBQWlCLEtBQWpCO0FBQ0EsUUFBSyxHQUFMLENBQVMsSUFBVCxHQUFnQixJQUFJLE1BQU0sZ0JBQVYsQ0FBMkIsQ0FDMUMsU0FBUyxRQUFULENBQWtCLEtBQWxCLEVBRDBDLEVBRTFDLGFBQU0sTUFBTixDQUFhLFFBQWIsQ0FBc0IsS0FBdEIsRUFGMEMsQ0FBM0IsQ0FBaEI7QUFJQTs7QUFFRDs7Ozs7OzttQ0FJaUI7QUFDaEIsT0FBTSxzQkFBc0IsS0FBSyxxQkFBTCxFQUE1QjtBQUNBLGdCQUFNLE1BQU4sQ0FBYSxRQUFiLENBQXNCLEdBQXRCLENBQ0Msb0JBQW9CLENBQXBCLEdBQXdCLGFBQU0sY0FEL0IsRUFFQyxvQkFBb0IsQ0FBcEIsR0FBd0IsYUFBTSxjQUYvQixFQUdDLG9CQUFvQixDQUFwQixHQUF3QixhQUFNLGNBSC9CO0FBS0EsZ0JBQU0sTUFBTixDQUFhLE1BQWIsQ0FBb0IsYUFBTSxZQUExQjtBQUNBO0FBQ0E7QUFDQSxnQkFBTSxjQUFOLENBQXFCLFFBQXJCLENBQThCLFVBQUMsR0FBRCxFQUFTO0FBQ3RDLFFBQUksSUFBSSxJQUFKLGdDQUFpQyxJQUFJLElBQUosK0JBQXJDLEVBQXVFO0FBQ3RFLFNBQUksYUFBYSxhQUFNLE1BQU4sQ0FBYSxRQUFiLENBQXNCLEtBQXRCLEdBQThCLFNBQTlCLEVBQWpCO0FBQ0EsU0FBSSxRQUFKLENBQWEsR0FBYixDQUNDLFdBQVcsQ0FBWCxHQUFlLElBQUksTUFBSixDQUFXLE1BRDNCLEVBRUMsV0FBVyxDQUFYLEdBQWUsSUFBSSxNQUFKLENBQVcsTUFGM0IsRUFHQyxXQUFXLENBQVgsR0FBZSxJQUFJLE1BQUosQ0FBVyxNQUgzQjtBQUtBLFNBQUksTUFBSixDQUFXLGFBQU0sY0FBTixDQUFxQixZQUFyQixDQUFrQyxhQUFNLE1BQU4sQ0FBYSxRQUEvQyxDQUFYO0FBQ0E7QUFDRCxJQVZEO0FBV0EsUUFBSyxXQUFMLENBQWlCLE1BQWpCO0FBQ0E7OzswQ0FFdUI7QUFDdkIsT0FBSSw0QkFBSjtBQUNBLE9BQU0sa0JBQWtCLGFBQU0sYUFBTixJQUF1QixhQUFNLGFBQXJEO0FBQ0EsT0FBTSxrQkFBa0IsQ0FBQyxlQUF6QjtBQUNBLE9BQUksYUFBTSxrQkFBTixJQUE0QixlQUFoQyxFQUFpRDtBQUNoRCxpQkFBTSxjQUFOLENBQXFCLENBQXJCLElBQTBCLGFBQU0sTUFBaEM7QUFDQSxJQUZELE1BR0ssSUFBSSxDQUFDLGFBQU0sa0JBQVAsSUFBNkIsZUFBakMsRUFBa0Q7QUFDdEQsaUJBQU0sY0FBTixDQUFxQixDQUFyQixJQUEwQixhQUFNLE1BQWhDO0FBQ0E7O0FBRUQsT0FBSSxhQUFNLGtCQUFOLElBQTRCLGVBQWhDLEVBQWlEO0FBQ2hELGlCQUFNLGNBQU4sQ0FBcUIsQ0FBckIsSUFBMEIsYUFBTSxNQUFoQztBQUNBLElBRkQsTUFHSyxJQUFJLENBQUMsYUFBTSxrQkFBUCxJQUE2QixlQUFqQyxFQUFrRDtBQUN0RCxpQkFBTSxjQUFOLENBQXFCLENBQXJCLElBQTBCLGFBQU0sTUFBaEM7QUFDQTtBQUNELHlCQUFzQix1QkFBVyxxQkFBWCxDQUFpQyxhQUFNLE1BQXZDLENBQXRCO0FBQ0EsdUJBQW9CLFlBQXBCLENBQWlDLGFBQU0sY0FBdkM7QUFDQSxVQUFPLG1CQUFQO0FBQ0E7Ozs4QkFFVyxNLEVBQVE7QUFDbkIsT0FBSSxhQUFNLE1BQU4sR0FBZSxLQUFuQixFQUEwQjtBQUN6QixpQkFBTSxNQUFOLElBQWdCLE1BQWhCO0FBQ0E7O0FBRUQsT0FBSSxhQUFNLE1BQU4sR0FBZSxLQUFuQixFQUEwQjtBQUN6QixpQkFBTSxNQUFOLElBQWdCLE1BQWhCO0FBQ0E7QUFDRDs7Ozs7Ozs7Ozs7Ozs7QUN0SUY7O0lBQVksSzs7OztBQUNMLElBQU0sd0JBQVE7QUFDcEIsV0FBVSxJQUFJLE1BQU0sYUFBVixDQUF3QixFQUFDLFdBQVcsSUFBWixFQUFrQixPQUFPLElBQXpCLEVBQXhCLENBRFU7QUFFcEIsUUFBTyxJQUFJLE1BQU0sS0FBVixFQUZhO0FBR3BCLFNBQVEsSUFBSSxNQUFNLGlCQUFWLENBQTRCLEVBQTVCLEVBQWdDLE9BQU8sVUFBUCxHQUFvQixPQUFPLFdBQTNELEVBQXdFLEdBQXhFLEVBQTZFLE1BQTdFLENBSFk7QUFJcEIsaUJBQWdCLElBQUksTUFBTSxRQUFWLEVBSkk7QUFLcEIsaUJBQWdCLElBQUksTUFBTSxLQUFWLENBQWdCLENBQWhCLEVBQW1CLENBQUMsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FMSTtBQU1wQixlQUFjLElBQUksTUFBTSxPQUFWLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBTk07QUFPcEIsaUJBQWdCLElBUEk7O0FBU3BCLEtBQUksR0FUZ0IsRUFTWDtBQUNULEtBQUksR0FWZ0IsRUFVWDtBQUNULFNBQVEsS0FYWTtBQVlwQixTQUFRLEtBWlk7QUFhcEIsZ0JBQWUsR0FiSztBQWNwQixnQkFBZSxHQWRLO0FBZXBCLHFCQUFvQixLQWZBO0FBZ0JwQixxQkFBb0IsS0FoQkE7QUFpQnBCLFlBQVcsSUFBSSxNQUFNLFNBQVYsRUFqQlM7QUFrQnBCLGNBQWEsSUFBSSxNQUFNLE9BQVYsRUFsQk87O0FBb0JwQix1QkFBc0IsRUFwQkY7QUFxQnBCLG1CQUFrQixFQXJCRTtBQXNCcEIsdUJBQXNCLEVBQUMsSUFBSSxDQUFMO0FBdEJGLENBQWQ7O0FBeUJBLElBQU0sa0RBQXFCLG9CQUEzQjtBQUNBLElBQU0sd0RBQXdCLHVCQUE5QjtBQUNBLElBQU0sOENBQW1CLGtCQUF6QjtBQUNBLElBQU0sb0RBQXNCLHFCQUE1QjtBQUNBLElBQU0sNENBQWtCLGlCQUF4Qjs7Ozs7Ozs7Ozs7O0FDOUJQOztJQUFZLEs7O0FBQ1o7O0FBQ0E7O0FBSUE7Ozs7OztBQUdBLElBQUksbUJBQUo7QUFDQSxJQUFNLHdCQUF3QixFQUE5QjtBQUNBLElBQU0sMkJBQTJCLEVBQWpDO0FBQ0EsSUFBTSxnQkFBZ0IsQ0FBdEI7QUFDQSxJQUFNLG1CQUFtQixDQUN4QixtQkFBWSxDQUFaLEVBQWUsQ0FBZixFQUFrQixDQUFsQixDQUR3QixFQUNGLG1CQUFZLENBQUMsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixDQURFLEVBRXhCLG1CQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQWxCLENBRndCLEVBRUYsbUJBQVksQ0FBWixFQUFlLENBQUMsQ0FBaEIsRUFBbUIsQ0FBbkIsQ0FGRSxFQUd4QixtQkFBWSxDQUFaLEVBQWUsQ0FBZixFQUFrQixDQUFsQixDQUh3QixFQUdGLG1CQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQUMsQ0FBbkIsQ0FIRSxDQUF6Qjs7SUFNTSxVOzs7Ozs7O3lCQUNTO0FBQ2IsVUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3ZDLFFBQU0sU0FBUyxJQUFJLE1BQU0sVUFBVixFQUFmO0FBQ0EsV0FBTyxJQUFQLENBQVksNkNBQVosRUFBMkQsVUFBQyxJQUFELEVBQVU7QUFDcEUsa0JBQWEsSUFBYjtBQUNBO0FBQ0EsS0FIRCxFQUdHLFlBQUksQ0FBRSxDQUhULEVBR1csTUFIWDtBQUlBLElBTk0sQ0FBUDtBQU9BO0FBQ0Q7Ozs7Ozs7Ozs7d0JBT2EsQyxFQUFHLEMsRUFBRyxDLEVBQUc7QUFDckIsVUFBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQVosQ0FBWixDQUFQO0FBQ0E7O0FBRUQ7Ozs7Ozs7O3VCQUtZLEMsRUFBRztBQUNkLFVBQU8sSUFBSSxDQUFKLEdBQVEsQ0FBUixHQUFZLElBQUksQ0FBSixHQUFRLENBQUMsQ0FBVCxHQUFhLENBQWhDO0FBQ0E7Ozt3Q0FFNEIsTSxFQUFRO0FBQ3BDLE9BQUksUUFBUSxPQUFPLEtBQVAsRUFBWjtBQUNBLE9BQUksSUFBSSxNQUFNLFVBQWQ7QUFDQSxPQUFJLFlBQVksS0FBSyxJQUFMLENBQVUsS0FBSyxHQUFMLENBQVMsRUFBRSxDQUFYLEVBQWMsQ0FBZCxJQUFtQixLQUFLLEdBQUwsQ0FBUyxFQUFFLENBQVgsRUFBYyxDQUFkLENBQW5CLEdBQXNDLEtBQUssR0FBTCxDQUFTLEVBQUUsQ0FBWCxFQUFjLENBQWQsQ0FBdEMsR0FBeUQsS0FBSyxHQUFMLENBQVMsRUFBRSxDQUFYLEVBQWMsQ0FBZCxDQUFuRSxDQUFoQjtBQUNBLEtBQUUsQ0FBRixJQUFPLFNBQVA7QUFDQSxLQUFFLENBQUYsSUFBTyxTQUFQO0FBQ0EsS0FBRSxDQUFGLElBQU8sU0FBUDtBQUNBLEtBQUUsQ0FBRixJQUFPLFNBQVA7QUFDQSxVQUFPLENBQVA7QUFDQTs7OzhDQUVrQztBQUNsQyxnQkFBTSxTQUFOLENBQWdCLGFBQWhCLENBQThCLGFBQU0sV0FBcEMsRUFBaUQsYUFBTSxNQUF2RDtBQUNBLFVBQU8sYUFBTSxTQUFOLENBQWdCLGdCQUFoQixDQUFpQyxhQUFNLGNBQU4sQ0FBcUIsUUFBdEQsRUFBZ0UsSUFBaEUsQ0FBUDtBQUNBOzs7aUNBRXFCLEssRUFBTztBQUM1QixVQUFPLElBQUksTUFBTSxPQUFWLENBQW1CLE1BQU0sT0FBTixHQUFnQixhQUFNLFFBQU4sQ0FBZSxVQUFmLENBQTBCLFdBQTNDLEdBQTBELENBQTFELEdBQThELENBQWhGLEVBQ04sRUFBRSxNQUFNLE9BQU4sR0FBZ0IsYUFBTSxRQUFOLENBQWUsVUFBZixDQUEwQixZQUE1QyxJQUE0RCxDQUE1RCxHQUFnRSxDQUQxRCxDQUFQO0FBRUE7Ozt5Q0FFNkIsTSxFQUFRO0FBQ3JDLE9BQUksU0FBUyx1QkFBVyxtQkFBWCxDQUErQixNQUEvQixDQUFiO0FBQ0EsT0FBSSxXQUFXLElBQUksTUFBTSxjQUFWLENBQXlCLE1BQXpCLEVBQWlDLEVBQWpDLEVBQXFDLEVBQXJDLENBQWY7QUFDQSxPQUFJLFNBQVMsSUFBSSxNQUFNLElBQVYsQ0FBZSxRQUFmLEVBQXlCLElBQUksTUFBTSxtQkFBVixDQUE4QixFQUFDLE9BQU8saUJBQVEsVUFBaEIsRUFBOUIsQ0FBekIsQ0FBYjtBQUNBLFVBQU8sU0FBUCxHQUFtQixNQUFuQjtBQUNBLFVBQU8sTUFBUCxHQUFnQixNQUFoQjtBQUNBLFVBQU8sSUFBUDtBQUNBLFVBQU8sT0FBUCxHQUFpQixFQUFqQjtBQUNBLFVBQU8sT0FBUCxDQUFlLE9BQWYsR0FBeUIsaUJBQVEsVUFBakM7QUFDQSxVQUFPLE9BQVAsQ0FBZSxLQUFmLEdBQXVCLGlCQUFRLGVBQS9CO0FBQ0EsVUFBTyxPQUFQLENBQWUsUUFBZixHQUEwQixpQkFBUSxVQUFsQztBQUNBLGNBQVcsT0FBWCxDQUFtQixPQUFPLElBQTFCLEVBQWdDLHFCQUFoQyxFQUF1RCxNQUF2RDtBQUNBLFVBQU8sTUFBUDtBQUNBOzs7dUNBRTJCLE0sRUFBUSxnQixFQUFrQjtBQUNyRCxPQUFJLDRCQUE0QixFQUFoQztBQUNBLE9BQUksc0JBQUo7QUFDQSxPQUFJLGtCQUFrQixDQUF0QjtBQUNBLE9BQUksYUFBYSxpQkFBaUIsUUFBakIsQ0FBMEIsS0FBMUIsQ0FBZ0MsTUFBaEMsR0FBeUMsQ0FBMUQ7QUFDQSxPQUFJLE9BQU8sS0FBSyxLQUFMLENBQVcsYUFBYSxhQUFiLEdBQTZCLENBQXhDLENBQVg7O0FBRUEsUUFBSyxJQUFJLElBQUksQ0FBUixFQUFXLE1BQU0sS0FBSyxHQUFMLENBQVMsYUFBVCxFQUF3QixPQUFPLE9BQVAsQ0FBZSxNQUF2QyxDQUF0QixFQUFzRSxJQUFJLEdBQTFFLEVBQStFLEdBQS9FLEVBQW9GO0FBQ25GLG9CQUFnQixPQUFPLE9BQVAsQ0FBZSxDQUFmLENBQWhCO0FBQ0EsUUFBSSxTQUFTLHVCQUFXLG1CQUFYLENBQStCLGFBQS9CLENBQWI7QUFDQSxRQUFJLFdBQVcsSUFBSSxNQUFNLGNBQVYsQ0FBeUIsTUFBekIsRUFBaUMsRUFBakMsRUFBcUMsRUFBckMsQ0FBZjtBQUNBLFFBQUksc0JBQXNCLElBQUksTUFBTSxJQUFWLENBQWUsUUFBZixFQUF5QixJQUFJLE1BQU0sbUJBQVYsQ0FBOEIsRUFBQyxPQUFPLGlCQUFRLGFBQWhCLEVBQTlCLENBQXpCLENBQTFCO0FBQ0EsUUFBSSxlQUFlLHVCQUFXLG9CQUFYLENBQWdDLE1BQWhDLEVBQXdDLGFBQXhDLENBQW5CO0FBQ0Esd0JBQW9CLElBQXBCO0FBQ0Esd0JBQW9CLFNBQXBCLEdBQWdDLGFBQWhDO0FBQ0Esd0JBQW9CLFNBQXBCLENBQThCLGVBQTlCLEdBQWdELGFBQWEsZUFBN0Q7QUFDQSx3QkFBb0IsUUFBcEIsR0FBK0IsYUFBYSxVQUE1QztBQUNBLHdCQUFvQixNQUFwQixHQUE2QixNQUE3QjtBQUNBLHdCQUFvQixPQUFwQixHQUE4QixFQUE5QjtBQUNBLHdCQUFvQixPQUFwQixDQUE0QixPQUE1QixHQUFzQyxpQkFBUSxhQUE5QztBQUNBLHdCQUFvQixPQUFwQixDQUE0QixLQUE1QixHQUFvQyxpQkFBUSxrQkFBNUM7QUFDQSx3QkFBb0IsT0FBcEIsQ0FBNEIsUUFBNUIsR0FBdUMsaUJBQVEsb0JBQS9DO0FBQ0EsZUFBVyxxQkFBWCxDQUFpQyxnQkFBakMsRUFBbUQsbUJBQW5ELEVBQXdFLGVBQXhFO0FBQ0EsZUFBVyw2QkFBWCxDQUF5QyxnQkFBekMsRUFBMkQsbUJBQTNEO0FBQ0EsZUFBVyxPQUFYLENBQW1CLGNBQWMsSUFBakMsRUFBdUMsd0JBQXZDLEVBQWlFLG1CQUFqRTtBQUNBLDhCQUEwQixJQUExQixDQUErQixtQkFBL0I7QUFDQSx1QkFBbUIsSUFBbkI7QUFDQTtBQUNELFVBQU8seUJBQVA7QUFDQTs7O3VDQUUyQixjLEVBQWdCLE0sRUFBUSxXLEVBQWE7QUFDaEUsT0FBTSxTQUFTLElBQUksTUFBTSxRQUFWLEVBQWY7QUFDQSxVQUFPLElBQVAsR0FBYyxRQUFkO0FBQ0EsVUFBTyxHQUFQLENBQVcsTUFBWDtBQUNBLE9BQUksV0FBSixFQUFpQjtBQUNoQixTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksWUFBWSxNQUFoQyxFQUF3QyxHQUF4QyxFQUE2QztBQUM1QyxZQUFPLEdBQVAsQ0FBVyxZQUFZLENBQVosQ0FBWDtBQUNBO0FBQ0Q7QUFDRCxrQkFBZSxHQUFmLENBQW1CLE1BQW5CO0FBQ0E7OztnREFFb0MsZ0IsRUFBa0IsYSxFQUFlO0FBQ3JFLE9BQUksV0FBVyxJQUFJLE1BQU0saUJBQVYsQ0FBNEIsRUFBQyxPQUFPLGlCQUFRLGVBQWhCLEVBQTVCLENBQWY7QUFDQSxPQUFJLFdBQVcsSUFBSSxNQUFNLFFBQVYsRUFBZjtBQUNBLE9BQUksYUFBSjtBQUNBLFlBQVMsUUFBVCxDQUFrQixJQUFsQixDQUF1QixJQUFJLE1BQU0sT0FBVixDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixDQUF4QixDQUF2QjtBQUNBLFlBQVMsUUFBVCxDQUFrQixJQUFsQixDQUF1QixjQUFjLFFBQWQsQ0FBdUIsS0FBdkIsRUFBdkI7QUFDQSxVQUFPLElBQUksTUFBTSxJQUFWLENBQWUsUUFBZixFQUF5QixRQUF6QixDQUFQO0FBQ0EsUUFBSyxJQUFMO0FBQ0Esb0JBQWlCLEdBQWpCLENBQXFCLElBQXJCO0FBQ0E7Ozt3Q0FFNEIsZ0IsRUFBa0IsYSxFQUFlLGUsRUFBaUI7QUFDOUUsT0FBSSx1QkFBdUIsaUJBQWlCLFFBQWpCLENBQTBCLEtBQTFCLENBQWdDLEtBQUssS0FBTCxDQUFXLGVBQVgsQ0FBaEMsRUFBNkQsTUFBN0QsQ0FBb0UsS0FBcEUsRUFBM0I7QUFDQSxpQkFBYyxRQUFkLENBQ0UsSUFERixDQUNPLHFCQUFxQixRQUFyQixDQUE4QixJQUFJLE1BQU0sT0FBVixDQUNsQyxjQUFjLFFBRG9CLEVBRWxDLGNBQWMsUUFGb0IsRUFHbEMsY0FBYyxRQUhvQixDQUE5QixDQURQO0FBUUE7OzswQkFFYyxLLEVBQU8sSSxFQUFNLE0sRUFBUSxRLEVBQVU7QUFDN0MsT0FBSSxnQkFBZ0IsSUFBSSxNQUFNLGlCQUFWLENBQTRCLEVBQUMsT0FBTyxpQkFBUSxTQUFoQixFQUE1QixDQUFwQjtBQUNBLE9BQUksZUFBZSxJQUFJLE1BQU0saUJBQVYsQ0FBNEIsRUFBQyxPQUFPLGlCQUFRLFNBQWhCLEVBQTVCLENBQW5CO0FBQ0EsT0FBSSxnQkFBZ0IsQ0FBQyxhQUFELEVBQWdCLFlBQWhCLENBQXBCO0FBQ0EsT0FBSSxXQUFXLElBQUksTUFBTSxZQUFWLENBQXVCLEtBQXZCLEVBQThCO0FBQzVDLFVBQU0sVUFEc0M7QUFFNUMsVUFBTSxJQUZzQztBQUc1QyxtQkFBZSxDQUg2QjtBQUk1QyxrQkFBYyxJQUo4QjtBQUs1QyxvQkFBZ0IsQ0FMNEI7QUFNNUMsZUFBVyxDQU5pQztBQU81QyxtQkFBZTtBQVA2QixJQUE5QixDQUFmO0FBU0EsT0FBSSxXQUFXLElBQUksTUFBTSxJQUFWLENBQWUsUUFBZixFQUF5QixhQUF6QixDQUFmO0FBQ0EsT0FBSSxhQUFhLGFBQU0sTUFBTixDQUFhLFFBQWIsQ0FBc0IsS0FBdEIsR0FBOEIsU0FBOUIsRUFBakI7QUFDQSxZQUFTLElBQVQsR0FBZ0IsUUFBaEI7QUFDQSxVQUFPLEdBQVAsQ0FBVyxRQUFYO0FBQ0EsWUFBUyxRQUFULENBQWtCLEdBQWxCLENBQ0MsV0FBVyxDQUFYLEdBQWUsT0FBTyxNQUR2QixFQUVDLFdBQVcsQ0FBWCxHQUFlLE9BQU8sTUFGdkIsRUFHQyxXQUFXLENBQVgsR0FBZSxPQUFPLE1BSHZCO0FBS0EsWUFBUyxNQUFULENBQWdCLGFBQU0sY0FBTixDQUFxQixZQUFyQixDQUFrQyxhQUFNLE1BQU4sQ0FBYSxRQUEvQyxDQUFoQjtBQUNBOzs7NkJBRWlCO0FBQ2pCLE9BQUksU0FBUyxJQUFJLE1BQU0sZ0JBQVYsQ0FBMkIsUUFBM0IsRUFBcUMsS0FBckMsQ0FBYjtBQUNBLE9BQUksU0FBUyxJQUFJLE1BQU0sZ0JBQVYsQ0FBMkIsUUFBM0IsRUFBcUMsR0FBckMsQ0FBYjtBQUNBLFVBQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixHQUFyQjtBQUNBLFVBQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixDQUFDLEdBQXRCO0FBQ0EsVUFBTyxRQUFQLENBQWdCLElBQWhCLENBQXFCLENBQUMsR0FBdEI7QUFDQSxnQkFBTSxLQUFOLENBQVksR0FBWixDQUFnQixNQUFoQjtBQUNBLGdCQUFNLEtBQU4sQ0FBWSxHQUFaLENBQWdCLE1BQWhCO0FBQ0E7Ozs7OztRQUdPLFUsR0FBQSxVOzs7Ozs7Ozs7O3FqQkMzTFQ7Ozs7Ozs7O0FBTUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7Ozs7SUFFYSxZLFdBQUEsWTtBQUNaLHVCQUFZLFNBQVosRUFBdUI7QUFBQTs7QUFDdEIsTUFBSSxpQkFBSjtBQUNBLE9BQUssU0FBTCxHQUFpQiwwQkFBakI7QUFDQSxPQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxPQUFLLGNBQUwsR0FBc0IsSUFBdEI7O0FBRUE7QUFDQSxlQUFNLFFBQU4sQ0FBZSxPQUFmLENBQXVCLE9BQU8sVUFBOUIsRUFBMEMsT0FBTyxXQUFqRDtBQUNBLGVBQU0sUUFBTixDQUFlLFVBQWYsQ0FBMEIsRUFBMUIsR0FBK0IsVUFBL0I7QUFDQSxlQUFNLFNBQU4sR0FBa0IsU0FBbEI7QUFDQSxlQUFNLFNBQU4sQ0FBZ0IsV0FBaEIsQ0FBNEIsYUFBTSxRQUFOLENBQWUsVUFBM0M7O0FBRUE7QUFDQSxlQUFNLGNBQU4sQ0FBcUIsUUFBckIsQ0FBOEIsR0FBOUIsQ0FBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsRUFBd0MsQ0FBeEM7QUFDQSxlQUFNLEtBQU4sQ0FBWSxHQUFaLENBQWdCLGFBQU0sY0FBdEI7QUFDQSxlQUFNLEtBQU4sQ0FBWSxHQUFaLENBQWdCLGFBQU0sTUFBdEI7QUFDQSxlQUFNLE1BQU4sQ0FBYSxRQUFiLENBQXNCLEdBQXRCLENBQTBCLENBQTFCLEVBQTZCLEdBQTdCLEVBQWtDLGFBQU0sY0FBeEM7QUFDQSxlQUFNLE1BQU4sQ0FBYSxNQUFiLENBQW9CLGFBQU0sS0FBTixDQUFZLFFBQWhDO0FBQ0EseUJBQVcsUUFBWCxDQUFvQixhQUFNLEtBQTFCOztBQUVBO0FBQ0EsYUFBVyxtQkFBbUIsT0FBTyxRQUFQLENBQWdCLElBQWhCLENBQXFCLE9BQXJCLENBQTZCLEdBQTdCLEVBQWtDLEVBQWxDLENBQW5CLENBQVg7QUFDQSxNQUFJLFFBQUosRUFBYztBQUNiLCtCQUFpQixTQUFqQixDQUEyQixRQUEzQjtBQUNBO0FBQ0Q7Ozs7K0JBRVksTSxFQUFRO0FBQ3BCLFFBQUssVUFBTDtBQUNBLFVBQU8sUUFBUCxDQUFnQixJQUFoQixHQUF1QixtQkFBbUIsT0FBTyxFQUExQixDQUF2QjtBQUNBLGdCQUFNLGdCQUFOLEdBQXlCLHVCQUFXLHNCQUFYLENBQWtDLE1BQWxDLENBQXpCO0FBQ0EsZ0JBQU0sb0JBQU4sR0FBNkIsdUJBQVcsb0JBQVgsQ0FBZ0MsTUFBaEMsRUFBd0MsYUFBTSxnQkFBOUMsQ0FBN0I7QUFDQSxRQUFLLGNBQUwsR0FBc0IsYUFBTSxnQkFBNUI7QUFDQSwwQkFBVyxvQkFBWCxDQUFnQyxhQUFNLGNBQXRDLEVBQXNELGFBQU0sZ0JBQTVELEVBQThFLGFBQU0sb0JBQXBGO0FBQ0E7OztvQ0FFaUIsSyxFQUFPO0FBQ3hCLE9BQUksaUJBQUo7QUFDQSxPQUFJLG1CQUFKO0FBQ0EsT0FBSSxnQkFBZ0IsS0FBcEI7QUFDQSxnQkFBTSxXQUFOLEdBQW9CLHVCQUFXLGNBQVgsQ0FBMEIsS0FBMUIsQ0FBcEI7QUFDQSxnQkFBTSxrQkFBTixHQUEyQixLQUEzQjtBQUNBLGdCQUFhLHVCQUFXLHlCQUFYLEVBQWI7QUFDQSxRQUFLLHdCQUFMO0FBQ0EsT0FBSSxXQUFXLE1BQWYsRUFBdUI7QUFDdEIsZUFBVyxXQUFXLENBQVgsRUFBYyxNQUF6QjtBQUNBLFlBQVEsU0FBUyxJQUFqQjtBQUNDO0FBQ0E7QUFDQyxzQkFBZ0IsSUFBaEI7QUFDQSxXQUFLLGFBQUwsR0FBcUIsUUFBckI7QUFDQSxXQUFLLHNCQUFMO0FBQ0E7QUFDRDtBQUNBO0FBQ0Msc0JBQWdCLElBQWhCO0FBQ0EsV0FBSyxhQUFMLEdBQXFCLFNBQVMsTUFBOUI7QUFDQSxXQUFLLHNCQUFMO0FBQ0E7QUFaRjtBQWNBO0FBQ0QsZ0JBQU0sY0FBTixHQUF1QixhQUFNLFdBQTdCO0FBQ0EsVUFBTyxhQUFQO0FBQ0E7Ozs2Q0FFMEI7QUFDMUIsT0FBSSxDQUFDLEtBQUssdUJBQUwsRUFBTCxFQUFxQztBQUNwQyxTQUFLLGFBQUwsQ0FBbUIsUUFBbkIsQ0FBNEIsS0FBNUIsQ0FBa0MsTUFBbEMsQ0FBeUMsS0FBSyxhQUFMLENBQW1CLE9BQW5CLENBQTJCLE9BQXBFO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLElBQXJCO0FBQ0EsUUFBSSxLQUFLLGNBQUwsQ0FBb0IsSUFBcEIsaUNBQUosRUFBd0Q7QUFDdkQsa0JBQU0sUUFBTixDQUFlLDJCQUFmO0FBQ0E7QUFDRDtBQUNEOzs7MkNBRXdCO0FBQ3hCLE9BQUksQ0FBQyxLQUFLLHVCQUFMLEVBQUwsRUFBcUM7QUFDcEMsU0FBSyxhQUFMLENBQW1CLFFBQW5CLENBQTRCLEtBQTVCLENBQWtDLE1BQWxDLENBQXlDLEtBQUssYUFBTCxDQUFtQixPQUFuQixDQUEyQixLQUFwRTtBQUNBLFFBQUksS0FBSyxjQUFMLENBQW9CLElBQXBCLGlDQUFKLEVBQXdEO0FBQ3ZELGtCQUFNLFFBQU4sQ0FBZSwwQkFBWSxLQUFLLGFBQUwsQ0FBbUIsU0FBL0IsQ0FBZjtBQUNBO0FBQ0Q7QUFDRDs7OzRDQUV5QjtBQUN6QixVQUFPLEVBQUUsS0FBSyxjQUFMLElBQXVCLEtBQUssYUFBNUIsSUFBNkMsS0FBSyxhQUFMLENBQW1CLEVBQW5CLEtBQTBCLEtBQUssY0FBTCxDQUFvQixFQUE3RixDQUFQO0FBQ0E7OztvQ0FFaUIsSyxFQUFPO0FBQ3hCLGdCQUFNLFdBQU4sR0FBb0IsdUJBQVcsY0FBWCxDQUEwQixLQUExQixDQUFwQjtBQUNBLE9BQUksYUFBYSx1QkFBVyx5QkFBWCxFQUFqQjtBQUNBLE9BQUksV0FBVyxNQUFmLEVBQXVCO0FBQ3RCLFFBQU0sV0FBVyxXQUFXLENBQVgsRUFBYyxNQUEvQjtBQUNBLFFBQUksS0FBSyxjQUFMLElBQXVCLFNBQVMsRUFBVCxLQUFnQixLQUFLLGNBQUwsQ0FBb0IsRUFBL0QsRUFBbUU7QUFDbEU7QUFDQTtBQUNELFlBQVEsU0FBUyxJQUFqQjtBQUNDO0FBQ0MsV0FBSyxrQkFBTDtBQUNBLFdBQUssY0FBTCxHQUFzQixRQUF0QjtBQUNBLFdBQUssa0JBQUw7QUFDQSxtQkFBTSxRQUFOLENBQWUsMEJBQVksS0FBSyxjQUFMLENBQW9CLFNBQWhDLENBQWY7QUFDQTtBQUNEO0FBQ0MsV0FBSyxrQkFBTDtBQUNBLFdBQUssY0FBTCxHQUFzQixTQUFTLE1BQS9CO0FBQ0EsV0FBSyxrQkFBTDtBQUNBLG1CQUFNLFFBQU4sQ0FBZSwwQkFBWSxLQUFLLGNBQUwsQ0FBb0IsU0FBaEMsQ0FBZjtBQUNBO0FBQ0Q7QUFDQyxXQUFLLGtCQUFMO0FBQ0EsV0FBSyxjQUFMLEdBQXNCLFFBQXRCO0FBQ0EsV0FBSyxrQkFBTDtBQUNBLG1CQUFNLFFBQU4sQ0FBZSwyQkFBZjtBQUNBO0FBQ0Q7QUFDQyxXQUFLLGtCQUFMO0FBQ0EsV0FBSyxjQUFMLEdBQXNCLFNBQVMsTUFBL0I7QUFDQSxXQUFLLGtCQUFMO0FBQ0EsbUJBQU0sUUFBTixDQUFlLDJCQUFmO0FBQ0E7QUF4QkY7QUEwQkEsSUEvQkQsTUErQk87QUFDTixTQUFLLGtCQUFMO0FBQ0EsaUJBQU0sUUFBTixDQUFlLDJCQUFmO0FBQ0E7QUFDRDs7O3VDQUVvQjtBQUNwQixRQUFLLGNBQUwsQ0FBb0IsUUFBcEIsQ0FBNkIsS0FBN0IsQ0FBbUMsTUFBbkMsQ0FBMEMsS0FBSyxjQUFMLENBQW9CLE9BQXBCLENBQTRCLFFBQXRFO0FBQ0EsK0JBQWlCLGtCQUFqQixDQUFvQyxLQUFLLGNBQUwsQ0FBb0IsU0FBeEQ7QUFDQTs7O3VDQUVvQjtBQUNwQixPQUFJLENBQUMsS0FBSyxjQUFWLEVBQTBCO0FBQ3pCO0FBQ0E7QUFDRCxRQUFLLGNBQUwsQ0FBb0IsUUFBcEIsQ0FBNkIsS0FBN0IsQ0FBbUMsTUFBbkMsQ0FBMEMsS0FBSyxjQUFMLENBQW9CLE9BQXBCLENBQTRCLE9BQXRFO0FBQ0EsUUFBSyxjQUFMLEdBQXNCLElBQXRCO0FBQ0E7OzttQ0FFZ0IsSyxFQUFPO0FBQ3ZCLE9BQU0sS0FBSyxhQUFNLEVBQU4sR0FBVyxhQUFNLEVBQTVCO0FBQ0EsZ0JBQU0sV0FBTixHQUFvQix1QkFBVyxjQUFYLENBQTBCLEtBQTFCLENBQXBCO0FBQ0EsZ0JBQU0sa0JBQU4sR0FBNEIsYUFBTSxXQUFOLENBQWtCLENBQWxCLEdBQXNCLGFBQU0sY0FBTixDQUFxQixDQUF2RTtBQUNBLGdCQUFNLGtCQUFOLEdBQTRCLGFBQU0sV0FBTixDQUFrQixDQUFsQixHQUFzQixhQUFNLGNBQU4sQ0FBcUIsQ0FBdkU7QUFDQSxnQkFBTSxhQUFOLEdBQXNCLEtBQUssR0FBTCxDQUFTLEtBQUssR0FBTCxDQUFTLGFBQU0sV0FBTixDQUFrQixDQUEzQixJQUFnQyxLQUFLLEdBQUwsQ0FBUyxhQUFNLGNBQU4sQ0FBcUIsQ0FBOUIsQ0FBekMsQ0FBdEI7QUFDQSxnQkFBTSxhQUFOLEdBQXNCLEtBQUssR0FBTCxDQUFTLEtBQUssR0FBTCxDQUFTLGFBQU0sV0FBTixDQUFrQixDQUEzQixJQUFnQyxLQUFLLEdBQUwsQ0FBUyxhQUFNLGNBQU4sQ0FBcUIsQ0FBOUIsQ0FBekMsQ0FBdEI7QUFDQSxnQkFBTSxNQUFOLEdBQWdCLENBQUMsSUFBSSxhQUFNLGFBQVgsSUFBNEIsRUFBNUM7QUFDQSxnQkFBTSxNQUFOLEdBQWdCLENBQUMsSUFBSSxhQUFNLGFBQVgsSUFBNEIsRUFBNUM7QUFDQSxnQkFBTSxjQUFOLEdBQXVCLGFBQU0sV0FBN0I7QUFDQTs7O21DQUVnQixjLEVBQWdCO0FBQUE7O0FBQ2hDLFFBQUssVUFBTDtBQUNBLDBCQUFXLG9CQUFYLENBQWdDLGFBQU0sY0FBdEMsRUFBc0QsY0FBdEQ7QUFDQSxRQUFLLFNBQUwsQ0FBZSxtQkFBZixDQUFtQyxjQUFuQyxFQUFtRCxZQUFNO0FBQ3hELFVBQUssVUFBTDtBQUNBLGdDQUFpQixTQUFqQixDQUEyQixlQUFlLFNBQWYsQ0FBeUIsRUFBcEQ7QUFDQSxJQUhEO0FBSUE7OzsrQkFFWTtBQUNaLE9BQU0sU0FBUyxhQUFNLGNBQU4sQ0FBcUIsZUFBckIsQ0FBcUMsUUFBckMsQ0FBZjtBQUNBLE9BQUksTUFBSixFQUFZO0FBQ1gsaUJBQU0sY0FBTixDQUFxQixNQUFyQixDQUE0QixNQUE1QjtBQUNBO0FBQ0Q7OztpQ0FFYztBQUNkLFVBQU8sUUFBUCxDQUFnQixJQUFoQixHQUF1QixFQUF2QjtBQUNBOzs7dUJBRUksUyxFQUFXO0FBQ2YsV0FBUSxTQUFSO0FBQ0MsU0FBSyxJQUFMO0FBQ0Msa0JBQU0sY0FBTixJQUF3QixFQUF4QjtBQUNBO0FBQ0QsU0FBSyxLQUFMO0FBQ0Msa0JBQU0sY0FBTixJQUF3QixFQUF4QjtBQUNBO0FBTkY7QUFRQTs7O3VDQUVvQjtBQUNwQixnQkFBTSxNQUFOLENBQWEsTUFBYixHQUFzQixPQUFPLFVBQVAsR0FBb0IsT0FBTyxXQUFqRDtBQUNBLGdCQUFNLE1BQU4sQ0FBYSxzQkFBYjtBQUNBLGdCQUFNLFFBQU4sQ0FBZSxPQUFmLENBQXVCLE9BQU8sVUFBOUIsRUFBMEMsT0FBTyxXQUFqRDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQzlNRixJQUFNLGVBQWUsR0FBckI7QUFDQSxJQUFNLG9CQUFvQixJQUExQjtBQUNBLElBQU0sa0JBQWtCLElBQXhCOztJQUVhLFUsV0FBQSxVOzs7Ozs7O3NDQUNrQixNLEVBQVE7QUFDbEMsT0FBSSxPQUFPLFVBQVAsSUFBcUIsRUFBekIsRUFBNkI7QUFDL0IsV0FBTyxPQUFPLFVBQVAsR0FBb0IsZUFBM0I7QUFDQSxJQUZFLE1BRUk7QUFDTixXQUFPLE9BQU8sVUFBUCxHQUFvQixpQkFBM0I7QUFDQTtBQUVFOztBQUVKOzs7Ozs7Ozs7dUNBTTRCLE0sRUFBUSxhLEVBQWU7QUFDbEQsT0FBSSxhQUFKO0FBQUEsT0FBVSx3QkFBVjtBQUFBLE9BQTJCLDRCQUEzQjtBQUFBLE9BQWdELHlCQUFoRDtBQUNBLE9BQUksVUFBVSxPQUFPLE1BQVAsQ0FDSCxHQURHLENBQ0MsVUFBQyxlQUFEO0FBQUEsV0FBcUIsV0FBVywwQkFBWCxDQUFzQyxlQUF0QyxFQUF1RCxhQUF2RCxDQUFyQjtBQUFBLElBREQsRUFFSCxNQUZHLENBRUksVUFBQyxXQUFELEVBQWMsS0FBZCxFQUF3QjtBQUNsQyxRQUFJLEtBQUosRUFBVztBQUNQLGlCQUFZLElBQVosQ0FBaUIsS0FBakI7QUFDVDtBQUNLLFdBQU8sV0FBUDtBQUNHLElBUEcsRUFPRCxFQVBDLENBQWQ7QUFRQSxzQkFBbUIsT0FBTyxNQUFQLENBQWMsTUFBZCxHQUF1QixPQUFPLE1BQVAsQ0FBYyxNQUFyQyxHQUE4QyxDQUFqRTtBQUNBLFVBQU8sSUFBSSxnQkFBWDtBQUNBLFVBQU8sU0FBUyxDQUFULEdBQWEsQ0FBYixHQUFpQixJQUF4QjtBQUNBLHFCQUFrQixRQUFRLE1BQVIsR0FBaUIsSUFBbkM7QUFDQSx5QkFBc0IsV0FBVyxtQkFBWCxDQUErQixNQUEvQixJQUF5QyxXQUFXLG1CQUFYLENBQStCLGFBQS9CLENBQS9EO0FBQ0EsVUFBTztBQUNOLGdCQUFhLGVBQWdCLGVBQWUsZUFBaEMsR0FBb0QsbUJBRDFEO0FBRU4scUJBQWlCLEtBQUssS0FBTCxDQUFXLGtCQUFrQixHQUE3QjtBQUZYLElBQVA7QUFJQTs7OzZDQUVpQyxlLEVBQWlCLGEsRUFBZTtBQUMzRCxVQUFPLGNBQWMsTUFBZCxDQUNGLElBREUsQ0FDRyxVQUFDLEtBQUQ7QUFBQSxXQUFXLFVBQVUsZUFBckI7QUFBQSxJQURILENBQVA7QUFFSDs7Ozs7Ozs7Ozs7Ozs7OztBQzVDTDs7SUFBWSxLOztBQUVaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7SUFFYSxZLFdBQUEsWTs7O0FBRVQsNEJBQWM7QUFBQTs7QUFBQTtBQUViOzs7O2lDQUVRO0FBQ0wsbUJBQ0k7QUFBQTtBQUFBLGtCQUFLLFdBQVUsZUFBZjtBQUNSLGdFQURRO0FBRUksMERBRko7QUFHSSxrRUFISjtBQUlJLHNFQUpKO0FBS0ksK0RBTEo7QUFNSTtBQU5KLGFBREo7QUFVSDs7OztFQWpCNkIsTUFBTSxTOzs7Ozs7OztRQ1B4QixtQixHQUFBLG1COztBQUZoQjs7SUFBWSxLOzs7O0FBRUwsU0FBUyxtQkFBVCxPQUFpRDtBQUFBLEtBQW5CLE1BQW1CLFFBQW5CLE1BQW1CO0FBQUEsS0FBWCxRQUFXLFFBQVgsUUFBVzs7QUFDdkQsS0FBTSxTQUFTLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsVUFBQyxLQUFELEVBQVc7QUFDM0MsU0FBTztBQUFBO0FBQUEsS0FBTSxXQUFVLE1BQWhCLEVBQXVCLEtBQUssS0FBNUI7QUFBb0M7QUFBcEMsR0FBUDtBQUNBLEVBRmMsQ0FBZjtBQUdBLEtBQU0sVUFBVSxXQUFXLDRCQUFYLEdBQTBDLHFCQUExRDtBQUNBLFFBQ0M7QUFBQTtBQUFBLElBQUssV0FBVyxPQUFoQjtBQUNDO0FBQUE7QUFBQSxLQUFLLFdBQVUsc0JBQWY7QUFBdUMsVUFBTztBQUE5QyxHQUREO0FBRUM7QUFBQTtBQUFBLEtBQUssV0FBVSxZQUFmO0FBQTRCO0FBQUE7QUFBQSxNQUFNLFdBQVUsT0FBaEI7QUFBQTtBQUFBLElBQTVCO0FBQUE7QUFBdUU7QUFBQTtBQUFBLE1BQU0sV0FBVSxNQUFoQjtBQUF3QixXQUFPO0FBQS9CO0FBQXZFLEdBRkQ7QUFHQztBQUFBO0FBQUEsS0FBSyxXQUFVLFFBQWY7QUFBeUI7QUFBekI7QUFIRCxFQUREO0FBT0E7Ozs7Ozs7Ozs7OztBQ2REOztJQUFZLEs7O0FBQ1o7O0FBQ0E7Ozs7Ozs7Ozs7SUFFYSxtQixXQUFBLG1COzs7QUFDWixnQ0FBYztBQUFBOztBQUFBO0FBRWI7Ozs7a0NBRWUsRyxFQUFLLFEsRUFBVTtBQUM5QixPQUFJLGNBQUo7QUFDQSwrQkFBaUIsU0FBakIsQ0FBMkIsUUFBM0I7QUFDQTs7OzJCQUVRO0FBQUE7O0FBQ1IsT0FBSSxVQUFVLEtBQUssS0FBTCxDQUFXLGNBQVgsQ0FBMEIsR0FBMUIsQ0FBOEIsVUFBQyxNQUFELEVBQVk7QUFDdkQsUUFBSSxPQUFPLFdBQVcsbUJBQW1CLE9BQU8sRUFBMUIsQ0FBdEI7QUFDQSxRQUFJLFNBQVMsT0FBTyxNQUFQLElBQWlCLE9BQU8sTUFBUCxDQUFjLE1BQS9CLEdBQXdDLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLE1BQWQsR0FBdUIsQ0FBckMsRUFBd0MsR0FBaEYsR0FBc0YsRUFBbkc7QUFDQSxRQUFJLFdBQVcsRUFBRSwwQkFBd0IsTUFBeEIsTUFBRixFQUFmO0FBQ0EsV0FDQztBQUFBO0FBQUEsT0FBSyxXQUFVLFFBQWYsRUFBd0IsS0FBSyxPQUFPLEVBQXBDO0FBQ0M7QUFBQTtBQUFBLFFBQUcsTUFBTSxJQUFULEVBQWUsSUFBSSxPQUFPLEVBQTFCLEVBQThCLFdBQVUsaUJBQXhDO0FBQ0csZ0JBQVMsaUJBQUMsS0FBRCxFQUFXO0FBQUUsZUFBSyxlQUFMLENBQXFCLEtBQXJCLEVBQTRCLE9BQU8sRUFBbkM7QUFBd0MsUUFEakU7QUFFQztBQUFBO0FBQUEsU0FBSyxXQUFVLGdCQUFmO0FBQ0Msb0NBQUssV0FBVSxTQUFmLEVBQXlCLE9BQU8sUUFBaEM7QUFERCxPQUZEO0FBS0M7QUFBQTtBQUFBLFNBQU0sV0FBVSxNQUFoQjtBQUF3QixjQUFPO0FBQS9CO0FBTEQ7QUFERCxLQUREO0FBV0EsSUFmYSxDQUFkO0FBZ0JBLE9BQU0sVUFBVSxLQUFLLEtBQUwsQ0FBVyxRQUFYLEdBQXNCLDBCQUF0QixHQUFtRCxtQkFBbkU7QUFDQSxVQUNDO0FBQUE7QUFBQSxNQUFLLFdBQVcsT0FBaEIsRUFBeUIsS0FBSztBQUFBLGFBQVEsT0FBSyxhQUFMLEdBQXFCLElBQTdCO0FBQUEsTUFBOUI7QUFDRTtBQURGLElBREQ7QUFLQTs7O3NDQUVtQjtBQUNuQixRQUFLLGFBQUwsQ0FBbUIsU0FBbkIsR0FBK0IsS0FBSyxhQUFMLENBQW1CLFlBQWxEO0FBQ0E7Ozt1Q0FFb0I7QUFDcEIsUUFBSyxhQUFMLENBQW1CLFNBQW5CLEdBQStCLEtBQUssYUFBTCxDQUFtQixZQUFsRDtBQUNBOzs7O0VBekN1QyxNQUFNLFM7Ozs7Ozs7O1FDRi9CLDBCLEdBQUEsMEI7O0FBRmhCOztJQUFZLEs7Ozs7QUFFTCxTQUFTLDBCQUFULE9BQTRFO0FBQUEsS0FBdkMsYUFBdUMsUUFBdkMsYUFBdUM7QUFBQSxLQUF4QixXQUF3QixRQUF4QixXQUF3QjtBQUFBLEtBQVgsUUFBVyxRQUFYLFFBQVc7O0FBQ2xGLEtBQU0sY0FBYyxlQUFlLFFBQWYsR0FBMEIsK0JBQTFCLEdBQTRELHdCQUFoRjtBQUNBLFFBQ0M7QUFBQTtBQUFBLElBQUssV0FBVyxXQUFoQjtBQUNDO0FBQUE7QUFBQSxLQUFLLFdBQVUseUJBQWY7QUFBMEMsaUJBQWM7QUFBeEQsR0FERDtBQUVDO0FBQUE7QUFBQSxLQUFLLFdBQVUsWUFBZjtBQUE0QjtBQUFBO0FBQUEsTUFBTSxXQUFVLE9BQWhCO0FBQUE7QUFBQSxJQUE1QjtBQUFBO0FBQXVFO0FBQUE7QUFBQSxNQUFNLFdBQVUsTUFBaEI7QUFBd0Isa0JBQWM7QUFBdEM7QUFBdkUsR0FGRDtBQUdDO0FBQUE7QUFBQSxLQUFLLFdBQVUsUUFBZjtBQUF3QjtBQUFBO0FBQUEsTUFBTSxXQUFVLE9BQWhCO0FBQUE7QUFBQSxJQUF4QjtBQUFBO0FBQXlFO0FBQUE7QUFBQSxNQUFNLFdBQVUsTUFBaEI7QUFBd0Isa0JBQWMsZUFBdEM7QUFBQTtBQUFBO0FBQXpFO0FBSEQsRUFERDtBQU9BOzs7Ozs7Ozs7Ozs7QUNYRDs7SUFBWSxLOztBQUNaOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0lBRWEsYyxXQUFBLGM7OztBQUNaLDJCQUFjO0FBQUE7O0FBQUE7O0FBRWIsUUFBSyxNQUFMLEdBQWMsYUFBTSxRQUFOLEdBQWlCLE1BQS9CO0FBQ0EsUUFBSyxXQUFMLEdBQW1CLEtBQW5CO0FBSGE7QUFJYjs7OzsyQkFFUTtBQUFBOztBQUNSLFVBQ0MsNkJBQUssV0FBVSxlQUFmLEVBQStCLEtBQUs7QUFBQSxZQUFRLE9BQUssUUFBTCxHQUFnQixJQUF4QjtBQUFBLEtBQXBDLEdBREQ7QUFHQTs7O3NDQUVtQjtBQUFBOztBQUNuQiwwQkFBVyxJQUFYLEdBQWtCLElBQWxCLENBQXVCLFlBQU07QUFBRTtBQUM5QixXQUFLLEtBQUwsR0FBYSwrQkFBaUIsT0FBSyxRQUF0QixDQUFiO0FBQ0EsV0FBSyxTQUFMO0FBQ0EsSUFIRDtBQUlBOzs7dUNBRW9CO0FBQ3BCLFFBQUssU0FBTDtBQUNBOzs7OEJBRVc7QUFBQSxPQUNILE1BREcsR0FDUSxLQUFLLEtBRGIsQ0FDSCxNQURHOztBQUVYLFFBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLGFBQS9CLEVBQThDO0FBQUEsV0FBUyxNQUFNLGNBQU4sRUFBVDtBQUFBLElBQTlDLEVBRlcsQ0FFcUU7QUFDaEYsUUFBSyxRQUFMLENBQWMsZ0JBQWQsQ0FBK0IsT0FBL0IsRUFBd0MsSUFBeEMsRUFBOEMsSUFBOUM7QUFDQSxRQUFLLFFBQUwsQ0FBYyxnQkFBZCxDQUErQixZQUEvQixFQUE2QyxJQUE3QyxFQUFtRCxJQUFuRDtBQUNBLFFBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLFdBQS9CLEVBQTRDLElBQTVDLEVBQWtELElBQWxEO0FBQ0EsUUFBSyxRQUFMLENBQWMsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNEMsSUFBNUMsRUFBa0QsSUFBbEQ7QUFDQSxRQUFLLFFBQUwsQ0FBYyxnQkFBZCxDQUErQixTQUEvQixFQUEwQyxJQUExQyxFQUFnRCxJQUFoRDtBQUNBLFVBQU8sZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0MsSUFBbEMsRUFBd0MsS0FBeEM7QUFDQSxPQUFJLE9BQU8sRUFBWCxFQUFlO0FBQ2QsU0FBSyxLQUFMLENBQVcsWUFBWCxDQUF3QixNQUF4QjtBQUNBLElBRkQsTUFFTztBQUNOLFNBQUssS0FBTCxDQUFXLFVBQVg7QUFDQSxTQUFLLEtBQUwsQ0FBVyxZQUFYO0FBQ0E7QUFDRDs7OzhCQUVXLEssRUFBTztBQUNsQixRQUFLLE1BQU0sSUFBWCxFQUFpQixLQUFqQjtBQUNBOzs7d0JBRUssSyxFQUFPO0FBQ1osUUFBSyxRQUFMLENBQWMsU0FBZCxHQUEwQixvQkFBMUI7QUFDQSxPQUFJLENBQUMsS0FBSyxVQUFWLEVBQXNCO0FBQ3JCLFNBQUssS0FBTCxDQUFXLGlCQUFYLENBQTZCLEtBQTdCO0FBQ0EsSUFGRCxNQUVPO0FBQ04sU0FBSyxVQUFMLEdBQWtCLEtBQWxCO0FBQ0E7QUFDRDs7OzRCQUVTLEssRUFBTztBQUNoQixPQUFJLGdCQUFnQixLQUFwQjtBQUNBLFFBQUssUUFBTCxDQUFjLFNBQWQsR0FBMEIsb0JBQTFCO0FBQ0EsT0FBSSxLQUFLLFdBQVQsRUFBc0I7QUFDckIsU0FBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EsU0FBSyxLQUFMLENBQVcsZ0JBQVgsQ0FBNEIsS0FBNUI7QUFDQSxJQUhELE1BR087QUFDTixvQkFBZ0IsS0FBSyxLQUFMLENBQVcsaUJBQVgsQ0FBNkIsS0FBN0IsQ0FBaEI7QUFDQTtBQUNELE9BQUksaUJBQWlCLENBQUMsS0FBSyxVQUEzQixFQUF1QztBQUN0QyxTQUFLLFFBQUwsQ0FBYyxTQUFkLEdBQTBCLHVCQUExQjtBQUNBO0FBQ0QsT0FBSSxLQUFLLFVBQVQsRUFBcUI7QUFDcEIsU0FBSyxRQUFMLENBQWMsU0FBZCxHQUEwQix1QkFBMUI7QUFDQTtBQUNEOzs7OEJBRVc7QUFDWCxRQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDQTs7OzRCQUVTO0FBQ1QsUUFBSyxXQUFMLEdBQW1CLEtBQW5CO0FBQ0E7Ozs2QkFFVSxLLEVBQU87QUFDakIsV0FBUSx1QkFBVyxJQUFYLENBQWdCLE1BQU0sV0FBdEIsQ0FBUjtBQUNDLFNBQUssQ0FBQyxDQUFOO0FBQ0MsVUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQjtBQUNBO0FBQ0QsU0FBSyxDQUFMO0FBQ0MsVUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFoQjtBQUNBO0FBTkY7QUFRQTs7OzJCQUVRO0FBQ1IsUUFBSyxLQUFMLENBQVcsa0JBQVg7QUFDQTs7OztFQTVGa0MsTUFBTSxTOzs7Ozs7OztRQ0oxQixvQixHQUFBLG9COztBQUZoQjs7SUFBWSxLOzs7O0FBRUwsU0FBUyxvQkFBVCxPQUF3RztBQUFBLFFBQXpFLFVBQXlFLFFBQXpFLFVBQXlFO0FBQUEsUUFBN0QsTUFBNkQsUUFBN0QsTUFBNkQ7QUFBQSxRQUFyRCxZQUFxRCxRQUFyRCxZQUFxRDtBQUFBLFFBQXZDLHNCQUF1QyxRQUF2QyxzQkFBdUM7QUFBQSxRQUFmLFlBQWUsUUFBZixZQUFlOztBQUMzRyxRQUFNLGdCQUFnQixPQUFPLEVBQVAsR0FBWSxlQUFaLEdBQThCLHNCQUFwRDtBQUNBLFdBQ0k7QUFBQTtBQUFBLFVBQUssV0FBVSx1QkFBZjtBQUNJO0FBQUE7QUFBQSxjQUFNLFdBQVUsZUFBaEIsRUFBZ0MsVUFBVSxrQkFBQyxHQUFEO0FBQUEsMkJBQVMsYUFBYSxHQUFiLEVBQWtCLFVBQWxCLENBQVQ7QUFBQSxpQkFBMUM7QUFDSSwyQ0FBTyxNQUFLLE1BQVosRUFBbUIsSUFBRyxjQUF0QixFQUFxQyxhQUFZLG1CQUFqRCxFQUFxRSxPQUFPLFVBQTVFLEVBQXdGLFVBQVUsc0JBQWxHLEdBREo7QUFFSTtBQUFBO0FBQUEsa0JBQVEsTUFBSyxRQUFiLEVBQXNCLFNBQVMsaUJBQUMsR0FBRDtBQUFBLCtCQUFTLGFBQWEsR0FBYixFQUFrQixVQUFsQixDQUFUO0FBQUEscUJBQS9CO0FBQUE7QUFBQSxhQUZKO0FBR0k7QUFBQTtBQUFBLGtCQUFRLFdBQVcsYUFBbkIsRUFBa0MsTUFBSyxRQUF2QyxFQUFnRCxTQUFTLGlCQUFDLEdBQUQ7QUFBQSwrQkFBUyxhQUFhLEdBQWIsQ0FBVDtBQUFBLHFCQUF6RDtBQUFBO0FBQUE7QUFISjtBQURKLEtBREo7QUFTSDs7Ozs7Ozs7Ozs7O0FDYkQ7O0lBQVksSzs7Ozs7Ozs7OztJQUVDLHNCLFdBQUEsc0I7OztBQUNaLHVDQUFpQztBQUFBLE1BQXBCLGlCQUFvQixRQUFwQixpQkFBb0I7O0FBQUE7O0FBQUE7O0FBRWhDLFFBQUssaUJBQUwsR0FBeUIsaUJBQXpCO0FBRmdDO0FBR2hDOzs7OzJCQUVRO0FBQUE7O0FBQUEsZ0JBQytDLEtBQUssS0FEcEQ7QUFBQSxPQUNBLGlCQURBLFVBQ0EsaUJBREE7QUFBQSxPQUNtQixhQURuQixVQUNtQixhQURuQjtBQUFBLE9BQ2tDLFFBRGxDLFVBQ2tDLFFBRGxDOztBQUVSLE9BQU0sV0FBVyxtREFBakI7QUFDQSxPQUFNLFVBQVUsV0FBVyxpQ0FBWCxHQUErQywwQkFBL0Q7QUFDQSxPQUFNLFNBQVMsY0FBYyxNQUE3QjtBQUNBLE9BQUksdUJBQUo7QUFBQSxPQUNDLGVBQWUsRUFEaEI7QUFBQSxPQUVDLG1CQUFtQixFQUZwQjtBQUFBLE9BR0MsZ0JBSEQ7O0FBS0EsT0FBSSxVQUFVLE9BQU8sTUFBckIsRUFBNkI7QUFDNUIsY0FBVSxPQUFPLGlCQUFQLEVBQTBCLEVBQXBDO0FBQ0EsMEJBQW9CLFFBQXBCLEdBQStCLE9BQS9CO0FBQ0EsbUJBQ0M7QUFBQTtBQUFBLE9BQUssV0FBVSxnQkFBZjtBQUNDLHFDQUFRLEtBQUssY0FBYixFQUE2QixPQUFNLEtBQW5DLEVBQXlDLFFBQU8sS0FBaEQsRUFBc0QsYUFBWSxHQUFsRSxFQUFzRSxtQkFBa0IsTUFBeEY7QUFERCxLQUREO0FBS0EsdUJBQW1CLE9BQU8sR0FBUCxDQUFXLFVBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDL0MsWUFDQztBQUFBO0FBQUEsUUFBSyxXQUFVLE9BQWYsRUFBdUIsS0FBSyxNQUFNLEVBQWxDO0FBQ0M7QUFBQTtBQUFBLFNBQUcsTUFBSyxxQkFBUixFQUE4QixTQUFTLGlCQUFDLEdBQUQ7QUFBQSxnQkFBUyxPQUFLLGlCQUFMLENBQXVCLEdBQXZCLEVBQTRCLEtBQTVCLENBQVQ7QUFBQSxTQUF2QztBQUFxRixhQUFNO0FBQTNGO0FBREQsTUFERDtBQUtBLEtBTmtCLENBQW5CO0FBT0E7QUFDRCxVQUNDO0FBQUE7QUFBQSxNQUFLLFdBQVcsT0FBaEI7QUFDRSxnQkFERjtBQUVDO0FBQUE7QUFBQSxPQUFLLFdBQVUsYUFBZjtBQUNFO0FBREY7QUFGRCxJQUREO0FBUUE7Ozs7RUF4QzBDLE1BQU0sUzs7Ozs7Ozs7QUNGM0MsSUFBTSw0QkFBVTtBQUN0QixhQUFZLFFBRFU7QUFFdEIsZ0JBQWUsUUFGTztBQUd0QixxQkFBb0IsUUFIRTtBQUl0Qix1QkFBc0IsUUFKQTtBQUt0QixrQkFBaUIsUUFMSztBQU10QixhQUFZLFFBTlU7QUFPdEIsa0JBQWlCLFFBUEs7QUFRdEIsWUFBVyxRQVJXO0FBU3RCLFlBQVc7QUFUVyxDQUFoQjs7Ozs7Ozs7O0FDQVA7O0FBQ0E7O0FBRUEsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsQ0FBQyxLQUFELEVBQVc7QUFDbEMsUUFBTztBQUNOLFVBQVEsTUFBTSxNQURSO0FBRU4sWUFBVSxNQUFNO0FBRlYsRUFBUDtBQUlBLENBTEQ7O0FBT0EsSUFBTSxzQkFBc0IseUJBQVEsZUFBUixrQ0FBNUI7O2tCQUVlLG1COzs7Ozs7Ozs7QUNaZjs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFDLEtBQUQsRUFBVztBQUNsQyxRQUFPO0FBQ04sa0JBQWdCLE1BQU0sY0FEaEI7QUFFTixZQUFVLE1BQU07QUFGVixFQUFQO0FBSUEsQ0FMRDs7QUFRQSxJQUFNLHNCQUFzQix5QkFBUSxlQUFSLGtDQUE1Qjs7a0JBRWUsbUI7Ozs7Ozs7OztBQ2RmOztBQUNBOztBQUVBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQUMsS0FBRCxFQUFXO0FBQ2xDLFFBQU87QUFDTixpQkFBZSxNQUFNLGFBRGY7QUFFTixlQUFhLE1BQU0sV0FGYjtBQUdOLFlBQVUsTUFBTTtBQUhWLEVBQVA7QUFLQSxDQU5EOztBQVFBLElBQU0sNkJBQTZCLHlCQUFRLGVBQVIsZ0RBQW5DOztrQkFFZSwwQjs7Ozs7Ozs7O0FDYmY7O0FBQ0E7O0FBRUEsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsQ0FBQyxLQUFELEVBQVc7QUFDbEMsUUFBTztBQUNOLFVBQVEsTUFBTTtBQURSLEVBQVA7QUFHQSxDQUpEOztBQU1BLElBQU0saUJBQWlCLHlCQUFRLGVBQVIsd0JBQXZCOztrQkFFZSxjOzs7Ozs7Ozs7QUNYZjs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFDLEtBQUQsRUFBVztBQUNsQyxRQUFPO0FBQ04sY0FBWSxNQUFNLFVBRFo7QUFFTixVQUFRLE1BQU07QUFGUixFQUFQO0FBSUEsQ0FMRDs7QUFPQSxJQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FBQyxRQUFELEVBQWM7QUFDeEMsUUFBTztBQUNOLGdCQUFjLHNCQUFDLEdBQUQsRUFBTSxVQUFOLEVBQXFCO0FBQ2xDLE9BQUksY0FBSjtBQUNBLCtCQUFpQixNQUFqQixDQUF3QixVQUF4QjtBQUNBLEdBSks7QUFLTiwwQkFBd0IsZ0NBQUMsR0FBRCxFQUFTO0FBQ2hDLFlBQVMsK0JBQWlCLElBQUksTUFBSixDQUFXLEtBQTVCLENBQVQ7QUFDQSxHQVBLO0FBUU4sZ0JBQWMsc0JBQUMsR0FBRCxFQUFTO0FBQ3RCLE9BQUksY0FBSjtBQUNBLFlBQVMsNEJBQVQ7QUFDQTtBQVhLLEVBQVA7QUFhQSxDQWREOztBQWdCQSxJQUFNLGtCQUFrQix5QkFBUSxlQUFSLEVBQXlCLGtCQUF6Qiw2Q0FBeEI7O2tCQUVlLGU7Ozs7Ozs7OztBQzlCZjs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFDLEtBQUQsRUFBVztBQUNsQyxRQUFPO0FBQ04sWUFBVSxNQUFNLFFBRFY7QUFFTixpQkFBZSxNQUFNLGFBRmY7QUFHTixxQkFBbUIsTUFBTTtBQUhuQixFQUFQO0FBS0EsQ0FORDs7QUFRQSxJQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FBQyxRQUFELEVBQWM7QUFDeEMsUUFBTztBQUNOLHFCQUFtQiwyQkFBQyxHQUFELEVBQU0sVUFBTixFQUFxQjtBQUN2QyxPQUFJLGNBQUo7QUFDQSxZQUFTLHdCQUFVLFVBQVYsQ0FBVDtBQUNBO0FBSkssRUFBUDtBQU1BLENBUEQ7O0FBU0EsSUFBTSx5QkFBeUIseUJBQVEsZUFBUixFQUF5QixrQkFBekIsd0NBQS9COztrQkFFZSxzQjs7Ozs7Ozs7Ozs7O0FDdkJmOztBQUNBOzs7O0lBRWEsZ0IsV0FBQSxnQjs7Ozs7Ozt5QkFDRSxVLEVBQVk7QUFDekIsT0FBSSxZQUFZLGlCQUFpQixtQkFBbUIsVUFBbkIsQ0FBakM7QUFDQSxVQUFPLE9BQU8sS0FBUCxDQUFhLFNBQWIsRUFBd0I7QUFDOUIsaUJBQWE7QUFEaUIsSUFBeEIsRUFHTixJQUhNLENBR0QsVUFBQyxJQUFEO0FBQUEsV0FBVSxLQUFLLElBQUwsRUFBVjtBQUFBLElBSEMsRUFJTixJQUpNLENBSUQsVUFBQyxJQUFEO0FBQUEsV0FBVSxhQUFNLFFBQU4sQ0FBZSxrQ0FBb0IsSUFBcEIsQ0FBZixDQUFWO0FBQUEsSUFKQyxDQUFQO0FBS0E7Ozs0QkFFZ0IsUSxFQUFVO0FBQzFCLE9BQUksWUFBWSxpQkFBaUIsUUFBakM7QUFDQSxVQUFPLE9BQU8sS0FBUCxDQUFhLFNBQWIsRUFBd0I7QUFDOUIsaUJBQWE7QUFEaUIsSUFBeEIsRUFHTixJQUhNLENBR0QsVUFBQyxJQUFEO0FBQUEsV0FBVSxLQUFLLElBQUwsRUFBVjtBQUFBLElBSEMsRUFJTixJQUpNLENBSUQsVUFBQyxJQUFEO0FBQUEsV0FBVSxhQUFNLFFBQU4sQ0FBZSxrQ0FBb0IsSUFBcEIsQ0FBZixDQUFWO0FBQUEsSUFKQyxDQUFQO0FBS0E7OztxQ0FFeUIsTSxFQUFRO0FBQ2pDLE9BQUksWUFBWSxpQkFBaUIsT0FBTyxFQUF4QztBQUNBLE9BQUksT0FBTyxNQUFQLElBQWlCLE9BQU8sTUFBUCxDQUFjLE1BQW5DLEVBQTJDO0FBQUU7QUFDM0MsV0FBTyxhQUFNLFFBQU4sQ0FBZSw0QkFBYyxNQUFkLENBQWYsQ0FBUDtBQUNEOztBQUVELFVBQU8sT0FBTyxLQUFQLENBQWEsU0FBYixFQUF3QjtBQUM5QixpQkFBYTtBQURpQixJQUF4QixFQUdOLElBSE0sQ0FHRCxVQUFDLElBQUQ7QUFBQSxXQUFVLEtBQUssSUFBTCxFQUFWO0FBQUEsSUFIQyxFQUlOLElBSk0sQ0FJRCxVQUFDLElBQUQsRUFBVTtBQUNmLFdBQU8sTUFBUCxHQUFnQixJQUFoQjtBQUNBLGlCQUFNLFFBQU4sQ0FBZSw0QkFBYyxNQUFkLENBQWY7QUFDQSxJQVBNLENBQVA7QUFRQTs7Ozs7Ozs7Ozs7O1FDM0JjLG1CLEdBQUEsbUI7UUFPQSxhLEdBQUEsYTtRQU9BLGdCLEdBQUEsZ0I7UUFPQSxZLEdBQUEsWTtRQU9BLFcsR0FBQSxXO1FBT0EsVyxHQUFBLFc7UUFPQSxZLEdBQUEsWTtRQU1BLFMsR0FBQSxTO0FBekRULElBQU0sd0RBQXdCLHVCQUE5QjtBQUNBLElBQU0sd0RBQXdCLHVCQUE5QjtBQUNBLElBQU0sa0RBQXFCLG9CQUEzQjtBQUNBLElBQU0sd0NBQWdCLGVBQXRCO0FBQ0EsSUFBTSxnREFBb0IsbUJBQTFCO0FBQ0EsSUFBTSxnREFBb0IsbUJBQTFCO0FBQ0EsSUFBTSx3Q0FBZ0IsZUFBdEI7QUFDQSxJQUFNLGtDQUFhLFlBQW5COztBQUVBLFNBQVMsbUJBQVQsQ0FBNkIsSUFBN0IsRUFBbUM7QUFDekMsUUFBTztBQUNOLFFBQU0scUJBREE7QUFFTixRQUFNO0FBRkEsRUFBUDtBQUlBOztBQUVNLFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE2QjtBQUNuQyxRQUFPO0FBQ04sUUFBTSxxQkFEQTtBQUVOLFFBQU07QUFGQSxFQUFQO0FBSUE7O0FBRU0sU0FBUyxnQkFBVCxDQUEwQixVQUExQixFQUFzQztBQUM1QyxRQUFPO0FBQ04sUUFBTSxrQkFEQTtBQUVOLGNBQVk7QUFGTixFQUFQO0FBSUE7O0FBRU0sU0FBUyxZQUFULENBQXNCLGFBQXRCLEVBQXFDO0FBQzNDLFFBQU87QUFDTixRQUFNLGFBREE7QUFFTixRQUFNO0FBRkEsRUFBUDtBQUlBOztBQUVNLFNBQVMsV0FBVCxDQUFxQixhQUFyQixFQUFvQztBQUMxQyxRQUFPO0FBQ04sUUFBTSxpQkFEQTtBQUVOLFFBQU07QUFGQSxFQUFQO0FBSUE7O0FBRU0sU0FBUyxXQUFULEdBQXVCO0FBQzdCLFFBQU87QUFDTixRQUFNLGlCQURBO0FBRU4sUUFBTTtBQUZBLEVBQVA7QUFJQTs7QUFFTSxTQUFTLFlBQVQsR0FBd0I7QUFDOUIsUUFBTztBQUNOLFFBQU07QUFEQSxFQUFQO0FBR0E7O0FBRU0sU0FBUyxTQUFULENBQW1CLE9BQW5CLEVBQTRCO0FBQ2xDLFFBQU87QUFDTixRQUFNLFVBREE7QUFFTixRQUFNO0FBRkEsRUFBUDtBQUlBOzs7Ozs7Ozs7OztBQzlERDs7OztBQUlBLElBQUksZUFBZSxlQUFlLE9BQWYsQ0FBdUIsT0FBdkIsQ0FBbkI7QUFDQSxJQUFNLGNBQWM7QUFDbkIsS0FBSSxFQURlO0FBRW5CLE9BQU0sRUFGYTtBQUduQixTQUFRLEVBSFc7QUFJbkIsU0FBUSxFQUpXO0FBS25CLGFBQVksQ0FMTztBQU1uQixTQUFRLEVBTlc7QUFPbkIsU0FBUTtBQVBXLENBQXBCO0FBU0EsSUFBTSxhQUFhO0FBQ2xCLFNBQVEsV0FEVTtBQUVsQixnQkFBZSxXQUZHO0FBR2xCLGFBQVksRUFITTtBQUlsQixpQkFBZ0IsRUFKRTtBQUtsQixXQUFVLElBTFE7QUFNbEIsY0FBYSxLQU5LO0FBT2xCLGdCQUFlLFdBUEc7QUFRbEIsb0JBQW1CO0FBUkQsQ0FBbkI7O0FBV0EsSUFBSSxDQUFDLFlBQUwsRUFBbUI7QUFDbEIsNkJBQ0ksVUFESjtBQUdBLENBSkQsTUFJTztBQUNOLGdCQUFlLEtBQUssS0FBTCxDQUFXLFlBQVgsQ0FBZjtBQUNBOztBQUVELElBQU0sV0FBVyxTQUFYLFFBQVcsR0FBa0M7QUFBQSxLQUFqQyxLQUFpQyx1RUFBekIsWUFBeUI7QUFBQSxLQUFYLE1BQVc7O0FBQ2xELEtBQUksaUJBQUo7QUFDQSxTQUFRLE9BQU8sSUFBZjtBQUNDO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLGdCQUFZLE9BQU87QUFGcEI7QUFJQTtBQUNEO0FBQ0MsT0FBSSxPQUFPLElBQVAsQ0FBWSxFQUFoQixFQUFvQjtBQUNuQixRQUFJLGlCQUFpQixDQUFDLENBQUMsTUFBTSxjQUFOLENBQXFCLE1BQXZCLElBQ2pCLE1BQU0sY0FBTixDQUFxQixJQUFyQixDQUEwQixVQUFDLE1BQUQ7QUFBQSxZQUFZLE9BQU8sRUFBUCxLQUFjLE9BQU8sSUFBUCxDQUFZLEVBQXRDO0FBQUEsS0FBMUIsQ0FESjtBQUVBLFFBQUksaUJBQWlCLGlCQUFpQixNQUFNLGNBQXZCLGdDQUE0QyxNQUFNLGNBQWxELElBQWtFLE9BQU8sSUFBekUsRUFBckI7QUFDQSw0QkFDSSxLQURKO0FBRUMsYUFBUSxPQUFPLElBRmhCO0FBR0Msb0JBQWUsT0FBTyxJQUh2QjtBQUlDLGtEQUNJLGNBREosRUFKRDtBQU9DLGlCQUFZLE9BQU8sSUFBUCxDQUFZLElBUHpCO0FBUUMsZUFBVSxLQVJYO0FBU0Msa0JBQWEsSUFUZDtBQVVDLGlDQUNJLFdBREosQ0FWRDtBQWFDLHdCQUFtQjtBQWJwQjtBQWVBLElBbkJELE1BbUJPO0FBQ04sWUFBUSxJQUFSLENBQWEsc0VBQWI7QUFDQSxlQUFXLEtBQVg7QUFDQTtBQUNEO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsbUJBQWUsT0FBTyxJQUZ2QjtBQUdDLHVCQUFtQjtBQUhwQjtBQUtBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsdUJBQW1CLE9BQU87QUFGM0I7QUFJQTtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLG1CQUFlLE9BQU8sSUFGdkI7QUFHQyxpQkFBYTtBQUhkO0FBS0E7QUFDRDtBQUNDLDJCQUNJLEtBREo7QUFFQyxnQ0FDSSxXQURKLENBRkQ7QUFLQyxpQkFBYTtBQUxkO0FBT0E7QUFDRDtBQUNDLDJCQUNJLFVBREo7QUFHQTtBQUNEO0FBQ0MsY0FBVyxLQUFYO0FBbkVGO0FBcUVBLFFBQU8sY0FBUCxDQUFzQixPQUF0QixDQUE4QixPQUE5QixFQUF1QyxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXZDO0FBQ0EsUUFBTyxRQUFQO0FBQ0EsQ0F6RUQ7O2tCQTJFZSxROzs7Ozs7Ozs7O0FDNUdmOztBQUNBOzs7Ozs7QUFFTyxJQUFJLHdCQUFRLDRDQUVsQixPQUFPLDRCQUFQLElBQXVDLE9BQU8sNEJBQVAsRUFGckIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7QXBwQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvYXBwLmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9e3N0b3JlfT5cblx0XHQ8QXBwQ29tcG9uZW50IC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pOyIsIi8qKlxuICogTW90aW9uTGFiIGRlYWxzIHdpdGggY29udHJvbGxpbmcgZWFjaCB0aWNrIG9mIHRoZSBhbmltYXRpb24gZnJhbWUgc2VxdWVuY2VcbiAqIEl0J3MgYWltIGlzIHRvIGlzb2xhdGUgY29kZSB0aGF0IGhhcHBlbnMgb3ZlciBhIG51bWJlciBvZiBmcmFtZXMgKGkuZS4gbW90aW9uKVxuICovXG5pbXBvcnQge1Byb3BzLCBNQUlOX0FSVElTVF9URVhULCBSRUxBVEVEX0FSVElTVF9URVhUfSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jb25zdCBUUkFDS19DQU1fVE9fT0JKID0gJ1RSQUNLX0NBTV9UT19PQkonO1xuY29uc3QgREVGQVVMVCA9ICdERUZBVUxUJztcbmNvbnN0IGRlZmF1bHRKb2IgPSB7XG5cdHR5cGU6IERFRkFVTFRcbn07XG5cbmV4cG9ydCBjbGFzcyBNb3Rpb25MYWIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0XHR0aGlzLmFuaW1hdGUoKTtcblx0fVxuXG5cdGFuaW1hdGUoKSB7XG5cdFx0UHJvcHMudDIgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucHJvY2Vzc1NjZW5lKCk7XG5cdFx0UHJvcHMucmVuZGVyZXIucmVuZGVyKFByb3BzLnNjZW5lLCBQcm9wcy5jYW1lcmEpO1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXHRcdFx0UHJvcHMudDEgPSBQcm9wcy50Mjtcblx0XHRcdHRoaXMuYW5pbWF0ZS5jYWxsKHRoaXMpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvY2Vzc1NjZW5lKCkge1xuXHRcdHN3aXRjaCAodGhpcy5qb2IudHlwZSkge1xuXHRcdFx0Y2FzZSBUUkFDS19DQU1fVE9fT0JKOlxuXHRcdFx0XHR0aGlzLnRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERFRkFVTFQ6XG5cdFx0XHRcdHRoaXMudXBkYXRlUm90YXRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpIHtcblx0XHRjb25zdCBzaG91bGRFbmQgPSBwYXJzZUludCh0aGlzLmpvYi5jdXJyZW50VGltZSkgPT09IDE7XG5cdFx0aWYgKCFzaG91bGRFbmQpIHtcblx0XHRcdHRoaXMuZm9sbG93UGF0aCgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuZW5kQW5pbWF0aW9uKCk7XG5cdFx0fVxuXHR9XG5cblx0Zm9sbG93UGF0aCgpIHtcblx0XHRjb25zdCBwID0gdGhpcy5qb2IucGF0aC5nZXRQb2ludCh0aGlzLmpvYi5jdXJyZW50VGltZSk7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QucG9zaXRpb24uY29weShwKTtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSArPSAwLjAxO1xuXHR9XG5cblx0ZW5kQW5pbWF0aW9uKCkge1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrICYmIHRoaXMuam9iLmNhbGxiYWNrKCk7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHR9XG5cblx0dHJhY2tPYmplY3RUb0NhbWVyYShvYmplY3QzRCwgY2FsbGJhY2spIHtcbiAgICBcdHRoaXMuam9iID0ge307XG4gICAgXHR0aGlzLmpvYi50eXBlID0gVFJBQ0tfQ0FNX1RPX09CSjtcblx0XHR0aGlzLmpvYi50ID0gMC4wO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lID0gMC4wO1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QgPSBvYmplY3QzRDtcblx0XHR0aGlzLmpvYi5lbmRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuam9iLnBhdGggPSBuZXcgVEhSRUUuQ2F0bXVsbFJvbUN1cnZlMyhbXG5cdFx0XHRvYmplY3QzRC5wb3NpdGlvbi5jbG9uZSgpLFxuXHRcdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKClcblx0XHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUT0RPOiBvcHRpbWlzYXRpb24gLSBvbmx5IHVzZSB1cGRhdGVSb3RhdGlvbigpIGlmIHRoZSBtb3VzZSBpcyBkcmFnZ2luZyAvIHNwZWVkIGlzIGFib3ZlIGRlZmF1bHQgbWluaW11bVxuXHQgKiBSb3RhdGlvbiBvZiBjYW1lcmEgaXMgKmludmVyc2UqIG9mIG1vdXNlIG1vdmVtZW50IGRpcmVjdGlvblxuXHQgKi9cblx0dXBkYXRlUm90YXRpb24oKSB7XG5cdFx0Y29uc3QgY2FtUXVhdGVybmlvblVwZGF0ZSA9IHRoaXMuZ2V0TmV3Q2FtZXJhRGlyZWN0aW9uKCk7XG5cdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLnNldChcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueCAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS55ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnogKiBQcm9wcy5jYW1lcmFEaXN0YW5jZVxuXHRcdCk7XG5cdFx0UHJvcHMuY2FtZXJhLmxvb2tBdChQcm9wcy5jYW1lcmFMb29rQXQpO1xuXHRcdC8vIHVwZGF0ZSByb3RhdGlvbiBvZiB0ZXh0IGF0dGFjaGVkIG9iamVjdHMsIHRvIGZvcmNlIHRoZW0gdG8gbG9vayBhdCBjYW1lcmFcblx0XHQvLyB0aGlzIG1ha2VzIHRoZW0gcmVhZGFibGVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci50cmF2ZXJzZSgob2JqKSA9PiB7XG5cdFx0XHRpZiAob2JqLnR5cGUgPT09IE1BSU5fQVJUSVNUX1RFWFQgfHwgb2JqLnR5cGUgPT09IFJFTEFURURfQVJUSVNUX1RFWFQpIHtcblx0XHRcdFx0bGV0IGNhbWVyYU5vcm0gPSBQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqLnBvc2l0aW9uLnNldChcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnggKiBvYmoucGFyZW50LnJhZGl1cyxcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnkgKiBvYmoucGFyZW50LnJhZGl1cyxcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnogKiBvYmoucGFyZW50LnJhZGl1c1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRvYmoubG9va0F0KFByb3BzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbChQcm9wcy5jYW1lcmEucG9zaXRpb24pKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnJlZHVjZVNwZWVkKDAuMDAwNSk7XG5cdH1cblxuXHRnZXROZXdDYW1lcmFEaXJlY3Rpb24oKSB7XG5cdFx0bGV0IGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdFx0Y29uc3QgeU1vcmVUaGFuWE1vdXNlID0gUHJvcHMubW91c2VQb3NEaWZmWSA+PSBQcm9wcy5tb3VzZVBvc0RpZmZYO1xuXHRcdGNvbnN0IHhNb3JlVGhhbllNb3VzZSA9ICF5TW9yZVRoYW5YTW91c2U7XG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggLT0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCArPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgKz0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSAtPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUgPSBTY2VuZVV0aWxzLnJlbm9ybWFsaXplUXVhdGVybmlvbihQcm9wcy5jYW1lcmEpO1xuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUuc2V0RnJvbUV1bGVyKFByb3BzLmNhbWVyYVJvdGF0aW9uKTtcblx0XHRyZXR1cm4gY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmIChQcm9wcy5zcGVlZFggPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRYIC09IGFtb3VudDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWSAtPSBhbW91bnQ7XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5leHBvcnQgY29uc3QgUHJvcHMgPSB7XG5cdHJlbmRlcmVyOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBhbHBoYTogdHJ1ZX0pLFxuXHRzY2VuZTogbmV3IFRIUkVFLlNjZW5lKCksXG5cdGNhbWVyYTogbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgNTAwLCAxNTAwMDApLFxuXHRncmFwaENvbnRhaW5lcjogbmV3IFRIUkVFLk9iamVjdDNEKCksXG5cdGNhbWVyYVJvdGF0aW9uOiBuZXcgVEhSRUUuRXVsZXIoMCwgLTEsIDApLFxuXHRjYW1lcmFMb29rQXQ6IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXHRjYW1lcmFEaXN0YW5jZTogMzUwMCxcblx0XG5cdHQxOiAwLjAsIC8vIG9sZCB0aW1lXG5cdHQyOiAwLjAsIC8vIG5vdyB0aW1lXG5cdHNwZWVkWDogMC4wMDUsXG5cdHNwZWVkWTogMC4wMDAsXG5cdG1vdXNlUG9zRGlmZlg6IDAuMCxcblx0bW91c2VQb3NEaWZmWTogMC4wLFxuXHRtb3VzZVBvc1hJbmNyZWFzZWQ6IGZhbHNlLFxuXHRtb3VzZVBvc1lJbmNyZWFzZWQ6IGZhbHNlLFxuXHRyYXljYXN0ZXI6IG5ldyBUSFJFRS5SYXljYXN0ZXIoKSxcblx0bW91c2VWZWN0b3I6IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFxuXHRyZWxhdGVkQXJ0aXN0U3BoZXJlczogW10sXG5cdG1haW5BcnRpc3RTcGhlcmU6IHt9LFxuXHRzZWxlY3RlZEFydGlzdFNwaGVyZToge2lkOiAwfVxufTtcblxuZXhwb3J0IGNvbnN0IE1BSU5fQVJUSVNUX1NQSEVSRSA9ICdNQUlOX0FSVElTVF9TUEhFUkUnO1xuZXhwb3J0IGNvbnN0IFJFTEFURURfQVJUSVNUX1NQSEVSRSA9ICdSRUxBVEVEX0FSVElTVF9TUEhFUkUnO1xuZXhwb3J0IGNvbnN0IE1BSU5fQVJUSVNUX1RFWFQgPSAnTUFJTl9BUlRJU1RfVEVYVCc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9BUlRJU1RfVEVYVCA9ICdSRUxBVEVEX0FSVElTVF9URVhUJztcbmV4cG9ydCBjb25zdCBDT05ORUNUSU5HX0xJTkUgPSAnQ09OTkVDVElOR19MSU5FJzsiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gJy4uL2NvbmZpZy9jb2xvdXJzJztcbmltcG9ydCB7XG5cdENPTk5FQ1RJTkdfTElORSwgTUFJTl9BUlRJU1RfU1BIRVJFLCBSRUxBVEVEX0FSVElTVF9TUEhFUkUsIFByb3BzLFxuXHRSRUxBVEVEX0FSVElTVF9URVhULCBNQUlOX0FSVElTVF9URVhUXG59IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtTdGF0aXN0aWNzfSBmcm9tICcuL3N0YXRpc3RpY3MuY2xhc3MnO1xuaW1wb3J0IHtWZWN0b3IzfSBmcm9tIFwidGhyZWVcIjtcblxubGV0IEhFTFZFVElLRVI7XG5jb25zdCBNQUlOX0FSVElTVF9GT05UX1NJWkUgPSAzNDtcbmNvbnN0IFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSA9IDIwO1xuY29uc3QgVE9UQUxfUkVMQVRFRCA9IDY7XG5jb25zdCBSRUxBVEVEX1BPU1RJT05TID0gW1xuXHRuZXcgVmVjdG9yMygxLCAwLCAwKSwgbmV3IFZlY3RvcjMoLTEsIDAsIDApLFxuXHRuZXcgVmVjdG9yMygwLCAxLCAwKSwgbmV3IFZlY3RvcjMoMCwgLTEsIDApLFxuXHRuZXcgVmVjdG9yMygwLCAwLCAxKSwgbmV3IFZlY3RvcjMoMCwgMCwgLTEpXG5dO1xuXG5jbGFzcyBTY2VuZVV0aWxzIHtcblx0c3RhdGljIGluaXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0XHRsb2FkZXIubG9hZCgnLi9qcy9mb250cy9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbicsIChmb250KSA9PiB7XG5cdFx0XHRcdEhFTFZFVElLRVIgPSBmb250O1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAoKT0+e30sIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhIC0gbWluXG5cdCAqIEBwYXJhbSBiIC0gbWF4XG5cdCAqIEBwYXJhbSBjIC0gdmFsdWUgdG8gY2xhbXBcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBjbGFtcChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KGIsIE1hdGgubWluKGMsIGEpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBwb3NpdGl2ZSB4IHJldHVybiAxLCBuZWdhdGl2ZSB4IHJldHVybiAtMSwgb3IgMCBvdGhlcndpc2Vcblx0ICogQHBhcmFtIG5cblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBzaWduKG4pIHtcblx0XHRyZXR1cm4gbiA+IDAgPyAxIDogbiA8IDAgPyAtMSA6IDA7XG5cdH07XG5cdFxuXHRzdGF0aWMgcmVub3JtYWxpemVRdWF0ZXJuaW9uKG9iamVjdCkge1xuXHRcdGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpIHtcblx0XHRQcm9wcy5yYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShQcm9wcy5tb3VzZVZlY3RvciwgUHJvcHMuY2FtZXJhKTtcblx0XHRyZXR1cm4gUHJvcHMucmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoUHJvcHMuZ3JhcGhDb250YWluZXIuY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGdldE1vdXNlVmVjdG9yKGV2ZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKChldmVudC5jbGllbnRYIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCkge1xuXHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IGFydGlzdDtcblx0XHRzcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdHNwaGVyZS50eXBlID0gTUFJTl9BUlRJU1RfU1BIRVJFO1xuXHRcdHNwaGVyZS5jb2xvdXJzID0ge307XG5cdFx0c3BoZXJlLmNvbG91cnMuZGVmYXVsdCA9IENvbG91cnMubWFpbkFydGlzdDtcblx0XHRzcGhlcmUuY29sb3Vycy5ob3ZlciA9IENvbG91cnMubWFpbkFydGlzdEhvdmVyO1xuXHRcdHNwaGVyZS5jb2xvdXJzLnNlbGVjdGVkID0gQ29sb3Vycy5tYWluQXJ0aXN0O1xuXHRcdFNjZW5lVXRpbHMuYWRkVGV4dChhcnRpc3QubmFtZSwgTUFJTl9BUlRJU1RfRk9OVF9TSVpFLCBzcGhlcmUsIE1BSU5fQVJUSVNUX1RFWFQpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBtYWluQXJ0aXN0U3BoZXJlKSB7XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkgPSBbXTtcblx0XHRsZXQgcmVsYXRlZEFydGlzdDtcblx0XHRsZXQgc3BoZXJlRmFjZUluZGV4ID0gMDtcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIFRPVEFMX1JFTEFURUQgLSAxKTtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbihUT1RBTF9SRUxBVEVELCBhcnRpc3QucmVsYXRlZC5sZW5ndGgpOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHJlbGF0ZWRBcnRpc3QgPSBhcnRpc3QucmVsYXRlZFtpXTtcblx0XHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRsZXQgZ2VucmVNZXRyaWNzID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS50eXBlID0gUkVMQVRFRF9BUlRJU1RfU1BIRVJFO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmogPSByZWxhdGVkQXJ0aXN0O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmouZ2VucmVTaW1pbGFyaXR5ID0gZ2VucmVNZXRyaWNzLmdlbnJlU2ltaWxhcml0eTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuZGlzdGFuY2UgPSBnZW5yZU1ldHJpY3MubGluZUxlbmd0aDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5jb2xvdXJzID0ge307XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmNvbG91cnMuZGVmYXVsdCA9IENvbG91cnMucmVsYXRlZEFydGlzdDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuY29sb3Vycy5ob3ZlciA9IENvbG91cnMucmVsYXRlZEFydGlzdEhvdmVyO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5jb2xvdXJzLnNlbGVjdGVkID0gQ29sb3Vycy5yZWxhdGVkQXJ0aXN0Q2xpY2tlZDtcblx0XHRcdFNjZW5lVXRpbHMucG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCk7XG5cdFx0XHRTY2VuZVV0aWxzLmpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0U2NlbmVVdGlscy5hZGRUZXh0KHJlbGF0ZWRBcnRpc3QubmFtZSwgUkVMQVRFRF9BUlRJU1RfRk9OVF9TSVpFLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBSRUxBVEVEX0FSVElTVF9URVhUKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkucHVzaChyZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdHNwaGVyZUZhY2VJbmRleCArPSBzdGVwO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheTtcblx0fVxuXG5cdHN0YXRpYyBhcHBlbmRPYmplY3RzVG9TY2VuZShncmFwaENvbnRhaW5lciwgc3BoZXJlLCBzcGhlcmVBcnJheSkge1xuXHRcdGNvbnN0IHBhcmVudCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXHRcdHBhcmVudC5uYW1lID0gJ3BhcmVudCc7XG5cdFx0cGFyZW50LmFkZChzcGhlcmUpO1xuXHRcdGlmIChzcGhlcmVBcnJheSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGhlcmVBcnJheS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRwYXJlbnQuYWRkKHNwaGVyZUFycmF5W2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Z3JhcGhDb250YWluZXIuYWRkKHBhcmVudCk7XG5cdH1cblxuXHRzdGF0aWMgam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSkge1xuXHRcdGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZExpbmVKb2lufSk7XG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0bGV0IGxpbmU7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChyZWxhdGVkU3BoZXJlLnBvc2l0aW9uLmNsb25lKCkpO1xuXHRcdGxpbmUgPSBuZXcgVEhSRUUuTGluZShnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXHRcdGxpbmUudHlwZSA9IENPTk5FQ1RJTkdfTElORTtcblx0XHRtYWluQXJ0aXN0U3BoZXJlLmFkZChsaW5lKTtcblx0fVxuXG5cdHN0YXRpYyBwb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KSB7XG5cdFx0bGV0IG1haW5BcnRpc3RTcGhlcmVGYWNlID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlc1tNYXRoLmZsb29yKHNwaGVyZUZhY2VJbmRleCldLm5vcm1hbC5jbG9uZSgpO1xuXHRcdHJlbGF0ZWRTcGhlcmUucG9zaXRpb25cblx0XHRcdC5jb3B5KG1haW5BcnRpc3RTcGhlcmVGYWNlLm11bHRpcGx5KG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIGFkZFRleHQobGFiZWwsIHNpemUsIHNwaGVyZSwgdGV4dFR5cGUpIHtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogc2l6ZSxcblx0XHRcdGN1cnZlU2VnbWVudHM6IDQsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMixcblx0XHRcdGJldmVsU2l6ZTogMSxcblx0XHRcdGJldmVsU2VnbWVudHM6IDNcblx0XHR9KTtcblx0XHRsZXQgdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0ZXh0R2VvbSwgbWF0ZXJpYWxBcnJheSk7XG5cdFx0bGV0IGNhbWVyYU5vcm0gPSBQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5ub3JtYWxpemUoKTtcblx0XHR0ZXh0TWVzaC50eXBlID0gdGV4dFR5cGU7XG5cdFx0c3BoZXJlLmFkZCh0ZXh0TWVzaCk7XG5cdFx0dGV4dE1lc2gucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtZXJhTm9ybS54ICogc3BoZXJlLnJhZGl1cyxcblx0XHRcdGNhbWVyYU5vcm0ueSAqIHNwaGVyZS5yYWRpdXMsXG5cdFx0XHRjYW1lcmFOb3JtLnogKiBzcGhlcmUucmFkaXVzXG5cdFx0KTtcblx0XHR0ZXh0TWVzaC5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHR9XG5cblx0c3RhdGljIGxpZ2h0aW5nKCkge1xuXHRcdGxldCBsaWdodEEgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGNjY2NjYywgMS43MjUpO1xuXHRcdGxldCBsaWdodEIgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGFhYWFhYSwgMS41KTtcblx0XHRsaWdodEEucG9zaXRpb24uc2V0WCg1MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRZKC04MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRYKC01MDApO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEEpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEIpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiLyoqXG4gKiBTcGhlcmVzU2NlbmUgaXMgZGVzaWduZWQgdG8gaGFuZGxlIGFkZGluZyBhbmQgcmVtb3ZpbmcgZW50aXRpZXMgZnJvbSB0aGUgc2NlbmUsXG4gKiBhbmQgaGFuZGxpbmcgZXZlbnRzLlxuICpcbiAqIEl0IGFpbXMgdG8gZGVhbCBub3Qgd2l0aCBjaGFuZ2VzIG92ZXIgdGltZSwgb25seSBpbW1lZGlhdGUgY2hhbmdlcyBpbiBvbmUgZnJhbWUuXG4gKi9cbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSBcIi4uL2NvbmZpZy9jb2xvdXJzXCI7XG5pbXBvcnQge01vdGlvbkxhYn0gZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5pbXBvcnQge1xuXHRNQUlOX0FSVElTVF9TUEhFUkUsIE1BSU5fQVJUSVNUX1RFWFQsIFByb3BzLCBSRUxBVEVEX0FSVElTVF9TUEhFUkUsIFJFTEFURURfQVJUSVNUX1RFWFQsXG5cdFRFWFRfR0VPTUVUUllcbn0gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2hpZGVSZWxhdGVkLCByZWxhdGVkQ2xpY2ssIHNob3dSZWxhdGVkfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0bGV0IGFydGlzdElkO1xuXHRcdHRoaXMubW90aW9uTGFiID0gbmV3IE1vdGlvbkxhYigpO1xuXHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IG51bGw7XG5cdFx0dGhpcy5zZWxlY3RlZFNwaGVyZSA9IG51bGw7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0gUHJvcHMubWFpbkFydGlzdFNwaGVyZTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyk7XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRsZXQgaW50ZXJzZWN0cztcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VJc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpO1xuXHRcdHRoaXMudW5IaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCk7XG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7XG5cdFx0XHRzZWxlY3RlZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0O1xuXHRcdFx0c3dpdGNoIChzZWxlY3RlZC50eXBlKSB7XG5cdFx0XHRcdGNhc2UgTUFJTl9BUlRJU1RfU1BIRVJFOlxuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHRpc092ZXJSZWxhdGVkID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLmhpZ2hsaWdodEhvdmVyZWRTcGhlcmUoKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBNQUlOX0FSVElTVF9URVhUOlxuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1RFWFQ6XG5cdFx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRcdHRoaXMuaGlnaGxpZ2h0SG92ZXJlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHRcdHJldHVybiBpc092ZXJSZWxhdGVkO1xuXHR9XG5cblx0dW5IaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCkge1xuXHRcdGlmICghdGhpcy5ob3ZlcmVkU3BoZXJlSXNTZWxlY3RlZCgpKSB7XG5cdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KHRoaXMuaG92ZXJlZFNwaGVyZS5jb2xvdXJzLmRlZmF1bHQpO1xuXHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gbnVsbDtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkU3BoZXJlLnR5cGUgIT09IFJFTEFURURfQVJUSVNUX1NQSEVSRSkge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRoaWdobGlnaHRIb3ZlcmVkU3BoZXJlKCkge1xuXHRcdGlmICghdGhpcy5ob3ZlcmVkU3BoZXJlSXNTZWxlY3RlZCgpKSB7XG5cdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KHRoaXMuaG92ZXJlZFNwaGVyZS5jb2xvdXJzLmhvdmVyKTtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkU3BoZXJlLnR5cGUgIT09IFJFTEFURURfQVJUSVNUX1NQSEVSRSkge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChzaG93UmVsYXRlZCh0aGlzLmhvdmVyZWRTcGhlcmUuYXJ0aXN0T2JqKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aG92ZXJlZFNwaGVyZUlzU2VsZWN0ZWQoKSB7XG5cdFx0cmV0dXJuICEodGhpcy5zZWxlY3RlZFNwaGVyZSAmJiB0aGlzLmhvdmVyZWRTcGhlcmUgJiYgdGhpcy5ob3ZlcmVkU3BoZXJlLmlkICE9PSB0aGlzLnNlbGVjdGVkU3BoZXJlLmlkKTtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmICh0aGlzLnNlbGVjdGVkU3BoZXJlICYmIHNlbGVjdGVkLmlkID09PSB0aGlzLnNlbGVjdGVkU3BoZXJlLmlkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAoc2VsZWN0ZWQudHlwZSkge1xuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHR0aGlzLnJlc2V0Q2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLnNldHVwQ2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHN0b3JlLmRpc3BhdGNoKHNob3dSZWxhdGVkKHRoaXMuc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfVEVYVDpcblx0XHRcdFx0XHR0aGlzLnJlc2V0Q2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUgPSBzZWxlY3RlZC5wYXJlbnQ7XG5cdFx0XHRcdFx0dGhpcy5zZXR1cENsaWNrZWRTcGhlcmUoKTtcblx0XHRcdFx0XHRzdG9yZS5kaXNwYXRjaChzaG93UmVsYXRlZCh0aGlzLnNlbGVjdGVkU3BoZXJlLmFydGlzdE9iaikpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHR0aGlzLnJlc2V0Q2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUgPSBzZWxlY3RlZDtcblx0XHRcdFx0XHR0aGlzLnNldHVwQ2xpY2tlZFNwaGVyZSgpO1xuXHRcdFx0XHRcdHN0b3JlLmRpc3BhdGNoKGhpZGVSZWxhdGVkKCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1RFWFQ6XG5cdFx0XHRcdFx0dGhpcy5yZXNldENsaWNrZWRTcGhlcmUoKTtcblx0XHRcdFx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKCk7XG5cdFx0XHRcdFx0c3RvcmUuZGlzcGF0Y2goaGlkZVJlbGF0ZWQoKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVzZXRDbGlja2VkU3BoZXJlKCk7XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHR9XG5cdH1cblxuXHRzZXR1cENsaWNrZWRTcGhlcmUoKSB7XG5cdFx0dGhpcy5zZWxlY3RlZFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgodGhpcy5zZWxlY3RlZFNwaGVyZS5jb2xvdXJzLnNlbGVjdGVkKTtcblx0XHRNdXNpY0RhdGFTZXJ2aWNlLmZldGNoRGlzcGxheUFsYnVtcyh0aGlzLnNlbGVjdGVkU3BoZXJlLmFydGlzdE9iaik7XG5cdH1cblxuXHRyZXNldENsaWNrZWRTcGhlcmUoKSB7XG5cdFx0aWYgKCF0aGlzLnNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2VsZWN0ZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KHRoaXMuc2VsZWN0ZWRTcGhlcmUuY29sb3Vycy5kZWZhdWx0KTtcblx0XHR0aGlzLnNlbGVjdGVkU3BoZXJlID0gbnVsbDtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZURyYWcoZXZlbnQpIHtcblx0XHRjb25zdCBkdCA9IFByb3BzLnQyIC0gUHJvcHMudDE7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueCA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLngpO1xuXHRcdFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci55ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWCA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLngpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueCkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlkgPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci55KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpKTtcblx0XHRQcm9wcy5zcGVlZFggPSAoKDEgKyBQcm9wcy5tb3VzZVBvc0RpZmZYKSAvIGR0KTtcblx0XHRQcm9wcy5zcGVlZFkgPSAoKDEgKyBQcm9wcy5tb3VzZVBvc0RpZmZZKSAvIGR0KTtcblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHR9XG5cblx0Z2V0UmVsYXRlZEFydGlzdChzZWxlY3RlZFNwaGVyZSkge1xuXHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFNjZW5lVXRpbHMuYXBwZW5kT2JqZWN0c1RvU2NlbmUoUHJvcHMuZ3JhcGhDb250YWluZXIsIHNlbGVjdGVkU3BoZXJlKTtcblx0XHR0aGlzLm1vdGlvbkxhYi50cmFja09iamVjdFRvQ2FtZXJhKHNlbGVjdGVkU3BoZXJlLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KHNlbGVjdGVkU3BoZXJlLmFydGlzdE9iai5pZCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjbGVhckdyYXBoKCkge1xuXHRcdGNvbnN0IHBhcmVudCA9IFByb3BzLmdyYXBoQ29udGFpbmVyLmdldE9iamVjdEJ5TmFtZSgncGFyZW50Jyk7XG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0UHJvcHMuZ3JhcGhDb250YWluZXIucmVtb3ZlKHBhcmVudCk7XG5cdFx0fVxuXHR9XG5cblx0Y2xlYXJBZGRyZXNzKCkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG5cdH1cblxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVDYW1lcmFBc3BlY3QoKSB7XG5cdFx0UHJvcHMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdFByb3BzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufVxuIiwiY29uc3QgTUFYX0RJU1RBTkNFID0gODAwO1xuY29uc3QgU0laRV9TQ0FMQVJfU01BTEwgPSAxLjI1O1xuY29uc3QgU0laRV9TQ0FMQVJfQklHID0gMS43NTtcblxuZXhwb3J0IGNsYXNzIFN0YXRpc3RpY3Mge1xuICAgIHN0YXRpYyBnZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkge1xuICAgIFx0aWYgKGFydGlzdC5wb3B1bGFyaXR5ID49IDUwKSB7XG5cdFx0XHRyZXR1cm4gYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUl9CSUc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSX1NNQUxMO1xuXHRcdH1cblxuICAgIH1cblxuXHQvKipcbiAgICAgKiBNYXAtcmVkdWNlIG9mIHR3byBzdHJpbmcgYXJyYXlzXG5cdCAqIEBwYXJhbSBhcnRpc3Rcblx0ICogQHBhcmFtIHJlbGF0ZWRBcnRpc3Rcblx0ICogQHJldHVybnMge29iamVjdH1cblx0ICovXG5cdHN0YXRpYyBnZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpIHtcblx0XHRsZXQgdW5pdCwgZ2VucmVTaW1pbGFyaXR5LCByZWxhdGl2ZU1pbkRpc3RhbmNlLCBhcnRpc3RHZW5yZUNvdW50O1xuXHRcdGxldCBtYXRjaGVzID0gYXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLm1hcCgobWFpbkFydGlzdEdlbnJlKSA9PiBTdGF0aXN0aWNzLm1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkpXG4gICAgICAgICAgICAucmVkdWNlKChhY2N1bXVsYXRvciwgbWF0Y2gpID0+IHtcblx0XHQgICAgICAgIGlmIChtYXRjaCkge1xuXHRcdCAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHR9XG5cdFx0ICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgICAgICAgICB9LCBbXSk7XG5cdFx0YXJ0aXN0R2VucmVDb3VudCA9IGFydGlzdC5nZW5yZXMubGVuZ3RoID8gYXJ0aXN0LmdlbnJlcy5sZW5ndGggOiAxO1xuXHRcdHVuaXQgPSAxIC8gYXJ0aXN0R2VucmVDb3VudDtcblx0XHR1bml0ID0gdW5pdCA9PT0gMSA/IDAgOiB1bml0O1xuXHRcdGdlbnJlU2ltaWxhcml0eSA9IG1hdGNoZXMubGVuZ3RoICogdW5pdDtcblx0XHRyZWxhdGl2ZU1pbkRpc3RhbmNlID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkgKyBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxpbmVMZW5ndGg6IChNQVhfRElTVEFOQ0UgLSAoTUFYX0RJU1RBTkNFICogZ2VucmVTaW1pbGFyaXR5KSkgKyByZWxhdGl2ZU1pbkRpc3RhbmNlLFxuXHRcdFx0Z2VucmVTaW1pbGFyaXR5OiBNYXRoLnJvdW5kKGdlbnJlU2ltaWxhcml0eSAqIDEwMClcblx0XHR9O1xuXHR9XG5cblx0c3RhdGljIG1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkge1xuICAgICAgICByZXR1cm4gcmVsYXRlZEFydGlzdC5nZW5yZXNcbiAgICAgICAgICAgIC5maW5kKChnZW5yZSkgPT4gZ2VucmUgPT09IG1haW5BcnRpc3RHZW5yZSk7XG4gICAgfVxuIH0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuaW1wb3J0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyXCI7XG5pbXBvcnQgU2NlbmVDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0TGlzdENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtbGlzdC5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuaW1wb3J0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHAtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxTZWFyY2hDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U3BvdGlmeVBsYXllckNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdExpc3RDb250YWluZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0SW5mb0NvbXBvbmVudCh7YXJ0aXN0LCBpc0hpZGRlbn0pIHtcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIiBrZXk9e2dlbnJlfT57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBpbmZvLWNvbnRhaW5lciBtYWluJyA6ICdpbmZvLWNvbnRhaW5lciBtYWluJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyBtYWluXCI+e2FydGlzdC5uYW1lfTwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwb3B1bGFyaXR5XCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5Qb3B1bGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPnthcnRpc3QucG9wdWxhcml0eX08L3NwYW4+PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPntnZW5yZXN9PC9kaXY+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5leHBvcnQgY2xhc3MgQXJ0aXN0TGlzdENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdH1cblxuXHRoYW5kbGVHZXRBcnRpc3QoZXZ0LCBhcnRpc3RJZCkge1xuXHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KGFydGlzdElkKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgYXJ0aXN0cyA9IHRoaXMucHJvcHMudmlzaXRlZEFydGlzdHMubWFwKChhcnRpc3QpID0+IHtcblx0XHRcdGxldCBocmVmID0gJy9hcHAvIycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0LmlkKTtcblx0XHRcdGxldCBpbWdVcmwgPSBhcnRpc3QuaW1hZ2VzICYmIGFydGlzdC5pbWFnZXMubGVuZ3RoID8gYXJ0aXN0LmltYWdlc1thcnRpc3QuaW1hZ2VzLmxlbmd0aCAtIDFdLnVybCA6ICcnO1xuXHRcdFx0bGV0IGltZ1N0eWxlID0geyBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpbWdVcmx9KWAgfTtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0XCIga2V5PXthcnRpc3QuaWR9PlxuXHRcdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiXG5cdFx0XHRcdFx0ICAgb25DbGljaz17KGV2ZW50KSA9PiB7IHRoaXMuaGFuZGxlR2V0QXJ0aXN0KGV2ZW50LCBhcnRpc3QuaWQpIH19PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlLWhvbGRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzdHlsZT17aW1nU3R5bGV9IC8+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpXG5cdFx0fSk7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IHRoaXMucHJvcHMuaXNIaWRkZW4gPyAnaGlkZGVuIGFydGlzdC1uYXZpZ2F0aW9uJyA6ICdhcnRpc3QtbmF2aWdhdGlvbic7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSByZWY9e2VsZW0gPT4gdGhpcy5hcnRpc3RMaXN0RG9tID0gZWxlbX0+XG5cdFx0XHRcdHthcnRpc3RzfVxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbFRvcCA9IHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxIZWlnaHQ7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbFRvcCA9IHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxIZWlnaHQ7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50KHtyZWxhdGVkQXJ0aXN0LCBoaWRlUmVsYXRlZCwgaGlkZUluZm99KSB7XG5cdGNvbnN0IGhpZGRlbkNsYXNzID0gaGlkZVJlbGF0ZWQgfHwgaGlkZUluZm8gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIHJlbGF0ZWQnIDogJ2luZm8tY29udGFpbmVyIHJlbGF0ZWQnO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtoaWRkZW5DbGFzc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyByZWxhdGVkXCI+e3JlbGF0ZWRBcnRpc3QubmFtZX08L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57cmVsYXRlZEFydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5HZW5yZSBzaW1pbGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LmdlbnJlU2ltaWxhcml0eX0lPC9zcGFuPjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuLi9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge1NwaGVyZXNTY2VuZX0gZnJvbSBcIi4uL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzc1wiO1xuaW1wb3J0IHtyZWxhdGVkQ2xpY2t9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTY2VuZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiIHJlZj17ZWxlbSA9PiB0aGlzLnNjZW5lRG9tID0gZWxlbX0gLz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKS50aGVuKCgpID0+IHsgLy8gbG9hZCB0aGUgZm9udCBmaXJzdCAoYXN5bmMpXG5cdFx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0fVxuXG5cdGluaXRTY2VuZSgpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNsZWFyR3JhcGgoKTtcblx0XHRcdHRoaXMuc2NlbmUuY2xlYXJBZGRyZXNzKCk7XG5cdFx0fVxuXHR9XG5cblx0aGFuZGxlRXZlbnQoZXZlbnQpIHtcblx0XHR0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcblx0fVxuXG5cdGNsaWNrKGV2ZW50KSB7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAoIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VDbGljayhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlbW92ZShldmVudCkge1xuXHRcdGxldCBpc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAodGhpcy5tb3VzZUlzRG93bikge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlRHJhZyhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KTtcblx0XHR9XG5cdFx0aWYgKGlzT3ZlclJlbGF0ZWQgJiYgIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBwb2ludGVyJztcblx0XHR9XG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiYmVkJztcblx0XHR9XG5cdH1cblxuXHRtb3VzZWRvd24oKSB7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IHRydWU7XG5cdH1cblxuXHRtb3VzZXVwKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSBmYWxzZTtcblx0fVxuXG5cdG1vdXNld2hlZWwoZXZlbnQpIHtcblx0XHRzd2l0Y2ggKFNjZW5lVXRpbHMuc2lnbihldmVudC53aGVlbERlbHRhWSkpIHtcblx0XHRcdGNhc2UgLTE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnb3V0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ2luJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLnNjZW5lLnVwZGF0ZUNhbWVyYUFzcGVjdCgpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgYXJ0aXN0LCBoYW5kbGVTZWFyY2gsIGhhbmRsZVNlYXJjaFRlcm1VcGRhdGUsIGNsZWFyU2Vzc2lvbn0pIHtcbiAgICBjb25zdCBjbGVhckJ0bkNsYXNzID0gYXJ0aXN0LmlkID8gJ2NsZWFyLXNlc3Npb24nIDogJ2hpZGRlbiBjbGVhci1zZXNzaW9uJztcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPXtjbGVhckJ0bkNsYXNzfSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KGV2dCkgPT4gY2xlYXJTZXNzaW9uKGV2dCl9PkNsZWFyIFNlc3Npb248L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGNsYXNzIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcih7YWxidW1DbGlja0hhbmRsZXJ9KSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFsYnVtQ2xpY2tIYW5kbGVyID0gYWxidW1DbGlja0hhbmRsZXI7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgeyBkaXNwbGF5QWxidW1JbmRleCwgZGlzcGxheUFydGlzdCwgaXNIaWRkZW4gfSA9IHRoaXMucHJvcHM7XG5cdFx0Y29uc3QgZW1iZWRVcmwgPSAnaHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL2VtYmVkP3VyaT1zcG90aWZ5OmFsYnVtOic7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBzcG90aWZ5LXBsYXllci1jb250YWluZXInIDogJ3Nwb3RpZnktcGxheWVyLWNvbnRhaW5lcic7XG5cdFx0Y29uc3QgYWxidW1zID0gZGlzcGxheUFydGlzdC5hbGJ1bXM7XG5cdFx0bGV0IGFydGlzdEVtYmVkVXJsLFxuXHRcdFx0aUZyYW1lTWFya3VwID0gJycsXG5cdFx0XHRhbGJ1bXNMaXN0TWFya3VwID0gJycsXG5cdFx0XHRhbGJ1bUlkO1xuXHRcdFxuXHRcdGlmIChhbGJ1bXMgJiYgYWxidW1zLmxlbmd0aCkge1xuXHRcdFx0YWxidW1JZCA9IGFsYnVtc1tkaXNwbGF5QWxidW1JbmRleF0uaWQ7XG5cdFx0XHRhcnRpc3RFbWJlZFVybCA9IGAke2VtYmVkVXJsfSR7YWxidW1JZH1gO1xuXHRcdFx0aUZyYW1lTWFya3VwID0gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdFx0PGlmcmFtZSBzcmM9e2FydGlzdEVtYmVkVXJsfSB3aWR0aD1cIjMwMFwiIGhlaWdodD1cIjM4MFwiIGZyYW1lQm9yZGVyPVwiMFwiIGFsbG93VHJhbnNwYXJlbmN5PVwidHJ1ZVwiLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdFx0YWxidW1zTGlzdE1hcmt1cCA9IGFsYnVtcy5tYXAoKGFsYnVtLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYWxidW1cIiBrZXk9e2FsYnVtLmlkfT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgb25DbGljaz17KGV2dCkgPT4gdGhpcy5hbGJ1bUNsaWNrSGFuZGxlcihldnQsIGluZGV4KX0+e2FsYnVtLm5hbWV9PC9hPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhbGJ1bXMtbGlzdFwiPlxuXHRcdFx0XHRcdHthbGJ1bXNMaXN0TWFya3VwfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxufVxuIiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZEFydGlzdENsaWNrZWQ6IDB4ZWM5MjUzLFxuXHRyZWxhdGVkTGluZUpvaW46IDB4ZmZmZmNjLFxuXHRtYWluQXJ0aXN0OiAweGZmY2MwMCxcblx0bWFpbkFydGlzdEhvdmVyOiAweGZmZjJiYyxcblx0dGV4dE91dGVyOiAweGZmZmZjYyxcblx0dGV4dElubmVyOiAweDAwMDAzM1xufTsiLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RJbmZvQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0LFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBBcnRpc3RJbmZvQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0TGlzdENvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvYXJ0aXN0LWxpc3QuY29tcG9uZW50XCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dmlzaXRlZEFydGlzdHM6IHN0YXRlLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5cbmNvbnN0IEFydGlzdExpc3RDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0TGlzdENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdExpc3RDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHJlbGF0ZWRBcnRpc3Q6IHN0YXRlLnJlbGF0ZWRBcnRpc3QsXG5cdFx0aGlkZVJlbGF0ZWQ6IHN0YXRlLmhpZGVSZWxhdGVkLFxuXHRcdGhpZGVJbmZvOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQge2NsZWFyU2Vzc2lvbiwgdXBkYXRlU2VhcmNoVGVybX0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm0sXG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBhcnRpc3ROYW1lKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2Uuc2VhcmNoKGFydGlzdE5hbWUpO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fSxcblx0XHRjbGVhclNlc3Npb246IChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZGlzcGF0Y2goY2xlYXJTZXNzaW9uKCkpO1xuXHRcdH1cblx0fVxufTtcblxuY29uc3QgU2VhcmNoQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoU2VhcmNoSW5wdXRDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTcG90aWZ5UGxheWVyQ29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnRcIjtcbmltcG9ydCB7bG9hZEFsYnVtfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm8sXG5cdFx0ZGlzcGxheUFydGlzdDogc3RhdGUuZGlzcGxheUFydGlzdCxcblx0XHRkaXNwbGF5QWxidW1JbmRleDogc3RhdGUuZGlzcGxheUFsYnVtSW5kZXhcblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YWxidW1DbGlja0hhbmRsZXI6IChldnQsIGFsYnVtSW5kZXgpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZGlzcGF0Y2gobG9hZEFsYnVtKGFsYnVtSW5kZXgpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTcG90aWZ5UGxheWVyQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU3BvdGlmeVBsYXllckNvbnRhaW5lcjtcbiIsImltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7YXJ0aXN0RGF0YUF2YWlsYWJsZSwgZGlzcGxheUFsYnVtcywgZGlzcGxheUFydGlzdH0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIE11c2ljRGF0YVNlcnZpY2Uge1xuXHRzdGF0aWMgc2VhcmNoKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdERhdGFBdmFpbGFibGUoanNvbikpKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRBcnRpc3QoYXJ0aXN0SWQpIHtcblx0XHRsZXQgYXJ0aXN0VVJMID0gJy9hcGkvYXJ0aXN0LycgKyBhcnRpc3RJZDtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKGFydGlzdFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGZldGNoRGlzcGxheUFsYnVtcyhhcnRpc3QpIHtcblx0XHRsZXQgYXJ0aXN0VVJMID0gJy9hcGkvYWxidW1zLycgKyBhcnRpc3QuaWQ7XG5cdFx0aWYgKGFydGlzdC5hbGJ1bXMgJiYgYXJ0aXN0LmFsYnVtcy5sZW5ndGgpIHsgLy8gd2UndmUgYWxyZWFkeSBkb3dubG9hZGVkIHRoZSBhbGJ1bSBsaXN0IHNvIGp1c3QgdHJpZ2dlciBVSSB1cGRhdGVcblx0XHRcdCByZXR1cm4gc3RvcmUuZGlzcGF0Y2goZGlzcGxheUFydGlzdChhcnRpc3QpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2luZG93LmZldGNoKGFydGlzdFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4ge1xuXHRcdFx0YXJ0aXN0LmFsYnVtcyA9IGpzb247XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChkaXNwbGF5QXJ0aXN0KGFydGlzdCkpXG5cdFx0fSk7XG5cdH1cbn0iLCJleHBvcnQgY29uc3QgQVJUSVNUX0RBVEFfQVZBSUxBQkxFID0gJ0FSVElTVF9EQVRBX0FWQUlMQUJMRSc7XG5leHBvcnQgY29uc3QgVVBEQVRFX0RJU1BMQVlfQVJUSVNUID0gJ1VQREFURV9ESVNQTEFZX0FSVElTVCc7XG5leHBvcnQgY29uc3QgU0VBUkNIX1RFUk1fVVBEQVRFID0gJ1NFQVJDSF9URVJNX1VQREFURSc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9DTElDSyA9ICdSRUxBVEVEX0NMSUNLJztcbmV4cG9ydCBjb25zdCBTSE9XX1JFTEFURURfSU5GTyA9ICdTSE9XX1JFTEFURURfSU5GTyc7XG5leHBvcnQgY29uc3QgSElERV9SRUxBVEVEX0lORk8gPSAnSElERV9SRUxBVEVEX0lORk8nO1xuZXhwb3J0IGNvbnN0IENMRUFSX1NFU1NJT04gPSAnQ0xFQVJfU0VTU0lPTic7XG5leHBvcnQgY29uc3QgTE9BRF9BTEJVTSA9ICdMT0FEX0FMQlVNJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFydGlzdERhdGFBdmFpbGFibGUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9EQVRBX0FWQUlMQUJMRSxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlBcnRpc3QoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFVQREFURV9ESVNQTEFZX0FSVElTVCxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlYXJjaFRlcm0oc2VhcmNoVGVybSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNFQVJDSF9URVJNX1VQREFURSxcblx0XHRzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0ZWRDbGljayhyZWxhdGVkQXJ0aXN0KSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogUkVMQVRFRF9DTElDSyxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dSZWxhdGVkKHJlbGF0ZWRBcnRpc3QpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTSE9XX1JFTEFURURfSU5GTyxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVSZWxhdGVkKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEhJREVfUkVMQVRFRF9JTkZPLFxuXHRcdGRhdGE6IG51bGxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IENMRUFSX1NFU1NJT05cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEFsYnVtKGFsYnVtSWQpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBMT0FEX0FMQlVNLFxuXHRcdGRhdGE6IGFsYnVtSWRcblx0fVxufVxuIiwiaW1wb3J0IHtcblx0U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEUsIFJFTEFURURfQ0xJQ0ssXG5cdENMRUFSX1NFU1NJT04sIFVQREFURV9ESVNQTEFZX0FSVElTVCwgU0hPV19SRUxBVEVEX0lORk8sIEhJREVfUkVMQVRFRF9JTkZPLCBMT0FEX0FMQlVNXG59IGZyb20gJy4uL2FjdGlvbnMnXG5sZXQgaW5pdGlhbFN0YXRlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc3RhdGUnKTtcbmNvbnN0IGVtcHR5QXJ0aXN0ID0ge1xuXHRpZDogJycsXG5cdG5hbWU6ICcnLFxuXHRpbWdVcmw6ICcnLFxuXHRnZW5yZXM6IFtdLFxuXHRwb3B1bGFyaXR5OiAwLFxuXHRpbWFnZXM6IFtdLFxuXHRhbGJ1bXM6IFtdXG59O1xuY29uc3QgZW1wdHlTdGF0ZSA9IHtcblx0YXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0cmVsYXRlZEFydGlzdDogZW1wdHlBcnRpc3QsXG5cdHNlYXJjaFRlcm06ICcnLFxuXHR2aXNpdGVkQXJ0aXN0czogW10sXG5cdGhpZGVJbmZvOiB0cnVlLFxuXHRzaG93UmVsYXRlZDogZmFsc2UsXG5cdGRpc3BsYXlBcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRkaXNwbGF5QWxidW1JbmRleDogMFxufTtcblxuaWYgKCFpbml0aWFsU3RhdGUpIHtcblx0aW5pdGlhbFN0YXRlID0ge1xuXHRcdC4uLmVtcHR5U3RhdGVcblx0fTtcbn0gZWxzZSB7XG5cdGluaXRpYWxTdGF0ZSA9IEpTT04ucGFyc2UoaW5pdGlhbFN0YXRlKTtcbn1cblxuY29uc3QgYXBwU3RhdGUgPSAoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikgPT4ge1xuXHRsZXQgbmV3U3RhdGU7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLnNlYXJjaFRlcm0sXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBUlRJU1RfREFUQV9BVkFJTEFCTEU6XG5cdFx0XHRpZiAoYWN0aW9uLmRhdGEuaWQpIHtcblx0XHRcdFx0bGV0IGFscmVhZHlWaXNpdGVkID0gISFzdGF0ZS52aXNpdGVkQXJ0aXN0cy5sZW5ndGhcblx0XHRcdFx0XHQmJiBzdGF0ZS52aXNpdGVkQXJ0aXN0cy5zb21lKChhcnRpc3QpID0+IGFydGlzdC5pZCA9PT0gYWN0aW9uLmRhdGEuaWQpO1xuXHRcdFx0XHRsZXQgdmlzaXRlZEFydGlzdHMgPSBhbHJlYWR5VmlzaXRlZCA/IHN0YXRlLnZpc2l0ZWRBcnRpc3RzIDogWy4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLCBhY3Rpb24uZGF0YV07XG5cdFx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRcdGFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0ZGlzcGxheUFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHRcdC4uLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLmRhdGEubmFtZSxcblx0XHRcdFx0XHRoaWRlSW5mbzogZmFsc2UsXG5cdFx0XHRcdFx0aGlkZVJlbGF0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdFx0Li4uZW1wdHlBcnRpc3Rcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ05vIEFQSSBkYXRhIGF2YWlsYWJsZSBmb3IgZ2l2ZW4gYXJ0aXN0LiBOZWVkIHRvIHJlZnJlc2ggQVBJIHNlc3Npb24/Jyk7XG5cdFx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVQREFURV9ESVNQTEFZX0FSVElTVDpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0ZGlzcGxheUFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdGRpc3BsYXlBbGJ1bUluZGV4OiAwXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBMT0FEX0FMQlVNOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRkaXNwbGF5QWxidW1JbmRleDogYWN0aW9uLmRhdGFcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFNIT1dfUkVMQVRFRF9JTkZPOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0aGlkZVJlbGF0ZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBISURFX1JFTEFURURfSU5GTzpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdC4uLmVtcHR5QXJ0aXN0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhpZGVSZWxhdGVkOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBDTEVBUl9TRVNTSU9OOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLmVtcHR5U3RhdGVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0bmV3U3RhdGUgPSBzdGF0ZTtcblx0fVxuXHR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnc3RhdGUnLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSkpO1xuXHRyZXR1cm4gbmV3U3RhdGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhcHBTdGF0ZTsiLCJpbXBvcnQge2NyZWF0ZVN0b3JlfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgYXBwU3RhdGUgZnJvbSBcIi4vcmVkdWNlcnMvYXBwLXN0YXRlXCI7XG5cbmV4cG9ydCBsZXQgc3RvcmUgPSBjcmVhdGVTdG9yZShcblx0YXBwU3RhdGUsXG5cdHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fICYmIHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fKClcbik7XG5cblxuIl19
