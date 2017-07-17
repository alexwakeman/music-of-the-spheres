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

var MIN_DISTANCE = 10;
var MAX_DISTANCE = 1000;
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
												var genreSimilarity = Math.round(matches.length * unit * 100);
												var minDistance = (artist.popularity + relatedArtist.popularity) * SIZE_SCALAR + MIN_DISTANCE;
												return {
																lineLength: Math.max(minDistance, MAX_DISTANCE - matches.length * DISTANCE_SCALAR),
																genreSimilarity: genreSimilarity
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoLmpzIiwic3JjL2pzL3N0YXRlL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLE1BQVQsQ0FDQztBQUFBO0FBQUEsR0FBVSxtQkFBVjtBQUNDO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOzs7Ozs7Ozs7O3FqQkNOQTs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0lBQVksSzs7Ozs7O0FBRVosSUFBTSxtQkFBbUIsa0JBQXpCO0FBQ0EsSUFBTSxVQUFVLFNBQWhCO0FBQ0EsSUFBTSxhQUFhO0FBQ2xCLE9BQU07QUFEWSxDQUFuQjs7SUFJYSxTLFdBQUEsUztBQUNULHNCQUFjO0FBQUE7O0FBQ2hCLE9BQUssR0FBTCxHQUFXLFVBQVg7QUFDQSxPQUFLLE9BQUw7QUFDQTs7Ozs0QkFFUztBQUFBOztBQUNULGdCQUFNLEVBQU4sR0FBVyxLQUFLLEdBQUwsRUFBWDtBQUNBLFFBQUssWUFBTDtBQUNBLGdCQUFNLFFBQU4sQ0FBZSxNQUFmLENBQXNCLGFBQU0sS0FBNUIsRUFBbUMsYUFBTSxNQUF6QztBQUNBLFVBQU8scUJBQVAsQ0FBNkIsWUFBTTtBQUNsQyxpQkFBTSxFQUFOLEdBQVcsYUFBTSxFQUFqQjtBQUNBLFVBQUssT0FBTCxDQUFhLElBQWI7QUFDQSxJQUhEO0FBSUE7OztpQ0FFYztBQUNkLFdBQVEsS0FBSyxHQUFMLENBQVMsSUFBakI7QUFDQyxTQUFLLGdCQUFMO0FBQ0MsVUFBSyx5QkFBTDtBQUNBO0FBQ0QsU0FBSyxPQUFMO0FBQ0MsVUFBSyxjQUFMO0FBQ0E7QUFORjtBQVFBOzs7OENBRTJCO0FBQzNCLE9BQU0sWUFBWSxTQUFTLEtBQUssR0FBTCxDQUFTLFdBQWxCLE1BQW1DLENB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LEtBQVg7QUFDQTtBQUNEO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsY0FBVTtBQUZYO0FBSUE7QUFDRDtBQUNDLDJCQUNJLEtBREo7QUFFQyxtQkFBZSxPQUFPLElBRnZCO0FBR0MsaUJBQWE7QUFIZDtBQUtBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsZ0NBQ0ksV0FESixDQUZEO0FBS0MsaUJBQWE7QUFMZDtBQU9BO0FBQ0Q7QUFDQywyQkFDSSxVQURKO0FBR0E7QUFDRDtBQUNDLGNBQVcsS0FBWDtBQTNERjtBQTZEQSxRQUFPLGNBQVAsQ0FBc0IsT0FBdEIsQ0FBOEIsT0FBOUIsRUFBdUMsS0FBSyxTQUFMLENBQWUsUUFBZixDQUF2QztBQUNBLFFBQU8sUUFBUDtBQUNBLENBakVEOztrQkFtRWUsWTs7Ozs7Ozs7OztBQ2pHZjs7QUFDQTs7Ozs7O0FBRU8sSUFBSSx3QkFBUSxnREFFbEIsT0FBTyw0QkFBUCxJQUF1QyxPQUFPLDRCQUFQLEVBRnJCLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQge0FwcENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG5cdFx0PEFwcENvbXBvbmVudCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTsiLCIvKipcbiAqIE1vdGlvbkxhYiBkZWFscyB3aXRoIGNvbnRyb2xsaW5nIGVhY2ggdGljayBvZiB0aGUgYW5pbWF0aW9uIGZyYW1lIHNlcXVlbmNlXG4gKiBJdCdzIGFpbSBpcyB0byBpc29sYXRlIGNvZGUgdGhhdCBoYXBwZW5zIG92ZXIgYSBudW1iZXIgb2YgZnJhbWVzIChpLmUuIG1vdGlvbilcbiAqL1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY29uc3QgVFJBQ0tfQ0FNX1RPX09CSiA9ICdUUkFDS19DQU1fVE9fT0JKJztcbmNvbnN0IERFRkFVTFQgPSAnREVGQVVMVCc7XG5jb25zdCBkZWZhdWx0Sm9iID0ge1xuXHR0eXBlOiBERUZBVUxUXG59O1xuXG5leHBvcnQgY2xhc3MgTW90aW9uTGFiIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdFx0dGhpcy5hbmltYXRlKCk7XG5cdH1cblxuXHRhbmltYXRlKCkge1xuXHRcdFByb3BzLnQyID0gRGF0ZS5ub3coKTtcblx0XHR0aGlzLnByb2Nlc3NTY2VuZSgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnJlbmRlcihQcm9wcy5zY2VuZSwgUHJvcHMuY2FtZXJhKTtcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdFByb3BzLnQxID0gUHJvcHMudDI7XG5cdFx0XHR0aGlzLmFuaW1hdGUuY2FsbCh0aGlzKTtcblx0XHR9KTtcblx0fVxuXG5cdHByb2Nlc3NTY2VuZSgpIHtcblx0XHRzd2l0Y2ggKHRoaXMuam9iLnR5cGUpIHtcblx0XHRcdGNhc2UgVFJBQ0tfQ0FNX1RPX09CSjpcblx0XHRcdFx0dGhpcy50cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBERUZBVUxUOlxuXHRcdFx0XHR0aGlzLnVwZGF0ZVJvdGF0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKSB7XG5cdFx0Y29uc3Qgc2hvdWxkRW5kID0gcGFyc2VJbnQodGhpcy5qb2IuY3VycmVudFRpbWUpID09PSAxO1xuXHRcdGlmICghc2hvdWxkRW5kKSB7XG5cdFx0XHR0aGlzLmZvbGxvd1BhdGgoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmVuZEFuaW1hdGlvbigpO1xuXHRcdH1cblx0fVxuXG5cdGZvbGxvd1BhdGgoKSB7XG5cdFx0Y29uc3QgcCA9IHRoaXMuam9iLnBhdGguZ2V0UG9pbnQodGhpcy5qb2IuY3VycmVudFRpbWUpO1xuXHRcdHRoaXMuam9iLm9iamVjdDNELnBvc2l0aW9uLmNvcHkocCk7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgKz0gMC4wMTtcblx0fVxuXG5cdGVuZEFuaW1hdGlvbigpIHtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayAmJiB0aGlzLmpvYi5jYWxsYmFjaygpO1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0fVxuXG5cdHRyYWNrT2JqZWN0VG9DYW1lcmEob2JqZWN0M0QsIGNhbGxiYWNrKSB7XG4gICAgXHR0aGlzLmpvYiA9IHt9O1xuICAgIFx0dGhpcy5qb2IudHlwZSA9IFRSQUNLX0NBTV9UT19PQko7XG5cdFx0dGhpcy5qb2IudCA9IDAuMDtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSA9IDAuMDtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMuam9iLm9iamVjdDNEID0gb2JqZWN0M0Q7XG5cdFx0dGhpcy5qb2IuZW5kZWQgPSBmYWxzZTtcblx0XHR0aGlzLmpvYi5wYXRoID0gbmV3IFRIUkVFLkNhdG11bGxSb21DdXJ2ZTMoW1xuXHRcdFx0b2JqZWN0M0QucG9zaXRpb24uY2xvbmUoKSxcblx0XHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpXG5cdFx0XSk7XG5cdH1cblxuXHQvKipcblx0ICogVE9ETzogb3B0aW1pc2F0aW9uIC0gb25seSB1c2UgdXBkYXRlUm90YXRpb24oKSBpZiB0aGUgbW91c2UgaXMgZHJhZ2dpbmcgLyBzcGVlZCBpcyBhYm92ZSBkZWZhdWx0IG1pbmltdW1cblx0ICogUm90YXRpb24gb2YgY2FtZXJhIGlzICppbnZlcnNlKiBvZiBtb3VzZSBtb3ZlbWVudCBkaXJlY3Rpb25cblx0ICovXG5cdHVwZGF0ZVJvdGF0aW9uKCkge1xuXHRcdGNvbnN0IGNhbVF1YXRlcm5pb25VcGRhdGUgPSB0aGlzLmdldE5ld0NhbWVyYURpcmVjdGlvbigpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueSAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS56ICogUHJvcHMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuY2FtZXJhTG9va0F0KTtcblx0XHQvLyB1cGRhdGUgcm90YXRpb24gb2YgdGV4dCBhdHRhY2hlZCBvYmplY3RzLCB0byBmb3JjZSB0aGVtIHRvIGxvb2sgYXQgY2FtZXJhXG5cdFx0Ly8gdGhpcyBtYWtlcyB0aGVtIHJlYWRhYmxlXG5cdFx0UHJvcHMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0b2JqLmxvb2tBdChQcm9wcy5ncmFwaENvbnRhaW5lci53b3JsZFRvTG9jYWwoUHJvcHMuY2FtZXJhLnBvc2l0aW9uKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5yZWR1Y2VTcGVlZCgwLjAwMDUpO1xuXHR9XG5cblx0Z2V0TmV3Q2FtZXJhRGlyZWN0aW9uKCkge1xuXHRcdGxldCBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHRcdGNvbnN0IHlNb3JlVGhhblhNb3VzZSA9IFByb3BzLm1vdXNlUG9zRGlmZlkgPj0gUHJvcHMubW91c2VQb3NEaWZmWDtcblx0XHRjb25zdCB4TW9yZVRoYW5ZTW91c2UgPSAheU1vcmVUaGFuWE1vdXNlO1xuXHRcdGlmIChQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54IC09IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIVByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggKz0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55ICs9IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIVByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgLT0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlID0gU2NlbmVVdGlscy5yZW5vcm1hbGl6ZVF1YXRlcm5pb24oUHJvcHMuY2FtZXJhKTtcblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnNldEZyb21FdWxlcihQcm9wcy5jYW1lcmFSb3RhdGlvbik7XG5cdFx0cmV0dXJuIGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdH1cblxuXHRyZWR1Y2VTcGVlZChhbW91bnQpIHtcblx0XHRpZiAoUHJvcHMuc3BlZWRYID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWCAtPSBhbW91bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLnNwZWVkWSA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFkgLT0gYW1vdW50O1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5leHBvcnQgY29uc3QgUHJvcHMgPSB7XG5cdHJlbmRlcmVyOiBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlLCBhbHBoYTogdHJ1ZX0pLFxuXHRzY2VuZTogbmV3IFRIUkVFLlNjZW5lKCksXG5cdGNhbWVyYTogbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgNTAwLCAxNTAwMDApLFxuXHRncmFwaENvbnRhaW5lcjogbmV3IFRIUkVFLk9iamVjdDNEKCksXG5cdGNhbWVyYVJvdGF0aW9uOiBuZXcgVEhSRUUuRXVsZXIoMCwgLTEsIDApLFxuXHRjYW1lcmFMb29rQXQ6IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXHRjYW1lcmFEaXN0YW5jZTogMzUwMCxcblx0XG5cdHQxOiAwLjAsIC8vIG9sZCB0aW1lXG5cdHQyOiAwLjAsIC8vIG5vdyB0aW1lXG5cdHNwZWVkWDogMC4wMDUsXG5cdHNwZWVkWTogMC4wMDAsXG5cdG1vdXNlUG9zRGlmZlg6IDAuMCxcblx0bW91c2VQb3NEaWZmWTogMC4wLFxuXHRtb3VzZVBvc1hJbmNyZWFzZWQ6IGZhbHNlLFxuXHRtb3VzZVBvc1lJbmNyZWFzZWQ6IGZhbHNlLFxuXHRyYXljYXN0ZXI6IG5ldyBUSFJFRS5SYXljYXN0ZXIoKSxcblx0bW91c2VWZWN0b3I6IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFxuXHRyZWxhdGVkQXJ0aXN0U3BoZXJlczogW10sXG5cdG1haW5BcnRpc3RTcGhlcmU6IHt9XG59OyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5pbXBvcnQge1Byb3BzfSBmcm9tIFwiLi9wcm9wc1wiO1xuaW1wb3J0IHtTdGF0aXN0aWNzfSBmcm9tIFwiLi9zdGF0aXN0aWNzLmNsYXNzXCI7XG5cbmxldCBIRUxWRVRJS0VSO1xuY29uc3QgTUFJTl9BUlRJU1RfRk9OVF9TSVpFID0gMzQ7XG5jb25zdCBSRUxBVEVEX0FSVElTVF9GT05UX1NJWkUgPSAyMDtcbmNvbnN0IFRPVEFMX1JFTEFURUQgPSAxMDtcblxuY2xhc3MgU2NlbmVVdGlscyB7XG5cdHN0YXRpYyBpbml0KCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRjb25zdCBsb2FkZXIgPSBuZXcgVEhSRUUuRm9udExvYWRlcigpO1xuXHRcdFx0bG9hZGVyLmxvYWQoJy4vanMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nLCAoZm9udCkgPT4ge1xuXHRcdFx0XHRIRUxWRVRJS0VSID0gZm9udDtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSwgKCk9Pnt9LCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYSAtIG1pblxuXHQgKiBAcGFyYW0gYiAtIG1heFxuXHQgKiBAcGFyYW0gYyAtIHZhbHVlIHRvIGNsYW1wXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgY2xhbXAoYSwgYiwgYykge1xuXHRcdHJldHVybiBNYXRoLm1heChiLCBNYXRoLm1pbihjLCBhKSk7XG5cdH1cblxuXHQvKipcblx0ICogR2l2ZW4gcG9zaXRpdmUgeCByZXR1cm4gMSwgbmVnYXRpdmUgeCByZXR1cm4gLTEsIG9yIDAgb3RoZXJ3aXNlXG5cdCAqIEBwYXJhbSB4XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgc2lnbihuKSB7XG5cdFx0cmV0dXJuIG4gPiAwID8gMSA6IG4gPCAwID8gLTEgOiAwO1xuXHR9O1xuXHRcblx0c3RhdGljIHJlbm9ybWFsaXplUXVhdGVybmlvbihvYmplY3QpIHtcblx0XHRsZXQgY2xvbmUgPSBvYmplY3QuY2xvbmUoKTtcblx0XHRsZXQgcSA9IGNsb25lLnF1YXRlcm5pb247XG5cdFx0bGV0IG1hZ25pdHVkZSA9IE1hdGguc3FydChNYXRoLnBvdyhxLncsIDIpICsgTWF0aC5wb3cocS54LCAyKSArIE1hdGgucG93KHEueSwgMikgKyBNYXRoLnBvdyhxLnosIDIpKTtcblx0XHRxLncgLz0gbWFnbml0dWRlO1xuXHRcdHEueCAvPSBtYWduaXR1ZGU7XG5cdFx0cS55IC89IG1hZ25pdHVkZTtcblx0XHRxLnogLz0gbWFnbml0dWRlO1xuXHRcdHJldHVybiBxO1xuXHR9XG5cblx0c3RhdGljIGdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoZ3JhcGgsIHJheWNhc3RlciwgY2FtZXJhKSB7XG5cdFx0cmF5Y2FzdGVyLnNldEZyb21DYW1lcmEoUHJvcHMubW91c2VWZWN0b3IsIGNhbWVyYSk7XG5cdFx0cmV0dXJuIHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKGdyYXBoLmNoaWxkcmVuLCB0cnVlKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRNb3VzZVZlY3RvcihldmVudCkge1xuXHRcdHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMigoZXZlbnQuY2xpZW50WCAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGgpICogMiAtIDEsXG5cdFx0XHQtKGV2ZW50LmNsaWVudFkgLyBQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMSk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlTWFpbkFydGlzdFNwaGVyZShhcnRpc3QpIHtcblx0XHRsZXQgcmFkaXVzID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKGFydGlzdCk7XG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgMzUsIDM1KTtcblx0XHRsZXQgc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5tYWluQXJ0aXN0fSkpO1xuXHRcdHNwaGVyZS5hcnRpc3RPYmogPSBhcnRpc3Q7XG5cdFx0c3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRzcGhlcmUuaXNNYWluQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRzcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdFNjZW5lVXRpbHMuYWRkVGV4dChhcnRpc3QubmFtZSwgTUFJTl9BUlRJU1RfRk9OVF9TSVpFLCBzcGhlcmUpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBtYWluQXJ0aXN0U3BoZXJlKSB7XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkgPSBbXTtcblx0XHRsZXQgcmVsYXRlZEFydGlzdDtcblx0XHRsZXQgc3BoZXJlRmFjZUluZGV4ID0gMDtcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIFRPVEFMX1JFTEFURUQgLSAxKTtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbihUT1RBTF9SRUxBVEVELCBhcnRpc3QucmVsYXRlZC5sZW5ndGgpOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHJlbGF0ZWRBcnRpc3QgPSBhcnRpc3QucmVsYXRlZFtpXTtcblx0XHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUocmVsYXRlZEFydGlzdCk7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRsZXQgZ2VucmVNZXRyaWNzID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmogPSByZWxhdGVkQXJ0aXN0O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmouZ2VucmVTaW1pbGFyaXR5ID0gZ2VucmVNZXRyaWNzLmdlbnJlU2ltaWxhcml0eTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuZGlzdGFuY2UgPSBnZW5yZU1ldHJpY3MubGluZUxlbmd0aDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmlzUmVsYXRlZEFydGlzdFNwaGVyZSA9IHRydWU7XG5cdFx0XHRzcGhlcmVGYWNlSW5kZXggKz0gc3RlcDtcblx0XHRcdFNjZW5lVXRpbHMucG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCk7XG5cdFx0XHRTY2VuZVV0aWxzLmpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0U2NlbmVVdGlscy5hZGRUZXh0KHJlbGF0ZWRBcnRpc3QubmFtZSwgUkVMQVRFRF9BUlRJU1RfRk9OVF9TSVpFLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkucHVzaChyZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXk7XG5cdH1cblxuXHRzdGF0aWMgYXBwZW5kT2JqZWN0c1RvU2NlbmUoZ3JhcGhDb250YWluZXIsIHNwaGVyZSwgc3BoZXJlQXJyYXkpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblx0XHRwYXJlbnQubmFtZSA9ICdwYXJlbnQnO1xuXHRcdHBhcmVudC5hZGQoc3BoZXJlKTtcblx0XHRpZiAoc3BoZXJlQXJyYXkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BoZXJlQXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0cGFyZW50LmFkZChzcGhlcmVBcnJheVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGdyYXBoQ29udGFpbmVyLmFkZChwYXJlbnQpO1xuXHR9XG5cblx0c3RhdGljIGpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRMaW5lSm9pbn0pO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdGxldCBsaW5lO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gocmVsYXRlZFNwaGVyZS5wb3NpdGlvbi5jbG9uZSgpKTtcblx0XHRsaW5lID0gbmV3IFRIUkVFLkxpbmUoZ2VvbWV0cnksIG1hdGVyaWFsKTtcblx0XHRtYWluQXJ0aXN0U3BoZXJlLmFkZChsaW5lKTtcblx0fVxuXG5cdHN0YXRpYyBwb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KSB7XG5cdFx0bGV0IG1haW5BcnRpc3RTcGhlcmVGYWNlID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlc1tNYXRoLmZsb29yKHNwaGVyZUZhY2VJbmRleCldLm5vcm1hbC5jbG9uZSgpO1xuXHRcdHJlbGF0ZWRTcGhlcmUucG9zaXRpb25cblx0XHRcdC5jb3B5KG1haW5BcnRpc3RTcGhlcmVGYWNlLm11bHRpcGx5KG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIGFkZFRleHQobGFiZWwsIHNpemUsIHNwaGVyZSkge1xuXHRcdGxldCBtYXRlcmlhbEZyb250ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy50ZXh0T3V0ZXJ9KTtcblx0XHRsZXQgbWF0ZXJpYWxTaWRlID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy50ZXh0SW5uZXJ9KTtcblx0XHRsZXQgbWF0ZXJpYWxBcnJheSA9IFttYXRlcmlhbEZyb250LCBtYXRlcmlhbFNpZGVdO1xuXHRcdGxldCB0ZXh0R2VvbSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkobGFiZWwsIHtcblx0XHRcdGZvbnQ6IEhFTFZFVElLRVIsXG5cdFx0XHRzaXplOiBzaXplLFxuXHRcdFx0Y3VydmVTZWdtZW50czogNCxcblx0XHRcdGJldmVsRW5hYmxlZDogdHJ1ZSxcblx0XHRcdGJldmVsVGhpY2tuZXNzOiAyLFxuXHRcdFx0YmV2ZWxTaXplOiAxLFxuXHRcdFx0YmV2ZWxTZWdtZW50czogM1xuXHRcdH0pO1xuXHRcdGxldCB0ZXh0TWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRleHRHZW9tLCBtYXRlcmlhbEFycmF5KTtcblx0XHR0ZXh0TWVzaC5pc1RleHQgPSB0cnVlO1xuXHRcdHNwaGVyZS5hZGQodGV4dE1lc2gpO1xuXHRcdHRleHRNZXNoLnBvc2l0aW9uLnNldCgtc3BoZXJlLnJhZGl1cywgLShzcGhlcmUucmFkaXVzICsgc2l6ZSAqIDIpLCAtc3BoZXJlLnJhZGl1cyAvIDIpO1xuXHR9XG5cblx0c3RhdGljIGxpZ2h0aW5nKCkge1xuXHRcdGxldCBsaWdodEEgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweENDQ0NDQywgMS43MjUpO1xuXHRcdGxldCBsaWdodEIgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweEFBQUFBQSwgMS41KTtcblx0XHRsaWdodEEucG9zaXRpb24uc2V0WCg1MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRZKC04MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRYKC01MDApO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEEpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEIpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiLyoqXG4gKiBTcGhlcmVzU2NlbmUgaXMgZGVzaWduZWQgdG8gaGFuZGxlIGFkZGluZyBhbmQgcmVtb3ZpbmcgZW50aXRpZXMgZnJvbSB0aGUgc2NlbmUsXG4gKiBhbmQgaGFuZGxpbmcgZXZlbnRzLlxuICpcbiAqIEl0IGFpbXMgdG8gZGVhbCBub3Qgd2l0aCBjaGFuZ2VzIG92ZXIgdGltZSwgb25seSBpbW1lZGlhdGUgY2hhbmdlcyBpbiBvbmUgZnJhbWUuXG4gKi9cbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSBcIi4uL2NvbmZpZy9jb2xvdXJzXCI7XG5pbXBvcnQge01vdGlvbkxhYn0gZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5pbXBvcnQge1Byb3BzfSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7aGlkZVJlbGF0ZWQsIHJlbGF0ZWRDbGljaywgc2hvd1JlbGF0ZWR9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmVzU2NlbmUge1xuXHRjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcblx0XHR0aGlzLm1vdGlvbkxhYiA9IG5ldyBNb3Rpb25MYWIoKTtcblxuXHRcdC8vIGF0dGFjaCB0byBkb21cblx0XHRQcm9wcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHRcdFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAncmVuZGVyZXInO1xuXHRcdFByb3BzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcblx0XHRQcm9wcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cblx0XHQvLyBpbml0IHRoZSBzY2VuZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnBvc2l0aW9uLnNldCgxLCA1LCAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuZ3JhcGhDb250YWluZXIpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLmNhbWVyYS5wb3NpdGlvbi5zZXQoMCwgMjUwLCBQcm9wcy5jYW1lcmFEaXN0YW5jZSk7XG5cdFx0UHJvcHMuY2FtZXJhLmxvb2tBdChQcm9wcy5zY2VuZS5wb3NpdGlvbik7XG5cdFx0U2NlbmVVdGlscy5saWdodGluZyhQcm9wcy5zY2VuZSk7XG5cblx0XHQvLyBjaGVjayBmb3IgcXVlcnkgc3RyaW5nXG5cdFx0Y29uc3QgYXJ0aXN0SWQgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKSk7XG5cdFx0aWYgKGFydGlzdElkKSB7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChhcnRpc3RJZCk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9zZVNjZW5lKGFydGlzdCkge1xuXHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdC5pZCk7XG5cdFx0UHJvcHMubWFpbkFydGlzdFNwaGVyZSA9IFNjZW5lVXRpbHMuY3JlYXRlTWFpbkFydGlzdFNwaGVyZShhcnRpc3QpO1xuXHRcdFByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzID0gU2NlbmVVdGlscy5jcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIFByb3BzLm1haW5BcnRpc3RTcGhlcmUpO1xuXHRcdFNjZW5lVXRpbHMuYXBwZW5kT2JqZWN0c1RvU2NlbmUoUHJvcHMuZ3JhcGhDb250YWluZXIsIFByb3BzLm1haW5BcnRpc3RTcGhlcmUsIFByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzKTtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KSB7XG5cdFx0bGV0IHNlbGVjdGVkO1xuXHRcdGxldCBpbnRlcnNlY3RzO1xuXHRcdGxldCBpc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5yYXljYXN0ZXIsIFByb3BzLmNhbWVyYSk7XG5cdFx0UHJvcHMubW91c2VJc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0UHJvcHMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHsgLy8gcmVzZXQgdGhlIHJlbGF0ZWQgc3BoZXJlIHRvIHJlZFxuXHRcdFx0XHRvYmoubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHsgLy8gbW91c2UgaXMgb3ZlciBhIE1lc2hcblx0XHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRzZWxlY3RlZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0O1xuXHRcdFx0aWYgKHNlbGVjdGVkLmhhc093blByb3BlcnR5KCdpc1JlbGF0ZWRBcnRpc3RTcGhlcmUnKSkge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChzaG93UmVsYXRlZChzZWxlY3RlZC5hcnRpc3RPYmopKTtcblx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdHNlbGVjdGVkLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzdG9yZS5kaXNwYXRjaChoaWRlUmVsYXRlZCgpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmUuZGlzcGF0Y2goaGlkZVJlbGF0ZWQoKSk7XG5cdFx0fVxuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdFx0cmV0dXJuIGlzT3ZlclJlbGF0ZWQ7XG5cdH1cblxuXHRvblNjZW5lTW91c2VEcmFnKGV2ZW50KSB7XG5cdFx0Y29uc3QgZHQgPSBQcm9wcy50MiAtIFByb3BzLnQxO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VQb3NYSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnggPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci54KTtcblx0XHRQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueSA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlggPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci54KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLngpKTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueSkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci55KSk7XG5cdFx0UHJvcHMuc3BlZWRYID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWCkgLyBkdCk7XG5cdFx0UHJvcHMuc3BlZWRZID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWSkgLyBkdCk7XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c3RvcmUuZGlzcGF0Y2gocmVsYXRlZENsaWNrKCkpO1xuXHRcdFx0XHR0aGlzLmdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIudHJhY2tPYmplY3RUb0NhbWVyYShzZWxlY3RlZFNwaGVyZSwgKCkgPT4ge1xuXHRcdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmouaWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJHcmFwaCgpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBQcm9wcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShwYXJlbnQpO1xuXHRcdH1cblx0fVxuXG5cdGNsZWFyQWRkcmVzcygpIHtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuXHR9XG5cblx0em9vbShkaXJlY3Rpb24pIHtcblx0XHRzd2l0Y2ggKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSAnaW4nOlxuXHRcdFx0XHRQcm9wcy5jYW1lcmFEaXN0YW5jZSAtPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvdXQnOlxuXHRcdFx0XHRQcm9wcy5jYW1lcmFEaXN0YW5jZSArPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlQ2FtZXJhQXNwZWN0KCkge1xuXHRcdFByb3BzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHRQcm9wcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHRcdFByb3BzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cdH1cbn0iLCJjb25zdCBNSU5fRElTVEFOQ0UgPSAxMDtcbmNvbnN0IE1BWF9ESVNUQU5DRSA9IDEwMDA7XG5jb25zdCBESVNUQU5DRV9TQ0FMQVIgPSA1MDtcbmNvbnN0IFNJWkVfU0NBTEFSID0gMS41O1xuXG5leHBvcnQgY2xhc3MgU3RhdGlzdGljcyB7XG4gICAgc3RhdGljIGdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCg0MCwgYXJ0aXN0LnBvcHVsYXJpdHkgKiBTSVpFX1NDQUxBUik7XG4gICAgfVxuXG5cdC8qKlxuICAgICAqIE1hcC1yZWR1Y2Ugb2YgdHdvIHN0cmluZyBhcnJheXNcblx0ICogQHBhcmFtIGFydGlzdFxuXHQgKiBAcGFyYW0gcmVsYXRlZEFydGlzdFxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fVxuXHQgKi9cblx0c3RhdGljIGdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCkge1xuXHRcdGxldCBtYXRjaGVzID0gYXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLm1hcCgobWFpbkFydGlzdEdlbnJlKSA9PiBTdGF0aXN0aWNzLm1hdGNoQXJ0aXN0VG9SZWxhdGVkR2VucmVzKG1haW5BcnRpc3RHZW5yZSwgcmVsYXRlZEFydGlzdCkpXG4gICAgICAgICAgICAucmVkdWNlKChhY2N1bXVsYXRvciwgbWF0Y2gpID0+IHtcblx0XHQgICAgICAgIGlmIChtYXRjaCkge1xuXHRcdCAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHR9XG5cdFx0ICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgICAgICAgICB9LCBbXSk7XG5cdFx0bGV0IGFydGlzdEdlbnJlQ291bnQgPSBhcnRpc3QuZ2VucmVzLmxlbmd0aCA/IGFydGlzdC5nZW5yZXMubGVuZ3RoIDogMTtcblx0XHRsZXQgdW5pdCA9IDEgLyBhcnRpc3RHZW5yZUNvdW50O1xuXHRcdHVuaXQgPSB1bml0ID09PSAxID8gMCA6IHVuaXQ7XG5cdFx0bGV0IGdlbnJlU2ltaWxhcml0eSA9IE1hdGgucm91bmQoKG1hdGNoZXMubGVuZ3RoICogdW5pdCkgKiAxMDApO1xuXHRcdGxldCBtaW5EaXN0YW5jZSA9ICgoYXJ0aXN0LnBvcHVsYXJpdHkgKyByZWxhdGVkQXJ0aXN0LnBvcHVsYXJpdHkpICogU0laRV9TQ0FMQVIpICsgTUlOX0RJU1RBTkNFO1xuXHRcdHJldHVybiB7XG5cdFx0XHRsaW5lTGVuZ3RoOiBNYXRoLm1heChtaW5EaXN0YW5jZSwgTUFYX0RJU1RBTkNFIC0gKG1hdGNoZXMubGVuZ3RoICogRElTVEFOQ0VfU0NBTEFSKSksXG5cdFx0XHRnZW5yZVNpbWlsYXJpdHk6IGdlbnJlU2ltaWxhcml0eVxuXHRcdH07XG5cdH1cblxuXHRzdGF0aWMgbWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiByZWxhdGVkQXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLmZpbmQoKGdlbnJlKSA9PiBnZW5yZSA9PT0gbWFpbkFydGlzdEdlbnJlKTtcbiAgICB9XG4gfSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5pbXBvcnQgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb250YWluZXJcIjtcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250YWluZXJcIj5cblx0XHRcdFx0PFNlYXJjaENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTY2VuZUNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTcG90aWZ5UGxheWVyQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RJbmZvQ29tcG9uZW50KHthcnRpc3QsIGlzSGlkZGVufSkge1xuXHRjb25zdCBnZW5yZXMgPSBhcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIG1haW4nIDogJ2luZm8tY29udGFpbmVyIG1haW4nO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hbWUtdGFnIG1haW5cIj57YXJ0aXN0Lm5hbWV9PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBvcHVsYXJpdHlcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPlBvcHVsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e2FydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZ2VucmVzXCI+e2dlbnJlc308L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmV4cG9ydCBjbGFzcyBBcnRpc3RMaXN0Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdGhhbmRsZUdldEFydGlzdChldnQsIGFydGlzdElkKSB7XG5cdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBhcnRpc3RzID0gdGhpcy5wcm9wcy52aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdFx0bGV0IGhyZWYgPSAnL2FwcC8jJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFx0bGV0IGltZ1VybCA9IGFydGlzdC5pbWFnZXMgJiYgYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0XHRsZXQgaW1nU3R5bGUgPSB7IGJhY2tncm91bmRJbWFnZTogYHVybCgke2ltZ1VybH0pYCB9O1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdFx0PGEgaHJlZj17aHJlZn0gaWQ9e2FydGlzdC5pZH0gY2xhc3NOYW1lPVwibmF2LWFydGlzdC1saW5rXCJcblx0XHRcdFx0XHQgICBvbkNsaWNrPXsoZXZlbnQpID0+IHsgdGhpcy5oYW5kbGVHZXRBcnRpc3QoZXZlbnQsIGFydGlzdC5pZCkgfX0+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmUtaG9sZGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGljdHVyZVwiIHN0eWxlPXtpbWdTdHlsZX0gLz5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibmFtZVwiPnthcnRpc3QubmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdClcblx0XHR9KTtcblx0XHRjb25zdCBjbGFzc2VzID0gdGhpcy5wcm9wcy5pc0hpZGRlbiA/ICdoaWRkZW4gYXJ0aXN0LW5hdmlnYXRpb24nIDogJ2FydGlzdC1uYXZpZ2F0aW9uJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0XHR7YXJ0aXN0c31cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCh7cmVsYXRlZEFydGlzdCwgaGlkZVJlbGF0ZWQsIGhpZGVJbmZvfSkge1xuXHRjb25zdCBoaWRkZW5DbGFzcyA9IGhpZGVSZWxhdGVkIHx8IGhpZGVJbmZvID8gJ2hpZGRlbiBpbmZvLWNvbnRhaW5lciByZWxhdGVkJyA6ICdpbmZvLWNvbnRhaW5lciByZWxhdGVkJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17aGlkZGVuQ2xhc3N9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3QtbmFtZS10YWcgcmVsYXRlZFwiPntyZWxhdGVkQXJ0aXN0Lm5hbWV9PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBvcHVsYXJpdHlcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPlBvcHVsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e3JlbGF0ZWRBcnRpc3QucG9wdWxhcml0eX08L3NwYW4+PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+R2VucmUgc2ltaWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57cmVsYXRlZEFydGlzdC5nZW5yZVNpbWlsYXJpdHl9JTwvc3Bhbj48L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi4vY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtTcGhlcmVzU2NlbmV9IGZyb20gXCIuLi9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3NcIjtcbmltcG9ydCB7cmVsYXRlZENsaWNrfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwaGVyZXMtc2NlbmVcIiByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19Lz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKS50aGVuKCgpID0+IHsgLy8gbG9hZCB0aGUgZm9udCBmaXJzdCAoYXN5bmMpXG5cdFx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0fVxuXG5cdGluaXRTY2VuZSgpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNsZWFyR3JhcGgoKTtcblx0XHRcdHRoaXMuc2NlbmUuY2xlYXJBZGRyZXNzKCk7XG5cdFx0fVxuXHR9XG5cblx0aGFuZGxlRXZlbnQoZXZlbnQpIHtcblx0XHR0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcblx0fVxuXG5cdGNsaWNrKGV2ZW50KSB7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAoIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VDbGljayhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlbW92ZShldmVudCkge1xuXHRcdGxldCBpc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiJztcblx0XHRpZiAodGhpcy5tb3VzZUlzRG93bikge1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlRHJhZyhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KTtcblx0XHR9XG5cdFx0aWYgKGlzT3ZlclJlbGF0ZWQgJiYgIXRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBwb2ludGVyJztcblx0XHR9XG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xuXHRcdFx0dGhpcy5zY2VuZURvbS5jbGFzc05hbWUgPSAnc3BoZXJlcy1zY2VuZSBncmFiYmVkJztcblx0XHR9XG5cdH1cblxuXHRtb3VzZWRvd24oKSB7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IHRydWU7XG5cdH1cblxuXHRtb3VzZXVwKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSBmYWxzZTtcblx0fVxuXG5cdG1vdXNld2hlZWwoZXZlbnQpIHtcblx0XHRzd2l0Y2ggKFNjZW5lVXRpbHMuc2lnbihldmVudC53aGVlbERlbHRhWSkpIHtcblx0XHRcdGNhc2UgLTE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnb3V0Jyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ2luJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLnNjZW5lLnVwZGF0ZUNhbWVyYUFzcGVjdCgpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgYXJ0aXN0LCBoYW5kbGVTZWFyY2gsIGhhbmRsZVNlYXJjaFRlcm1VcGRhdGUsIGNsZWFyU2Vzc2lvbn0pIHtcbiAgICBjb25zdCBjbGVhckJ0bkNsYXNzID0gYXJ0aXN0LmlkID8gJ2NsZWFyLXNlc3Npb24nIDogJ2hpZGRlbiBjbGVhci1zZXNzaW9uJztcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPXtjbGVhckJ0bkNsYXNzfSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KGV2dCkgPT4gY2xlYXJTZXNzaW9uKGV2dCl9PkNsZWFyIFNlc3Npb248L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQoe2FydGlzdCwgaXNIaWRkZW59KSB7XG5cdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZC9hcnRpc3QvJztcblx0Y29uc3QgYXJ0aXN0RW1iZWRVcmwgPSBgJHtlbWJlZFVybH0ke2FydGlzdC5pZH1gO1xuXHRsZXQgaUZyYW1lTWFya3VwID0gJyc7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBzcG90aWZ5LXBsYXllci1jb250YWluZXInIDogJ3Nwb3RpZnktcGxheWVyLWNvbnRhaW5lcic7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHQ8L2Rpdj5cblx0KVxufSIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3QsXG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cbmNvbnN0IEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdEluZm9Db250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RMaXN0Q29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnRcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHR2aXNpdGVkQXJ0aXN0czogc3RhdGUudmlzaXRlZEFydGlzdHMsXG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RMaXN0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0TGlzdENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1JlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0cmVsYXRlZEFydGlzdDogc3RhdGUucmVsYXRlZEFydGlzdCxcblx0XHRoaWRlUmVsYXRlZDogc3RhdGUuaGlkZVJlbGF0ZWQsXG5cdFx0aGlkZUluZm86IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cbmNvbnN0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFJlbGF0ZWRBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtTY2VuZUNvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTY2VuZUNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShTY2VuZUNvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7IFNlYXJjaElucHV0Q29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy9zZWFyY2gtaW5wdXQuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQgeyBNdXNpY0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7Y2xlYXJTZXNzaW9uLCB1cGRhdGVTZWFyY2hUZXJtfSBmcm9tICcuLi9zdGF0ZS9hY3Rpb25zJztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0c2VhcmNoVGVybTogc3RhdGUuc2VhcmNoVGVybSxcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYW5kbGVTZWFyY2g6IChldnQsIGFydGlzdE5hbWUpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5zZWFyY2goYXJ0aXN0TmFtZSk7XG5cdFx0fSxcblx0XHRoYW5kbGVTZWFyY2hUZXJtVXBkYXRlOiAoZXZ0KSA9PiB7XG5cdFx0XHRkaXNwYXRjaCh1cGRhdGVTZWFyY2hUZXJtKGV2dC50YXJnZXQudmFsdWUpKTtcblx0XHR9LFxuXHRcdGNsZWFyU2Vzc2lvbjogKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRkaXNwYXRjaChjbGVhclNlc3Npb24oKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdCxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgU3BvdGlmeVBsYXllckNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShTcG90aWZ5UGxheWVyQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU3BvdGlmeVBsYXllckNvbnRhaW5lcjtcbiIsImltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7YXJ0aXN0RGF0YUF2YWlsYWJsZX0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIE11c2ljRGF0YVNlcnZpY2Uge1xuXHRzdGF0aWMgc2VhcmNoKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGdldEFydGlzdChhcnRpc3RJZCkge1xuXHRcdGxldCBhcnRpc3RVUkwgPSAnL2FwaS9hcnRpc3QvJyArIGFydGlzdElkO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goYXJ0aXN0VVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogXCJzYW1lLW9yaWdpblwiXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdERhdGFBdmFpbGFibGUoanNvbikpKTtcblx0fVxufSIsImV4cG9ydCBjb25zdCBBUlRJU1RfREFUQV9BVkFJTEFCTEUgPSAnQVJUSVNUX0RBVEFfQVZBSUxBQkxFJztcbmV4cG9ydCBjb25zdCBTRUFSQ0hfVEVSTV9VUERBVEUgPSAnU0VBUkNIX1RFUk1fVVBEQVRFJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0NMSUNLID0gJ1JFTEFURURfQ0xJQ0snO1xuZXhwb3J0IGNvbnN0IFNIT1dfUkVMQVRFRCA9ICdTSE9XX1JFTEFURUQnO1xuZXhwb3J0IGNvbnN0IEhJREVfUkVMQVRFRCA9ICdISURFX1JFTEFURUQnO1xuZXhwb3J0IGNvbnN0IENMRUFSX1NFU1NJT04gPSAnQ0xFQVJfU0VTU0lPTic7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnRpc3REYXRhQXZhaWxhYmxlKGRhdGEpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBBUlRJU1RfREFUQV9BVkFJTEFCTEUsXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZWFyY2hUZXJtKHNlYXJjaFRlcm0pIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTRUFSQ0hfVEVSTV9VUERBVEUsXG5cdFx0c2VhcmNoVGVybTogc2VhcmNoVGVybVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGVkQ2xpY2soKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogUkVMQVRFRF9DTElDS1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93UmVsYXRlZChyZWxhdGVkQXJ0aXN0KSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0hPV19SRUxBVEVELFxuXHRcdGRhdGE6IHJlbGF0ZWRBcnRpc3Rcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZVJlbGF0ZWQoKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogSElERV9SRUxBVEVELFxuXHRcdGRhdGE6IG51bGxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IENMRUFSX1NFU1NJT05cblx0fVxufVxuIiwiaW1wb3J0IHtcblx0U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEUsIFJFTEFURURfQ0xJQ0ssIFNIT1dfUkVMQVRFRCwgSElERV9SRUxBVEVELFxuXHRDTEVBUl9TRVNTSU9OXG59IGZyb20gJy4uL2FjdGlvbnMnXG5sZXQgaW5pdGlhbFN0YXRlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnc3RhdGUnKTtcbmNvbnN0IGVtcHR5QXJ0aXN0ID0ge1xuXHRpZDogJycsXG5cdG5hbWU6ICcnLFxuXHRpbWdVcmw6ICcnLFxuXHRnZW5yZXM6IFtdLFxuXHRwb3B1bGFyaXR5OiAwLFxuXHRpbWFnZXM6IFtdXG59O1xuY29uc3QgZW1wdHlTdGF0ZSA9IHtcblx0YXJ0aXN0OiBlbXB0eUFydGlzdCxcblx0c2VhcmNoVGVybTogJycsXG5cdHZpc2l0ZWRBcnRpc3RzOiBbXSxcblx0aGlkZUluZm86IHRydWUsXG5cdHJlbGF0ZWRBcnRpc3Q6IGVtcHR5QXJ0aXN0LFxuXHRzaG93UmVsYXRlZDogZmFsc2Vcbn07XG5cbmlmICghaW5pdGlhbFN0YXRlKSB7XG5cdGluaXRpYWxTdGF0ZSA9IHtcblx0XHQuLi5lbXB0eVN0YXRlXG5cdH07XG59IGVsc2Uge1xuXHRpbml0aWFsU3RhdGUgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJykpO1xufVxuXG5jb25zdCBhcnRpc3RTZWFyY2ggPSAoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikgPT4ge1xuXHRsZXQgbmV3U3RhdGU7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLnNlYXJjaFRlcm0sXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBUlRJU1RfREFUQV9BVkFJTEFCTEU6XG5cdFx0XHRpZiAoYWN0aW9uLmRhdGEuaWQpIHtcblx0XHRcdFx0bGV0IGFscmVhZHlWaXNpdGVkID0gISFzdGF0ZS52aXNpdGVkQXJ0aXN0cy5sZW5ndGggJiYgc3RhdGUudmlzaXRlZEFydGlzdHMuc29tZSgoYXJ0aXN0KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXJ0aXN0LmlkID09PSBhY3Rpb24uZGF0YS5pZDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0bGV0IHZpc2l0ZWRBcnRpc3RzID0gYWxyZWFkeVZpc2l0ZWQgPyBzdGF0ZS52aXNpdGVkQXJ0aXN0cyA6IFsuLi5zdGF0ZS52aXNpdGVkQXJ0aXN0cywgYWN0aW9uLmRhdGFdO1xuXHRcdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0XHRhcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRcdHZpc2l0ZWRBcnRpc3RzOiBbXG5cdFx0XHRcdFx0XHQuLi52aXNpdGVkQXJ0aXN0cyxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5kYXRhLm5hbWUsXG5cdFx0XHRcdFx0aGlkZUluZm86IGZhbHNlLFxuXHRcdFx0XHRcdGhpZGVSZWxhdGVkOiB0cnVlLFxuXHRcdFx0XHRcdHJlbGF0ZWRBcnRpc3Q6IHtcblx0XHRcdFx0XHRcdC4uLmVtcHR5QXJ0aXN0XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdObyBBUEkgZGF0YSBhdmFpbGFibGUgZm9yIGdpdmVuIGFydGlzdC4gTmVlZCB0byByZWZyZXNoIEFQSSBzZXNzaW9uPycpO1xuXHRcdFx0XHRuZXdTdGF0ZSA9IHN0YXRlO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBSRUxBVEVEX0NMSUNLOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRoaWRlSW5mbzogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgU0hPV19SRUxBVEVEOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0aGlkZVJlbGF0ZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBISURFX1JFTEFURUQ6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHJlbGF0ZWRBcnRpc3Q6IHtcblx0XHRcdFx0XHQuLi5lbXB0eUFydGlzdFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoaWRlUmVsYXRlZDogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQ0xFQVJfU0VTU0lPTjpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5lbXB0eVN0YXRlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdH1cblx0d2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3N0YXRlJywgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpKTtcblx0cmV0dXJuIG5ld1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXJ0aXN0U2VhcmNoOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcnRpc3RTZWFyY2ggZnJvbSBcIi4vcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaFwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFydGlzdFNlYXJjaCxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
