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
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SceneUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require("three");

var THREE = _interopRequireWildcard(_three);

var _colours = require("../config/colours");

var _props = require("./props");

var _statistics = require("./statistics.class");

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
		key: "init",
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
		key: "clamp",
		value: function clamp(a, b, c) {
			return Math.max(b, Math.min(c, a));
		}

		/**
   * Given positive x return 1, negative x return -1, or 0 otherwise
   * @param n
   * @returns {number}
   */

	}, {
		key: "sign",
		value: function sign(n) {
			return n > 0 ? 1 : n < 0 ? -1 : 0;
		}
	}, {
		key: "renormalizeQuaternion",
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
		key: "getIntersectsFromMousePos",
		value: function getIntersectsFromMousePos() {
			_props.Props.raycaster.setFromCamera(_props.Props.mouseVector, _props.Props.camera);
			return _props.Props.raycaster.intersectObjects(_props.Props.graphContainer.children, true);
		}
	}, {
		key: "getMouseVector",
		value: function getMouseVector(event) {
			return new THREE.Vector2(event.clientX / _props.Props.renderer.domElement.clientWidth * 2 - 1, -(event.clientY / _props.Props.renderer.domElement.clientHeight) * 2 + 1);
		}
	}, {
		key: "createMainArtistSphere",
		value: function createMainArtistSphere(artist) {
			var radius = _statistics.Statistics.getArtistSphereSize(artist);
			var geometry = new THREE.SphereGeometry(radius, 35, 35);
			var sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.mainArtist }));
			sphere.artistObj = artist;
			sphere.radius = radius;
			sphere.type = _props.MAIN_ARTIST_SPHERE;
			SceneUtils.addText(artist.name, MAIN_ARTIST_FONT_SIZE, sphere, _props.RELATED_ARTIST_TEXT);
			return sphere;
		}
	}, {
		key: "createRelatedSpheres",
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
				SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere, _props.RELATED_ARTIST_TEXT);
				relatedArtistsSphereArray.push(relatedArtistSphere);
			}
			return relatedArtistsSphereArray;
		}
	}, {
		key: "appendObjectsToScene",
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
		key: "joinRelatedArtistSphereToMain",
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
		key: "positionRelatedArtist",
		value: function positionRelatedArtist(mainArtistSphere, relatedSphere, sphereFaceIndex) {
			var mainArtistSphereFace = mainArtistSphere.geometry.faces[Math.floor(sphereFaceIndex)].normal.clone();
			relatedSphere.position.copy(mainArtistSphereFace.multiply(new THREE.Vector3(relatedSphere.distance, relatedSphere.distance, relatedSphere.distance)));
		}
	}, {
		key: "addText",
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
		key: "lighting",
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
					case _props.RELATED_ARTIST_TEXT:
						this.hoveredSphere = selected.parent;
						this.highlightRelatedSphere(_colours.Colours.relatedArtistHover);
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
			if (this.hoveredSphere && this.hoveredSphere.id !== _props.Props.selectedArtistSphere.id) {
				this.hoveredSphere.material.color.setHex(colour);
				_store.store.dispatch((0, _actions.showRelated)(this.hoveredSphere.artistObj));
			}
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
					case _props.MAIN_ARTIST_SPHERE:
						_props.Props.selectedArtistSphere = selected;
						this.setupClickedSphere(_colours.Colours.mainArtist);
						break;
					case _props.MAIN_ARTIST_TEXT:
					case _props.RELATED_ARTIST_TEXT:
						_props.Props.selectedArtistSphere = selected.parent;
						this.setupClickedSphere(_colours.Colours.relatedArtistClicked);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcHAtc3RhdGUuanMiLCJzcmMvanMvc3RhdGUvc3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOztJQUFZLEs7O0FBQ1o7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsbUJBQVMsTUFBVCxDQUNDO0FBQUE7QUFBQSxHQUFVLG1CQUFWO0FBQ0M7QUFERCxDQURELEVBSUMsU0FBUyxjQUFULENBQXdCLE1BQXhCLENBSkQ7Ozs7Ozs7Ozs7cWpCQ05BOzs7Ozs7QUFJQTs7QUFDQTs7QUFDQTs7SUFBWSxLOzs7Ozs7QUFFWixJQUFNLG1CQUFtQixrQkFBekI7QUFDQSxJQUFNLFVBQVUsU0FBaEI7QUFDQSxJQUFNLGFBQWE7QUFDbEIsT0FBTTtBQURZLENBQW5COztJQUlhLFMsV0FBQSxTO0FBQ1Qsc0JBQWM7QUFBQTs7QUFDaEIsT0FBSyxHQUFMLEdBQVcsVUFBWDtBQUNBLE9BQUssT0FBTDtBQUNBOzs7OzRCQUVTO0FBQUE7O0FBQ1QsZ0JBQU0sRUFBTixHQUFXLEtBQUssR0FBTCxFQUFYO0FBQ0EsUUFBSyxZQUFMO0FBQ0EsZ0JBQU0sUUFBTixDQUFlLE1BQWYsQ0FBc0IsYUFBTSxLQUE1QixFQUFtQyxhQUFNLE1BQXpDO0FBQ0EsVUFBTyxxQkFBUCxDQUE2QixZQUFNO0FBQ2xDLGlCQUFNLEVBQU4sR0FBVyxhQUFNLEVBQWpCO0FBQ0EsVUFBSyxPQUFMLENBQWEsSUFBYjtBQUNBLElBSEQ7QUFJQTs7O2lDQUVjO0FBQ2QsV0FBUSxLQUFLLEdBQUwsQ0FBUyxJQUFqQjtBQUNDLFNBQUssZ0JBQUw7QUFDQyxVQUFLLHlCQUFMO0FBQ0E7QUFDRCxTQUFLLE9BQUw7QUFDQyxVQUFLLGNBQUw7QUFDQTtBQU5GO0FBUUE7Ozs4Q0FFMkI7QUFDM0IsT0FBTSxZQUFZLFNBQVMsS0FBSyxHQUFMLENBQVMsV0FBbEIsTUFBbUMsQ0FBckQ7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d0JBQVEsNENBRWxCLE9BQU8sNEJBQVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiLyoqXG4gKiBNb3Rpb25MYWIgZGVhbHMgd2l0aCBjb250cm9sbGluZyBlYWNoIHRpY2sgb2YgdGhlIGFuaW1hdGlvbiBmcmFtZSBzZXF1ZW5jZVxuICogSXQncyBhaW0gaXMgdG8gaXNvbGF0ZSBjb2RlIHRoYXQgaGFwcGVucyBvdmVyIGEgbnVtYmVyIG9mIGZyYW1lcyAoaS5lLiBtb3Rpb24pXG4gKi9cbmltcG9ydCB7UHJvcHMsIFRFWFRfR0VPTUVUUll9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNvbnN0IFRSQUNLX0NBTV9UT19PQkogPSAnVFJBQ0tfQ0FNX1RPX09CSic7XG5jb25zdCBERUZBVUxUID0gJ0RFRkFVTFQnO1xuY29uc3QgZGVmYXVsdEpvYiA9IHtcblx0dHlwZTogREVGQVVMVFxufTtcblxuZXhwb3J0IGNsYXNzIE1vdGlvbkxhYiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHRcdHRoaXMuYW5pbWF0ZSgpO1xuXHR9XG5cblx0YW5pbWF0ZSgpIHtcblx0XHRQcm9wcy50MiA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5wcm9jZXNzU2NlbmUoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5yZW5kZXIoUHJvcHMuc2NlbmUsIFByb3BzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRQcm9wcy50MSA9IFByb3BzLnQyO1xuXHRcdFx0dGhpcy5hbmltYXRlLmNhbGwodGhpcyk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm9jZXNzU2NlbmUoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi50eXBlKSB7XG5cdFx0XHRjYXNlIFRSQUNLX0NBTV9UT19PQko6XG5cdFx0XHRcdHRoaXMudHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgREVGQVVMVDpcblx0XHRcdFx0dGhpcy51cGRhdGVSb3RhdGlvbigpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCkge1xuXHRcdGNvbnN0IHNob3VsZEVuZCA9IHBhcnNlSW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKSA9PT0gMTtcblx0XHRpZiAoIXNob3VsZEVuZCkge1xuXHRcdFx0dGhpcy5mb2xsb3dQYXRoKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5lbmRBbmltYXRpb24oKTtcblx0XHR9XG5cdH1cblxuXHRmb2xsb3dQYXRoKCkge1xuXHRcdGNvbnN0IHAgPSB0aGlzLmpvYi5wYXRoLmdldFBvaW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKTtcblx0XHR0aGlzLmpvYi5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHApO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lICs9IDAuMDE7XG5cdH1cblxuXHRlbmRBbmltYXRpb24oKSB7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgJiYgdGhpcy5qb2IuY2FsbGJhY2soKTtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdH1cblxuXHR0cmFja09iamVjdFRvQ2FtZXJhKG9iamVjdDNELCBjYWxsYmFjaykge1xuICAgIFx0dGhpcy5qb2IgPSB7fTtcbiAgICBcdHRoaXMuam9iLnR5cGUgPSBUUkFDS19DQU1fVE9fT0JKO1xuXHRcdHRoaXMuam9iLnQgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLmpvYi5vYmplY3QzRCA9IG9iamVjdDNEO1xuXHRcdHRoaXMuam9iLmVuZGVkID0gZmFsc2U7XG5cdFx0dGhpcy5qb2IucGF0aCA9IG5ldyBUSFJFRS5DYXRtdWxsUm9tQ3VydmUzKFtcblx0XHRcdG9iamVjdDNELnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKVxuXHRcdF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRjb25zdCBjYW1RdWF0ZXJuaW9uVXBkYXRlID0gdGhpcy5nZXROZXdDYW1lcmFEaXJlY3Rpb24oKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS54ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnkgKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIFByb3BzLmNhbWVyYURpc3RhbmNlXG5cdFx0KTtcblx0XHRQcm9wcy5jYW1lcmEubG9va0F0KFByb3BzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmoudHlwZSA9PT0gVEVYVF9HRU9NRVRSWSkge1xuXHRcdFx0XHRsZXQgY2FtZXJhTm9ybSA9IFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmoucG9zaXRpb24uc2V0KFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueCAqIG9iai5wYXJlbnQucmFkaXVzLFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueSAqIG9iai5wYXJlbnQucmFkaXVzLFxuXHRcdFx0XHRcdGNhbWVyYU5vcm0ueiAqIG9iai5wYXJlbnQucmFkaXVzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdG9iai5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdGdldE5ld0NhbWVyYURpcmVjdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSBQcm9wcy5tb3VzZVBvc0RpZmZZID49IFByb3BzLm1vdXNlUG9zRGlmZlg7XG5cdFx0Y29uc3QgeE1vcmVUaGFuWU1vdXNlID0gIXlNb3JlVGhhblhNb3VzZTtcblx0XHRpZiAoUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCAtPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54ICs9IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSArPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55IC09IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZSA9IFNjZW5lVXRpbHMucmVub3JtYWxpemVRdWF0ZXJuaW9uKFByb3BzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIoUHJvcHMuY2FtZXJhUm90YXRpb24pO1xuXHRcdHJldHVybiBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHR9XG5cblx0cmVkdWNlU3BlZWQoYW1vdW50KSB7XG5cdFx0aWYgKFByb3BzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFggLT0gYW1vdW50O1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5zcGVlZFkgPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmV4cG9ydCBjb25zdCBQcm9wcyA9IHtcblx0cmVuZGVyZXI6IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSksXG5cdHNjZW5lOiBuZXcgVEhSRUUuU2NlbmUoKSxcblx0Y2FtZXJhOiBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCksXG5cdGdyYXBoQ29udGFpbmVyOiBuZXcgVEhSRUUuT2JqZWN0M0QoKSxcblx0Y2FtZXJhUm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigwLCAtMSwgMCksXG5cdGNhbWVyYUxvb2tBdDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXG5cdGNhbWVyYURpc3RhbmNlOiAzNTAwLFxuXHRcblx0dDE6IDAuMCwgLy8gb2xkIHRpbWVcblx0dDI6IDAuMCwgLy8gbm93IHRpbWVcblx0c3BlZWRYOiAwLjAwNSxcblx0c3BlZWRZOiAwLjAwMCxcblx0bW91c2VQb3NEaWZmWDogMC4wLFxuXHRtb3VzZVBvc0RpZmZZOiAwLjAsXG5cdG1vdXNlUG9zWEluY3JlYXNlZDogZmFsc2UsXG5cdG1vdXNlUG9zWUluY3JlYXNlZDogZmFsc2UsXG5cdHJheWNhc3RlcjogbmV3IFRIUkVFLlJheWNhc3RlcigpLFxuXHRtb3VzZVZlY3RvcjogbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XG5cdHJlbGF0ZWRBcnRpc3RTcGhlcmVzOiBbXSxcblx0bWFpbkFydGlzdFNwaGVyZToge30sXG5cdHNlbGVjdGVkQXJ0aXN0U3BoZXJlOiB7aWQ6IDB9XG59O1xuXG5leHBvcnQgY29uc3QgTUFJTl9BUlRJU1RfU1BIRVJFID0gJ01BSU5fQVJUSVNUX1NQSEVSRSc7XG5leHBvcnQgY29uc3QgUkVMQVRFRF9BUlRJU1RfU1BIRVJFID0gJ1JFTEFURURfQVJUSVNUX1NQSEVSRSc7XG5leHBvcnQgY29uc3QgTUFJTl9BUlRJU1RfVEVYVCA9ICdNQUlOX0FSVElTVF9URVhUJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0FSVElTVF9URVhUID0gJ1JFTEFURURfQVJUSVNUX1RFWFQnO1xuZXhwb3J0IGNvbnN0IENPTk5FQ1RJTkdfTElORSA9ICdDT05ORUNUSU5HX0xJTkUnOyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5pbXBvcnQge1xuXHRDT05ORUNUSU5HX0xJTkUsIE1BSU5fQVJUSVNUX1NQSEVSRSwgUkVMQVRFRF9BUlRJU1RfU1BIRVJFLCBQcm9wcyxcblx0UkVMQVRFRF9BUlRJU1RfVEVYVFxufSBmcm9tIFwiLi9wcm9wc1wiO1xuaW1wb3J0IHtTdGF0aXN0aWNzfSBmcm9tIFwiLi9zdGF0aXN0aWNzLmNsYXNzXCI7XG5cbmxldCBIRUxWRVRJS0VSO1xuY29uc3QgTUFJTl9BUlRJU1RfRk9OVF9TSVpFID0gMzQ7XG5jb25zdCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUgPSAyMDtcbmNvbnN0IFRPVEFMX1JFTEFURUQgPSA1O1xuXG5jbGFzcyBTY2VuZVV0aWxzIHtcblx0c3RhdGljIGluaXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0XHRsb2FkZXIubG9hZCgnLi9qcy9mb250cy9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbicsIChmb250KSA9PiB7XG5cdFx0XHRcdEhFTFZFVElLRVIgPSBmb250O1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAoKT0+e30sIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhIC0gbWluXG5cdCAqIEBwYXJhbSBiIC0gbWF4XG5cdCAqIEBwYXJhbSBjIC0gdmFsdWUgdG8gY2xhbXBcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBjbGFtcChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KGIsIE1hdGgubWluKGMsIGEpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBwb3NpdGl2ZSB4IHJldHVybiAxLCBuZWdhdGl2ZSB4IHJldHVybiAtMSwgb3IgMCBvdGhlcndpc2Vcblx0ICogQHBhcmFtIG5cblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBzaWduKG4pIHtcblx0XHRyZXR1cm4gbiA+IDAgPyAxIDogbiA8IDAgPyAtMSA6IDA7XG5cdH07XG5cdFxuXHRzdGF0aWMgcmVub3JtYWxpemVRdWF0ZXJuaW9uKG9iamVjdCkge1xuXHRcdGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpIHtcblx0XHRQcm9wcy5yYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShQcm9wcy5tb3VzZVZlY3RvciwgUHJvcHMuY2FtZXJhKTtcblx0XHRyZXR1cm4gUHJvcHMucmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoUHJvcHMuZ3JhcGhDb250YWluZXIuY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGdldE1vdXNlVmVjdG9yKGV2ZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKChldmVudC5jbGllbnRYIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCkge1xuXHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IGFydGlzdDtcblx0XHRzcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdHNwaGVyZS50eXBlID0gTUFJTl9BUlRJU1RfU1BIRVJFO1xuXHRcdFNjZW5lVXRpbHMuYWRkVGV4dChhcnRpc3QubmFtZSwgTUFJTl9BUlRJU1RfRk9OVF9TSVpFLCBzcGhlcmUsIFJFTEFURURfQVJUSVNUX1RFWFQpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBtYWluQXJ0aXN0U3BoZXJlKSB7XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkgPSBbXTtcblx0XHRsZXQgcmVsYXRlZEFydGlzdDtcblx0XHRsZXQgc3BoZXJlRmFjZUluZGV4ID0gMDtcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIFRPVEFMX1JFTEFURUQgLSAxKTtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbihUT1RBTF9SRUxBVEVELCBhcnRpc3QucmVsYXRlZC5sZW5ndGgpOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHJlbGF0ZWRBcnRpc3QgPSBhcnRpc3QucmVsYXRlZFtpXTtcblx0XHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRsZXQgZ2VucmVNZXRyaWNzID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmogPSByZWxhdGVkQXJ0aXN0O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmouZ2VucmVTaW1pbGFyaXR5ID0gZ2VucmVNZXRyaWNzLmdlbnJlU2ltaWxhcml0eTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuZGlzdGFuY2UgPSBnZW5yZU1ldHJpY3MubGluZUxlbmd0aDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS50eXBlID0gUkVMQVRFRF9BUlRJU1RfU1BIRVJFO1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0Lm5hbWUsIFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSwgcmVsYXRlZEFydGlzdFNwaGVyZSwgUkVMQVRFRF9BUlRJU1RfVEVYVCk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5LnB1c2gocmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5O1xuXHR9XG5cblx0c3RhdGljIGFwcGVuZE9iamVjdHNUb1NjZW5lKGdyYXBoQ29udGFpbmVyLCBzcGhlcmUsIHNwaGVyZUFycmF5KSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cdFx0cGFyZW50Lm5hbWUgPSAncGFyZW50Jztcblx0XHRwYXJlbnQuYWRkKHNwaGVyZSk7XG5cdFx0aWYgKHNwaGVyZUFycmF5KSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwaGVyZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHBhcmVudC5hZGQoc3BoZXJlQXJyYXlbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRncmFwaENvbnRhaW5lci5hZGQocGFyZW50KTtcblx0fVxuXG5cdHN0YXRpYyBqb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkTGluZUpvaW59KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRsZXQgbGluZTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHJlbGF0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0bGluZSA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdFx0bGluZS50eXBlID0gQ09OTkVDVElOR19MSU5FO1xuXHRcdG1haW5BcnRpc3RTcGhlcmUuYWRkKGxpbmUpO1xuXHR9XG5cblx0c3RhdGljIHBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpIHtcblx0XHRsZXQgbWFpbkFydGlzdFNwaGVyZUZhY2UgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzW01hdGguZmxvb3Ioc3BoZXJlRmFjZUluZGV4KV0ubm9ybWFsLmNsb25lKCk7XG5cdFx0cmVsYXRlZFNwaGVyZS5wb3NpdGlvblxuXHRcdFx0LmNvcHkobWFpbkFydGlzdFNwaGVyZUZhY2UubXVsdGlwbHkobmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2Vcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgYWRkVGV4dChsYWJlbCwgc2l6ZSwgc3BoZXJlLCB0ZXh0VHlwZSkge1xuXHRcdGxldCBtYXRlcmlhbEZyb250ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy50ZXh0T3V0ZXJ9KTtcblx0XHRsZXQgbWF0ZXJpYWxTaWRlID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy50ZXh0SW5uZXJ9KTtcblx0XHRsZXQgbWF0ZXJpYWxBcnJheSA9IFttYXRlcmlhbEZyb250LCBtYXRlcmlhbFNpZGVdO1xuXHRcdGxldCB0ZXh0R2VvbSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkobGFiZWwsIHtcblx0XHRcdGZvbnQ6IEhFTFZFVElLRVIsXG5cdFx0XHRzaXplOiBzaXplLFxuXHRcdFx0Y3VydmVTZWdtZW50czogNCxcblx0XHRcdGJldmVsRW5hYmxlZDogdHJ1ZSxcblx0XHRcdGJldmVsVGhpY2tuZXNzOiAyLFxuXHRcdFx0YmV2ZWxTaXplOiAxLFxuXHRcdFx0YmV2ZWxTZWdtZW50czogM1xuXHRcdH0pO1xuXHRcdGxldCB0ZXh0TWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRleHRHZW9tLCBtYXRlcmlhbEFycmF5KTtcblx0XHRsZXQgY2FtZXJhTm9ybSA9IFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXHRcdHRleHRNZXNoLnR5cGUgPSB0ZXh0VHlwZTtcblx0XHRzcGhlcmUuYWRkKHRleHRNZXNoKTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1lcmFOb3JtLnggKiBzcGhlcmUucmFkaXVzLFxuXHRcdFx0Y2FtZXJhTm9ybS55ICogc3BoZXJlLnJhZGl1cyxcblx0XHRcdGNhbWVyYU5vcm0ueiAqIHNwaGVyZS5yYWRpdXNcblx0XHQpO1xuXHRcdHRleHRNZXNoLmxvb2tBdChQcm9wcy5ncmFwaENvbnRhaW5lci53b3JsZFRvTG9jYWwoUHJvcHMuY2FtZXJhLnBvc2l0aW9uKSk7XG5cdH1cblxuXHRzdGF0aWMgbGlnaHRpbmcoKSB7XG5cdFx0bGV0IGxpZ2h0QSA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4Y2NjY2NjLCAxLjcyNSk7XG5cdFx0bGV0IGxpZ2h0QiA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4YWFhYWFhLCAxLjUpO1xuXHRcdGxpZ2h0QS5wb3NpdGlvbi5zZXRYKDUwMCk7XG5cdFx0bGlnaHRCLnBvc2l0aW9uLnNldFkoLTgwMCk7XG5cdFx0bGlnaHRCLnBvc2l0aW9uLnNldFgoLTUwMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKGxpZ2h0QSk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKGxpZ2h0Qik7XG5cdH1cbn1cblxuZXhwb3J0IHsgU2NlbmVVdGlscyB9XG4iLCIvKipcbiAqIFNwaGVyZXNTY2VuZSBpcyBkZXNpZ25lZCB0byBoYW5kbGUgYWRkaW5nIGFuZCByZW1vdmluZyBlbnRpdGllcyBmcm9tIHRoZSBzY2VuZSxcbiAqIGFuZCBoYW5kbGluZyBldmVudHMuXG4gKlxuICogSXQgYWltcyB0byBkZWFsIG5vdCB3aXRoIGNoYW5nZXMgb3ZlciB0aW1lLCBvbmx5IGltbWVkaWF0ZSBjaGFuZ2VzIGluIG9uZSBmcmFtZS5cbiAqL1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tIFwiLi4vY29uZmlnL2NvbG91cnNcIjtcbmltcG9ydCB7TW90aW9uTGFifSBmcm9tIFwiLi9tb3Rpb24tbGFiLmNsYXNzXCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcbmltcG9ydCB7XG5cdE1BSU5fQVJUSVNUX1NQSEVSRSwgTUFJTl9BUlRJU1RfVEVYVCwgUHJvcHMsIFJFTEFURURfQVJUSVNUX1NQSEVSRSwgUkVMQVRFRF9BUlRJU1RfVEVYVCxcblx0VEVYVF9HRU9NRVRSWVxufSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7aGlkZVJlbGF0ZWQsIHJlbGF0ZWRDbGljaywgc2hvd1JlbGF0ZWR9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmVzU2NlbmUge1xuXHRjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcblx0XHRsZXQgYXJ0aXN0SWQ7XG5cdFx0dGhpcy5tb3Rpb25MYWIgPSBuZXcgTW90aW9uTGFiKCk7XG5cdFx0dGhpcy5ob3ZlcmVkU3BoZXJlID0gbnVsbDtcblxuXHRcdC8vIGF0dGFjaCB0byBkb21cblx0XHRQcm9wcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHRcdFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAncmVuZGVyZXInO1xuXHRcdFByb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcblx0XHRQcm9wcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cblx0XHQvLyBpbml0IHRoZSBzY2VuZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnBvc2l0aW9uLnNldCgxLCA1LCAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuZ3JhcGhDb250YWluZXIpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoMCwgMjUwLCBQcm9wcy5jYW1lcmFEaXN0YW5jZSk7XG5cdFx0UHJvcHMuY2FtZXJhLmxvb2tBdChQcm9wcy5zY2VuZS5wb3NpdGlvbik7XG5cdFx0U2NlbmVVdGlscy5saWdodGluZyhQcm9wcy5zY2VuZSk7XG5cblx0XHQvLyBjaGVjayBmb3IgcXVlcnkgc3RyaW5nXG5cdFx0YXJ0aXN0SWQgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKSk7XG5cdFx0aWYgKGFydGlzdElkKSB7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9zZVNjZW5lKGFydGlzdCkge1xuXHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdC5pZCk7XG5cdFx0UHJvcHMubWFpbkFydGlzdFNwaGVyZSA9IFNjZW5lVXRpbHMuY3JlYXRlTWFpbkFydGlzdFNwaGVyZShhcnRpc3QpO1xuXHRcdFByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzID0gU2NlbmVVdGlscy5jcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIFByb3BzLm1haW5BcnRpc3RTcGhlcmUpO1xuXHRcdFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlID0gUHJvcHMubWFpbkFydGlzdFNwaGVyZTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyk7XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRsZXQgaW50ZXJzZWN0cztcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VJc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpO1xuXHRcdHRoaXMudW5oaWdobGlnaHRSZWxhdGVkU3BoZXJlKCk7XG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7XG5cdFx0XHRzZWxlY3RlZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0O1xuXHRcdFx0c3dpdGNoIChzZWxlY3RlZC50eXBlKSB7XG5cdFx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfU1BIRVJFOlxuXHRcdFx0XHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdHRoaXMuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZShDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfVEVYVDpcblx0XHRcdFx0XHR0aGlzLmhvdmVyZWRTcGhlcmUgPSBzZWxlY3RlZC5wYXJlbnQ7XG5cdFx0XHRcdFx0dGhpcy5oaWdobGlnaHRSZWxhdGVkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdEhvdmVyKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0XHRyZXR1cm4gaXNPdmVyUmVsYXRlZDtcblx0fVxuXG5cdHVuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZSgpIHtcblx0XHRpZiAodGhpcy5ob3ZlcmVkU3BoZXJlICYmIHRoaXMuaG92ZXJlZFNwaGVyZS5pZCAhPT0gUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUuaWQpIHtcblx0XHRcdHRoaXMuaG92ZXJlZFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0KTtcblx0XHRcdHRoaXMuaG92ZXJlZFNwaGVyZSA9IG51bGw7XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHR9XG5cdH1cblxuXHRoaWdobGlnaHRSZWxhdGVkU3BoZXJlKGNvbG91cikge1xuXHRcdGlmICh0aGlzLmhvdmVyZWRTcGhlcmUgJiYgdGhpcy5ob3ZlcmVkU3BoZXJlLmlkICE9PSBQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5pZCkge1xuXHRcdFx0dGhpcy5ob3ZlcmVkU3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvdXIpO1xuXHRcdFx0c3RvcmUuZGlzcGF0Y2goc2hvd1JlbGF0ZWQodGhpcy5ob3ZlcmVkU3BoZXJlLmFydGlzdE9iaikpO1xuXHRcdH1cblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcygpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSAmJiBzZWxlY3RlZC5pZCA9PT0gUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUuaWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZXNldENsaWNrZWRTcGhlcmUoKTtcblx0XHRcdHN3aXRjaCAoc2VsZWN0ZWQudHlwZSkge1xuXHRcdFx0XHRjYXNlIFJFTEFURURfQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdENsaWNrZWQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKENvbG91cnMubWFpbkFydGlzdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgTUFJTl9BUlRJU1RfVEVYVDpcblx0XHRcdFx0Y2FzZSBSRUxBVEVEX0FSVElTVF9URVhUOlxuXHRcdFx0XHRcdFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRcdHRoaXMuc2V0dXBDbGlja2VkU3BoZXJlKENvbG91cnMucmVsYXRlZEFydGlzdENsaWNrZWQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNldHVwQ2xpY2tlZFNwaGVyZShjb2xvdXIpIHtcblx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgoY29sb3VyKTtcblx0XHRNdXNpY0RhdGFTZXJ2aWNlLmZldGNoRGlzcGxheUFsYnVtcyhQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmopO1xuXHR9XG5cblx0cmVzZXRDbGlja2VkU3BoZXJlKCkge1xuXHRcdGlmICghUHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUudHlwZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRzd2l0Y2ggKFByb3BzLnNlbGVjdGVkQXJ0aXN0U3BoZXJlLnR5cGUpIHtcblx0XHRcdGNhc2UgUkVMQVRFRF9BUlRJU1RfU1BIRVJFOlxuXHRcdFx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZS5tYXRlcmlhbC5jb2xvci5zZXRIZXgoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIE1BSU5fQVJUSVNUX1NQSEVSRTpcblx0XHRcdFx0UHJvcHMuc2VsZWN0ZWRBcnRpc3RTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMubWFpbkFydGlzdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRQcm9wcy5zZWxlY3RlZEFydGlzdFNwaGVyZSA9IHtpZDogMH07XG5cdH1cblxuXHRvblNjZW5lTW91c2VEcmFnKGV2ZW50KSB7XG5cdFx0Y29uc3QgZHQgPSBQcm9wcy50MiAtIFByb3BzLnQxO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VQb3NYSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnggPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci54KTtcblx0XHRQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueSA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlggPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci54KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLngpKTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueSkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci55KSk7XG5cdFx0UHJvcHMuc3BlZWRYID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWCkgLyBkdCk7XG5cdFx0UHJvcHMuc3BlZWRZID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWSkgLyBkdCk7XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0fVxuXG5cdGdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIudHJhY2tPYmplY3RUb0NhbWVyYShzZWxlY3RlZFNwaGVyZSwgKCkgPT4ge1xuXHRcdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmouaWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJHcmFwaCgpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBQcm9wcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShwYXJlbnQpO1xuXHRcdH1cblx0fVxuXG5cdGNsZWFyQWRkcmVzcygpIHtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuXHR9XG5cblx0em9vbShkaXJlY3Rpb24pIHtcblx0XHRzd2l0Y2ggKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSAnaW4nOlxuXHRcdFx0XHRQcm9wcy5jYW1lcmFEaXN0YW5jZSAtPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvdXQnOlxuXHRcdFx0XHRQcm9wcy5jYW1lcmFEaXN0YW5jZSArPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlQ2FtZXJhQXNwZWN0KCkge1xuXHRcdFByb3BzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHRQcm9wcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cdH1cbn1cbiIsImNvbnN0IE1BWF9ESVNUQU5DRSA9IDgwMDtcbmNvbnN0IFNJWkVfU0NBTEFSX1NNQUxMID0gMS4yNTtcbmNvbnN0IFNJWkVfU0NBTEFSX0JJRyA9IDEuNzU7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aXN0aWNzIHtcbiAgICBzdGF0aWMgZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpIHtcbiAgICBcdGlmIChhcnRpc3QucG9wdWxhcml0eSA+PSA1MCkge1xuXHRcdFx0cmV0dXJuIGFydGlzdC5wb3B1bGFyaXR5ICogU0laRV9TQ0FMQVJfQklHO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUl9TTUFMTDtcblx0XHR9XG5cbiAgICB9XG5cblx0LyoqXG4gICAgICogTWFwLXJlZHVjZSBvZiB0d28gc3RyaW5nIGFycmF5c1xuXHQgKiBAcGFyYW0gYXJ0aXN0XG5cdCAqIEBwYXJhbSByZWxhdGVkQXJ0aXN0XG5cdCAqIEByZXR1cm5zIHtvYmplY3R9XG5cdCAqL1xuXHRzdGF0aWMgZ2V0U2hhcmVkR2VucmVNZXRyaWMoYXJ0aXN0LCByZWxhdGVkQXJ0aXN0KSB7XG5cdFx0bGV0IHVuaXQsIGdlbnJlU2ltaWxhcml0eSwgcmVsYXRpdmVNaW5EaXN0YW5jZSwgYXJ0aXN0R2VucmVDb3VudDtcblx0XHRsZXQgbWF0Y2hlcyA9IGFydGlzdC5nZW5yZXNcbiAgICAgICAgICAgIC5tYXAoKG1haW5BcnRpc3RHZW5yZSkgPT4gU3RhdGlzdGljcy5tYXRjaEFydGlzdFRvUmVsYXRlZEdlbnJlcyhtYWluQXJ0aXN0R2VucmUsIHJlbGF0ZWRBcnRpc3QpKVxuICAgICAgICAgICAgLnJlZHVjZSgoYWNjdW11bGF0b3IsIG1hdGNoKSA9PiB7XG5cdFx0ICAgICAgICBpZiAobWF0Y2gpIHtcblx0XHQgICAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKG1hdGNoKTtcblx0XHRcdFx0fVxuXHRcdCAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgICAgICAgICAgfSwgW10pO1xuXHRcdGFydGlzdEdlbnJlQ291bnQgPSBhcnRpc3QuZ2VucmVzLmxlbmd0aCA/IGFydGlzdC5nZW5yZXMubGVuZ3RoIDogMTtcblx0XHR1bml0ID0gMSAvIGFydGlzdEdlbnJlQ291bnQ7XG5cdFx0dW5pdCA9IHVuaXQgPT09IDEgPyAwIDogdW5pdDtcblx0XHRnZW5yZVNpbWlsYXJpdHkgPSBtYXRjaGVzLmxlbmd0aCAqIHVuaXQ7XG5cdFx0cmVsYXRpdmVNaW5EaXN0YW5jZSA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpICsgU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKHJlbGF0ZWRBcnRpc3QpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRsaW5lTGVuZ3RoOiAoTUFYX0RJU1RBTkNFIC0gKE1BWF9ESVNUQU5DRSAqIGdlbnJlU2ltaWxhcml0eSkpICsgcmVsYXRpdmVNaW5EaXN0YW5jZSxcblx0XHRcdGdlbnJlU2ltaWxhcml0eTogTWF0aC5yb3VuZChnZW5yZVNpbWlsYXJpdHkgKiAxMDApXG5cdFx0fTtcblx0fVxuXG5cdHN0YXRpYyBtYXRjaEFydGlzdFRvUmVsYXRlZEdlbnJlcyhtYWluQXJ0aXN0R2VucmUsIHJlbGF0ZWRBcnRpc3QpIHtcbiAgICAgICAgcmV0dXJuIHJlbGF0ZWRBcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAuZmluZCgoZ2VucmUpID0+IGdlbnJlID09PSBtYWluQXJ0aXN0R2VucmUpO1xuICAgIH1cbiB9IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU2VhcmNoQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXJcIjtcbmltcG9ydCBTcG90aWZ5UGxheWVyQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lclwiO1xuaW1wb3J0IFNjZW5lQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdExpc3RDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWxpc3QuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0SW5mb0NvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtaW5mby5jb250YWluZXJcIjtcbmltcG9ydCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8U2VhcmNoQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNwb3RpZnlQbGF5ZXJDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8UmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0SW5mb0NvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RMaXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdEluZm9Db21wb25lbnQoe2FydGlzdCwgaXNIaWRkZW59KSB7XG5cdGNvbnN0IGdlbnJlcyA9IGFydGlzdC5nZW5yZXMubWFwKChnZW5yZSkgPT4ge1xuXHRcdHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCIga2V5PXtnZW5yZX0+e2dlbnJlfTwvc3Bhbj5cblx0fSk7XG5cdGNvbnN0IGNsYXNzZXMgPSBpc0hpZGRlbiA/ICdoaWRkZW4gaW5mby1jb250YWluZXIgbWFpbicgOiAnaW5mby1jb250YWluZXIgbWFpbic7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3QtbmFtZS10YWcgbWFpblwiPnthcnRpc3QubmFtZX08L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57YXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJnZW5yZXNcIj57Z2VucmVzfTwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcblxuZXhwb3J0IGNsYXNzIEFydGlzdExpc3RDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0aGFuZGxlR2V0QXJ0aXN0KGV2dCwgYXJ0aXN0SWQpIHtcblx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGFydGlzdHMgPSB0aGlzLnByb3BzLnZpc2l0ZWRBcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiB7XG5cdFx0XHRsZXQgaHJlZiA9ICcvYXBwLyMnICsgZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdC5pZCk7XG5cdFx0XHRsZXQgaW1nVXJsID0gYXJ0aXN0LmltYWdlcyAmJiBhcnRpc3QuaW1hZ2VzLmxlbmd0aCA/IGFydGlzdC5pbWFnZXNbYXJ0aXN0LmltYWdlcy5sZW5ndGggLSAxXS51cmwgOiAnJztcblx0XHRcdGxldCBpbWdTdHlsZSA9IHsgYmFja2dyb3VuZEltYWdlOiBgdXJsKCR7aW1nVXJsfSlgIH07XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdFwiIGtleT17YXJ0aXN0LmlkfT5cblx0XHRcdFx0XHQ8YSBocmVmPXtocmVmfSBpZD17YXJ0aXN0LmlkfSBjbGFzc05hbWU9XCJuYXYtYXJ0aXN0LWxpbmtcIlxuXHRcdFx0XHRcdCAgIG9uQ2xpY2s9eyhldmVudCkgPT4geyB0aGlzLmhhbmRsZUdldEFydGlzdChldmVudCwgYXJ0aXN0LmlkKSB9fT5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGljdHVyZS1ob2xkZXJcIj5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlXCIgc3R5bGU9e2ltZ1N0eWxlfSAvPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJuYW1lXCI+e2FydGlzdC5uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KVxuXHRcdH0pO1xuXHRcdGNvbnN0IGNsYXNzZXMgPSB0aGlzLnByb3BzLmlzSGlkZGVuID8gJ2hpZGRlbiBhcnRpc3QtbmF2aWdhdGlvbicgOiAnYXJ0aXN0LW5hdmlnYXRpb24nO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gcmVmPXtlbGVtID0+IHRoaXMuYXJ0aXN0TGlzdERvbSA9IGVsZW19PlxuXHRcdFx0XHR7YXJ0aXN0c31cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxUb3AgPSB0aGlzLmFydGlzdExpc3REb20uc2Nyb2xsSGVpZ2h0O1xuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCkge1xuXHRcdHRoaXMuYXJ0aXN0TGlzdERvbS5zY3JvbGxUb3AgPSB0aGlzLmFydGlzdExpc3REb20uc2Nyb2xsSGVpZ2h0O1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCh7cmVsYXRlZEFydGlzdCwgaGlkZVJlbGF0ZWQsIGhpZGVJbmZvfSkge1xuXHRjb25zdCBoaWRkZW5DbGFzcyA9IGhpZGVSZWxhdGVkIHx8IGhpZGVJbmZvID8gJ2hpZGRlbiBpbmZvLWNvbnRhaW5lciByZWxhdGVkJyA6ICdpbmZvLWNvbnRhaW5lciByZWxhdGVkJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17aGlkZGVuQ2xhc3N9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3QtbmFtZS10YWcgcmVsYXRlZFwiPntyZWxhdGVkQXJ0aXN0Lm5hbWV9PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBvcHVsYXJpdHlcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPlBvcHVsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e3JlbGF0ZWRBcnRpc3QucG9wdWxhcml0eX08L3NwYW4+PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+R2VucmUgc2ltaWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57cmVsYXRlZEFydGlzdC5nZW5yZVNpbWlsYXJpdHl9JTwvc3Bhbj48L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi4vY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtTcGhlcmVzU2NlbmV9IGZyb20gXCIuLi9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3NcIjtcbmltcG9ydCB7cmVsYXRlZENsaWNrfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwaGVyZXMtc2NlbmVcIiByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19IC8+XG5cdFx0KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0U2NlbmVVdGlscy5pbml0KCkudGhlbigoKSA9PiB7IC8vIGxvYWQgdGhlIGZvbnQgZmlyc3QgKGFzeW5jKVxuXHRcdFx0dGhpcy5zY2VuZSA9IG5ldyBTcGhlcmVzU2NlbmUodGhpcy5zY2VuZURvbSk7XG5cdFx0XHR0aGlzLmluaXRTY2VuZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCkge1xuXHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdH1cblxuXHRpbml0U2NlbmUoKSB7XG5cdFx0Y29uc3QgeyBhcnRpc3QgfSA9IHRoaXMucHJvcHM7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGV2ZW50ID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpOyAvLyByZW1vdmUgcmlnaHQgY2xpY2tcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMsIHRydWUpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLCBmYWxzZSk7XG5cdFx0aWYgKGFydGlzdC5pZCkge1xuXHRcdFx0dGhpcy5zY2VuZS5jb21wb3NlU2NlbmUoYXJ0aXN0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zY2VuZS5jbGVhckdyYXBoKCk7XG5cdFx0XHR0aGlzLnNjZW5lLmNsZWFyQWRkcmVzcygpO1xuXHRcdH1cblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKCF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKHRoaXMubW91c2VJc0Rvd24pIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZURyYWcoZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc092ZXJSZWxhdGVkID0gdGhpcy5zY2VuZS5vblNjZW5lTW91c2VIb3ZlcihldmVudCk7XG5cdFx0fVxuXHRcdGlmIChpc092ZXJSZWxhdGVkICYmICF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgcG9pbnRlcic7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYmJlZCc7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vkb3duKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSB0cnVlO1xuXHR9XG5cblx0bW91c2V1cCgpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRtb3VzZXdoZWVsKGV2ZW50KSB7XG5cdFx0c3dpdGNoIChTY2VuZVV0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRjYXNlIC0xOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ291dCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdpbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5zY2VuZS51cGRhdGVDYW1lcmFBc3BlY3QoKTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGFydGlzdCwgaGFuZGxlU2VhcmNoLCBoYW5kbGVTZWFyY2hUZXJtVXBkYXRlLCBjbGVhclNlc3Npb259KSB7XG4gICAgY29uc3QgY2xlYXJCdG5DbGFzcyA9IGFydGlzdC5pZCA/ICdjbGVhci1zZXNzaW9uJyA6ICdoaWRkZW4gY2xlYXItc2Vzc2lvbic7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWFyY2gtZm9ybS1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImFydGlzdC1zZWFyY2hcIiBvblN1Ym1pdD17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwic2VhcmNoLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJlLmcuIEppbWkgSGVuZHJpeFwiIHZhbHVlPXtzZWFyY2hUZXJtfSBvbkNoYW5nZT17aGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0gLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBvbkNsaWNrPXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+R288L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17Y2xlYXJCdG5DbGFzc30gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eyhldnQpID0+IGNsZWFyU2Vzc2lvbihldnQpfT5DbGVhciBTZXNzaW9uPC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBjbGFzcyBTcG90aWZ5UGxheWVyQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3Ioe2FsYnVtQ2xpY2tIYW5kbGVyfSkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hbGJ1bUNsaWNrSGFuZGxlciA9IGFsYnVtQ2xpY2tIYW5kbGVyO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGNvbnN0IHsgZGlzcGxheUFsYnVtSW5kZXgsIGRpc3BsYXlBcnRpc3QsIGlzSGlkZGVuIH0gPSB0aGlzLnByb3BzO1xuXHRcdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZD91cmk9c3BvdGlmeTphbGJ1bTonO1xuXHRcdGNvbnN0IGNsYXNzZXMgPSBpc0hpZGRlbiA/ICdoaWRkZW4gc3BvdGlmeS1wbGF5ZXItY29udGFpbmVyJyA6ICdzcG90aWZ5LXBsYXllci1jb250YWluZXInO1xuXHRcdGNvbnN0IGFsYnVtcyA9IGRpc3BsYXlBcnRpc3QuYWxidW1zO1xuXHRcdGxldCBhcnRpc3RFbWJlZFVybCxcblx0XHRcdGlGcmFtZU1hcmt1cCA9ICcnLFxuXHRcdFx0YWxidW1zTGlzdE1hcmt1cCA9ICcnLFxuXHRcdFx0YWxidW1JZDtcblx0XHRcblx0XHRpZiAoYWxidW1zICYmIGFsYnVtcy5sZW5ndGgpIHtcblx0XHRcdGFsYnVtSWQgPSBhbGJ1bXNbZGlzcGxheUFsYnVtSW5kZXhdLmlkO1xuXHRcdFx0YXJ0aXN0RW1iZWRVcmwgPSBgJHtlbWJlZFVybH0ke2FsYnVtSWR9YDtcblx0XHRcdGlGcmFtZU1hcmt1cCA9IChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJzcG90aWZ5LXBsYXllclwiPlxuXHRcdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCIzODBcIiBmcmFtZUJvcmRlcj1cIjBcIiBhbGxvd1RyYW5zcGFyZW5jeT1cInRydWVcIi8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHRcdGFsYnVtc0xpc3RNYXJrdXAgPSBhbGJ1bXMubWFwKChhbGJ1bSwgaW5kZXgpID0+IHtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFsYnVtXCIga2V5PXthbGJ1bS5pZH0+XG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiIG9uQ2xpY2s9eyhldnQpID0+IHRoaXMuYWxidW1DbGlja0hhbmRsZXIoZXZ0LCBpbmRleCl9PnthbGJ1bS5uYW1lfTwvYT5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0KVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHRcdHtpRnJhbWVNYXJrdXB9XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYWxidW1zLWxpc3RcIj5cblx0XHRcdFx0XHR7YWxidW1zTGlzdE1hcmt1cH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cbn1cbiIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRBcnRpc3RDbGlja2VkOiAweGVjOTI1Myxcblx0cmVsYXRlZExpbmVKb2luOiAweGZmZmZjYyxcblx0bWFpbkFydGlzdDogMHhmZmNjMDAsXG5cdHRleHRPdXRlcjogMHhmZmZmY2MsXG5cdHRleHRJbm5lcjogMHgwMDAwMzNcbn07IiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdCxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuXG5jb25zdCBBcnRpc3RMaXN0Q29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7UmVsYXRlZEFydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRyZWxhdGVkQXJ0aXN0OiBzdGF0ZS5yZWxhdGVkQXJ0aXN0LFxuXHRcdGhpZGVSZWxhdGVkOiBzdGF0ZS5oaWRlUmVsYXRlZCxcblx0XHRoaWRlSW5mbzogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoUmVsYXRlZEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1NjZW5lQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3NjZW5lLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNjZW5lQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNjZW5lQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7IE11c2ljRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHtjbGVhclNlc3Npb24sIHVwZGF0ZVNlYXJjaFRlcm19IGZyb20gJy4uL3N0YXRlL2FjdGlvbnMnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRzZWFyY2hUZXJtOiBzdGF0ZS5zZWFyY2hUZXJtLFxuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhbmRsZVNlYXJjaDogKGV2dCwgYXJ0aXN0TmFtZSkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLnNlYXJjaChhcnRpc3ROYW1lKTtcblx0XHR9LFxuXHRcdGhhbmRsZVNlYXJjaFRlcm1VcGRhdGU6IChldnQpID0+IHtcblx0XHRcdGRpc3BhdGNoKHVwZGF0ZVNlYXJjaFRlcm0oZXZ0LnRhcmdldC52YWx1ZSkpO1xuXHRcdH0sXG5cdFx0Y2xlYXJTZXNzaW9uOiAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGRpc3BhdGNoKGNsZWFyU2Vzc2lvbigpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNlYXJjaENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKFNlYXJjaElucHV0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U3BvdGlmeVBsYXllckNvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50XCI7XG5pbXBvcnQge2xvYWRBbGJ1bX0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvLFxuXHRcdGRpc3BsYXlBcnRpc3Q6IHN0YXRlLmRpc3BsYXlBcnRpc3QsXG5cdFx0ZGlzcGxheUFsYnVtSW5kZXg6IHN0YXRlLmRpc3BsYXlBbGJ1bUluZGV4XG5cdH1cbn07XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFsYnVtQ2xpY2tIYW5kbGVyOiAoZXZ0LCBhbGJ1bUluZGV4KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGRpc3BhdGNoKGxvYWRBbGJ1bShhbGJ1bUluZGV4KSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoU3BvdGlmeVBsYXllckNvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNwb3RpZnlQbGF5ZXJDb250YWluZXI7XG4iLCJpbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2FydGlzdERhdGFBdmFpbGFibGUsIGRpc3BsYXlBbGJ1bXMsIGRpc3BsYXlBcnRpc3R9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBNdXNpY0RhdGFTZXJ2aWNlIHtcblx0c3RhdGljIHNlYXJjaChhcnRpc3ROYW1lKSB7XG5cdFx0bGV0IHNlYXJjaFVSTCA9ICcvYXBpL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdE5hbWUpO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goc2VhcmNoVVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXJ0aXN0KGFydGlzdElkKSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FydGlzdC8nICsgYXJ0aXN0SWQ7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdERhdGFBdmFpbGFibGUoanNvbikpKTtcblx0fVxuXG5cdHN0YXRpYyBmZXRjaERpc3BsYXlBbGJ1bXMoYXJ0aXN0KSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FsYnVtcy8nICsgYXJ0aXN0LmlkO1xuXHRcdGlmIChhcnRpc3QuYWxidW1zICYmIGFydGlzdC5hbGJ1bXMubGVuZ3RoKSB7IC8vIHdlJ3ZlIGFscmVhZHkgZG93bmxvYWRlZCB0aGUgYWxidW0gbGlzdCBzbyBqdXN0IHRyaWdnZXIgVUkgdXBkYXRlXG5cdFx0XHQgcmV0dXJuIHN0b3JlLmRpc3BhdGNoKGRpc3BsYXlBcnRpc3QoYXJ0aXN0KSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHtcblx0XHRcdGFydGlzdC5hbGJ1bXMgPSBqc29uO1xuXHRcdFx0c3RvcmUuZGlzcGF0Y2goZGlzcGxheUFydGlzdChhcnRpc3QpKVxuXHRcdH0pO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9EQVRBX0FWQUlMQUJMRSA9ICdBUlRJU1RfREFUQV9BVkFJTEFCTEUnO1xuZXhwb3J0IGNvbnN0IFVQREFURV9ESVNQTEFZX0FSVElTVCA9ICdVUERBVEVfRElTUExBWV9BUlRJU1QnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuZXhwb3J0IGNvbnN0IFJFTEFURURfQ0xJQ0sgPSAnUkVMQVRFRF9DTElDSyc7XG5leHBvcnQgY29uc3QgU0hPV19SRUxBVEVEX0lORk8gPSAnU0hPV19SRUxBVEVEX0lORk8nO1xuZXhwb3J0IGNvbnN0IEhJREVfUkVMQVRFRF9JTkZPID0gJ0hJREVfUkVMQVRFRF9JTkZPJztcbmV4cG9ydCBjb25zdCBDTEVBUl9TRVNTSU9OID0gJ0NMRUFSX1NFU1NJT04nO1xuZXhwb3J0IGNvbnN0IExPQURfQUxCVU0gPSAnTE9BRF9BTEJVTSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnRpc3REYXRhQXZhaWxhYmxlKGRhdGEpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBBUlRJU1RfREFUQV9BVkFJTEFCTEUsXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5QXJ0aXN0KGRhdGEpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBVUERBVEVfRElTUExBWV9BUlRJU1QsXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZWFyY2hUZXJtKHNlYXJjaFRlcm0pIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTRUFSQ0hfVEVSTV9VUERBVEUsXG5cdFx0c2VhcmNoVGVybTogc2VhcmNoVGVybVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGVkQ2xpY2socmVsYXRlZEFydGlzdCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFJFTEFURURfQ0xJQ0ssXG5cdFx0ZGF0YTogcmVsYXRlZEFydGlzdFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93UmVsYXRlZChyZWxhdGVkQXJ0aXN0KSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0hPV19SRUxBVEVEX0lORk8sXG5cdFx0ZGF0YTogcmVsYXRlZEFydGlzdFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaWRlUmVsYXRlZCgpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBISURFX1JFTEFURURfSU5GTyxcblx0XHRkYXRhOiBudWxsXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBDTEVBUl9TRVNTSU9OXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRBbGJ1bShhbGJ1bUlkKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogTE9BRF9BTEJVTSxcblx0XHRkYXRhOiBhbGJ1bUlkXG5cdH1cbn1cbiIsImltcG9ydCB7XG5cdFNFQVJDSF9URVJNX1VQREFURSwgQVJUSVNUX0RBVEFfQVZBSUxBQkxFLCBSRUxBVEVEX0NMSUNLLFxuXHRDTEVBUl9TRVNTSU9OLCBVUERBVEVfRElTUExBWV9BUlRJU1QsIFNIT1dfUkVMQVRFRF9JTkZPLCBISURFX1JFTEFURURfSU5GTywgTE9BRF9BTEJVTVxufSBmcm9tICcuLi9hY3Rpb25zJ1xubGV0IGluaXRpYWxTdGF0ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJyk7XG5jb25zdCBlbXB0eUFydGlzdCA9IHtcblx0aWQ6ICcnLFxuXHRuYW1lOiAnJyxcblx0aW1nVXJsOiAnJyxcblx0Z2VucmVzOiBbXSxcblx0cG9wdWxhcml0eTogMCxcblx0aW1hZ2VzOiBbXSxcblx0YWxidW1zOiBbXVxufTtcbmNvbnN0IGVtcHR5U3RhdGUgPSB7XG5cdGFydGlzdDogZW1wdHlBcnRpc3QsXG5cdHJlbGF0ZWRBcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRzZWFyY2hUZXJtOiAnJyxcblx0dmlzaXRlZEFydGlzdHM6IFtdLFxuXHRoaWRlSW5mbzogdHJ1ZSxcblx0c2hvd1JlbGF0ZWQ6IGZhbHNlLFxuXHRkaXNwbGF5QXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0ZGlzcGxheUFsYnVtSW5kZXg6IDBcbn07XG5cbmlmICghaW5pdGlhbFN0YXRlKSB7XG5cdGluaXRpYWxTdGF0ZSA9IHtcblx0XHQuLi5lbXB0eVN0YXRlXG5cdH07XG59IGVsc2Uge1xuXHRpbml0aWFsU3RhdGUgPSBKU09OLnBhcnNlKGluaXRpYWxTdGF0ZSk7XG59XG5cbmNvbnN0IGFwcFN0YXRlID0gKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pID0+IHtcblx0bGV0IG5ld1N0YXRlO1xuXHRzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBTRUFSQ0hfVEVSTV9VUERBVEU6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5zZWFyY2hUZXJtLFxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQVJUSVNUX0RBVEFfQVZBSUxBQkxFOlxuXHRcdFx0aWYgKGFjdGlvbi5kYXRhLmlkKSB7XG5cdFx0XHRcdGxldCBhbHJlYWR5VmlzaXRlZCA9ICEhc3RhdGUudmlzaXRlZEFydGlzdHMubGVuZ3RoXG5cdFx0XHRcdFx0JiYgc3RhdGUudmlzaXRlZEFydGlzdHMuc29tZSgoYXJ0aXN0KSA9PiBhcnRpc3QuaWQgPT09IGFjdGlvbi5kYXRhLmlkKTtcblx0XHRcdFx0bGV0IHZpc2l0ZWRBcnRpc3RzID0gYWxyZWFkeVZpc2l0ZWQgPyBzdGF0ZS52aXNpdGVkQXJ0aXN0cyA6IFsuLi5zdGF0ZS52aXNpdGVkQXJ0aXN0cywgYWN0aW9uLmRhdGFdO1xuXHRcdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0XHRhcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRcdGRpc3BsYXlBcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRcdHZpc2l0ZWRBcnRpc3RzOiBbXG5cdFx0XHRcdFx0XHQuLi52aXNpdGVkQXJ0aXN0cyxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5kYXRhLm5hbWUsXG5cdFx0XHRcdFx0aGlkZUluZm86IGZhbHNlLFxuXHRcdFx0XHRcdGhpZGVSZWxhdGVkOiB0cnVlLFxuXHRcdFx0XHRcdHJlbGF0ZWRBcnRpc3Q6IHtcblx0XHRcdFx0XHRcdC4uLmVtcHR5QXJ0aXN0XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkaXNwbGF5QWxidW1JbmRleDogMFxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdObyBBUEkgZGF0YSBhdmFpbGFibGUgZm9yIGdpdmVuIGFydGlzdC4gTmVlZCB0byByZWZyZXNoIEFQSSBzZXNzaW9uPycpO1xuXHRcdFx0XHRuZXdTdGF0ZSA9IHN0YXRlO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVUERBVEVfRElTUExBWV9BUlRJU1Q6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdGRpc3BsYXlBcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRkaXNwbGF5QWxidW1JbmRleDogMFxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgTE9BRF9BTEJVTTpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0ZGlzcGxheUFsYnVtSW5kZXg6IGFjdGlvbi5kYXRhXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBTSE9XX1JFTEFURURfSU5GTzpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdGhpZGVSZWxhdGVkOiBmYWxzZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgSElERV9SRUxBVEVEX0lORk86XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHJlbGF0ZWRBcnRpc3Q6IHtcblx0XHRcdFx0XHQuLi5lbXB0eUFydGlzdFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoaWRlUmVsYXRlZDogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQ0xFQVJfU0VTU0lPTjpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5lbXB0eVN0YXRlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdH1cblx0d2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3N0YXRlJywgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpKTtcblx0cmV0dXJuIG5ld1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXBwU3RhdGU7IiwiaW1wb3J0IHtjcmVhdGVTdG9yZX0gZnJvbSAncmVkdXgnO1xuaW1wb3J0IGFwcFN0YXRlIGZyb20gXCIuL3JlZHVjZXJzL2FwcC1zdGF0ZVwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFwcFN0YXRlLFxuXHR3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXyAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXygpXG4pO1xuXG5cbiJdfQ==
