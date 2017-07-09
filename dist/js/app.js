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

},{"./components/app.component.jsx":7,"./state/store":22,"react":undefined,"react-dom":undefined,"react-redux":undefined}],2:[function(require,module,exports){
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
			var loader = new THREE.FontLoader();
			loader.load('./js/fonts/helvetiker_regular.typeface.json', function (font) {
				return HELVETIKER = font;
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
				relatedArtistSphere.artistObj = relatedArtist;
				relatedArtistSphere.radius = radius;
				relatedArtistSphere.isRelatedArtistSphere = true;
				relatedArtistSphere.isSphere = true;
				relatedArtistSphere.distance = _statistics.Statistics.getSharedGenreMetric(artist, relatedArtist);
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
			var lightA = new THREE.DirectionalLight(0xffffff, 1.725);
			var lightB = new THREE.DirectionalLight(0xffffff, 1.5);
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

},{"../config/colours":13,"./props":3,"./statistics.class":6,"three":undefined}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpheresScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sceneUtils = require("./scene-utils.class");

var _colours = require("../config/colours");

var _motionLab = require("./motion-lab.class");

var _musicData = require("../services/music-data.service");

var _props = require("./props");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * SpheresScene is designed to handle adding and removing entities from the scene,
 * and handling events.
 *
 * It aims to deal not with changes over time, only immediate changes in one frame.
 */
var SpheresScene = exports.SpheresScene = function () {
	function SpheresScene(container) {
		_classCallCheck(this, SpheresScene);

		_sceneUtils.SceneUtils.init();
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
					isOverRelated = true;
					selected.material.color.setHex(_colours.Colours.relatedArtistHover);
				}
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
					this.getRelatedArtist(selected);
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

},{"../config/colours":13,"../services/music-data.service":19,"./motion-lab.class":2,"./props":3,"./scene-utils.class":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
				value: true
});
exports.Statistics = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sceneUtils = require('./scene-utils.class');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DISTANCE_SCALAR = 50;
var SIZE_SCALAR = 1.5;

var Statistics = exports.Statistics = function () {
				function Statistics() {
								_classCallCheck(this, Statistics);
				}

				_createClass(Statistics, null, [{
								key: 'getArtistSphereSize',
								value: function getArtistSphereSize(artist) {
												return Math.max(40, artist.popularity * SIZE_SCALAR);
								}

								/**
            * Map-reduce of two string arrays
         * @param artist
         * @param relatedArtist
         * @returns {number}
         */

				}, {
								key: 'getSharedGenreMetric',
								value: function getSharedGenreMetric(artist, relatedArtist) {
												var matches = artist.genres.map(function (mainArtistGenre) {
																return Statistics.matchArtistToRelatedGenres(mainArtistGenre, relatedArtist);
												}).reduce(function (accumulator, match) {
																if (match) {
																				accumulator.push(match);
																}
																return accumulator;
												}, []);
												return Math.max(300, matches.length * DISTANCE_SCALAR);
								}
				}, {
								key: 'matchArtistToRelatedGenres',
								value: function matchArtistToRelatedGenres(mainArtistGenre, relatedArtist) {
												return relatedArtist.genres.find(function (genre) {
																return genre === mainArtistGenre;
												});
								}
				}]);

				return Statistics;
}();

},{"./scene-utils.class":4}],7:[function(require,module,exports){
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

},{"../containers/artist-info.container":14,"../containers/artist-list.container":15,"../containers/scene.container":16,"../containers/search-input.container":17,"../containers/spotify-player.container":18,"react":undefined}],8:[function(require,module,exports){
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
			{ className: 'pill', key: genre },
			genre
		);
	});
	if (artist.id) {
		artistInfoMarkup = React.createElement(
			'div',
			{ className: 'info-container' },
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
				React.createElement(
					'span',
					{ className: 'title' },
					'Genres:'
				),
				' ',
				genres
			)
		);
	}
	return React.createElement(
		'div',
		null,
		artistInfoMarkup
	);
}

},{"../state/store":22,"react":undefined}],9:[function(require,module,exports){
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
	var visitedArtists = _ref.visitedArtists,
	    handleGetArtist = _ref.handleGetArtist;

	var artists = visitedArtists.map(function (artist) {
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
						handleGetArtist(event, artist.id);
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
	return React.createElement(
		'div',
		{ className: 'artist-navigation' },
		artists
	);
}

},{"../state/store":22,"react":undefined}],10:[function(require,module,exports){
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

			var artist = this.props.artist;

			if (artist.id) {
				this.scene.composeScene(artist);
			}
			return React.createElement('div', { className: 'spheres-scene',
				ref: function ref(elem) {
					return _this2.sceneDom = elem;
				}
			});
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.scene = new _spheresScene.SpheresScene(this.sceneDom);
			this.sceneDom.addEventListener('contextmenu', function (event) {
				return event.preventDefault();
			}); // remove right click
			this.sceneDom.addEventListener('click', this, true);
			this.sceneDom.addEventListener('mousewheel', this, true);
			this.sceneDom.addEventListener('mousemove', this, true);
			this.sceneDom.addEventListener('mousedown', this, true);
			this.sceneDom.addEventListener('mouseup', this, true);
			window.addEventListener('resize', this, false);
		}
	}, {
		key: 'handleEvent',
		value: function handleEvent(event) {
			this[event.type](event);
		}
	}, {
		key: 'click',
		value: function click(event) {
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
			var _this3 = this;

			this.sceneDom.className = 'spheres-scene grab';
			window.setTimeout(function () {
				_this3.mouseIsDown = false;
			}, 100);
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

},{"../classes/scene-utils.class":4,"../classes/spheres-scene.class":5,"../state/store":22,"react":undefined}],11:[function(require,module,exports){
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

},{"react":undefined}],12:[function(require,module,exports){
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
			{ className: 'spotify-player' },
			React.createElement('iframe', { src: artistEmbedUrl, width: '300', height: '80' })
		);
	}
	return React.createElement(
		'div',
		{ className: 'spotify-player-container' },
		iFrameMarkup
	);
}

},{"react":undefined}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../components/artist-info.component":8,"react-redux":undefined}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require("react-redux");

