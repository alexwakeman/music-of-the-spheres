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

},{"./components/app.component.jsx":6,"./state/store":21,"react":undefined,"react-dom":undefined,"react-redux":undefined}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TRACK_CAM_TO_OBJ = 'TRACK_CAM_TO_OBJ';
var DEFAULT = 'DEFAULT';

var MotionLab = function () {
	function MotionLab() {
		_classCallCheck(this, MotionLab);
	}

	_createClass(MotionLab, [{
		key: 'init',
		value: function init(spheresSceneInstance) {
			this.renderer = renderer;
			this.scene = scene;
			this.camera = camera;
			this.spheresSceneInstance = spheresSceneInstance;
			this.t1 = 0.0; // previous frame tick
			this.t2 = 0.0; // current frame tick
			this.job = {
				type: DEFAULT
			};
			this.animate();
		}
	}, {
		key: 'animate',
		value: function animate() {
			this.t1 = this.t2;
			this.t2 = performance.now();
			switch (this.job.type) {
				case TRACK_CAM_TO_OBJ:
					// requires a path and lookAt + object3D
					this.appendTranslateJob(job);
					break;
				case DEFAULT:
					this.spheresSceneInstance.updateRotation();
			}
			this.spheresSceneInstance.renderer.render(this.spheresSceneInstance.scene, this.spheresSceneInstance.camera);
			window.requestAnimationFrame(this.animate.bind(this));
		}
	}, {
		key: 'addJob',
		value: function addJob(job) {
			this.job = job;
			switch (this.job.jobType) {
				case 'translate':
					// requires a path and lookAt + object3D
					this.appendTranslateJob(job);
					break;
			}
		}
	}, {
		key: 'translateTransitionObject',
		value: function translateTransitionObject() {
			var isFinished = this.job.currentTime >= this.job.duration;
			if (!isFinished) {
				this.followPath();
			} else {
				this.endAnimation();
			}
		}
	}, {
		key: 'followPath',
		value: function followPath() {
			var p = this.job.path.getPoint(this.job.currentTime);
			this.job.object3D.position.copy(p);
			this.job.currentTime += 0.01;
		}
	}, {
		key: 'endAnimation',
		value: function endAnimation() {
			this.job.jobType = 'default';
			this.job.callback && this.job.callback();
		}
	}, {
		key: 'trackCameraToObject',
		value: function trackCameraToObject(object3D, callback) {
			this.job.type = TRACK_CAM_TO_OBJ;
			this.job.startTime = this.t2;
			this.job.t = 0.0;
			this.job.currentTime = 0.0;
			this.job.callback = callback;
			this.job.object3D = object3D;
			this.job.path = new _three.Spline([object3D.position.clone(), this.spheresSceneInstance.camera.position.clone()]);
		}

		/**
   * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
   * Rotation of camera is *inverse* of mouse movement direction
   */

	}, {
		key: 'updateRotation',
		value: function updateRotation() {
			var _this = this;

			var camQuaternionUpdate = void 0;
			var yMoreThanXMouse = this.mousePosDiffY >= this.mousePosDiffX;
			var xMoreThanYMouse = !yMoreThanXMouse;
			if (this.mousePosYIncreased && yMoreThanXMouse) {
				this.cameraRotation.x -= this.speedX;
			} else if (!this.mousePosYIncreased && yMoreThanXMouse) {
				this.cameraRotation.x += this.speedX;
			}

			if (this.mousePosXIncreased && xMoreThanYMouse) {
				this.cameraRotation.y += this.speedY;
			} else if (!this.mousePosXIncreased && xMoreThanYMouse) {
				this.cameraRotation.y -= this.speedY;
			}
			camQuaternionUpdate = SceneUtils.renormalizeQuaternion(this.camera);
			camQuaternionUpdate.setFromEuler(this.cameraRotation);

			this.camera.position.set(camQuaternionUpdate.x * this.cameraDistance, camQuaternionUpdate.y * this.cameraDistance, camQuaternionUpdate.z * this.cameraDistance);
			this.camera.lookAt(this.cameraLookAt);
			// update rotation of text attached objects, to force them to look at camera
			// this makes them readable
			this.graphContainer.traverse(function (obj) {
				if (obj.hasOwnProperty('isText')) {
					obj.lookAt(_this.graphContainer.worldToLocal(_this.camera.position));
				}
			});
			this.reduceSpeed(0.0005);
		}
	}, {
		key: 'reduceSpeed',
		value: function reduceSpeed(amount) {
			if (this.speedX > 0.005) {
				this.speedX -= amount;
			}

			if (this.speedY > 0.005) {
				this.speedY -= amount;
			}
		}
	}, {
		key: 'zoom',
		value: function zoom(direction) {
			switch (direction) {
				case 'in':
					this.cameraDistance -= 35;
					break;
				case 'out':
					this.cameraDistance += 35;
					break;
			}
		}
	}]);

	return MotionLab;
}();

exports.default = MotionLab;

},{"three":undefined}],3:[function(require,module,exports){
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

	relatedArtistSpheres: []
};

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HELVETIKER = void 0;

var SceneUtils = function () {
	function SceneUtils() {
		_classCallCheck(this, SceneUtils);
	}

	_createClass(SceneUtils, null, [{
		key: 'init',
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
		key: 'clamp',
		value: function clamp(a, b, c) {
			return Math.max(b, Math.min(c, a));
		}

		/**
   * Given positive x return 1, negative x return -1, or 0 otherwise
   * @param x
   * @returns {number}
   */

	}, {
		key: 'sign',
		value: function sign(x) {
			return x > 0 ? 1 : x < 0 ? -1 : 0;
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
		value: function getIntersectsFromMousePos(event, graph, raycaster, mouseVector, camera, renderer) {
			mouseVector.x = event.clientX / renderer.domElement.clientWidth * 2 - 1;
			mouseVector.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
			raycaster.setFromCamera(mouseVector, camera);
			return raycaster.intersectObjects(graph.children, true);
		}
	}, {
		key: 'createMainArtistSphere',
		value: function createMainArtistSphere(artist) {
			var radius = 200;
			var size = 200;
			var geometry = new THREE.SphereGeometry(40, 35, 35);
			var sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.mainArtist }));
			sphere.artistObj = artist;
			sphere.radius = radius;
			sphere.isMainArtistSphere = true;
			sphere.isSphere = true;
			this.addText(artist.name, 34, sphere);
			return sphere;
		}

		// TODO: get stats for relatedness (genres union measure) - distance from main artist
		// TODO: clean up this code, remove the hard coded numbers

	}, {
		key: 'createRelatedSpheres',
		value: function createRelatedSpheres(artist, mainArtistSphere) {
			var relatedArtistsSphereArray = [];
			var relatedArtistObj = void 0;
			var sphereFaceIndex = 0; // references a well spaced face of the main artist sphere
			var facesCount = mainArtistSphere.geometry.faces.length - 1;
			var step = Math.round(facesCount / 10 - 1);

			for (var i = 0, len = 10; i < len; i++) {
				relatedArtistObj = artist.related[i];
				var radius = 200; //relatedArtistObj.followers.total; // size of this sphere
				var size = radius * 2;
				var geometry = new THREE.SphereGeometry(40, 35, 35);
				var relatedArtistSphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: _colours.Colours.relatedArtist }));
				relatedArtistObj.unitLength = 100;
				relatedArtistObj.range = 50;
				relatedArtistSphere.artistObj = relatedArtistObj;
				relatedArtistSphere.radius = radius;
				relatedArtistSphere.isRelatedArtistSphere = true;
				relatedArtistSphere.isSphere = true;
				relatedArtistSphere.yearsShared = relatedArtistObj.yearsShared;
				relatedArtistSphere.distance = 200; // will be genre union statistic
				sphereFaceIndex += step;
				SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, sphereFaceIndex);
				SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
				SceneUtils.addText(relatedArtistObj.name, 20, relatedArtistSphere);
				relatedArtistsSphereArray.push(relatedArtistSphere);
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
			geometry.vertices.push(new THREE.Vector3(0, 1, 0));
			geometry.vertices.push(relatedSphere.position.clone());
			line = new THREE.Line(geometry, material);
			mainArtistSphere.add(line);
		}
	}, {
		key: 'positionRelatedArtist',
		value: function positionRelatedArtist(mainArtistSphere, relatedSphere, sphereFaceIndex) {
			var mainArtistSphereFace = mainArtistSphere.geometry.faces[Math.round(sphereFaceIndex)].normal.clone();
			relatedSphere.position.copy(mainArtistSphereFace.multiply(new THREE.Vector3(relatedSphere.distance, relatedSphere.distance, relatedSphere.distance)));
		}
	}, {
		key: 'addText',
		value: function addText(label, size, sphere) {
			var textMesh = void 0;
			var materialFront = new THREE.MeshBasicMaterial({ color: _colours.Colours.textOuter });
			var materialSide = new THREE.MeshBasicMaterial({ color: _colours.Colours.textInner });
			var materialArray = [materialFront, materialSide];
			var textGeom = new THREE.TextGeometry(label, {
				font: HELVETIKER,
				size: 80,
				height: 5,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 10,
				bevelSize: 8,
				bevelSegments: 5
			});
			textGeom.computeBoundingBox();
			textGeom.computeVertexNormals();
			textMesh = new THREE.Mesh(textGeom, materialArray);
			textMesh.position.set(-size, sphere.radius * 2 + 20, 0); // underneath the sphere
			textMesh.isText = true;
			sphere.add(textMesh);
		}
	}, {
		key: 'lighting',
		value: function lighting(scene) {
			var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
			dirLight.position.set(0, 0, 1).normalize();
			scene.add(dirLight);
			var pointLight = new THREE.PointLight(0xffffff, 1.5);
			pointLight.position.set(0, 100, 90);
			pointLight.color.setHex(_colours.Colours.textOuter);
			scene.add(pointLight);
		}
	}]);

	return SceneUtils;
}();

