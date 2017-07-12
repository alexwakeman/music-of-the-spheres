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
			var lightA = new THREE.DirectionalLight(0xcccccc, 1.725);
			var lightB = new THREE.DirectionalLight(0xcccccc, 1.5);
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

},{"../config/colours":13,"../services/music-data.service":19,"../state/actions":20,"../state/store":22,"./motion-lab.class":2,"./props":3,"./scene-utils.class":4}],6:[function(require,module,exports){
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
	var artist = _ref.artist,
	    isHidden = _ref.isHidden;

	var genres = artist.genres.map(function (genre) {
		return React.createElement(
			'span',
			{ className: 'pill', key: genre },
			genre
		);
	});
	var classes = isHidden ? 'hidden info-container' : 'info-container';
	return React.createElement(
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

},{"../state/store":22,"react":undefined}],9:[function(require,module,exports){
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

},{"../services/music-data.service":19,"../state/store":22,"react":undefined}],10:[function(require,module,exports){
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

},{"../classes/scene-utils.class":4,"../classes/spheres-scene.class":5,"../state/actions":20,"../state/store":22,"react":undefined}],11:[function(require,module,exports){
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
        isHidden = _ref.isHidden,
        handleSearch = _ref.handleSearch,
        handleSearchTermUpdate = _ref.handleSearchTermUpdate;

    var classes = isHidden ? 'hidden search-form-container' : 'search-form-container';
    return React.createElement(
        'div',
        { className: classes },
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
		artist: state.artist,
		isHidden: state.hideInfo
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
		visitedArtists: state.visitedArtists,
		isHidden: state.hideInfo
	};
};

var ArtistListContainer = (0, _reactRedux.connect)(mapStateToProps)(_artistList.ArtistListComponent);

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
		searchTerm: state.searchTerm,
		isHidden: state.hideInfo
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
		artist: state.artist,
		isHidden: state.hideInfo
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
exports.relatedClick = relatedClick;
var ARTIST_DATA_AVAILABLE = exports.ARTIST_DATA_AVAILABLE = 'ARTIST_DATA_AVAILABLE';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';
var RELATED_CLICK = exports.RELATED_CLICK = 'RELATED_CLICK';

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

},{}],21:[function(require,module,exports){
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
		hideInfo: true
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
		default:
			newState = state;
	}
	window.sessionStorage.setItem('state', JSON.stringify(newState));
	return newState;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3N0YXRpc3RpY3MuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXIuanMiLCJzcmMvanMvc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlLmpzIiwic3JjL2pzL3N0YXRlL2FjdGlvbnMuanMiLCJzcmMvanMvc3RhdGUvcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaC5qcyIsInNyYy9qcy9zdGF0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QUksT0FBTyxJQUFQLENBQVksRUFBaEIsRUFBb0I7QUFDbkIsUUFBSSxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sY0FBTixDQUFxQixNQUF2QixJQUFpQyxNQUFNLGNBQU4sQ0FBcUIsSUFBckIsQ0FBMEIsVUFBQyxNQUFELEVBQVk7QUFDMUYsWUFBTyxPQUFPLEVBQVAsS0FBYyxPQUFPLElBQVAsQ0FBWSxFQUFqQztBQUNBLEtBRm9ELENBQXREO0FBR0EsUUFBSSxpQkFBaUIsaUJBQWlCLE1BQU0sY0FBdkIsZ0NBQTRDLE1BQU0sY0FBbEQsSUFBa0UsT0FBTyxJQUF6RSxFQUFyQjtBQUNBLDRCQUNJLEtBREo7QUFFQyxhQUFRLE9BQU8sSUFGaEI7QUFHQyxrREFDSSxjQURKLEVBSEQ7QUFNQyxpQkFBWSxPQUFPLElBQVAsQ0FBWSxJQU56QjtBQU9DLGVBQVU7QUFQWDtBQVNBLElBZEQsTUFjTztBQUNOLFlBQVEsSUFBUixDQUFhLHNFQUFiO0FBQ0EsZUFBVyxLQUFYO0FBQ0E7QUFDRDtBQUNEO0FBQ0MsMkJBQ0ksS0FESjtBQUVDLGNBQVU7QUFGWDtBQUlBO0FBQ0Q7QUFDQyxjQUFXLEtBQVg7QUFsQ0Y7QUFvQ0EsUUFBTyxjQUFQLENBQXNCLE9BQXRCLENBQThCLE9BQTlCLEVBQXVDLEtBQUssU0FBTCxDQUFlLFFBQWYsQ0FBdkM7QUFDQSxRQUFPLFFBQVA7QUFDQSxDQXhDRDs7a0JBMENlLFk7Ozs7Ozs7Ozs7QUMvRGY7O0FBQ0E7Ozs7OztBQUVPLElBQUksd0JBQVEsZ0RBRWxCLE9BQU8sNEJBQVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiLyoqXG4gKiBNb3Rpb25MYWIgZGVhbHMgd2l0aCBjb250cm9sbGluZyBlYWNoIHRpY2sgb2YgdGhlIGFuaW1hdGlvbiBmcmFtZSBzZXF1ZW5jZVxuICogSXQncyBhaW0gaXMgdG8gaXNvbGF0ZSBjb2RlIHRoYXQgaGFwcGVucyBvdmVyIGEgbnVtYmVyIG9mIGZyYW1lcyAoaS5lLiBtb3Rpb24pXG4gKi9cbmltcG9ydCB7UHJvcHN9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNvbnN0IFRSQUNLX0NBTV9UT19PQkogPSAnVFJBQ0tfQ0FNX1RPX09CSic7XG5jb25zdCBERUZBVUxUID0gJ0RFRkFVTFQnO1xuY29uc3QgZGVmYXVsdEpvYiA9IHtcblx0dHlwZTogREVGQVVMVFxufTtcblxuZXhwb3J0IGNsYXNzIE1vdGlvbkxhYiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5qb2IgPSBkZWZhdWx0Sm9iO1xuXHRcdHRoaXMuYW5pbWF0ZSgpO1xuXHR9XG5cblx0YW5pbWF0ZSgpIHtcblx0XHRQcm9wcy50MiA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5wcm9jZXNzU2NlbmUoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5yZW5kZXIoUHJvcHMuc2NlbmUsIFByb3BzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRQcm9wcy50MSA9IFByb3BzLnQyO1xuXHRcdFx0dGhpcy5hbmltYXRlLmNhbGwodGhpcyk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm9jZXNzU2NlbmUoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi50eXBlKSB7XG5cdFx0XHRjYXNlIFRSQUNLX0NBTV9UT19PQko6XG5cdFx0XHRcdHRoaXMudHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgREVGQVVMVDpcblx0XHRcdFx0dGhpcy51cGRhdGVSb3RhdGlvbigpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCkge1xuXHRcdGNvbnN0IHNob3VsZEVuZCA9IHBhcnNlSW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKSA9PT0gMTtcblx0XHRpZiAoIXNob3VsZEVuZCkge1xuXHRcdFx0dGhpcy5mb2xsb3dQYXRoKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5lbmRBbmltYXRpb24oKTtcblx0XHR9XG5cdH1cblxuXHRmb2xsb3dQYXRoKCkge1xuXHRcdGNvbnN0IHAgPSB0aGlzLmpvYi5wYXRoLmdldFBvaW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKTtcblx0XHR0aGlzLmpvYi5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHApO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lICs9IDAuMDE7XG5cdH1cblxuXHRlbmRBbmltYXRpb24oKSB7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgJiYgdGhpcy5qb2IuY2FsbGJhY2soKTtcblx0XHR0aGlzLmpvYiA9IGRlZmF1bHRKb2I7XG5cdH1cblxuXHR0cmFja09iamVjdFRvQ2FtZXJhKG9iamVjdDNELCBjYWxsYmFjaykge1xuICAgIFx0dGhpcy5qb2IgPSB7fTtcbiAgICBcdHRoaXMuam9iLnR5cGUgPSBUUkFDS19DQU1fVE9fT0JKO1xuXHRcdHRoaXMuam9iLnQgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgPSAwLjA7XG5cdFx0dGhpcy5qb2IuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLmpvYi5vYmplY3QzRCA9IG9iamVjdDNEO1xuXHRcdHRoaXMuam9iLmVuZGVkID0gZmFsc2U7XG5cdFx0dGhpcy5qb2IucGF0aCA9IG5ldyBUSFJFRS5DYXRtdWxsUm9tQ3VydmUzKFtcblx0XHRcdG9iamVjdDNELnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKVxuXHRcdF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRjb25zdCBjYW1RdWF0ZXJuaW9uVXBkYXRlID0gdGhpcy5nZXROZXdDYW1lcmFEaXJlY3Rpb24oKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS54ICogUHJvcHMuY2FtZXJhRGlzdGFuY2UsXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnkgKiBQcm9wcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIFByb3BzLmNhbWVyYURpc3RhbmNlXG5cdFx0KTtcblx0XHRQcm9wcy5jYW1lcmEubG9va0F0KFByb3BzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzVGV4dCcpKSB7XG5cdFx0XHRcdG9iai5sb29rQXQoUHJvcHMuZ3JhcGhDb250YWluZXIud29ybGRUb0xvY2FsKFByb3BzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdGdldE5ld0NhbWVyYURpcmVjdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSBQcm9wcy5tb3VzZVBvc0RpZmZZID49IFByb3BzLm1vdXNlUG9zRGlmZlg7XG5cdFx0Y29uc3QgeE1vcmVUaGFuWU1vdXNlID0gIXlNb3JlVGhhblhNb3VzZTtcblx0XHRpZiAoUHJvcHMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueCAtPSBQcm9wcy5zcGVlZFg7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi54ICs9IFByb3BzLnNwZWVkWDtcblx0XHR9XG5cblx0XHRpZiAoUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0UHJvcHMuY2FtZXJhUm90YXRpb24ueSArPSBQcm9wcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFQcm9wcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHRQcm9wcy5jYW1lcmFSb3RhdGlvbi55IC09IFByb3BzLnNwZWVkWTtcblx0XHR9XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZSA9IFNjZW5lVXRpbHMucmVub3JtYWxpemVRdWF0ZXJuaW9uKFByb3BzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIoUHJvcHMuY2FtZXJhUm90YXRpb24pO1xuXHRcdHJldHVybiBjYW1RdWF0ZXJuaW9uVXBkYXRlO1xuXHR9XG5cblx0cmVkdWNlU3BlZWQoYW1vdW50KSB7XG5cdFx0aWYgKFByb3BzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHRQcm9wcy5zcGVlZFggLT0gYW1vdW50O1xuXHRcdH1cblxuXHRcdGlmIChQcm9wcy5zcGVlZFkgPiAwLjAwNSkge1xuXHRcdFx0UHJvcHMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuZXhwb3J0IGNvbnN0IFByb3BzID0ge1xuXHRyZW5kZXJlcjogbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWV9KSxcblx0c2NlbmU6IG5ldyBUSFJFRS5TY2VuZSgpLFxuXHRjYW1lcmE6IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgzMCwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDUwMCwgMTUwMDAwKSxcblx0Z3JhcGhDb250YWluZXI6IG5ldyBUSFJFRS5PYmplY3QzRCgpLFxuXHRjYW1lcmFSb3RhdGlvbjogbmV3IFRIUkVFLkV1bGVyKDAsIC0xLCAwKSxcblx0Y2FtZXJhTG9va0F0OiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSxcblx0Y2FtZXJhRGlzdGFuY2U6IDM1MDAsXG5cdFxuXHR0MTogMC4wLCAvLyBvbGQgdGltZVxuXHR0MjogMC4wLCAvLyBub3cgdGltZVxuXHRzcGVlZFg6IDAuMDA1LFxuXHRzcGVlZFk6IDAuMDAwLFxuXHRtb3VzZVBvc0RpZmZYOiAwLjAsXG5cdG1vdXNlUG9zRGlmZlk6IDAuMCxcblx0bW91c2VQb3NYSW5jcmVhc2VkOiBmYWxzZSxcblx0bW91c2VQb3NZSW5jcmVhc2VkOiBmYWxzZSxcblx0cmF5Y2FzdGVyOiBuZXcgVEhSRUUuUmF5Y2FzdGVyKCksXG5cdG1vdXNlVmVjdG9yOiBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRcblx0cmVsYXRlZEFydGlzdFNwaGVyZXM6IFtdLFxuXHRtYWluQXJ0aXN0U3BoZXJlOiB7fVxufTsiLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSAnLi4vY29uZmlnL2NvbG91cnMnO1xuaW1wb3J0IHtQcm9wc30gZnJvbSBcIi4vcHJvcHNcIjtcbmltcG9ydCB7U3RhdGlzdGljc30gZnJvbSBcIi4vc3RhdGlzdGljcy5jbGFzc1wiO1xuXG5sZXQgSEVMVkVUSUtFUjtcbmNvbnN0IE1BSU5fQVJUSVNUX0ZPTlRfU0laRSA9IDM0O1xuY29uc3QgUkVMQVRFRF9BUlRJU1RfRk9OVF9TSVpFID0gMjA7XG5jb25zdCBUT1RBTF9SRUxBVEVEID0gMTA7XG5cbmNsYXNzIFNjZW5lVXRpbHMge1xuXHRzdGF0aWMgaW5pdCgpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Y29uc3QgbG9hZGVyID0gbmV3IFRIUkVFLkZvbnRMb2FkZXIoKTtcblx0XHRcdGxvYWRlci5sb2FkKCcuL2pzL2ZvbnRzL2hlbHZldGlrZXJfcmVndWxhci50eXBlZmFjZS5qc29uJywgKGZvbnQpID0+IHtcblx0XHRcdFx0SEVMVkVUSUtFUiA9IGZvbnQ7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0sICgpPT57fSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGEgLSBtaW5cblx0ICogQHBhcmFtIGIgLSBtYXhcblx0ICogQHBhcmFtIGMgLSB2YWx1ZSB0byBjbGFtcFxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIGNsYW1wKGEsIGIsIGMpIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgoYiwgTWF0aC5taW4oYywgYSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdpdmVuIHBvc2l0aXZlIHggcmV0dXJuIDEsIG5lZ2F0aXZlIHggcmV0dXJuIC0xLCBvciAwIG90aGVyd2lzZVxuXHQgKiBAcGFyYW0geFxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfVxuXHQgKi9cblx0c3RhdGljIHNpZ24obikge1xuXHRcdHJldHVybiBuID4gMCA/IDEgOiBuIDwgMCA/IC0xIDogMDtcblx0fTtcblx0XG5cdHN0YXRpYyByZW5vcm1hbGl6ZVF1YXRlcm5pb24ob2JqZWN0KSB7XG5cdFx0bGV0IGNsb25lID0gb2JqZWN0LmNsb25lKCk7XG5cdFx0bGV0IHEgPSBjbG9uZS5xdWF0ZXJuaW9uO1xuXHRcdGxldCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoTWF0aC5wb3cocS53LCAyKSArIE1hdGgucG93KHEueCwgMikgKyBNYXRoLnBvdyhxLnksIDIpICsgTWF0aC5wb3cocS56LCAyKSk7XG5cdFx0cS53IC89IG1hZ25pdHVkZTtcblx0XHRxLnggLz0gbWFnbml0dWRlO1xuXHRcdHEueSAvPSBtYWduaXR1ZGU7XG5cdFx0cS56IC89IG1hZ25pdHVkZTtcblx0XHRyZXR1cm4gcTtcblx0fVxuXG5cdHN0YXRpYyBnZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGdyYXBoLCByYXljYXN0ZXIsIGNhbWVyYSkge1xuXHRcdHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKFByb3BzLm1vdXNlVmVjdG9yLCBjYW1lcmEpO1xuXHRcdHJldHVybiByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhncmFwaC5jaGlsZHJlbiwgdHJ1ZSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0TW91c2VWZWN0b3IoZXZlbnQpIHtcblx0XHRyZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjIoKGV2ZW50LmNsaWVudFggLyBQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmNsaWVudFdpZHRoKSAqIDIgLSAxLFxuXHRcdFx0LShldmVudC5jbGllbnRZIC8gUHJvcHMucmVuZGVyZXIuZG9tRWxlbWVudC5jbGllbnRIZWlnaHQpICogMiArIDEpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KSB7XG5cdFx0bGV0IHJhZGl1cyA9IFN0YXRpc3RpY3MuZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIDM1LCAzNSk7XG5cdFx0bGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMubWFpbkFydGlzdH0pKTtcblx0XHRzcGhlcmUuYXJ0aXN0T2JqID0gYXJ0aXN0O1xuXHRcdHNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0c3BoZXJlLmlzTWFpbkFydGlzdFNwaGVyZSA9IHRydWU7XG5cdFx0c3BoZXJlLmlzU3BoZXJlID0gdHJ1ZTtcblx0XHRTY2VuZVV0aWxzLmFkZFRleHQoYXJ0aXN0Lm5hbWUsIE1BSU5fQVJUSVNUX0ZPTlRfU0laRSwgc3BoZXJlKTtcblx0XHRyZXR1cm4gc3BoZXJlO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZVJlbGF0ZWRTcGhlcmVzKGFydGlzdCwgbWFpbkFydGlzdFNwaGVyZSkge1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5ID0gW107XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3Q7XG5cdFx0bGV0IHNwaGVyZUZhY2VJbmRleCA9IDA7XG5cdFx0bGV0IGZhY2VzQ291bnQgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzLmxlbmd0aCAtIDE7XG5cdFx0bGV0IHN0ZXAgPSBNYXRoLnJvdW5kKGZhY2VzQ291bnQgLyBUT1RBTF9SRUxBVEVEIC0gMSk7XG5cblx0XHRmb3IgKGxldCBpID0gMCwgbGVuID0gTWF0aC5taW4oVE9UQUxfUkVMQVRFRCwgYXJ0aXN0LnJlbGF0ZWQubGVuZ3RoKTsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0ID0gYXJ0aXN0LnJlbGF0ZWRbaV07XG5cdFx0XHRsZXQgcmFkaXVzID0gU3RhdGlzdGljcy5nZXRBcnRpc3RTcGhlcmVTaXplKHJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgMzUsIDM1KTtcblx0XHRcdGxldCByZWxhdGVkQXJ0aXN0U3BoZXJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5yZWxhdGVkQXJ0aXN0fSkpO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5hcnRpc3RPYmogPSByZWxhdGVkQXJ0aXN0O1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmlzUmVsYXRlZEFydGlzdFNwaGVyZSA9IHRydWU7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmlzU3BoZXJlID0gdHJ1ZTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuZGlzdGFuY2UgPSBTdGF0aXN0aWNzLmdldFNoYXJlZEdlbnJlTWV0cmljKGFydGlzdCwgcmVsYXRlZEFydGlzdCk7XG5cdFx0XHRzcGhlcmVGYWNlSW5kZXggKz0gc3RlcDtcblx0XHRcdFNjZW5lVXRpbHMucG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCk7XG5cdFx0XHRTY2VuZVV0aWxzLmpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0U2NlbmVVdGlscy5hZGRUZXh0KHJlbGF0ZWRBcnRpc3QubmFtZSwgUkVMQVRFRF9BUlRJU1RfRk9OVF9TSVpFLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkucHVzaChyZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXk7XG5cdH1cblxuXHRzdGF0aWMgYXBwZW5kT2JqZWN0c1RvU2NlbmUoZ3JhcGhDb250YWluZXIsIHNwaGVyZSwgc3BoZXJlQXJyYXkpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblx0XHRwYXJlbnQubmFtZSA9ICdwYXJlbnQnO1xuXHRcdHBhcmVudC5hZGQoc3BoZXJlKTtcblx0XHRpZiAoc3BoZXJlQXJyYXkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BoZXJlQXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0cGFyZW50LmFkZChzcGhlcmVBcnJheVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGdyYXBoQ29udGFpbmVyLmFkZChwYXJlbnQpO1xuXHR9XG5cblx0c3RhdGljIGpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRMaW5lSm9pbn0pO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdGxldCBsaW5lO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gocmVsYXRlZFNwaGVyZS5wb3NpdGlvbi5jbG9uZSgpKTtcblx0XHRsaW5lID0gbmV3IFRIUkVFLkxpbmUoZ2VvbWV0cnksIG1hdGVyaWFsKTtcblx0XHRtYWluQXJ0aXN0U3BoZXJlLmFkZChsaW5lKTtcblx0fVxuXG5cdHN0YXRpYyBwb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KSB7XG5cdFx0bGV0IG1haW5BcnRpc3RTcGhlcmVGYWNlID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlc1tNYXRoLmZsb29yKHNwaGVyZUZhY2VJbmRleCldLm5vcm1hbC5jbG9uZSgpO1xuXHRcdHJlbGF0ZWRTcGhlcmUucG9zaXRpb25cblx0XHRcdC5jb3B5KG1haW5BcnRpc3RTcGhlcmVGYWNlLm11bHRpcGx5KG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIGFkZFRleHQobGFiZWwsIHNpemUsIHNwaGVyZSkge1xuXHRcdGxldCBtYXRlcmlhbEZyb250ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy50ZXh0T3V0ZXJ9KTtcblx0XHRsZXQgbWF0ZXJpYWxTaWRlID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy50ZXh0SW5uZXJ9KTtcblx0XHRsZXQgbWF0ZXJpYWxBcnJheSA9IFttYXRlcmlhbEZyb250LCBtYXRlcmlhbFNpZGVdO1xuXHRcdGxldCB0ZXh0R2VvbSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkobGFiZWwsIHtcblx0XHRcdGZvbnQ6IEhFTFZFVElLRVIsXG5cdFx0XHRzaXplOiBzaXplLFxuXHRcdFx0Y3VydmVTZWdtZW50czogNCxcblx0XHRcdGJldmVsRW5hYmxlZDogdHJ1ZSxcblx0XHRcdGJldmVsVGhpY2tuZXNzOiAyLFxuXHRcdFx0YmV2ZWxTaXplOiAxLFxuXHRcdFx0YmV2ZWxTZWdtZW50czogM1xuXHRcdH0pO1xuXHRcdGxldCB0ZXh0TWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRleHRHZW9tLCBtYXRlcmlhbEFycmF5KTtcblx0XHR0ZXh0TWVzaC5pc1RleHQgPSB0cnVlO1xuXHRcdHNwaGVyZS5hZGQodGV4dE1lc2gpO1xuXHRcdHRleHRNZXNoLnBvc2l0aW9uLnNldCgtc3BoZXJlLnJhZGl1cywgLShzcGhlcmUucmFkaXVzICsgc2l6ZSAqIDIpLCAtc3BoZXJlLnJhZGl1cyAvIDIpO1xuXHR9XG5cblx0c3RhdGljIGxpZ2h0aW5nKCkge1xuXHRcdGxldCBsaWdodEEgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGNjY2NjYywgMS43MjUpO1xuXHRcdGxldCBsaWdodEIgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGNjY2NjYywgMS41KTtcblx0XHRsaWdodEEucG9zaXRpb24uc2V0WCg1MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRZKC04MDApO1xuXHRcdGxpZ2h0Qi5wb3NpdGlvbi5zZXRYKC01MDApO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEEpO1xuXHRcdFByb3BzLnNjZW5lLmFkZChsaWdodEIpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiLyoqXG4gKiBTcGhlcmVzU2NlbmUgaXMgZGVzaWduZWQgdG8gaGFuZGxlIGFkZGluZyBhbmQgcmVtb3ZpbmcgZW50aXRpZXMgZnJvbSB0aGUgc2NlbmUsXG4gKiBhbmQgaGFuZGxpbmcgZXZlbnRzLlxuICpcbiAqIEl0IGFpbXMgdG8gZGVhbCBub3Qgd2l0aCBjaGFuZ2VzIG92ZXIgdGltZSwgb25seSBpbW1lZGlhdGUgY2hhbmdlcyBpbiBvbmUgZnJhbWUuXG4gKi9cbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSBcIi4vc2NlbmUtdXRpbHMuY2xhc3NcIjtcbmltcG9ydCB7Q29sb3Vyc30gZnJvbSBcIi4uL2NvbmZpZy9jb2xvdXJzXCI7XG5pbXBvcnQge01vdGlvbkxhYn0gZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5pbXBvcnQge1Byb3BzfSBmcm9tICcuL3Byb3BzJztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7cmVsYXRlZENsaWNrfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlc1NjZW5lIHtcblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0dGhpcy5tb3Rpb25MYWIgPSBuZXcgTW90aW9uTGFiKCk7XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0UHJvcHMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHRQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHRQcm9wcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0UHJvcHMuY29udGFpbmVyLmFwcGVuZENoaWxkKFByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRQcm9wcy5ncmFwaENvbnRhaW5lci5wb3NpdGlvbi5zZXQoMSwgNSwgMCk7XG5cdFx0UHJvcHMuc2NlbmUuYWRkKFByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRQcm9wcy5zY2VuZS5hZGQoUHJvcHMuY2FtZXJhKTtcblx0XHRQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgUHJvcHMuY2FtZXJhRGlzdGFuY2UpO1xuXHRcdFByb3BzLmNhbWVyYS5sb29rQXQoUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoUHJvcHMuc2NlbmUpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGNvbnN0IGFydGlzdElkID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuXHRcdGlmIChhcnRpc3RJZCkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRBcnRpc3QoYXJ0aXN0SWQpO1xuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3QuaWQpO1xuXHRcdFByb3BzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHRQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyk7XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRsZXQgaW50ZXJzZWN0cztcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0aW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdFByb3BzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnRyYXZlcnNlKChvYmopID0+IHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7IC8vIHJlc2V0IHRoZSByZWxhdGVkIHNwaGVyZSB0byByZWRcblx0XHRcdFx0b2JqLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3QpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGludGVyc2VjdHMubGVuZ3RoKSB7IC8vIG1vdXNlIGlzIG92ZXIgYSBNZXNoXG5cdFx0XHRQcm9wcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0aXNPdmVyUmVsYXRlZCA9IHRydWU7XG5cdFx0XHRcdHNlbGVjdGVkLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFByb3BzLm9sZE1vdXNlVmVjdG9yID0gUHJvcHMubW91c2VWZWN0b3I7XG5cdFx0cmV0dXJuIGlzT3ZlclJlbGF0ZWQ7XG5cdH1cblxuXHRvblNjZW5lTW91c2VEcmFnKGV2ZW50KSB7XG5cdFx0Y29uc3QgZHQgPSBQcm9wcy50MiAtIFByb3BzLnQxO1xuXHRcdFByb3BzLm1vdXNlVmVjdG9yID0gU2NlbmVVdGlscy5nZXRNb3VzZVZlY3RvcihldmVudCk7XG5cdFx0UHJvcHMubW91c2VQb3NYSW5jcmVhc2VkID0gKFByb3BzLm1vdXNlVmVjdG9yLnggPiBQcm9wcy5vbGRNb3VzZVZlY3Rvci54KTtcblx0XHRQcm9wcy5tb3VzZVBvc1lJbmNyZWFzZWQgPSAoUHJvcHMubW91c2VWZWN0b3IueSA+IFByb3BzLm9sZE1vdXNlVmVjdG9yLnkpO1xuXHRcdFByb3BzLm1vdXNlUG9zRGlmZlggPSBNYXRoLmFicyhNYXRoLmFicyhQcm9wcy5tb3VzZVZlY3Rvci54KSAtIE1hdGguYWJzKFByb3BzLm9sZE1vdXNlVmVjdG9yLngpKTtcblx0XHRQcm9wcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnMoUHJvcHMubW91c2VWZWN0b3IueSkgLSBNYXRoLmFicyhQcm9wcy5vbGRNb3VzZVZlY3Rvci55KSk7XG5cdFx0UHJvcHMuc3BlZWRYID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWCkgLyBkdCk7XG5cdFx0UHJvcHMuc3BlZWRZID0gKCgxICsgUHJvcHMubW91c2VQb3NEaWZmWSkgLyBkdCk7XG5cdFx0UHJvcHMub2xkTW91c2VWZWN0b3IgPSBQcm9wcy5tb3VzZVZlY3Rvcjtcblx0fVxuXG5cdG9uU2NlbmVNb3VzZUNsaWNrKGV2ZW50KSB7XG5cdFx0UHJvcHMubW91c2VWZWN0b3IgPSBTY2VuZVV0aWxzLmdldE1vdXNlVmVjdG9yKGV2ZW50KTtcblx0XHRsZXQgaW50ZXJzZWN0cyA9IFNjZW5lVXRpbHMuZ2V0SW50ZXJzZWN0c0Zyb21Nb3VzZVBvcyhQcm9wcy5ncmFwaENvbnRhaW5lciwgUHJvcHMucmF5Y2FzdGVyLCBQcm9wcy5jYW1lcmEpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c3RvcmUuZGlzcGF0Y2gocmVsYXRlZENsaWNrKCkpO1xuXHRcdFx0XHR0aGlzLmdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldFJlbGF0ZWRBcnRpc3Qoc2VsZWN0ZWRTcGhlcmUpIHtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKFByb3BzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIudHJhY2tPYmplY3RUb0NhbWVyYShzZWxlY3RlZFNwaGVyZSwgKCkgPT4ge1xuXHRcdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldEFydGlzdChzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmouaWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJHcmFwaCgpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBQcm9wcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFByb3BzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShwYXJlbnQpO1xuXHRcdH1cblx0fVxuXG5cdHpvb20oZGlyZWN0aW9uKSB7XG5cdFx0c3dpdGNoIChkaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgJ2luJzpcblx0XHRcdFx0UHJvcHMuY2FtZXJhRGlzdGFuY2UgLT0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb3V0Jzpcblx0XHRcdFx0UHJvcHMuY2FtZXJhRGlzdGFuY2UgKz0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZUNhbWVyYUFzcGVjdCgpIHtcblx0XHRQcm9wcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0UHJvcHMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblx0XHRQcm9wcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHR9XG59IiwiY29uc3QgRElTVEFOQ0VfU0NBTEFSID0gNTA7XG5jb25zdCBTSVpFX1NDQUxBUiA9IDEuNTtcbmltcG9ydCB7U2NlbmVVdGlsc30gZnJvbSAnLi9zY2VuZS11dGlscy5jbGFzcyc7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aXN0aWNzIHtcbiAgICBzdGF0aWMgZ2V0QXJ0aXN0U3BoZXJlU2l6ZShhcnRpc3QpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDQwLCBhcnRpc3QucG9wdWxhcml0eSAqIFNJWkVfU0NBTEFSKTtcbiAgICB9XG5cblx0LyoqXG4gICAgICogTWFwLXJlZHVjZSBvZiB0d28gc3RyaW5nIGFycmF5c1xuXHQgKiBAcGFyYW0gYXJ0aXN0XG5cdCAqIEBwYXJhbSByZWxhdGVkQXJ0aXN0XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgZ2V0U2hhcmVkR2VucmVNZXRyaWMoYXJ0aXN0LCByZWxhdGVkQXJ0aXN0KSB7XG5cdFx0bGV0IG1hdGNoZXMgPSBhcnRpc3QuZ2VucmVzXG4gICAgICAgICAgICAubWFwKChtYWluQXJ0aXN0R2VucmUpID0+IFN0YXRpc3RpY3MubWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBtYXRjaCkgPT4ge1xuXHRcdCAgICAgICAgaWYgKG1hdGNoKSB7XG5cdFx0ICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChtYXRjaCk7XG5cdFx0XHRcdH1cblx0XHQgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgICAgICAgIH0sIFtdKTtcblx0XHRyZXR1cm4gTWF0aC5tYXgoMzAwLCBtYXRjaGVzLmxlbmd0aCAqIERJU1RBTkNFX1NDQUxBUik7XG5cdH1cblxuXHRzdGF0aWMgbWF0Y2hBcnRpc3RUb1JlbGF0ZWRHZW5yZXMobWFpbkFydGlzdEdlbnJlLCByZWxhdGVkQXJ0aXN0KSB7XG4gICAgICAgIHJldHVybiByZWxhdGVkQXJ0aXN0LmdlbnJlc1xuICAgICAgICAgICAgLmZpbmQoKGdlbnJlKSA9PiBnZW5yZSA9PT0gbWFpbkFydGlzdEdlbnJlKTtcbiAgICB9XG4gfSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHAtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxTZWFyY2hDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U3BvdGlmeVBsYXllckNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RMaXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0SW5mb0NvbXBvbmVudCh7YXJ0aXN0LCBpc0hpZGRlbn0pIHtcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIiBrZXk9e2dlbnJlfT57Z2VucmV9PC9zcGFuPlxuXHR9KTtcblx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBpbmZvLWNvbnRhaW5lcicgOiAnaW5mby1jb250YWluZXInO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicG9wdWxhcml0eVwiPjxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCI+UG9wdWxhcml0eTo8L3NwYW4+IDxzcGFuIGNsYXNzTmFtZT1cInBpbGxcIj57YXJ0aXN0LnBvcHVsYXJpdHl9PC9zcGFuPjwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJnZW5yZXNcIj48c3BhbiBjbGFzc05hbWU9XCJ0aXRsZVwiPkdlbnJlczo8L3NwYW4+IHtnZW5yZXN9PC9kaXY+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5leHBvcnQgY2xhc3MgQXJ0aXN0TGlzdENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdH1cblxuXHRoYW5kbGVHZXRBcnRpc3QoZXZ0LCBhcnRpc3RJZCkge1xuXHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0QXJ0aXN0KGFydGlzdElkKTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgYXJ0aXN0cyA9IHRoaXMucHJvcHMudmlzaXRlZEFydGlzdHMubWFwKChhcnRpc3QpID0+IHtcblx0XHRcdGxldCBocmVmID0gJy9hcHAvIycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0LmlkKTtcblx0XHRcdGxldCBpbWdVcmwgPSBhcnRpc3QuaW1hZ2VzICYmIGFydGlzdC5pbWFnZXMubGVuZ3RoID8gYXJ0aXN0LmltYWdlc1thcnRpc3QuaW1hZ2VzLmxlbmd0aCAtIDFdLnVybCA6ICcnO1xuXHRcdFx0bGV0IGltZ1N0eWxlID0geyBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpbWdVcmx9KWAgfTtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0XCIga2V5PXthcnRpc3QuaWR9PlxuXHRcdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiXG5cdFx0XHRcdFx0ICAgb25DbGljaz17KGV2ZW50KSA9PiB7IHRoaXMuaGFuZGxlR2V0QXJ0aXN0KGV2ZW50LCBhcnRpc3QuaWQpIH19PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwaWN0dXJlLWhvbGRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzdHlsZT17aW1nU3R5bGV9IC8+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpXG5cdFx0fSk7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IHRoaXMucHJvcHMuaXNIaWRkZW4gPyAnaGlkZGVuIGFydGlzdC1uYXZpZ2F0aW9uJyA6ICdhcnRpc3QtbmF2aWdhdGlvbic7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cblx0XHRcdFx0e2FydGlzdHN9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi4vY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtTcGhlcmVzU2NlbmV9IGZyb20gXCIuLi9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3NcIjtcbmltcG9ydCB7cmVsYXRlZENsaWNrfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0dGhpcy5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwaGVyZXMtc2NlbmVcIiByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19Lz5cblx0XHQpXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRTY2VuZVV0aWxzLmluaXQoKS50aGVuKCgpID0+IHsgLy8gbG9hZCB0aGUgZm9udCBmaXJzdCAoYXN5bmMpXG5cdFx0XHR0aGlzLnNjZW5lID0gbmV3IFNwaGVyZXNTY2VuZSh0aGlzLnNjZW5lRG9tKTtcblx0XHRcdHRoaXMuaW5pdFNjZW5lKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKSB7XG5cdFx0dGhpcy5pbml0U2NlbmUoKTtcblx0fVxuXG5cdGluaXRTY2VuZSgpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSk7IC8vIHJlbW92ZSByaWdodCBjbGlja1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH1cblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKCF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRsZXQgaXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYic7XG5cdFx0aWYgKHRoaXMubW91c2VJc0Rvd24pIHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG5cdFx0XHR0aGlzLnNjZW5lLm9uU2NlbmVNb3VzZURyYWcoZXZlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc092ZXJSZWxhdGVkID0gdGhpcy5zY2VuZS5vblNjZW5lTW91c2VIb3ZlcihldmVudCk7XG5cdFx0fVxuXHRcdGlmIChpc092ZXJSZWxhdGVkICYmICF0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgcG9pbnRlcic7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdHRoaXMuc2NlbmVEb20uY2xhc3NOYW1lID0gJ3NwaGVyZXMtc2NlbmUgZ3JhYmJlZCc7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vkb3duKCkge1xuXHRcdHRoaXMubW91c2VJc0Rvd24gPSB0cnVlO1xuXHR9XG5cblx0bW91c2V1cCgpIHtcblx0XHR0aGlzLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRtb3VzZXdoZWVsKGV2ZW50KSB7XG5cdFx0c3dpdGNoIChTY2VuZVV0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRjYXNlIC0xOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ291dCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdpbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5zY2VuZS51cGRhdGVDYW1lcmFBc3BlY3QoKTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGlzSGlkZGVuLCBoYW5kbGVTZWFyY2gsIGhhbmRsZVNlYXJjaFRlcm1VcGRhdGV9KSB7XG5cdGNvbnN0IGNsYXNzZXMgPSBpc0hpZGRlbiA/ICdoaWRkZW4gc2VhcmNoLWZvcm0tY29udGFpbmVyJyA6ICdzZWFyY2gtZm9ybS1jb250YWluZXInO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImFydGlzdC1zZWFyY2hcIiBvblN1Ym1pdD17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwic2VhcmNoLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJlLmcuIEppbWkgSGVuZHJpeFwiIHZhbHVlPXtzZWFyY2hUZXJtfSBvbkNoYW5nZT17aGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0gLz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBvbkNsaWNrPXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+R288L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIFNwb3RpZnlQbGF5ZXJDb21wb25lbnQoe2FydGlzdCwgaXNIaWRkZW59KSB7XG5cdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZC9hcnRpc3QvJztcblx0Y29uc3QgYXJ0aXN0RW1iZWRVcmwgPSBgJHtlbWJlZFVybH0ke2FydGlzdC5pZH1gO1xuXHRsZXQgaUZyYW1lTWFya3VwID0gJyc7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0Y29uc3QgY2xhc3NlcyA9IGlzSGlkZGVuID8gJ2hpZGRlbiBzcG90aWZ5LXBsYXllci1jb250YWluZXInIDogJ3Nwb3RpZnktcGxheWVyLWNvbnRhaW5lcic7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuXHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHQ8L2Rpdj5cblx0KVxufSIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3QsXG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cbmNvbnN0IEFydGlzdEluZm9Db250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoQXJ0aXN0SW5mb0NvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IEFydGlzdEluZm9Db250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHtBcnRpc3RMaXN0Q29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnRcIjtcbmltcG9ydCB7TXVzaWNEYXRhU2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZVwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHR2aXNpdGVkQXJ0aXN0czogc3RhdGUudmlzaXRlZEFydGlzdHMsXG5cdFx0aXNIaWRkZW46IHN0YXRlLmhpZGVJbmZvXG5cdH1cbn07XG5cblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RMaXN0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0TGlzdENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1NjZW5lQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3NjZW5lLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNjZW5lQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNjZW5lQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7IE11c2ljRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgdXBkYXRlU2VhcmNoVGVybSB9IGZyb20gJy4uL3N0YXRlL2FjdGlvbnMnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRzZWFyY2hUZXJtOiBzdGF0ZS5zZWFyY2hUZXJtLFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYW5kbGVTZWFyY2g6IChldnQsIGFydGlzdE5hbWUpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5zZWFyY2goYXJ0aXN0TmFtZSk7XG5cdFx0fSxcblx0XHRoYW5kbGVTZWFyY2hUZXJtVXBkYXRlOiAoZXZ0KSA9PiB7XG5cdFx0XHRkaXNwYXRjaCh1cGRhdGVTZWFyY2hUZXJtKGV2dC50YXJnZXQudmFsdWUpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNlYXJjaENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKFNlYXJjaElucHV0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U3BvdGlmeVBsYXllckNvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50XCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0LFxuXHRcdGlzSGlkZGVuOiBzdGF0ZS5oaWRlSW5mb1xuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHthcnRpc3REYXRhQXZhaWxhYmxlfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBzZWFyY2goYXJ0aXN0TmFtZSkge1xuXHRcdGxldCBzZWFyY2hVUkwgPSAnL2FwaS9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhcnRpc3ROYW1lKTtcblx0XHRyZXR1cm4gd2luZG93LmZldGNoKHNlYXJjaFVSTCwge1xuXHRcdFx0Y3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIlxuXHRcdH0pXG5cdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuanNvbigpKVxuXHRcdC50aGVuKChqc29uKSA9PiBzdG9yZS5kaXNwYXRjaChhcnRpc3REYXRhQXZhaWxhYmxlKGpzb24pKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXJ0aXN0KGFydGlzdElkKSB7XG5cdFx0bGV0IGFydGlzdFVSTCA9ICcvYXBpL2FydGlzdC8nICsgYXJ0aXN0SWQ7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChhcnRpc3RVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4gc3RvcmUuZGlzcGF0Y2goYXJ0aXN0RGF0YUF2YWlsYWJsZShqc29uKSkpO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9EQVRBX0FWQUlMQUJMRSA9ICdBUlRJU1RfREFUQV9BVkFJTEFCTEUnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuZXhwb3J0IGNvbnN0IFJFTEFURURfQ0xJQ0sgPSAnUkVMQVRFRF9DTElDSyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnRpc3REYXRhQXZhaWxhYmxlKGRhdGEpIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBBUlRJU1RfREFUQV9BVkFJTEFCTEUsXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZWFyY2hUZXJtKHNlYXJjaFRlcm0pIHtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBTRUFSQ0hfVEVSTV9VUERBVEUsXG5cdFx0c2VhcmNoVGVybTogc2VhcmNoVGVybVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGVkQ2xpY2soKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogUkVMQVRFRF9DTElDS1xuXHR9XG59XG4iLCJpbXBvcnQge1NFQVJDSF9URVJNX1VQREFURSwgQVJUSVNUX0RBVEFfQVZBSUxBQkxFLCBSRUxBVEVEX0NMSUNLfSBmcm9tICcuLi9hY3Rpb25zJ1xubGV0IGluaXRpYWxTdGF0ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJyk7XG5cbmlmICghaW5pdGlhbFN0YXRlKSB7XG5cdGluaXRpYWxTdGF0ZSA9IHtcblx0XHRhcnRpc3Q6IHtcblx0XHRcdGlkOiAnJyxcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0aW1nVXJsOiAnJyxcblx0XHRcdGdlbnJlczogW10sXG5cdFx0XHRwb3B1bGFyaXR5OiAwLFxuXHRcdFx0aW1hZ2VzOiBbXVxuXHRcdH0sXG5cdFx0c2VhcmNoVGVybTogJycsXG5cdFx0dmlzaXRlZEFydGlzdHM6IFtdLFxuXHRcdGhpZGVJbmZvOiB0cnVlXG5cdH07XG59IGVsc2Uge1xuXHRpbml0aWFsU3RhdGUgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJykpO1xufVxuXG5jb25zdCBhcnRpc3RTZWFyY2ggPSAoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikgPT4ge1xuXHRsZXQgbmV3U3RhdGU7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdG5ld1N0YXRlID0ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0c2VhcmNoVGVybTogYWN0aW9uLnNlYXJjaFRlcm0sXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBUlRJU1RfREFUQV9BVkFJTEFCTEU6XG5cdFx0XHRpZiAoYWN0aW9uLmRhdGEuaWQpIHtcblx0XHRcdFx0bGV0IGFscmVhZHlWaXNpdGVkID0gISFzdGF0ZS52aXNpdGVkQXJ0aXN0cy5sZW5ndGggJiYgc3RhdGUudmlzaXRlZEFydGlzdHMuc29tZSgoYXJ0aXN0KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXJ0aXN0LmlkID09PSBhY3Rpb24uZGF0YS5pZDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0bGV0IHZpc2l0ZWRBcnRpc3RzID0gYWxyZWFkeVZpc2l0ZWQgPyBzdGF0ZS52aXNpdGVkQXJ0aXN0cyA6IFsuLi5zdGF0ZS52aXNpdGVkQXJ0aXN0cywgYWN0aW9uLmRhdGFdO1xuXHRcdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0XHRhcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHRcdHZpc2l0ZWRBcnRpc3RzOiBbXG5cdFx0XHRcdFx0XHQuLi52aXNpdGVkQXJ0aXN0cyxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5kYXRhLm5hbWUsXG5cdFx0XHRcdFx0aGlkZUluZm86IGZhbHNlXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ05vIEFQSSBkYXRhIGF2YWlsYWJsZSBmb3IgZ2l2ZW4gYXJ0aXN0LiBOZWVkIHRvIHJlZnJlc2ggQVBJIHNlc3Npb24/Jyk7XG5cdFx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFJFTEFURURfQ0xJQ0s6XG5cdFx0XHRuZXdTdGF0ZSA9IHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdGhpZGVJbmZvOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdG5ld1N0YXRlID0gc3RhdGU7XG5cdH1cblx0d2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3N0YXRlJywgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpKTtcblx0cmV0dXJuIG5ld1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXJ0aXN0U2VhcmNoOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcnRpc3RTZWFyY2ggZnJvbSBcIi4vcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaFwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFydGlzdFNlYXJjaCxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
