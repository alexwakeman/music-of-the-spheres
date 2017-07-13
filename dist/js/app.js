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
         * @returns {number}
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
												return Math.max(300, matches.length * DISTANCE_SCALAR);
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
                React.createElement(_spotifyPlayer2.default, null),
                React.createElement(_scene2.default, null),
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
		null,
		React.createElement(
			'div',
			{ className: 'artist-name-tag main' },
			React.createElement(
				'span',
				{ className: 'title' },
				artist.name
			)
		),
		React.createElement(
			'div',
			{ className: classes },
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
	    showRelated = _ref.showRelated;

	var genres = relatedArtist.genres.map(function (genre) {
		return React.createElement(
			'span',
			{ className: 'pill', key: genre },
			genre
		);
	});
	var classes = showRelated ? 'info-container related' : 'hidden info-container related';
	return React.createElement(
		'div',
		null,
		React.createElement(
			'div',
			{ className: 'artist-name-tag related' },
			React.createElement(
				'span',
				{ className: 'title' },
				relatedArtist.name
			)
		),
		React.createElement(
			'div',
			{ className: classes },
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
				genres
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
		showRelated: state.showRelated
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
var ARTIST_DATA_AVAILABLE = exports.ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
var RELATED_CLICK = exports.RELATED_CLICK = 'RELATED_CLICK';
var SHOW_RELATED = exports.SHOW_RELATED = 'SHOW_RELATED';
var HIDE_RELATED = exports.HIDE_RELATED = 'HIDE_RELATED';

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

},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actions = require('../actions');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = sessionStorage.getItem('state');

if (!initialState) {
	initialState = {
		artist: {
			id: '',
			name: '',
			imgUrl: '',
			genres: [],
			popularity: 0,
			images: []
		},
		searchTerm: '',
		visitedArtists: [],
		hideInfo: true,
		relatedArtist: {
			genres: [],
			popularity: 0,
			id: '',
			name: ''
		},
		showRelated: false
	};
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
					hideInfo: false
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
				showRelated: true
			});
			break;
		case _actions.HIDE_RELATED:
			newState = _extends({}, state, {
				relatedArtist: {
					genres: [],
					popularity: 0,
					id: '',
					name: ''
				},
				showRelated: false
			});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3JlbGF0ZWQtYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoLmpzIiwic3JjL2pzL3N0YXRlL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7SUFBWSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLE1BQVQsQ0FDQztBQUFBO0FBQUEsR0FBVSxtQkFBVjtBQUNDO0FBREQsQ0FERCxFQUlDLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUpEOzs7Ozs7Ozs7O3FqQkNOQTs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0lBQVksSzs7Ozs7O0FBRVosSUFBTSxtQkFBbUIsa0JBQXpCO0FBQ0EsSUFBTSxVQUFVLFNBQWhCO0FBQ0EsSUFBTSxhQUFhO0FBQ2xCLE9BQU07QUFEWSxDQUFuQjs7SUFJYSxTLFdBQUEsUztBQUNULHNCQUFjO0FBQUE7O0FBQ2hCLE9BQUssR0FBTCxHQUFXLFVBQVg7QUFDQSxPQUFLLE9BQUw7QUFDQTs7Ozs0QkFFUztBQUFBOztBQUNULGdCQUFNLEVBQU4sR0FBVyxLQUFLLEdBQUwsRUFBWDtBQUNBLFFBQUssWUFBTDtBQUNBLGdCQUFNLFFBQU4sQ0FBZSxNQUFmLENBQXNCLGFBQU0sS0FBNUIsRUFBbUMsYUFBTSxNQUF6QztBQUNBLFVBQU8scUJBQVAsQ0FBNkIsWUFBTTtBQUNsQyxpQkFBTSxFQUFOLEdBQVcsYUFBTSxFQUFqQjtBQUNBLFVBQUssT0FBTCxDQUFhLElBQWI7QUFDQSxJQUhEO0FBSUE7OztpQ0FFYztBQUNkLFdBQVEsS0FBSyxHQUFMLENBQVMsSUFBakI7QUFDQyxTQUFLLGdCQUFMO0FBQ0MsVUFBSyx5QkFBTDtBQUNBO0FBQ0QsU0FBSyxPQUFMO0FBQ0MsVUFBSyxjQUFMO0FBQ0E7QUFORjtBQVFBOzs7OENBRTJCO0FBQzNCLE9BQU0sWUFBWSxTQUFTLEtBQUssR0FBTCxDQUFTLFdBQWxCLE1BQW1DLENB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QUFDRDtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLGNBQVU7QUFGWDtBQUlBO0FBQ0Q7QUFDQywyQkFDSSxLQURKO0FBRUMsbUJBQWUsT0FBTyxJQUZ2QjtBQUdDLGlCQUFhO0FBSGQ7QUFLQTtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLG1CQUFlO0FBQ2QsYUFBUSxFQURNO0FBRWQsaUJBQVksQ0FGRTtBQUdkLFNBQUksRUFIVTtBQUlkLFdBQU07QUFKUSxLQUZoQjtBQVFDLGlCQUFhO0FBUmQ7QUFVQTtBQUNEO0FBQ0MsY0FBVyxLQUFYO0FBckRGO0FBdURBLFFBQU8sY0FBUCxDQUFzQixPQUF0QixDQUE4QixPQUE5QixFQUF1QyxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXZDO0FBQ0EsUUFBTyxRQUFQO0FBQ0EsQ0EzREQ7O2tCQTZEZSxZOzs7Ozs7Ozs7O0FDekZmOztBQUNBOzs7Ozs7QUFFTyxJQUFJLHdCQUFRLGdEQUVsQixPQUFPLDRCQUFQLElBQXVDLE9BQU8sNEJBQVAsRUFGckIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7QXBwQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvYXBwLmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuUmVhY3RET00ucmVuZGVyKFxuXHQ8UHJvdmlkZXIgc3RvcmU9e3N0b3JlfT5cblx0XHQ8QXBwQ29tcG9uZW50IC8+XG5cdDwvUHJvdmlkZXI+LFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpXG4pOyIsIi8qKlxuICogTW90aW9uTGFiIGRlYWxzIHdpdGggY29udHJvbGxpbmcgZWFjaCB0aWNrIG9mIHRoZSBhbmltYXRpb24gZnJhbWUgc2VxdWVuY2VcbiAqIEl0J3MgYWltIGlzIHRvIGlzb2xhdGUgY29kZSB0aGF0IGhhcHBlbnMgb3ZlciBhIG51bWJlciBvZiBmcmFtZXMgKGkuZS4gbW90aW9uKVxuICovXG5pbXBvcnQge1Byb3BzfSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jb25zdCBUUkFDS19DQU1fVE9fT0JKID0gJ1RSQUNLX0NBTV9UT19PQkonO1xuY29uc3QgREVGQVVMVCA9ICdERUZBVUxUJztcbmNvbnN0IGRlZmF1bHRKb2IgPSB7XG5cdHR5cGU6IERFRkFVTFRcbn07XG5cbmV4cG9ydCBjbGFzcyBNb3Rpb25MYWIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuam9iID0gZGVmYXVsdEpvYjtcblx0XHR0aGlzLmFuaW1hdGUoKTtcblx0fVxuXG5cdGFuaW1hdGUoKSB7XG5cdFx0UHJvcHMudDIgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucHJvY2Vzc1NjZW5lKCk7XG5cdFx0UHJvcHMucmVuZGVyZXIucmVuZGVyKFByb3BzLnNjZW5lLCBQcm9wcy5jYW1lcmEpO1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXHRcdFx0UHJvcHMudDEgPSBQcm9wcy50Mjtcblx0XHRcdHRoaXMuYW5pbWF0ZS5jYWxsKHRoaXMpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvY2Vzc1NjZW5lKCkge1xuXHRcdHN3aXRjaCAodGhpcy5qb2IudHlwZSkge1xuXHRcdFx0Y2FzZSBUUkFDS19DQU1fVE9fT0JKOlxuXHRcdFx0XHR0aGlzLnRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERFRkFVTFQ6XG5cdFx0XHRcdHRoaXMudXBkYXRlUm90YXRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpIHtcblx0XHRjb25zdCBzaG91bGRFbmQgPSBwYXJzZUludCh0aGlzLmpvYi5jdXJyZW50VGltZSkgPT09IDE7XG5cdFx0aWYgKCFzaG91bGRFbmQpIHtcblx0XHRcdHRoaXMuZm9sbG93UGF0aCgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuZW5kQW5pbWF0aW9uKCk7XG5cdFx0fVxuXHR9XG5cblx0Zm9sbG93UGF0aCgpIHtcblx0XHRjb25zdCBwID0gdGhpcy5qb2IucGF0aC5nZXRQb2ludCh0aGlzLmpvYi5jdXJyZW50VGltZSk7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QucG9zaXRpb24uY29weShwKTtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSArPSAwLjAxO1xuXHR9XG5cblx0ZW5kQW5pbWF0aW9uKCkge1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrICYmIHRoaXMuam9iLmNhbGxiYWNrKCk7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHR9XG5cblx0dHJhY2tPYmplY3RUb0NhbWVyYShvYmplY3QzRCwgY2FsbGJhY2spIHtcbiAgICBcdHRoaXMuam9iID0ge307XG4gICAgXHR0aGlzLmpvYi50eXBlID0gVFJBQ0tfQ0FNX1RPX09CSjtcblx0XHR0aGlzLmpvYi50ID0gMC4wO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lID0gMC4wO1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QgPSBvYmplY3QzRDtcblx0XHR0aGlzLmpvYi5lbmRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuam9iLnBhdGggPSBuZXcgVEhSRUUuQ2F0bXVsbFJvbUN1cnZlMyhbXG5cdFx0XHRvYmplY3QzRC5wb3NpdGlvbi5jbG9uZSgpLFxuXHRcdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKClcblx0XHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUT0RPOiBvcHRpbWlzYXRpb24gLSBvbmx5IHVzZSB1cGRhdGVSb3RhdGlvbigpIGlmIHRoZSBtb3VzZSBpcyBkcmFnZ2luZyAvIHNwZWVkIGlzIGFib3ZlIGRlZmF1bHQgbWluaW11bVxuXHQgKiBSb3RhdGlvbiBvZiBjYW1lcmEgaXMgKmludmVyc2UqIG9mIG1vdXNlIG1vdmVtZW50IGRpcmVjdGlvblxuXHQgKi9cblx0dXBkYXRlUm90YXRpb24oKSB7XG5cdFx0Y29uc3QgY2FtUXVhdGVybmlvblVwZGF0ZSA9IHRoaXMuZ2V0TmV3Q2FtZXJhRGlyZWN0aW9uKCk7XG5cdFx0UHJvcHMuY2FtZXJhLnBvc2l0aW9uLnNldChcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueCAqIFByb3BzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS55ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnogKiBQcm9wcy5jYW1lcmFEaXN0YW5jZVxuXHRcdCk7XG5cdFx0UHJvcHMuY2FtZXJhLmxvb2tBdChQcm9wcy5jYW1lcmFMb29rQXQpO1xuXHRcdC8vIHVwZGF0ZSByb3RhdGlvbiBvZiB0ZXh0IGF0dGFjaGVkIG9iamVjdHMsIHRvIGZvcmNlIHRoZW0gdG8gbG9vayBhdCBjYW1lcmFcblx0XHQvLyB0aGlzIG1ha2VzIHRoZW0gcmVhZGFibGVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci50cmF2ZXJzZSgob2JqKSA9PiB7XG5cdFx0XHRpZiAob2JqLmhhc093blByb3BlcnR5KCdpc1RleHQnKSkge1xuXHRcdFx0XHRvYmoubG9va0F0KFByb3BzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbChQcm9wcy5jYW1lcmEucG9zaXRpb24pKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnJlZHVjZVNwZWVkKDAuMDAwNSk7XG5cdH1cblxuXHRnZXROZXdDYW1lcmFEaXJlY3Rpb24oKSB7XG5cdFx0bGV0IGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdFx0Y29uc3QgeU1vcmVUaGFuWE1vdXNlID0gUHJvcHMubW91c2VQb3NEaWZmWSA+PSBQcm9wcy5tb3VzZVBvc0RpZmZYO1xuXHRcdGNvbnN0IHhNb3JlVGhhbllNb3VzZSA9ICF5TW9yZVRoYW5YTW91c2U7XG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnggLT0gUHJvcHMuc3BlZWRYO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCArPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXG5cdFx0aWYgKFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdFByb3BzLmNhbWVyYVJvdGF0aW9uLnkgKz0gUHJvcHMuc3BlZWRZO1xuXHRcdH1cblx0XHRlbHNlIGlmICghUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSAtPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUgPSBTY2VuZVV0aWxzLnJlbm9ybWFsaXplUXVhdGVybmlvbihQcm9wcy5jYW1lcmEpO1xuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUuc2V0RnJvbUV1bGVyKFByb3BzLmNhbWVyYVJvdGF0aW9uKTtcblx0XHRyZXR1cm4gY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmIChQcm9wcy5zcGVlZFggPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRYIC09IGFtb3VudDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdFByb3BzLnNwZWVkWSAtPSBhbW91bnQ7XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmV4cG9ydCBjb25zdCBQcm9wcyA9IHtcblx0cmVuZGVyZXI6IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSksXG5cdHNjZW5lOiBuZXcgVEhSRUUuU2NlbmUoKSxcblx0Y2FtZXJhOiBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCksXG5cdGdyYXBoQ29udGFpbmVyOiBuZXcgVEhSRUUuT2JqZWN0M0QoKSxcblx0Y2FtZXJhUm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigwLCAtMSwgMCksXG5cdGNhbWVyYUxvb2tBdDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXG5cdGNhbWVyYURpc3RhbmNlOiAzNTAwLFxuXHRcblx0dDE6IDAuMCwgLy8gb2xkIHRpbWVcblx0dDI6IDAuMCwgLy8gbm93IHRpbWVcblx0c3BlZWRYOiAwLjAwNSxcblx0c3BlZWRZOiAwLjAwMCxcblx0bW91c2VQb3NEaWZmWDogMC4wLFxuXHRtb3VzZVBvc0RpZmZZOiAwLjAsXG5cdG1vdXNlUG9zWEluY3JlYXNlZDogZmFsc2UsXG5cdG1vdXNlUG9zWUluY3JlYXNlZDogZmFsc2UsXG5cdHJheWNhc3RlcjogbmV3IFRIUkVFLlJheWNhc3RlcigpLFxuXHRtb3VzZVZlY3RvcjogbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XG5cdHJlbGF0ZWRBcnRpc3RTcGhlcmVzOiBbXSxcblx0bWFpbkFydGlzdFNwaGVyZToge31cbn07IiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gJy4uL2NvbmZpZy9jb2xvdXJzJztcbmltcG9ydCB7UHJvcHN9IGZyb20gXCIuL3Byb3BzXCI7XG5pbXBvcnQge1N0YXRpc3RpY3N9IGZyb20gXCIuL3N0YXRpc3RpY3MuY2xhc3NcIjtcblxubGV0IEhFTFZFVElLRVI7XG5jb25zdCBNQUlOX0FSVElTVF9GT05UX1NJWkUgPSAzNDtcbmNvbnN0IFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSA9IDIwO1xuY29uc3QgVE9UQUxfUkVMQVRFRCA9IDEwO1xuXG5jbGFzcyBTY2VuZVV0aWxzIHtcblx0c3RhdGljIGluaXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0XHRsb2FkZXIubG9hZCgnLi9qcy9mb250cy9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbicsIChmb250KSA9PiB7XG5cdFx0XHRcdEhFTFZFVElLRVIgPSBmb250O1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAoKT0+e30sIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhIC0gbWluXG5cdCAqIEBwYXJhbSBiIC0gbWF4XG5cdCAqIEBwYXJhbSBjIC0gdmFsdWUgdG8gY2xhbXBcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBjbGFtcChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KGIsIE1hdGgubWluKGMsIGEpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBwb3NpdGl2ZSB4IHJldHVybiAxLCBuZWdhdGl2ZSB4IHJldHVybiAtMSwgb3IgMCBvdGhlcndpc2Vcblx0ICogQHBhcmFtIHhcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHN0YXRpYyBzaWduKG4pIHtcblx0XHRyZXR1cm4gbiA+IDAgPyAxIDogbiA8IDAgPyAtMSA6IDA7XG5cdH07XG5cdFxuXHRzdGF0aWMgcmVub3JtYWxpemVRdWF0ZXJuaW9uKG9iamVjdCkge1xuXHRcdGxldCBjbG9uZSA9IG9iamVjdC5jbG9uZSgpO1xuXHRcdGxldCBxID0gY2xvbmUucXVhdGVybmlvbjtcblx0XHRsZXQgbWFnbml0dWRlID0gTWF0aC5zcXJ0KE1hdGgucG93KHEudywgMikgKyBNYXRoLnBvdyhxLngsIDIpICsgTWF0aC5wb3cocS55LCAyKSArIE1hdGgucG93KHEueiwgMikpO1xuXHRcdHEudyAvPSBtYWduaXR1ZGU7XG5cdFx0cS54IC89IG1hZ25pdHVkZTtcblx0XHRxLnkgLz0gbWFnbml0dWRlO1xuXHRcdHEueiAvPSBtYWduaXR1ZGU7XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhncmFwaCwgcmF5Y2FzdGVyLCBjYW1lcmEpIHtcblx0XHRyYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShQcm9wcy5tb3VzZVZlY3RvciwgY2FtZXJhKTtcblx0XHRyZXR1cm4gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoZ3JhcGguY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGdldE1vdXNlVmVjdG9yKGV2ZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IyKChldmVudC5jbGllbnRYIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50SGVpZ2h0KSAqIDIgKyAxKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCkge1xuXHRcdGxldCByYWRpdXMgPSBTdGF0aXN0aWNzLmdldEFydGlzdFNwaGVyZVNpemUoYXJ0aXN0KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCAzNSwgMzUpO1xuXHRcdGxldCBzcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLm1haW5BcnRpc3R9KSk7XG5cdFx0c3BoZXJlLmFydGlzdE9iaiA9IGFydGlzdDtcblx0XHRzcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdHNwaGVyZS5pc01haW5BcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdHNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0U2NlbmVVdGlscy5hZGRUZXh0KGFydGlzdC5uYW1lLCBNQUlOX0FSVElTVF9GT05UX1NJWkUsIHNwaGVyZSk7XG5cdFx0cmV0dXJuIHNwaGVyZTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIG1haW5BcnRpc3RTcGhlcmUpIHtcblx0XHRsZXQgcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheSA9IFtdO1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0O1xuXHRcdGxldCBzcGhlcmVGYWNlSW5kZXggPSAwO1xuXHRcdGxldCBmYWNlc0NvdW50ID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxO1xuXHRcdGxldCBzdGVwID0gTWF0aC5yb3VuZChmYWNlc0NvdW50IC8gVE9UQUxfUkVMQVRFRCAtIDEpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbiA9IE1hdGgubWluKFRPVEFMX1JFTEFURUQsIGFydGlzdC5yZWxhdGVkLmxlbmd0aCk7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdCA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShyZWxhdGVkQXJ0aXN0KTtcblx0XHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0XHRsZXQgcmVsYXRlZEFydGlzdFNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZEFydGlzdH0pKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqID0gcmVsYXRlZEFydGlzdDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1JlbGF0ZWRBcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmRpc3RhbmNlID0gU3RhdGlzdGljcy5nZXRTaGFyZWRHZW5yZU1ldHJpYyhhcnRpc3QsIHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0Lm5hbWUsIFJFTEFURURfQVJUSVNUX0ZPTlRfU0laRSwgcmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5LnB1c2gocmVsYXRlZEFydGlzdFNwaGVyZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5O1xuXHR9XG5cblx0c3RhdGljIGFwcGVuZE9iamVjdHNUb1NjZW5lKGdyYXBoQ29udGFpbmVyLCBzcGhlcmUsIHNwaGVyZUFycmF5KSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cdFx0cGFyZW50Lm5hbWUgPSAncGFyZW50Jztcblx0XHRwYXJlbnQuYWRkKHNwaGVyZSk7XG5cdFx0aWYgKHNwaGVyZUFycmF5KSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwaGVyZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHBhcmVudC5hZGQoc3BoZXJlQXJyYXlbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRncmFwaENvbnRhaW5lci5hZGQocGFyZW50KTtcblx0fVxuXG5cdHN0YXRpYyBqb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlKSB7XG5cdFx0bGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkTGluZUpvaW59KTtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblx0XHRsZXQgbGluZTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblx0XHRnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHJlbGF0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0bGluZSA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdFx0bWFpbkFydGlzdFNwaGVyZS5hZGQobGluZSk7XG5cdH1cblxuXHRzdGF0aWMgcG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCkge1xuXHRcdGxldCBtYWluQXJ0aXN0U3BoZXJlRmFjZSA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXNbTWF0aC5mbG9vcihzcGhlcmVGYWNlSW5kZXgpXS5ub3JtYWwuY2xvbmUoKTtcblx0XHRyZWxhdGVkU3BoZXJlLnBvc2l0aW9uXG5cdFx0XHQuY29weShtYWluQXJ0aXN0U3BoZXJlRmFjZS5tdWx0aXBseShuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBhZGRUZXh0KGxhYmVsLCBzaXplLCBzcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogc2l6ZSxcblx0XHRcdGN1cnZlU2VnbWVudHM6IDQsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMixcblx0XHRcdGJldmVsU2l6ZTogMSxcblx0XHRcdGJldmVsU2VnbWVudHM6IDNcblx0XHR9KTtcblx0XHRsZXQgdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0ZXh0R2VvbSwgbWF0ZXJpYWxBcnJheSk7XG5cdFx0dGV4dE1lc2guaXNUZXh0ID0gdHJ1ZTtcblx0XHRzcGhlcmUuYWRkKHRleHRNZXNoKTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoLXNwaGVyZS5yYWRpdXMsIC0oc3BoZXJlLnJhZGl1cyArIHNpemUgKiAyKSwgLXNwaGVyZS5yYWRpdXMgLyAyKTtcblx0fVxuXG5cdHN0YXRpYyBsaWdodGluZygpIHtcblx0XHRsZXQgbGlnaHRBID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhDQ0NDQ0MsIDEuNzI1KTtcblx0XHRsZXQgbGlnaHRCID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhBQUFBQUEsIDEuNSk7XG5cdFx0bGlnaHRBLnBvc2l0aW9uLnNldFgoNTAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WSgtODAwKTtcblx0XHRsaWdodEIucG9zaXRpb24uc2V0WCgtNTAwKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRBKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQobGlnaHRCKTtcblx0fVxufVxuXG5leHBvcnQgeyBTY2VuZVV0aWxzIH1cbiIsIi8qKlxuICogU3BoZXJlc1NjZW5lIGlzIGRlc2lnbmVkIHRvIGhhbmRsZSBhZGRpbmcgYW5kIHJlbW92aW5nIGVudGl0aWVzIGZyb20gdGhlIHNjZW5lLFxuICogYW5kIGhhbmRsaW5nIGV2ZW50cy5cbiAqXG4gKiBJdCBhaW1zIHRvIGRlYWwgbm90IHdpdGggY2hhbmdlcyBvdmVyIHRpbWUsIG9ubHkgaW1tZWRpYXRlIGNoYW5nZXMgaW4gb25lIGZyYW1lLlxuICovXG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gXCIuLi9jb25maWcvY29sb3Vyc1wiO1xuaW1wb3J0IHtNb3Rpb25MYWJ9IGZyb20gXCIuL21vdGlvbi1sYWIuY2xhc3NcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuaW1wb3J0IHtQcm9wc30gZnJvbSAnLi9wcm9wcyc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge2hpZGVSZWxhdGVkLCByZWxhdGVkQ2xpY2ssIHNob3dSZWxhdGVkfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0dGhpcy5tb3Rpb25MYWIgPSBuZXcgTW90aW9uTGFiKCk7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMSwgNSwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGNvbnN0IGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyk7XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRsZXQgaW50ZXJzZWN0cztcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7IC8vIHJlc2V0IHRoZSByZWxhdGVkIHNwaGVyZSB0byByZWRcblx0XHRcdFx0b2JqLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7IC8vIG1vdXNlIGlzIG92ZXIgYSBNZXNoXG5cdFx0XHRQcm9wcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c3RvcmUuZGlzcGF0Y2goc2hvd1JlbGF0ZWQoc2VsZWN0ZWQuYXJ0aXN0T2JqKSk7XG5cdFx0XHRcdGlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0XHRzZWxlY3RlZC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0SG92ZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3RvcmUuZGlzcGF0Y2goaGlkZVJlbGF0ZWQoKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3JlLmRpc3BhdGNoKGhpZGVSZWxhdGVkKCkpO1xuXHRcdH1cblx0XHRQcm9wcy5vbGRNb3VzZVZlY3RvciA9IFByb3BzLm1vdXNlVmVjdG9yO1xuXHRcdHJldHVybiBpc092ZXJSZWxhdGVkO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlRHJhZyhldmVudCkge1xuXHRcdGNvbnN0IGR0ID0gUHJvcHMudDIgLSBQcm9wcy50MTtcblx0XHRQcm9wcy5tb3VzZVZlY3RvciA9IFNjZW5lVXRpbHMuZ2V0TW91c2VWZWN0b3IoZXZlbnQpO1xuXHRcdFByb3BzLm1vdXNlUG9zWEluY3JlYXNlZCA9IChQcm9wcy5tb3VzZVZlY3Rvci54ID4gUHJvcHMub2xkTW91c2VWZWN0b3IueCk7XG5cdFx0UHJvcHMubW91c2VQb3NZSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnkgPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci55KTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZYID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueCkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci54KSk7XG5cdFx0UHJvcHMubW91c2VQb3NEaWZmWSA9IE1hdGguYWJzKE1hdGguYWJzKFByb3BzLm1vdXNlVmVjdG9yLnkpIC0gTWF0aC5hYnMoUHJvcHMub2xkTW91c2VWZWN0b3IueSkpO1xuXHRcdFByb3BzLnNwZWVkWCA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlgpIC8gZHQpO1xuXHRcdFByb3BzLnNwZWVkWSA9ICgoMSArIFByb3BzLm1vdXNlUG9zRGlmZlkpIC8gZHQpO1xuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdH1cblxuXHRvblNjZW5lTW91c2VDbGljayhldmVudCkge1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0bGV0IGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoUHJvcHMuZ3JhcGhDb250YWluZXIsIFByb3BzLnJheWNhc3RlciwgUHJvcHMuY2FtZXJhKTtcblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoc2VsZWN0ZWQuaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7XG5cdFx0XHRcdHN0b3JlLmRpc3BhdGNoKHJlbGF0ZWRDbGljaygpKTtcblx0XHRcdFx0dGhpcy5nZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRSZWxhdGVkQXJ0aXN0KHNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShQcm9wcy5ncmFwaENvbnRhaW5lciwgc2VsZWN0ZWRTcGhlcmUpO1xuXHRcdHRoaXMubW90aW9uTGFiLnRyYWNrT2JqZWN0VG9DYW1lcmEoc2VsZWN0ZWRTcGhlcmUsICgpID0+IHtcblx0XHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqLmlkKTtcblx0XHR9KTtcblx0fVxuXG5cdGNsZWFyR3JhcGgoKSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gUHJvcHMuZ3JhcGhDb250YWluZXIuZ2V0T2JqZWN0QnlOYW1lKCdwYXJlbnQnKTtcblx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5yZW1vdmUocGFyZW50KTtcblx0XHR9XG5cdH1cblxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdFByb3BzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVDYW1lcmFBc3BlY3QoKSB7XG5cdFx0UHJvcHMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdFByb3BzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufSIsImNvbnN0IERJU1RBTkNFX1NDQUxBUiA9IDUwO1xuY29uc3QgU0laRV9TQ0FMQVIgPSAxLjU7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aXN0aWNzIHtcbiAgICBzdGF0aWMgZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDQwLCBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSKTtcbiAgICB9XG5cblx0LyoqXG4gICAgICogTWFwLXJlZHVjZSBvZiB0d28gc3RyaW5nIGFycmF5c1xuXHQgKiBAcGFyYW0gYXJ0aXN0XG5cdCAqIEBwYXJhbSByZWxhdGVkQXJ0aXN0XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgZ2V0U2hhcmVkR2VucmVNZXRyaWMoYXJ0aXN0LCByZWxhdGVkQXJ0aXN0KSB7XG5cdFx0bGV0IG1hdGNoZXMgPSBhcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAubWFwKChtYWluQXJ0aXN0R2VucmUpID0+IFN0YXRpc3RpY3MubWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBtYXRjaCkgPT4ge1xuXHRcdCAgICAgICAgaWYgKG1hdGNoKSB7XG5cdFx0ICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChtYXRjaCk7XG5cdFx0XHRcdH1cblx0XHQgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgICAgICAgIH0sIFtdKTtcblx0XHRyZXR1cm4gTWF0aC5tYXgoMzAwLCBtYXRjaGVzLmxlbmd0aCAqIERJU1RBTkNFX1NDQUxBUik7XG5cdH1cblxuXHRzdGF0aWMgbWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiByZWxhdGVkQXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLmZpbmQoKGdlbnJlKSA9PiBnZW5yZSA9PT0gbWFpbkFydGlzdEdlbnJlKTtcbiAgICB9XG4gfSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5pbXBvcnQgUmVsYXRlZEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb250YWluZXJcIjtcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250YWluZXJcIj5cblx0XHRcdFx0PFNlYXJjaENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxTcG90aWZ5UGxheWVyQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RJbmZvQ29tcG9uZW50KHthcnRpc3QsIGlzSGlkZGVufSkge1xuXHRjb25zdCBnZW5yZXMgPSBhcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIGluZm8tY29udGFpbmVyIG1haW4nIDogJ2luZm8tY29udGFpbmVyIG1haW4nO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyBtYWluXCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPjwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBvcHVsYXJpdHlcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPlBvcHVsYXJpdHk6PC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJwaWxsXCI+e2FydGlzdC5wb3B1bGFyaXR5fTwvc3Bhbj48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJnZW5yZXNcIj57Z2VucmVzfTwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmV4cG9ydCBjbGFzcyBBcnRpc3RMaXN0Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdGhhbmRsZUdldEFydGlzdChldnQsIGFydGlzdElkKSB7XG5cdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBhcnRpc3RzID0gdGhpcy5wcm9wcy52aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdFx0bGV0IGhyZWYgPSAnL2FwcC8jJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFx0bGV0IGltZ1VybCA9IGFydGlzdC5pbWFnZXMgJiYgYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0XHRsZXQgaW1nU3R5bGUgPSB7IGJhY2tncm91bmRJbWFnZTogYHVybCgke2ltZ1VybH0pYCB9O1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdFx0PGEgaHJlZj17aHJlZn0gaWQ9e2FydGlzdC5pZH0gY2xhc3NOYW1lPVwibmF2LWFydGlzdC1saW5rXCJcblx0XHRcdFx0XHQgICBvbkNsaWNrPXsoZXZlbnQpID0+IHsgdGhpcy5oYW5kbGVHZXRBcnRpc3QoZXZlbnQsIGFydGlzdC5pZCkgfX0+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmUtaG9sZGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGljdHVyZVwiIHN0eWxlPXtpbWdTdHlsZX0gLz5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibmFtZVwiPnthcnRpc3QubmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdClcblx0XHR9KTtcblx0XHRjb25zdCBjbGFzc2VzID0gdGhpcy5wcm9wcy5pc0hpZGRlbiA/ICdoaWRkZW4gYXJ0aXN0LW5hdmlnYXRpb24nIDogJ2FydGlzdC1uYXZpZ2F0aW9uJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0XHR7YXJ0aXN0c31cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCh7cmVsYXRlZEFydGlzdCwgc2hvd1JlbGF0ZWR9KSB7XG5cdGNvbnN0IGdlbnJlcyA9IHJlbGF0ZWRBcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRjb25zdCBjbGFzc2VzID0gc2hvd1JlbGF0ZWQgPyAnaW5mby1jb250YWluZXIgcmVsYXRlZCcgOiAnaGlkZGVuIGluZm8tY29udGFpbmVyIHJlbGF0ZWQnO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYW1lLXRhZyByZWxhdGVkXCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj57cmVsYXRlZEFydGlzdC5uYW1lfTwvc3Bhbj48L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwb3B1bGFyaXR5XCI+PHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5Qb3B1bGFyaXR5Ojwvc3Bhbj4gPHNwYW4gY2xhc3NOYW1lPVwicGlsbFwiPntyZWxhdGVkQXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImdlbnJlc1wiPntnZW5yZXN9PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi4vY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtTcGhlcmVzU2NlbmV9IGZyb20gXCIuLi9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3NcIjtcbmltcG9ydCB7cmVsYXRlZENsaWNrfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwaGVyZXMtc2NlbmVcIiByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19Lz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKS50aGVuKCgpID0+IHsgLy8gbG9hZCB0aGUgZm9udCBmaXJzdCAoYXN5bmMpXG5cdFx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0fVxuXG5cdGluaXRTY2VuZSgpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH1cblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKCF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKHRoaXMubW91c2VJc0Rvd24pIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZURyYWcoZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc092ZXJSZWxhdGVkID0gdGhpcy5zY2VuZS5vblNjZW5lTW91c2VIb3ZlcihldmVudCk7XG5cdFx0fVxuXHRcdGlmIChpc092ZXJSZWxhdGVkICYmICF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgcG9pbnRlcic7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYmJlZCc7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vkb3duKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSB0cnVlO1xuXHR9XG5cblx0bW91c2V1cCgpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRtb3VzZXdoZWVsKGV2ZW50KSB7XG5cdFx0c3dpdGNoIChTY2VuZVV0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRjYXNlIC0xOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ291dCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdpbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5zY2VuZS51cGRhdGVDYW1lcmFBc3BlY3QoKTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGhhbmRsZVNlYXJjaCwgaGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU3BvdGlmeVBsYXllckNvbXBvbmVudCh7YXJ0aXN0LCBpc0hpZGRlbn0pIHtcblx0Y29uc3QgZW1iZWRVcmwgPSAnaHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL2VtYmVkL2FydGlzdC8nO1xuXHRjb25zdCBhcnRpc3RFbWJlZFVybCA9IGAke2VtYmVkVXJsfSR7YXJ0aXN0LmlkfWA7XG5cdGxldCBpRnJhbWVNYXJrdXAgPSAnJztcblx0aWYgKGFydGlzdC5pZCkge1xuXHRcdGlGcmFtZU1hcmt1cCA9IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BvdGlmeS1wbGF5ZXJcIj5cblx0XHRcdFx0PGlmcmFtZSBzcmM9e2FydGlzdEVtYmVkVXJsfSB3aWR0aD1cIjMwMFwiIGhlaWdodD1cIjgwXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXHRjb25zdCBjbGFzc2VzID0gaXNIaWRkZW4gPyAnaGlkZGVuIHNwb3RpZnktcGxheWVyLWNvbnRhaW5lcicgOiAnc3BvdGlmeS1wbGF5ZXItY29udGFpbmVyJztcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG5cdFx0XHR7aUZyYW1lTWFya3VwfVxuXHRcdDwvZGl2PlxuXHQpXG59IiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZExpbmVKb2luOiAweGZmZmZjYyxcblx0bWFpbkFydGlzdDogMHhmZmNjMDAsXG5cdHRleHRPdXRlcjogMHhmZmZmY2MsXG5cdHRleHRJbm5lcjogMHgwMDAwMzNcbn07IiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdCxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuXG5jb25zdCBBcnRpc3RMaXN0Q29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7UmVsYXRlZEFydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvcmVsYXRlZC1hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRyZWxhdGVkQXJ0aXN0OiBzdGF0ZS5yZWxhdGVkQXJ0aXN0LFxuXHRcdHNob3dSZWxhdGVkOiBzdGF0ZS5zaG93UmVsYXRlZFxuXHR9XG59O1xuXG5jb25zdCBSZWxhdGVkQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShSZWxhdGVkQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF0ZWRBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyB1cGRhdGVTZWFyY2hUZXJtIH0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm1cblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBhcnRpc3ROYW1lKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2Uuc2VhcmNoKGFydGlzdE5hbWUpO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdCxcblx0XHRpc0hpZGRlbjogc3RhdGUuaGlkZUluZm9cblx0fVxufTtcblxuY29uc3QgU3BvdGlmeVBsYXllckNvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShTcG90aWZ5UGxheWVyQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU3BvdGlmeVBsYXllckNvbnRhaW5lcjtcbiIsImltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7YXJ0aXN0RGF0YUF2YWlsYWJsZX0gZnJvbSBcIi4uL3N0YXRlL2FjdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIE11c2ljRGF0YVNlcnZpY2Uge1xuXHRzdGF0aWMgc2VhcmNoKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG5cblx0c3RhdGljIGdldEFydGlzdChhcnRpc3RJZCkge1xuXHRcdGxldCBhcnRpc3RVUkwgPSAnL2FwaS9hcnRpc3QvJyArIGFydGlzdElkO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goYXJ0aXN0VVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogXCJzYW1lLW9yaWdpblwiXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHN0b3JlLmRpc3BhdGNoKGFydGlzdERhdGFBdmFpbGFibGUoanNvbikpKTtcblx0fVxufSIsImV4cG9ydCBjb25zdCBBUlRJU1RfREFUQV9BVkFJTEFCTEUgPSAnQVJUSVNUX0RBVEFfQVZBSUxBQkxFJztcbmV4cG9ydCBjb25zdCBTRUFSQ0hfVEVSTV9VUERBVEUgPSAnU0VBUkNIX1RFUk1fVVBEQVRFJztcbmV4cG9ydCBjb25zdCBSRUxBVEVEX0NMSUNLID0gJ1JFTEFURURfQ0xJQ0snO1xuZXhwb3J0IGNvbnN0IFNIT1dfUkVMQVRFRCA9ICdTSE9XX1JFTEFURUQnO1xuZXhwb3J0IGNvbnN0IEhJREVfUkVMQVRFRCA9ICdISURFX1JFTEFURUQnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXJ0aXN0RGF0YUF2YWlsYWJsZShkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQVJUSVNUX0RBVEFfQVZBSUxBQkxFLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRlZENsaWNrKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFJFTEFURURfQ0xJQ0tcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JlbGF0ZWQocmVsYXRlZEFydGlzdCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNIT1dfUkVMQVRFRCxcblx0XHRkYXRhOiByZWxhdGVkQXJ0aXN0XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVSZWxhdGVkKCkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEhJREVfUkVMQVRFRCxcblx0XHRkYXRhOiBudWxsXG5cdH1cbn1cbiIsImltcG9ydCB7U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfREFUQV9BVkFJTEFCTEUsIFJFTEFURURfQ0xJQ0ssIFNIT1dfUkVMQVRFRCwgSElERV9SRUxBVEVEfSBmcm9tICcuLi9hY3Rpb25zJ1xubGV0IGluaXRpYWxTdGF0ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJyk7XG5cbmlmICghaW5pdGlhbFN0YXRlKSB7XG5cdGluaXRpYWxTdGF0ZSA9IHtcblx0XHRhcnRpc3Q6IHtcblx0XHRcdGlkOiAnJyxcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0aW1nVXJsOiAnJyxcblx0XHRcdGdlbnJlczogW10sXG5cdFx0XHRwb3B1bGFyaXR5OiAwLFxuXHRcdFx0aW1hZ2VzOiBbXVxuXHRcdH0sXG5cdFx0c2VhcmNoVGVybTogJycsXG5cdFx0dmlzaXRlZEFydGlzdHM6IFtdLFxuXHRcdGhpZGVJbmZvOiB0cnVlLFxuXHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRnZW5yZXM6IFtdLFxuXHRcdFx0XHRwb3B1bGFyaXR5OiAwLFxuXHRcdFx0XHRpZDogJycsXG5cdFx0XHRcdG5hbWU6ICcnXG5cdFx0XHR9LFxuXHRcdHNob3dSZWxhdGVkOiBmYWxzZVxuXHR9O1xufSBlbHNlIHtcblx0aW5pdGlhbFN0YXRlID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdzdGF0ZScpKTtcbn1cblxuY29uc3QgYXJ0aXN0U2VhcmNoID0gKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pID0+IHtcblx0bGV0IG5ld1N0YXRlO1xuXHRzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBTRUFSQ0hfVEVSTV9VUERBVEU6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5zZWFyY2hUZXJtLFxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQVJUSVNUX0RBVEFfQVZBSUxBQkxFOlxuXHRcdFx0aWYgKGFjdGlvbi5kYXRhLmlkKSB7XG5cdFx0XHRcdGxldCBhbHJlYWR5VmlzaXRlZCA9ICEhc3RhdGUudmlzaXRlZEFydGlzdHMubGVuZ3RoICYmIHN0YXRlLnZpc2l0ZWRBcnRpc3RzLnNvbWUoKGFydGlzdCkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFydGlzdC5pZCA9PT0gYWN0aW9uLmRhdGEuaWQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdGxldCB2aXNpdGVkQXJ0aXN0cyA9IGFscmVhZHlWaXNpdGVkID8gc3RhdGUudmlzaXRlZEFydGlzdHMgOiBbLi4uc3RhdGUudmlzaXRlZEFydGlzdHMsIGFjdGlvbi5kYXRhXTtcblx0XHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0XHR2aXNpdGVkQXJ0aXN0czogW1xuXHRcdFx0XHRcdFx0Li4udmlzaXRlZEFydGlzdHMsXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uZGF0YS5uYW1lLFxuXHRcdFx0XHRcdGhpZGVJbmZvOiBmYWxzZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdObyBBUEkgZGF0YSBhdmFpbGFibGUgZm9yIGdpdmVuIGFydGlzdC4gTmVlZCB0byByZWZyZXNoIEFQSSBzZXNzaW9uPycpO1xuXHRcdFx0XHRuZXdTdGF0ZSA9IHN0YXRlO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBSRUxBVEVEX0NMSUNLOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRoaWRlSW5mbzogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgU0hPV19SRUxBVEVEOlxuXHRcdFx0bmV3U3RhdGUgPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRyZWxhdGVkQXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0c2hvd1JlbGF0ZWQ6IHRydWVcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEhJREVfUkVMQVRFRDpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0cmVsYXRlZEFydGlzdDoge1xuXHRcdFx0XHRcdGdlbnJlczogW10sXG5cdFx0XHRcdFx0cG9wdWxhcml0eTogMCxcblx0XHRcdFx0XHRpZDogJycsXG5cdFx0XHRcdFx0bmFtZTogJydcblx0XHRcdFx0fSxcblx0XHRcdFx0c2hvd1JlbGF0ZWQ6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdH1cblx0d2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3N0YXRlJywgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpKTtcblx0cmV0dXJuIG5ld1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXJ0aXN0U2VhcmNoOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcnRpc3RTZWFyY2ggZnJvbSBcIi4vcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaFwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFydGlzdFNlYXJjaCxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