exports.SceneUtils = SceneUtils;

},{"../config/colours":12,"three":undefined}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpheresScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require("three");

var THREE = _interopRequireWildcard(_three);

var _sceneUtils = require("./scene-utils.class");

var _colours = require("../config/colours");

var _motionLab = require("./motion-lab.class");

var _motionLab2 = _interopRequireDefault(_motionLab);

var _musicData = require("../services/music-data.service");

var _sceneProps = require("./scene-props");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpheresScene = exports.SpheresScene = function () {
	function SpheresScene(container) {
		_classCallCheck(this, SpheresScene);

		var artistQuery = decodeURIComponent(window.location.hash.replace('#', ''));
		this.motionLab = new _motionLab2.default();
		_sceneUtils.SceneUtils.init();

		// attach to dom
		_sceneProps.SceneProps.renderer.setSize(window.innerWidth, window.innerHeight);
		_sceneProps.SceneProps.renderer.domElement.id = 'renderer';
		this.container = container;
		this.container.appendChild(_sceneProps.SceneProps.renderer.domElement);

		// init the scene
		_sceneProps.SceneProps.graphContainer.position.set(1, 5, 0);
		_sceneProps.SceneProps.scene.add(_sceneProps.SceneProps.graphContainer);
		_sceneProps.SceneProps.scene.add(_sceneProps.SceneProps.camera);
		_sceneProps.SceneProps.camera.position.set(0, 250, _sceneProps.SceneProps.cameraDistance);
		_sceneProps.SceneProps.camera.lookAt(_sceneProps.SceneProps.scene.position);
		_sceneUtils.SceneUtils.lighting(_sceneProps.SceneProps.scene);

		// check for query string
		if (artistQuery) {
			_musicData.MusicDataService.getMainArtistData(artistQuery);
		}
	}

	_createClass(SpheresScene, [{
		key: "onSceneMouseHover",
		value: function onSceneMouseHover(event) {
			var selected = void 0;
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(event, _sceneProps.SceneProps.graphContainer, _sceneProps.SceneProps.raycaster, _sceneProps.SceneProps.mouseVector, _sceneProps.SceneProps.camera, _sceneProps.SceneProps.renderer);
			this.mouseIsOverRelated = false;
			_sceneProps.SceneProps.graphContainer.traverse(function (obj) {
				if (obj.hasOwnProperty('isRelatedArtistSphere')) {
					// reset the related sphere to red
					obj.material.color.setHex(_colours.Colours.relatedArtist);
				}
			});

			if (intersects.length) {
				// mouse is over a Mesh
				this.mouseIsOverRelated = true;
				selected = intersects[0].object;
				if (selected.hasOwnProperty('isRelatedArtistSphere')) {
					selected.material.color.setHex(_colours.Colours.relatedArtistHover);
				}
			}
		}
	}, {
		key: "onSceneMouseDrag",
		value: function onSceneMouseDrag(event) {
			var dt = this.t2 - this.t1;
			_sceneProps.SceneProps.normalizedMousePos = new THREE.Vector2(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
			_sceneProps.SceneProps.mousePosXIncreased = _sceneProps.SceneProps.normalizedMousePos.x > _sceneProps.SceneProps.oldNormalizedMousePos.x;
			_sceneProps.SceneProps.mousePosYIncreased = _sceneProps.SceneProps.normalizedMousePos.y > _sceneProps.SceneProps.oldNormalizedMousePos.y;
			_sceneProps.SceneProps.mousePosDiffX = Math.abs(Math.abs(_sceneProps.SceneProps.normalizedMousePos.x) - Math.abs(_sceneProps.SceneProps.oldNormalizedMousePos.x));
			_sceneProps.SceneProps.mousePosDiffY = Math.abs(Math.abs(_sceneProps.SceneProps.normalizedMousePos.y) - Math.abs(_sceneProps.SceneProps.oldNormalizedMousePos.y));
			_sceneProps.SceneProps.speedX = (1 + _sceneProps.SceneProps.mousePosDiffX) / dt;
			_sceneProps.SceneProps.speedY = (1 + _sceneProps.SceneProps.mousePosDiffY) / dt;
			_sceneProps.SceneProps.oldNormalizedMousePos = _sceneProps.SceneProps.normalizedMousePos;
		}
	}, {
		key: "onSceneMouseClick",
		value: function onSceneMouseClick(event) {
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(event, _sceneProps.SceneProps.graphContainer, _sceneProps.SceneProps.raycaster, _sceneProps.SceneProps.mouseVector, _sceneProps.SceneProps.camera, _sceneProps.SceneProps.renderer);
			if (intersects.length) {
				var selected = intersects[0].object;
				if (selected.hasOwnProperty('isRelatedArtistSphere')) {
					this.startRelatedArtistSearch(selected);
				}
			}
		}
	}, {
		key: "composeScene",
		value: function composeScene(artist) {
			_sceneProps.SceneProps.mainArtistSphere = _sceneUtils.SceneUtils.createMainArtistSphere(artist);
			_sceneProps.SceneProps.relatedArtistSpheres = _sceneUtils.SceneUtils.createRelatedSpheres(artist, _sceneProps.SceneProps.mainArtistSphere);
			_sceneUtils.SceneUtils.appendObjectsToScene(_sceneProps.SceneProps.graphContainer, _sceneProps.SceneProps.mainArtistSphere, _sceneProps.SceneProps.relatedArtistSpheres);
		}
	}, {
		key: "startRelatedArtistSearch",
		value: function startRelatedArtistSearch(selectedSphere) {
			var _this = this;

			var target = selectedSphere.position.clone();
			this.clearGraph();
			_sceneUtils.SceneUtils.appendObjectsToScene(_sceneProps.SceneProps.graphContainer, selectedSphere);
			this.motionLab.addJob({
				jobType: 'translate',
				startPoint: target,
				endPoint: _sceneProps.SceneProps.camera.position.clone(),
				object3D: selectedSphere,
				duration: 2.0, // secs
				callback: function callback() {
					_this.clearGraph();
					_musicData.MusicDataService.getMainArtistData(selectedSphere.artistObj.name);
					window.location.hash = encodeURIComponent(selectedSphere.artistObj.name);
				}
			});
		}
	}, {
		key: "clearGraph",
		value: function clearGraph() {
			var oldParent = _sceneProps.SceneProps.graphContainer.getObjectByName('parent');
			if (!oldParent) {
				_sceneProps.SceneProps.graphContainer.remove(oldParent);
			}
		}
	}]);

	return SpheresScene;
}();

},{"../config/colours":12,"../services/music-data.service":18,"./motion-lab.class":2,"./scene-props":3,"./scene-utils.class":4,"three":undefined}],6:[function(require,module,exports){
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

},{"../containers/artist-info.container":13,"../containers/artist-list.container":14,"../containers/scene.container":15,"../containers/search-input.container":16,"../containers/spotify-player.container":17,"react":undefined}],7:[function(require,module,exports){
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

},{"../state/store":21,"react":undefined}],8:[function(require,module,exports){
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
	var visitedArtists = _ref.visitedArtists;

	var artists = visitedArtists.map(function (artist) {
		var href = '/?artist=' + artist.name;
		var imgUrl = artist.images.length ? artist.images[artist.images.length - 1].url : '';
		return React.createElement(
			'div',
			{ className: 'artist', key: artist.id },
			React.createElement(
				'a',
				{ href: href, id: artist.id, className: 'nav-artist-link' },
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

},{"../state/store":21,"react":undefined}],9:[function(require,module,exports){
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
		_this.mouseDown = false;
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
			if (this.mouseDown) {
				this.scene.onSceneMouseDrag(event);
			} else {
				this.scene.onSceneMouseHover(event);
			}
		}
	}, {
		key: 'mousedown',
		value: function mousedown() {
			this.scene.mouseIsDown = true;
		}
	}, {
		key: 'mouseup',
		value: function mouseup() {
			this.scene.mouseIsDown = false;
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

},{"../classes/scene-utils.class":4,"../classes/spheres-scene.class":5,"../state/store":21,"react":undefined}],10:[function(require,module,exports){
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

},{"react":undefined}],11:[function(require,module,exports){
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
			{ id: 'spotify-player' },
			React.createElement('iframe', { src: artistEmbedUrl, width: '300', height: '80' }),
			React.createElement(
				'div',
				{ className: 'album-nav' },
				React.createElement(
					'a',
					{ href: '#' },
					'Prev'
				),
				React.createElement(
					'a',
					{ href: '#' },
					'Next'
				)
			)
		);
	}
	return React.createElement(
		'div',
		{ className: 'spotify-player-container' },
		iFrameMarkup
	);
}

},{"react":undefined}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"../components/artist-info.component":7,"react-redux":undefined}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _reactRedux = require("react-redux");

var _artistList = require("../components/artist-list.component");

var mapStateToProps = function mapStateToProps(state) {
	return {
		visitedArtists: state.visitedArtists
	};
};

var ArtistListContainer = (0, _reactRedux.connect)(mapStateToProps)(_artistList.ArtistListComponent);

exports.default = ArtistListContainer;

},{"../components/artist-list.component":8,"react-redux":undefined}],15:[function(require,module,exports){
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

},{"../components/scene.component":9,"react-redux":undefined}],16:[function(require,module,exports){
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
		handleSearch: function handleSearch(evt, searchTerm) {
			evt.preventDefault();
			_musicData.MusicDataService.getMainArtistData(searchTerm);
		},
		handleSearchTermUpdate: function handleSearchTermUpdate(evt) {
			dispatch((0, _actions.updateSearchTerm)(evt.target.value));
		}
	};
};