var _artistList = require("../components/artist-list.component");

var _musicData = require("../services/music-data.service");

var mapStateToProps = function mapStateToProps(state) {
	return {
		visitedArtists: state.visitedArtists
	};
};

var mapDispatchToProps = function mapDispatchToProps() {
	return {
		handleGetArtist: function handleGetArtist(evt, artistId) {
			evt.preventDefault();
			_musicData.MusicDataService.getArtist(artistId);
		}
	};
};

var ArtistListContainer = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_artistList.ArtistListComponent);

exports.default = ArtistListContainer;

},{"../components/artist-list.component":9,"../services/music-data.service":19,"react-redux":undefined}],16:[function(require,module,exports){
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

},{"../components/scene.component":10,"react-redux":undefined}],17:[function(require,module,exports){
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
		handleSearch: function handleSearch(evt, artistName) {
			evt.preventDefault();
			_musicData.MusicDataService.search(artistName);
		},
		handleSearchTermUpdate: function handleSearchTermUpdate(evt) {
			dispatch((0, _actions.updateSearchTerm)(evt.target.value));
		}
	};
};

var SearchContainer = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_searchInputComponent.SearchInputComponent);

exports.default = SearchContainer;

},{"../components/search-input.component.jsx":11,"../services/music-data.service":19,"../state/actions":20,"react-redux":undefined}],18:[function(require,module,exports){
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

},{"../components/spotify-player.component":12,"react-redux":undefined}],19:[function(require,module,exports){
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

},{"../state/actions":20,"../state/store":22}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.artistDataAvailable = artistDataAvailable;
exports.updateSearchTerm = updateSearchTerm;
var ARTIST_DATA_AVAILABLE = exports.ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';

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

},{}],21:[function(require,module,exports){
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
		case _actions.ARTIST_DATA_AVAILABLE:
			if (action.data.id) {
				var alreadyVisited = !!state.visitedArtists.length && state.visitedArtists.some(function (artist) {
					return artist.id === action.data.id;
				});
				var visitedArtists = alreadyVisited ? state.visitedArtists : [].concat(_toConsumableArray(state.visitedArtists), [action.data]);
				return _extends({}, state, {
					artist: action.data,
					visitedArtists: [].concat(_toConsumableArray(visitedArtists)),
					searchTerm: action.data.name
				});
			} else {
				console.warn('No API data available for given artist. Need to refresh API session?');
				return state;
			}
		default:
			return state;
	}
};

