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
				if (obj.hasOwnProperty('isText')) {
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
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Props = undefined;

var _three = require("three");

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
	mainArtistSphere: {}
};

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
var TOTAL_RELATED = 10;

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
		value: function getIntersectsFromMousePos(graph, raycaster, camera) {
			raycaster.setFromCamera(_props.Props.mouseVector, camera);
			return raycaster.intersectObjects(graph.children, true);
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
			sphere.isMainArtistSphere = true;
			sphere.isSphere = true;
			SceneUtils.addText(artist.name, MAIN_ARTIST_FONT_SIZE, sphere);
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
				relatedArtistSphere.isSphere = true;
				relatedArtistSphere.isRelatedArtistSphere = true;
				sphereFaceIndex += step;
				SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, sphereFaceIndex);
				SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
				SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere);
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
			textMesh.isText = true;
			sphere.add(textMesh);
			textMesh.position.set(cameraNorm.x * sphere.radius, cameraNorm.y * sphere.radius, cameraNorm.z * sphere.radius);
			textMesh.lookAt(_props.Props.graphContainer.worldToLocal(_props.Props.camera.position));
		}
	}, {
		key: "lighting",
		value: function lighting() {
			var lightA = new THREE.DirectionalLight(0xCCCCCC, 1.725);
			var lightB = new THREE.DirectionalLight(0xAAAAAA, 1.5);
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
			intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(_props.Props.graphContainer, _props.Props.raycaster, _props.Props.camera);
			this.unhighlightRelatedSphere();
			if (intersects.length) {
				selected = intersects[0].object;
				if (selected.hasOwnProperty('isRelatedArtistSphere')) {
					isOverRelated = true;
					this.highlightRelatedSphere(selected);
				} else if (selected.hasOwnProperty('isText')) {
					if (selected.parent.hasOwnProperty('isRelatedArtistSphere')) {
						isOverRelated = true;
						this.highlightRelatedSphere(selected.parent);
					}
				} else {
					this.unhighlightRelatedSphere();
					_store.store.dispatch((0, _actions.hideRelated)());
				}
			} else {
				this.unhighlightRelatedSphere();
				_store.store.dispatch((0, _actions.hideRelated)());
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
			return isOverRelated;
		}
	}, {
		key: "unhighlightRelatedSphere",
		value: function unhighlightRelatedSphere() {
			this.hoveredRelatedSphere && this.hoveredRelatedSphere.material.color.setHex(_colours.Colours.relatedArtist);
			this.hoveredRelatedSphere = null;
		}
	}, {
		key: "highlightRelatedSphere",
		value: function highlightRelatedSphere(sphere) {
			this.hoveredRelatedSphere = sphere;
			_store.store.dispatch((0, _actions.showRelated)(this.hoveredRelatedSphere.artistObj));
			this.hoveredRelatedSphere.material.color.setHex(_colours.Colours.relatedArtistHover);
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
		key: "onSceneMouseClick",
		value: function onSceneMouseClick(event) {
			_props.Props.mouseVector = _sceneUtils.SceneUtils.getMouseVector(event);
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(_props.Props.graphContainer, _props.Props.raycaster, _props.Props.camera);
			if (intersects.length) {
				var selected = intersects[0].object;
				if (selected.hasOwnProperty('isRelatedArtistSphere')) {
					_store.store.dispatch((0, _actions.relatedClick)());
					this.getRelatedArtist(selected);
				} else if (selected.hasOwnProperty('isText')) {
					var parent = selected.parent;
					if (parent.hasOwnProperty('isRelatedArtistSphere')) {
						_store.store.dispatch((0, _actions.relatedClick)());
						this.getRelatedArtist(parent);
					}
				}
			}
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
exports.SpotifyPlayerComponent = SpotifyPlayerComponent;

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SpotifyPlayerComponent(_ref) {
	var artist = _ref.artist,
	    isHidden = _ref.isHidden;

	var embedUrl = 'https://open.spotify.com/embed/artist/';
	var artistEmbedUrl = '' + embedUrl + artist.id;
	var iFrameMarkup = '',
	    albumsListMarkup = void 0;
	if (artist.id) {
		iFrameMarkup = React.createElement(
			'div',
			{ className: 'spotify-player' },
			React.createElement('iframe', { src: artistEmbedUrl, width: '300', height: '80' })
		);
	}
	var classes = isHidden ? 'hidden spotify-player-container' : 'spotify-player-container';
	return React.createElement(
		'div',
		{ className: classes },
		iFrameMarkup
	);
}

},{"react":undefined}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var Colours = exports.Colours = {
	background: 0x003366,
	relatedArtist: 0xcc3300,
	relatedArtistHover: 0x99cc99,
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

var mapStateToProps = function mapStateToProps(state) {
	return {
		artist: state.artist,
		isHidden: state.hideInfo
	};
};

var SpotifyPlayerContainer = (0, _reactRedux.connect)(mapStateToProps)(_spotifyPlayer.SpotifyPlayerComponent);

exports.default = SpotifyPlayerContainer;

},{"../components/spotify-player.component":13,"react-redux":undefined}],21:[function(require,module,exports){
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
				credentials: "same-origin"
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
				credentials: "same-origin"
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				return _store.store.dispatch((0, _actions.artistDataAvailable)(json));
			});
		}
	}, {
		key: 'getArtistAlbums',
		value: function getArtistAlbums(artistId) {
			var artistURL = '/api/albums/' + artistId;
			return window.fetch(artistURL, {
				credentials: "same-origin"
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				return _store.store.dispatch(artistAlbumsAvailable(json));
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
exports.artistAlbumsAvailable = artistAlbumsAvailable;
exports.updateSearchTerm = updateSearchTerm;
exports.relatedClick = relatedClick;
exports.showRelated = showRelated;
exports.hideRelated = hideRelated;
exports.clearSession = clearSession;
var ARTIST_DATA_AVAILABLE = exports.ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
var ARTIST_ALBUMS_AVAILABLE = exports.ARTIST_ALBUMS_AVAILABLE = 'ARTIST_ALBUMS_AVAILABLE';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
var RELATED_CLICK = exports.RELATED_CLICK = 'RELATED_CLICK';
var SHOW_RELATED = exports.SHOW_RELATED = 'SHOW_RELATED';
var HIDE_RELATED = exports.HIDE_RELATED = 'HIDE_RELATED';
var CLEAR_SESSION = exports.CLEAR_SESSION = 'CLEAR_SESSION';

function artistDataAvailable(data) {
	return {
		type: ARTIST_DATA_AVAILABLE,
		data: data
	};
}

function artistAlbumsAvailable(data) {
	return {
		type: ARTIST_ALBUMS_AVAILABLE,
		data: data
	};
}

function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	};
}

function relatedClick() {
	return {
		type: RELATED_CLICK
	};
}

function showRelated(relatedArtist) {
	return {
		type: SHOW_RELATED,
		data: relatedArtist
	};
}

function hideRelated() {
	return {
		type: HIDE_RELATED,
		data: null
	};
}

function clearSession() {
	return {
		type: CLEAR_SESSION
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
	images: []
};
var emptyState = {
	artist: emptyArtist,
	searchTerm: '',
	visitedArtists: [],
	hideInfo: true,
	relatedArtist: emptyArtist,
	showRelated: false
};

if (!initialState) {
	initialState = _extends({}, emptyState);
} else {
	initialState = JSON.parse(sessionStorage.getItem('state'));
}

var artistSearch = function artistSearch() {
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
					visitedArtists: [].concat(_toConsumableArray(visitedArtists)),
					searchTerm: action.data.name,
					hideInfo: false,
					hideRelated: true,
					relatedArtist: _extends({}, emptyArtist)
				});
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				newState = state;
			}
			break;
		case _actions.RELATED_CLICK:
			newState = _extends({}, state, {
				hideInfo: true
			});
			break;
		case _actions.SHOW_RELATED:
			newState = _extends({}, state, {
				relatedArtist: action.data,
				hideRelated: false
			});
			break;
		case _actions.HIDE_RELATED:
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

exports.default = artistSearch;

},{"../actions":22}],24:[function(require,module,exports){
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

},{"./reducers/artist-search":23,"redux":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoLmpzIiwic3JjL2pzL3N0YXRlL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLE1BQVQsQ0FDQztBQUFBO0FBQUEsR0FBVSxtQkFBVjtBQUNDO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOzs7Ozs7Ozs7O3FqQkNOQTs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0lBQVksSzs7Ozs7O0FBRVosSUFBTSxtQkFBbUIsa0JBQXpCO0FBQ0EsSUFBTSxVQUFVLFNBQWhCO0FBQ0EsSUFBTSxhQUFhO0FBQ2xCLE9BQU07QUFEWSxDQUFuQjs7SUFJYSxTLFdBQUEsUztBQUNULHNCQUFjO0FBQUE7O0FBQ2hCLE9BQUssR0FBTCxHQUFXLFVBQVg7QUFDQSxPQUFLLE9BQUw7QUFDQTs7Ozs0QkFFUztBQUFBOztBQUNULGdCQUFNLEVBQU4sR0FBVyxLQUFLLEdBQUwsRUFBWDtBQUNBLFFBQUssWUFBTDtBQUNBLGdCQUFNLFFBQU4sQ0FBZSxNQUFmLENBQXNCLGFBQU0sS0FBNUIsRUFBbUMsYUFBTSxNQUF6QztBQUNBLFVBQU8scUJBQVAsQ0FBNkIsWUFBTTtBQUNsQyxpQkFBTSxFQUFOLEdBQVcsYUFBTSxFQUFqQjtBQUNBLFVBQUssT0FBTCxDQUFhLElBQWI7QUFDQSxJQUhEO0FBSUE7OztpQ0FFYztBQUNkLFdBQVEsS0FBSyxHQUFMLENBQVMsSUFBakI7QUFDQyxTQUFLLGdCQUFMO0FBQ0MsVUFBSyx5QkFBTDtBQUNBO0FBQ0QsU0FBSyxPQUFMO0FBQ0MsVUFBSyxjQUFMO0FBQ0E7QUFORjtBQVFBOzs7OENBRTJCO0FBQzNCLE9BQU0sWUFBWSxTQUFTLEtBQUssR0FBTCxDQUFTLFdBQWxCLE1BQW1DLENB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RWUsWTs7Ozs7Ozs7OztBQ2pHZjs7QUFDQTs7Ozs7O0FBRU8sSUFBSSx3QkFBUSxnREFFbEIsT0FBTyw0QkFBUCxJQUF1QyxPQUFPLDRCQUFQLEVBRnJCLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0FwcENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG5cdFx0PEFwcENvbXBvbmVudCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTsiLCIvKipcbiAqIE1vdGlvbkxhYiBkZWFscyB3aXRoIGNvbnRyb2xsaW5nIGVhY2ggdGljayBvZiB0aGUgYW5pbWF0aW9uIGZyYW1lIHNlcXVlbmNlXG4gKiBJdCdzIGFpbSBpcyB0byBpc29sYXRlIGNvZGUgdGhhdCBoYXBwZW5zIG92ZXIgYSBudW1iZXIgb2YgZnJhbWVzIChpLmUuIG1vdGlvbilcbiAqL1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY29uc3QgVFJBQ0tfQ0FNX1RPX09CSiA9ICdUUkFDS19DQU1fVE9fT0JKJztcbmNvbnN0IERFRkFVTFQgPSAnREVGQVVMVCc7XG5jb25zdCBkZWZhdWx0Sm9iID0ge1xuXHR0eXBlOiBERUZBVUxUXG59O1xuXG5leHBvcnQgY2xhc3MgTW90aW9uTGFiIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdFx0dGhpcy5hbmltYXRlKCk7XG5cdH1cblxuXHRhbmltYXRlKCkge1xuXHRcdFByb3BzLnQyID0gRGF0ZS5ub3coKTtcblx0XHR0aGlzLnByb2Nlc3NTY2VuZSgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnJlbmRlcihQcm9wcy5zY2VuZSwgUHJvcHMuY2FtZXJhKTtcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdFByb3BzLnQxID0gUHJvcHMudDI7XG5cdFx0XHR0aGlzLmFuaW1hdGUuY2FsbCh0aGlzKTtcblx0XHR9KTtcblx0fVxuXG5cdHByb2Nlc3NTY2VuZSgpIHtcblx0XHRzd2l0Y2ggKHRoaXMuam9iLnR5cGUpIHtcblx0XHRcdGNhc2UgVFJBQ0tfQ0FNX1RPX09CSjpcblx0XHRcdFx0dGhpcy50cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBERUZBVUxUOlxuXHRcdFx0XHR0aGlzLnVwZGF0ZVJvdGF0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKSB7XG5cdFx0Y29uc3Qgc2hvdWxkRW5kID0gcGFyc2VJbnQodGhpcy5qb2IuY3VycmVudFRpbWUpID09PSAxO1xuXHRcdGlmICghc2hvdWxkRW5kKSB7XG5cdFx0XHR0aGlzLmZvbGxvd1BhdGgoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmVuZEFuaW1hdGlvbigpO1xuXHRcdH1cblx0fVxuXG5cdGZvbGxvd1BhdGgoKSB7XG5cdFx0Y29uc3QgcCA9IHRoaXMuam9iLnBhdGguZ2V0UG9pbnQodGhpcy5qb2IuY3VycmVudFRpbWUpO1xuXHRcdHRoaXMuam9iLm9iamVjdDNELnBvc2l0aW9uLmNvcHkocCk7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgKz0gMC4wMTtcblx0fVxuXG5cdGVuZEFuaW1hdGlvbigpIHtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayAmJiB0aGlzLmpvYi5jYWxsYmFjaygpO1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0fVxuXG5cdHRyYWNrT2JqZWN0VG9DYW1lcmEob2JqZWN0M0QsIGNhbGxiYWNrKSB7XG4gICAgXHR0aGlzLmpvYiA9IHt9O1xuICAgIFx0dGhpcy5qb2IudHlwZSA9IFRSQUNLX0NBTV9UT19PQko7XG5cdFx0dGhpcy5qb2IudCA9IDAuMDtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSA9IDAuMDtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMuam9iLm9iamVjdDNEID0gb2JqZWN0M0Q7XG5cdFx0dGhpcy5qb2IuZW5kZWQgPSBmYWxzZTtcblx0XHR0aGlzLmpvYi5wYXRoID0gbmV3IFRIUkVFLkNhdG11bGxSb21DdXJ2ZTMoW1xuXHRcdFx0b2JqZWN0M0QucG9zaXRpb24uY2xvbmUoKSxcblx0XHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpXG5cdFx0XSk7XG5cdH1cblxuXHQvKipcblx0ICogVE9ETzogb3B0aW1pc2F0aW9uIC0gb25seSB1c2UgdXBkYXRlUm90YXRpb24oKSBpZiB0aGUgbW91c2UgaXMgZHJhZ2dpbmcgLyBzcGVlZCBpcyBhYm92ZSBkZWZhdWx0IG1pbmltdW1cblx0ICogUm90YXRpb24gb2YgY2FtZXJhIGlzICppbnZlcnNlKiBvZiBtb3VzZSBtb3ZlbWVudCBkaXJlY3Rpb25cblx0ICovXG5cdHVwZGF0ZVJvdGF0aW9uKCkge1xuXHRcdGNvbnN0IGNhbVF1YXRlcm5pb25VcGRhdGUgPSB0aGlzLmdldE5ld0NhbWVyYURpcmVjdGlvbigpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueSAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS56ICogUHJvcHMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuY2FtZXJhTG9va0F0KTtcblx0XHQvLyB1cGRhdGUgcm90YXRpb24gb2YgdGV4dCBhdHRhY2hlZCBvYmplY3RzLCB0byBmb3JjZSB0aGVtIHRvIGxvb2sgYXQgY2FtZXJhXG5cdFx0Ly8gdGhpcyBtYWtlcyB0aGVtIHJlYWRhYmxlXG5cdFx0UHJvcHMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0bGV0IGNhbWVyYU5vcm0gPSBQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqLnBvc2l0aW9uLnNldChcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnggKiBvYmoucGFyZW50LnJhZGl1cyxcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnkgKiBvYmoucGFyZW50LnJhZGl1cyxcblx0XHRcdFx0XHRjYW1lcmFOb3JtLnogKiBvYmoucGFyZW50LnJhZGl1c1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRvYmoubG9va0F0KFByb3BzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbChQcm9wcy5jYW1lcmEucG9zaXRpb24pKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnJlZHVjZVNwZWVkKDAuMDAwNSk7XG5cdH1cblxuXHRnZXROZXdDYW1lcmFEaXJlY3Rpb24oKSB7XG5cdFx0bGV0IGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdFx0Y29uc3QgeU1vcmVUaGFuWE1vdXNlID0gUHJvcHMubW91c2VQb3NEaWZmWSA+PSBQcm9wcy5tb3VzZVBvc0RpZmZYO1xuXHRcdGNvbnN0IHhNb3JlVGhhbllNb3VzZSA9ICF5TW9yZVRoYW5YTW91c2U7XG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggLT0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCArPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgKz0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSAtPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUgPSBTY2VuZVV0aWxzLnJlbm9ybWFsaXplUXVhdGVybmlvbihQcm9wcy5jYW1lcmEpO1xuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUuc2V0RnJvbUV1bGVyKFByb3BzLmNhbWVyYVJvdGF0aW9uKTtcblx0XHRyZXR1cm4gY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmIChQcm9wcy5zcGVlZFggPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRYIC09IGFtb3VudDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWSAtPSBhbW91bnQ7XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmV4cG9ydCBjb25zdCBQcm9wcyA9IHtcblx0cmVuZGVyZXI6IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSksXG5cdHNjZW5lOiBuZXcgVEhSRUUuU2NlbmUoKSxcblx0Y2FtZXJhOiBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCksXG5cdGdyYXBoQ29udGFpbmVyOiBuZXcgVEhSRUUuT2JqZWN0M0QoKSxcblx0Y2FtZXJhUm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigwLCAtMSwgMCksXG5cdGNhbWVyYUxvb2tBdDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXG5cdGNhbWVyYURpc3RhbmNlOiAzNTAwLFxuXHRcblx0dDE6IDAuMCwgLy8gb2xkIHRpbWVcblx0dDI6IDAuMCwgLy8gbm93IHRpbWVcblx0c3BlZWRYOiAwLjAwNSxcblx0c3BlZWRZOiAwLjAwMCxcblx0bW91c2VQb3NEaWZmWDogMC4wLFxuXHRtb3VzZVBvc0RpZmZZOiAwLjAsXG5cdG1vdXNlUG9zWEluY3JlYXNlZDogZmFsc2UsXG5cdG1vdXNlUG9zWUluY3JlYXNlZDogZmFsc2UsXG5cdHJheWNhc3RlcjogbmV3IFRIUkVFLlJheWNhc3RlcigpLFxuXHRtb3VzZVZlY3RvcjogbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XG5cdHJlbGF0ZWRBcnRpc3RTcGhlcmVzOiBbXSxcblx0bWFpbkFydGlzdFNwaGVyZToge31cbn07IiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gJy4uL2NvbmZpZy9jb2xvdXJzJztcbmltcG9ydCB7UHJvcHN9IGZyb20gXCIuL3Byb3BzXCI7XG5pbXBvcnQge1N0YXRpc3RpY3N9IGZyb20gXCIuL3N0YXRpc3RpY3MuY2xhc3NcIjtcblxubGV0IEhFTFZFVElLRVI7XG5jb25zdCBNQUlOX0FSVElTVF9GT05UX1NJWkUgPSAzNDtcbmNvbnN0IFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSA9IDIwO1xuY29uc3QgVE9UQUxfUkVMQVRFRCA9IDEwO1xuXG5jbGFzcyBTY2VuZVV0aWxzIHtcblx0c3RhdGljIGluaXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0XHRsb2FkZXIubG9hZCgnLi9qcy9mb250cy9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbicsIChmb250KSA9PiB7XG5cdFx0XHRcdEhFTFZFVElLRVIgPSBmb250O1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAoKT0+e30sIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhIC0gbWluXG5cdCAqIEBwYXJhbSBiIC0gbWF4XG5cdCAqIEBwYXJhbSBjIC0gdmFsdWUgdG8gY2xhbXBcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBjbGFtcChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KGIsIE1hdGgubWluKGMsIGEpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBwb3NpdGl2ZSB4IHJldHVybiAxLCBuZWdhdGl2ZSB4IHJldHVybiAtMSwgb3IgMCBvdGhlcndpc2Vcblx0ICogQHBhcmFtIG5cblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBzaWduKG4pIHtcblx0XHRyZXR1cm4gbiA+IDAgPyAxIDogbiA8IDAgPyAtMSA6IDA7XG5cdH07XG5cdFxuXHRzdGF0aWMgcmVub3JtYWxpemVRdWF0ZXJuaW9uKG9iamVjdCkge1xuXHRcdGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhncmFwaCwgcmF5Y2FzdGVyLCBjYW1lcmEpIHtcblx0XHRyYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShQcm9wcy5tb3VzZVZlY3RvciwgY2FtZXJhKTtcblx0XHRyZXR1cm4gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoZ3JhcGguY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGdldE1vdXNlVmVjdG9yKGV2ZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKChldmVudC5jbGllbnRYIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCkge1xuXHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IGFydGlzdDtcblx0XHRzcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdHNwaGVyZS5pc01haW5BcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdHNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0U2NlbmVVdGlscy5hZGRUZXh0KGFydGlzdC5uYW1lLCBNQUlOX0FSVElTVF9GT05UX1NJWkUsIHNwaGVyZSk7XG5cdFx0cmV0dXJuIHNwaGVyZTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIG1haW5BcnRpc3RTcGhlcmUpIHtcblx0XHRsZXQgcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheSA9IFtdO1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0O1xuXHRcdGxldCBzcGhlcmVGYWNlSW5kZXggPSAwO1xuXHRcdGxldCBmYWNlc0NvdW50ID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxO1xuXHRcdGxldCBzdGVwID0gTWF0aC5yb3VuZChmYWNlc0NvdW50IC8gVE9UQUxfUkVMQVRFRCAtIDEpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbiA9IE1hdGgubWluKFRPVEFMX1JFTEFURUQsIGFydGlzdC5yZWxhdGVkLmxlbmd0aCk7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdCA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShyZWxhdGVkQXJ0aXN0KTtcblx0XHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0XHRsZXQgcmVsYXRlZEFydGlzdFNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZEFydGlzdH0pKTtcblx0XHRcdGxldCBnZW5yZU1ldHJpY3MgPSBTdGF0aXN0aWNzLmdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iaiA9IHJlbGF0ZWRBcnRpc3Q7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iai5nZW5yZVNpbWlsYXJpdHkgPSBnZW5yZU1ldHJpY3MuZ2VucmVTaW1pbGFyaXR5O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5kaXN0YW5jZSA9IGdlbnJlTWV0cmljcy5saW5lTGVuZ3RoO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmlzU3BoZXJlID0gdHJ1ZTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNSZWxhdGVkQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRcdHNwaGVyZUZhY2VJbmRleCArPSBzdGVwO1xuXHRcdFx0U2NlbmVVdGlscy5wb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZEFydGlzdFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KTtcblx0XHRcdFNjZW5lVXRpbHMuam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRTY2VuZVV0aWxzLmFkZFRleHQocmVsYXRlZEFydGlzdC5uYW1lLCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0cmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheS5wdXNoKHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheTtcblx0fVxuXG5cdHN0YXRpYyBhcHBlbmRPYmplY3RzVG9TY2VuZShncmFwaENvbnRhaW5lciwgc3BoZXJlLCBzcGhlcmVBcnJheSkge1xuXHRcdGNvbnN0IHBhcmVudCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXHRcdHBhcmVudC5uYW1lID0gJ3BhcmVudCc7XG5cdFx0cGFyZW50LmFkZChzcGhlcmUpO1xuXHRcdGlmIChzcGhlcmVBcnJheSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGhlcmVBcnJheS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRwYXJlbnQuYWRkKHNwaGVyZUFycmF5W2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Z3JhcGhDb250YWluZXIuYWRkKHBhcmVudCk7XG5cdH1cblxuXHRzdGF0aWMgam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSkge1xuXHRcdGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZExpbmVKb2lufSk7XG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0bGV0IGxpbmU7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChyZWxhdGVkU3BoZXJlLnBvc2l0aW9uLmNsb25lKCkpO1xuXHRcdGxpbmUgPSBuZXcgVEhSRUUuTGluZShnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXHRcdG1haW5BcnRpc3RTcGhlcmUuYWRkKGxpbmUpO1xuXHR9XG5cblx0c3RhdGljIHBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpIHtcblx0XHRsZXQgbWFpbkFydGlzdFNwaGVyZUZhY2UgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzW01hdGguZmxvb3Ioc3BoZXJlRmFjZUluZGV4KV0ubm9ybWFsLmNsb25lKCk7XG5cdFx0cmVsYXRlZFNwaGVyZS5wb3NpdGlvblxuXHRcdFx0LmNvcHkobWFpbkFydGlzdFNwaGVyZUZhY2UubXVsdGlwbHkobmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2Vcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgYWRkVGV4dChsYWJlbCwgc2l6ZSwgc3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsRnJvbnQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRPdXRlcn0pO1xuXHRcdGxldCBtYXRlcmlhbFNpZGUgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRJbm5lcn0pO1xuXHRcdGxldCBtYXRlcmlhbEFycmF5ID0gW21hdGVyaWFsRnJvbnQsIG1hdGVyaWFsU2lkZV07XG5cdFx0bGV0IHRleHRHZW9tID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeShsYWJlbCwge1xuXHRcdFx0Zm9udDogSEVMVkVUSUtFUixcblx0XHRcdHNpemU6IHNpemUsXG5cdFx0XHRjdXJ2ZVNlZ21lbnRzOiA0LFxuXHRcdFx0YmV2ZWxFbmFibGVkOiB0cnVlLFxuXHRcdFx0YmV2ZWxUaGlja25lc3M6IDIsXG5cdFx0XHRiZXZlbFNpemU6IDEsXG5cdFx0XHRiZXZlbFNlZ21lbnRzOiAzXG5cdFx0fSk7XG5cdFx0bGV0IHRleHRNZXNoID0gbmV3IFRIUkVFLk1lc2godGV4dEdlb20sIG1hdGVyaWFsQXJyYXkpO1xuXHRcdGxldCBjYW1lcmFOb3JtID0gUHJvcHMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCkubm9ybWFsaXplKCk7XG5cdFx0dGV4dE1lc2guaXNUZXh0ID0gdHJ1ZTtcblx0XHRzcGhlcmUuYWRkKHRleHRNZXNoKTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1lcmFOb3JtLnggKiBzcGhlcmUucmFkaXVzLFxuXHRcdFx0Y2FtZXJhTm9ybS55ICogc3BoZXJlLnJhZGl1cyxcblx0XHRcdGNhbWVyYU5vcm0ueiAqIHNwaGVyZS5yYWRpdXNcblx0XHQpO1xuXHRcdHRleHRNZXNoLmxvb2tBdChQcm9wcy5ncmFwaENvbnRhaW5lci53b3JsZFRvTG9jYWwoUHJvcHMuY2FtZXJhLnBvc2l0aW9uKSk7XG5cblx0fVxuXG5cdHN0YXRpYyBsaWdodGluZygpIHtcblx0XHRsZXQgbGlnaHRBID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhDQ0NDQ0MsIDEuNzI1KTtcblx0XHRsZXQgbGlnaHRCID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhBQUFBQUEsIDEuNSk7XG5cdFx0bGlnaHRBLnBvc2l0aW9uLnNldFgoNTAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WSgtODAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WCgtNTAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRBKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRCKTtcblx0fVxufVxuXG5leHBvcnQgeyBTY2VuZVV0aWxzIH1cbiIsIi8qKlxuICogU3BoZXJlc1NjZW5lIGlzIGRlc2lnbmVkIHRvIGhhbmRsZSBhZGRpbmcgYW5kIHJlbW92aW5nIGVudGl0aWVzIGZyb20gdGhlIHNjZW5lLFxuICogYW5kIGhhbmRsaW5nIGV2ZW50cy5cbiAqXG4gKiBJdCBhaW1zIHRvIGRlYWwgbm90IHdpdGggY2hhbmdlcyBvdmVyIHRpbWUsIG9ubHkgaW1tZWRpYXRlIGNoYW5nZXMgaW4gb25lIGZyYW1lLlxuICovXG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gXCIuLi9jb25maWcvY29sb3Vyc1wiO1xuaW1wb3J0IHtNb3Rpb25MYWJ9IGZyb20gXCIuL21vdGlvbi1sYWIuY2xhc3NcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2hpZGVSZWxhdGVkLCByZWxhdGVkQ2xpY2ssIHNob3dSZWxhdGVkfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0bGV0IGFydGlzdElkO1xuXHRcdHRoaXMuaG92ZXJlZFJlbGF0ZWRTcGhlcmUgPSBudWxsO1xuXHRcdHRoaXMubW90aW9uTGFiID0gbmV3IE1vdGlvbkxhYigpO1xuXG5cdFx0Ly8gYXR0YWNoIHRvIGRvbVxuXHRcdFByb3BzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5pZCA9ICdyZW5kZXJlcic7XG5cdFx0UHJvcHMuY29udGFpbmVyID0gY29udGFpbmVyO1xuXHRcdFByb3BzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50KTtcblxuXHRcdC8vIGluaXQgdGhlIHNjZW5lXG5cdFx0UHJvcHMuZ3JhcGhDb250YWluZXIucG9zaXRpb24uc2V0KDEsIDUsIDApO1xuXHRcdFByb3BzLnNjZW5lLmFkZChQcm9wcy5ncmFwaENvbnRhaW5lcik7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmNhbWVyYSk7XG5cdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLnNldCgwLCAyNTAsIFByb3BzLmNhbWVyYURpc3RhbmNlKTtcblx0XHRQcm9wcy5jYW1lcmEubG9va0F0KFByb3BzLnNjZW5lLnBvc2l0aW9uKTtcblx0XHRTY2VuZVV0aWxzLmxpZ2h0aW5nKFByb3BzLnNjZW5lKTtcblxuXHRcdC8vIGNoZWNrIGZvciBxdWVyeSBzdHJpbmdcblx0XHRhcnRpc3RJZCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpKTtcblx0XHRpZiAoYXJ0aXN0SWQpIHtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KGFydGlzdElkKTtcblx0XHR9XG5cdH1cblxuXHRjb21wb3NlU2NlbmUoYXJ0aXN0KSB7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0LmlkKTtcblx0XHRQcm9wcy5tYWluQXJ0aXN0U3BoZXJlID0gU2NlbmVVdGlscy5jcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCk7XG5cdFx0UHJvcHMucmVsYXRlZEFydGlzdFNwaGVyZXMgPSBTY2VuZVV0aWxzLmNyZWF0ZVJlbGF0ZWRTcGhlcmVzKGFydGlzdCwgUHJvcHMubWFpbkFydGlzdFNwaGVyZSk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMubWFpbkFydGlzdFNwaGVyZSwgUHJvcHMucmVsYXRlZEFydGlzdFNwaGVyZXMpO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpIHtcblx0XHRsZXQgc2VsZWN0ZWQ7XG5cdFx0bGV0IGludGVyc2VjdHM7XG5cdFx0bGV0IGlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoUHJvcHMuZ3JhcGhDb250YWluZXIsIFByb3BzLnJheWNhc3RlciwgUHJvcHMuY2FtZXJhKTtcblx0XHR0aGlzLnVuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZSgpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZShzZWxlY3RlZCk7XG5cdFx0XHR9IGVsc2UgaWYgKHNlbGVjdGVkLmhhc093blByb3BlcnR5KCdpc1RleHQnKSkge1xuXHRcdFx0XHRpZiAoc2VsZWN0ZWQucGFyZW50Lmhhc093blByb3BlcnR5KCdpc1JlbGF0ZWRBcnRpc3RTcGhlcmUnKSkge1xuXHRcdFx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdHRoaXMuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZShzZWxlY3RlZC5wYXJlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnVuaGlnaGxpZ2h0UmVsYXRlZFNwaGVyZSgpO1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy51bmhpZ2hsaWdodFJlbGF0ZWRTcGhlcmUoKTtcblx0XHRcdHN0b3JlLmRpc3BhdGNoKGhpZGVSZWxhdGVkKCkpO1xuXHRcdH1cblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHRcdHJldHVybiBpc092ZXJSZWxhdGVkO1xuXHR9XG5cblx0dW5oaWdobGlnaHRSZWxhdGVkU3BoZXJlKCkge1xuXHRcdHRoaXMuaG92ZXJlZFJlbGF0ZWRTcGhlcmUgJiZcblx0XHRcdHRoaXMuaG92ZXJlZFJlbGF0ZWRTcGhlcmUubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdCk7XG5cdFx0dGhpcy5ob3ZlcmVkUmVsYXRlZFNwaGVyZSA9IG51bGw7XG5cdH1cblxuXHRoaWdobGlnaHRSZWxhdGVkU3BoZXJlKHNwaGVyZSkge1xuXHRcdHRoaXMuaG92ZXJlZFJlbGF0ZWRTcGhlcmUgPSBzcGhlcmU7XG5cdFx0c3RvcmUuZGlzcGF0Y2goc2hvd1JlbGF0ZWQodGhpcy5ob3ZlcmVkUmVsYXRlZFNwaGVyZS5hcnRpc3RPYmopKTtcblx0XHR0aGlzLmhvdmVyZWRSZWxhdGVkU3BoZXJlLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdH1cblxuXHRvblNjZW5lTW91c2VEcmFnKGV2ZW50KSB7XG5cdFx0Y29uc3QgZHQgPSBQcm9wcy50MiAtIFByb3BzLnQxO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VQb3NYSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnggPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci54KTtcblx0XHRQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueSA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlggPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci54KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLngpKTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueSkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci55KSk7XG5cdFx0UHJvcHMuc3BlZWRYID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWCkgLyBkdCk7XG5cdFx0UHJvcHMuc3BlZWRZID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWSkgLyBkdCk7XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c3RvcmUuZGlzcGF0Y2gocmVsYXRlZENsaWNrKCkpO1xuXHRcdFx0XHR0aGlzLmdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWQpO1xuXHRcdFx0fSBlbHNlIGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0bGV0IHBhcmVudCA9IHNlbGVjdGVkLnBhcmVudDtcblx0XHRcdFx0aWYgKHBhcmVudC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0XHRzdG9yZS5kaXNwYXRjaChyZWxhdGVkQ2xpY2soKSk7XG5cdFx0XHRcdFx0dGhpcy5nZXRSZWxhdGVkQXJ0aXN0KHBhcmVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgc2VsZWN0ZWRTcGhlcmUpO1xuXHRcdHRoaXMubW90aW9uTGFiLnRyYWNrT2JqZWN0VG9DYW1lcmEoc2VsZWN0ZWRTcGhlcmUsICgpID0+IHtcblx0XHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqLmlkKTtcblx0XHR9KTtcblx0fVxuXG5cdGNsZWFyR3JhcGgoKSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gUHJvcHMuZ3JhcGhDb250YWluZXIuZ2V0T2JqZWN0QnlOYW1lKCdwYXJlbnQnKTtcblx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5yZW1vdmUocGFyZW50KTtcblx0XHR9XG5cdH1cblxuXHRjbGVhckFkZHJlc3MoKSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcblx0fVxuXG5cdHpvb20oZGlyZWN0aW9uKSB7XG5cdFx0c3dpdGNoIChkaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgJ2luJzpcblx0XHRcdFx0UHJvcHMuY2FtZXJhRGlzdGFuY2UgLT0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb3V0Jzpcblx0XHRcdFx0UHJvcHMuY2FtZXJhRGlzdGFuY2UgKz0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZUNhbWVyYUFzcGVjdCgpIHtcblx0XHRQcm9wcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0UHJvcHMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHR9XG59XG4iLCJjb25zdCBNQVhfRElTVEFOQ0UgPSA4MDA7XG5jb25zdCBTSVpFX1NDQUxBUl9TTUFMTCA9IDEuMjU7XG5jb25zdCBTSVpFX1NDQUxBUl9CSUcgPSAxLjc1O1xuXG5leHBvcnQgY2xhc3MgU3RhdGlzdGljcyB7XG4gICAgc3RhdGljIGdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KSB7XG4gICAgXHRpZiAoYXJ0aXN0LnBvcHVsYXJpdHkgPj0gNTApIHtcblx0XHRcdHJldHVybiBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSX0JJRztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGFydGlzdC5wb3B1bGFyaXR5ICogU0laRV9TQ0FMQVJfU01BTEw7XG5cdFx0fVxuXG4gICAgfVxuXG5cdC8qKlxuICAgICAqIE1hcC1yZWR1Y2Ugb2YgdHdvIHN0cmluZyBhcnJheXNcblx0ICogQHBhcmFtIGFydGlzdFxuXHQgKiBAcGFyYW0gcmVsYXRlZEFydGlzdFxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fVxuXHQgKi9cblx0c3RhdGljIGdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCkge1xuXHRcdGxldCB1bml0LCBnZW5yZVNpbWlsYXJpdHksIHJlbGF0aXZlTWluRGlzdGFuY2UsIGFydGlzdEdlbnJlQ291bnQ7XG5cdFx0bGV0IG1hdGNoZXMgPSBhcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAubWFwKChtYWluQXJ0aXN0R2VucmUpID0+IFN0YXRpc3RpY3MubWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBtYXRjaCkgPT4ge1xuXHRcdCAgICAgICAgaWYgKG1hdGNoKSB7XG5cdFx0ICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChtYXRjaCk7XG5cdFx0XHRcdH1cblx0XHQgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgICAgICAgIH0sIFtdKTtcblx0XHRhcnRpc3RHZW5yZUNvdW50ID0gYXJ0aXN0LmdlbnJlcy5sZW5ndGggPyBhcnRpc3QuZ2VucmVzLmxlbmd0aCA6IDE7XG5cdFx0dW5pdCA9IDEgLyBhcnRpc3RHZW5yZUNvdW50O1xuXHRcdHVuaXQgPSB1bml0ID09PSAxID8gMCA6IHVuaXQ7XG5cdFx0Z2VucmVTaW1pbGFyaXR5ID0gbWF0Y2hlcy5sZW5ndGggKiB1bml0O1xuXHRcdHJlbGF0aXZlTWluRGlzdGFuY2UgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KSArIFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShyZWxhdGVkQXJ0aXN0KTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGluZUxlbmd0aDogKE1BWF9ESVNUQU5DRSAtIChNQVhfRElTVEFOQ0UgKiBnZW5yZVNpbWlsYXJpdHkpKSArIHJlbGF0aXZlTWluRGlzdGFuY2UsXG5cdFx0XHRnZW5yZVNpbWlsYXJpdHk6IE1hdGgucm91bmQoZ2VucmVTaW1pbGFyaXR5ICogMTAwKVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgbWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiByZWxhdGVkQXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLmZpbmQoKGdlbnJlKSA9PiBnZW5yZSA9PT0gbWFpbkFydGlzdEdlbnJlKTtcbiAgICB9XG4gfSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5pbXBvcnQgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb250YWluZXJcIjtcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250YWluZXJcIj5cblx0XHRcdFx0PFNlYXJjaENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTY2VuZUNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTcG90aWZ5UGxheWVyQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RJbmZvQ29tcG9uZW50KHthcnRpc3QsIGlzSGlkZGVufSkge1xuXHRjb25zdCBnZW5yZXMgPSBhcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIG1haW4nIDogJ2luZm8tY29udGFpbmVyIG1haW4nO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hbWUtdGFnIG1haW5cIj57YXJ0aXN0Lm5hbWV9PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBvcHVsYXJpdHlcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPlBvcHVsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e2FydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+e2dlbnJlc308L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmV4cG9ydCBjbGFzcyBBcnRpc3RMaXN0Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdGhhbmRsZUdldEFydGlzdChldnQsIGFydGlzdElkKSB7XG5cdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBhcnRpc3RzID0gdGhpcy5wcm9wcy52aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdFx0bGV0IGhyZWYgPSAnL2FwcC8jJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFx0bGV0IGltZ1VybCA9IGFydGlzdC5pbWFnZXMgJiYgYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0XHRsZXQgaW1nU3R5bGUgPSB7IGJhY2tncm91bmRJbWFnZTogYHVybCgke2ltZ1VybH0pYCB9O1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdFx0PGEgaHJlZj17aHJlZn0gaWQ9e2FydGlzdC5pZH0gY2xhc3NOYW1lPVwibmF2LWFydGlzdC1saW5rXCJcblx0XHRcdFx0XHQgICBvbkNsaWNrPXsoZXZlbnQpID0+IHsgdGhpcy5oYW5kbGVHZXRBcnRpc3QoZXZlbnQsIGFydGlzdC5pZCkgfX0+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmUtaG9sZGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGljdHVyZVwiIHN0eWxlPXtpbWdTdHlsZX0gLz5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibmFtZVwiPnthcnRpc3QubmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdClcblx0XHR9KTtcblx0XHRjb25zdCBjbGFzc2VzID0gdGhpcy5wcm9wcy5pc0hpZGRlbiA/ICdoaWRkZW4gYXJ0aXN0LW5hdmlnYXRpb24nIDogJ2FydGlzdC1uYXZpZ2F0aW9uJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9IHJlZj17ZWxlbSA9PiB0aGlzLmFydGlzdExpc3REb20gPSBlbGVtfT5cblx0XHRcdFx0e2FydGlzdHN9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmFydGlzdExpc3REb20uc2Nyb2xsVG9wID0gdGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbEhlaWdodDtcblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcblx0XHR0aGlzLmFydGlzdExpc3REb20uc2Nyb2xsVG9wID0gdGhpcy5hcnRpc3RMaXN0RG9tLnNjcm9sbEhlaWdodDtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVsYXRlZEFydGlzdEluZm9Db21wb25lbnQoe3JlbGF0ZWRBcnRpc3QsIGhpZGVSZWxhdGVkLCBoaWRlSW5mb30pIHtcblx0Y29uc3QgaGlkZGVuQ2xhc3MgPSBoaWRlUmVsYXRlZCB8fCBoaWRlSW5mbyA/ICdoaWRkZW4gaW5mby1jb250YWluZXIgcmVsYXRlZCcgOiAnaW5mby1jb250YWluZXIgcmVsYXRlZCc7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2hpZGRlbkNsYXNzfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hbWUtdGFnIHJlbGF0ZWRcIj57cmVsYXRlZEFydGlzdC5uYW1lfTwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwb3B1bGFyaXR5XCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5Qb3B1bGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJnZW5yZXNcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPkdlbnJlIHNpbWlsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e3JlbGF0ZWRBcnRpc3QuZ2VucmVTaW1pbGFyaXR5fSU8L3NwYW4+PC9kaXY+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4uL2NsYXNzZXMvc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7U3BoZXJlc1NjZW5lfSBmcm9tIFwiLi4vY2xhc3Nlcy9zcGhlcmVzLXNjZW5lLmNsYXNzXCI7XG5pbXBvcnQge3JlbGF0ZWRDbGlja30gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFydGlzdCA9IHN0b3JlLmdldFN0YXRlKCkuYXJ0aXN0O1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSBmYWxzZTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJzcGhlcmVzLXNjZW5lXCIgcmVmPXtlbGVtID0+IHRoaXMuc2NlbmVEb20gPSBlbGVtfS8+XG5cdFx0KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0U2NlbmVVdGlscy5pbml0KCkudGhlbigoKSA9PiB7IC8vIGxvYWQgdGhlIGZvbnQgZmlyc3QgKGFzeW5jKVxuXHRcdFx0dGhpcy5zY2VuZSA9IG5ldyBTcGhlcmVzU2NlbmUodGhpcy5zY2VuZURvbSk7XG5cdFx0XHR0aGlzLmluaXRTY2VuZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCkge1xuXHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdH1cblxuXHRpbml0U2NlbmUoKSB7XG5cdFx0Y29uc3QgeyBhcnRpc3QgfSA9IHRoaXMucHJvcHM7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGV2ZW50ID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpOyAvLyByZW1vdmUgcmlnaHQgY2xpY2tcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMsIHRydWUpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLCBmYWxzZSk7XG5cdFx0aWYgKGFydGlzdC5pZCkge1xuXHRcdFx0dGhpcy5zY2VuZS5jb21wb3NlU2NlbmUoYXJ0aXN0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zY2VuZS5jbGVhckdyYXBoKCk7XG5cdFx0XHR0aGlzLnNjZW5lLmNsZWFyQWRkcmVzcygpO1xuXHRcdH1cblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKCF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKHRoaXMubW91c2VJc0Rvd24pIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZURyYWcoZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc092ZXJSZWxhdGVkID0gdGhpcy5zY2VuZS5vblNjZW5lTW91c2VIb3ZlcihldmVudCk7XG5cdFx0fVxuXHRcdGlmIChpc092ZXJSZWxhdGVkICYmICF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgcG9pbnRlcic7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYmJlZCc7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vkb3duKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSB0cnVlO1xuXHR9XG5cblx0bW91c2V1cCgpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRtb3VzZXdoZWVsKGV2ZW50KSB7XG5cdFx0c3dpdGNoIChTY2VuZVV0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRjYXNlIC0xOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ291dCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdpbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5zY2VuZS51cGRhdGVDYW1lcmFBc3BlY3QoKTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGFydGlzdCwgaGFuZGxlU2VhcmNoLCBoYW5kbGVTZWFyY2hUZXJtVXBkYXRlLCBjbGVhclNlc3Npb259KSB7XG4gICAgY29uc3QgY2xlYXJCdG5DbGFzcyA9IGFydGlzdC5pZCA/ICdjbGVhci1zZXNzaW9uJyA6ICdoaWRkZW4gY2xlYXItc2Vzc2lvbic7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWFyY2gtZm9ybS1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImFydGlzdC1zZWFyY2hcIiBvblN1Ym1pdD17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwic2VhcmNoLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJlLmcuIEppbWkgSGVuZHJpeFwiIHZhbHVlPXtzZWFyY2hUZXJtfSBvbkNoYW5nZT17aGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0gLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBvbkNsaWNrPXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+R288L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17Y2xlYXJCdG5DbGFzc30gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eyhldnQpID0+IGNsZWFyU2Vzc2lvbihldnQpfT5DbGVhciBTZXNzaW9uPC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTcG90aWZ5UGxheWVyQ29tcG9uZW50KHthcnRpc3QsIGlzSGlkZGVufSkge1xuXHRjb25zdCBlbWJlZFVybCA9ICdodHRwczovL29wZW4uc3BvdGlmeS5jb20vZW1iZWQvYXJ0aXN0Lyc7XG5cdGNvbnN0IGFydGlzdEVtYmVkVXJsID0gYCR7ZW1iZWRVcmx9JHthcnRpc3QuaWR9YDtcblx0bGV0IGlGcmFtZU1hcmt1cCA9ICcnLFxuXHRcdGFsYnVtc0xpc3RNYXJrdXA7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cblx0fVxuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIHNwb3RpZnktcGxheWVyLWNvbnRhaW5lcicgOiAnc3BvdGlmeS1wbGF5ZXItY29udGFpbmVyJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHR7aUZyYW1lTWFya3VwfVxuXHRcdDwvZGl2PlxuXHQpXG59IiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZExpbmVKb2luOiAweGZmZmZjYyxcblx0bWFpbkFydGlzdDogMHhmZmNjMDAsXG5cdHRleHRPdXRlcjogMHhmZmZmY2MsXG5cdHRleHRJbm5lcjogMHgwMDAwMzNcbn07IiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdCxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuXG5jb25zdCBBcnRpc3RMaXN0Q29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7UmVsYXRlZEFydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRyZWxhdGVkQXJ0aXN0OiBzdGF0ZS5yZWxhdGVkQXJ0aXN0LFxuXHRcdGhpZGVSZWxhdGVkOiBzdGF0ZS5oaWRlUmVsYXRlZCxcblx0XHRoaWRlSW5mbzogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoUmVsYXRlZEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1NjZW5lQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3NjZW5lLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNjZW5lQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNjZW5lQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7IE11c2ljRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHtjbGVhclNlc3Npb24sIHVwZGF0ZVNlYXJjaFRlcm19IGZyb20gJy4uL3N0YXRlL2FjdGlvbnMnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRzZWFyY2hUZXJtOiBzdGF0ZS5zZWFyY2hUZXJtLFxuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhbmRsZVNlYXJjaDogKGV2dCwgYXJ0aXN0TmFtZSkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLnNlYXJjaChhcnRpc3ROYW1lKTtcblx0XHR9LFxuXHRcdGhhbmRsZVNlYXJjaFRlcm1VcGRhdGU6IChldnQpID0+IHtcblx0XHRcdGRpc3BhdGNoKHVwZGF0ZVNlYXJjaFRlcm0oZXZ0LnRhcmdldC52YWx1ZSkpO1xuXHRcdH0sXG5cdFx0Y2xlYXJTZXNzaW9uOiAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGRpc3BhdGNoKGNsZWFyU2Vzc2lvbigpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNlYXJjaENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKFNlYXJjaElucHV0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U3BvdGlmeVBsYXllckNvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50XCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0LFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHthcnRpc3REYXRhQXZhaWxhYmxlfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBzZWFyY2goYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIlxuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXJ0aXN0KGFydGlzdElkKSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FydGlzdC8nICsgYXJ0aXN0SWQ7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGdldEFydGlzdEFsYnVtcyhhcnRpc3RJZCkge1xuXHRcdGxldCBhcnRpc3RVUkwgPSAnL2FwaS9hbGJ1bXMvJyArIGFydGlzdElkO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goYXJ0aXN0VVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogXCJzYW1lLW9yaWdpblwiXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdEFsYnVtc0F2YWlsYWJsZShqc29uKSkpO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9EQVRBX0FWQUlMQUJMRSA9ICdBUlRJU1RfREFUQV9BVkFJTEFCTEUnO1xuZXhwb3J0IGNvbnN0IEFSVElTVF9BTEJVTVNfQVZBSUxBQkxFID0gJ0FSVElTVF9BTEJVTVNfQVZBSUxBQkxFJztcbmV4cG9ydCBjb25zdCBTRUFSQ0hfVEVSTV9VUERBVEUgPSAnU0VBUkNIX1RFUk1fVVBEQVRFJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0NMSUNLID0gJ1JFTEFURURfQ0xJQ0snO1xuZXhwb3J0IGNvbnN0IFNIT1dfUkVMQVRFRCA9ICdTSE9XX1JFTEFURUQnO1xuZXhwb3J0IGNvbnN0IEhJREVfUkVMQVRFRCA9ICdISURFX1JFTEFURUQnO1xuZXhwb3J0IGNvbnN0IENMRUFSX1NFU1NJT04gPSAnQ0xFQVJfU0VTU0lPTic7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnRpc3REYXRhQXZhaWxhYmxlKGRhdGEpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBBUlRJU1RfREFUQV9BVkFJTEFCTEUsXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnRpc3RBbGJ1bXNBdmFpbGFibGUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9BTEJVTVNfQVZBSUxBQkxFLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRlZENsaWNrKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFJFTEFURURfQ0xJQ0tcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JlbGF0ZWQocmVsYXRlZEFydGlzdCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNIT1dfUkVMQVRFRCxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVSZWxhdGVkKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEhJREVfUkVMQVRFRCxcblx0XHRkYXRhOiBudWxsXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBDTEVBUl9TRVNTSU9OXG5cdH1cbn1cbiIsImltcG9ydCB7XG5cdFNFQVJDSF9URVJNX1VQREFURSwgQVJUSVNUX0RBVEFfQVZBSUxBQkxFLCBSRUxBVEVEX0NMSUNLLCBTSE9XX1JFTEFURUQsIEhJREVfUkVMQVRFRCxcblx0Q0xFQVJfU0VTU0lPTlxufSBmcm9tICcuLi9hY3Rpb25zJ1xubGV0IGluaXRpYWxTdGF0ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJyk7XG5jb25zdCBlbXB0eUFydGlzdCA9IHtcblx0aWQ6ICcnLFxuXHRuYW1lOiAnJyxcblx0aW1nVXJsOiAnJyxcblx0Z2VucmVzOiBbXSxcblx0cG9wdWxhcml0eTogMCxcblx0aW1hZ2VzOiBbXVxufTtcbmNvbnN0IGVtcHR5U3RhdGUgPSB7XG5cdGFydGlzdDogZW1wdHlBcnRpc3QsXG5cdHNlYXJjaFRlcm06ICcnLFxuXHR2aXNpdGVkQXJ0aXN0czogW10sXG5cdGhpZGVJbmZvOiB0cnVlLFxuXHRyZWxhdGVkQXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0c2hvd1JlbGF0ZWQ6IGZhbHNlXG59O1xuXG5pZiAoIWluaXRpYWxTdGF0ZSkge1xuXHRpbml0aWFsU3RhdGUgPSB7XG5cdFx0Li4uZW1wdHlTdGF0ZVxuXHR9O1xufSBlbHNlIHtcblx0aW5pdGlhbFN0YXRlID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdzdGF0ZScpKTtcbn1cblxuY29uc3QgYXJ0aXN0U2VhcmNoID0gKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pID0+IHtcblx0bGV0IG5ld1N0YXRlO1xuXHRzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBTRUFSQ0hfVEVSTV9VUERBVEU6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5zZWFyY2hUZXJtLFxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQVJUSVNUX0RBVEFfQVZBSUxBQkxFOlxuXHRcdFx0aWYgKGFjdGlvbi5kYXRhLmlkKSB7XG5cdFx0XHRcdGxldCBhbHJlYWR5VmlzaXRlZCA9ICEhc3RhdGUudmlzaXRlZEFydGlzdHMubGVuZ3RoICYmIHN0YXRlLnZpc2l0ZWRBcnRpc3RzLnNvbWUoKGFydGlzdCkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFydGlzdC5pZCA9PT0gYWN0aW9uLmRhdGEuaWQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdGxldCB2aXNpdGVkQXJ0aXN0cyA9IGFscmVhZHlWaXNpdGVkID8gc3RhdGUudmlzaXRlZEFydGlzdHMgOiBbLi4uc3RhdGUudmlzaXRlZEFydGlzdHMsIGFjdGlvbi5kYXRhXTtcblx0XHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0XHR2aXNpdGVkQXJ0aXN0czogW1xuXHRcdFx0XHRcdFx0Li4udmlzaXRlZEFydGlzdHMsXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uZGF0YS5uYW1lLFxuXHRcdFx0XHRcdGhpZGVJbmZvOiBmYWxzZSxcblx0XHRcdFx0XHRoaWRlUmVsYXRlZDogdHJ1ZSxcblx0XHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiB7XG5cdFx0XHRcdFx0XHQuLi5lbXB0eUFydGlzdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybignTm8gQVBJIGRhdGEgYXZhaWxhYmxlIGZvciBnaXZlbiBhcnRpc3QuIE5lZWQgdG8gcmVmcmVzaCBBUEkgc2Vzc2lvbj8nKTtcblx0XHRcdFx0bmV3U3RhdGUgPSBzdGF0ZTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgUkVMQVRFRF9DTElDSzpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0aGlkZUluZm86IHRydWVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFNIT1dfUkVMQVRFRDpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdGhpZGVSZWxhdGVkOiBmYWxzZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgSElERV9SRUxBVEVEOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiB7XG5cdFx0XHRcdFx0Li4uZW1wdHlBcnRpc3Rcblx0XHRcdFx0fSxcblx0XHRcdFx0aGlkZVJlbGF0ZWQ6IHRydWVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIENMRUFSX1NFU1NJT046XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uZW1wdHlTdGF0ZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRuZXdTdGF0ZSA9IHN0YXRlO1xuXHR9XG5cdHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzdGF0ZScsIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlKSk7XG5cdHJldHVybiBuZXdTdGF0ZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFydGlzdFNlYXJjaDsiLCJpbXBvcnQge2NyZWF0ZVN0b3JlfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgYXJ0aXN0U2VhcmNoIGZyb20gXCIuL3JlZHVjZXJzL2FydGlzdC1zZWFyY2hcIjtcblxuZXhwb3J0IGxldCBzdG9yZSA9IGNyZWF0ZVN0b3JlKFxuXHRhcnRpc3RTZWFyY2gsXG5cdHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fICYmIHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fKClcbik7XG5cblxuIl19