var SearchContainer = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_searchInputComponent.SearchInputComponent);

exports.default = SearchContainer;

},{"../components/search-input.component.jsx":10,"../services/music-data.service":18,"../state/actions":19,"react-redux":undefined}],17:[function(require,module,exports){
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

},{"../components/spotify-player.component":11,"react-redux":undefined}],18:[function(require,module,exports){
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
		key: 'getMainArtistData',
		value: function getMainArtistData(artistName) {
			var searchURL = '/api/search/' + encodeURIComponent(artistName);
			return window.fetch(searchURL, {
				credentials: "same-origin"
			}).then(function (data) {
				return data.json();
			}).then(function (json) {
				return _store.store.dispatch((0, _actions.searchDone)(json));
			});
		}
	}]);

	return MusicDataService;
}();

},{"../state/actions":19,"../state/store":21}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.searchDone = searchDone;
exports.updateSearchTerm = updateSearchTerm;
var ARTIST_SEARCH_DONE = exports.ARTIST_SEARCH_DONE = 'ARTIST_SEARCH_DONE';
var SEARCH_TERM_UPDATE = exports.SEARCH_TERM_UPDATE = 'SEARCH_TERM_UPDATE';

function searchDone(data) {
	return {
		type: ARTIST_SEARCH_DONE,
		data: data
	};
}

function updateSearchTerm(searchTerm) {
	return {
		type: SEARCH_TERM_UPDATE,
		searchTerm: searchTerm
	};
}

},{}],20:[function(require,module,exports){
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
		case _actions.ARTIST_SEARCH_DONE:
			return _extends({}, state, {
				artist: action.data,
				visitedArtists: [].concat(_toConsumableArray(state.visitedArtists), [action.data])
			});
		default:
			return state;
	}
};

