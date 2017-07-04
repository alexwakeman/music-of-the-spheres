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

},{"./components/app.component.jsx":5,"./state/store":20,"react":undefined,"react-dom":undefined,"react-redux":undefined}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MotionLab = function () {
	function MotionLab() {
		_classCallCheck(this, MotionLab);
	}

	_createClass(MotionLab, [{
		key: 'init',
		value: function init(renderer, scene, camera, defaultOp, spheresSceneInstance) {
			this.renderer = renderer;
			this.scene = scene;
			this.camera = camera;
			this.spheresSceneInstance = spheresSceneInstance;
			this.t1 = 0.0; // previous frame tick
			this.t2 = 0.0; // current frame tick
			this.job = {
				jobType: 'default'
			};
			this.animate();
		}
	}, {
		key: 'animate',
		value: function animate() {
			this.t1 = this.t2;
			this.t2 = performance.now();
			switch (this.job.jobType) {
				case 'translate':
					// requires a path and lookAt + object3D
					this.appendTranslateJob(job);
					break;
				case 'default':
					this.spheresSceneInstance.updateRotation();
			}
			this.renderer.render(this.scene, this.camera);
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
		key: 'appendTranslateJob',
		value: function appendTranslateJob(job) {
			job.startTime = this.t2;
			job.t = 0.0;
			job.currentTime = 0.0;
			job.path = new _three.Spline([job.startPoint, job.endPoint]);
			this.job = job;
			this.job['translateTransitionObject']();
		}
	}]);

	return MotionLab;
}();

exports.default = MotionLab;

},{"three":undefined}],3:[function(require,module,exports){
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
				relatedArtistSphere.distance = 200; // will be union statistic
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

},{"../config/colours":11,"three":undefined}],4:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpheresScene = exports.SpheresScene = function () {
	function SpheresScene(container) {
		_classCallCheck(this, SpheresScene);

		var artistQuery = decodeURIComponent(window.location.hash.replace('#', ''));
		_sceneUtils.SceneUtils.init();
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000);
		this.graphContainer = new THREE.Object3D();
		this.motionLab = new _motionLab2.default();
		this.cameraRotation = new THREE.Euler(0, 0, 0);
		this.cameraLookAt = new THREE.Vector3(1, 1, 1);
		this.cameraDistance = 3500;

		this.t1 = 0.0; // old time
		this.t2 = 0.0; // now time
		this.speedX = 0.005;
		this.speedY = 0.005;
		this.mousePosDiffX = 0.0;
		this.mousePosDiffY = 0.0;
		this.mousePosXIncreased = false;
		this.mousePosYIncreased = false;
		this.raycaster = new THREE.Raycaster();
		this.mouseVector = new THREE.Vector2();

		this.relatedArtistSpheres = [];

		// attach to dom
		this.container = container;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.domElement.id = 'renderer';
		this.container.appendChild(this.renderer.domElement);

		this.graphContainer.position.set(1, 5, 0);
		this.scene.add(this.graphContainer);
		this.scene.add(this.camera);
		this.camera.position.set(0, 250, this.cameraDistance);
		this.camera.lookAt(this.scene.position);

		_sceneUtils.SceneUtils.lighting(this.scene);
		this.motionLab.init(this.renderer, this.scene, this.camera, this.updateRotation, this);

		// check for query string
		if (artistQuery) {
			_musicData.MusicDataService.getMainArtistData(artistQuery);
		}
	}

	_createClass(SpheresScene, [{
		key: "zoom",
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
	}, {
		key: "onSceneMouseHover",
		value: function onSceneMouseHover(event) {
			var selected = void 0;
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(event, this.graphContainer, this.raycaster, this.mouseVector, this.camera, this.renderer);
			this.mouseIsOverRelated = false;
			this.graphContainer.traverse(function (obj) {
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
			this.normalizedMousePos = new THREE.Vector2(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
			this.mousePosXIncreased = this.normalizedMousePos.x > this.oldNormalizedMousePos.x;
			this.mousePosYIncreased = this.normalizedMousePos.y > this.oldNormalizedMousePos.y;
			this.mousePosDiffX = Math.abs(Math.abs(this.normalizedMousePos.x) - Math.abs(this.oldNormalizedMousePos.x));
			this.mousePosDiffY = Math.abs(Math.abs(this.normalizedMousePos.y) - Math.abs(this.oldNormalizedMousePos.y));
			this.speedX = (1 + this.mousePosDiffX) / dt;
			this.speedY = (1 + this.mousePosDiffY) / dt;
			this.oldNormalizedMousePos = this.normalizedMousePos;
		}
	}, {
		key: "onSceneMouseClick",
		value: function onSceneMouseClick(event) {
			var intersects = _sceneUtils.SceneUtils.getIntersectsFromMousePos(event, this.graphContainer, this.raycaster, this.mouseVector, this.camera, this.renderer);
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
			this.mainArtistSphere = _sceneUtils.SceneUtils.createMainArtistSphere(artist);
			this.relatedArtistSpheres = _sceneUtils.SceneUtils.createRelatedSpheres(artist, this.mainArtistSphere);
			_sceneUtils.SceneUtils.appendObjectsToScene(this.graphContainer, this.mainArtistSphere, this.relatedArtistSpheres);
		}
	}, {
		key: "startRelatedArtistSearch",
		value: function startRelatedArtistSearch(selectedSphere) {
			var _this = this;

			var target = selectedSphere.position.clone();
			this.clearGraph();
			_sceneUtils.SceneUtils.appendObjectsToScene(this.graphContainer, selectedSphere);
			this.motionLab.addJob({
				jobType: 'translate',
				startPoint: target,
				endPoint: this.camera.position.clone(),
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
			var oldParent = this.graphContainer.getObjectByName('parent');
			if (!oldParent) {
				this.graphContainer.remove(oldParent);
			}
		}

		/**
   * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
   * Rotation of camera is *inverse* of mouse movement direction
   */

	}, {
		key: "updateRotation",
		value: function updateRotation() {
			var _this2 = this;

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
			camQuaternionUpdate = _sceneUtils.SceneUtils.renormalizeQuaternion(this.camera);
			camQuaternionUpdate.setFromEuler(this.cameraRotation);

			this.camera.position.set(camQuaternionUpdate.x * this.cameraDistance, camQuaternionUpdate.y * this.cameraDistance, camQuaternionUpdate.z * this.cameraDistance);
			this.camera.lookAt(this.cameraLookAt);
			// update rotation of text attached objects, to force them to look at camera
			// this makes them readable
			this.graphContainer.traverse(function (obj) {
				if (obj.hasOwnProperty('isText')) {
					obj.lookAt(_this2.graphContainer.worldToLocal(_this2.camera.position));
				}
			});
			this.reduceSpeed(0.0005);
		}
	}, {
		key: "reduceSpeed",
		value: function reduceSpeed(amount) {
			if (this.speedX > 0.005) {
				this.speedX -= amount;
			}

			if (this.speedY > 0.005) {
				this.speedY -= amount;
			}
		}
	}]);

	return SpheresScene;
}();

},{"../config/colours":11,"../services/music-data.service":17,"./motion-lab.class":2,"./scene-utils.class":3,"three":undefined}],5:[function(require,module,exports){
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

},{"../containers/artist-info.container":12,"../containers/artist-list.container":13,"../containers/scene.container":14,"../containers/search-input.container":15,"../containers/spotify-player.container":16,"react":undefined}],6:[function(require,module,exports){
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

},{"../state/store":20,"react":undefined}],7:[function(require,module,exports){
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

},{"../state/store":20,"react":undefined}],8:[function(require,module,exports){
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

},{"../classes/scene-utils.class":3,"../classes/spheres-scene.class":4,"../state/store":20,"react":undefined}],9:[function(require,module,exports){
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

},{"react":undefined}],10:[function(require,module,exports){
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

},{"react":undefined}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"../components/artist-info.component":6,"react-redux":undefined}],13:[function(require,module,exports){
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

},{"../components/artist-list.component":7,"react-redux":undefined}],14:[function(require,module,exports){
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

},{"../components/scene.component":8,"react-redux":undefined}],15:[function(require,module,exports){
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

},{"../components/search-input.component.jsx":9,"../services/music-data.service":17,"../state/actions":18,"react-redux":undefined}],16:[function(require,module,exports){
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

},{"../components/spotify-player.component":10,"react-redux":undefined}],17:[function(require,module,exports){
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

},{"../state/actions":18,"../state/store":20}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"../actions":18}],20:[function(require,module,exports){
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

},{"./reducers/artist-search":19,"redux":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXIuanMiLCJzcmMvanMvc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlLmpzIiwic3JjL2pzL3N0YXRlL2FjdGlvbnMuanMiLCJzcmMvanMvc3RhdGUvcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaC5qcyIsInNyYy9qcy9zdGF0ZS9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7O0lBQVksSzs7QUFDWjs7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aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7QXBwQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvYXBwLmNvbXBvbmVudC5qc3gnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi9zdGF0ZS9zdG9yZSc7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuLy8gY2FuY2VsIHJpZ2h0IGNsaWNrXG5kb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudCkgPT4gZXZlbnQuYnV0dG9uICE9PSAyO1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuXHRcdDxBcHBDb21wb25lbnQgLz5cblx0PC9Qcm92aWRlcj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jylcbik7IiwiaW1wb3J0IHtTcGxpbmV9IGZyb20gXCJ0aHJlZVwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW90aW9uTGFiIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuXG5cdGluaXQocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEsIGRlZmF1bHRPcCwgc3BoZXJlc1NjZW5lSW5zdGFuY2UpIHtcblx0XHR0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG5cdFx0dGhpcy5zY2VuZSA9IHNjZW5lO1xuXHRcdHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuXHRcdHRoaXMuc3BoZXJlc1NjZW5lSW5zdGFuY2UgPSBzcGhlcmVzU2NlbmVJbnN0YW5jZTtcblx0XHR0aGlzLnQxID0gMC4wOyAvLyBwcmV2aW91cyBmcmFtZSB0aWNrXG5cdFx0dGhpcy50MiA9IDAuMDsgLy8gY3VycmVudCBmcmFtZSB0aWNrXG5cdFx0dGhpcy5qb2IgPSB7XG5cdFx0XHRqb2JUeXBlOiAnZGVmYXVsdCdcblx0XHR9O1xuXHRcdHRoaXMuYW5pbWF0ZSgpO1xuXHR9XG5cblx0YW5pbWF0ZSgpIHtcblx0XHR0aGlzLnQxID0gdGhpcy50Mjtcblx0XHR0aGlzLnQyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi5qb2JUeXBlKSB7XG5cdFx0XHRjYXNlICd0cmFuc2xhdGUnOi8vIHJlcXVpcmVzIGEgcGF0aCBhbmQgbG9va0F0ICsgb2JqZWN0M0Rcblx0XHRcdFx0dGhpcy5hcHBlbmRUcmFuc2xhdGVKb2Ioam9iKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdkZWZhdWx0Jzpcblx0XHRcdFx0dGhpcy5zcGhlcmVzU2NlbmVJbnN0YW5jZS51cGRhdGVSb3RhdGlvbigpO1xuXHRcdH1cblx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG5cdH1cblxuXHRhZGRKb2Ioam9iKSB7XG5cdFx0dGhpcy5qb2IgPSBqb2I7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi5qb2JUeXBlKSB7XG5cdFx0XHRjYXNlICd0cmFuc2xhdGUnOi8vIHJlcXVpcmVzIGEgcGF0aCBhbmQgbG9va0F0ICsgb2JqZWN0M0Rcblx0XHRcdFx0dGhpcy5hcHBlbmRUcmFuc2xhdGVKb2Ioam9iKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCgpIHtcblx0XHRjb25zdCBpc0ZpbmlzaGVkID0gdGhpcy5qb2IuY3VycmVudFRpbWUgPj0gdGhpcy5qb2IuZHVyYXRpb247XG5cdFx0aWYgKCFpc0ZpbmlzaGVkKSB7XG5cdFx0XHR0aGlzLmZvbGxvd1BhdGgoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmVuZEFuaW1hdGlvbigpO1xuXHRcdH1cblx0fVxuXG5cdGZvbGxvd1BhdGgoKSB7XG5cdFx0Y29uc3QgcCA9IHRoaXMuam9iLnBhdGguZ2V0UG9pbnQodGhpcy5qb2IuY3VycmVudFRpbWUpO1xuXHRcdHRoaXMuam9iLm9iamVjdDNELnBvc2l0aW9uLmNvcHkocCk7XG5cdFx0dGhpcy5qb2IuY3VycmVudFRpbWUgKz0gMC4wMTtcblx0fVxuXG5cdGVuZEFuaW1hdGlvbigpIHtcblx0XHR0aGlzLmpvYi5qb2JUeXBlID0gJ2RlZmF1bHQnO1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrICYmIHRoaXMuam9iLmNhbGxiYWNrKCk7XG5cdH1cblxuXHRhcHBlbmRUcmFuc2xhdGVKb2Ioam9iKSB7XG5cdFx0am9iLnN0YXJ0VGltZSA9IHRoaXMudDI7XG5cdFx0am9iLnQgPSAwLjA7XG5cdFx0am9iLmN1cnJlbnRUaW1lID0gMC4wO1xuXHRcdGpvYi5wYXRoID0gbmV3IFNwbGluZShbXG5cdFx0XHRqb2Iuc3RhcnRQb2ludCxcblx0XHRcdGpvYi5lbmRQb2ludFxuXHRcdF0pO1xuICAgICAgICB0aGlzLmpvYiA9IGpvYjtcblx0XHR0aGlzLmpvYlsndHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCddKCk7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5sZXQgSEVMVkVUSUtFUjtcblxuY2xhc3MgU2NlbmVVdGlscyB7XG5cdHN0YXRpYyBpbml0KCkge1xuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0bG9hZGVyLmxvYWQoJy4vanMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nLCAoZm9udCkgPT4gSEVMVkVUSUtFUiA9IGZvbnQpO1xuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYSAtIG1pblxuXHQgKiBAcGFyYW0gYiAtIG1heFxuXHQgKiBAcGFyYW0gYyAtIHZhbHVlIHRvIGNsYW1wXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgY2xhbXAoYSwgYiwgYykge1xuXHRcdHJldHVybiBNYXRoLm1heChiLCBNYXRoLm1pbihjLCBhKSk7XG5cdH1cblxuXHQvKipcblx0ICogR2l2ZW4gcG9zaXRpdmUgeCByZXR1cm4gMSwgbmVnYXRpdmUgeCByZXR1cm4gLTEsIG9yIDAgb3RoZXJ3aXNlXG5cdCAqIEBwYXJhbSB4XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgc2lnbih4KSB7XG5cdFx0cmV0dXJuIHggPiAwID8gMSA6IHggPCAwID8gLTEgOiAwO1xuXHR9O1xuXG5cdHN0YXRpYyByZW5vcm1hbGl6ZVF1YXRlcm5pb24ob2JqZWN0KSB7XG5cdFx0bGV0IGNsb25lID0gb2JqZWN0LmNsb25lKCk7XG5cdFx0bGV0IHEgPSBjbG9uZS5xdWF0ZXJuaW9uO1xuXHRcdGxldCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoTWF0aC5wb3cocS53LCAyKSArIE1hdGgucG93KHEueCwgMikgKyBNYXRoLnBvdyhxLnksIDIpICsgTWF0aC5wb3cocS56LCAyKSk7XG5cdFx0cS53IC89IG1hZ25pdHVkZTtcblx0XHRxLnggLz0gbWFnbml0dWRlO1xuXHRcdHEueSAvPSBtYWduaXR1ZGU7XG5cdFx0cS56IC89IG1hZ25pdHVkZTtcblx0XHRyZXR1cm4gcTtcblx0fVxuXG5cdHN0YXRpYyBnZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCBncmFwaCwgcmF5Y2FzdGVyLCBtb3VzZVZlY3RvciwgY2FtZXJhLCByZW5kZXJlcikge1xuXHRcdG1vdXNlVmVjdG9yLnggPSAoZXZlbnQuY2xpZW50WCAvIHJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGgpICogMiAtIDE7XG5cdFx0bW91c2VWZWN0b3IueSA9IC0gKGV2ZW50LmNsaWVudFkgLyByZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMTtcblx0XHRyYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZVZlY3RvciwgY2FtZXJhKTtcblx0XHRyZXR1cm4gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoZ3JhcGguY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KSB7XG5cdFx0bGV0IHJhZGl1cyA9IDIwMDtcblx0XHRsZXQgc2l6ZSA9IDIwMDtcblx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNDAsIDM1LCAzNSk7XG5cdFx0bGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMubWFpbkFydGlzdH0pKTtcblx0XHRzcGhlcmUuYXJ0aXN0T2JqID0gYXJ0aXN0O1xuXHRcdHNwaGVyZS5yYWRpdXMgPSByYWRpdXM7XG5cdFx0c3BoZXJlLmlzTWFpbkFydGlzdFNwaGVyZSA9IHRydWU7XG5cdFx0c3BoZXJlLmlzU3BoZXJlID0gdHJ1ZTtcblx0XHR0aGlzLmFkZFRleHQoYXJ0aXN0Lm5hbWUsIDM0LCBzcGhlcmUpO1xuXHRcdHJldHVybiBzcGhlcmU7XG5cdH1cblxuXHQvLyBUT0RPOiBnZXQgc3RhdHMgZm9yIHJlbGF0ZWRuZXNzIChnZW5yZXMgdW5pb24gbWVhc3VyZSkgLSBkaXN0YW5jZSBmcm9tIG1haW4gYXJ0aXN0XG5cdC8vIFRPRE86IGNsZWFuIHVwIHRoaXMgY29kZSwgcmVtb3ZlIHRoZSBoYXJkIGNvZGVkIG51bWJlcnNcblx0c3RhdGljIGNyZWF0ZVJlbGF0ZWRTcGhlcmVzKGFydGlzdCwgbWFpbkFydGlzdFNwaGVyZSkge1xuXHRcdGxldCByZWxhdGVkQXJ0aXN0c1NwaGVyZUFycmF5ID0gW107XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RPYmo7XG5cdFx0bGV0IHNwaGVyZUZhY2VJbmRleCA9IDA7IC8vIHJlZmVyZW5jZXMgYSB3ZWxsIHNwYWNlZCBmYWNlIG9mIHRoZSBtYWluIGFydGlzdCBzcGhlcmVcblx0XHRsZXQgZmFjZXNDb3VudCA9IG1haW5BcnRpc3RTcGhlcmUuZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMTtcblx0XHRsZXQgc3RlcCA9IE1hdGgucm91bmQoZmFjZXNDb3VudCAvIDEwIC0gMSk7XG5cblx0XHRmb3IgKGxldCBpID0gMCwgbGVuID0gMTA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdE9iaiA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IDIwMDsgLy9yZWxhdGVkQXJ0aXN0T2JqLmZvbGxvd2Vycy50b3RhbDsgLy8gc2l6ZSBvZiB0aGlzIHNwaGVyZVxuXHRcdFx0bGV0IHNpemUgPSByYWRpdXMgKiAyO1xuXHRcdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDQwLCAzNSwgMzUpO1xuXHRcdFx0bGV0IHJlbGF0ZWRBcnRpc3RTcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRBcnRpc3R9KSk7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0T2JqLnVuaXRMZW5ndGggPSAxMDA7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0T2JqLnJhbmdlID0gNTA7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmFydGlzdE9iaiA9IHJlbGF0ZWRBcnRpc3RPYmo7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNSZWxhdGVkQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS55ZWFyc1NoYXJlZCA9IHJlbGF0ZWRBcnRpc3RPYmoueWVhcnNTaGFyZWQ7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLmRpc3RhbmNlID0gMjAwOyAvLyB3aWxsIGJlIHVuaW9uIHN0YXRpc3RpY1xuXHRcdFx0c3BoZXJlRmFjZUluZGV4ICs9IHN0ZXA7XG5cdFx0XHRTY2VuZVV0aWxzLnBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpO1xuXHRcdFx0U2NlbmVVdGlscy5qb2luUmVsYXRlZEFydGlzdFNwaGVyZVRvTWFpbihtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdFNjZW5lVXRpbHMuYWRkVGV4dChyZWxhdGVkQXJ0aXN0T2JqLm5hbWUsIDIwLCByZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkucHVzaChyZWxhdGVkQXJ0aXN0U3BoZXJlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXk7XG5cdH1cblxuXHRzdGF0aWMgYXBwZW5kT2JqZWN0c1RvU2NlbmUoZ3JhcGhDb250YWluZXIsIHNwaGVyZSwgc3BoZXJlQXJyYXkpIHtcblx0XHRjb25zdCBwYXJlbnQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblx0XHRwYXJlbnQubmFtZSA9ICdwYXJlbnQnO1xuXHRcdHBhcmVudC5hZGQoc3BoZXJlKTtcblx0XHRpZiAoc3BoZXJlQXJyYXkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BoZXJlQXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0cGFyZW50LmFkZChzcGhlcmVBcnJheVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGdyYXBoQ29udGFpbmVyLmFkZChwYXJlbnQpO1xuXHR9XG5cblx0c3RhdGljIGpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRTcGhlcmUpIHtcblx0XHRsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnJlbGF0ZWRMaW5lSm9pbn0pO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuXHRcdGxldCBsaW5lO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCkpO1xuXHRcdGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gocmVsYXRlZFNwaGVyZS5wb3NpdGlvbi5jbG9uZSgpKTtcblx0XHRsaW5lID0gbmV3IFRIUkVFLkxpbmUoZ2VvbWV0cnksIG1hdGVyaWFsKTtcblx0XHRtYWluQXJ0aXN0U3BoZXJlLmFkZChsaW5lKTtcblx0fVxuXG5cdHN0YXRpYyBwb3NpdGlvblJlbGF0ZWRBcnRpc3QobWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSwgc3BoZXJlRmFjZUluZGV4KSB7XG5cdFx0bGV0IG1haW5BcnRpc3RTcGhlcmVGYWNlID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlc1tNYXRoLnJvdW5kKHNwaGVyZUZhY2VJbmRleCldLm5vcm1hbC5jbG9uZSgpO1xuXHRcdHJlbGF0ZWRTcGhlcmUucG9zaXRpb25cblx0XHRcdC5jb3B5KG1haW5BcnRpc3RTcGhlcmVGYWNlLm11bHRpcGx5KG5ldyBUSFJFRS5WZWN0b3IzKFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZSxcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIGFkZFRleHQobGFiZWwsIHNpemUsIHNwaGVyZSkge1xuXHRcdGxldCB0ZXh0TWVzaDtcblx0XHRsZXQgbWF0ZXJpYWxGcm9udCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dE91dGVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsU2lkZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMudGV4dElubmVyfSk7XG5cdFx0bGV0IG1hdGVyaWFsQXJyYXkgPSBbbWF0ZXJpYWxGcm9udCwgbWF0ZXJpYWxTaWRlXTtcblx0XHRsZXQgdGV4dEdlb20gPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGxhYmVsLCB7XG5cdFx0XHRmb250OiBIRUxWRVRJS0VSLFxuXHRcdFx0c2l6ZTogODAsXG5cdFx0XHRoZWlnaHQ6IDUsXG5cdFx0XHRjdXJ2ZVNlZ21lbnRzOiAxMixcblx0XHRcdGJldmVsRW5hYmxlZDogdHJ1ZSxcblx0XHRcdGJldmVsVGhpY2tuZXNzOiAxMCxcblx0XHRcdGJldmVsU2l6ZTogOCxcblx0XHRcdGJldmVsU2VnbWVudHM6IDVcblx0XHR9KTtcblx0XHR0ZXh0R2VvbS5jb21wdXRlQm91bmRpbmdCb3goKTtcblx0XHR0ZXh0R2VvbS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuXHRcdHRleHRNZXNoID0gbmV3IFRIUkVFLk1lc2godGV4dEdlb20sIG1hdGVyaWFsQXJyYXkpO1xuXHRcdHRleHRNZXNoLnBvc2l0aW9uLnNldCgtc2l6ZSwgc3BoZXJlLnJhZGl1cyAqIDIgKyAyMCwgMCk7IC8vIHVuZGVybmVhdGggdGhlIHNwaGVyZVxuXHRcdHRleHRNZXNoLmlzVGV4dCA9IHRydWU7XG5cdFx0c3BoZXJlLmFkZCh0ZXh0TWVzaCk7XG5cdH1cblxuXHRzdGF0aWMgbGlnaHRpbmcoc2NlbmUpIHtcblx0XHRsZXQgZGlyTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMC4xMjUpO1xuXHRcdGRpckxpZ2h0LnBvc2l0aW9uLnNldCgwLCAwLCAxKS5ub3JtYWxpemUoKTtcblx0XHRzY2VuZS5hZGQoIGRpckxpZ2h0ICk7XG5cdFx0bGV0IHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMS41KTtcblx0XHRwb2ludExpZ2h0LnBvc2l0aW9uLnNldCgwLCAxMDAsIDkwKTtcblx0XHRwb2ludExpZ2h0LmNvbG9yLnNldEhleChDb2xvdXJzLnRleHRPdXRlcik7XG5cdFx0c2NlbmUuYWRkKHBvaW50TGlnaHQpO1xuXHR9XG59XG5cbmV4cG9ydCB7IFNjZW5lVXRpbHMgfVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQge1NjZW5lVXRpbHN9IGZyb20gXCIuL3NjZW5lLXV0aWxzLmNsYXNzXCI7XG5pbXBvcnQge0NvbG91cnN9IGZyb20gXCIuLi9jb25maWcvY29sb3Vyc1wiO1xuaW1wb3J0IE1vdGlvbkxhYiBmcm9tIFwiLi9tb3Rpb24tbGFiLmNsYXNzXCI7XG5pbXBvcnQge011c2ljRGF0YVNlcnZpY2V9IGZyb20gXCIuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2VcIjtcblxuZXhwb3J0IGNsYXNzIFNwaGVyZXNTY2VuZSB7XG5cdG5vcm1hbGl6ZWRNb3VzZVBvcztcblx0b2xkTm9ybWFsaXplZE1vdXNlUG9zO1xuXG5cdGFydGlzdDtcblx0bWFpbkFydGlzdFNwaGVyZTtcblxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcblx0XHRjb25zdCBhcnRpc3RRdWVyeSA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpKTtcblx0XHRTY2VuZVV0aWxzLmluaXQoKTtcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWV9KTtcblx0XHR0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cdFx0dGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCA1MDAsIDE1MDAwMCk7XG5cdFx0dGhpcy5ncmFwaENvbnRhaW5lciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXHRcdHRoaXMubW90aW9uTGFiID0gbmV3IE1vdGlvbkxhYigpO1xuXHRcdHRoaXMuY2FtZXJhUm90YXRpb24gPSBuZXcgVEhSRUUuRXVsZXIoMCwgMCwgMCk7XG5cdFx0dGhpcy5jYW1lcmFMb29rQXQgPSBuZXcgVEhSRUUuVmVjdG9yMygxLCAxLCAxKTtcblx0XHR0aGlzLmNhbWVyYURpc3RhbmNlID0gMzUwMDtcblxuXHRcdHRoaXMudDEgPSAwLjA7IC8vIG9sZCB0aW1lXG5cdFx0dGhpcy50MiA9IDAuMDsgLy8gbm93IHRpbWVcblx0XHR0aGlzLnNwZWVkWCA9IDAuMDA1O1xuXHRcdHRoaXMuc3BlZWRZID0gMC4wMDU7XG5cdFx0dGhpcy5tb3VzZVBvc0RpZmZYID0gMC4wO1xuXHRcdHRoaXMubW91c2VQb3NEaWZmWSA9IDAuMDtcblx0XHR0aGlzLm1vdXNlUG9zWEluY3JlYXNlZCA9IGZhbHNlO1xuXHRcdHRoaXMubW91c2VQb3NZSW5jcmVhc2VkID0gZmFsc2U7XG5cdFx0dGhpcy5yYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG5cdFx0dGhpcy5tb3VzZVZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0XHR0aGlzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzID0gW107XG5cblx0XHQvLyBhdHRhY2ggdG8gZG9tXG5cdFx0dGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdFx0dGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHRcdHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudC5pZCA9ICdyZW5kZXJlcic7XG5cdFx0dGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcblxuXHRcdHRoaXMuZ3JhcGhDb250YWluZXIucG9zaXRpb24uc2V0KDEsIDUsIDApO1xuXHRcdHRoaXMuc2NlbmUuYWRkKHRoaXMuZ3JhcGhDb250YWluZXIpO1xuXHRcdHRoaXMuc2NlbmUuYWRkKHRoaXMuY2FtZXJhKTtcblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoMCwgMjUwLCB0aGlzLmNhbWVyYURpc3RhbmNlKTtcblx0XHR0aGlzLmNhbWVyYS5sb29rQXQodGhpcy5zY2VuZS5wb3NpdGlvbik7XG5cblx0XHRTY2VuZVV0aWxzLmxpZ2h0aW5nKHRoaXMuc2NlbmUpO1xuXHRcdHRoaXMubW90aW9uTGFiLmluaXQodGhpcy5yZW5kZXJlciwgdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMudXBkYXRlUm90YXRpb24sIHRoaXMpO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xuXHRcdGlmIChhcnRpc3RRdWVyeSkge1xuXHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRNYWluQXJ0aXN0RGF0YShhcnRpc3RRdWVyeSk7XG5cdFx0fVxuXHR9XG5cblx0em9vbShkaXJlY3Rpb24pIHtcblx0XHRzd2l0Y2ggKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSAnaW4nOlxuXHRcdFx0XHR0aGlzLmNhbWVyYURpc3RhbmNlIC09IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ291dCc6XG5cdFx0XHRcdHRoaXMuY2FtZXJhRGlzdGFuY2UgKz0gMzU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdG9uU2NlbmVNb3VzZUhvdmVyKGV2ZW50KSB7XG5cdFx0bGV0IHNlbGVjdGVkO1xuXHRcdGNvbnN0IGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoZXZlbnQsIHRoaXMuZ3JhcGhDb250YWluZXIsIHRoaXMucmF5Y2FzdGVyLFxuXHRcdFx0dGhpcy5tb3VzZVZlY3RvciwgdGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIpO1xuXHRcdHRoaXMubW91c2VJc092ZXJSZWxhdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5ncmFwaENvbnRhaW5lci50cmF2ZXJzZSgob2JqKSA9PiB7XG5cdFx0XHRpZiAob2JqLmhhc093blByb3BlcnR5KCdpc1JlbGF0ZWRBcnRpc3RTcGhlcmUnKSkgeyAvLyByZXNldCB0aGUgcmVsYXRlZCBzcGhlcmUgdG8gcmVkXG5cdFx0XHRcdG9iai5tYXRlcmlhbC5jb2xvci5zZXRIZXgoQ29sb3Vycy5yZWxhdGVkQXJ0aXN0KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkgeyAvLyBtb3VzZSBpcyBvdmVyIGEgTWVzaFxuXHRcdFx0dGhpcy5tb3VzZUlzT3ZlclJlbGF0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0c2VsZWN0ZWQubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdEhvdmVyKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRvblNjZW5lTW91c2VEcmFnKGV2ZW50KSB7XG5cdFx0Y29uc3QgZHQgPSB0aGlzLnQyIC0gdGhpcy50MTtcblx0XHR0aGlzLm5vcm1hbGl6ZWRNb3VzZVBvcyA9IG5ldyBUSFJFRS5WZWN0b3IyKFxuXHRcdFx0KGV2ZW50LmNsaWVudFggLyB3aW5kb3cuaW5uZXJXaWR0aCkgKiAyIC0gMSxcblx0XHRcdC0oZXZlbnQuY2xpZW50WSAvIHdpbmRvdy5pbm5lckhlaWdodCkgKiAyICsgMSk7XG5cdFx0dGhpcy5tb3VzZVBvc1hJbmNyZWFzZWQgPSAodGhpcy5ub3JtYWxpemVkTW91c2VQb3MueCA+IHRoaXMub2xkTm9ybWFsaXplZE1vdXNlUG9zLngpO1xuXHRcdHRoaXMubW91c2VQb3NZSW5jcmVhc2VkID0gKHRoaXMubm9ybWFsaXplZE1vdXNlUG9zLnkgPiB0aGlzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy55KTtcblx0XHR0aGlzLm1vdXNlUG9zRGlmZlggPSBNYXRoLmFicyhNYXRoLmFicyh0aGlzLm5vcm1hbGl6ZWRNb3VzZVBvcy54KSAtIE1hdGguYWJzKHRoaXMub2xkTm9ybWFsaXplZE1vdXNlUG9zLngpKTtcblx0XHR0aGlzLm1vdXNlUG9zRGlmZlkgPSBNYXRoLmFicyhNYXRoLmFicyh0aGlzLm5vcm1hbGl6ZWRNb3VzZVBvcy55KSAtIE1hdGguYWJzKHRoaXMub2xkTm9ybWFsaXplZE1vdXNlUG9zLnkpKTtcblx0XHR0aGlzLnNwZWVkWCA9ICgoMSArIHRoaXMubW91c2VQb3NEaWZmWCkgLyBkdCk7XG5cdFx0dGhpcy5zcGVlZFkgPSAoKDEgKyB0aGlzLm1vdXNlUG9zRGlmZlkpIC8gZHQpO1xuXHRcdHRoaXMub2xkTm9ybWFsaXplZE1vdXNlUG9zID0gdGhpcy5ub3JtYWxpemVkTW91c2VQb3M7XG5cdH1cblxuXHRvblNjZW5lTW91c2VDbGljayhldmVudCkge1xuXHRcdGNvbnN0IGludGVyc2VjdHMgPSBTY2VuZVV0aWxzLmdldEludGVyc2VjdHNGcm9tTW91c2VQb3MoZXZlbnQsIHRoaXMuZ3JhcGhDb250YWluZXIsIHRoaXMucmF5Y2FzdGVyLFxuXHRcdFx0dGhpcy5tb3VzZVZlY3RvciwgdGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIpO1xuXHRcdGlmIChpbnRlcnNlY3RzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdDtcblx0XHRcdGlmIChzZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHtcblx0XHRcdFx0dGhpcy5zdGFydFJlbGF0ZWRBcnRpc3RTZWFyY2goc2VsZWN0ZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbXBvc2VTY2VuZShhcnRpc3QpIHtcblx0XHR0aGlzLm1haW5BcnRpc3RTcGhlcmUgPSBTY2VuZVV0aWxzLmNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KTtcblx0XHR0aGlzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzID0gU2NlbmVVdGlscy5jcmVhdGVSZWxhdGVkU3BoZXJlcyhhcnRpc3QsIHRoaXMubWFpbkFydGlzdFNwaGVyZSk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZSh0aGlzLmdyYXBoQ29udGFpbmVyLCB0aGlzLm1haW5BcnRpc3RTcGhlcmUsIHRoaXMucmVsYXRlZEFydGlzdFNwaGVyZXMpO1xuXHR9XG5cblx0c3RhcnRSZWxhdGVkQXJ0aXN0U2VhcmNoKHNlbGVjdGVkU3BoZXJlKSB7XG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2VsZWN0ZWRTcGhlcmUucG9zaXRpb24uY2xvbmUoKTtcblx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRTY2VuZVV0aWxzLmFwcGVuZE9iamVjdHNUb1NjZW5lKHRoaXMuZ3JhcGhDb250YWluZXIsIHNlbGVjdGVkU3BoZXJlKTtcblx0XHR0aGlzLm1vdGlvbkxhYi5hZGRKb2Ioe1xuXHRcdFx0am9iVHlwZTogJ3RyYW5zbGF0ZScsXG5cdFx0XHRzdGFydFBvaW50OiB0YXJnZXQsXG5cdFx0XHRlbmRQb2ludDogdGhpcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKSxcblx0XHRcdG9iamVjdDNEOiBzZWxlY3RlZFNwaGVyZSxcblx0XHRcdGR1cmF0aW9uOiAyLjAsIC8vIHNlY3Ncblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuY2xlYXJHcmFwaCgpO1xuXHRcdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldE1haW5BcnRpc3REYXRhKHNlbGVjdGVkU3BoZXJlLmFydGlzdE9iai5uYW1lKTtcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbmNvZGVVUklDb21wb25lbnQoc2VsZWN0ZWRTcGhlcmUuYXJ0aXN0T2JqLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJHcmFwaCgpIHtcblx0XHRjb25zdCBvbGRQYXJlbnQgPSB0aGlzLmdyYXBoQ29udGFpbmVyLmdldE9iamVjdEJ5TmFtZSgncGFyZW50Jyk7XG5cdFx0aWYgKCFvbGRQYXJlbnQpIHtcblx0XHRcdHRoaXMuZ3JhcGhDb250YWluZXIucmVtb3ZlKG9sZFBhcmVudCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRPRE86IG9wdGltaXNhdGlvbiAtIG9ubHkgdXNlIHVwZGF0ZVJvdGF0aW9uKCkgaWYgdGhlIG1vdXNlIGlzIGRyYWdnaW5nIC8gc3BlZWQgaXMgYWJvdmUgZGVmYXVsdCBtaW5pbXVtXG5cdCAqIFJvdGF0aW9uIG9mIGNhbWVyYSBpcyAqaW52ZXJzZSogb2YgbW91c2UgbW92ZW1lbnQgZGlyZWN0aW9uXG5cdCAqL1xuXHR1cGRhdGVSb3RhdGlvbigpIHtcblx0XHRsZXQgY2FtUXVhdGVybmlvblVwZGF0ZTtcblx0XHRjb25zdCB5TW9yZVRoYW5YTW91c2UgPSB0aGlzLm1vdXNlUG9zRGlmZlkgPj0gdGhpcy5tb3VzZVBvc0RpZmZYO1xuXHRcdGNvbnN0IHhNb3JlVGhhbllNb3VzZSA9ICF5TW9yZVRoYW5YTW91c2U7XG5cdFx0aWYgKHRoaXMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFSb3RhdGlvbi54IC09IHRoaXMuc3BlZWRYO1xuXHRcdH1cblx0XHRlbHNlIGlmICghdGhpcy5tb3VzZVBvc1lJbmNyZWFzZWQgJiYgeU1vcmVUaGFuWE1vdXNlKSB7XG5cdFx0XHR0aGlzLmNhbWVyYVJvdGF0aW9uLnggKz0gdGhpcy5zcGVlZFg7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFSb3RhdGlvbi55ICs9IHRoaXMuc3BlZWRZO1xuXHRcdH1cblx0XHRlbHNlIGlmICghdGhpcy5tb3VzZVBvc1hJbmNyZWFzZWQgJiYgeE1vcmVUaGFuWU1vdXNlKSB7XG5cdFx0XHR0aGlzLmNhbWVyYVJvdGF0aW9uLnkgLT0gdGhpcy5zcGVlZFk7XG5cdFx0fVxuXHRcdGNhbVF1YXRlcm5pb25VcGRhdGUgPSBTY2VuZVV0aWxzLnJlbm9ybWFsaXplUXVhdGVybmlvbih0aGlzLmNhbWVyYSk7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIodGhpcy5jYW1lcmFSb3RhdGlvbik7XG5cblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiB0aGlzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS55ICogdGhpcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIHRoaXMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdHRoaXMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0b2JqLmxvb2tBdCh0aGlzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbCh0aGlzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmICh0aGlzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHR0aGlzLnNwZWVkWCAtPSBhbW91bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdHRoaXMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuaW1wb3J0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyXCI7XG5pbXBvcnQgU2NlbmVDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0TGlzdENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtbGlzdC5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8U2VhcmNoQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNwb3RpZnlQbGF5ZXJDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdEluZm9Db21wb25lbnQoe2FydGlzdH0pIHtcblx0bGV0IGFydGlzdEluZm9NYXJrdXAgPSAnJztcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cImFydGlzdC1nZW5yZVwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0YXJ0aXN0SW5mb01hcmt1cCA9IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaW5mby1jb250YWluZXJcIj5cblx0XHRcdFx0PHVsPlxuXHRcdFx0XHRcdDxsaT5Qb3B1bGFyaXR5OiB7YXJ0aXN0LnBvcHVsYXJpdHl9PC9saT5cblx0XHRcdFx0XHQ8bGk+R2VucmVzOiB7Z2VucmVzfTwvbGk+XG5cdFx0XHRcdDwvdWw+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0cmV0dXJuIChcblx0XHQ8ZGl2PnthcnRpc3RJbmZvTWFya3VwfTwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RMaXN0Q29tcG9uZW50KHt2aXNpdGVkQXJ0aXN0c30pIHtcblx0bGV0IGFydGlzdHMgPSB2aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdGxldCBocmVmID0gJy8/YXJ0aXN0PScgKyBhcnRpc3QubmFtZTtcblx0XHRsZXQgaW1nVXJsID0gYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0XCIga2V5PXthcnRpc3QuaWR9PlxuXHRcdFx0XHQ8YSBocmVmPXtocmVmfSBpZD17YXJ0aXN0LmlkfSBjbGFzc05hbWU9XCJuYXYtYXJ0aXN0LWxpbmtcIj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzcmM9e2ltZ1VybH0gLz5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJuYW1lXCI+e2FydGlzdC5uYW1lfTwvc3Bhbj5cblx0XHRcdFx0PC9hPlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9KTtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYXZpZ2F0aW9uXCI+XG5cdFx0XHR7YXJ0aXN0c31cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi4vY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtTcGhlcmVzU2NlbmV9IGZyb20gXCIuLi9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3NcIjtcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFydGlzdCA9IHN0b3JlLmdldFN0YXRlKCkuYXJ0aXN0O1xuXHRcdHRoaXMubW91c2VEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgeyBhcnRpc3QgfSA9IHRoaXMucHJvcHM7XG5cdFx0aWYgKGFydGlzdC5pZCkge1xuXHRcdFx0dGhpcy5zY2VuZS5jb21wb3NlU2NlbmUoYXJ0aXN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiXG5cdFx0XHRcdCByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19XG5cdFx0XHQvPlxuXHRcdClcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuc2NlbmUgPSBuZXcgU3BoZXJlc1NjZW5lKHRoaXMuc2NlbmVEb20pO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpXG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5tb3VzZURvd24pIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlRHJhZyhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlZG93bigpIHtcblx0XHR0aGlzLnNjZW5lLm1vdXNlSXNEb3duID0gdHJ1ZTtcblx0fVxuXG5cdG1vdXNldXAoKSB7XG5cdFx0dGhpcy5zY2VuZS5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0bW91c2V3aGVlbChldmVudCkge1xuXHRcdHN3aXRjaCAoU2NlbmVVdGlscy5zaWduKGV2ZW50LndoZWVsRGVsdGFZKSkge1xuXHRcdFx0Y2FzZSAtMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdvdXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnaW4nKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmVzaXplKCkge1xuXHRcdHRoaXMuc2NlbmUuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdHRoaXMuc2NlbmUucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGhhbmRsZVNlYXJjaCwgaGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU3BvdGlmeVBsYXllckNvbXBvbmVudCh7YXJ0aXN0fSkge1xuXHRjb25zdCBlbWJlZFVybCA9ICdodHRwczovL29wZW4uc3BvdGlmeS5jb20vZW1iZWQvYXJ0aXN0Lyc7XG5cdGNvbnN0IGFydGlzdEVtYmVkVXJsID0gYCR7ZW1iZWRVcmx9JHthcnRpc3QuaWR9YDtcblx0bGV0IGlGcmFtZU1hcmt1cCA9ICcnO1xuXHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0aUZyYW1lTWFya3VwID0gKFxuXHRcdFx0PGRpdiBpZD1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYWxidW0tbmF2XCI+XG5cdFx0XHRcdFx0PGEgaHJlZj1cIiNcIj5QcmV2PC9hPlxuXHRcdFx0XHRcdDxhIGhyZWY9XCIjXCI+TmV4dDwvYT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyLWNvbnRhaW5lclwiPlxuXHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHQ8L2Rpdj5cblx0KVxufSIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHR2aXNpdGVkQXJ0aXN0czogc3RhdGUudmlzaXRlZEFydGlzdHNcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RMaXN0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0TGlzdENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1NjZW5lQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3NjZW5lLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNjZW5lQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNjZW5lQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7IE11c2ljRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgdXBkYXRlU2VhcmNoVGVybSB9IGZyb20gJy4uL3N0YXRlL2FjdGlvbnMnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRzZWFyY2hUZXJtOiBzdGF0ZS5zZWFyY2hUZXJtXG5cdH1cbn07XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhbmRsZVNlYXJjaDogKGV2dCwgc2VhcmNoVGVybSkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldE1haW5BcnRpc3REYXRhKHNlYXJjaFRlcm0pO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtzZWFyY2hEb25lfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBnZXRNYWluQXJ0aXN0RGF0YShhcnRpc3ROYW1lKSB7XG5cdFx0bGV0IHNlYXJjaFVSTCA9ICcvYXBpL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdE5hbWUpO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goc2VhcmNoVVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogXCJzYW1lLW9yaWdpblwiXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHtcblx0XHRcdHJldHVybiBzdG9yZS5kaXNwYXRjaChzZWFyY2hEb25lKGpzb24pKTtcblx0XHR9KTtcblx0fVxufSIsImV4cG9ydCBjb25zdCBBUlRJU1RfU0VBUkNIX0RPTkUgPSAnQVJUSVNUX1NFQVJDSF9ET05FJztcbmV4cG9ydCBjb25zdCBTRUFSQ0hfVEVSTV9VUERBVEUgPSAnU0VBUkNIX1RFUk1fVVBEQVRFJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaERvbmUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9TRUFSQ0hfRE9ORSxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlYXJjaFRlcm0oc2VhcmNoVGVybSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNFQVJDSF9URVJNX1VQREFURSxcblx0XHRzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG5cdH1cbn0iLCJpbXBvcnQge1NFQVJDSF9URVJNX1VQREFURSwgQVJUSVNUX1NFQVJDSF9ET05FfSBmcm9tICcuLi9hY3Rpb25zJ1xuXG5jb25zdCBpbml0aWFsU3RhdGUgPSB7XG5cdGFydGlzdDoge1xuXHRcdGlkOiAnJyxcblx0XHRuYW1lOiAnJyxcblx0XHRpbWdVcmw6ICcnLFxuXHRcdGdlbnJlczogW10sXG5cdFx0cG9wdWxhcml0eTogMCxcblx0XHRpbWFnZXM6IFtdXG5cdH0sXG5cdHNlYXJjaFRlcm06ICcnLFxuXHR2aXNpdGVkQXJ0aXN0czogW11cbn07XG5cbmNvbnN0IGFydGlzdFNlYXJjaCA9IChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSA9PiB7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uc2VhcmNoVGVybSxcblx0XHRcdH07XG5cdFx0Y2FzZSBBUlRJU1RfU0VBUkNIX0RPTkU6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHQuLi5zdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRcdFx0XHRhY3Rpb24uZGF0YVxuXHRcdFx0XHRdXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFydGlzdFNlYXJjaDsiLCJpbXBvcnQge2NyZWF0ZVN0b3JlfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgYXJ0aXN0U2VhcmNoIGZyb20gXCIuL3JlZHVjZXJzL2FydGlzdC1zZWFyY2hcIjtcblxuZXhwb3J0IGxldCBzdG9yZSA9IGNyZWF0ZVN0b3JlKFxuXHRhcnRpc3RTZWFyY2gsXG5cdHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fICYmIHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fKClcbik7XG5cblxuIl19