exports.default = artistSearch;

},{"../actions":20}],22:[function(require,module,exports){
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

},{"./reducers/artist-search":21,"redux":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXIuanMiLCJzcmMvanMvc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlLmpzIiwic3JjL2pzL3N0YXRlL2FjdGlvbnMuanMiLCJzcmMvanMvc3RhdGUvcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaC5qcyIsInNyYy9qcy9zdGF0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O0FBSVAsVUFBUSxFQUpEO0FBS1AsY0FBWSxDQUxMO0FBTVAsVUFBUTtBQU5ELEVBRFk7QUFTcEIsYUFBWSxFQVRRO0FBVXBCLGlCQUFnQjtBQVZJLENBQXJCOztBQWFBLElBQU0sZUFBZSxTQUFmLFlBQWUsR0FBa0M7QUFBQSxLQUFqQyxLQUFpQyx1RUFBekIsWUFBeUI7QUFBQSxLQUFYLE1BQVc7O0FBQ3RELFNBQVEsT0FBTyxJQUFmO0FBQ0M7QUFDQyx1QkFDSSxLQURKO0FBRUMsZ0JBQVksT0FBTztBQUZwQjtBQUlEO0FBQ0MsT0FBSSxPQUFPLElBQVAsQ0FBWSxFQUFoQixFQUFvQjtBQUNuQixRQUFJLGlCQUFpQixDQUFDLENBQUMsTUFBTSxjQUFOLENBQXFCLE1BQXZCLElBQWlDLE1BQU0sY0FBTixDQUFxQixJQUFyQixDQUEwQixVQUFDLE1BQUQsRUFBWTtBQUMxRixZQUFPLE9BQU8sRUFBUCxLQUFjLE9BQU8sSUFBUCxDQUFZLEVBQWpDO0FBQ0EsS0FGb0QsQ0FBdEQ7QUFHQSxRQUFJLGlCQUFpQixpQkFBaUIsTUFBTSxjQUF2QixnQ0FBNEMsTUFBTSxjQUFsRCxJQUFrRSxPQUFPLElBQXpFLEVBQXJCO0FBQ0Esd0JBQ0ksS0FESjtBQUVDLGFBQVEsT0FBTyxJQUZoQjtBQUdDLGtEQUNJLGNBREosRUFIRDtBQU1DLGlCQUFZLE9BQU8sSUFBUCxDQUFZO0FBTnpCO0FBUUEsSUFiRCxNQWFPO0FBQ04sWUFBUSxJQUFSLENBQWEsc0VBQWI7QUFDQSxXQUFPLEtBQVA7QUFDQTtBQUNGO0FBQ0MsVUFBTyxLQUFQO0FBekJGO0FBMkJBLENBNUJEOztrQkE4QmUsWTs7Ozs7Ozs7OztBQzdDZjs7QUFDQTs7Ozs7O0FBRU8sSUFBSSx3QkFBUSxnREFFbEIsT0FBTyw0QkFBUCxJQUF1QyxPQUFPLDRCQUFQLEVBRnJCLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0FwcENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG5cdFx0PEFwcENvbXBvbmVudCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTsiLCIvKipcbiAqIE1vdGlvbkxhYiBkZWFscyB3aXRoIGNvbnRyb2xsaW5nIGVhY2ggdGljayBvZiB0aGUgYW5pbWF0aW9uIGZyYW1lIHNlcXVlbmNlXG4gKiBJdCdzIGFpbSBpcyB0byBpc29sYXRlIGNvZGUgdGhhdCBoYXBwZW5zIG92ZXIgYSBudW1iZXIgb2YgZnJhbWVzIChpLmUuIG1vdGlvbilcbiAqL1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY29uc3QgVFJBQ0tfQ0FNX1RPX09CSiA9ICdUUkFDS19DQU1fVE9fT0JKJztcbmNvbnN0IERFRkFVTFQgPSAnREVGQVVMVCc7XG5jb25zdCBkZWZhdWx0Sm9iID0ge1xuXHR0eXBlOiBERUZBVUxUXG59O1xuXG5leHBvcnQgY2xhc3MgTW90aW9uTGFiIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdFx0dGhpcy5hbmltYXRlKCk7XG5cdH1cblxuXHRhbmltYXRlKCkge1xuXHRcdFByb3BzLnQyID0gRGF0ZS5ub3coKTtcblx0XHR0aGlzLnByb2Nlc3NTY2VuZSgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnJlbmRlcihQcm9wcy5zY2VuZSwgUHJvcHMuY2FtZXJhKTtcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdFByb3BzLnQxID0gUHJvcHMudDI7XG5cdFx0XHR0aGlzLmFuaW1hdGUuY2FsbCh0aGlzKTtcblx0XHR9KTtcblx0fVxuXG5cdHByb2Nlc3NTY2VuZSgpIHtcblx0XHRzd2l0Y2ggKHRoaXMuam9iLnR5cGUpIHtcblx0XHRcdGNhc2UgVFJBQ0tfQ0FNX1RPX09CSjpcblx0XHRcdFx0dGhpcy50cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBERUZBVUxUOlxuXHRcdFx0XHR0aGlzLnVwZGF0ZVJvdGF0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKSB7XG5cdFx0Y29uc3Qgc2hvdWxkRW5kID0gcGFyc2VJbnQodGhpcy5qb2IuY3VycmVudFRpbWUpID09PSAxO1xuXHRcdGlmICghc2hvdWxkRW5kKSB7XG5cdFx0XHR0aGlzLmZvbGxvd1BhdGgoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmVuZEFuaW1hdGlvbigpO1xuXHRcdH1cblx0fVxuXG5cdGZvbGxvd1BhdGgoKSB7XG5cdFx0Y29uc3QgcCA9IHRoaXMuam9iLnBhdGguZ2V0UG9pbnQodGhpcy5qb2IuY3VycmVudFRpbWUpO1xuXHRcdHRoaXMuam9iLm9iamVjdDNELnBvc2l0aW9uLmNvcHkocCk7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgKz0gMC4wMTtcblx0fVxuXG5cdGVuZEFuaW1hdGlvbigpIHtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayAmJiB0aGlzLmpvYi5jYWxsYmFjaygpO1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0fVxuXG5cdHRyYWNrT2JqZWN0VG9DYW1lcmEob2JqZWN0M0QsIGNhbGxiYWNrKSB7XG4gICAgXHR0aGlzLmpvYiA9IHt9O1xuICAgIFx0dGhpcy5qb2IudHlwZSA9IFRSQUNLX0NBTV9UT19PQko7XG5cdFx0dGhpcy5qb2IudCA9IDAuMDtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSA9IDAuMDtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMuam9iLm9iamVjdDNEID0gb2JqZWN0M0Q7XG5cdFx0dGhpcy5qb2IuZW5kZWQgPSBmYWxzZTtcblx0XHR0aGlzLmpvYi5wYXRoID0gbmV3IFRIUkVFLkNhdG11bGxSb21DdXJ2ZTMoW1xuXHRcdFx0b2JqZWN0M0QucG9zaXRpb24uY2xvbmUoKSxcblx0XHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpXG5cdFx0XSk7XG5cdH1cblxuXHQvKipcblx0ICogVE9ETzogb3B0aW1pc2F0aW9uIC0gb25seSB1c2UgdXBkYXRlUm90YXRpb24oKSBpZiB0aGUgbW91c2UgaXMgZHJhZ2dpbmcgLyBzcGVlZCBpcyBhYm92ZSBkZWZhdWx0IG1pbmltdW1cblx0ICogUm90YXRpb24gb2YgY2FtZXJhIGlzICppbnZlcnNlKiBvZiBtb3VzZSBtb3ZlbWVudCBkaXJlY3Rpb25cblx0ICovXG5cdHVwZGF0ZVJvdGF0aW9uKCkge1xuXHRcdGNvbnN0IGNhbVF1YXRlcm5pb25VcGRhdGUgPSB0aGlzLmdldE5ld0NhbWVyYURpcmVjdGlvbigpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueSAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS56ICogUHJvcHMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuY2FtZXJhTG9va0F0KTtcblx0XHQvLyB1cGRhdGUgcm90YXRpb24gb2YgdGV4dCBhdHRhY2hlZCBvYmplY3RzLCB0byBmb3JjZSB0aGVtIHRvIGxvb2sgYXQgY2FtZXJhXG5cdFx0Ly8gdGhpcyBtYWtlcyB0aGVtIHJlYWRhYmxlXG5cdFx0UHJvcHMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0b2JqLmxvb2tBdChQcm9wcy5ncmFwaENvbnRhaW5lci53b3JsZFRvTG9jYWwoUHJvcHMuY2FtZXJhLnBvc2l0aW9uKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5yZWR1Y2VTcGVlZCgwLjAwMDUpO1xuXHR9XG5cblx0Z2V0TmV3Q2FtZXJhRGlyZWN0aW9uKCkge1xuXHRcdGxldCBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHRcdGNvbnN0IHlNb3JlVGhhblhNb3VzZSA9IFByb3BzLm1vdXNlUG9zRGlmZlkgPj0gUHJvcHMubW91c2VQb3NEaWZmWDtcblx0XHRjb25zdCB4TW9yZVRoYW5ZTW91c2UgPSAheU1vcmVUaGFuWE1vdXNlO1xuXHRcdGlmIChQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54IC09IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIVByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggKz0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55ICs9IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIVByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgLT0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlID0gU2NlbmVVdGlscy5yZW5vcm1hbGl6ZVF1YXRlcm5pb24oUHJvcHMuY2FtZXJhKTtcblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnNldEZyb21FdWxlcihQcm9wcy5jYW1lcmFSb3RhdGlvbik7XG5cdFx0cmV0dXJuIGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdH1cblxuXHRyZWR1Y2VTcGVlZChhbW91bnQpIHtcblx0XHRpZiAoUHJvcHMuc3BlZWRYID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWCAtPSBhbW91bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLnNwZWVkWSA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFkgLT0gYW1vdW50O1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5leHBvcnQgY29uc3QgUHJvcHMgPSB7XG5cdHJlbmRlcmVyOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBhbHBoYTogdHJ1ZX0pLFxuXHRzY2VuZTogbmV3IFRIUkVFLlNjZW5lKCksXG5cdGNhbWVyYTogbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgNTAwLCAxNTAwMDApLFxuXHRncmFwaENvbnRhaW5lcjogbmV3IFRIUkVFLk9iamVjdDNEKCksXG5cdGNhbWVyYVJvdGF0aW9uOiBuZXcgVEhSRUUuRXVsZXIoMCwgLTEsIDApLFxuXHRjYW1lcmFMb29rQXQ6IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXHRjYW1lcmFEaXN0YW5jZTogMzUwMCxcblx0XG5cdHQxOiAwLjAsIC8vIG9sZCB0aW1lXG5cdHQyOiAwLjAsIC8vIG5vdyB0aW1lXG5cdHNwZWVkWDogMC4wMDUsXG5cdHNwZWVkWTogMC4wMDAsXG5cdG1vdXNlUG9zRGlmZlg6IDAuMCxcblx0bW91c2VQb3NEaWZmWTogMC4wLFxuXHRtb3VzZVBvc1hJbmNyZWFzZWQ6IGZhbHNlLFxuXHRtb3VzZVBvc1lJbmNyZWFzZWQ6IGZhbHNlLFxuXHRyYXljYXN0ZXI6IG5ldyBUSFJFRS5SYXljYXN0ZXIoKSxcblx0bW91c2VWZWN0b3I6IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFxuXHRyZWxhdGVkQXJ0aXN0U3BoZXJlczogW10sXG5cdG1haW5BcnRpc3RTcGhlcmU6IHt9XG59OyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5pbXBvcnQge1Byb3BzfSBmcm9tIFwiLi9wcm9wc1wiO1xuaW1wb3J0IHtTdGF0aXN0aWNzfSBmcm9tIFwiLi9zdGF0aXN0aWNzLmNsYXNzXCI7XG5cbmxldCBIRUxWRVRJS0VSO1xuY29uc3QgTUFJTl9BUlRJU1RfRk9OVF9TSVpFID0gMzQ7XG5jb25zdCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUgPSAyMDtcbmNvbnN0IFRPVEFMX1JFTEFURUQgPSAxMDtcblxuY2xhc3MgU2NlbmVVdGlscyB7XG5cdHN0YXRpYyBpbml0KCkge1xuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0bG9hZGVyLmxvYWQoJy4vanMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nLCAoZm9udCkgPT4gSEVMVkVUSUtFUiA9IGZvbnQpO1xuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYSAtIG1pblxuXHQgKiBAcGFyYW0gYiAtIG1heFxuXHQgKiBAcGFyYW0gYyAtIHZhbHVlIHRvIGNsYW1wXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgY2xhbXAoYSwgYiwgYykge1xuXHRcdHJldHVybiBNYXRoLm1heChiLCBNYXRoLm1pbihjLCBhKSk7XG5cdH1cblxuXHQvKipcblx0ICogR2l2ZW4gcG9zaXRpdmUgeCByZXR1cm4gMSwgbmVnYXRpdmUgeCByZXR1cm4gLTEsIG9yIDAgb3RoZXJ3aXNlXG5cdCAqIEBwYXJhbSB4XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgc2lnbihuKSB7XG5cdFx0cmV0dXJuIG4gPiAwID8gMSA6IG4gPCAwID8gLTEgOiAwO1xuXHR9O1xuXHRcblx0c3RhdGljIHJlbm9ybWFsaXplUXVhdGVybmlvbihvYmplY3QpIHtcblx0XHRsZXQgY2xvbmUgPSBvYmplY3QuY2xvbmUoKTtcblx0XHRsZXQgcSA9IGNsb25lLnF1YXRlcm5pb247XG5cdFx0bGV0IG1hZ25pdHVkZSA9IE1hdGguc3FydChNYXRoLnBvdyhxLncsIDIpICsgTWF0aC5wb3cocS54LCAyKSArIE1hdGgucG93KHEueSwgMikgKyBNYXRoLnBvdyhxLnosIDIpKTtcblx0XHRxLncgLz0gbWFnbml0dWRlO1xuXHRcdHEueCAvPSBtYWduaXR1ZGU7XG5cdFx0cS55IC89IG1hZ25pdHVkZTtcblx0XHRxLnogLz0gbWFnbml0dWRlO1xuXHRcdHJldHVybiBxO1xuXHR9XG5cblx0c3RhdGljIGdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoZ3JhcGgsIHJheWNhc3RlciwgY2FtZXJhKSB7XG5cdFx0cmF5Y2FzdGVyLnNldEZyb21DYW1lcmEoUHJvcHMubW91c2VWZWN0b3IsIGNhbWVyYSk7XG5cdFx0cmV0dXJuIHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKGdyYXBoLmNoaWxkcmVuLCB0cnVlKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRNb3VzZVZlY3RvcihldmVudCkge1xuXHRcdHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMigoZXZlbnQuY2xpZW50WCAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGgpICogMiAtIDEsXG5cdFx0XHQtKGV2ZW50LmNsaWVudFkgLyBQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMSk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlTWFpbkFydGlzdFNwaGVyZShhcnRpc3QpIHtcblx0XHRsZXQgcmFkaXVzID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCk7XG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgMzUsIDM1KTtcblx0XHRsZXQgc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5tYWluQXJ0aXN0fSkpO1xuXHRcdHNwaGVyZS5hcnRpc3RPYmogPSBhcnRpc3Q7XG5cdFx0c3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRzcGhlcmUuaXNNYWluQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRzcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdFNjZW5lVXRpbHMuYWRkVGV4dChhcnRpc3QubmFtZSwgTUFJTl9BUlRJU1RfRk9OVF9TSVpFLCBzcGhlcmUpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBtYWluQXJ0aXN0U3BoZXJlKSB7XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkgPSBbXTtcblx0XHRsZXQgcmVsYXRlZEFydGlzdDtcblx0XHRsZXQgc3BoZXJlRmFjZUluZGV4ID0gMDtcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIFRPVEFMX1JFTEFURUQgLSAxKTtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbihUT1RBTF9SRUxBVEVELCBhcnRpc3QucmVsYXRlZC5sZW5ndGgpOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHJlbGF0ZWRBcnRpc3QgPSBhcnRpc3QucmVsYXRlZFtpXTtcblx0XHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iaiA9IHJlbGF0ZWRBcnRpc3Q7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNSZWxhdGVkQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5kaXN0YW5jZSA9IFN0YXRpc3RpY3MuZ2V0U2hhcmVkR2VucmVNZXRyaWMoYXJ0aXN0LCByZWxhdGVkQXJ0aXN0KTtcblx0XHRcdHNwaGVyZUZhY2VJbmRleCArPSBzdGVwO1xuXHRcdFx0U2NlbmVVdGlscy5wb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZEFydGlzdFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KTtcblx0XHRcdFNjZW5lVXRpbHMuam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRTY2VuZVV0aWxzLmFkZFRleHQocmVsYXRlZEFydGlzdC5uYW1lLCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0cmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheS5wdXNoKHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheTtcblx0fVxuXG5cdHN0YXRpYyBhcHBlbmRPYmplY3RzVG9TY2VuZShncmFwaENvbnRhaW5lciwgc3BoZXJlLCBzcGhlcmVBcnJheSkge1xuXHRcdGNvbnN0IHBhcmVudCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXHRcdHBhcmVudC5uYW1lID0gJ3BhcmVudCc7XG5cdFx0cGFyZW50LmFkZChzcGhlcmUpO1xuXHRcdGlmIChzcGhlcmVBcnJheSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGhlcmVBcnJheS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRwYXJlbnQuYWRkKHNwaGVyZUFycmF5W2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Z3JhcGhDb250YWluZXIuYWRkKHBhcmVudCk7XG5cdH1cblxuXHRzdGF0aWMgam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSkge1xuXHRcdGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZExpbmVKb2lufSk7XG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0bGV0IGxpbmU7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChyZWxhdGVkU3BoZXJlLnBvc2l0aW9uLmNsb25lKCkpO1xuXHRcdGxpbmUgPSBuZXcgVEhSRUUuTGluZShnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXHRcdG1haW5BcnRpc3RTcGhlcmUuYWRkKGxpbmUpO1xuXHR9XG5cblx0c3RhdGljIHBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpIHtcblx0XHRsZXQgbWFpbkFydGlzdFNwaGVyZUZhY2UgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzW01hdGguZmxvb3Ioc3BoZXJlRmFjZUluZGV4KV0ubm9ybWFsLmNsb25lKCk7XG5cdFx0cmVsYXRlZFNwaGVyZS5wb3NpdGlvblxuXHRcdFx0LmNvcHkobWFpbkFydGlzdFNwaGVyZUZhY2UubXVsdGlwbHkobmV3IFRIUkVFLlZlY3RvcjMoXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2Vcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgYWRkVGV4dChsYWJlbCwgc2l6ZSwgc3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsRnJvbnQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRPdXRlcn0pO1xuXHRcdGxldCBtYXRlcmlhbFNpZGUgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRJbm5lcn0pO1xuXHRcdGxldCBtYXRlcmlhbEFycmF5ID0gW21hdGVyaWFsRnJvbnQsIG1hdGVyaWFsU2lkZV07XG5cdFx0bGV0IHRleHRHZW9tID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeShsYWJlbCwge1xuXHRcdFx0Zm9udDogSEVMVkVUSUtFUixcblx0XHRcdHNpemU6IHNpemUsXG5cdFx0XHRjdXJ2ZVNlZ21lbnRzOiA0LFxuXHRcdFx0YmV2ZWxFbmFibGVkOiB0cnVlLFxuXHRcdFx0YmV2ZWxUaGlja25lc3M6IDIsXG5cdFx0XHRiZXZlbFNpemU6IDEsXG5cdFx0XHRiZXZlbFNlZ21lbnRzOiAzXG5cdFx0fSk7XG5cdFx0bGV0IHRleHRNZXNoID0gbmV3IFRIUkVFLk1lc2godGV4dEdlb20sIG1hdGVyaWFsQXJyYXkpO1xuXHRcdHRleHRNZXNoLmlzVGV4dCA9IHRydWU7XG5cdFx0c3BoZXJlLmFkZCh0ZXh0TWVzaCk7XG5cdFx0dGV4dE1lc2gucG9zaXRpb24uc2V0KC1zcGhlcmUucmFkaXVzLCAtKHNwaGVyZS5yYWRpdXMgKyBzaXplICogMiksIC1zcGhlcmUucmFkaXVzIC8gMik7XG5cdH1cblxuXHRzdGF0aWMgbGlnaHRpbmcoKSB7XG5cdFx0bGV0IGxpZ2h0QSA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAxLjcyNSk7XG5cdFx0bGV0IGxpZ2h0QiA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAxLjUpO1xuXHRcdGxpZ2h0QS5wb3NpdGlvbi5zZXRYKDUwMCk7XG5cdFx0bGlnaHRCLnBvc2l0aW9uLnNldFkoLTgwMCk7XG5cdFx0bGlnaHRCLnBvc2l0aW9uLnNldFgoLTUwMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKGxpZ2h0QSk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKGxpZ2h0Qik7XG5cdH1cbn1cblxuZXhwb3J0IHsgU2NlbmVVdGlscyB9XG4iLCJpbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gXCIuLi9jb25maWcvY29sb3Vyc1wiO1xuaW1wb3J0IHtNb3Rpb25MYWJ9IGZyb20gXCIuL21vdGlvbi1sYWIuY2xhc3NcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5cbi8qKlxuICogU3BoZXJlc1NjZW5lIGlzIGRlc2lnbmVkIHRvIGhhbmRsZSBhZGRpbmcgYW5kIHJlbW92aW5nIGVudGl0aWVzIGZyb20gdGhlIHNjZW5lLFxuICogYW5kIGhhbmRsaW5nIGV2ZW50cy5cbiAqXG4gKiBJdCBhaW1zIHRvIGRlYWwgbm90IHdpdGggY2hhbmdlcyBvdmVyIHRpbWUsIG9ubHkgaW1tZWRpYXRlIGNoYW5nZXMgaW4gb25lIGZyYW1lLlxuICovXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0U2NlbmVVdGlscy5pbml0KCk7XG5cdFx0dGhpcy5tb3Rpb25MYWIgPSBuZXcgTW90aW9uTGFiKCk7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMSwgNSwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGNvbnN0IGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyk7XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRsZXQgaW50ZXJzZWN0cztcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7IC8vIHJlc2V0IHRoZSByZWxhdGVkIHNwaGVyZSB0byByZWRcblx0XHRcdFx0b2JqLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7IC8vIG1vdXNlIGlzIG92ZXIgYSBNZXNoXG5cdFx0XHRQcm9wcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdHNlbGVjdGVkLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdFx0cmV0dXJuIGlzT3ZlclJlbGF0ZWQ7XG5cdH1cblxuXHRvblNjZW5lTW91c2VEcmFnKGV2ZW50KSB7XG5cdFx0Y29uc3QgZHQgPSBQcm9wcy50MiAtIFByb3BzLnQxO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VQb3NYSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnggPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci54KTtcblx0XHRQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueSA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlggPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci54KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLngpKTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueSkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci55KSk7XG5cdFx0UHJvcHMuc3BlZWRYID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWCkgLyBkdCk7XG5cdFx0UHJvcHMuc3BlZWRZID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWSkgLyBkdCk7XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0dGhpcy5nZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgc2VsZWN0ZWRTcGhlcmUpO1xuXHRcdHRoaXMubW90aW9uTGFiLnRyYWNrT2JqZWN0VG9DYW1lcmEoc2VsZWN0ZWRTcGhlcmUsICgpID0+IHtcblx0XHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqLmlkKTtcblx0XHR9KTtcblx0fVxuXG5cdGNsZWFyR3JhcGgoKSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gUHJvcHMuZ3JhcGhDb250YWluZXIuZ2V0T2JqZWN0QnlOYW1lKCdwYXJlbnQnKTtcblx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5yZW1vdmUocGFyZW50KTtcblx0XHR9XG5cdH1cblxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVDYW1lcmFBc3BlY3QoKSB7XG5cdFx0UHJvcHMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdFByb3BzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufSIsImNvbnN0IERJU1RBTkNFX1NDQUxBUiA9IDUwO1xuY29uc3QgU0laRV9TQ0FMQVIgPSAxLjU7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gJy4vc2NlbmUtdXRpbHMuY2xhc3MnO1xuXG5leHBvcnQgY2xhc3MgU3RhdGlzdGljcyB7XG4gICAgc3RhdGljIGdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCg0MCwgYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUik7XG4gICAgfVxuXG5cdC8qKlxuICAgICAqIE1hcC1yZWR1Y2Ugb2YgdHdvIHN0cmluZyBhcnJheXNcblx0ICogQHBhcmFtIGFydGlzdFxuXHQgKiBAcGFyYW0gcmVsYXRlZEFydGlzdFxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIGdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCkge1xuXHRcdGxldCBtYXRjaGVzID0gYXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLm1hcCgobWFpbkFydGlzdEdlbnJlKSA9PiBTdGF0aXN0aWNzLm1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkpXG4gICAgICAgICAgICAucmVkdWNlKChhY2N1bXVsYXRvciwgbWF0Y2gpID0+IHtcblx0XHQgICAgICAgIGlmIChtYXRjaCkge1xuXHRcdCAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHR9XG5cdFx0ICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgICAgICAgICB9LCBbXSk7XG5cdFx0cmV0dXJuIE1hdGgubWF4KDMwMCwgbWF0Y2hlcy5sZW5ndGggKiBESVNUQU5DRV9TQ0FMQVIpO1xuXHR9XG5cblx0c3RhdGljIG1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkge1xuICAgICAgICByZXR1cm4gcmVsYXRlZEFydGlzdC5nZW5yZXNcbiAgICAgICAgICAgIC5maW5kKChnZW5yZSkgPT4gZ2VucmUgPT09IG1haW5BcnRpc3RHZW5yZSk7XG4gICAgfVxuIH0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuaW1wb3J0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyXCI7XG5pbXBvcnQgU2NlbmVDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0TGlzdENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtbGlzdC5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8U2VhcmNoQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNwb3RpZnlQbGF5ZXJDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdEluZm9Db21wb25lbnQoe2FydGlzdH0pIHtcblx0bGV0IGFydGlzdEluZm9NYXJrdXAgPSAnJztcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIiBrZXk9e2dlbnJlfT57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0aWYgKGFydGlzdC5pZCkge1xuXHRcdGFydGlzdEluZm9NYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImluZm8tY29udGFpbmVyXCI+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57YXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+R2VucmVzOjwvc3Bhbj4ge2dlbnJlc308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXHRyZXR1cm4gKFxuXHRcdDxkaXY+e2FydGlzdEluZm9NYXJrdXB9PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdExpc3RDb21wb25lbnQoe3Zpc2l0ZWRBcnRpc3RzLCBoYW5kbGVHZXRBcnRpc3R9KSB7XG5cdGxldCBhcnRpc3RzID0gdmlzaXRlZEFydGlzdHMubWFwKChhcnRpc3QpID0+IHtcblx0XHRsZXQgaHJlZiA9ICcvYXBwLyMnICsgZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdC5pZCk7XG5cdFx0bGV0IGltZ1VybCA9IGFydGlzdC5pbWFnZXMgJiYgYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0bGV0IGltZ1N0eWxlID0geyBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpbWdVcmx9KWAgfTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiXG5cdFx0XHRcdCAgIG9uQ2xpY2s9eyhldmVudCkgPT4geyBoYW5kbGVHZXRBcnRpc3QoZXZlbnQsIGFydGlzdC5pZCkgfX0+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlLWhvbGRlclwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlXCIgc3R5bGU9e2ltZ1N0eWxlfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH0pO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hdmlnYXRpb25cIj5cblx0XHRcdHthcnRpc3RzfVxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuLi9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge1NwaGVyZXNTY2VuZX0gZnJvbSBcIi4uL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzc1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGNvbnN0IHsgYXJ0aXN0IH0gPSB0aGlzLnByb3BzO1xuXHRcdGlmIChhcnRpc3QuaWQpIHtcblx0XHRcdHRoaXMuc2NlbmUuY29tcG9zZVNjZW5lKGFydGlzdCk7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwaGVyZXMtc2NlbmVcIlxuXHRcdFx0XHQgcmVmPXtlbGVtID0+IHRoaXMuc2NlbmVEb20gPSBlbGVtfVxuXHRcdFx0Lz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdGlmICghdGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vtb3ZlKGV2ZW50KSB7XG5cdFx0bGV0IGlzT3ZlclJlbGF0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWInO1xuXHRcdGlmICh0aGlzLm1vdXNlSXNEb3duKSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VEcmFnKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRoaXMuc2NlbmUub25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpO1xuXHRcdH1cblx0XHRpZiAoaXNPdmVyUmVsYXRlZCAmJiAhdGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIHBvaW50ZXInO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pc0RyYWdnaW5nKSB7XG5cdFx0XHR0aGlzLnNjZW5lRG9tLmNsYXNzTmFtZSA9ICdzcGhlcmVzLXNjZW5lIGdyYWJiZWQnO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlZG93bigpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gdHJ1ZTtcblx0fVxuXG5cdG1vdXNldXAoKSB7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHR3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdFx0fSwgMTAwKTtcblx0fVxuXG5cdG1vdXNld2hlZWwoZXZlbnQpIHtcblx0XHRzd2l0Y2ggKFNjZW5lVXRpbHMuc2lnbihldmVudC53aGVlbERlbHRhWSkpIHtcblx0XHRcdGNhc2UgLTE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnb3V0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ2luJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLnNjZW5lLnVwZGF0ZUNhbWVyYUFzcGVjdCgpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgaGFuZGxlU2VhcmNoLCBoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VhcmNoLWZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJhcnRpc3Qtc2VhcmNoXCIgb25TdWJtaXQ9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17c2VhcmNoVGVybX0gb25DaGFuZ2U9e2hhbmRsZVNlYXJjaFRlcm1VcGRhdGV9IC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgb25DbGljaz17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PkdvPC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTcG90aWZ5UGxheWVyQ29tcG9uZW50KHthcnRpc3R9KSB7XG5cdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZC9hcnRpc3QvJztcblx0Y29uc3QgYXJ0aXN0RW1iZWRVcmwgPSBgJHtlbWJlZFVybH0ke2FydGlzdC5pZH1gO1xuXHRsZXQgaUZyYW1lTWFya3VwID0gJyc7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyLWNvbnRhaW5lclwiPlxuXHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHQ8L2Rpdj5cblx0KVxufSIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0c1xuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlR2V0QXJ0aXN0OiAoZXZ0LCBhcnRpc3RJZCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdFx0fSxcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyB1cGRhdGVTZWFyY2hUZXJtIH0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm1cblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBhcnRpc3ROYW1lKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2Uuc2VhcmNoKGFydGlzdE5hbWUpO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHthcnRpc3REYXRhQXZhaWxhYmxlfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBzZWFyY2goYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIlxuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXJ0aXN0KGFydGlzdElkKSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FydGlzdC8nICsgYXJ0aXN0SWQ7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9EQVRBX0FWQUlMQUJMRSA9ICdBUlRJU1RfREFUQV9BVkFJTEFCTEUnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXJ0aXN0RGF0YUF2YWlsYWJsZShkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQVJUSVNUX0RBVEFfQVZBSUxBQkxFLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufSIsImltcG9ydCB7U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEV9IGZyb20gJy4uL2FjdGlvbnMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcblx0YXJ0aXN0OiB7XG5cdFx0aWQ6ICcnLFxuXHRcdG5hbWU6ICcnLFxuXHRcdGltZ1VybDogJycsXG5cdFx0Z2VucmVzOiBbXSxcblx0XHRwb3B1bGFyaXR5OiAwLFxuXHRcdGltYWdlczogW11cblx0fSxcblx0c2VhcmNoVGVybTogJycsXG5cdHZpc2l0ZWRBcnRpc3RzOiBbXVxufTtcblxuY29uc3QgYXJ0aXN0U2VhcmNoID0gKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pID0+IHtcblx0c3dpdGNoIChhY3Rpb24udHlwZSkge1xuXHRcdGNhc2UgU0VBUkNIX1RFUk1fVVBEQVRFOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5zZWFyY2hUZXJtLFxuXHRcdFx0fTtcblx0XHRjYXNlIEFSVElTVF9EQVRBX0FWQUlMQUJMRTpcblx0XHRcdGlmIChhY3Rpb24uZGF0YS5pZCkge1xuXHRcdFx0XHRsZXQgYWxyZWFkeVZpc2l0ZWQgPSAhIXN0YXRlLnZpc2l0ZWRBcnRpc3RzLmxlbmd0aCAmJiBzdGF0ZS52aXNpdGVkQXJ0aXN0cy5zb21lKChhcnRpc3QpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBhcnRpc3QuaWQgPT09IGFjdGlvbi5kYXRhLmlkO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRsZXQgdmlzaXRlZEFydGlzdHMgPSBhbHJlYWR5VmlzaXRlZCA/IHN0YXRlLnZpc2l0ZWRBcnRpc3RzIDogWy4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLCBhY3Rpb24uZGF0YV07XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0XHR2aXNpdGVkQXJ0aXN0czogW1xuXHRcdFx0XHRcdFx0Li4udmlzaXRlZEFydGlzdHMsXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uZGF0YS5uYW1lLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdObyBBUEkgZGF0YSBhdmFpbGFibGUgZm9yIGdpdmVuIGFydGlzdC4gTmVlZCB0byByZWZyZXNoIEFQSSBzZXNzaW9uPycpO1xuXHRcdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0XHR9XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYXJ0aXN0U2VhcmNoOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcnRpc3RTZWFyY2ggZnJvbSBcIi4vcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaFwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFydGlzdFNlYXJjaCxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