exports.default = artistSearch;

},{"../actions":19}],21:[function(require,module,exports){
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

},{"./reducers/artist-search":20,"redux":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9zY2VuZS1wcm9wcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzLmpzIiwic3JjL2pzL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzcy5qcyIsInNyYy9qcy9jb21wb25lbnRzL2FwcC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zY2VuZS5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXllci5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbmZpZy9jb2xvdXJzLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvYXJ0aXN0LWxpc3QuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyLmpzIiwic3JjL2pzL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3Nwb3RpZnktcGxheWVyLmNvbnRhaW5lci5qcyIsInNyYy9qcy9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UuanMiLCJzcmMvanMvc3RhdGUvYWN0aW9ucy5qcyIsInNyYy9qcy9zdGF0ZS9yZWR1Y2Vycy9hcnRpc3Qtc2VhcmNoLmpzIiwic3JjL2pzL3N0YXRlL3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGlu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QUFPLDRCQUFQLElBQXVDLE9BQU8sNEJBQVAsRUFGckIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7QXBwQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvYXBwLmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuLy8gY2FuY2VsIHJpZ2h0IGNsaWNrXG5kb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudCkgPT4gZXZlbnQuYnV0dG9uICE9PSAyO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiaW1wb3J0IHtTcGxpbmV9IGZyb20gXCJ0aHJlZVwiO1xuY29uc3QgVFJBQ0tfQ0FNX1RPX09CSiA9ICdUUkFDS19DQU1fVE9fT0JKJztcbmNvbnN0IERFRkFVTFQgPSAnREVGQVVMVCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdGlvbkxhYiB7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuXHRpbml0KHNwaGVyZXNTY2VuZUluc3RhbmNlKSB7XG5cdFx0dGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuXHRcdHRoaXMuc2NlbmUgPSBzY2VuZTtcblx0XHR0aGlzLmNhbWVyYSA9IGNhbWVyYTtcblx0XHR0aGlzLnNwaGVyZXNTY2VuZUluc3RhbmNlID0gc3BoZXJlc1NjZW5lSW5zdGFuY2U7XG5cdFx0dGhpcy50MSA9IDAuMDsgLy8gcHJldmlvdXMgZnJhbWUgdGlja1xuXHRcdHRoaXMudDIgPSAwLjA7IC8vIGN1cnJlbnQgZnJhbWUgdGlja1xuXHRcdHRoaXMuam9iID0ge1xuXHRcdFx0dHlwZTogREVGQVVMVFxuXHRcdH07XG5cdFx0dGhpcy5hbmltYXRlKCk7XG5cdH1cblxuXHRhbmltYXRlKCkge1xuXHRcdHRoaXMudDEgPSB0aGlzLnQyO1xuXHRcdHRoaXMudDIgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHRzd2l0Y2ggKHRoaXMuam9iLnR5cGUpIHtcblx0XHRcdGNhc2UgVFJBQ0tfQ0FNX1RPX09CSjovLyByZXF1aXJlcyBhIHBhdGggYW5kIGxvb2tBdCArIG9iamVjdDNEXG5cdFx0XHRcdHRoaXMuYXBwZW5kVHJhbnNsYXRlSm9iKGpvYik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBERUZBVUxUOlxuXHRcdFx0XHR0aGlzLnNwaGVyZXNTY2VuZUluc3RhbmNlLnVwZGF0ZVJvdGF0aW9uKCk7XG5cdFx0fVxuXHRcdHRoaXMuc3BoZXJlc1NjZW5lSW5zdGFuY2UucmVuZGVyZXJcblx0XHRcdC5yZW5kZXIodGhpcy5zcGhlcmVzU2NlbmVJbnN0YW5jZS5zY2VuZSwgdGhpcy5zcGhlcmVzU2NlbmVJbnN0YW5jZS5jYW1lcmEpO1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuXHR9XG5cblx0YWRkSm9iKGpvYikge1xuXHRcdHRoaXMuam9iID0gam9iO1xuXHRcdHN3aXRjaCAodGhpcy5qb2Iuam9iVHlwZSkge1xuXHRcdFx0Y2FzZSAndHJhbnNsYXRlJzovLyByZXF1aXJlcyBhIHBhdGggYW5kIGxvb2tBdCArIG9iamVjdDNEXG5cdFx0XHRcdHRoaXMuYXBwZW5kVHJhbnNsYXRlSm9iKGpvYik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRyYW5zbGF0ZVRyYW5zaXRpb25PYmplY3QoKSB7XG5cdFx0Y29uc3QgaXNGaW5pc2hlZCA9IHRoaXMuam9iLmN1cnJlbnRUaW1lID49IHRoaXMuam9iLmR1cmF0aW9uO1xuXHRcdGlmICghaXNGaW5pc2hlZCkge1xuXHRcdFx0dGhpcy5mb2xsb3dQYXRoKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5lbmRBbmltYXRpb24oKTtcblx0XHR9XG5cdH1cblxuXHRmb2xsb3dQYXRoKCkge1xuXHRcdGNvbnN0IHAgPSB0aGlzLmpvYi5wYXRoLmdldFBvaW50KHRoaXMuam9iLmN1cnJlbnRUaW1lKTtcblx0XHR0aGlzLmpvYi5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHApO1xuXHRcdHRoaXMuam9iLmN1cnJlbnRUaW1lICs9IDAuMDE7XG5cdH1cblxuXHRlbmRBbmltYXRpb24oKSB7XG5cdFx0dGhpcy5qb2Iuam9iVHlwZSA9ICdkZWZhdWx0Jztcblx0XHR0aGlzLmpvYi5jYWxsYmFjayAmJiB0aGlzLmpvYi5jYWxsYmFjaygpO1xuXHR9XG5cblx0dHJhY2tDYW1lcmFUb09iamVjdChvYmplY3QzRCwgY2FsbGJhY2spIHtcbiAgICBcdHRoaXMuam9iLnR5cGUgPSBUUkFDS19DQU1fVE9fT0JKO1xuXHRcdHRoaXMuam9iLnN0YXJ0VGltZSA9IHRoaXMudDI7XG5cdFx0dGhpcy5qb2IudCA9IDAuMDtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSA9IDAuMDtcblx0XHR0aGlzLmpvYi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMuam9iLm9iamVjdDNEID0gb2JqZWN0M0Q7XG5cdFx0dGhpcy5qb2IucGF0aCA9IG5ldyBTcGxpbmUoW1xuXHRcdFx0b2JqZWN0M0QucG9zaXRpb24uY2xvbmUoKSxcblx0XHRcdHRoaXMuc3BoZXJlc1NjZW5lSW5zdGFuY2UuY2FtZXJhLnBvc2l0aW9uLmNsb25lKClcblx0XHRdKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSB0aGlzLm1vdXNlUG9zRGlmZlkgPj0gdGhpcy5tb3VzZVBvc0RpZmZYO1xuXHRcdGNvbnN0IHhNb3JlVGhhbllNb3VzZSA9ICF5TW9yZVRoYW5YTW91c2U7XG5cdFx0aWYgKHRoaXMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFSb3RhdGlvbi54IC09IHRoaXMuc3BlZWRYO1xuXHRcdH1cblx0XHRlbHNlIGlmICghdGhpcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHR0aGlzLmNhbWVyYVJvdGF0aW9uLnggKz0gdGhpcy5zcGVlZFg7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFSb3RhdGlvbi55ICs9IHRoaXMuc3BlZWRZO1xuXHRcdH1cblx0XHRlbHNlIGlmICghdGhpcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHR0aGlzLmNhbWVyYVJvdGF0aW9uLnkgLT0gdGhpcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUgPSBTY2VuZVV0aWxzLnJlbm9ybWFsaXplUXVhdGVybmlvbih0aGlzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIodGhpcy5jYW1lcmFSb3RhdGlvbik7XG5cblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiB0aGlzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS55ICogdGhpcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIHRoaXMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdHRoaXMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0b2JqLmxvb2tBdCh0aGlzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbCh0aGlzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmICh0aGlzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHR0aGlzLnNwZWVkWCAtPSBhbW91bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdHRoaXMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cblxuXHR6b29tKGRpcmVjdGlvbikge1xuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlICdpbic6XG5cdFx0XHRcdHRoaXMuY2FtZXJhRGlzdGFuY2UgLT0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb3V0Jzpcblx0XHRcdFx0dGhpcy5jYW1lcmFEaXN0YW5jZSArPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmV4cG9ydCBjb25zdCBQcm9wcyA9IHtcblx0cmVuZGVyZXI6IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSksXG5cdHNjZW5lOiBuZXcgVEhSRUUuU2NlbmUoKSxcblx0Y2FtZXJhOiBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCksXG5cdGdyYXBoQ29udGFpbmVyOiBuZXcgVEhSRUUuT2JqZWN0M0QoKSxcblx0Y2FtZXJhUm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigwLCAwLCAwKSxcblx0Y2FtZXJhTG9va0F0OiBuZXcgVEhSRUUuVmVjdG9yMygxLCAxLCAxKSxcblx0Y2FtZXJhRGlzdGFuY2U6IDM1MDAsXG5cdFxuXHR0MTogMC4wLCAvLyBvbGQgdGltZVxuXHR0MjogMC4wLCAvLyBub3cgdGltZVxuXHRzcGVlZFg6IDAuMDA1LFxuXHRzcGVlZFk6IDAuMDA1LFxuXHRtb3VzZVBvc0RpZmZYOiAwLjAsXG5cdG1vdXNlUG9zRGlmZlk6IDAuMCxcblx0bW91c2VQb3NYSW5jcmVhc2VkOiBmYWxzZSxcblx0bW91c2VQb3NZSW5jcmVhc2VkOiBmYWxzZSxcblx0cmF5Y2FzdGVyOiBuZXcgVEhSRUUuUmF5Y2FzdGVyKCksXG5cdG1vdXNlVmVjdG9yOiBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRcblx0cmVsYXRlZEFydGlzdFNwaGVyZXM6IFtdXG59OyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5sZXQgSEVMVkVUSUtFUjtcblxuY2xhc3MgU2NlbmVVdGlscyB7XG5cdHN0YXRpYyBpbml0KCkge1xuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0bG9hZGVyLmxvYWQoJy4vanMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nLCAoZm9udCkgPT4gSEVMVkVUSUtFUiA9IGZvbnQpO1xuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYSAtIG1pblxuXHQgKiBAcGFyYW0gYiAtIG1heFxuXHQgKiBAcGFyYW0gYyAtIHZhbHVlIHRvIGNsYW1wXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgY2xhbXAoYSwgYiwgYykge1xuXHRcdHJldHVybiBNYXRoLm1heChiLCBNYXRoLm1pbihjLCBhKSk7XG5cdH1cblxuXHQvKipcblx0ICogR2l2ZW4gcG9zaXRpdmUgeCByZXR1cm4gMSwgbmVnYXRpdmUgeCByZXR1cm4gLTEsIG9yIDAgb3RoZXJ3aXNlXG5cdCAqIEBwYXJhbSB4XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgc2lnbih4KSB7XG5cdFx0cmV0dXJuIHggPiAwID8gMSA6IHggPCAwID8gLTEgOiAwO1xuXHR9O1xuXG5cdHN0YXRpYyByZW5vcm1hbGl6ZVF1YXRlcm5pb24ob2JqZWN0KSB7XG5cdFx0bGV0IGNsb25lID0gb2JqZWN0LmNsb25lKCk7XG5cdFx0bGV0IHEgPSBjbG9uZS5xdWF0ZXJuaW9uO1xuXHRcdGxldCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoTWF0aC5wb3cocS53LCAyKSArIE1hdGgucG93KHEueCwgMikgKyBNYXRoLnBvdyhxLnksIDIpICsgTWF0aC5wb3cocS56LCAyKSk7XG5cdFx0cS53IC89IG1hZ25pdHVkZTtcblx0XHRxLnggLz0gbWFnbml0dWRlO1xuXHRcdHEueSAvPSBtYWduaXR1ZGU7XG5cdFx0cS56IC89IG1hZ25pdHVkZTtcblx0XHRyZXR1cm4gcTtcblx0fVxuXG5cdHN0YXRpYyBnZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCBncmFwaCwgcmF5Y2FzdGVyLCBtb3VzZVZlY3RvciwgY2FtZXJhLCByZW5kZXJlcikge1xuXHRcdG1vdXNlVmVjdG9yLnggPSAoZXZlbnQuY2xpZW50WCAvIHJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGgpICogMiAtIDE7XG5cdFx0bW91c2VWZWN0b3IueSA9IC0gKGV2ZW50LmNsaWVudFkgLyByZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMTtcblx0XHRyYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZVZlY3RvciwgY2FtZXJhKTtcblx0XHRyZXR1cm4gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoZ3JhcGguY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KSB7XG5cdFx0bGV0IHJhZGl1cyA9IDIwMDtcblx0XHRsZXQgc2l6ZSA9IDIwMDtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNDAsIDM1LCAzNSk7XG5cdFx0bGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMubWFpbkFydGlzdH0pKTtcblx0XHRzcGhlcmUuYXJ0aXN0T2JqID0gYXJ0aXN0O1xuXHRcdHNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0c3BoZXJlLmlzTWFpbkFydGlzdFNwaGVyZSA9IHRydWU7XG5cdFx0c3BoZXJlLmlzU3BoZXJlID0gdHJ1ZTtcblx0XHR0aGlzLmFkZFRleHQoYXJ0aXN0Lm5hbWUsIDM0LCBzcGhlcmUpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHQvLyBUT0RPOiBnZXQgc3RhdHMgZm9yIHJlbGF0ZWRuZXNzIChnZW5yZXMgdW5pb24gbWVhc3VyZSkgLSBkaXN0YW5jZSBmcm9tIG1haW4gYXJ0aXN0XG5cdC8vIFRPRE86IGNsZWFuIHVwIHRoaXMgY29kZSwgcmVtb3ZlIHRoZSBoYXJkIGNvZGVkIG51bWJlcnNcblx0c3RhdGljIGNyZWF0ZVJlbGF0ZWRTcGhlcmVzKGFydGlzdCwgbWFpbkFydGlzdFNwaGVyZSkge1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5ID0gW107XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RPYmo7XG5cdFx0bGV0IHNwaGVyZUZhY2VJbmRleCA9IDA7IC8vIHJlZmVyZW5jZXMgYSB3ZWxsIHNwYWNlZCBmYWNlIG9mIHRoZSBtYWluIGFydGlzdCBzcGhlcmVcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIDEwIC0gMSk7XG5cblx0XHRmb3IgKGxldCBpID0gMCwgbGVuID0gMTA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdE9iaiA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IDIwMDsgLy9yZWxhdGVkQXJ0aXN0T2JqLmZvbGxvd2Vycy50b3RhbDsgLy8gc2l6ZSBvZiB0aGlzIHNwaGVyZVxuXHRcdFx0bGV0IHNpemUgPSByYWRpdXMgKiAyO1xuXHRcdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDQwLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0T2JqLnVuaXRMZW5ndGggPSAxMDA7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0T2JqLnJhbmdlID0gNTA7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iaiA9IHJlbGF0ZWRBcnRpc3RPYmo7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNSZWxhdGVkQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS55ZWFyc1NoYXJlZCA9IHJlbGF0ZWRBcnRpc3RPYmoueWVhcnNTaGFyZWQ7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmRpc3RhbmNlID0gMjAwOyAvLyB3aWxsIGJlIGdlbnJlIHVuaW9uIHN0YXRpc3RpY1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0T2JqLm5hbWUsIDIwLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkucHVzaChyZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXk7XG5cdH1cblxuXHRzdGF0aWMgYXBwZW5kT2JqZWN0c1RvU2NlbmUoZ3JhcGhDb250YWluZXIsIHNwaGVyZSwgc3BoZXJlQXJyYXkpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblx0XHRwYXJlbnQubmFtZSA9ICdwYXJlbnQnO1xuXHRcdHBhcmVudC5hZGQoc3BoZXJlKTtcblx0XHRpZiAoc3BoZXJlQXJyYXkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BoZXJlQXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0cGFyZW50LmFkZChzcGhlcmVBcnJheVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGdyYXBoQ29udGFpbmVyLmFkZChwYXJlbnQpO1xuXHR9XG5cblx0c3RhdGljIGpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRMaW5lSm9pbn0pO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdGxldCBsaW5lO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCkpO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gocmVsYXRlZFNwaGVyZS5wb3NpdGlvbi5jbG9uZSgpKTtcblx0XHRsaW5lID0gbmV3IFRIUkVFLkxpbmUoZ2VvbWV0cnksIG1hdGVyaWFsKTtcblx0XHRtYWluQXJ0aXN0U3BoZXJlLmFkZChsaW5lKTtcblx0fVxuXG5cdHN0YXRpYyBwb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KSB7XG5cdFx0bGV0IG1haW5BcnRpc3RTcGhlcmVGYWNlID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlc1tNYXRoLnJvdW5kKHNwaGVyZUZhY2VJbmRleCldLm5vcm1hbC5jbG9uZSgpO1xuXHRcdHJlbGF0ZWRTcGhlcmUucG9zaXRpb25cblx0XHRcdC5jb3B5KG1haW5BcnRpc3RTcGhlcmVGYWNlLm11bHRpcGx5KG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIGFkZFRleHQobGFiZWwsIHNpemUsIHNwaGVyZSkge1xuXHRcdGxldCB0ZXh0TWVzaDtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogODAsXG5cdFx0XHRoZWlnaHQ6IDUsXG5cdFx0XHRjdXJ2ZVNlZ21lbnRzOiAxMixcblx0XHRcdGJldmVsRW5hYmxlZDogdHJ1ZSxcblx0XHRcdGJldmVsVGhpY2tuZXNzOiAxMCxcblx0XHRcdGJldmVsU2l6ZTogOCxcblx0XHRcdGJldmVsU2VnbWVudHM6IDVcblx0XHR9KTtcblx0XHR0ZXh0R2VvbS5jb21wdXRlQm91bmRpbmdCb3goKTtcblx0XHR0ZXh0R2VvbS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuXHRcdHRleHRNZXNoID0gbmV3IFRIUkVFLk1lc2godGV4dEdlb20sIG1hdGVyaWFsQXJyYXkpO1xuXHRcdHRleHRNZXNoLnBvc2l0aW9uLnNldCgtc2l6ZSwgc3BoZXJlLnJhZGl1cyAqIDIgKyAyMCwgMCk7IC8vIHVuZGVybmVhdGggdGhlIHNwaGVyZVxuXHRcdHRleHRNZXNoLmlzVGV4dCA9IHRydWU7XG5cdFx0c3BoZXJlLmFkZCh0ZXh0TWVzaCk7XG5cdH1cblxuXHRzdGF0aWMgbGlnaHRpbmcoc2NlbmUpIHtcblx0XHRsZXQgZGlyTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMC4xMjUpO1xuXHRcdGRpckxpZ2h0LnBvc2l0aW9uLnNldCgwLCAwLCAxKS5ub3JtYWxpemUoKTtcblx0XHRzY2VuZS5hZGQoIGRpckxpZ2h0ICk7XG5cdFx0bGV0IHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMS41KTtcblx0XHRwb2ludExpZ2h0LnBvc2l0aW9uLnNldCgwLCAxMDAsIDkwKTtcblx0XHRwb2ludExpZ2h0LmNvbG9yLnNldEhleChDb2xvdXJzLnRleHRPdXRlcik7XG5cdFx0c2NlbmUuYWRkKHBvaW50TGlnaHQpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gXCIuLi9jb25maWcvY29sb3Vyc1wiO1xuaW1wb3J0IE1vdGlvbkxhYiBmcm9tIFwiLi9tb3Rpb24tbGFiLmNsYXNzXCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcbmltcG9ydCB7U2NlbmVQcm9wc30gZnJvbSAnLi9zY2VuZS1wcm9wcyc7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmVzU2NlbmUge1xuXHRjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcblx0XHRjb25zdCBhcnRpc3RRdWVyeSA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpKTtcblx0XHR0aGlzLm1vdGlvbkxhYiA9IG5ldyBNb3Rpb25MYWIoKTtcblx0XHRTY2VuZVV0aWxzLmluaXQoKTtcblxuXHRcdC8vIGF0dGFjaCB0byBkb21cblx0XHRTY2VuZVByb3BzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cdFx0U2NlbmVQcm9wcy5yZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ3JlbmRlcmVyJztcblx0XHR0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcblx0XHR0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChTY2VuZVByb3BzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdFx0Ly8gaW5pdCB0aGUgc2NlbmVcblx0XHRTY2VuZVByb3BzLmdyYXBoQ29udGFpbmVyLnBvc2l0aW9uLnNldCgxLCA1LCAwKTtcblx0XHRTY2VuZVByb3BzLnNjZW5lLmFkZChTY2VuZVByb3BzLmdyYXBoQ29udGFpbmVyKTtcblx0XHRTY2VuZVByb3BzLnNjZW5lLmFkZChTY2VuZVByb3BzLmNhbWVyYSk7XG5cdFx0U2NlbmVQcm9wcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgU2NlbmVQcm9wcy5jYW1lcmFEaXN0YW5jZSk7XG5cdFx0U2NlbmVQcm9wcy5jYW1lcmEubG9va0F0KFNjZW5lUHJvcHMuc2NlbmUucG9zaXRpb24pO1xuXHRcdFNjZW5lVXRpbHMubGlnaHRpbmcoU2NlbmVQcm9wcy5zY2VuZSk7XG5cblx0XHQvLyBjaGVjayBmb3IgcXVlcnkgc3RyaW5nXG5cdFx0aWYgKGFydGlzdFF1ZXJ5KSB7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldE1haW5BcnRpc3REYXRhKGFydGlzdFF1ZXJ5KTtcblx0XHR9XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRjb25zdCBpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCBTY2VuZVByb3BzLmdyYXBoQ29udGFpbmVyLCBTY2VuZVByb3BzLnJheWNhc3Rlcixcblx0XHRcdFNjZW5lUHJvcHMubW91c2VWZWN0b3IsIFNjZW5lUHJvcHMuY2FtZXJhLCBTY2VuZVByb3BzLnJlbmRlcmVyKTtcblx0XHR0aGlzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdFNjZW5lUHJvcHMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHsgLy8gcmVzZXQgdGhlIHJlbGF0ZWQgc3BoZXJlIHRvIHJlZFxuXHRcdFx0XHRvYmoubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHsgLy8gbW91c2UgaXMgb3ZlciBhIE1lc2hcblx0XHRcdHRoaXMubW91c2VJc092ZXJSZWxhdGVkID0gdHJ1ZTtcblx0XHRcdHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoc2VsZWN0ZWQuaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7XG5cdFx0XHRcdHNlbGVjdGVkLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0b25TY2VuZU1vdXNlRHJhZyhldmVudCkge1xuXHRcdGNvbnN0IGR0ID0gdGhpcy50MiAtIHRoaXMudDE7XG5cdFx0U2NlbmVQcm9wcy5ub3JtYWxpemVkTW91c2VQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMihcblx0XHRcdChldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGgpICogMiAtIDEsXG5cdFx0XHQtKGV2ZW50LmNsaWVudFkgLyB3aW5kb3cuaW5uZXJIZWlnaHQpICogMiArIDEpO1xuXHRcdFNjZW5lUHJvcHMubW91c2VQb3NYSW5jcmVhc2VkID0gKFNjZW5lUHJvcHMubm9ybWFsaXplZE1vdXNlUG9zLnggPiBTY2VuZVByb3BzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy54KTtcblx0XHRTY2VuZVByb3BzLm1vdXNlUG9zWUluY3JlYXNlZCA9IChTY2VuZVByb3BzLm5vcm1hbGl6ZWRNb3VzZVBvcy55ID4gU2NlbmVQcm9wcy5vbGROb3JtYWxpemVkTW91c2VQb3MueSk7XG5cdFx0U2NlbmVQcm9wcy5tb3VzZVBvc0RpZmZYID0gTWF0aC5hYnMoTWF0aC5hYnMoU2NlbmVQcm9wcy5ub3JtYWxpemVkTW91c2VQb3MueCkgLSBNYXRoLmFicyhTY2VuZVByb3BzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy54KSk7XG5cdFx0U2NlbmVQcm9wcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnMoU2NlbmVQcm9wcy5ub3JtYWxpemVkTW91c2VQb3MueSkgLSBNYXRoLmFicyhTY2VuZVByb3BzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy55KSk7XG5cdFx0U2NlbmVQcm9wcy5zcGVlZFggPSAoKDEgKyBTY2VuZVByb3BzLm1vdXNlUG9zRGlmZlgpIC8gZHQpO1xuXHRcdFNjZW5lUHJvcHMuc3BlZWRZID0gKCgxICsgU2NlbmVQcm9wcy5tb3VzZVBvc0RpZmZZKSAvIGR0KTtcblx0XHRTY2VuZVByb3BzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcyA9IFNjZW5lUHJvcHMubm9ybWFsaXplZE1vdXNlUG9zO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpIHtcblx0XHRjb25zdCBpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCBTY2VuZVByb3BzLmdyYXBoQ29udGFpbmVyLCBTY2VuZVByb3BzLnJheWNhc3Rlcixcblx0XHRcdFNjZW5lUHJvcHMubW91c2VWZWN0b3IsIFNjZW5lUHJvcHMuY2FtZXJhLCBTY2VuZVByb3BzLnJlbmRlcmVyKTtcblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoc2VsZWN0ZWQuaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7XG5cdFx0XHRcdHRoaXMuc3RhcnRSZWxhdGVkQXJ0aXN0U2VhcmNoKHNlbGVjdGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb21wb3NlU2NlbmUoYXJ0aXN0KSB7XG5cdFx0U2NlbmVQcm9wcy5tYWluQXJ0aXN0U3BoZXJlID0gU2NlbmVVdGlscy5jcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCk7XG5cdFx0U2NlbmVQcm9wcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBTY2VuZVByb3BzLm1haW5BcnRpc3RTcGhlcmUpO1xuXHRcdFNjZW5lVXRpbHMuYXBwZW5kT2JqZWN0c1RvU2NlbmUoU2NlbmVQcm9wcy5ncmFwaENvbnRhaW5lciwgU2NlbmVQcm9wcy5tYWluQXJ0aXN0U3BoZXJlLCBTY2VuZVByb3BzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzKTtcblx0fVxuXG5cdHN0YXJ0UmVsYXRlZEFydGlzdFNlYXJjaChzZWxlY3RlZFNwaGVyZSkge1xuXHRcdGNvbnN0IHRhcmdldCA9IHNlbGVjdGVkU3BoZXJlLnBvc2l0aW9uLmNsb25lKCk7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZShTY2VuZVByb3BzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIuYWRkSm9iKHtcblx0XHRcdGpvYlR5cGU6ICd0cmFuc2xhdGUnLFxuXHRcdFx0c3RhcnRQb2ludDogdGFyZ2V0LFxuXHRcdFx0ZW5kUG9pbnQ6IFNjZW5lUHJvcHMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRvYmplY3QzRDogc2VsZWN0ZWRTcGhlcmUsXG5cdFx0XHRkdXJhdGlvbjogMi4wLCAvLyBzZWNzXG5cdFx0XHRjYWxsYmFjazogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRNYWluQXJ0aXN0RGF0YShzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmoubmFtZSk7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZW5jb2RlVVJJQ29tcG9uZW50KHNlbGVjdGVkU3BoZXJlLmFydGlzdE9iai5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGNsZWFyR3JhcGgoKSB7XG5cdFx0Y29uc3Qgb2xkUGFyZW50ID0gU2NlbmVQcm9wcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmICghb2xkUGFyZW50KSB7XG5cdFx0XHRTY2VuZVByb3BzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShvbGRQYXJlbnQpO1xuXHRcdH1cblx0fVxufSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IFNlYXJjaENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zZWFyY2gtaW5wdXQuY29udGFpbmVyXCI7XG5pbXBvcnQgU3BvdGlmeVBsYXllckNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXJcIjtcbmltcG9ydCBTY2VuZUNvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9zY2VuZS5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RMaXN0Q29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lclwiO1xuaW1wb3J0IEFydGlzdEluZm9Db250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvYXJ0aXN0LWluZm8uY29udGFpbmVyXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHAtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxTZWFyY2hDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U2NlbmVDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8U3BvdGlmeVBsYXllckNvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RMaXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEFydGlzdEluZm9Db250YWluZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXJ0aXN0SW5mb0NvbXBvbmVudCh7YXJ0aXN0fSkge1xuXHRsZXQgYXJ0aXN0SW5mb01hcmt1cCA9ICcnO1xuXHRjb25zdCBnZW5yZXMgPSBhcnRpc3QuZ2VucmVzLm1hcCgoZ2VucmUpID0+IHtcblx0XHRyZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwiYXJ0aXN0LWdlbnJlXCIga2V5PXtnZW5yZX0+e2dlbnJlfTwvc3Bhbj5cblx0fSk7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRhcnRpc3RJbmZvTWFya3VwID0gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpbmZvLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8dWw+XG5cdFx0XHRcdFx0PGxpPlBvcHVsYXJpdHk6IHthcnRpc3QucG9wdWxhcml0eX08L2xpPlxuXHRcdFx0XHRcdDxsaT5HZW5yZXM6IHtnZW5yZXN9PC9saT5cblx0XHRcdFx0PC91bD5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXHRyZXR1cm4gKFxuXHRcdDxkaXY+e2FydGlzdEluZm9NYXJrdXB9PC9kaXY+XG5cdClcbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdExpc3RDb21wb25lbnQoe3Zpc2l0ZWRBcnRpc3RzfSkge1xuXHRsZXQgYXJ0aXN0cyA9IHZpc2l0ZWRBcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiB7XG5cdFx0bGV0IGhyZWYgPSAnLz9hcnRpc3Q9JyArIGFydGlzdC5uYW1lO1xuXHRcdGxldCBpbWdVcmwgPSBhcnRpc3QuaW1hZ2VzLmxlbmd0aCA/IGFydGlzdC5pbWFnZXNbYXJ0aXN0LmltYWdlcy5sZW5ndGggLSAxXS51cmwgOiAnJztcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcnRpc3RcIiBrZXk9e2FydGlzdC5pZH0+XG5cdFx0XHRcdDxhIGhyZWY9e2hyZWZ9IGlkPXthcnRpc3QuaWR9IGNsYXNzTmFtZT1cIm5hdi1hcnRpc3QtbGlua1wiPlxuXHRcdFx0XHRcdDxpbWcgY2xhc3NOYW1lPVwicGljdHVyZVwiIHNyYz17aW1nVXJsfSAvPlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIm5hbWVcIj57YXJ0aXN0Lm5hbWV9PC9zcGFuPlxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH0pO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0LW5hdmlnYXRpb25cIj5cblx0XHRcdHthcnRpc3RzfVxuXHRcdDwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuLi9jbGFzc2VzL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge1NwaGVyZXNTY2VuZX0gZnJvbSBcIi4uL2NsYXNzZXMvc3BoZXJlcy1zY2VuZS5jbGFzc1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuYXJ0aXN0ID0gc3RvcmUuZ2V0U3RhdGUoKS5hcnRpc3Q7XG5cdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZTtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRjb25zdCB7IGFydGlzdCB9ID0gdGhpcy5wcm9wcztcblx0XHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0XHR0aGlzLnNjZW5lLmNvbXBvc2VTY2VuZShhcnRpc3QpO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJzcGhlcmVzLXNjZW5lXCJcblx0XHRcdFx0IHJlZj17ZWxlbSA9PiB0aGlzLnNjZW5lRG9tID0gZWxlbX1cblx0XHRcdC8+XG5cdFx0KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5zY2VuZSA9IG5ldyBTcGhlcmVzU2NlbmUodGhpcy5zY2VuZURvbSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLCB0cnVlKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcywgZmFsc2UpO1xuXHR9XG5cblx0aGFuZGxlRXZlbnQoZXZlbnQpIHtcblx0XHR0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcblx0fVxuXG5cdGNsaWNrKGV2ZW50KSB7XG5cdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VDbGljayhldmVudClcblx0fVxuXG5cdG1vdXNlbW92ZShldmVudCkge1xuXHRcdGlmICh0aGlzLm1vdXNlRG93bikge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VEcmFnKGV2ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zY2VuZS5vblNjZW5lTW91c2VIb3ZlcihldmVudCk7XG5cdFx0fVxuXHR9XG5cblx0bW91c2Vkb3duKCkge1xuXHRcdHRoaXMuc2NlbmUubW91c2VJc0Rvd24gPSB0cnVlO1xuXHR9XG5cblx0bW91c2V1cCgpIHtcblx0XHR0aGlzLnNjZW5lLm1vdXNlSXNEb3duID0gZmFsc2U7XG5cdH1cblxuXHRtb3VzZXdoZWVsKGV2ZW50KSB7XG5cdFx0c3dpdGNoIChTY2VuZVV0aWxzLnNpZ24oZXZlbnQud2hlZWxEZWx0YVkpKSB7XG5cdFx0XHRjYXNlIC0xOlxuXHRcdFx0XHR0aGlzLnNjZW5lLnpvb20oJ291dCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdpbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5zY2VuZS5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0dGhpcy5zY2VuZS5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHR9XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWFyY2hJbnB1dENvbXBvbmVudCh7c2VhcmNoVGVybSwgaGFuZGxlU2VhcmNoLCBoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VhcmNoLWZvcm0tY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJhcnRpc3Qtc2VhcmNoXCIgb25TdWJtaXQ9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNlYXJjaC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBKaW1pIEhlbmRyaXhcIiB2YWx1ZT17c2VhcmNoVGVybX0gb25DaGFuZ2U9e2hhbmRsZVNlYXJjaFRlcm1VcGRhdGV9IC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgb25DbGljaz17KGV2dCkgPT4gaGFuZGxlU2VhcmNoKGV2dCwgc2VhcmNoVGVybSl9PkdvPC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBTcG90aWZ5UGxheWVyQ29tcG9uZW50KHthcnRpc3R9KSB7XG5cdGNvbnN0IGVtYmVkVXJsID0gJ2h0dHBzOi8vb3Blbi5zcG90aWZ5LmNvbS9lbWJlZC9hcnRpc3QvJztcblx0Y29uc3QgYXJ0aXN0RW1iZWRVcmwgPSBgJHtlbWJlZFVybH0ke2FydGlzdC5pZH1gO1xuXHRsZXQgaUZyYW1lTWFya3VwID0gJyc7XG5cdGlmIChhcnRpc3QuaWQpIHtcblx0XHRpRnJhbWVNYXJrdXAgPSAoXG5cdFx0XHQ8ZGl2IGlkPVwic3BvdGlmeS1wbGF5ZXJcIj5cblx0XHRcdFx0PGlmcmFtZSBzcmM9e2FydGlzdEVtYmVkVXJsfSB3aWR0aD1cIjMwMFwiIGhlaWdodD1cIjgwXCIgLz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhbGJ1bS1uYXZcIj5cblx0XHRcdFx0XHQ8YSBocmVmPVwiI1wiPlByZXY8L2E+XG5cdFx0XHRcdFx0PGEgaHJlZj1cIiNcIj5OZXh0PC9hPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdClcblx0fVxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPVwic3BvdGlmeS1wbGF5ZXItY29udGFpbmVyXCI+XG5cdFx0XHR7aUZyYW1lTWFya3VwfVxuXHRcdDwvZGl2PlxuXHQpXG59IiwiZXhwb3J0IGNvbnN0IENvbG91cnMgPSB7XG5cdGJhY2tncm91bmQ6IDB4MDAzMzY2LFxuXHRyZWxhdGVkQXJ0aXN0OiAweGNjMzMwMCxcblx0cmVsYXRlZEFydGlzdEhvdmVyOiAweDk5Y2M5OSxcblx0cmVsYXRlZExpbmVKb2luOiAweGZmZmZjYyxcblx0bWFpbkFydGlzdDogMHhmZmNjMDAsXG5cdHRleHRPdXRlcjogMHhmZmZmY2MsXG5cdHRleHRJbm5lcjogMHgwMDAwMzNcbn07IiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0SW5mb0NvbXBvbmVudH0gZnJvbSAnLi4vY29tcG9uZW50cy9hcnRpc3QtaW5mby5jb21wb25lbnQnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBBcnRpc3RJbmZvQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdEluZm9Db21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RJbmZvQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7QXJ0aXN0TGlzdENvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvYXJ0aXN0LWxpc3QuY29tcG9uZW50XCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHZpc2l0ZWRBcnRpc3RzOiBzdGF0ZS52aXNpdGVkQXJ0aXN0c1xuXHR9XG59O1xuXG5jb25zdCBBcnRpc3RMaXN0Q29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKEFydGlzdExpc3RDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RMaXN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U2NlbmVDb21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgU2NlbmVDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU2NlbmVDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZUNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBTZWFyY2hJbnB1dENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvc2VhcmNoLWlucHV0LmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHsgTXVzaWNEYXRhU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL211c2ljLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyB1cGRhdGVTZWFyY2hUZXJtIH0gZnJvbSAnLi4vc3RhdGUvYWN0aW9ucyc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHNlYXJjaFRlcm06IHN0YXRlLnNlYXJjaFRlcm1cblx0fVxufTtcblxuY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gKGRpc3BhdGNoKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFuZGxlU2VhcmNoOiAoZXZ0LCBzZWFyY2hUZXJtKSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0TWFpbkFydGlzdERhdGEoc2VhcmNoVGVybSk7XG5cdFx0fSxcblx0XHRoYW5kbGVTZWFyY2hUZXJtVXBkYXRlOiAoZXZ0KSA9PiB7XG5cdFx0XHRkaXNwYXRjaCh1cGRhdGVTZWFyY2hUZXJtKGV2dC50YXJnZXQudmFsdWUpKTtcblx0XHR9XG5cdH1cbn07XG5cbmNvbnN0IFNlYXJjaENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKFNlYXJjaElucHV0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7U3BvdGlmeVBsYXllckNvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50XCI7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcykoU3BvdGlmeVBsYXllckNvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNwb3RpZnlQbGF5ZXJDb250YWluZXI7XG4iLCJpbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQge3NlYXJjaERvbmV9IGZyb20gXCIuLi9zdGF0ZS9hY3Rpb25zXCI7XG5cbmV4cG9ydCBjbGFzcyBNdXNpY0RhdGFTZXJ2aWNlIHtcblx0c3RhdGljIGdldE1haW5BcnRpc3REYXRhKGFydGlzdE5hbWUpIHtcblx0XHRsZXQgc2VhcmNoVVJMID0gJy9hcGkvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYXJ0aXN0TmFtZSk7XG5cdFx0cmV0dXJuIHdpbmRvdy5mZXRjaChzZWFyY2hVUkwsIHtcblx0XHRcdGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCJcblx0XHR9KVxuXHRcdC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcblx0XHQudGhlbigoanNvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHN0b3JlLmRpc3BhdGNoKHNlYXJjaERvbmUoanNvbikpO1xuXHRcdH0pO1xuXHR9XG59IiwiZXhwb3J0IGNvbnN0IEFSVElTVF9TRUFSQ0hfRE9ORSA9ICdBUlRJU1RfU0VBUkNIX0RPTkUnO1xuZXhwb3J0IGNvbnN0IFNFQVJDSF9URVJNX1VQREFURSA9ICdTRUFSQ0hfVEVSTV9VUERBVEUnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoRG9uZShkYXRhKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogQVJUSVNUX1NFQVJDSF9ET05FLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VhcmNoVGVybShzZWFyY2hUZXJtKSB7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogU0VBUkNIX1RFUk1fVVBEQVRFLFxuXHRcdHNlYXJjaFRlcm06IHNlYXJjaFRlcm1cblx0fVxufSIsImltcG9ydCB7U0VBUkNIX1RFUk1fVVBEQVRFLCBBUlRJU1RfU0VBUkNIX0RPTkV9IGZyb20gJy4uL2FjdGlvbnMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcblx0YXJ0aXN0OiB7XG5cdFx0aWQ6ICcnLFxuXHRcdG5hbWU6ICcnLFxuXHRcdGltZ1VybDogJycsXG5cdFx0Z2VucmVzOiBbXSxcblx0XHRwb3B1bGFyaXR5OiAwLFxuXHRcdGltYWdlczogW11cblx0fSxcblx0c2VhcmNoVGVybTogJycsXG5cdHZpc2l0ZWRBcnRpc3RzOiBbXVxufTtcblxuY29uc3QgYXJ0aXN0U2VhcmNoID0gKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pID0+IHtcblx0c3dpdGNoIChhY3Rpb24udHlwZSkge1xuXHRcdGNhc2UgU0VBUkNIX1RFUk1fVVBEQVRFOlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4uc3RhdGUsXG5cdFx0XHRcdHNlYXJjaFRlcm06IGFjdGlvbi5zZWFyY2hUZXJtLFxuXHRcdFx0fTtcblx0XHRjYXNlIEFSVElTVF9TRUFSQ0hfRE9ORTpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRhcnRpc3Q6IGFjdGlvbi5kYXRhLFxuXHRcdFx0XHR2aXNpdGVkQXJ0aXN0czogW1xuXHRcdFx0XHRcdC4uLnN0YXRlLnZpc2l0ZWRBcnRpc3RzLFxuXHRcdFx0XHRcdGFjdGlvbi5kYXRhXG5cdFx0XHRcdF1cblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYXJ0aXN0U2VhcmNoOyIsImltcG9ydCB7Y3JlYXRlU3RvcmV9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBhcnRpc3RTZWFyY2ggZnJvbSBcIi4vcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaFwiO1xuXG5leHBvcnQgbGV0IHN0b3JlID0gY3JlYXRlU3RvcmUoXG5cdGFydGlzdFNlYXJjaCxcblx0d2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18gJiYgd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18oKVxuKTtcblxuXG4iXX0=
