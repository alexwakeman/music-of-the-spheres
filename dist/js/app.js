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
   * @param x
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
			textMesh.isText = true;
			sphere.add(textMesh);
			textMesh.position.set(-sphere.radius, -(sphere.radius + size * 2), -sphere.radius / 2);
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
		var artistId = decodeURIComponent(window.location.hash.replace('#', ''));
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
			intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(_props.Props.graphContainer, _props.Props.raycaster, _props.Props.camera);
			_props.Props.mouseIsOverRelated = false;
			_props.Props.graphContainer.traverse(function (obj) {
				if (obj.hasOwnProperty('isRelatedArtistSphere')) {
					// reset the related sphere to red
					obj.material.color.setHex(_colours.Colours.relatedArtist);
				}
			});

			if (intersects.length) {
				// mouse is over a Mesh
				_props.Props.mouseIsOverRelated = true;
				selected = intersects[0].object;
				if (selected.hasOwnProperty('isRelatedArtistSphere')) {
					_store.store.dispatch((0, _actions.showRelated)(selected.artistObj));
					isOverRelated = true;
					selected.material.color.setHex(_colours.Colours.relatedArtistHover);
				} else if (selected.hasOwnProperty('isText')) {
					var parent = selected.parent;
					if (parent.hasOwnProperty('isRelatedArtistSphere')) {
						_store.store.dispatch((0, _actions.showRelated)(parent.artistObj));
						isOverRelated = true;
						parent.material.color.setHex(_colours.Colours.relatedArtistHover);
					}
				} else {
					_store.store.dispatch((0, _actions.hideRelated)());
				}
			} else {
				_store.store.dispatch((0, _actions.hideRelated)());
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
			return isOverRelated;
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

var MIN_DISTANCE = 50;
var MAX_DISTANCE = 800;
var DISTANCE_SCALAR = 50;
var SIZE_SCALAR = 1.5;

var Statistics = exports.Statistics = function () {
				function Statistics() {
								_classCallCheck(this, Statistics);
				}

				_createClass(Statistics, null, [{
								key: "getArtistSphereSize",
								value: function getArtistSphereSize(artist) {
												return Math.max(40, artist.popularity * SIZE_SCALAR);
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
												var matches = artist.genres.map(function (mainArtistGenre) {
																return Statistics.matchArtistToRelatedGenres(mainArtistGenre, relatedArtist);
												}).reduce(function (accumulator, match) {
																if (match) {
																				accumulator.push(match);
																}
																return accumulator;
												}, []);
												var artistGenreCount = artist.genres.length ? artist.genres.length : 1;
												var unit = 1 / artistGenreCount;
												unit = unit === 1 ? 0 : unit;
												var genreSimilarity = matches.length * unit;
												var minDistance = artist.popularity * SIZE_SCALAR + relatedArtist.popularity * SIZE_SCALAR + MIN_DISTANCE;
												return {
																lineLength: Math.max(minDistance, MAX_DISTANCE - MAX_DISTANCE * genreSimilarity),
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
				{ className: classes },
				artists
			);
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
	var iFrameMarkup = '';
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
	}]);

	return MusicDataService;
}();

},{"../state/actions":22,"../state/store":24}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.artistDataAvailable = artistDataAvailable;
exports.updateSearchTerm = updateSearchTerm;
exports.relatedClick = relatedClick;
exports.showRelated = showRelated;
exports.hideRelated = hideRelated;
exports.clearSession = clearSession;
var ARTIST_DATA_AVAILABLE = exports.ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoLmpzIiwic3JjL2pzL3N0YXRlL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLE1BQVQsQ0FDQztBQUFBO0FBQUEsR0FBVSxtQkFBVjtBQUNDO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOzs7Ozs7Ozs7O3FqQkNOQTs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0lBQVksSzs7Ozs7O0FBRVosSUFBTSxtQkFBbUIsa0JBQXpCO0FBQ0EsSUFBTSxVQUFVLFNBQWhCO0FBQ0EsSUFBTSxhQUFhO0FBQ2xCLE9BQU07QUFEWSxDQUFuQjs7SUFJYSxTLFdBQUEsUztBQUNULHNCQUFjO0FBQUE7O0FBQ2hCLE9BQUssR0FBTCxHQUFXLFVBQVg7QUFDQSxPQUFLLE9BQUw7QUFDQTs7Ozs0QkFFUztBQUFBOztBQUNULGdCQUFNLEVBQU4sR0FBVyxLQUFLLEdBQUwsRUFBWDtBQUNBLFFBQUssWUFBTDtBQUNBLGdCQUFNLFFBQU4sQ0FBZSxNQUFmLENBQXNCLGFBQU0sS0FBNUIsRUFBbUMsYUFBTSxNQUF6QztBQUNBLFVBQU8scUJBQVAsQ0FBNkIsWUFBTTtBQUNsQyxpQkFBTSxFQUFOLEdBQVcsYUFBTSxFQUFqQjtBQUNBLFVBQUssT0FBTCxDQUFhLElBQWI7QUFDQSxJQUhEO0FBSUE7OztpQ0FFYztBQUNkLFdBQVEsS0FBSyxHQUFMLENBQVMsSUFBakI7QUFDQyxTQUFLLGdCQUFMO0FBQ0MsVUFBSyx5QkFBTDtBQUNBO0FBQ0QsU0FBSyxPQUFMO0FBQ0MsVUFBSyxjQUFMO0FBQ0E7QUFORjtBQVFBOzs7OENBRTJCO0FBQzNCLE9BQU0sWUFBWSxTQUFTLEtBQUssR0FBTCxDQUFTLFdBQWxCLE1BQW1DLENBQXJEO0FBQ0EsT0FBSSxDQUFDLFNBQUwsRUFBZ0I7QUFDZixTQUFLLFVBQUw7QUFDQSxJQUZELE1BR0s7QUFDSixTQUFLLFlBQUw7QUFDQTtBQUNEOzs7K0JBRVk7QUFDWixPQUFNLElBQUksS0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFFBQWQsQ0FBdUIsS0FBSyxHQUFMLENBQVMsV0FBaEMsQ0FBVjtBQUNBLFFBQUssR0FBTCxDQUFTLFFBQVQsQ0FBa0IsUUFBbEIsQ0FBMkIsSUFBM0IsQ0FBZ0MsQ0FBaEM7QUFDQSxRQUFLLEdBQUwsQ0FBUyxXQUFULElBQXdCLElBQXhCO0FBQ0E7OztpQ0FFYztBQUNkLFFBQUssR0FBTCxDQUFTLFFBQVQsSUFBcUIsS0FBSyxHQUFMLENBQVMsUUFBVCxFQUFyQjtBQUNBLFFBQUssR0FBTCxHQUFXLFVBQVg7QUFDQTs7O3NDQUVtQixRLEVBQVUsUSxFQUFVO0FBQ3BDLFFBQUssR0FBTCxHQUFXLEVBQVg7QUFDQSxRQUFLLEdBQUwsQ0FBUyxJQUFULEdBQWdCLGdCQUFoQjtBQUNILFFBQUssR0FBTCxDQUFTLENBQVQsR0FBYSxHQUFiO0FBQ0EsUUFBSyxHQUFMLENBQVMsV0FBVCxHQUF1QixHQUF2QjtBQUNBLFFBQUssR0FBTCxDQUFTLFFBQVQsR0FBb0IsUUFBcEI7QUFDQSxRQUFLLEdBQUwsQ0FBUyxRQUFULEdBQW9CLFFBQXBCO0FBQ0EsUUFBSyxHQUFMLENBQVMsS0FBVCxHQUFpQixLQUFqQjtBQUNBLFFBQUssR0FBTCxDQUFTLElBQVQsR0FBZ0IsSUFBSSxNQUFNLGdCQUFWLENBQTJCLENBQzFDLFNBQVMsUUFBVCxDQUFrQixLQUFsQixFQUQwQyxFQUUxQyxhQUFNLE1BQU4sQ0FBYSxRQUFiLENBQXNCLEtBQXRCLEVBRjBDLENBQTNCLENBQWhCO0FBSUE7O0FBRUQ7Ozs7Ozs7bUNBSWlCO0FBQ2hCLE9BQU0sc0JBQXNCLEtBQUsscUJBQUwsRUFBNUI7QUFDQSxnQkFBTSxNQUFOLENBQWEsUUFBYixDQUFzQixHQUF0QixDQUNDLG9CQUFvQixDQUFwQixHQUF3QixhQUFNLGNBRC9CLEVBRUMsb0JBQW9CLENBQXBCLEdBQXdCLGFBQU0sY0FGL0IsRUFHQyxvQkFBb0IsQ0FBcEIsR0FBd0IsYUFBTSxjQUgvQjtBQUtBLGdCQUFNLE1BQU4sQ0FBYSxNQUFiLENBQW9CLGFBQU0sWUFBMUI7QUFDQTtBQUNBO0FBQ0EsZ0JBQU0sY0FBTixDQUFxQixRQUFyQixDQUE4QixVQUFDLEdBQUQsRUFBUztBQUN0QyxRQUFJLElBQUksY0FBSixDQUFtQixRQUFuQixDQUFKLEVBQWtDO0FBQ2pDLFNBQUksTUFBSixDQUFXLGFBQU0sY0FBTixDQUFxQixZQUFyQixDQUFrQyxhQUFNLE1BQU4sQ0FBYSxRQUEvQyxDQUFYO0FBQ0E7QUFDRCxJQUpEO0FBS0EsUUFBSyxXQUFMLENBQWlCLE1BQWpCO0FBQ0E7OzswQ0FFdUI7QUFDdkIsT0FBSSw0QkFBSjtBQUNBLE9BQU0sa0JBQWtCLGFBQU0sYUFBTixJQUF1QixhQUFNLGFBQXJEO0FBQ0EsT0FBTSxrQkFBa0IsQ0FBQyxlQUF6QjtBQUNBLE9BQUksYUFBTSxrQkFBTixJQUE0QixlQUFoQyxFQUFpRDtBQUNoRCxpQkFBTSxjQUFOLENBQXFCLENBQXJCLElBQTBCLGFBQU0sTUFBaEM7QUFDQSxJQUZELE1BR0ssSUFBSSxDQUFDLGFBQU0sa0JBQVAsSUFBNkIsZUFBakMsRUFBa0Q7QUFDdEQsaUJBQU0sY0FBTixDQUFxQixDQUFyQixJQUEwQixhQUFNLE1BQWhDO0FBQ0E7O0FBRUQsT0FBSSxhQUFNLGtCQUFOLElBQTRCLGVBQWhDLEVBQWlEO0FBQ2hELGlCQUFNLGNBQU4sQ0FBcUIsQ0FBckIsSUFBMEIsYUFBTSxNQUFoQztBQUNBLElBRkQsTUFHSyxJQUFJLENBQUMsYUFBTSxrQkFBUCxJQUE2QixlQUFqQyxFQUFrRDtBQUN0RCxpQkFBTSxjQUFOLENBQXFCLENBQXJCLElBQTBCLGFBQU0sTUFBaEM7QUFDQTtBQUNELHlCQUFzQix1QkFBVyxxQkFBWCxDQUFpQyxhQUFNLE1BQXZDLENBQXRCO0FBQ0EsdUJBQW9CLFlBQXBCLENBQWlDLGFBQU0sY0FBdkM7QUFDQSxVQUFPLG1CQUFQO0FBQ0E7Ozs4QkFFVyxNLEVBQVE7QUFDbkIsT0FBSSxhQUFNLE1BQU4sR0FBZSxLQUFuQixFQUEwQjtBQUN6QixpQkFBTSxNQUFOLElBQWdCLE1BQWhCO0FBQ0E7O0FBRUQsT0FBSSxhQUFNLE1BQU4sR0FBZSxLQUFuQixFQUEwQjtBQUN6QixpQkFBTSxNQUFOLElBQWdCLE1BQWhCO0FBQ0E7QUFDRDs7Ozs7Ozs7Ozs7Ozs7QUNoSUY7O0lBQVksSzs7OztBQUNMLElBQU0sd0JBQVE7QUFDcEIsV0FBVSxJQUFJLE1BQU0sYUFBVixDQUF3QixFQUFDLFdBQVcsSUFBWixFQUFrQixPQUFPLElBQXpCLEVBQXhCLENBRFU7QUFFcEIsUUFBTyxJQUFJLE1BQU0sS0FBVixFQUZhO0FBR3BCLFNBQVEsSUFBSSxNQUFNLGlCQUFWLENBQTRCLEVBQTVCLEVBQWdDLE9BQU8sVUFBUCxHQUFvQixPQUFPLFdBQTNELEVBQXdFLEdBQXhFLEVBQTZFLE1BQTdFLENBSFk7QUFJcEIsaUJBQWdCLElBQUksTUFBTSxRQUFWLEVBSkk7QUFLcEIsaUJBQWdCLElBQUksTUFBTSxLQUFWLENBQWdCLENBQWhCLEVBQW1CLENBQUMsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FMSTtBQU1wQixlQUFjLElBQUksTUFBTSxPQUFWLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBTk07QUFPcEIsaUJBQWdCLElBUEk7O0FBU3BCLEtBQUksR0FUZ0IsRUFTWDtBQUNULEtBQUksR0FWZ0IsRUFVWDtBQUNULFNBQVEsS0FYWTtBQVlwQixTQUFRLEtBWlk7QUFhcEIsZ0JBQWUsR0FiSztBQWNwQixnQkFBZSxHQWRLO0FBZXBCLHFCQUFvQixLQWZBO0FBZ0JwQixxQkFBb0IsS0FoQkE7QUFpQnBCLFlBQVcsSUFBSSxNQUFNLFNBQVYsRUFqQlM7QUFrQnBCLGNBQWEsSUFBSSxNQUFNLE9BQVYsRUFsQk87O0FBb0JwQix1QkFBc0IsRUFwQkY7QUFxQnBCLG1CQUFrQjtBQXJCRSxDQUFkOzs7Ozs7Ozs7Ozs7QUNEUDs7SUFBWSxLOztBQUNaOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFJLG1CQUFKO0FBQ0EsSUFBTSx3QkFBd0IsRUFBOUI7QUFDQSxJQUFNLDJCQUEyQixFQUFqQztBQUNBLElBQU0sZ0JBQWdCLEVBQXRCOztJQUVNLFU7Ozs7Ozs7eUJBQ1M7QUFDYixVQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdkMsUUFBTSxTQUFTLElBQUksTUFBTSxVQUFWLEVBQWY7QUFDQSxXQUFPLElBQVAsQ0FBWSw2Q0FBWixFQUEyRCxVQUFDLElBQUQsRUFBVTtBQUNwRSxrQkFBYSxJQUFiO0FBQ0E7QUFDQSxLQUhELEVBR0csWUFBSSxDQUFFLENBSFQsRUFHVyxNQUhYO0FBSUEsSUFOTSxDQUFQO0FBT0E7QUFDRDs7Ozs7Ozs7Ozt3QkFPYSxDLEVBQUcsQyxFQUFHLEMsRUFBRztBQUNyQixVQUFPLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixDQUFaLENBQVA7QUFDQTs7QUFFRDs7Ozs7Ozs7dUJBS1ksQyxFQUFHO0FBQ2QsVUFBTyxJQUFJLENBQUosR0FBUSxDQUFSLEdBQVksSUFBSSxDQUFKLEdBQVEsQ0FBQyxDQUFULEdBQWEsQ0FBaEM7QUFDQTs7O3dDQUU0QixNLEVBQVE7QUFDcEMsT0FBSSxRQUFRLE9BQU8sS0FBUCxFQUFaO0FBQ0EsT0FBSSxJQUFJLE1BQU0sVUFBZDtBQUNBLE9BQUksWUFBWSxLQUFLLElBQUwsQ0FBVSxLQUFLLEdBQUwsQ0FBUyxFQUFFLENBQVgsRUFBYyxDQUFkLElBQW1CLEtBQUssR0FBTCxDQUFTLEVBQUUsQ0FBWCxFQUFjLENBQWQsQ0FBbkIsR0FBc0MsS0FBSyxHQUFMLENBQVMsRUFBRSxDQUFYLEVBQWMsQ0FBZCxDQUF0QyxHQUF5RCxLQUFLLEdBQUwsQ0FBUyxFQUFFLENBQVgsRUFBYyxDQUFkLENBQW5FLENBQWhCO0FBQ0EsS0FBRSxDQUFGLElBQU8sU0FBUDtBQUNBLEtBQUUsQ0FBRixJQUFPLFNBQVA7QUFDQSxLQUFFLENBQUYsSUFBTyxTQUFQO0FBQ0EsS0FBRSxDQUFGLElBQU8sU0FBUDtBQUNBLFVBQU8sQ0FBUDtBQUNBOzs7NENBRWdDLEssRUFBTyxTLEVBQVcsTSxFQUFRO0FBQzFELGFBQVUsYUFBVixDQUF3QixhQUFNLFdBQTlCLEVBQTJDLE1BQTNDO0FBQ0EsVUFBTyxVQUFVLGdCQUFWLENBQTJCLE1BQU0sUUFBakMsRUFBMkMsSUFBM0MsQ0FBUDtBQUNBOzs7aUNBRXFCLEssRUFBTztBQUM1QixVQUFPLElBQUksTUFBTSxPQUFWLENBQW1CLE1BQU0sT0FBTixHQUFnQixhQUFNLFFBQU4sQ0FBZSxVQUFmLENBQTBCLFdBQTNDLEdBQTBELENBQTFELEdBQThELENBQWhGLEVBQ04sRUFBRSxNQUFNLE9BQU4sR0FBZ0IsYUFBTSxRQUFOLENBQWUsVUFBZixDQUEwQixZQUE1QyxJQUE0RCxDQUE1RCxHQUFnRSxDQUQxRCxDQUFQO0FBRUE7Ozt5Q0FFNkIsTSxFQUFRO0FBQ3JDLE9BQUksU0FBUyx1QkFBVyxtQkFBWCxDQUErQixNQUEvQixDQUFiO0FBQ0EsT0FBSSxXQUFXLElBQUksTUFBTSxjQUFWLENBQXlCLE1BQXpCLEVBQWlDLEVBQWpDLEVBQXFDLEVBQXJDLENBQWY7QUFDQSxPQUFJLFNBQVMsSUFBSSxNQUFNLElBQVYsQ0FBZSxRQUFmLEVBQXlCLElBQUksTUFBTSxtQkFBVixDQUE4QixFQUFDLE9BQU8saUJBQVEsVUFBaEIsRUFBOUIsQ0FBekIsQ0FBYjtBQUNBLFVBQU8sU0FBUCxHQUFtQixNQUFuQjtBQUNBLFVBQU8sTUFBUCxHQUFnQixNQUFoQjtBQUNBLFVBQU8sa0JBQVAsR0FBNEIsSUFBNUI7QUFDQSxVQUFPLFFBQVAsR0FBa0IsSUFBbEI7QUFDQSxjQUFXLE9BQVgsQ0FBbUIsT0FBTyxJQUExQixFQUFnQyxxQkFBaEMsRUFBdUQsTUFBdkQ7QUFDQSxVQUFPLE1BQVA7QUFDQTs7O3VDQUUyQixNLEVBQVEsZ0IsRUFBa0I7QUFDckQsT0FBSSw0QkFBNEIsRUFBaEM7QUFDQSxPQUFJLHNCQUFKO0FBQ0EsT0FBSSxrQkFBa0IsQ0FBdEI7QUFDQSxPQUFJLGFBQWEsaUJBQWlCLFFBQWpCLENBQTBCLEtBQTFCLENBQWdDLE1BQWhDLEdBQXlDLENBQTFEO0FBQ0EsT0FBSSxPQUFPLEtBQUssS0FBTCxDQUFXLGFBQWEsYUFBYixHQUE2QixDQUF4QyxDQUFYOztBQUVBLFFBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxNQUFNLEtBQUssR0FBTCxDQUFTLGFBQVQsRUFBd0IsT0FBTyxPQUFQLENBQWUsTUFBdkMsQ0FBdEIsRUFBc0UsSUFBSSxHQUExRSxFQUErRSxHQUEvRSxFQUFvRjtBQUNuRixvQkFBZ0IsT0FBTyxPQUFQLENBQWUsQ0FBZixDQUFoQjtBQUNBLFFBQUksU0FBUyx1QkFBVyxtQkFBWCxDQUErQixhQUEvQixDQUFiO0FBQ0EsUUFBSSxXQUFXLElBQUksTUFBTSxjQUFWLENBQXlCLE1BQXpCLEVBQWlDLEVBQWpDLEVBQXFDLEVBQXJDLENBQWY7QUFDQSxRQUFJLHNCQUFzQixJQUFJLE1BQU0sSUFBVixDQUFlLFFBQWYsRUFBeUIsSUFBSSxNQUFNLG1CQUFWLENBQThCLEVBQUMsT0FBTyxpQkFBUSxhQUFoQixFQUE5QixDQUF6QixDQUExQjtBQUNBLFFBQUksZUFBZSx1QkFBVyxvQkFBWCxDQUFnQyxNQUFoQyxFQUF3QyxhQUF4QyxDQUFuQjtBQUNBLHdCQUFvQixTQUFwQixHQUFnQyxhQUFoQztBQUNBLHdCQUFvQixTQUFwQixDQUE4QixlQUE5QixHQUFnRCxhQUFhLGVBQTdEO0FBQ0Esd0JBQW9CLFFBQXBCLEdBQStCLGFBQWEsVUFBNUM7QUFDQSx3QkFBb0IsTUFBcEIsR0FBNkIsTUFBN0I7QUFDQSx3QkFBb0IsUUFBcEIsR0FBK0IsSUFBL0I7QUFDQSx3QkFBb0IscUJBQXBCLEdBQTRDLElBQTVDO0FBQ0EsdUJBQW1CLElBQW5CO0FBQ0EsZUFBVyxxQkFBWCxDQUFpQyxnQkFBakMsRUFBbUQsbUJBQW5ELEVBQXdFLGVBQXhFO0FBQ0EsZUFBVyw2QkFBWCxDQUF5QyxnQkFBekMsRUFBMkQsbUJBQTNEO0FBQ0EsZUFBVyxPQUFYLENBQW1CLGNBQWMsSUFBakMsRUFBdUMsd0JBQXZDLEVBQWlFLG1CQUFqRTtBQUNBLDhCQUEwQixJQUExQixDQUErQixtQkFBL0I7QUFDQTtBQUNELFVBQU8seUJBQVA7QUFDQTs7O3VDQUUyQixjLEVBQWdCLE0sRUFBUSxXLEVBQWE7QUFDaEUsT0FBTSxTQUFTLElBQUksTUFBTSxRQUFWLEVBQWY7QUFDQSxVQUFPLElBQVAsR0FBYyxRQUFkO0FBQ0EsVUFBTyxHQUFQLENBQVcsTUFBWDtBQUNBLE9BQUksV0FBSixFQUFpQjtBQUNoQixTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksWUFBWSxNQUFoQyxFQUF3QyxHQUF4QyxFQUE2QztBQUM1QyxZQUFPLEdBQVAsQ0FBVyxZQUFZLENBQVosQ0FBWDtBQUNBO0FBQ0Q7QUFDRCxrQkFBZSxHQUFmLENBQW1CLE1BQW5CO0FBQ0E7OztnREFFb0MsZ0IsRUFBa0IsYSxFQUFlO0FBQ3JFLE9BQUksV0FBVyxJQUFJLE1BQU0saUJBQVYsQ0FBNEIsRUFBQyxPQUFPLGlCQUFRLGVBQWhCLEVBQTVCLENBQWY7QUFDQSxPQUFJLFdBQVcsSUFBSSxNQUFNLFFBQVYsRUFBZjtBQUNBLE9BQUksYUFBSjtBQUNBLFlBQVMsUUFBVCxDQUFrQixJQUFsQixDQUF1QixJQUFJLE1BQU0sT0FBVixDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixDQUF4QixDQUF2QjtBQUNBLFlBQVMsUUFBVCxDQUFrQixJQUFsQixDQUF1QixjQUFjLFFBQWQsQ0FBdUIsS0FBdkIsRUFBdkI7QUFDQSxVQUFPLElBQUksTUFBTSxJQUFWLENBQWUsUUFBZixFQUF5QixRQUF6QixDQUFQO0FBQ0Esb0JBQWlCLEdBQWpCLENBQXFCLElBQXJCO0FBQ0E7Ozt3Q0FFNEIsZ0IsRUFBa0IsYSxFQUFlLGUsRUFBaUI7QUFDOUUsT0FBSSx1QkFBdUIsaUJBQWlCLFFBQWpCLENBQTBCLEtBQTFCLENBQWdDLEtBQUssS0FBTCxDQUFXLGVBQVgsQ0FBaEMsRUFBNkQsTUFBN0QsQ0FBb0UsS0FBcEUsRUFBM0I7QUFDQSxpQkFBYyxRQUFkLENBQ0UsSUFERixDQUNPLHFCQUFxQixRQUFyQixDQUE4QixJQUFJLE1BQU0sT0FBVixDQUNsQyxjQUFjLFFBRG9CLEVBRWxDLGNBQWMsUUFGb0IsRUFHbEMsY0FBYyxRQUhvQixDQUE5QixDQURQO0FBUUE7OzswQkFFYyxLLEVBQU8sSSxFQUFNLE0sRUFBUTtBQUNuQyxPQUFJLGdCQUFnQixJQUFJLE1BQU0saUJBQVYsQ0FBNEIsRUFBQyxPQUFPLGlCQUFRLFNBQWhCLEVBQTVCLENBQXBCO0FBQ0EsT0FBSSxlQUFlLElBQUksTUFBTSxpQkFBVixDQUE0QixFQUFDLE9BQU8saUJBQVEsU0FBaEIsRUFBNUIsQ0FBbkI7QUFDQSxPQUFJLGdCQUFnQixDQUFDLGFBQUQsRUFBZ0IsWUFBaEIsQ0FBcEI7QUFDQSxPQUFJLFdBQVcsSUFBSSxNQUFNLFlBQVYsQ0FBdUIsS0FBdkIsRUFBOEI7QUFDNUMsVUFBTSxVQURzQztBQUU1QyxVQUFNLElBRnNDO0FBRzVDLG1CQUFlLENBSDZCO0FBSTVDLGtCQUFjLElBSjhCO0FBSzVDLG9CQUFnQixDQUw0QjtBQU01QyxlQUFXLENBTmlDO0FBTzVDLG1CQUFlO0FBUDZCLElBQTlCLENBQWY7QUFTQSxPQUFJLFdBQVcsSUFBSSxNQUFNLElBQVYsQ0FBZSxRQUFmLEVBQXlCLGFBQXpCLENBQWY7QUFDQSxZQUFTLE1BQVQsR0FBa0IsSUFBbEI7QUFDQSxVQUFPLEdBQVAsQ0FBVyxRQUFYO0FBQ0EsWUFBUyxRQUFULENBQWtCLEdBQWxCLENBQXNCLENBQUMsT0FBTyxNQUE5QixFQUFzQyxFQUFFLE9BQU8sTUFBUCxHQUFnQixPQUFPLENBQXpCLENBQXRDLEVBQW1FLENBQUMsT0FBTyxNQUFSLEdBQWlCLENBQXBGO0FBQ0E7Ozs2QkFFaUI7QUFDakIsT0FBSSxTQUFTLElBQUksTUFBTSxnQkFBVixDQUEyQixRQUEzQixFQUFxQyxLQUFyQyxDQUFiO0FBQ0EsT0FBSSxTQUFTLElBQUksTUFBTSxnQkFBVixDQUEyQixRQUEzQixFQUFxQyxHQUFyQyxDQUFiO0FBQ0EsVUFBTyxRQUFQLENBQWdCLElBQWhCLENBQXFCLEdBQXJCO0FBQ0EsVUFBTyxRQUFQLENBQWdCLElBQWhCLENBQXFCLENBQUMsR0FBdEI7QUFDQSxVQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxHQUF0QjtBQUNBLGdCQUFNLEtBQU4sQ0FBWSxHQUFaLENBQWdCLE1BQWhCO0FBQ0EsZ0JBQU0sS0FBTixDQUFZLEdBQVosQ0FBZ0IsTUFBaEI7QUFDQTs7Ozs7O1FBR08sVSxHQUFBLFU7Ozs7Ozs7Ozs7cWpCQ3JLVDs7Ozs7Ozs7QUFNQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUVhLFksV0FBQSxZO0FBQ1osdUJBQVksU0FBWixFQUF1QjtBQUFBOztBQUN0QixPQUFLLFNBQUwsR0FBaUIsMEJBQWpCOztBQUVBO0FBQ0EsZUFBTSxRQUFOLENBQWUsT0FBZixDQUF1QixPQUFPLFVBQTlCLEVBQTBDLE9BQU8sV0FBakQ7QUFDQSxlQUFNLFFBQU4sQ0FBZSxVQUFmLENBQTBCLEVBQTFCLEdBQStCLFVBQS9CO0FBQ0EsZUFBTSxTQUFOLEdBQWtCLFNBQWxCO0FBQ0EsZUFBTSxTQUFOLENBQWdCLFdBQWhCLENBQTRCLGFBQU0sUUFBTixDQUFlLFVBQTNDOztBQUVBO0FBQ0EsZUFBTSxjQUFOLENBQXFCLFFBQXJCLENBQThCLEdBQTlCLENBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDO0FBQ0EsZUFBTSxLQUFOLENBQVksR0FBWixDQUFnQixhQUFNLGNBQXRCO0FBQ0EsZUFBTSxLQUFOLENBQVksR0FBWixDQUFnQixhQUFNLE1BQXRCO0FBQ0EsZUFBTSxNQUFOLENBQWEsUUFBYixDQUFzQixHQUF0QixDQUEwQixDQUExQixFQUE2QixHQUE3QixFQUFrQyxhQUFNLGNBQXhDO0FBQ0EsZUFBTSxNQUFOLENBQWEsTUFBYixDQUFvQixhQUFNLEtBQU4sQ0FBWSxRQUFoQztBQUNBLHlCQUFXLFFBQVgsQ0FBb0IsYUFBTSxLQUExQjs7QUFFQTtBQUNBLE1BQU0sV0FBVyxtQkFBbUIsT0FBTyxRQUFQLENBQWdCLElBQWhCLENBQXFCLE9BQXJCLENBQTZCLEdBQTdCLEVBQWtDLEVBQWxDLENBQW5CLENBQWpCO0FBQ0EsTUFBSSxRQUFKLEVBQWM7QUFDYiwrQkFBaUIsU0FBakIsQ0FBMkIsUUFBM0I7QUFDQTtBQUNEOzs7OytCQUVZLE0sRUFBUTtBQUNwQixRQUFLLFVBQUw7QUFDQSxVQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsR0FBdUIsbUJBQW1CLE9BQU8sRUFBMUIsQ0FBdkI7QUFDQSxnQkFBTSxnQkFBTixHQUF5Qix1QkFBVyxzQkFBWCxDQUFrQyxNQUFsQyxDQUF6QjtBQUNBLGdCQUFNLG9CQUFOLEdBQTZCLHVCQUFXLG9CQUFYLENBQWdDLE1BQWhDLEVBQXdDLGFBQU0sZ0JBQTlDLENBQTdCO0FBQ0EsMEJBQVcsb0JBQVgsQ0FBZ0MsYUFBTSxjQUF0QyxFQUFzRCxhQUFNLGdCQUE1RCxFQUE4RSxhQUFNLG9CQUFwRjtBQUNBOzs7b0NBRWlCLEssRUFBTztBQUN4QixPQUFJLGlCQUFKO0FBQ0EsT0FBSSxtQkFBSjtBQUNBLE9BQUksZ0JBQWdCLEtBQXBCO0FBQ0EsZ0JBQU0sV0FBTixHQUFvQix1QkFBVyxjQUFYLENBQTBCLEtBQTFCLENBQXBCO0FBQ0EsZ0JBQWEsdUJBQVcseUJBQVgsQ0FBcUMsYUFBTSxjQUEzQyxFQUEyRCxhQUFNLFNBQWpFLEVBQTRFLGFBQU0sTUFBbEYsQ0FBYjtBQUNBLGdCQUFNLGtCQUFOLEdBQTJCLEtBQTNCO0FBQ0EsZ0JBQU0sY0FBTixDQUFxQixRQUFyQixDQUE4QixVQUFDLEdBQUQsRUFBUztBQUN0QyxRQUFJLElBQUksY0FBSixDQUFtQix1QkFBbkIsQ0FBSixFQUFpRDtBQUFFO0FBQ2xELFNBQUksUUFBSixDQUFhLEtBQWIsQ0FBbUIsTUFBbkIsQ0FBMEIsaUJBQVEsYUFBbEM7QUFDQTtBQUNELElBSkQ7O0FBTUEsT0FBSSxXQUFXLE1BQWYsRUFBdUI7QUFBRTtBQUN4QixpQkFBTSxrQkFBTixHQUEyQixJQUEzQjtBQUNBLGVBQVcsV0FBVyxDQUFYLEVBQWMsTUFBekI7QUFDQSxRQUFJLFNBQVMsY0FBVCxDQUF3Qix1QkFBeEIsQ0FBSixFQUFzRDtBQUNyRCxrQkFBTSxRQUFOLENBQWUsMEJBQVksU0FBUyxTQUFyQixDQUFmO0FBQ0EscUJBQWdCLElBQWhCO0FBQ0EsY0FBUyxRQUFULENBQWtCLEtBQWxCLENBQXdCLE1BQXhCLENBQStCLGlCQUFRLGtCQUF2QztBQUNBLEtBSkQsTUFJTyxJQUFJLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFKLEVBQXVDO0FBQzdDLFNBQUksU0FBUyxTQUFTLE1BQXRCO0FBQ0EsU0FBSSxPQUFPLGNBQVAsQ0FBc0IsdUJBQXRCLENBQUosRUFBb0Q7QUFDbkQsbUJBQU0sUUFBTixDQUFlLDBCQUFZLE9BQU8sU0FBbkIsQ0FBZjtBQUNBLHNCQUFnQixJQUFoQjtBQUNBLGFBQU8sUUFBUCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixDQUE2QixpQkFBUSxrQkFBckM7QUFDQTtBQUNELEtBUE0sTUFPQTtBQUNOLGtCQUFNLFFBQU4sQ0FBZSwyQkFBZjtBQUNBO0FBQ0QsSUFqQkQsTUFpQk87QUFDTixpQkFBTSxRQUFOLENBQWUsMkJBQWY7QUFDQTtBQUNELGdCQUFNLGNBQU4sR0FBdUIsYUFBTSxXQUE3QjtBQUNBLFVBQU8sYUFBUDtBQUNBOzs7bUNBRWdCLEssRUFBTztBQUN2QixPQUFNLEtBQUssYUFBTSxFQUFOLEdBQVcsYUFBTSxFQUE1QjtBQUNBLGdCQUFNLFdBQU4sR0FBb0IsdUJBQVcsY0FBWCxDQUEwQixLQUExQixDQUFwQjtBQUNBLGdCQUFNLGtCQUFOLEdBQTRCLGFBQU0sV0FBTixDQUFrQixDQUFsQixHQUFzQixhQUFNLGNBQU4sQ0FBcUIsQ0FBdkU7QUFDQSxnQkFBTSxrQkFBTixHQUE0QixhQUFNLFdBQU4sQ0FBa0IsQ0FBbEIsR0FBc0IsYUFBTSxjQUFOLENBQXFCLENBQXZFO0FBQ0EsZ0JBQU0sYUFBTixHQUFzQixLQUFLLEdBQUwsQ0FBUyxLQUFLLEdBQUwsQ0FBUyxhQUFNLFdBQU4sQ0FBa0IsQ0FBM0IsSUFBZ0MsS0FBSyxHQUFMLENBQVMsYUFBTSxjQUFOLENBQXFCLENBQTlCLENBQXpDLENBQXRCO0FBQ0EsZ0JBQU0sYUFBTixHQUFzQixLQUFLLEdBQUwsQ0FBUyxLQUFLLEdBQUwsQ0FBUyxhQUFNLFdBQU4sQ0FBa0IsQ0FBM0IsSUFBZ0MsS0FBSyxHQUFMLENBQVMsYUFBTSxjQUFOLENBQXFCLENBQTlCLENBQXpDLENBQXRCO0FBQ0EsZ0JBQU0sTUFBTixHQUFnQixDQUFDLElBQUksYUFBTSxhQUFYLElBQTRCLEVBQTVDO0FBQ0EsZ0JBQU0sTUFBTixHQUFnQixDQUFDLElBQUksYUFBTSxhQUFYLElBQTRCLEVBQTVDO0FBQ0EsZ0JBQU0sY0FBTixHQUF1QixhQUFNLFdBQTdCO0FBQ0E7OztvQ0FFaUIsSyxFQUFPO0FBQ3hCLGdCQUFNLFdBQU4sR0FBb0IsdUJBQVcsY0FBWCxDQUEwQixLQUExQixDQUFwQjtBQUNBLE9BQUksYUFBYSx1QkFBVyx5QkFBWCxDQUFxQyxhQUFNLGNBQTNDLEVBQTJELGFBQU0sU0FBakUsRUFBNEUsYUFBTSxNQUFsRixDQUFqQjtBQUNBLE9BQUksV0FBVyxNQUFmLEVBQXVCO0FBQ3RCLFFBQU0sV0FBVyxXQUFXLENBQVgsRUFBYyxNQUEvQjtBQUNBLFFBQUksU0FBUyxjQUFULENBQXdCLHVCQUF4QixDQUFKLEVBQXNEO0FBQ3JELGtCQUFNLFFBQU4sQ0FBZSw0QkFBZjtBQUNBLFVBQUssZ0JBQUwsQ0FBc0IsUUFBdEI7QUFDQSxLQUhELE1BR08sSUFBSSxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBSixFQUF1QztBQUM3QyxTQUFJLFNBQVMsU0FBUyxNQUF0QjtBQUNBLFNBQUksT0FBTyxjQUFQLENBQXNCLHVCQUF0QixDQUFKLEVBQW9EO0FBQ25ELG1CQUFNLFFBQU4sQ0FBZSw0QkFBZjtBQUNBLFdBQUssZ0JBQUwsQ0FBc0IsTUFBdEI7QUFDQTtBQUNEO0FBQ0Q7QUFDRDs7O21DQUVnQixjLEVBQWdCO0FBQUE7O0FBQ2hDLFFBQUssVUFBTDtBQUNBLDBCQUFXLG9CQUFYLENBQWdDLGFBQU0sY0FBdEMsRUFBc0QsY0FBdEQ7QUFDQSxRQUFLLFNBQUwsQ0FBZSxtQkFBZixDQUFtQyxjQUFuQyxFQUFtRCxZQUFNO0FBQ3hELFVBQUssVUFBTDtBQUNBLGdDQUFpQixTQUFqQixDQUEyQixlQUFlLFNBQWYsQ0FBeUIsRUFBcEQ7QUFDQSxJQUhEO0FBSUE7OzsrQkFFWTtBQUNaLE9BQU0sU0FBUyxhQUFNLGNBQU4sQ0FBcUIsZUFBckIsQ0FBcUMsUUFBckMsQ0FBZjtBQUNBLE9BQUksTUFBSixFQUFZO0FBQ1gsaUJBQU0sY0FBTixDQUFxQixNQUFyQixDQUE0QixNQUE1QjtBQUNBO0FBQ0Q7OztpQ0FFYztBQUNkLFVBQU8sUUFBUCxDQUFnQixJQUFoQixHQUF1QixFQUF2QjtBQUNBOzs7dUJBRUksUyxFQUFXO0FBQ2YsV0FBUSxTQUFSO0FBQ0MsU0FBSyxJQUFMO0FBQ0Msa0JBQU0sY0FBTixJQUF3QixFQUF4QjtBQUNBO0FBQ0QsU0FBSyxLQUFMO0FBQ0Msa0JBQU0sY0FBTixJQUF3QixFQUF4QjtBQUNBO0FBTkY7QUFRQTs7O3VDQUVvQjtBQUNwQixnQkFBTSxNQUFOLENBQWEsTUFBYixHQUFzQixPQUFPLFVBQVAsR0FBb0IsT0FBTyxXQUFqRDtBQUNBLGdCQUFNLE1BQU4sQ0FBYSxzQkFBYjtBQUNBLGdCQUFNLFFBQU4sQ0FBZSxPQUFmLENBQXVCLE9BQU8sVUFBOUIsRUFBMEMsT0FBTyxXQUFqRDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3JKRixJQUFNLGVBQWUsRUFBckI7QUFDQSxJQUFNLGVBQWUsR0FBckI7QUFDQSxJQUFNLGtCQUFrQixFQUF4QjtBQUNBLElBQU0sY0FBYyxHQUFwQjs7SUFFYSxVLFdBQUEsVTs7Ozs7Ozs0Q0FDa0IsTSxFQUFRO0FBQy9CLG1CQUFPLEtBQUssR0FBTCxDQUFTLEVBQVQsRUFBYSxPQUFPLFVBQVAsR0FBb0IsV0FBakMsQ0FBUDtBQUNIOztBQUVKOzs7Ozs7Ozs7NkNBTTRCLE0sRUFBUSxhLEVBQWU7QUFDbEQsZ0JBQUksVUFBVSxPQUFPLE1BQVAsQ0FDSCxHQURHLENBQ0MsVUFBQyxlQUFEO0FBQUEsdUJBQXFCLFdBQVcsMEJBQVgsQ0FBc0MsZUFBdEMsRUFBdUQsYUFBdkQsQ0FBckI7QUFBQSxhQURELEVBRUgsTUFGRyxDQUVJLFVBQUMsV0FBRCxFQUFjLEtBQWQsRUFBd0I7QUFDbEMsb0JBQUksS0FBSixFQUFXO0FBQ1AsZ0NBQVksSUFBWixDQUFpQixLQUFqQjtBQUNUO0FBQ0ssdUJBQU8sV0FBUDtBQUNHLGFBUEcsRUFPRCxFQVBDLENBQWQ7QUFRQSxnQkFBSSxtQkFBbUIsT0FBTyxNQUFQLENBQWMsTUFBZCxHQUF1QixPQUFPLE1BQVAsQ0FBYyxNQUFyQyxHQUE4QyxDQUFyRTtBQUNBLGdCQUFJLE9BQU8sSUFBSSxnQkFBZjtBQUNBLG1CQUFPLFNBQVMsQ0FBVCxHQUFhLENBQWIsR0FBaUIsSUFBeEI7QUFDQSxnQkFBSSxrQkFBa0IsUUFBUSxNQUFSLEdBQWlCLElBQXZDO0FBQ0EsZ0JBQUksY0FBZ0IsT0FBTyxVQUFQLEdBQW9CLFdBQXJCLEdBQXFDLGNBQWMsVUFBZCxHQUEyQixXQUFqRSxHQUFpRixZQUFuRztBQUNBLG1CQUFPO0FBQ04sNEJBQVksS0FBSyxHQUFMLENBQVMsV0FBVCxFQUFzQixlQUFnQixlQUFlLGVBQXJELENBRE47QUFFTixpQ0FBaUIsS0FBSyxLQUFMLENBQVcsa0JBQWtCLEdBQTdCO0FBRlgsYUFBUDtBQUlBOzs7bURBRWlDLGUsRUFBaUIsYSxFQUFlO0FBQzNELG1CQUFPLGNBQWMsTUFBZCxDQUNGLElBREUsQ0FDRyxVQUFDLEtBQUQ7QUFBQSx1QkFBVyxVQUFVLGVBQXJCO0FBQUEsYUFESCxDQUFQO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2Q0w7O0lBQVksSzs7QUFFWjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0lBRWEsWSxXQUFBLFk7OztBQUVULDRCQUFjO0FBQUE7O0FBQUE7QUFFYjs7OztpQ0FFUTtBQUNMLG1CQUNJO0FBQUE7QUFBQSxrQkFBSyxXQUFVLGVBQWY7QUFDUixnRUFEUTtBQUVJLDBEQUZKO0FBR0ksa0VBSEo7QUFJSSxzRUFKSjtBQUtJLCtEQUxKO0FBTUk7QUFOSixhQURKO0FBVUg7Ozs7RUFqQjZCLE1BQU0sUzs7Ozs7Ozs7UUNQeEIsbUIsR0FBQSxtQjs7QUFGaEI7O0lBQVksSzs7OztBQUVMLFNBQVMsbUJBQVQsT0FBaUQ7QUFBQSxLQUFuQixNQUFtQixRQUFuQixNQUFtQjtBQUFBLEtBQVgsUUFBVyxRQUFYLFFBQVc7O0FBQ3ZELEtBQU0sU0FBUyxPQUFPLE1BQVAsQ0FBYyxHQUFkLENBQWtCLFVBQUMsS0FBRCxFQUFXO0FBQzNDLFNBQU87QUFBQTtBQUFBLEtBQU0sV0FBVSxNQUFoQixFQUF1QixLQUFLLEtBQTVCO0FBQW9DO0FBQXBDLEdBQVA7QUFDQSxFQUZjLENBQWY7QUFHQSxLQUFNLFVBQVUsV0FBVyw0QkFBWCxHQUEwQyxxQkFBMUQ7QUFDQSxRQUNDO0FBQUE7QUFBQSxJQUFLLFdBQVcsT0FBaEI7QUFDQztBQUFBO0FBQUEsS0FBSyxXQUFVLHNCQUFmO0FBQXVDLFVBQU87QUFBOUMsR0FERDtBQUVDO0FBQUE7QUFBQSxLQUFLLFdBQVUsWUFBZjtBQUE0QjtBQUFBO0FBQUEsTUFBTSxXQUFVLE9BQWhCO0FBQUE7QUFBQSxJQUE1QjtBQUFBO0FBQXVFO0FBQUE7QUFBQSxNQUFNLFdBQVUsTUFBaEI7QUFBd0IsV0FBTztBQUEvQjtBQUF2RSxHQUZEO0FBR0M7QUFBQTtBQUFBLEtBQUssV0FBVSxRQUFmO0FBQXlCO0FBQXpCO0FBSEQsRUFERDtBQU9BOzs7Ozs7Ozs7Ozs7QUNkRDs7SUFBWSxLOztBQUNaOztBQUNBOzs7Ozs7Ozs7O0lBRWEsbUIsV0FBQSxtQjs7O0FBQ1osZ0NBQWM7QUFBQTs7QUFBQTtBQUViOzs7O2tDQUVlLEcsRUFBSyxRLEVBQVU7QUFDOUIsT0FBSSxjQUFKO0FBQ0EsK0JBQWlCLFNBQWpCLENBQTJCLFFBQTNCO0FBQ0E7OzsyQkFFUTtBQUFBOztBQUNSLE9BQUksVUFBVSxLQUFLLEtBQUwsQ0FBVyxjQUFYLENBQTBCLEdBQTFCLENBQThCLFVBQUMsTUFBRCxFQUFZO0FBQ3ZELFFBQUksT0FBTyxXQUFXLG1CQUFtQixPQUFPLEVBQTFCLENBQXRCO0FBQ0EsUUFBSSxTQUFTLE9BQU8sTUFBUCxJQUFpQixPQUFPLE1BQVAsQ0FBYyxNQUEvQixHQUF3QyxPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxNQUFkLEdBQXVCLENBQXJDLEVBQXdDLEdBQWhGLEdBQXNGLEVBQW5HO0FBQ0EsUUFBSSxXQUFXLEVBQUUsMEJBQXdCLE1BQXhCLE1BQUYsRUFBZjtBQUNBLFdBQ0M7QUFBQTtBQUFBLE9BQUssV0FBVSxRQUFmLEVBQXdCLEtBQUssT0FBTyxFQUFwQztBQUNDO0FBQUE7QUFBQSxRQUFHLE1BQU0sSUFBVCxFQUFlLElBQUksT0FBTyxFQUExQixFQUE4QixXQUFVLGlCQUF4QztBQUNHLGdCQUFTLGlCQUFDLEtBQUQsRUFBVztBQUFFLGVBQUssZUFBTCxDQUFxQixLQUFyQixFQUE0QixPQUFPLEVBQW5DO0FBQXdDLFFBRGpFO0FBRUM7QUFBQTtBQUFBLFNBQUssV0FBVSxnQkFBZjtBQUNDLG9DQUFLLFdBQVUsU0FBZixFQUF5QixPQUFPLFFBQWhDO0FBREQsT0FGRDtBQUtDO0FBQUE7QUFBQSxTQUFNLFdBQVUsTUFBaEI7QUFBd0IsY0FBTztBQUEvQjtBQUxEO0FBREQsS0FERDtBQVdBLElBZmEsQ0FBZDtBQWdCQSxPQUFNLFVBQVUsS0FBSyxLQUFMLENBQVcsUUFBWCxHQUFzQiwwQkFBdEIsR0FBbUQsbUJBQW5FO0FBQ0EsVUFDQztBQUFBO0FBQUEsTUFBSyxXQUFXLE9BQWhCO0FBQ0U7QUFERixJQUREO0FBS0E7Ozs7RUFqQ3VDLE1BQU0sUzs7Ozs7Ozs7UUNGL0IsMEIsR0FBQSwwQjs7QUFGaEI7O0lBQVksSzs7OztBQUVMLFNBQVMsMEJBQVQsT0FBNEU7QUFBQSxLQUF2QyxhQUF1QyxRQUF2QyxhQUF1QztBQUFBLEtBQXhCLFdBQXdCLFFBQXhCLFdBQXdCO0FBQUEsS0FBWCxRQUFXLFFBQVgsUUFBVzs7QUFDbEYsS0FBTSxjQUFjLGVBQWUsUUFBZixHQUEwQiwrQkFBMUIsR0FBNEQsd0JBQWhGO0FBQ0EsUUFDQztBQUFBO0FBQUEsSUFBSyxXQUFXLFdBQWhCO0FBQ0M7QUFBQTtBQUFBLEtBQUssV0FBVSx5QkFBZjtBQUEwQyxpQkFBYztBQUF4RCxHQUREO0FBRUM7QUFBQTtBQUFBLEtBQUssV0FBVSxZQUFmO0FBQTRCO0FBQUE7QUFBQSxNQUFNLFdBQVUsT0FBaEI7QUFBQTtBQUFBLElBQTVCO0FBQUE7QUFBdUU7QUFBQTtBQUFBLE1BQU0sV0FBVSxNQUFoQjtBQUF3QixrQkFBYztBQUF0QztBQUF2RSxHQUZEO0FBR0M7QUFBQTtBQUFBLEtBQUssV0FBVSxRQUFmO0FBQXdCO0FBQUE7QUFBQSxNQUFNLFdBQVUsT0FBaEI7QUFBQTtBQUFBLElBQXhCO0FBQUE7QUFBeUU7QUFBQTtBQUFBLE1BQU0sV0FBVSxNQUFoQjtBQUF3QixrQkFBYyxlQUF0QztBQUFBO0FBQUE7QUFBekU7QUFIRCxFQUREO0FBT0E7Ozs7Ozs7Ozs7OztBQ1hEOztJQUFZLEs7O0FBQ1o7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7SUFFYSxjLFdBQUEsYzs7O0FBQ1osMkJBQWM7QUFBQTs7QUFBQTs7QUFFYixRQUFLLE1BQUwsR0FBYyxhQUFNLFFBQU4sR0FBaUIsTUFBL0I7QUFDQSxRQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFIYTtBQUliOzs7OzJCQUVRO0FBQUE7O0FBQ1IsVUFDQyw2QkFBSyxXQUFVLGVBQWYsRUFBK0IsS0FBSztBQUFBLFlBQVEsT0FBSyxRQUFMLEdBQWdCLElBQXhCO0FBQUEsS0FBcEMsR0FERDtBQUdBOzs7c0NBRW1CO0FBQUE7O0FBQ25CLDBCQUFXLElBQVgsR0FBa0IsSUFBbEIsQ0FBdUIsWUFBTTtBQUFFO0FBQzlCLFdBQUssS0FBTCxHQUFhLCtCQUFpQixPQUFLLFFBQXRCLENBQWI7QUFDQSxXQUFLLFNBQUw7QUFDQSxJQUhEO0FBSUE7Ozt1Q0FFb0I7QUFDcEIsUUFBSyxTQUFMO0FBQ0E7Ozs4QkFFVztBQUFBLE9BQ0gsTUFERyxHQUNRLEtBQUssS0FEYixDQUNILE1BREc7O0FBRVgsUUFBSyxRQUFMLENBQWMsZ0JBQWQsQ0FBK0IsYUFBL0IsRUFBOEM7QUFBQSxXQUFTLE1BQU0sY0FBTixFQUFUO0FBQUEsSUFBOUMsRUFGVyxDQUVxRTtBQUNoRixRQUFLLFFBQUwsQ0FBYyxnQkFBZCxDQUErQixPQUEvQixFQUF3QyxJQUF4QyxFQUE4QyxJQUE5QztBQUNBLFFBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLFlBQS9CLEVBQTZDLElBQTdDLEVBQW1ELElBQW5EO0FBQ0EsUUFBSyxRQUFMLENBQWMsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNEMsSUFBNUMsRUFBa0QsSUFBbEQ7QUFDQSxRQUFLLFFBQUwsQ0FBYyxnQkFBZCxDQUErQixXQUEvQixFQUE0QyxJQUE1QyxFQUFrRCxJQUFsRDtBQUNBLFFBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLFNBQS9CLEVBQTBDLElBQTFDLEVBQWdELElBQWhEO0FBQ0EsVUFBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxJQUFsQyxFQUF3QyxLQUF4QztBQUNBLE9BQUksT0FBTyxFQUFYLEVBQWU7QUFDZCxTQUFLLEtBQUwsQ0FBVyxZQUFYLENBQXdCLE1BQXhCO0FBQ0EsSUFGRCxNQUVPO0FBQ04sU0FBSyxLQUFMLENBQVcsVUFBWDtBQUNBLFNBQUssS0FBTCxDQUFXLFlBQVg7QUFDQTtBQUNEOzs7OEJBRVcsSyxFQUFPO0FBQ2xCLFFBQUssTUFBTSxJQUFYLEVBQWlCLEtBQWpCO0FBQ0E7Ozt3QkFFSyxLLEVBQU87QUFDWixRQUFLLFFBQUwsQ0FBYyxTQUFkLEdBQTBCLG9CQUExQjtBQUNBLE9BQUksQ0FBQyxLQUFLLFVBQVYsRUFBc0I7QUFDckIsU0FBSyxLQUFMLENBQVcsaUJBQVgsQ0FBNkIsS0FBN0I7QUFDQSxJQUZELE1BRU87QUFDTixTQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQTtBQUNEOzs7NEJBRVMsSyxFQUFPO0FBQ2hCLE9BQUksZ0JBQWdCLEtBQXBCO0FBQ0EsUUFBSyxRQUFMLENBQWMsU0FBZCxHQUEwQixvQkFBMUI7QUFDQSxPQUFJLEtBQUssV0FBVCxFQUFzQjtBQUNyQixTQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxTQUFLLEtBQUwsQ0FBVyxnQkFBWCxDQUE0QixLQUE1QjtBQUNBLElBSEQsTUFHTztBQUNOLG9CQUFnQixLQUFLLEtBQUwsQ0FBVyxpQkFBWCxDQUE2QixLQUE3QixDQUFoQjtBQUNBO0FBQ0QsT0FBSSxpQkFBaUIsQ0FBQyxLQUFLLFVBQTNCLEVBQXVDO0FBQ3RDLFNBQUssUUFBTCxDQUFjLFNBQWQsR0FBMEIsdUJBQTFCO0FBQ0E7QUFDRCxPQUFJLEtBQUssVUFBVCxFQUFxQjtBQUNwQixTQUFLLFFBQUwsQ0FBYyxTQUFkLEdBQTBCLHVCQUExQjtBQUNBO0FBQ0Q7Ozs4QkFFVztBQUNYLFFBQUssV0FBTCxHQUFtQixJQUFuQjtBQUNBOzs7NEJBRVM7QUFDVCxRQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDQTs7OzZCQUVVLEssRUFBTztBQUNqQixXQUFRLHVCQUFXLElBQVgsQ0FBZ0IsTUFBTSxXQUF0QixDQUFSO0FBQ0MsU0FBSyxDQUFDLENBQU47QUFDQyxVQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCO0FBQ0E7QUFDRCxTQUFLLENBQUw7QUFDQyxVQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLElBQWhCO0FBQ0E7QUFORjtBQVFBOzs7MkJBRVE7QUFDUixRQUFLLEtBQUwsQ0FBVyxrQkFBWDtBQUNBOzs7O0VBNUZrQyxNQUFNLFM7Ozs7Ozs7O1FDSjFCLG9CLEdBQUEsb0I7O0FBRmhCOztJQUFZLEs7Ozs7QUFFTCxTQUFTLG9CQUFULE9BQXdHO0FBQUEsUUFBekUsVUFBeUUsUUFBekUsVUFBeUU7QUFBQSxRQUE3RCxNQUE2RCxRQUE3RCxNQUE2RDtBQUFBLFFBQXJELFlBQXFELFFBQXJELFlBQXFEO0FBQUEsUUFBdkMsc0JBQXVDLFFBQXZDLHNCQUF1QztBQUFBLFFBQWYsWUFBZSxRQUFmLFlBQWU7O0FBQzNHLFFBQU0sZ0JBQWdCLE9BQU8sRUFBUCxHQUFZLGVBQVosR0FBOEIsc0JBQXBEO0FBQ0EsV0FDSTtBQUFBO0FBQUEsVUFBSyxXQUFVLHVCQUFmO0FBQ0k7QUFBQTtBQUFBLGNBQU0sV0FBVSxlQUFoQixFQUFnQyxVQUFVLGtCQUFDLEdBQUQ7QUFBQSwyQkFBUyxhQUFhLEdBQWIsRUFBa0IsVUFBbEIsQ0FBVDtBQUFBLGlCQUExQztBQUNJLDJDQUFPLE1BQUssTUFBWixFQUFtQixJQUFHLGNBQXRCLEVBQXFDLGFBQVksbUJBQWpELEVBQXFFLE9BQU8sVUFBNUUsRUFBd0YsVUFBVSxzQkFBbEcsR0FESjtBQUVJO0FBQUE7QUFBQSxrQkFBUSxNQUFLLFFBQWIsRUFBc0IsU0FBUyxpQkFBQyxHQUFEO0FBQUEsK0JBQVMsYUFBYSxHQUFiLEVBQWtCLFVBQWxCLENBQVQ7QUFBQSxxQkFBL0I7QUFBQTtBQUFBLGFBRko7QUFHSTtBQUFBO0FBQUEsa0JBQVEsV0FBVyxhQUFuQixFQUFrQyxNQUFLLFFBQXZDLEVBQWdELFNBQVMsaUJBQUMsR0FBRDtBQUFBLCtCQUFTLGFBQWEsR0FBYixDQUFUO0FBQUEscUJBQXpEO0FBQUE7QUFBQTtBQUhKO0FBREosS0FESjtBQVNIOzs7Ozs7OztRQ1hlLHNCLEdBQUEsc0I7O0FBRmhCOztJQUFZLEs7Ozs7QUFFTCxTQUFTLHNCQUFULE9BQW9EO0FBQUEsS0FBbkIsTUFBbUIsUUFBbkIsTUFBbUI7QUFBQSxLQUFYLFFBQVcsUUFBWCxRQUFXOztBQUMxRCxLQUFNLFdBQVcsd0NBQWpCO0FBQ0EsS0FBTSxzQkFBb0IsUUFBcEIsR0FBK0IsT0FBTyxFQUE1QztBQUNBLEtBQUksZUFBZSxFQUFuQjtBQUNBLEtBQUksT0FBTyxFQUFYLEVBQWU7QUFDZCxpQkFDQztBQUFBO0FBQUEsS0FBSyxXQUFVLGdCQUFmO0FBQ0MsbUNBQVEsS0FBSyxjQUFiLEVBQTZCLE9BQU0sS0FBbkMsRUFBeUMsUUFBTyxJQUFoRDtBQURELEdBREQ7QUFLQTtBQUNELEtBQU0sVUFBVSxXQUFXLGlDQUFYLEdBQStDLDBCQUEvRDtBQUNBLFFBQ0M7QUFBQTtBQUFBLElBQUssV0FBVyxPQUFoQjtBQUNFO0FBREYsRUFERDtBQUtBOzs7Ozs7OztBQ25CTSxJQUFNLDRCQUFVO0FBQ3RCLGFBQVksUUFEVTtBQUV0QixnQkFBZSxRQUZPO0FBR3RCLHFCQUFvQixRQUhFO0FBSXRCLGtCQUFpQixRQUpLO0FBS3RCLGFBQVksUUFMVTtBQU10QixZQUFXLFFBTlc7QUFPdEIsWUFBVztBQVBXLENBQWhCOzs7Ozs7Ozs7QUNBUDs7QUFDQTs7QUFFQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFDLEtBQUQsRUFBVztBQUNsQyxRQUFPO0FBQ04sVUFBUSxNQUFNLE1BRFI7QUFFTixZQUFVLE1BQU07QUFGVixFQUFQO0FBSUEsQ0FMRDs7QUFPQSxJQUFNLHNCQUFzQix5QkFBUSxlQUFSLGtDQUE1Qjs7a0JBRWUsbUI7Ozs7Ozs7OztBQ1pmOztBQUNBOztBQUNBOztBQUVBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQUMsS0FBRCxFQUFXO0FBQ2xDLFFBQU87QUFDTixrQkFBZ0IsTUFBTSxjQURoQjtBQUVOLFlBQVUsTUFBTTtBQUZWLEVBQVA7QUFJQSxDQUxEOztBQVFBLElBQU0sc0JBQXNCLHlCQUFRLGVBQVIsa0NBQTVCOztrQkFFZSxtQjs7Ozs7Ozs7O0FDZGY7O0FBQ0E7O0FBRUEsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsQ0FBQyxLQUFELEVBQVc7QUFDbEMsUUFBTztBQUNOLGlCQUFlLE1BQU0sYUFEZjtBQUVOLGVBQWEsTUFBTSxXQUZiO0FBR04sWUFBVSxNQUFNO0FBSFYsRUFBUDtBQUtBLENBTkQ7O0FBUUEsSUFBTSw2QkFBNkIseUJBQVEsZUFBUixnREFBbkM7O2tCQUVlLDBCOzs7Ozs7Ozs7QUNiZjs7QUFDQTs7QUFFQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFDLEtBQUQsRUFBVztBQUNsQyxRQUFPO0FBQ04sVUFBUSxNQUFNO0FBRFIsRUFBUDtBQUdBLENBSkQ7O0FBTUEsSUFBTSxpQkFBaUIseUJBQVEsZUFBUix3QkFBdkI7O2tCQUVlLGM7Ozs7Ozs7OztBQ1hmOztBQUNBOztBQUNBOztBQUNBOztBQUVBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQUMsS0FBRCxFQUFXO0FBQ2xDLFFBQU87QUFDTixjQUFZLE1BQU0sVUFEWjtBQUVOLFVBQVEsTUFBTTtBQUZSLEVBQVA7QUFJQSxDQUxEOztBQU9BLElBQU0scUJBQXFCLFNBQXJCLGtCQUFxQixDQUFDLFFBQUQsRUFBYztBQUN4QyxRQUFPO0FBQ04sZ0JBQWMsc0JBQUMsR0FBRCxFQUFNLFVBQU4sRUFBcUI7QUFDbEMsT0FBSSxjQUFKO0FBQ0EsK0JBQWlCLE1BQWpCLENBQXdCLFVBQXhCO0FBQ0EsR0FKSztBQUtOLDBCQUF3QixnQ0FBQyxHQUFELEVBQVM7QUFDaEMsWUFBUywrQkFBaUIsSUFBSSxNQUFKLENBQVcsS0FBNUIsQ0FBVDtBQUNBLEdBUEs7QUFRTixnQkFBYyxzQkFBQyxHQUFELEVBQVM7QUFDdEIsT0FBSSxjQUFKO0FBQ0EsWUFBUyw0QkFBVDtBQUNBO0FBWEssRUFBUDtBQWFBLENBZEQ7O0FBZ0JBLElBQU0sa0JBQWtCLHlCQUFRLGVBQVIsRUFBeUIsa0JBQXpCLDZDQUF4Qjs7a0JBRWUsZTs7Ozs7Ozs7O0FDOUJmOztBQUNBOztBQUVBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQUMsS0FBRCxFQUFXO0FBQ2xDLFFBQU87QUFDTixVQUFRLE1BQU0sTUFEUjtBQUVOLFlBQVUsTUFBTTtBQUZWLEVBQVA7QUFJQSxDQUxEOztBQU9BLElBQU0seUJBQXlCLHlCQUFRLGVBQVIsd0NBQS9COztrQkFFZSxzQjs7Ozs7Ozs7Ozs7O0FDWmY7O0FBQ0E7Ozs7SUFFYSxnQixXQUFBLGdCOzs7Ozs7O3lCQUNFLFUsRUFBWTtBQUN6QixPQUFJLFlBQVksaUJBQWlCLG1CQUFtQixVQUFuQixDQUFqQztBQUNBLFVBQU8sT0FBTyxLQUFQLENBQWEsU0FBYixFQUF3QjtBQUM5QixpQkFBYTtBQURpQixJQUF4QixFQUdOLElBSE0sQ0FHRCxVQUFDLElBQUQ7QUFBQSxXQUFVLEtBQUssSUFBTCxFQUFWO0FBQUEsSUFIQyxFQUlOLElBSk0sQ0FJRCxVQUFDLElBQUQ7QUFBQSxXQUFVLGFBQU0sUUFBTixDQUFlLGtDQUFvQixJQUFwQixDQUFmLENBQVY7QUFBQSxJQUpDLENBQVA7QUFLQTs7OzRCQUVnQixRLEVBQVU7QUFDMUIsT0FBSSxZQUFZLGlCQUFpQixRQUFqQztBQUNBLFVBQU8sT0FBTyxLQUFQLENBQWEsU0FBYixFQUF3QjtBQUM5QixpQkFBYTtBQURpQixJQUF4QixFQUdOLElBSE0sQ0FHRCxVQUFDLElBQUQ7QUFBQSxXQUFVLEtBQUssSUFBTCxFQUFWO0FBQUEsSUFIQyxFQUlOLElBSk0sQ0FJRCxVQUFDLElBQUQ7QUFBQSxXQUFVLGFBQU0sUUFBTixDQUFlLGtDQUFvQixJQUFwQixDQUFmLENBQVY7QUFBQSxJQUpDLENBQVA7QUFLQTs7Ozs7Ozs7Ozs7O1FDYmMsbUIsR0FBQSxtQjtRQU9BLGdCLEdBQUEsZ0I7UUFPQSxZLEdBQUEsWTtRQU1BLFcsR0FBQSxXO1FBT0EsVyxHQUFBLFc7UUFPQSxZLEdBQUEsWTtBQXpDVCxJQUFNLHdEQUF3Qix1QkFBOUI7QUFDQSxJQUFNLGtEQUFxQixvQkFBM0I7QUFDQSxJQUFNLHdDQUFnQixlQUF0QjtBQUNBLElBQU0sc0NBQWUsY0FBckI7QUFDQSxJQUFNLHNDQUFlLGNBQXJCO0FBQ0EsSUFBTSx3Q0FBZ0IsZUFBdEI7O0FBRUEsU0FBUyxtQkFBVCxDQUE2QixJQUE3QixFQUFtQztBQUN6QyxRQUFPO0FBQ04sUUFBTSxxQkFEQTtBQUVOLFFBQU07QUFGQSxFQUFQO0FBSUE7O0FBRU0sU0FBUyxnQkFBVCxDQUEwQixVQUExQixFQUFzQztBQUM1QyxRQUFPO0FBQ04sUUFBTSxrQkFEQTtBQUVOLGNBQVk7QUFGTixFQUFQO0FBSUE7O0FBRU0sU0FBUyxZQUFULEdBQXdCO0FBQzlCLFFBQU87QUFDTixRQUFNO0FBREEsRUFBUDtBQUdBOztBQUVNLFNBQVMsV0FBVCxDQUFxQixhQUFyQixFQUFvQztBQUMxQyxRQUFPO0FBQ04sUUFBTSxZQURBO0FBRU4sUUFBTTtBQUZBLEVBQVA7QUFJQTs7QUFFTSxTQUFTLFdBQVQsR0FBdUI7QUFDN0IsUUFBTztBQUNOLFFBQU0sWUFEQTtBQUVOLFFBQU07QUFGQSxFQUFQO0FBSUE7O0FBRU0sU0FBUyxZQUFULEdBQXdCO0FBQzlCLFFBQU87QUFDTixRQUFNO0FBREEsRUFBUDtBQUdBOzs7Ozs7Ozs7OztBQzdDRDs7OztBQUlBLElBQUksZUFBZSxlQUFlLE9BQWYsQ0FBdUIsT0FBdkIsQ0FBbkI7QUFDQSxJQUFNLGNBQWM7QUFDbkIsS0FBSSxFQURlO0FBRW5CLE9BQU0sRUFGYTtBQUduQixTQUFRLEVBSFc7QUFJbkIsU0FBUSxFQUpXO0FBS25CLGFBQVksQ0FMTztBQU1uQixTQUFRO0FBTlcsQ0FBcEI7QUFRQSxJQUFNLGFBQWE7QUFDbEIsU0FBUSxXQURVO0FBRWxCLGFBQVksRUFGTTtBQUdsQixpQkFBZ0IsRUFIRTtBQUlsQixXQUFVLElBSlE7QUFLbEIsZ0JBQWUsV0FMRztBQU1sQixjQUFhO0FBTkssQ0FBbkI7O0FBU0EsSUFBSSxDQUFDLFlBQUwsRUFBbUI7QUFDbEIsNkJBQ0ksVUFESjtBQUdBLENBSkQsTUFJTztBQUNOLGdCQUFlLEtBQUssS0FBTCxDQUFXLGVBQWUsT0FBZixDQUF1QixPQUF2QixDQUFYLENBQWY7QUFDQTs7QUFFRCxJQUFNLGVBQWUsU0FBZixZQUFlLEdBQWtDO0FBQUEsS0FBakMsS0FBaUMsdUVBQXpCLFlBQXlCO0FBQUEsS0FBWCxNQUFXOztBQUN0RCxLQUFJLGlCQUFKO0FBQ0EsU0FBUSxPQUFPLElBQWY7QUFDQztBQUNDLDJCQUNJLEtBREo7QUFFQyxnQkFBWSxPQUFPO0FBRnBCO0FBSUE7QUFDRDtBQUNDLE9BQUksT0FBTyxJQUFQLENBQVksRUFBaEIsRUFBb0I7QUFDbkIsUUFBSSxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sY0FBTixDQUFxQixNQUF2QixJQUFpQyxNQUFNLGNBQU4sQ0FBcUIsSUFBckIsQ0FBMEIsVUFBQyxNQUFELEVBQVk7QUFDMUYsWUFBTyxPQUFPLEVBQVAsS0FBYyxPQUFPLElBQVAsQ0FBWSxFQUFqQztBQUNBLEtBRm9ELENBQXREO0FBR0EsUUFBSSxpQkFBaUIsaUJBQWlCLE1BQU0sY0FBdkIsZ0NBQTRDLE1BQU0sY0FBbEQsSUFBa0UsT0FBTyxJQUF6RSxFQUFyQjtBQUNBLDRCQUNJLEtBREo7QUFFQyxhQUFRLE9BQU8sSUFGaEI7QUFHQyxrREFDSSxjQURKLEVBSEQ7QUFNQyxpQkFBWSxPQUFPLElBQVAsQ0FBWSxJQU56QjtBQU9DLGVBQVUsS0FQWDtBQVFDLGtCQUFhLElBUmQ7QUFTQyxpQ0FDSSxXQURKO0FBVEQ7QUFhQSxJQWxCRCxNQWtCTztBQUNOLFlBQVEsSUFBUixDQUFhLHNFQUFiO0FBQ0EsZUFBVyxLQUFYO0FBQ0E7QUFDRDtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLGNBQVU7QUFGWDtBQUlBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsbUJBQWUsT0FBTyxJQUZ2QjtBQUdDLGlCQUFhO0FBSGQ7QUFLQTtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLGdDQUNJLFdBREosQ0FGRDtBQUtDLGlCQUFhO0FBTGQ7QUFPQTtBQUNEO0FBQ0MsMkJBQ0ksVUFESjtBQUdBO0FBQ0Q7QUFDQyxjQUFXLEtBQVg7QUEzREY7QUE2REEsUUFBTyxjQUFQLENBQXNCLE9BQXRCLENBQThCLE9BQTlCLEVBQXVDLEtBQUssU0FBTCxDQUFlLFFBQWYsQ0FBdkM7QUFDQSxRQUFPLFFBQVA7QUFDQSxDQWpFRDs7a0JBbUVlLFk7Ozs7Ozs7Ozs7QUNqR2Y7O0FBQ0E7Ozs7OztBQUVPLElBQUksd0JBQVEsZ0RBRWxCLE9BQU8sNEJBQVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiLyoqXG4gKiBNb3Rpb25MYWIgZGVhbHMgd2l0aCBjb250cm9sbGluZyBlYWNoIHRpY2sgb2YgdGhlIGFuaW1hdGlvbiBmcmFtZSBzZXF1ZW5jZVxuICogSXQncyBhaW0gaXMgdG8gaXNvbGF0ZSBjb2RlIHRoYXQgaGFwcGVucyBvdmVyIGEgbnVtYmVyIG9mIGZyYW1lcyAoaS5lLiBtb3Rpb24pXG4gKi9cbmltcG9ydCB7UHJvcHN9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNvbnN0IFRSQUNLX0NBTV9UT19PQkogPSAnVFJBQ0tfQ0FNX1RPX09CSic7XG5jb25zdCBERUZBVUxUID0gJ0RFRkFVTFQnO1xuY29uc3QgZGVmYXVsdEpvYiA9IHtcblx0dHlwZTogREVGQVVMVFxufTtcblxuZXhwb3J0IGNsYXNzIE1vdGlvbkxhYiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHRcdHRoaXMuYW5pbWF0ZSgpO1xuXHR9XG5cblx0YW5pbWF0ZSgpIHtcblx0XHRQcm9wcy50MiA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5wcm9jZXNzU2NlbmUoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5yZW5kZXIoUHJvcHMuc2NlbmUsIFByb3BzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRQcm9wcy50MSA9IFByb3BzLnQyO1xuXHRcdFx0dGhpcy5hbmltYXRlLmNhbGwodGhpcyk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm9jZXNzU2NlbmUoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi50eXBlKSB7XG5cdFx0XHRjYXNlIFRSQUNLX0NBTV9UT19PQko6XG5cdFx0XHRcdHRoaXMudHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgREVGQVVMVDpcblx0XHRcdFx0dGhpcy51cGRhdGVSb3RhdGlvbigpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCkge1xuXHRcdGNvbnN0IHNob3VsZEVuZCA9IHBhcnNlSW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKSA9PT0gMTtcblx0XHRpZiAoIXNob3VsZEVuZCkge1xuXHRcdFx0dGhpcy5mb2xsb3dQYXRoKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5lbmRBbmltYXRpb24oKTtcblx0XHR9XG5cdH1cblxuXHRmb2xsb3dQYXRoKCkge1xuXHRcdGNvbnN0IHAgPSB0aGlzLmpvYi5wYXRoLmdldFBvaW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKTtcblx0XHR0aGlzLmpvYi5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHApO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lICs9IDAuMDE7XG5cdH1cblxuXHRlbmRBbmltYXRpb24oKSB7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgJiYgdGhpcy5qb2IuY2FsbGJhY2soKTtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdH1cblxuXHR0cmFja09iamVjdFRvQ2FtZXJhKG9iamVjdDNELCBjYWxsYmFjaykge1xuICAgIFx0dGhpcy5qb2IgPSB7fTtcbiAgICBcdHRoaXMuam9iLnR5cGUgPSBUUkFDS19DQU1fVE9fT0JKO1xuXHRcdHRoaXMuam9iLnQgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLmpvYi5vYmplY3QzRCA9IG9iamVjdDNEO1xuXHRcdHRoaXMuam9iLmVuZGVkID0gZmFsc2U7XG5cdFx0dGhpcy5qb2IucGF0aCA9IG5ldyBUSFJFRS5DYXRtdWxsUm9tQ3VydmUzKFtcblx0XHRcdG9iamVjdDNELnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKVxuXHRcdF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRjb25zdCBjYW1RdWF0ZXJuaW9uVXBkYXRlID0gdGhpcy5nZXROZXdDYW1lcmFEaXJlY3Rpb24oKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS54ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnkgKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIFByb3BzLmNhbWVyYURpc3RhbmNlXG5cdFx0KTtcblx0XHRQcm9wcy5jYW1lcmEubG9va0F0KFByb3BzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzVGV4dCcpKSB7XG5cdFx0XHRcdG9iai5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdGdldE5ld0NhbWVyYURpcmVjdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSBQcm9wcy5tb3VzZVBvc0RpZmZZID49IFByb3BzLm1vdXNlUG9zRGlmZlg7XG5cdFx0Y29uc3QgeE1vcmVUaGFuWU1vdXNlID0gIXlNb3JlVGhhblhNb3VzZTtcblx0XHRpZiAoUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCAtPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54ICs9IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSArPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55IC09IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZSA9IFNjZW5lVXRpbHMucmVub3JtYWxpemVRdWF0ZXJuaW9uKFByb3BzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIoUHJvcHMuY2FtZXJhUm90YXRpb24pO1xuXHRcdHJldHVybiBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHR9XG5cblx0cmVkdWNlU3BlZWQoYW1vdW50KSB7XG5cdFx0aWYgKFByb3BzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFggLT0gYW1vdW50O1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5zcGVlZFkgPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuZXhwb3J0IGNvbnN0IFByb3BzID0ge1xuXHRyZW5kZXJlcjogbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWV9KSxcblx0c2NlbmU6IG5ldyBUSFJFRS5TY2VuZSgpLFxuXHRjYW1lcmE6IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgzMCwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDUwMCwgMTUwMDAwKSxcblx0Z3JhcGhDb250YWluZXI6IG5ldyBUSFJFRS5PYmplY3QzRCgpLFxuXHRjYW1lcmFSb3RhdGlvbjogbmV3IFRIUkVFLkV1bGVyKDAsIC0xLCAwKSxcblx0Y2FtZXJhTG9va0F0OiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSxcblx0Y2FtZXJhRGlzdGFuY2U6IDM1MDAsXG5cdFxuXHR0MTogMC4wLCAvLyBvbGQgdGltZVxuXHR0MjogMC4wLCAvLyBub3cgdGltZVxuXHRzcGVlZFg6IDAuMDA1LFxuXHRzcGVlZFk6IDAuMDAwLFxuXHRtb3VzZVBvc0RpZmZYOiAwLjAsXG5cdG1vdXNlUG9zRGlmZlk6IDAuMCxcblx0bW91c2VQb3NYSW5jcmVhc2VkOiBmYWxzZSxcblx0bW91c2VQb3NZSW5jcmVhc2VkOiBmYWxzZSxcblx0cmF5Y2FzdGVyOiBuZXcgVEhSRUUuUmF5Y2FzdGVyKCksXG5cdG1vdXNlVmVjdG9yOiBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRcblx0cmVsYXRlZEFydGlzdFNwaGVyZXM6IFtdLFxuXHRtYWluQXJ0aXN0U3BoZXJlOiB7fVxufTsiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSAnLi4vY29uZmlnL2NvbG91cnMnO1xuaW1wb3J0IHtQcm9wc30gZnJvbSBcIi4vcHJvcHNcIjtcbmltcG9ydCB7U3RhdGlzdGljc30gZnJvbSBcIi4vc3RhdGlzdGljcy5jbGFzc1wiO1xuXG5sZXQgSEVMVkVUSUtFUjtcbmNvbnN0IE1BSU5fQVJUSVNUX0ZPTlRfU0laRSA9IDM0O1xuY29uc3QgUkVMQVRFRF9BUlRJU1RfRk9OVF9TSVpFID0gMjA7XG5jb25zdCBUT1RBTF9SRUxBVEVEID0gMTA7XG5cbmNsYXNzIFNjZW5lVXRpbHMge1xuXHRzdGF0aWMgaW5pdCgpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Y29uc3QgbG9hZGVyID0gbmV3IFRIUkVFLkZvbnRMb2FkZXIoKTtcblx0XHRcdGxvYWRlci5sb2FkKCcuL2pzL2ZvbnRzL2hlbHZldGlrZXJfcmVndWxhci50eXBlZmFjZS5qc29uJywgKGZvbnQpID0+IHtcblx0XHRcdFx0SEVMVkVUSUtFUiA9IGZvbnQ7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0sICgpPT57fSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGEgLSBtaW5cblx0ICogQHBhcmFtIGIgLSBtYXhcblx0ICogQHBhcmFtIGMgLSB2YWx1ZSB0byBjbGFtcFxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIGNsYW1wKGEsIGIsIGMpIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgoYiwgTWF0aC5taW4oYywgYSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdpdmVuIHBvc2l0aXZlIHggcmV0dXJuIDEsIG5lZ2F0aXZlIHggcmV0dXJuIC0xLCBvciAwIG90aGVyd2lzZVxuXHQgKiBAcGFyYW0geFxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIHNpZ24obikge1xuXHRcdHJldHVybiBuID4gMCA/IDEgOiBuIDwgMCA/IC0xIDogMDtcblx0fTtcblx0XG5cdHN0YXRpYyByZW5vcm1hbGl6ZVF1YXRlcm5pb24ob2JqZWN0KSB7XG5cdFx0bGV0IGNsb25lID0gb2JqZWN0LmNsb25lKCk7XG5cdFx0bGV0IHEgPSBjbG9uZS5xdWF0ZXJuaW9uO1xuXHRcdGxldCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoTWF0aC5wb3cocS53LCAyKSArIE1hdGgucG93KHEueCwgMikgKyBNYXRoLnBvdyhxLnksIDIpICsgTWF0aC5wb3cocS56LCAyKSk7XG5cdFx0cS53IC89IG1hZ25pdHVkZTtcblx0XHRxLnggLz0gbWFnbml0dWRlO1xuXHRcdHEueSAvPSBtYWduaXR1ZGU7XG5cdFx0cS56IC89IG1hZ25pdHVkZTtcblx0XHRyZXR1cm4gcTtcblx0fVxuXG5cdHN0YXRpYyBnZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGdyYXBoLCByYXljYXN0ZXIsIGNhbWVyYSkge1xuXHRcdHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKFByb3BzLm1vdXNlVmVjdG9yLCBjYW1lcmEpO1xuXHRcdHJldHVybiByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhncmFwaC5jaGlsZHJlbiwgdHJ1ZSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0TW91c2VWZWN0b3IoZXZlbnQpIHtcblx0XHRyZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjIoKGV2ZW50LmNsaWVudFggLyBQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudFdpZHRoKSAqIDIgLSAxLFxuXHRcdFx0LShldmVudC5jbGllbnRZIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRIZWlnaHQpICogMiArIDEpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KSB7XG5cdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0bGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMubWFpbkFydGlzdH0pKTtcblx0XHRzcGhlcmUuYXJ0aXN0T2JqID0gYXJ0aXN0O1xuXHRcdHNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0c3BoZXJlLmlzTWFpbkFydGlzdFNwaGVyZSA9IHRydWU7XG5cdFx0c3BoZXJlLmlzU3BoZXJlID0gdHJ1ZTtcblx0XHRTY2VuZVV0aWxzLmFkZFRleHQoYXJ0aXN0Lm5hbWUsIE1BSU5fQVJUSVNUX0ZPTlRfU0laRSwgc3BoZXJlKTtcblx0XHRyZXR1cm4gc3BoZXJlO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZVJlbGF0ZWRTcGhlcmVzKGFydGlzdCwgbWFpbkFydGlzdFNwaGVyZSkge1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5ID0gW107XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3Q7XG5cdFx0bGV0IHNwaGVyZUZhY2VJbmRleCA9IDA7XG5cdFx0bGV0IGZhY2VzQ291bnQgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzLmxlbmd0aCAtIDE7XG5cdFx0bGV0IHN0ZXAgPSBNYXRoLnJvdW5kKGZhY2VzQ291bnQgLyBUT1RBTF9SRUxBVEVEIC0gMSk7XG5cblx0XHRmb3IgKGxldCBpID0gMCwgbGVuID0gTWF0aC5taW4oVE9UQUxfUkVMQVRFRCwgYXJ0aXN0LnJlbGF0ZWQubGVuZ3RoKTsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0ID0gYXJ0aXN0LnJlbGF0ZWRbaV07XG5cdFx0XHRsZXQgcmFkaXVzID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgMzUsIDM1KTtcblx0XHRcdGxldCByZWxhdGVkQXJ0aXN0U3BoZXJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkQXJ0aXN0fSkpO1xuXHRcdFx0bGV0IGdlbnJlTWV0cmljcyA9IFN0YXRpc3RpY3MuZ2V0U2hhcmVkR2VucmVNZXRyaWMoYXJ0aXN0LCByZWxhdGVkQXJ0aXN0KTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqID0gcmVsYXRlZEFydGlzdDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqLmdlbnJlU2ltaWxhcml0eSA9IGdlbnJlTWV0cmljcy5nZW5yZVNpbWlsYXJpdHk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmRpc3RhbmNlID0gZ2VucmVNZXRyaWNzLmxpbmVMZW5ndGg7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1JlbGF0ZWRBcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0Lm5hbWUsIFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5LnB1c2gocmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5O1xuXHR9XG5cblx0c3RhdGljIGFwcGVuZE9iamVjdHNUb1NjZW5lKGdyYXBoQ29udGFpbmVyLCBzcGhlcmUsIHNwaGVyZUFycmF5KSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cdFx0cGFyZW50Lm5hbWUgPSAncGFyZW50Jztcblx0XHRwYXJlbnQuYWRkKHNwaGVyZSk7XG5cdFx0aWYgKHNwaGVyZUFycmF5KSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwaGVyZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHBhcmVudC5hZGQoc3BoZXJlQXJyYXlbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRncmFwaENvbnRhaW5lci5hZGQocGFyZW50KTtcblx0fVxuXG5cdHN0YXRpYyBqb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkTGluZUpvaW59KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRsZXQgbGluZTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHJlbGF0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0bGluZSA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdFx0bWFpbkFydGlzdFNwaGVyZS5hZGQobGluZSk7XG5cdH1cblxuXHRzdGF0aWMgcG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCkge1xuXHRcdGxldCBtYWluQXJ0aXN0U3BoZXJlRmFjZSA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXNbTWF0aC5mbG9vcihzcGhlcmVGYWNlSW5kZXgpXS5ub3JtYWwuY2xvbmUoKTtcblx0XHRyZWxhdGVkU3BoZXJlLnBvc2l0aW9uXG5cdFx0XHQuY29weShtYWluQXJ0aXN0U3BoZXJlRmFjZS5tdWx0aXBseShuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBhZGRUZXh0KGxhYmVsLCBzaXplLCBzcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogc2l6ZSxcblx0XHRcdGN1cnZlU2VnbWVudHM6IDQsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMixcblx0XHRcdGJldmVsU2l6ZTogMSxcblx0XHRcdGJldmVsU2VnbWVudHM6IDNcblx0XHR9KTtcblx0XHRsZXQgdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0ZXh0R2VvbSwgbWF0ZXJpYWxBcnJheSk7XG5cdFx0dGV4dE1lc2guaXNUZXh0ID0gdHJ1ZTtcblx0XHRzcGhlcmUuYWRkKHRleHRNZXNoKTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoLXNwaGVyZS5yYWRpdXMsIC0oc3BoZXJlLnJhZGl1cyArIHNpemUgKiAyKSwgLXNwaGVyZS5yYWRpdXMgLyAyKTtcblx0fVxuXG5cdHN0YXRpYyBsaWdodGluZygpIHtcblx0XHRsZXQgbGlnaHRBID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhDQ0NDQ0MsIDEuNzI1KTtcblx0XHRsZXQgbGlnaHRCID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhBQUFBQUEsIDEuNSk7XG5cdFx0bGlnaHRBLnBvc2l0aW9uLnNldFgoNTAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WSgtODAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WCgtNTAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRBKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRCKTtcblx0fVxufVxuXG5leHBvcnQgeyBTY2VuZVV0aWxzIH1cbiIsIi8qKlxuICogU3BoZXJlc1NjZW5lIGlzIGRlc2lnbmVkIHRvIGhhbmRsZSBhZGRpbmcgYW5kIHJlbW92aW5nIGVudGl0aWVzIGZyb20gdGhlIHNjZW5lLFxuICogYW5kIGhhbmRsaW5nIGV2ZW50cy5cbiAqXG4gKiBJdCBhaW1zIHRvIGRlYWwgbm90IHdpdGggY2hhbmdlcyBvdmVyIHRpbWUsIG9ubHkgaW1tZWRpYXRlIGNoYW5nZXMgaW4gb25lIGZyYW1lLlxuICovXG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gXCIuLi9jb25maWcvY29sb3Vyc1wiO1xuaW1wb3J0IHtNb3Rpb25MYWJ9IGZyb20gXCIuL21vdGlvbi1sYWIuY2xhc3NcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2hpZGVSZWxhdGVkLCByZWxhdGVkQ2xpY2ssIHNob3dSZWxhdGVkfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0dGhpcy5tb3Rpb25MYWIgPSBuZXcgTW90aW9uTGFiKCk7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMSwgNSwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGNvbnN0IGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyk7XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRsZXQgaW50ZXJzZWN0cztcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7IC8vIHJlc2V0IHRoZSByZWxhdGVkIHNwaGVyZSB0byByZWRcblx0XHRcdFx0b2JqLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7IC8vIG1vdXNlIGlzIG92ZXIgYSBNZXNoXG5cdFx0XHRQcm9wcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c3RvcmUuZGlzcGF0Y2goc2hvd1JlbGF0ZWQoc2VsZWN0ZWQuYXJ0aXN0T2JqKSk7XG5cdFx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0XHRzZWxlY3RlZC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0SG92ZXIpO1xuXHRcdFx0fSBlbHNlIGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0bGV0IHBhcmVudCA9IHNlbGVjdGVkLnBhcmVudDtcblx0XHRcdFx0aWYgKHBhcmVudC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0XHRzdG9yZS5kaXNwYXRjaChzaG93UmVsYXRlZChwYXJlbnQuYXJ0aXN0T2JqKSk7XG5cdFx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0cGFyZW50Lm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN0b3JlLmRpc3BhdGNoKGhpZGVSZWxhdGVkKCkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHR9XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0XHRyZXR1cm4gaXNPdmVyUmVsYXRlZDtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZURyYWcoZXZlbnQpIHtcblx0XHRjb25zdCBkdCA9IFByb3BzLnQyIC0gUHJvcHMudDE7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueCA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLngpO1xuXHRcdFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci55ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWCA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLngpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueCkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlkgPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci55KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpKTtcblx0XHRQcm9wcy5zcGVlZFggPSAoKDEgKyBQcm9wcy5tb3VzZVBvc0RpZmZYKSAvIGR0KTtcblx0XHRQcm9wcy5zcGVlZFkgPSAoKDEgKyBQcm9wcy5tb3VzZVBvc0RpZmZZKSAvIGR0KTtcblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpIHtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdGxldCBpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5yYXljYXN0ZXIsIFByb3BzLmNhbWVyYSk7XG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBzZWxlY3RlZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0O1xuXHRcdFx0aWYgKHNlbGVjdGVkLmhhc093blByb3BlcnR5KCdpc1JlbGF0ZWRBcnRpc3RTcGhlcmUnKSkge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChyZWxhdGVkQ2xpY2soKSk7XG5cdFx0XHRcdHRoaXMuZ2V0UmVsYXRlZEFydGlzdChzZWxlY3RlZCk7XG5cdFx0XHR9IGVsc2UgaWYgKHNlbGVjdGVkLmhhc093blByb3BlcnR5KCdpc1RleHQnKSkge1xuXHRcdFx0XHRsZXQgcGFyZW50ID0gc2VsZWN0ZWQucGFyZW50O1xuXHRcdFx0XHRpZiAocGFyZW50Lmhhc093blByb3BlcnR5KCdpc1JlbGF0ZWRBcnRpc3RTcGhlcmUnKSkge1xuXHRcdFx0XHRcdHN0b3JlLmRpc3BhdGNoKHJlbGF0ZWRDbGljaygpKTtcblx0XHRcdFx0XHR0aGlzLmdldFJlbGF0ZWRBcnRpc3QocGFyZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIudHJhY2tPYmplY3RUb0NhbWVyYShzZWxlY3RlZFNwaGVyZSwgKCkgPT4ge1xuXHRcdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmouaWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJHcmFwaCgpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBQcm9wcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShwYXJlbnQpO1xuXHRcdH1cblx0fVxuXG5cdGNsZWFyQWRkcmVzcygpIHtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuXHR9XG5cblx0em9vbShkaXJlY3Rpb24pIHtcblx0XHRzd2l0Y2ggKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSAnaW4nOlxuXHRcdFx0XHRQcm9wcy5jYW1lcmFEaXN0YW5jZSAtPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvdXQnOlxuXHRcdFx0XHRQcm9wcy5jYW1lcmFEaXN0YW5jZSArPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlQ2FtZXJhQXNwZWN0KCkge1xuXHRcdFByb3BzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHRQcm9wcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cdH1cbn0iLCJjb25zdCBNSU5fRElTVEFOQ0UgPSA1MDtcbmNvbnN0IE1BWF9ESVNUQU5DRSA9IDgwMDtcbmNvbnN0IERJU1RBTkNFX1NDQUxBUiA9IDUwO1xuY29uc3QgU0laRV9TQ0FMQVIgPSAxLjU7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aXN0aWNzIHtcbiAgICBzdGF0aWMgZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDQwLCBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSKTtcbiAgICB9XG5cblx0LyoqXG4gICAgICogTWFwLXJlZHVjZSBvZiB0d28gc3RyaW5nIGFycmF5c1xuXHQgKiBAcGFyYW0gYXJ0aXN0XG5cdCAqIEBwYXJhbSByZWxhdGVkQXJ0aXN0XG5cdCAqIEByZXR1cm5zIHtvYmplY3R9XG5cdCAqL1xuXHRzdGF0aWMgZ2V0U2hhcmVkR2VucmVNZXRyaWMoYXJ0aXN0LCByZWxhdGVkQXJ0aXN0KSB7XG5cdFx0bGV0IG1hdGNoZXMgPSBhcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAubWFwKChtYWluQXJ0aXN0R2VucmUpID0+IFN0YXRpc3RpY3MubWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBtYXRjaCkgPT4ge1xuXHRcdCAgICAgICAgaWYgKG1hdGNoKSB7XG5cdFx0ICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChtYXRjaCk7XG5cdFx0XHRcdH1cblx0XHQgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgICAgICAgIH0sIFtdKTtcblx0XHRsZXQgYXJ0aXN0R2VucmVDb3VudCA9IGFydGlzdC5nZW5yZXMubGVuZ3RoID8gYXJ0aXN0LmdlbnJlcy5sZW5ndGggOiAxO1xuXHRcdGxldCB1bml0ID0gMSAvIGFydGlzdEdlbnJlQ291bnQ7XG5cdFx0dW5pdCA9IHVuaXQgPT09IDEgPyAwIDogdW5pdDtcblx0XHRsZXQgZ2VucmVTaW1pbGFyaXR5ID0gbWF0Y2hlcy5sZW5ndGggKiB1bml0O1xuXHRcdGxldCBtaW5EaXN0YW5jZSA9ICgoYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUikgKyAocmVsYXRlZEFydGlzdC5wb3B1bGFyaXR5ICogU0laRV9TQ0FMQVIpKSArIE1JTl9ESVNUQU5DRTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGluZUxlbmd0aDogTWF0aC5tYXgobWluRGlzdGFuY2UsIE1BWF9ESVNUQU5DRSAtIChNQVhfRElTVEFOQ0UgKiBnZW5yZVNpbWlsYXJpdHkpKSxcblx0XHRcdGdlbnJlU2ltaWxhcml0eTogTWF0aC5yb3VuZChnZW5yZVNpbWlsYXJpdHkgKiAxMDApXG5cdFx0fTtcblx0fVxuXG5cdHN0YXRpYyBtYXRjaEFydGlzdFRvUmVsYXRlZEdlbnJlcyhtYWluQXJ0aXN0R2VucmUsIHJlbGF0ZWRBcnRpc3QpIHtcbiAgICAgICAgcmV0dXJuIHJlbGF0ZWRBcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAuZmluZCgoZ2VucmUpID0+IGdlbnJlID09PSBtYWluQXJ0aXN0R2VucmUpO1xuICAgIH1cbiB9IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU2VhcmNoQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXJcIjtcbmltcG9ydCBTcG90aWZ5UGxheWVyQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lclwiO1xuaW1wb3J0IFNjZW5lQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdExpc3RDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWxpc3QuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0SW5mb0NvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtaW5mby5jb250YWluZXJcIjtcbmltcG9ydCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9yZWxhdGVkLWFydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8U2VhcmNoQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNwb3RpZnlQbGF5ZXJDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8UmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0SW5mb0NvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RMaXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdEluZm9Db21wb25lbnQoe2FydGlzdCwgaXNIaWRkZW59KSB7XG5cdGNvbnN0IGdlbnJlcyA9IGFydGlzdC5nZW5yZXMubWFwKChnZW5yZSkgPT4ge1xuXHRcdHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCIga2V5PXtnZW5yZX0+e2dlbnJlfTwvc3Bhbj5cblx0fSk7XG5cdGNvbnN0IGNsYXNzZXMgPSBpc0hpZGRlbiA/ICdoaWRkZW4gaW5mby1jb250YWluZXIgbWFpbicgOiAnaW5mby1jb250YWluZXIgbWFpbic7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3QtbmFtZS10YWcgbWFpblwiPnthcnRpc3QubmFtZX08L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57YXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJnZW5yZXNcIj57Z2VucmVzfTwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcblxuZXhwb3J0IGNsYXNzIEFydGlzdExpc3RDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0aGFuZGxlR2V0QXJ0aXN0KGV2dCwgYXJ0aXN0SWQpIHtcblx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGFydGlzdHMgPSB0aGlzLnByb3BzLnZpc2l0ZWRBcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiB7XG5cdFx0XHRsZXQgaHJlZiA9ICcvYXBwLyMnICsgZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdC5pZCk7XG5cdFx0XHRsZXQgaW1nVXJsID0gYXJ0aXN0LmltYWdlcyAmJiBhcnRpc3QuaW1hZ2VzLmxlbmd0aCA/IGFydGlzdC5pbWFnZXNbYXJ0aXN0LmltYWdlcy5sZW5ndGggLSAxXS51cmwgOiAnJztcblx0XHRcdGxldCBpbWdTdHlsZSA9IHsgYmFja2dyb3VuZEltYWdlOiBgdXJsKCR7aW1nVXJsfSlgIH07XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdFwiIGtleT17YXJ0aXN0LmlkfT5cblx0XHRcdFx0XHQ8YSBocmVmPXtocmVmfSBpZD17YXJ0aXN0LmlkfSBjbGFzc05hbWU9XCJuYXYtYXJ0aXN0LWxpbmtcIlxuXHRcdFx0XHRcdCAgIG9uQ2xpY2s9eyhldmVudCkgPT4geyB0aGlzLmhhbmRsZUdldEFydGlzdChldmVudCwgYXJ0aXN0LmlkKSB9fT5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGljdHVyZS1ob2xkZXJcIj5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlXCIgc3R5bGU9e2ltZ1N0eWxlfSAvPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJuYW1lXCI+e2FydGlzdC5uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KVxuXHRcdH0pO1xuXHRcdGNvbnN0IGNsYXNzZXMgPSB0aGlzLnByb3BzLmlzSGlkZGVuID8gJ2hpZGRlbiBhcnRpc3QtbmF2aWdhdGlvbicgOiAnYXJ0aXN0LW5hdmlnYXRpb24nO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHRcdHthcnRpc3RzfVxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG5cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50KHtyZWxhdGVkQXJ0aXN0LCBoaWRlUmVsYXRlZCwgaGlkZUluZm99KSB7XG5cdGNvbnN0IGhpZGRlbkNsYXNzID0gaGlkZVJlbGF0ZWQgfHwgaGlkZUluZm8gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIHJlbGF0ZWQnIDogJ2luZm8tY29udGFpbmVyIHJlbGF0ZWQnO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtoaWRkZW5DbGFzc30+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyByZWxhdGVkXCI+e3JlbGF0ZWRBcnRpc3QubmFtZX08L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57cmVsYXRlZEFydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5HZW5yZSBzaW1pbGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LmdlbnJlU2ltaWxhcml0eX0lPC9zcGFuPjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuLi9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge1NwaGVyZXNTY2VuZX0gZnJvbSBcIi4uL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzc1wiO1xuaW1wb3J0IHtyZWxhdGVkQ2xpY2t9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTY2VuZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiIHJlZj17ZWxlbSA9PiB0aGlzLnNjZW5lRG9tID0gZWxlbX0vPlxuXHRcdClcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdFNjZW5lVXRpbHMuaW5pdCgpLnRoZW4oKCkgPT4geyAvLyBsb2FkIHRoZSBmb250IGZpcnN0IChhc3luYylcblx0XHRcdHRoaXMuc2NlbmUgPSBuZXcgU3BoZXJlc1NjZW5lKHRoaXMuc2NlbmVEb20pO1xuXHRcdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0XHR9KTtcblx0fVxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcblx0XHR0aGlzLmluaXRTY2VuZSgpO1xuXHR9XG5cblx0aW5pdFNjZW5lKCkge1xuXHRcdGNvbnN0IHsgYXJ0aXN0IH0gPSB0aGlzLnByb3BzO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBldmVudCA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKTsgLy8gcmVtb3ZlIHJpZ2h0IGNsaWNrXG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLCB0cnVlKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcywgZmFsc2UpO1xuXHRcdGlmIChhcnRpc3QuaWQpIHtcblx0XHRcdHRoaXMuc2NlbmUuY29tcG9zZVNjZW5lKGFydGlzdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2NlbmUuY2xlYXJHcmFwaCgpO1xuXHRcdFx0dGhpcy5zY2VuZS5jbGVhckFkZHJlc3MoKTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVFdmVudChldmVudCkge1xuXHRcdHRoaXNbZXZlbnQudHlwZV0oZXZlbnQpO1xuXHR9XG5cblx0Y2xpY2soZXZlbnQpIHtcblx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWInO1xuXHRcdGlmICghdGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vtb3ZlKGV2ZW50KSB7XG5cdFx0bGV0IGlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWInO1xuXHRcdGlmICh0aGlzLm1vdXNlSXNEb3duKSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VEcmFnKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRoaXMuc2NlbmUub25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpO1xuXHRcdH1cblx0XHRpZiAoaXNPdmVyUmVsYXRlZCAmJiAhdGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIHBvaW50ZXInO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWJiZWQnO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlZG93bigpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gdHJ1ZTtcblx0fVxuXG5cdG1vdXNldXAoKSB7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0bW91c2V3aGVlbChldmVudCkge1xuXHRcdHN3aXRjaCAoU2NlbmVVdGlscy5zaWduKGV2ZW50LndoZWVsRGVsdGFZKSkge1xuXHRcdFx0Y2FzZSAtMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdvdXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnaW4nKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmVzaXplKCkge1xuXHRcdHRoaXMuc2NlbmUudXBkYXRlQ2FtZXJhQXNwZWN0KCk7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFNlYXJjaElucHV0Q29tcG9uZW50KHtzZWFyY2hUZXJtLCBhcnRpc3QsIGhhbmRsZVNlYXJjaCwgaGFuZGxlU2VhcmNoVGVybVVwZGF0ZSwgY2xlYXJTZXNzaW9ufSkge1xuICAgIGNvbnN0IGNsZWFyQnRuQ2xhc3MgPSBhcnRpc3QuaWQgPyAnY2xlYXItc2Vzc2lvbicgOiAnaGlkZGVuIGNsZWFyLXNlc3Npb24nO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VhcmNoLWZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJhcnRpc3Qtc2VhcmNoXCIgb25TdWJtaXQ9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17c2VhcmNoVGVybX0gb25DaGFuZ2U9e2hhbmRsZVNlYXJjaFRlcm1VcGRhdGV9IC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgb25DbGljaz17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PkdvPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9e2NsZWFyQnRuQ2xhc3N9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoZXZ0KSA9PiBjbGVhclNlc3Npb24oZXZ0KX0+Q2xlYXIgU2Vzc2lvbjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU3BvdGlmeVBsYXllckNvbXBvbmVudCh7YXJ0aXN0LCBpc0hpZGRlbn0pIHtcblx0Y29uc3QgZW1iZWRVcmwgPSAnaHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL2VtYmVkL2FydGlzdC8nO1xuXHRjb25zdCBhcnRpc3RFbWJlZFVybCA9IGAke2VtYmVkVXJsfSR7YXJ0aXN0LmlkfWA7XG5cdGxldCBpRnJhbWVNYXJrdXAgPSAnJztcblx0aWYgKGFydGlzdC5pZCkge1xuXHRcdGlGcmFtZU1hcmt1cCA9IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BvdGlmeS1wbGF5ZXJcIj5cblx0XHRcdFx0PGlmcmFtZSBzcmM9e2FydGlzdEVtYmVkVXJsfSB3aWR0aD1cIjMwMFwiIGhlaWdodD1cIjgwXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIHNwb3RpZnktcGxheWVyLWNvbnRhaW5lcicgOiAnc3BvdGlmeS1wbGF5ZXItY29udGFpbmVyJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHR7aUZyYW1lTWFya3VwfVxuXHRcdDwvZGl2PlxuXHQpXG59IiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZExpbmVKb2luOiAweGZmZmZjYyxcblx0bWFpbkFydGlzdDogMHhmZmNjMDAsXG5cdHRleHRPdXRlcjogMHhmZmZmY2MsXG5cdHRleHRJbm5lcjogMHgwMDAwMzNcbn07IiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdCxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuXG5jb25zdCBBcnRpc3RMaXN0Q29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7UmVsYXRlZEFydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRyZWxhdGVkQXJ0aXN0OiBzdGF0ZS5yZWxhdGVkQXJ0aXN0LFxuXHRcdGhpZGVSZWxhdGVkOiBzdGF0ZS5oaWRlUmVsYXRlZCxcblx0XHRoaWRlSW5mbzogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoUmVsYXRlZEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1NjZW5lQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3NjZW5lLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNjZW5lQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNjZW5lQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7IE11c2ljRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHtjbGVhclNlc3Npb24sIHVwZGF0ZVNlYXJjaFRlcm19IGZyb20gJy4uL3N0YXRlL2FjdGlvbnMnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRzZWFyY2hUZXJtOiBzdGF0ZS5zZWFyY2hUZXJtLFxuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhbmRsZVNlYXJjaDogKGV2dCwgYXJ0aXN0TmFtZSkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLnNlYXJjaChhcnRpc3ROYW1lKTtcblx0XHR9LFxuXHRcdGhhbmRsZVNlYXJjaFRlcm1VcGRhdGU6IChldnQpID0+IHtcblx0XHRcdGRpc3BhdGNoKHVwZGF0ZVNlYXJjaFRlcm0oZXZ0LnRhcmdldC52YWx1ZSkpO1xuXHRcdH0sXG5cdFx0Y2xlYXJTZXNzaW9uOiAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGRpc3BhdGNoKGNsZWFyU2Vzc2lvbigpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNlYXJjaENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKFNlYXJjaElucHV0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U3BvdGlmeVBsYXllckNvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50XCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0LFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHthcnRpc3REYXRhQXZhaWxhYmxlfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBzZWFyY2goYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIlxuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXJ0aXN0KGFydGlzdElkKSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FydGlzdC8nICsgYXJ0aXN0SWQ7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9EQVRBX0FWQUlMQUJMRSA9ICdBUlRJU1RfREFUQV9BVkFJTEFCTEUnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuZXhwb3J0IGNvbnN0IFJFTEFURURfQ0xJQ0sgPSAnUkVMQVRFRF9DTElDSyc7XG5leHBvcnQgY29uc3QgU0hPV19SRUxBVEVEID0gJ1NIT1dfUkVMQVRFRCc7XG5leHBvcnQgY29uc3QgSElERV9SRUxBVEVEID0gJ0hJREVfUkVMQVRFRCc7XG5leHBvcnQgY29uc3QgQ0xFQVJfU0VTU0lPTiA9ICdDTEVBUl9TRVNTSU9OJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFydGlzdERhdGFBdmFpbGFibGUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9EQVRBX0FWQUlMQUJMRSxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlYXJjaFRlcm0oc2VhcmNoVGVybSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNFQVJDSF9URVJNX1VQREFURSxcblx0XHRzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0ZWRDbGljaygpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBSRUxBVEVEX0NMSUNLXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dSZWxhdGVkKHJlbGF0ZWRBcnRpc3QpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTSE9XX1JFTEFURUQsXG5cdFx0ZGF0YTogcmVsYXRlZEFydGlzdFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaWRlUmVsYXRlZCgpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBISURFX1JFTEFURUQsXG5cdFx0ZGF0YTogbnVsbFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclNlc3Npb24oKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQ0xFQVJfU0VTU0lPTlxuXHR9XG59XG4iLCJpbXBvcnQge1xuXHRTRUFSQ0hfVEVSTV9VUERBVEUsIEFSVElTVF9EQVRBX0FWQUlMQUJMRSwgUkVMQVRFRF9DTElDSywgU0hPV19SRUxBVEVELCBISURFX1JFTEFURUQsXG5cdENMRUFSX1NFU1NJT05cbn0gZnJvbSAnLi4vYWN0aW9ucydcbmxldCBpbml0aWFsU3RhdGUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdzdGF0ZScpO1xuY29uc3QgZW1wdHlBcnRpc3QgPSB7XG5cdGlkOiAnJyxcblx0bmFtZTogJycsXG5cdGltZ1VybDogJycsXG5cdGdlbnJlczogW10sXG5cdHBvcHVsYXJpdHk6IDAsXG5cdGltYWdlczogW11cbn07XG5jb25zdCBlbXB0eVN0YXRlID0ge1xuXHRhcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRzZWFyY2hUZXJtOiAnJyxcblx0dmlzaXRlZEFydGlzdHM6IFtdLFxuXHRoaWRlSW5mbzogdHJ1ZSxcblx0cmVsYXRlZEFydGlzdDogZW1wdHlBcnRpc3QsXG5cdHNob3dSZWxhdGVkOiBmYWxzZVxufTtcblxuaWYgKCFpbml0aWFsU3RhdGUpIHtcblx0aW5pdGlhbFN0YXRlID0ge1xuXHRcdC4uLmVtcHR5U3RhdGVcblx0fTtcbn0gZWxzZSB7XG5cdGluaXRpYWxTdGF0ZSA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc3RhdGUnKSk7XG59XG5cbmNvbnN0IGFydGlzdFNlYXJjaCA9IChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSA9PiB7XG5cdGxldCBuZXdTdGF0ZTtcblx0c3dpdGNoIChhY3Rpb24udHlwZSkge1xuXHRcdGNhc2UgU0VBUkNIX1RFUk1fVVBEQVRFOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uc2VhcmNoVGVybSxcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFSVElTVF9EQVRBX0FWQUlMQUJMRTpcblx0XHRcdGlmIChhY3Rpb24uZGF0YS5pZCkge1xuXHRcdFx0XHRsZXQgYWxyZWFkeVZpc2l0ZWQgPSAhIXN0YXRlLnZpc2l0ZWRBcnRpc3RzLmxlbmd0aCAmJiBzdGF0ZS52aXNpdGVkQXJ0aXN0cy5zb21lKChhcnRpc3QpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBhcnRpc3QuaWQgPT09IGFjdGlvbi5kYXRhLmlkO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRsZXQgdmlzaXRlZEFydGlzdHMgPSBhbHJlYWR5VmlzaXRlZCA/IHN0YXRlLnZpc2l0ZWRBcnRpc3RzIDogWy4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLCBhY3Rpb24uZGF0YV07XG5cdFx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRcdGFydGlzdDogYWN0aW9uLmRhdGEsXG5cdFx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHRcdC4uLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLmRhdGEubmFtZSxcblx0XHRcdFx0XHRoaWRlSW5mbzogZmFsc2UsXG5cdFx0XHRcdFx0aGlkZVJlbGF0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdFx0Li4uZW1wdHlBcnRpc3Rcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ05vIEFQSSBkYXRhIGF2YWlsYWJsZSBmb3IgZ2l2ZW4gYXJ0aXN0LiBOZWVkIHRvIHJlZnJlc2ggQVBJIHNlc3Npb24/Jyk7XG5cdFx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFJFTEFURURfQ0xJQ0s6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdGhpZGVJbmZvOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBTSE9XX1JFTEFURUQ6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHJlbGF0ZWRBcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRoaWRlUmVsYXRlZDogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEhJREVfUkVMQVRFRDpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdC4uLmVtcHR5QXJ0aXN0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhpZGVSZWxhdGVkOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBDTEVBUl9TRVNTSU9OOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLmVtcHR5U3RhdGVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0bmV3U3RhdGUgPSBzdGF0ZTtcblx0fVxuXHR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnc3RhdGUnLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSkpO1xuXHRyZXR1cm4gbmV3U3RhdGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhcnRpc3RTZWFyY2g7IiwiaW1wb3J0IHtjcmVhdGVTdG9yZX0gZnJvbSAncmVkdXgnO1xuaW1wb3J0IGFydGlzdFNlYXJjaCBmcm9tIFwiLi9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoXCI7XG5cbmV4cG9ydCBsZXQgc3RvcmUgPSBjcmVhdGVTdG9yZShcblx0YXJ0aXN0U2VhcmNoLFxuXHR3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXyAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXygpXG4pO1xuXG5cbiJdfQ==
