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
	cameraRotation: new THREE.Euler(0, 0, 0),
	cameraLookAt: new THREE.Vector3(1, 1, 1),
	cameraDistance: 3500,

	t1: 0.0, // old time
	t2: 0.0, // now time
	speedX: 0.005,
	speedY: 0.005,
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
					selected.material.color.setHex(_colours.Colours.relatedArtistHover);
				}
			}
			_props.Props.oldMouseVector = _props.Props.mouseVector;
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
		return React.createElement(
			'div',
			{ className: 'artist', key: artist.id },
			React.createElement(
				'a',
				{ href: href, id: artist.id, className: 'nav-artist-link',
					onClick: function onClick(event) {
						handleGetArtist(event, artist.id);
					} },
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
			this.scene.onSceneMouseClick(event);
		}
	}, {
		key: 'mousemove',
		value: function mousemove(event) {
			if (this.mouseIsDown) {
				this.scene.onSceneMouseDrag(event);
			} else {
				this.scene.onSceneMouseHover(event);
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
			this.scene.camera.aspect = window.innerWidth / window.innerHeight;
			this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXIuanMiLCJzcmMvanMvc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlLmpzIiwic3JjL2pzL3N0YXRlL2FjdGlvbnMuanMiLCJzcmMvanMvc3RhdGUvcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaC5qcyIsInNyYy9qcy9zdGF0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QVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG4vLyBjYW5jZWwgcmlnaHQgY2xpY2tcbmRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50KSA9PiBldmVudC5idXR0b24gIT09IDI7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG5cdFx0PEFwcENvbXBvbmVudCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTsiLCIvKipcbiAqIE1vdGlvbkxhYiBkZWFscyB3aXRoIGNvbnRyb2xsaW5nIGVhY2ggdGljayBvZiB0aGUgYW5pbWF0aW9uIGZyYW1lIHNlcXVlbmNlXG4gKiBJdCdzIGFpbSBpcyB0byBpc29sYXRlIGNvZGUgdGhhdCBoYXBwZW5zIG92ZXIgYSBudW1iZXIgb2YgZnJhbWVzIChpLmUuIG1vdGlvbilcbiAqL1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY29uc3QgVFJBQ0tfQ0FNX1RPX09CSiA9ICdUUkFDS19DQU1fVE9fT0JKJztcbmNvbnN0IERFRkFVTFQgPSAnREVGQVVMVCc7XG5jb25zdCBkZWZhdWx0Sm9iID0ge1xuXHR0eXBlOiBERUZBVUxUXG59O1xuXG5leHBvcnQgY2xhc3MgTW90aW9uTGFiIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdFx0dGhpcy5hbmltYXRlKCk7XG5cdH1cblxuXHRhbmltYXRlKCkge1xuXHRcdFByb3BzLnQyID0gRGF0ZS5ub3coKTtcblx0XHR0aGlzLnByb2Nlc3NTY2VuZSgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnJlbmRlcihQcm9wcy5zY2VuZSwgUHJvcHMuY2FtZXJhKTtcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdFByb3BzLnQxID0gUHJvcHMudDI7XG5cdFx0XHR0aGlzLmFuaW1hdGUuY2FsbCh0aGlzKTtcblx0XHR9KTtcblx0fVxuXG5cdHByb2Nlc3NTY2VuZSgpIHtcblx0XHRzd2l0Y2ggKHRoaXMuam9iLnR5cGUpIHtcblx0XHRcdGNhc2UgVFJBQ0tfQ0FNX1RPX09CSjpcblx0XHRcdFx0dGhpcy50cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBERUZBVUxUOlxuXHRcdFx0XHR0aGlzLnVwZGF0ZVJvdGF0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKSB7XG5cdFx0Y29uc3Qgc2hvdWxkRW5kID0gcGFyc2VJbnQodGhpcy5qb2IuY3VycmVudFRpbWUpID09PSAxO1xuXHRcdGlmICghc2hvdWxkRW5kKSB7XG5cdFx0XHR0aGlzLmZvbGxvd1BhdGgoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmVuZEFuaW1hdGlvbigpO1xuXHRcdH1cblx0fVxuXG5cdGZvbGxvd1BhdGgoKSB7XG5cdFx0Y29uc3QgcCA9IHRoaXMuam9iLnBhdGguZ2V0UG9pbnQodGhpcy5qb2IuY3VycmVudFRpbWUpO1xuXHRcdHRoaXMuam9iLm9iamVjdDNELnBvc2l0aW9uLmNvcHkocCk7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgKz0gMC4wMTtcblx0fVxuXG5cdGVuZEFuaW1hdGlvbigpIHtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayAmJiB0aGlzLmpvYi5jYWxsYmFjaygpO1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0fVxuXG5cdHRyYWNrT2JqZWN0VG9DYW1lcmEob2JqZWN0M0QsIGNhbGxiYWNrKSB7XG4gICAgXHR0aGlzLmpvYiA9IHt9O1xuICAgIFx0dGhpcy5qb2IudHlwZSA9IFRSQUNLX0NBTV9UT19PQko7XG5cdFx0dGhpcy5qb2IudCA9IDAuMDtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSA9IDAuMDtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMuam9iLm9iamVjdDNEID0gb2JqZWN0M0Q7XG5cdFx0dGhpcy5qb2IuZW5kZWQgPSBmYWxzZTtcblx0XHR0aGlzLmpvYi5wYXRoID0gbmV3IFRIUkVFLkNhdG11bGxSb21DdXJ2ZTMoW1xuXHRcdFx0b2JqZWN0M0QucG9zaXRpb24uY2xvbmUoKSxcblx0XHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpXG5cdFx0XSk7XG5cdH1cblxuXHQvKipcblx0ICogVE9ETzogb3B0aW1pc2F0aW9uIC0gb25seSB1c2UgdXBkYXRlUm90YXRpb24oKSBpZiB0aGUgbW91c2UgaXMgZHJhZ2dpbmcgLyBzcGVlZCBpcyBhYm92ZSBkZWZhdWx0IG1pbmltdW1cblx0ICogUm90YXRpb24gb2YgY2FtZXJhIGlzICppbnZlcnNlKiBvZiBtb3VzZSBtb3ZlbWVudCBkaXJlY3Rpb25cblx0ICovXG5cdHVwZGF0ZVJvdGF0aW9uKCkge1xuXHRcdGNvbnN0IGNhbVF1YXRlcm5pb25VcGRhdGUgPSB0aGlzLmdldE5ld0NhbWVyYURpcmVjdGlvbigpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueSAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS56ICogUHJvcHMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuY2FtZXJhTG9va0F0KTtcblx0XHQvLyB1cGRhdGUgcm90YXRpb24gb2YgdGV4dCBhdHRhY2hlZCBvYmplY3RzLCB0byBmb3JjZSB0aGVtIHRvIGxvb2sgYXQgY2FtZXJhXG5cdFx0Ly8gdGhpcyBtYWtlcyB0aGVtIHJlYWRhYmxlXG5cdFx0UHJvcHMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0b2JqLmxvb2tBdChQcm9wcy5ncmFwaENvbnRhaW5lci53b3JsZFRvTG9jYWwoUHJvcHMuY2FtZXJhLnBvc2l0aW9uKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5yZWR1Y2VTcGVlZCgwLjAwMDUpO1xuXHR9XG5cblx0Z2V0TmV3Q2FtZXJhRGlyZWN0aW9uKCkge1xuXHRcdGxldCBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHRcdGNvbnN0IHlNb3JlVGhhblhNb3VzZSA9IFByb3BzLm1vdXNlUG9zRGlmZlkgPj0gUHJvcHMubW91c2VQb3NEaWZmWDtcblx0XHRjb25zdCB4TW9yZVRoYW5ZTW91c2UgPSAheU1vcmVUaGFuWE1vdXNlO1xuXHRcdGlmIChQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54IC09IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIVByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggKz0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55ICs9IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIVByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgLT0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlID0gU2NlbmVVdGlscy5yZW5vcm1hbGl6ZVF1YXRlcm5pb24oUHJvcHMuY2FtZXJhKTtcblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnNldEZyb21FdWxlcihQcm9wcy5jYW1lcmFSb3RhdGlvbik7XG5cdFx0cmV0dXJuIGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdH1cblxuXHRyZWR1Y2VTcGVlZChhbW91bnQpIHtcblx0XHRpZiAoUHJvcHMuc3BlZWRYID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWCAtPSBhbW91bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLnNwZWVkWSA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFkgLT0gYW1vdW50O1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5leHBvcnQgY29uc3QgUHJvcHMgPSB7XG5cdHJlbmRlcmVyOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBhbHBoYTogdHJ1ZX0pLFxuXHRzY2VuZTogbmV3IFRIUkVFLlNjZW5lKCksXG5cdGNhbWVyYTogbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgNTAwLCAxNTAwMDApLFxuXHRncmFwaENvbnRhaW5lcjogbmV3IFRIUkVFLk9iamVjdDNEKCksXG5cdGNhbWVyYVJvdGF0aW9uOiBuZXcgVEhSRUUuRXVsZXIoMCwgMCwgMCksXG5cdGNhbWVyYUxvb2tBdDogbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSksXG5cdGNhbWVyYURpc3RhbmNlOiAzNTAwLFxuXHRcblx0dDE6IDAuMCwgLy8gb2xkIHRpbWVcblx0dDI6IDAuMCwgLy8gbm93IHRpbWVcblx0c3BlZWRYOiAwLjAwNSxcblx0c3BlZWRZOiAwLjAwNSxcblx0bW91c2VQb3NEaWZmWDogMC4wLFxuXHRtb3VzZVBvc0RpZmZZOiAwLjAsXG5cdG1vdXNlUG9zWEluY3JlYXNlZDogZmFsc2UsXG5cdG1vdXNlUG9zWUluY3JlYXNlZDogZmFsc2UsXG5cdHJheWNhc3RlcjogbmV3IFRIUkVFLlJheWNhc3RlcigpLFxuXHRtb3VzZVZlY3RvcjogbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XG5cdHJlbGF0ZWRBcnRpc3RTcGhlcmVzOiBbXSxcblx0bWFpbkFydGlzdFNwaGVyZToge31cbn07IiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gJy4uL2NvbmZpZy9jb2xvdXJzJztcbmltcG9ydCB7UHJvcHN9IGZyb20gXCIuL3Byb3BzXCI7XG5pbXBvcnQge1N0YXRpc3RpY3N9IGZyb20gXCIuL3N0YXRpc3RpY3MuY2xhc3NcIjtcblxubGV0IEhFTFZFVElLRVI7XG5jb25zdCBNQUlOX0FSVElTVF9GT05UX1NJWkUgPSAzNDtcbmNvbnN0IFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSA9IDIwO1xuY29uc3QgVE9UQUxfUkVMQVRFRCA9IDEwO1xuXG5jbGFzcyBTY2VuZVV0aWxzIHtcblx0c3RhdGljIGluaXQoKSB7XG5cdFx0Y29uc3QgbG9hZGVyID0gbmV3IFRIUkVFLkZvbnRMb2FkZXIoKTtcblx0XHRsb2FkZXIubG9hZCgnLi9qcy9mb250cy9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbicsIChmb250KSA9PiBIRUxWRVRJS0VSID0gZm9udCk7XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhIC0gbWluXG5cdCAqIEBwYXJhbSBiIC0gbWF4XG5cdCAqIEBwYXJhbSBjIC0gdmFsdWUgdG8gY2xhbXBcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBjbGFtcChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KGIsIE1hdGgubWluKGMsIGEpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBwb3NpdGl2ZSB4IHJldHVybiAxLCBuZWdhdGl2ZSB4IHJldHVybiAtMSwgb3IgMCBvdGhlcndpc2Vcblx0ICogQHBhcmFtIHhcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBzaWduKG4pIHtcblx0XHRyZXR1cm4gbiA+IDAgPyAxIDogbiA8IDAgPyAtMSA6IDA7XG5cdH07XG5cdFxuXHRzdGF0aWMgcmVub3JtYWxpemVRdWF0ZXJuaW9uKG9iamVjdCkge1xuXHRcdGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhncmFwaCwgcmF5Y2FzdGVyLCBjYW1lcmEpIHtcblx0XHRyYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShQcm9wcy5tb3VzZVZlY3RvciwgY2FtZXJhKTtcblx0XHRyZXR1cm4gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoZ3JhcGguY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGdldE1vdXNlVmVjdG9yKGV2ZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKChldmVudC5jbGllbnRYIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCkge1xuXHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IGFydGlzdDtcblx0XHRzcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdHNwaGVyZS5pc01haW5BcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdHNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0U2NlbmVVdGlscy5hZGRUZXh0KGFydGlzdC5uYW1lLCBNQUlOX0FSVElTVF9GT05UX1NJWkUsIHNwaGVyZSk7XG5cdFx0cmV0dXJuIHNwaGVyZTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIG1haW5BcnRpc3RTcGhlcmUpIHtcblx0XHRsZXQgcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheSA9IFtdO1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0O1xuXHRcdGxldCBzcGhlcmVGYWNlSW5kZXggPSAwO1xuXHRcdGxldCBmYWNlc0NvdW50ID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxO1xuXHRcdGxldCBzdGVwID0gTWF0aC5yb3VuZChmYWNlc0NvdW50IC8gVE9UQUxfUkVMQVRFRCAtIDEpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbiA9IE1hdGgubWluKFRPVEFMX1JFTEFURUQsIGFydGlzdC5yZWxhdGVkLmxlbmd0aCk7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdCA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShyZWxhdGVkQXJ0aXN0KTtcblx0XHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0XHRsZXQgcmVsYXRlZEFydGlzdFNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZEFydGlzdH0pKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqID0gcmVsYXRlZEFydGlzdDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1JlbGF0ZWRBcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmRpc3RhbmNlID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0Lm5hbWUsIFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5LnB1c2gocmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5O1xuXHR9XG5cblx0c3RhdGljIGFwcGVuZE9iamVjdHNUb1NjZW5lKGdyYXBoQ29udGFpbmVyLCBzcGhlcmUsIHNwaGVyZUFycmF5KSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cdFx0cGFyZW50Lm5hbWUgPSAncGFyZW50Jztcblx0XHRwYXJlbnQuYWRkKHNwaGVyZSk7XG5cdFx0aWYgKHNwaGVyZUFycmF5KSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwaGVyZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHBhcmVudC5hZGQoc3BoZXJlQXJyYXlbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRncmFwaENvbnRhaW5lci5hZGQocGFyZW50KTtcblx0fVxuXG5cdHN0YXRpYyBqb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkTGluZUpvaW59KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRsZXQgbGluZTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHJlbGF0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0bGluZSA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdFx0bWFpbkFydGlzdFNwaGVyZS5hZGQobGluZSk7XG5cdH1cblxuXHRzdGF0aWMgcG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCkge1xuXHRcdGxldCBtYWluQXJ0aXN0U3BoZXJlRmFjZSA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXNbTWF0aC5mbG9vcihzcGhlcmVGYWNlSW5kZXgpXS5ub3JtYWwuY2xvbmUoKTtcblx0XHRyZWxhdGVkU3BoZXJlLnBvc2l0aW9uXG5cdFx0XHQuY29weShtYWluQXJ0aXN0U3BoZXJlRmFjZS5tdWx0aXBseShuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBhZGRUZXh0KGxhYmVsLCBzaXplLCBzcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogc2l6ZSxcblx0XHRcdGN1cnZlU2VnbWVudHM6IDQsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMixcblx0XHRcdGJldmVsU2l6ZTogMSxcblx0XHRcdGJldmVsU2VnbWVudHM6IDNcblx0XHR9KTtcblx0XHRsZXQgdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0ZXh0R2VvbSwgbWF0ZXJpYWxBcnJheSk7XG5cdFx0dGV4dE1lc2guaXNUZXh0ID0gdHJ1ZTtcblx0XHRzcGhlcmUuYWRkKHRleHRNZXNoKTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoLXNwaGVyZS5yYWRpdXMsIC0oc3BoZXJlLnJhZGl1cyArIHNpemUgKiAyKSwgLXNwaGVyZS5yYWRpdXMgLyAyKTtcblx0fVxuXG5cdHN0YXRpYyBsaWdodGluZygpIHtcblx0XHRsZXQgbGlnaHRBID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDEuNzI1KTtcblx0XHRsZXQgbGlnaHRCID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDEuNSk7XG5cdFx0bGlnaHRBLnBvc2l0aW9uLnNldFgoNTAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WSgtODAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WCgtNTAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRBKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRCKTtcblx0fVxufVxuXG5leHBvcnQgeyBTY2VuZVV0aWxzIH1cbiIsImltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSBcIi4uL2NvbmZpZy9jb2xvdXJzXCI7XG5pbXBvcnQge01vdGlvbkxhYn0gZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5pbXBvcnQge1Byb3BzfSBmcm9tICcuL3Byb3BzJztcblxuLyoqXG4gKiBTcGhlcmVzU2NlbmUgaXMgZGVzaWduZWQgdG8gaGFuZGxlIGFkZGluZyBhbmQgcmVtb3ZpbmcgZW50aXRpZXMgZnJvbSB0aGUgc2NlbmUsXG4gKiBhbmQgaGFuZGxpbmcgZXZlbnRzLlxuICpcbiAqIEl0IGFpbXMgdG8gZGVhbCBub3Qgd2l0aCBjaGFuZ2VzIG92ZXIgdGltZSwgb25seSBpbW1lZGlhdGUgY2hhbmdlcyBpbiBvbmUgZnJhbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBTcGhlcmVzU2NlbmUge1xuXHRjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKTtcblx0XHR0aGlzLm1vdGlvbkxhYiA9IG5ldyBNb3Rpb25MYWIoKTtcblxuXHRcdC8vIGF0dGFjaCB0byBkb21cblx0XHRQcm9wcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHRcdFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAncmVuZGVyZXInO1xuXHRcdFByb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcblx0XHRQcm9wcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cblx0XHQvLyBpbml0IHRoZSBzY2VuZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnBvc2l0aW9uLnNldCgxLCA1LCAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuZ3JhcGhDb250YWluZXIpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoMCwgMjUwLCBQcm9wcy5jYW1lcmFEaXN0YW5jZSk7XG5cdFx0UHJvcHMuY2FtZXJhLmxvb2tBdChQcm9wcy5zY2VuZS5wb3NpdGlvbik7XG5cdFx0U2NlbmVVdGlscy5saWdodGluZyhQcm9wcy5zY2VuZSk7XG5cblx0XHQvLyBjaGVjayBmb3IgcXVlcnkgc3RyaW5nXG5cdFx0Y29uc3QgYXJ0aXN0SWQgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKSk7XG5cdFx0aWYgKGFydGlzdElkKSB7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9zZVNjZW5lKGFydGlzdCkge1xuXHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdC5pZCk7XG5cdFx0UHJvcHMubWFpbkFydGlzdFNwaGVyZSA9IFNjZW5lVXRpbHMuY3JlYXRlTWFpbkFydGlzdFNwaGVyZShhcnRpc3QpO1xuXHRcdFByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzID0gU2NlbmVVdGlscy5jcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIFByb3BzLm1haW5BcnRpc3RTcGhlcmUpO1xuXHRcdFNjZW5lVXRpbHMuYXBwZW5kT2JqZWN0c1RvU2NlbmUoUHJvcHMuZ3JhcGhDb250YWluZXIsIFByb3BzLm1haW5BcnRpc3RTcGhlcmUsIFByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzKTtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KSB7XG5cdFx0bGV0IHNlbGVjdGVkO1xuXHRcdGxldCBpbnRlcnNlY3RzO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7IC8vIHJlc2V0IHRoZSByZWxhdGVkIHNwaGVyZSB0byByZWRcblx0XHRcdFx0b2JqLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7IC8vIG1vdXNlIGlzIG92ZXIgYSBNZXNoXG5cdFx0XHRQcm9wcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c2VsZWN0ZWQubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdEhvdmVyKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZURyYWcoZXZlbnQpIHtcblx0XHRjb25zdCBkdCA9IFByb3BzLnQyIC0gUHJvcHMudDE7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueCA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLngpO1xuXHRcdFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci55ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWCA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLngpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueCkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlkgPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci55KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpKTtcblx0XHRQcm9wcy5zcGVlZFggPSAoKDEgKyBQcm9wcy5tb3VzZVBvc0RpZmZYKSAvIGR0KTtcblx0XHRQcm9wcy5zcGVlZFkgPSAoKDEgKyBQcm9wcy5tb3VzZVBvc0RpZmZZKSAvIGR0KTtcblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpIHtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdGxldCBpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5yYXljYXN0ZXIsIFByb3BzLmNhbWVyYSk7XG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBzZWxlY3RlZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0O1xuXHRcdFx0aWYgKHNlbGVjdGVkLmhhc093blByb3BlcnR5KCdpc1JlbGF0ZWRBcnRpc3RTcGhlcmUnKSkge1xuXHRcdFx0XHR0aGlzLmdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIudHJhY2tPYmplY3RUb0NhbWVyYShzZWxlY3RlZFNwaGVyZSwgKCkgPT4ge1xuXHRcdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmouaWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJHcmFwaCgpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBQcm9wcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShwYXJlbnQpO1xuXHRcdH1cblx0fVxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn0iLCJjb25zdCBESVNUQU5DRV9TQ0FMQVIgPSA1MDtcbmNvbnN0IFNJWkVfU0NBTEFSID0gMS41O1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tICcuL3NjZW5lLXV0aWxzLmNsYXNzJztcblxuZXhwb3J0IGNsYXNzIFN0YXRpc3RpY3Mge1xuICAgIHN0YXRpYyBnZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCkge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoNDAsIGFydGlzdC5wb3B1bGFyaXR5ICogU0laRV9TQ0FMQVIpO1xuICAgIH1cblxuXHQvKipcbiAgICAgKiBNYXAtcmVkdWNlIG9mIHR3byBzdHJpbmcgYXJyYXlzXG5cdCAqIEBwYXJhbSBhcnRpc3Rcblx0ICogQHBhcmFtIHJlbGF0ZWRBcnRpc3Rcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBnZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpIHtcblx0XHRsZXQgbWF0Y2hlcyA9IGFydGlzdC5nZW5yZXNcbiAgICAgICAgICAgIC5tYXAoKG1haW5BcnRpc3RHZW5yZSkgPT4gU3RhdGlzdGljcy5tYXRjaEFydGlzdFRvUmVsYXRlZEdlbnJlcyhtYWluQXJ0aXN0R2VucmUsIHJlbGF0ZWRBcnRpc3QpKVxuICAgICAgICAgICAgLnJlZHVjZSgoYWNjdW11bGF0b3IsIG1hdGNoKSA9PiB7XG5cdFx0ICAgICAgICBpZiAobWF0Y2gpIHtcblx0XHQgICAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKG1hdGNoKTtcblx0XHRcdFx0fVxuXHRcdCAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgICAgICAgICAgfSwgW10pO1xuXHRcdHJldHVybiBNYXRoLm1heCgzMDAsIG1hdGNoZXMubGVuZ3RoICogRElTVEFOQ0VfU0NBTEFSKTtcblx0fVxuXG5cdHN0YXRpYyBtYXRjaEFydGlzdFRvUmVsYXRlZEdlbnJlcyhtYWluQXJ0aXN0R2VucmUsIHJlbGF0ZWRBcnRpc3QpIHtcbiAgICAgICAgcmV0dXJuIHJlbGF0ZWRBcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAuZmluZCgoZ2VucmUpID0+IGdlbnJlID09PSBtYWluQXJ0aXN0R2VucmUpO1xuICAgIH1cbiB9IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU2VhcmNoQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXJcIjtcbmltcG9ydCBTcG90aWZ5UGxheWVyQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lclwiO1xuaW1wb3J0IFNjZW5lQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdExpc3RDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWxpc3QuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0SW5mb0NvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtaW5mby5jb250YWluZXJcIjtcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250YWluZXJcIj5cblx0XHRcdFx0PFNlYXJjaENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTY2VuZUNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTcG90aWZ5UGxheWVyQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdExpc3RDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0SW5mb0NvbnRhaW5lciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RJbmZvQ29tcG9uZW50KHthcnRpc3R9KSB7XG5cdGxldCBhcnRpc3RJbmZvTWFya3VwID0gJyc7XG5cdGNvbnN0IGdlbnJlcyA9IGFydGlzdC5nZW5yZXMubWFwKChnZW5yZSkgPT4ge1xuXHRcdHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJhcnRpc3QtZ2VucmVcIiBrZXk9e2dlbnJlfT57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0aWYgKGFydGlzdC5pZCkge1xuXHRcdGFydGlzdEluZm9NYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImluZm8tY29udGFpbmVyXCI+XG5cdFx0XHRcdDx1bD5cblx0XHRcdFx0XHQ8bGk+UG9wdWxhcml0eToge2FydGlzdC5wb3B1bGFyaXR5fTwvbGk+XG5cdFx0XHRcdFx0PGxpPkdlbnJlczoge2dlbnJlc308L2xpPlxuXHRcdFx0XHQ8L3VsPlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9XG5cdHJldHVybiAoXG5cdFx0PGRpdj57YXJ0aXN0SW5mb01hcmt1cH08L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0TGlzdENvbXBvbmVudCh7dmlzaXRlZEFydGlzdHMsIGhhbmRsZUdldEFydGlzdH0pIHtcblx0bGV0IGFydGlzdHMgPSB2aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdGxldCBocmVmID0gJy9hcHAvIycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0LmlkKTtcblx0XHRsZXQgaW1nVXJsID0gYXJ0aXN0LmltYWdlcyAmJiBhcnRpc3QuaW1hZ2VzLmxlbmd0aCA/IGFydGlzdC5pbWFnZXNbYXJ0aXN0LmltYWdlcy5sZW5ndGggLSAxXS51cmwgOiAnJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiXG5cdFx0XHRcdCAgIG9uQ2xpY2s9eyhldmVudCkgPT4geyBoYW5kbGVHZXRBcnRpc3QoZXZlbnQsIGFydGlzdC5pZCkgfX0+XG5cdFx0XHRcdFx0PGltZyBjbGFzc05hbWU9XCJwaWN0dXJlXCIgc3JjPXtpbWdVcmx9IC8+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibmFtZVwiPnthcnRpc3QubmFtZX08L3NwYW4+XG5cdFx0XHRcdDwvYT5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fSk7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3QtbmF2aWdhdGlvblwiPlxuXHRcdFx0e2FydGlzdHN9XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4uL2NsYXNzZXMvc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7U3BoZXJlc1NjZW5lfSBmcm9tIFwiLi4vY2xhc3Nlcy9zcGhlcmVzLXNjZW5lLmNsYXNzXCI7XG5cbmV4cG9ydCBjbGFzcyBTY2VuZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hcnRpc3QgPSBzdG9yZS5nZXRTdGF0ZSgpLmFydGlzdDtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgeyBhcnRpc3QgfSA9IHRoaXMucHJvcHM7XG5cdFx0aWYgKGFydGlzdC5pZCkge1xuXHRcdFx0dGhpcy5zY2VuZS5jb21wb3NlU2NlbmUoYXJ0aXN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiXG5cdFx0XHRcdCByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19XG5cdFx0XHQvPlxuXHRcdClcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuc2NlbmUgPSBuZXcgU3BoZXJlc1NjZW5lKHRoaXMuc2NlbmVEb20pO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpXG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5tb3VzZUlzRG93bikge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VEcmFnKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VIb3ZlcihldmVudCk7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vkb3duKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSB0cnVlO1xuXHR9XG5cblx0bW91c2V1cCgpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRtb3VzZXdoZWVsKGV2ZW50KSB7XG5cdFx0c3dpdGNoIChTY2VuZVV0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRjYXNlIC0xOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ291dCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdpbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5zY2VuZS5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0dGhpcy5zY2VuZS5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgaGFuZGxlU2VhcmNoLCBoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VhcmNoLWZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJhcnRpc3Qtc2VhcmNoXCIgb25TdWJtaXQ9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17c2VhcmNoVGVybX0gb25DaGFuZ2U9e2hhbmRsZVNlYXJjaFRlcm1VcGRhdGV9IC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgb25DbGljaz17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PkdvPC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTcG90aWZ5UGxheWVyQ29tcG9uZW50KHthcnRpc3R9KSB7XG5cdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZC9hcnRpc3QvJztcblx0Y29uc3QgYXJ0aXN0RW1iZWRVcmwgPSBgJHtlbWJlZFVybH0ke2FydGlzdC5pZH1gO1xuXHRsZXQgaUZyYW1lTWFya3VwID0gJyc7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyLWNvbnRhaW5lclwiPlxuXHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHQ8L2Rpdj5cblx0KVxufSIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0c1xuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlR2V0QXJ0aXN0OiAoZXZ0LCBhcnRpc3RJZCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdFx0fSxcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyB1cGRhdGVTZWFyY2hUZXJtIH0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm1cblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBhcnRpc3ROYW1lKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2Uuc2VhcmNoKGFydGlzdE5hbWUpO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHthcnRpc3REYXRhQXZhaWxhYmxlfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBzZWFyY2goYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIlxuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXJ0aXN0KGFydGlzdElkKSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FydGlzdC8nICsgYXJ0aXN0SWQ7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9EQVRBX0FWQUlMQUJMRSA9ICdBUlRJU1RfREFUQV9BVkFJTEFCTEUnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXJ0aXN0RGF0YUF2YWlsYWJsZShkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQVJUSVNUX0RBVEFfQVZBSUxBQkxFLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufSIsImltcG9ydCB7U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEV9IGZyb20gJy4uL2FjdGlvbnMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcblx0YXJ0aXN0OiB7XG5cdFx0aWQ6ICcnLFxuXHRcdG5hbWU6ICcnLFxuXHRcdGltZ1VybDogJycsXG5cdFx0Z2VucmVzOiBbXSxcblx0XHRwb3B1bGFyaXR5OiAwLFxuXHRcdGltYWdlczogW11cblx0fSxcblx0c2VhcmNoVGVybTogJycsXG5cdHZpc2l0ZWRBcnRpc3RzOiBbXVxufTtcblxuY29uc3QgYXJ0aXN0U2VhcmNoID0gKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pID0+IHtcblx0c3dpdGNoIChhY3Rpb24udHlwZSkge1xuXHRcdGNhc2UgU0VBUkNIX1RFUk1fVVBEQVRFOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5zZWFyY2hUZXJtLFxuXHRcdFx0fTtcblx0XHRjYXNlIEFSVElTVF9EQVRBX0FWQUlMQUJMRTpcblx0XHRcdGlmIChhY3Rpb24uZGF0YS5pZCkge1xuXHRcdFx0XHRsZXQgYWxyZWFkeVZpc2l0ZWQgPSAhIXN0YXRlLnZpc2l0ZWRBcnRpc3RzLmxlbmd0aCAmJiBzdGF0ZS52aXNpdGVkQXJ0aXN0cy5zb21lKChhcnRpc3QpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBhcnRpc3QuaWQgPT09IGFjdGlvbi5kYXRhLmlkO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRsZXQgdmlzaXRlZEFydGlzdHMgPSBhbHJlYWR5VmlzaXRlZCA/IHN0YXRlLnZpc2l0ZWRBcnRpc3RzIDogWy4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLCBhY3Rpb24uZGF0YV07XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0XHR2aXNpdGVkQXJ0aXN0czogW1xuXHRcdFx0XHRcdFx0Li4udmlzaXRlZEFydGlzdHMsXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uZGF0YS5uYW1lLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdObyBBUEkgZGF0YSBhdmFpbGFibGUgZm9yIGdpdmVuIGFydGlzdC4gTmVlZCB0byByZWZyZXNoIEFQSSBzZXNzaW9uPycpO1xuXHRcdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0XHR9XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYXJ0aXN0U2VhcmNoOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcnRpc3RTZWFyY2ggZnJvbSBcIi4vcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaFwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFydGlzdFNlYXJjaCxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
