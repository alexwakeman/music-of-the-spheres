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
		value: function init(renderer, scene, camera, defaultOp) {
			this.renderer = renderer;
			this.scene = scene;
			this.camera = camera;
			this.defaultOp = defaultOp;
			this.t1 = 0.0; // previous frame tick
			this.t2 = 0.0; // current frame tick
			this.animate();
		}
	}, {
		key: 'animate',
		value: function animate() {
			this.t1 = this.t2;
			this.t2 = performance.now();
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
				case 'default':
					this.defaultOp();
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
			this.job.jobTypeFunc = 'default';
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
			var radius = artist.popularity * 10;
			var size = radius * 2;
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
			var step = facesCount / artist.related.length;

			for (var i = 0, len = artist.related.length; i < len; i++) {
				relatedArtistObj = artist.related[i];
				var radius = relatedArtistObj.followers; // size of this sphere
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
				relatedArtistSphere.distance = 900; // will be union statistic
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
			relatedSphere.position.set(mainArtistSphereFace.multiply(new THREE.Vector3(relatedSphere.distance, relatedSphere.distance, relatedSphere.distance)));
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
		this.motionLab.init(this.renderer, this.scene, this.camera, this.updateRotation);

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
			camQuaternionUpdate = _sceneUtils.SceneUtils.renomralizeQuaternion(this.camera.quaternion);
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
			this.scene.updateProjectionMatrix();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdHN0cmFwLmpzeCIsInNyYy9qcy9jbGFzc2VzL21vdGlvbi1sYWIuY2xhc3MuanMiLCJzcmMvanMvY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzcy5qcyIsInNyYy9qcy9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3MuanMiLCJzcmMvanMvY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL2FydGlzdC1pbmZvLmNvbXBvbmVudC5qc3giLCJzcmMvanMvY29tcG9uZW50cy9hcnRpc3QtbGlzdC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc2NlbmUuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4Iiwic3JjL2pzL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5ZXIuY29tcG9uZW50LmpzeCIsInNyYy9qcy9jb25maWcvY29sb3Vycy5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL2FydGlzdC1saXN0LmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NjZW5lLmNvbnRhaW5lci5qcyIsInNyYy9qcy9jb250YWluZXJzL3NlYXJjaC1pbnB1dC5jb250YWluZXIuanMiLCJzcmMvanMvY29udGFpbmVycy9zcG90aWZ5LXBsYXllci5jb250YWluZXIuanMiLCJzcmMvanMvc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlLmpzIiwic3JjL2pzL3N0YXRlL2FjdGlvbnMuanMiLCJzcmMvanMvc3RhdGUvcmVkdWNlcnMvYXJ0aXN0LXNlYXJjaC5qcyIsInNyYy9qcy9zdGF0ZS9zdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7O0lBQVksSzs7QUFDWjs7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QUNBLElBQU0sa0RBQXFCLG9CQUEzQjs7QUFFQSxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7QUFDaEMsUUFBTztBQUNOLFFBQU0sa0JBREE7QUFFTixRQUFNO0FBRkEsRUFBUDtBQUlBOztBQUVNLFNBQVMsZ0JBQVQsQ0FBMEIsVUFBMUIsRUFBc0M7QUFDNUMsUUFBTztBQUNOLFFBQU0sa0JBREE7QUFFTixjQUFZO0FBRk4sRUFBUDtBQUlBOzs7Ozs7Ozs7OztBQ2ZEOzs7O0FBRUEsSUFBTSxlQUFlO0FBQ3BCLFNBQVE7QUFDUCxNQUFJLEVBREc7QUFFUCxRQUFNLEVBRkM7QUFHUCxVQUFRLEVBSEQ7QUFJUCxVQUFRLEVBSkQ7QUFLUCxjQUFZLENBTEw7QUFNUCxVQUFRO0FBTkQsRUFEWTtBQVNwQixhQUFZLEVBVFE7QUFVcEIsaUJBQWdCO0FBVkksQ0FBckI7O0FBYUEsSUFBTSxlQUFlLFNBQWYsWUFBZSxHQUFrQztBQUFBLEtBQWpDLEtBQWlDLHVFQUF6QixZQUF5QjtBQUFBLEtBQVgsTUFBVzs7QUFDdEQsU0FBUSxPQUFPLElBQWY7QUFDQztBQUNDLHVCQUNJLEtBREo7QUFFQyxnQkFBWSxPQUFPO0FBRnBCO0FBSUQ7QUFDQyx1QkFDSSxLQURKO0FBRUMsWUFBUSxPQUFPLElBRmhCO0FBR0MsaURBQ0ksTUFBTSxjQURWLElBRUMsT0FBTyxJQUZSO0FBSEQ7QUFRRDtBQUNDLFVBQU8sS0FBUDtBQWhCRjtBQWtCQSxDQW5CRDs7a0JBcUJlLFk7Ozs7Ozs7Ozs7QUNwQ2Y7O0FBQ0E7Ozs7OztBQUVPLElBQUksd0JBQVEsZ0RBRWxCLE9BQU8sNEJBQVAsSUFBdUMsT0FBTyw0QkFBUCxFQUZyQixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtBcHBDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9hcHAuY29tcG9uZW50LmpzeCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuL3N0YXRlL3N0b3JlJztcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuXG4vLyBjYW5jZWwgcmlnaHQgY2xpY2tcbmRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50KSA9PiBldmVudC5idXR0b24gIT09IDI7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+XG5cdFx0PEFwcENvbXBvbmVudCAvPlxuXHQ8L1Byb3ZpZGVyPixcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTsiLCJpbXBvcnQge1NwbGluZX0gZnJvbSBcInRocmVlXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3Rpb25MYWIge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG5cblx0aW5pdChyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSwgZGVmYXVsdE9wKSB7XG5cdFx0dGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuXHRcdHRoaXMuc2NlbmUgPSBzY2VuZTtcblx0XHR0aGlzLmNhbWVyYSA9IGNhbWVyYTtcblx0XHR0aGlzLmRlZmF1bHRPcCA9IGRlZmF1bHRPcDtcblx0XHR0aGlzLnQxID0gMC4wOyAvLyBwcmV2aW91cyBmcmFtZSB0aWNrXG5cdFx0dGhpcy50MiA9IDAuMDsgLy8gY3VycmVudCBmcmFtZSB0aWNrXG5cdFx0dGhpcy5hbmltYXRlKCk7XG5cdH1cblxuXHRhbmltYXRlKCkge1xuXHRcdHRoaXMudDEgPSB0aGlzLnQyO1xuXHRcdHRoaXMudDIgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHR0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG5cdH1cblxuXHRhZGRKb2Ioam9iKSB7XG5cdFx0dGhpcy5qb2IgPSBqb2I7XG5cdFx0c3dpdGNoICh0aGlzLmpvYi5qb2JUeXBlKSB7XG5cdFx0XHRjYXNlICd0cmFuc2xhdGUnOi8vIHJlcXVpcmVzIGEgcGF0aCBhbmQgbG9va0F0ICsgb2JqZWN0M0Rcblx0XHRcdFx0dGhpcy5hcHBlbmRUcmFuc2xhdGVKb2Ioam9iKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdkZWZhdWx0Jzpcblx0XHRcdFx0dGhpcy5kZWZhdWx0T3AoKTtcblx0XHR9XG5cdH1cblxuXHR0cmFuc2xhdGVUcmFuc2l0aW9uT2JqZWN0KCkge1xuXHRcdGNvbnN0IGlzRmluaXNoZWQgPSB0aGlzLmpvYi5jdXJyZW50VGltZSA+PSB0aGlzLmpvYi5kdXJhdGlvbjtcblx0XHRpZiAoIWlzRmluaXNoZWQpIHtcblx0XHRcdHRoaXMuZm9sbG93UGF0aCgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuZW5kQW5pbWF0aW9uKCk7XG5cdFx0fVxuXHR9XG5cblx0Zm9sbG93UGF0aCgpIHtcblx0XHRjb25zdCBwID0gdGhpcy5qb2IucGF0aC5nZXRQb2ludCh0aGlzLmpvYi5jdXJyZW50VGltZSk7XG5cdFx0dGhpcy5qb2Iub2JqZWN0M0QucG9zaXRpb24uY29weShwKTtcblx0XHR0aGlzLmpvYi5jdXJyZW50VGltZSArPSAwLjAxO1xuXHR9XG5cblx0ZW5kQW5pbWF0aW9uKCkge1xuXHRcdHRoaXMuam9iLmpvYlR5cGVGdW5jID0gJ2RlZmF1bHQnO1xuXHRcdHRoaXMuam9iLmNhbGxiYWNrICYmIHRoaXMuam9iLmNhbGxiYWNrKCk7XG5cdH1cblxuXHRhcHBlbmRUcmFuc2xhdGVKb2Ioam9iKSB7XG5cdFx0am9iLnN0YXJ0VGltZSA9IHRoaXMudDI7XG5cdFx0am9iLnQgPSAwLjA7XG5cdFx0am9iLmN1cnJlbnRUaW1lID0gMC4wO1xuXHRcdGpvYi5wYXRoID0gbmV3IFNwbGluZShbXG5cdFx0XHRqb2Iuc3RhcnRQb2ludCxcblx0XHRcdGpvYi5lbmRQb2ludFxuXHRcdF0pO1xuICAgICAgICB0aGlzLmpvYiA9IGpvYjtcblx0XHR0aGlzLmpvYlsndHJhbnNsYXRlVHJhbnNpdGlvbk9iamVjdCddKCk7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tICcuLi9jb25maWcvY29sb3Vycyc7XG5sZXQgSEVMVkVUSUtFUjtcblxuY2xhc3MgU2NlbmVVdGlscyB7XG5cdHN0YXRpYyBpbml0KCkge1xuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cdFx0bG9hZGVyLmxvYWQoJy4vanMvZm9udHMvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nLCAoZm9udCkgPT4gSEVMVkVUSUtFUiA9IGZvbnQpO1xuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYSAtIG1pblxuXHQgKiBAcGFyYW0gYiAtIG1heFxuXHQgKiBAcGFyYW0gYyAtIHZhbHVlIHRvIGNsYW1wXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgY2xhbXAoYSwgYiwgYykge1xuXHRcdHJldHVybiBNYXRoLm1heChiLCBNYXRoLm1pbihjLCBhKSk7XG5cdH1cblxuXHQvKipcblx0ICogR2l2ZW4gcG9zaXRpdmUgeCByZXR1cm4gMSwgbmVnYXRpdmUgeCByZXR1cm4gLTEsIG9yIDAgb3RoZXJ3aXNlXG5cdCAqIEBwYXJhbSB4XG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzdGF0aWMgc2lnbih4KSB7XG5cdFx0cmV0dXJuIHggPiAwID8gMSA6IHggPCAwID8gLTEgOiAwO1xuXHR9O1xuXG5cdHN0YXRpYyByZW5vcm1hbGl6ZVF1YXRlcm5pb24ob2JqZWN0KSB7XG5cdFx0bGV0IGNsb25lID0gb2JqZWN0LmNsb25lKCk7XG5cdFx0bGV0IHEgPSBjbG9uZS5xdWF0ZXJuaW9uO1xuXHRcdGxldCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoTWF0aC5wb3cocS53LCAyKSArIE1hdGgucG93KHEueCwgMikgKyBNYXRoLnBvdyhxLnksIDIpICsgTWF0aC5wb3cocS56LCAyKSk7XG5cdFx0cS53IC89IG1hZ25pdHVkZTtcblx0XHRxLnggLz0gbWFnbml0dWRlO1xuXHRcdHEueSAvPSBtYWduaXR1ZGU7XG5cdFx0cS56IC89IG1hZ25pdHVkZTtcblx0XHRyZXR1cm4gcTtcblx0fVxuXG5cdHN0YXRpYyBnZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCBncmFwaCwgcmF5Y2FzdGVyLCBtb3VzZVZlY3RvciwgY2FtZXJhLCByZW5kZXJlcikge1xuXHRcdG1vdXNlVmVjdG9yLnggPSAoZXZlbnQuY2xpZW50WCAvIHJlbmRlcmVyLmRvbUVsZW1lbnQuY2xpZW50V2lkdGgpICogMiAtIDE7XG5cdFx0bW91c2VWZWN0b3IueSA9IC0gKGV2ZW50LmNsaWVudFkgLyByZW5kZXJlci5kb21FbGVtZW50LmNsaWVudEhlaWdodCkgKiAyICsgMTtcblx0XHRyYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZVZlY3RvciwgY2FtZXJhKTtcblx0XHRyZXR1cm4gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoZ3JhcGguY2hpbGRyZW4sIHRydWUpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZU1haW5BcnRpc3RTcGhlcmUoYXJ0aXN0KSB7XG5cdFx0bGV0IHJhZGl1cyA9IGFydGlzdC5wb3B1bGFyaXR5ICogMTA7XG5cdFx0bGV0IHNpemUgPSByYWRpdXMgKiAyO1xuXHRcdGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSg0MCwgMzUsIDM1KTtcblx0XHRsZXQgc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogQ29sb3Vycy5tYWluQXJ0aXN0fSkpO1xuXHRcdHNwaGVyZS5hcnRpc3RPYmogPSBhcnRpc3Q7XG5cdFx0c3BoZXJlLnJhZGl1cyA9IHJhZGl1cztcblx0XHRzcGhlcmUuaXNNYWluQXJ0aXN0U3BoZXJlID0gdHJ1ZTtcblx0XHRzcGhlcmUuaXNTcGhlcmUgPSB0cnVlO1xuXHRcdHRoaXMuYWRkVGV4dChhcnRpc3QubmFtZSwgMzQsIHNwaGVyZSk7XG5cdFx0cmV0dXJuIHNwaGVyZTtcblx0fVxuXG5cdC8vIFRPRE86IGdldCBzdGF0cyBmb3IgcmVsYXRlZG5lc3MgKGdlbnJlcyB1bmlvbiBtZWFzdXJlKSAtIGRpc3RhbmNlIGZyb20gbWFpbiBhcnRpc3Rcblx0Ly8gVE9ETzogY2xlYW4gdXAgdGhpcyBjb2RlLCByZW1vdmUgdGhlIGhhcmQgY29kZWQgbnVtYmVyc1xuXHRzdGF0aWMgY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCBtYWluQXJ0aXN0U3BoZXJlKSB7XG5cdFx0bGV0IHJlbGF0ZWRBcnRpc3RzU3BoZXJlQXJyYXkgPSBbXTtcblx0XHRsZXQgcmVsYXRlZEFydGlzdE9iajtcblx0XHRsZXQgc3BoZXJlRmFjZUluZGV4ID0gMDsgLy8gcmVmZXJlbmNlcyBhIHdlbGwgc3BhY2VkIGZhY2Ugb2YgdGhlIG1haW4gYXJ0aXN0IHNwaGVyZVxuXHRcdGxldCBmYWNlc0NvdW50ID0gbWFpbkFydGlzdFNwaGVyZS5nZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxO1xuXHRcdGxldCBzdGVwID0gZmFjZXNDb3VudCAvIGFydGlzdC5yZWxhdGVkLmxlbmd0aDtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW4gPSBhcnRpc3QucmVsYXRlZC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0cmVsYXRlZEFydGlzdE9iaiA9IGFydGlzdC5yZWxhdGVkW2ldO1xuXHRcdFx0bGV0IHJhZGl1cyA9IHJlbGF0ZWRBcnRpc3RPYmouZm9sbG93ZXJzOyAvLyBzaXplIG9mIHRoaXMgc3BoZXJlXG5cdFx0XHRsZXQgc2l6ZSA9IHJhZGl1cyAqIDI7XG5cdFx0XHRsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNDAsIDM1LCAzNSk7XG5cdFx0XHRsZXQgcmVsYXRlZEFydGlzdFNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZEFydGlzdH0pKTtcblx0XHRcdHJlbGF0ZWRBcnRpc3RPYmoudW5pdExlbmd0aCA9IDEwMDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RPYmoucmFuZ2UgPSA1MDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuYXJ0aXN0T2JqID0gcmVsYXRlZEFydGlzdE9iajtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1JlbGF0ZWRBcnRpc3RTcGhlcmUgPSB0cnVlO1xuXHRcdFx0cmVsYXRlZEFydGlzdFNwaGVyZS5pc1NwaGVyZSA9IHRydWU7XG5cdFx0XHRyZWxhdGVkQXJ0aXN0U3BoZXJlLnllYXJzU2hhcmVkID0gcmVsYXRlZEFydGlzdE9iai55ZWFyc1NoYXJlZDtcblx0XHRcdHJlbGF0ZWRBcnRpc3RTcGhlcmUuZGlzdGFuY2UgPSA5MDA7IC8vIHdpbGwgYmUgdW5pb24gc3RhdGlzdGljXG5cdFx0XHRzcGhlcmVGYWNlSW5kZXggKz0gc3RlcDtcblx0XHRcdFNjZW5lVXRpbHMucG9zaXRpb25SZWxhdGVkQXJ0aXN0KG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUsIHNwaGVyZUZhY2VJbmRleCk7XG5cdFx0XHRTY2VuZVV0aWxzLmpvaW5SZWxhdGVkQXJ0aXN0U3BoZXJlVG9NYWluKG1haW5BcnRpc3RTcGhlcmUsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0U2NlbmVVdGlscy5hZGRUZXh0KHJlbGF0ZWRBcnRpc3RPYmoubmFtZSwgMjAsIHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdFx0cmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheS5wdXNoKHJlbGF0ZWRBcnRpc3RTcGhlcmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRlZEFydGlzdHNTcGhlcmVBcnJheTtcblx0fVxuXG5cdHN0YXRpYyBhcHBlbmRPYmplY3RzVG9TY2VuZShncmFwaENvbnRhaW5lciwgc3BoZXJlLCBzcGhlcmVBcnJheSkge1xuXHRcdGNvbnN0IHBhcmVudCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXHRcdHBhcmVudC5uYW1lID0gJ3BhcmVudCc7XG5cdFx0cGFyZW50LmFkZChzcGhlcmUpO1xuXHRcdGlmIChzcGhlcmVBcnJheSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGhlcmVBcnJheS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRwYXJlbnQuYWRkKHNwaGVyZUFycmF5W2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Z3JhcGhDb250YWluZXIuYWRkKHBhcmVudCk7XG5cdH1cblxuXHRzdGF0aWMgam9pblJlbGF0ZWRBcnRpc3RTcGhlcmVUb01haW4obWFpbkFydGlzdFNwaGVyZSwgcmVsYXRlZFNwaGVyZSkge1xuXHRcdGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7Y29sb3I6IENvbG91cnMucmVsYXRlZExpbmVKb2lufSk7XG5cdFx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG5cdFx0bGV0IGxpbmU7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygwLCAxLCAwKSk7XG5cdFx0Z2VvbWV0cnkudmVydGljZXMucHVzaChyZWxhdGVkU3BoZXJlLnBvc2l0aW9uLmNsb25lKCkpO1xuXHRcdGxpbmUgPSBuZXcgVEhSRUUuTGluZShnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXHRcdG1haW5BcnRpc3RTcGhlcmUuYWRkKGxpbmUpO1xuXHR9XG5cblx0c3RhdGljIHBvc2l0aW9uUmVsYXRlZEFydGlzdChtYWluQXJ0aXN0U3BoZXJlLCByZWxhdGVkU3BoZXJlLCBzcGhlcmVGYWNlSW5kZXgpIHtcblx0XHRsZXQgbWFpbkFydGlzdFNwaGVyZUZhY2UgPSBtYWluQXJ0aXN0U3BoZXJlLmdlb21ldHJ5LmZhY2VzW01hdGgucm91bmQoc3BoZXJlRmFjZUluZGV4KV0ubm9ybWFsLmNsb25lKCk7XG5cdFx0cmVsYXRlZFNwaGVyZS5wb3NpdGlvblxuXHRcdFx0LnNldChtYWluQXJ0aXN0U3BoZXJlRmFjZS5tdWx0aXBseShuZXcgVEhSRUUuVmVjdG9yMyhcblx0XHRcdFx0XHRyZWxhdGVkU3BoZXJlLmRpc3RhbmNlLFxuXHRcdFx0XHRcdHJlbGF0ZWRTcGhlcmUuZGlzdGFuY2UsXG5cdFx0XHRcdFx0cmVsYXRlZFNwaGVyZS5kaXN0YW5jZVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBhZGRUZXh0KGxhYmVsLCBzaXplLCBzcGhlcmUpIHtcblx0XHRsZXQgdGV4dE1lc2g7XG5cdFx0bGV0IG1hdGVyaWFsRnJvbnQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRPdXRlcn0pO1xuXHRcdGxldCBtYXRlcmlhbFNpZGUgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiBDb2xvdXJzLnRleHRJbm5lcn0pO1xuXHRcdGxldCBtYXRlcmlhbEFycmF5ID0gW21hdGVyaWFsRnJvbnQsIG1hdGVyaWFsU2lkZV07XG5cdFx0bGV0IHRleHRHZW9tID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeShsYWJlbCwge1xuXHRcdFx0Zm9udDogSEVMVkVUSUtFUixcblx0XHRcdHNpemU6IDgwLFxuXHRcdFx0aGVpZ2h0OiA1LFxuXHRcdFx0Y3VydmVTZWdtZW50czogMTIsXG5cdFx0XHRiZXZlbEVuYWJsZWQ6IHRydWUsXG5cdFx0XHRiZXZlbFRoaWNrbmVzczogMTAsXG5cdFx0XHRiZXZlbFNpemU6IDgsXG5cdFx0XHRiZXZlbFNlZ21lbnRzOiA1XG5cdFx0fSk7XG5cdFx0dGV4dEdlb20uY29tcHV0ZUJvdW5kaW5nQm94KCk7XG5cdFx0dGV4dEdlb20uY29tcHV0ZVZlcnRleE5vcm1hbHMoKTtcblx0XHR0ZXh0TWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRleHRHZW9tLCBtYXRlcmlhbEFycmF5KTtcblx0XHR0ZXh0TWVzaC5wb3NpdGlvbi5zZXQoLXNpemUsIHNwaGVyZS5yYWRpdXMgKiAyICsgMjAsIDApOyAvLyB1bmRlcm5lYXRoIHRoZSBzcGhlcmVcblx0XHR0ZXh0TWVzaC5pc1RleHQgPSB0cnVlO1xuXHRcdHNwaGVyZS5hZGQodGV4dE1lc2gpO1xuXHR9XG5cblx0c3RhdGljIGxpZ2h0aW5nKHNjZW5lKSB7XG5cdFx0bGV0IGRpckxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDAuMTI1KTtcblx0XHRkaXJMaWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMSkubm9ybWFsaXplKCk7XG5cdFx0c2NlbmUuYWRkKCBkaXJMaWdodCApO1xuXHRcdGxldCBwb2ludExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZmZmZmYsIDEuNSk7XG5cdFx0cG9pbnRMaWdodC5wb3NpdGlvbi5zZXQoMCwgMTAwLCA5MCk7XG5cdFx0cG9pbnRMaWdodC5jb2xvci5zZXRIZXgoQ29sb3Vycy50ZXh0T3V0ZXIpO1xuXHRcdHNjZW5lLmFkZChwb2ludExpZ2h0KTtcblx0fVxufVxuXG5leHBvcnQgeyBTY2VuZVV0aWxzIH1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtDb2xvdXJzfSBmcm9tIFwiLi4vY29uZmlnL2NvbG91cnNcIjtcbmltcG9ydCBNb3Rpb25MYWIgZnJvbSBcIi4vbW90aW9uLWxhYi5jbGFzc1wiO1xuaW1wb3J0IHtNdXNpY0RhdGFTZXJ2aWNlfSBmcm9tIFwiLi4vc2VydmljZXMvbXVzaWMtZGF0YS5zZXJ2aWNlXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmVzU2NlbmUge1xuXHRub3JtYWxpemVkTW91c2VQb3M7XG5cdG9sZE5vcm1hbGl6ZWRNb3VzZVBvcztcblxuXHRhcnRpc3Q7XG5cdG1haW5BcnRpc3RTcGhlcmU7XG5cblx0Y29uc3RydWN0b3IoY29udGFpbmVyKSB7XG5cdFx0Y29uc3QgYXJ0aXN0UXVlcnkgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKSk7XG5cdFx0U2NlbmVVdGlscy5pbml0KCk7XG5cdFx0dGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGFscGhhOiB0cnVlfSk7XG5cdFx0dGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXHRcdHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDMwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgNTAwLCAxNTAwMDApO1xuXHRcdHRoaXMuZ3JhcGhDb250YWluZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblx0XHR0aGlzLm1vdGlvbkxhYiA9IG5ldyBNb3Rpb25MYWIoKTtcblx0XHR0aGlzLmNhbWVyYVJvdGF0aW9uID0gbmV3IFRIUkVFLkV1bGVyKDAsIDAsIDApO1xuXHRcdHRoaXMuY2FtZXJhTG9va0F0ID0gbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSk7XG5cdFx0dGhpcy5jYW1lcmFEaXN0YW5jZSA9IDM1MDA7XG5cblx0XHR0aGlzLnQxID0gMC4wOyAvLyBvbGQgdGltZVxuXHRcdHRoaXMudDIgPSAwLjA7IC8vIG5vdyB0aW1lXG5cdFx0dGhpcy5zcGVlZFggPSAwLjAwNTtcblx0XHR0aGlzLnNwZWVkWSA9IDAuMDA1O1xuXHRcdHRoaXMubW91c2VQb3NEaWZmWCA9IDAuMDtcblx0XHR0aGlzLm1vdXNlUG9zRGlmZlkgPSAwLjA7XG5cdFx0dGhpcy5tb3VzZVBvc1hJbmNyZWFzZWQgPSBmYWxzZTtcblx0XHR0aGlzLm1vdXNlUG9zWUluY3JlYXNlZCA9IGZhbHNlO1xuXHRcdHRoaXMucmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xuXHRcdHRoaXMubW91c2VWZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdFx0dGhpcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFtdO1xuXG5cdFx0Ly8gYXR0YWNoIHRvIGRvbVxuXHRcdHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuXHRcdHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0XHR0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAncmVuZGVyZXInO1xuXHRcdHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cblx0XHR0aGlzLmdyYXBoQ29udGFpbmVyLnBvc2l0aW9uLnNldCgxLCA1LCAwKTtcblx0XHR0aGlzLnNjZW5lLmFkZCh0aGlzLmdyYXBoQ29udGFpbmVyKTtcblx0XHR0aGlzLnNjZW5lLmFkZCh0aGlzLmNhbWVyYSk7XG5cdFx0dGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KDAsIDI1MCwgdGhpcy5jYW1lcmFEaXN0YW5jZSk7XG5cdFx0dGhpcy5jYW1lcmEubG9va0F0KHRoaXMuc2NlbmUucG9zaXRpb24pO1xuXG5cdFx0U2NlbmVVdGlscy5saWdodGluZyh0aGlzLnNjZW5lKTtcblx0XHR0aGlzLm1vdGlvbkxhYi5pbml0KHRoaXMucmVuZGVyZXIsIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnVwZGF0ZVJvdGF0aW9uKTtcblxuXHRcdC8vIGNoZWNrIGZvciBxdWVyeSBzdHJpbmdcblx0XHRpZiAoYXJ0aXN0UXVlcnkpIHtcblx0XHRcdE11c2ljRGF0YVNlcnZpY2UuZ2V0TWFpbkFydGlzdERhdGEoYXJ0aXN0UXVlcnkpO1xuXHRcdH1cblx0fVxuXG5cdHpvb20oZGlyZWN0aW9uKSB7XG5cdFx0c3dpdGNoIChkaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgJ2luJzpcblx0XHRcdFx0dGhpcy5jYW1lcmFEaXN0YW5jZSAtPSAzNTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvdXQnOlxuXHRcdFx0XHR0aGlzLmNhbWVyYURpc3RhbmNlICs9IDM1O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRvblNjZW5lTW91c2VIb3ZlcihldmVudCkge1xuXHRcdGxldCBzZWxlY3RlZDtcblx0XHRjb25zdCBpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCB0aGlzLmdyYXBoQ29udGFpbmVyLCB0aGlzLnJheWNhc3Rlcixcblx0XHRcdHRoaXMubW91c2VWZWN0b3IsIHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyKTtcblx0XHR0aGlzLm1vdXNlSXNPdmVyUmVsYXRlZCA9IGZhbHNlO1xuXHRcdHRoaXMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNSZWxhdGVkQXJ0aXN0U3BoZXJlJykpIHsgLy8gcmVzZXQgdGhlIHJlbGF0ZWQgc3BoZXJlIHRvIHJlZFxuXHRcdFx0XHRvYmoubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KENvbG91cnMucmVsYXRlZEFydGlzdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHsgLy8gbW91c2UgaXMgb3ZlciBhIE1lc2hcblx0XHRcdHRoaXMubW91c2VJc092ZXJSZWxhdGVkID0gdHJ1ZTtcblx0XHRcdHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoc2VsZWN0ZWQuaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7XG5cdFx0XHRcdHNlbGVjdGVkLm1hdGVyaWFsLmNvbG9yLnNldEhleChDb2xvdXJzLnJlbGF0ZWRBcnRpc3RIb3Zlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0b25TY2VuZU1vdXNlRHJhZyhldmVudCkge1xuXHRcdGNvbnN0IGR0ID0gdGhpcy50MiAtIHRoaXMudDE7XG5cdFx0dGhpcy5ub3JtYWxpemVkTW91c2VQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMihcblx0XHRcdChldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGgpICogMiAtIDEsXG5cdFx0XHQtKGV2ZW50LmNsaWVudFkgLyB3aW5kb3cuaW5uZXJIZWlnaHQpICogMiArIDEpO1xuXHRcdHRoaXMubW91c2VQb3NYSW5jcmVhc2VkID0gKHRoaXMubm9ybWFsaXplZE1vdXNlUG9zLnggPiB0aGlzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy54KTtcblx0XHR0aGlzLm1vdXNlUG9zWUluY3JlYXNlZCA9ICh0aGlzLm5vcm1hbGl6ZWRNb3VzZVBvcy55ID4gdGhpcy5vbGROb3JtYWxpemVkTW91c2VQb3MueSk7XG5cdFx0dGhpcy5tb3VzZVBvc0RpZmZYID0gTWF0aC5hYnMoTWF0aC5hYnModGhpcy5ub3JtYWxpemVkTW91c2VQb3MueCkgLSBNYXRoLmFicyh0aGlzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy54KSk7XG5cdFx0dGhpcy5tb3VzZVBvc0RpZmZZID0gTWF0aC5hYnMoTWF0aC5hYnModGhpcy5ub3JtYWxpemVkTW91c2VQb3MueSkgLSBNYXRoLmFicyh0aGlzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcy55KSk7XG5cdFx0dGhpcy5zcGVlZFggPSAoKDEgKyB0aGlzLm1vdXNlUG9zRGlmZlgpIC8gZHQpO1xuXHRcdHRoaXMuc3BlZWRZID0gKCgxICsgdGhpcy5tb3VzZVBvc0RpZmZZKSAvIGR0KTtcblx0XHR0aGlzLm9sZE5vcm1hbGl6ZWRNb3VzZVBvcyA9IHRoaXMubm9ybWFsaXplZE1vdXNlUG9zO1xuXHR9XG5cblx0b25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpIHtcblx0XHRjb25zdCBpbnRlcnNlY3RzID0gU2NlbmVVdGlscy5nZXRJbnRlcnNlY3RzRnJvbU1vdXNlUG9zKGV2ZW50LCB0aGlzLmdyYXBoQ29udGFpbmVyLCB0aGlzLnJheWNhc3Rlcixcblx0XHRcdHRoaXMubW91c2VWZWN0b3IsIHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyKTtcblx0XHRpZiAoaW50ZXJzZWN0cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHNlbGVjdGVkID0gaW50ZXJzZWN0c1swXS5vYmplY3Q7XG5cdFx0XHRpZiAoc2VsZWN0ZWQuaGFzT3duUHJvcGVydHkoJ2lzUmVsYXRlZEFydGlzdFNwaGVyZScpKSB7XG5cdFx0XHRcdHRoaXMuc3RhcnRSZWxhdGVkQXJ0aXN0U2VhcmNoKHNlbGVjdGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb21wb3NlU2NlbmUoYXJ0aXN0KSB7XG5cdFx0dGhpcy5tYWluQXJ0aXN0U3BoZXJlID0gU2NlbmVVdGlscy5jcmVhdGVNYWluQXJ0aXN0U3BoZXJlKGFydGlzdCk7XG5cdFx0dGhpcy5yZWxhdGVkQXJ0aXN0U3BoZXJlcyA9IFNjZW5lVXRpbHMuY3JlYXRlUmVsYXRlZFNwaGVyZXMoYXJ0aXN0LCB0aGlzLm1haW5BcnRpc3RTcGhlcmUpO1xuXHRcdFNjZW5lVXRpbHMuYXBwZW5kT2JqZWN0c1RvU2NlbmUodGhpcy5ncmFwaENvbnRhaW5lciwgdGhpcy5tYWluQXJ0aXN0U3BoZXJlLCB0aGlzLnJlbGF0ZWRBcnRpc3RTcGhlcmVzKTtcblx0fVxuXG5cdHN0YXJ0UmVsYXRlZEFydGlzdFNlYXJjaChzZWxlY3RlZFNwaGVyZSkge1xuXHRcdGNvbnN0IHRhcmdldCA9IHNlbGVjdGVkU3BoZXJlLnBvc2l0aW9uLmNsb25lKCk7XG5cdFx0dGhpcy5jbGVhckdyYXBoKCk7XG5cdFx0U2NlbmVVdGlscy5hcHBlbmRPYmplY3RzVG9TY2VuZSh0aGlzLmdyYXBoQ29udGFpbmVyLCBzZWxlY3RlZFNwaGVyZSk7XG5cdFx0dGhpcy5tb3Rpb25MYWIuYWRkSm9iKHtcblx0XHRcdGpvYlR5cGU6ICd0cmFuc2xhdGUnLFxuXHRcdFx0c3RhcnRQb2ludDogdGFyZ2V0LFxuXHRcdFx0ZW5kUG9pbnQ6IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCksXG5cdFx0XHRvYmplY3QzRDogc2VsZWN0ZWRTcGhlcmUsXG5cdFx0XHRkdXJhdGlvbjogMi4wLCAvLyBzZWNzXG5cdFx0XHRjYWxsYmFjazogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmNsZWFyR3JhcGgoKTtcblx0XHRcdFx0TXVzaWNEYXRhU2VydmljZS5nZXRNYWluQXJ0aXN0RGF0YShzZWxlY3RlZFNwaGVyZS5hcnRpc3RPYmoubmFtZSk7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZW5jb2RlVVJJQ29tcG9uZW50KHNlbGVjdGVkU3BoZXJlLmFydGlzdE9iai5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGNsZWFyR3JhcGgoKSB7XG5cdFx0Y29uc3Qgb2xkUGFyZW50ID0gdGhpcy5ncmFwaENvbnRhaW5lci5nZXRPYmplY3RCeU5hbWUoJ3BhcmVudCcpO1xuXHRcdGlmICghb2xkUGFyZW50KSB7XG5cdFx0XHR0aGlzLmdyYXBoQ29udGFpbmVyLnJlbW92ZShvbGRQYXJlbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUT0RPOiBvcHRpbWlzYXRpb24gLSBvbmx5IHVzZSB1cGRhdGVSb3RhdGlvbigpIGlmIHRoZSBtb3VzZSBpcyBkcmFnZ2luZyAvIHNwZWVkIGlzIGFib3ZlIGRlZmF1bHQgbWluaW11bVxuXHQgKiBSb3RhdGlvbiBvZiBjYW1lcmEgaXMgKmludmVyc2UqIG9mIG1vdXNlIG1vdmVtZW50IGRpcmVjdGlvblxuXHQgKi9cblx0dXBkYXRlUm90YXRpb24oKSB7XG5cdFx0bGV0IGNhbVF1YXRlcm5pb25VcGRhdGU7XG5cdFx0Y29uc3QgeU1vcmVUaGFuWE1vdXNlID0gdGhpcy5tb3VzZVBvc0RpZmZZID49IHRoaXMubW91c2VQb3NEaWZmWDtcblx0XHRjb25zdCB4TW9yZVRoYW5ZTW91c2UgPSAheU1vcmVUaGFuWE1vdXNlO1xuXHRcdGlmICh0aGlzLm1vdXNlUG9zWUluY3JlYXNlZCAmJiB5TW9yZVRoYW5YTW91c2UpIHtcblx0XHRcdHRoaXMuY2FtZXJhUm90YXRpb24ueCAtPSB0aGlzLnNwZWVkWDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIXRoaXMubW91c2VQb3NZSW5jcmVhc2VkICYmIHlNb3JlVGhhblhNb3VzZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFSb3RhdGlvbi54ICs9IHRoaXMuc3BlZWRYO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm1vdXNlUG9zWEluY3JlYXNlZCAmJiB4TW9yZVRoYW5ZTW91c2UpIHtcblx0XHRcdHRoaXMuY2FtZXJhUm90YXRpb24ueSArPSB0aGlzLnNwZWVkWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIXRoaXMubW91c2VQb3NYSW5jcmVhc2VkICYmIHhNb3JlVGhhbllNb3VzZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFSb3RhdGlvbi55IC09IHRoaXMuc3BlZWRZO1xuXHRcdH1cblx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlID0gU2NlbmVVdGlscy5yZW5vbXJhbGl6ZVF1YXRlcm5pb24odGhpcy5jYW1lcmEucXVhdGVybmlvbik7XG5cdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS5zZXRGcm9tRXVsZXIodGhpcy5jYW1lcmFSb3RhdGlvbik7XG5cblx0XHR0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoXG5cdFx0XHRjYW1RdWF0ZXJuaW9uVXBkYXRlLnggKiB0aGlzLmNhbWVyYURpc3RhbmNlLFxuXHRcdFx0Y2FtUXVhdGVybmlvblVwZGF0ZS55ICogdGhpcy5jYW1lcmFEaXN0YW5jZSxcblx0XHRcdGNhbVF1YXRlcm5pb25VcGRhdGUueiAqIHRoaXMuY2FtZXJhRGlzdGFuY2Vcblx0XHQpO1xuXHRcdHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLmNhbWVyYUxvb2tBdCk7XG5cdFx0Ly8gdXBkYXRlIHJvdGF0aW9uIG9mIHRleHQgYXR0YWNoZWQgb2JqZWN0cywgdG8gZm9yY2UgdGhlbSB0byBsb29rIGF0IGNhbWVyYVxuXHRcdC8vIHRoaXMgbWFrZXMgdGhlbSByZWFkYWJsZVxuXHRcdHRoaXMuZ3JhcGhDb250YWluZXIudHJhdmVyc2UoKG9iaikgPT4ge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnaXNUZXh0JykpIHtcblx0XHRcdFx0b2JqLmxvb2tBdCh0aGlzLmdyYXBoQ29udGFpbmVyLndvcmxkVG9Mb2NhbCh0aGlzLmNhbWVyYS5wb3NpdGlvbikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMucmVkdWNlU3BlZWQoMC4wMDA1KTtcblx0fVxuXG5cdHJlZHVjZVNwZWVkKGFtb3VudCkge1xuXHRcdGlmICh0aGlzLnNwZWVkWCA+IDAuMDA1KSB7XG5cdFx0XHR0aGlzLnNwZWVkWCAtPSBhbW91bnQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3BlZWRZID4gMC4wMDUpIHtcblx0XHRcdHRoaXMuc3BlZWRZIC09IGFtb3VudDtcblx0XHR9XG5cdH1cbn0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZWFyY2hDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2VhcmNoLWlucHV0LmNvbnRhaW5lclwiO1xuaW1wb3J0IFNwb3RpZnlQbGF5ZXJDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc3BvdGlmeS1wbGF5ZXIuY29udGFpbmVyXCI7XG5pbXBvcnQgU2NlbmVDb250YWluZXIgZnJvbSBcIi4uL2NvbnRhaW5lcnMvc2NlbmUuY29udGFpbmVyXCI7XG5pbXBvcnQgQXJ0aXN0TGlzdENvbnRhaW5lciBmcm9tIFwiLi4vY29udGFpbmVycy9hcnRpc3QtbGlzdC5jb250YWluZXJcIjtcbmltcG9ydCBBcnRpc3RJbmZvQ29udGFpbmVyIGZyb20gXCIuLi9jb250YWluZXJzL2FydGlzdC1pbmZvLmNvbnRhaW5lclwiO1xuXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8U2VhcmNoQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNjZW5lQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPFNwb3RpZnlQbGF5ZXJDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICA8QXJ0aXN0TGlzdENvbnRhaW5lciAvPlxuICAgICAgICAgICAgICAgIDxBcnRpc3RJbmZvQ29udGFpbmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7c3RvcmV9IGZyb20gJy4uL3N0YXRlL3N0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFydGlzdEluZm9Db21wb25lbnQoe2FydGlzdH0pIHtcblx0bGV0IGFydGlzdEluZm9NYXJrdXAgPSAnJztcblx0Y29uc3QgZ2VucmVzID0gYXJ0aXN0LmdlbnJlcy5tYXAoKGdlbnJlKSA9PiB7XG5cdFx0cmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cImFydGlzdC1nZW5yZVwiIGtleT17Z2VucmV9PntnZW5yZX08L3NwYW4+XG5cdH0pO1xuXHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0YXJ0aXN0SW5mb01hcmt1cCA9IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaW5mby1jb250YWluZXJcIj5cblx0XHRcdFx0PHVsPlxuXHRcdFx0XHRcdDxsaT5Qb3B1bGFyaXR5OiB7YXJ0aXN0LnBvcHVsYXJpdHl9PC9saT5cblx0XHRcdFx0XHQ8bGk+R2VucmVzOiB7Z2VucmVzfTwvbGk+XG5cdFx0XHRcdDwvdWw+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0cmV0dXJuIChcblx0XHQ8ZGl2PnthcnRpc3RJbmZvTWFya3VwfTwvZGl2PlxuXHQpXG59XG4iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3N0b3JlfSBmcm9tICcuLi9zdGF0ZS9zdG9yZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnRpc3RMaXN0Q29tcG9uZW50KHt2aXNpdGVkQXJ0aXN0c30pIHtcblx0bGV0IGFydGlzdHMgPSB2aXNpdGVkQXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4ge1xuXHRcdGxldCBocmVmID0gJy8/YXJ0aXN0PScgKyBhcnRpc3QubmFtZTtcblx0XHRsZXQgaW1nVXJsID0gYXJ0aXN0LmltYWdlcy5sZW5ndGggPyBhcnRpc3QuaW1hZ2VzW2FydGlzdC5pbWFnZXMubGVuZ3RoIC0gMV0udXJsIDogJyc7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYXJ0aXN0XCIga2V5PXthcnRpc3QuaWR9PlxuXHRcdFx0XHQ8YSBocmVmPXtocmVmfSBpZD17YXJ0aXN0LmlkfSBjbGFzc05hbWU9XCJuYXYtYXJ0aXN0LWxpbmtcIj5cblx0XHRcdFx0XHQ8aW1nIGNsYXNzTmFtZT1cInBpY3R1cmVcIiBzcmM9e2ltZ1VybH0gLz5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJuYW1lXCI+e2FydGlzdC5uYW1lfTwvc3Bhbj5cblx0XHRcdFx0PC9hPlxuXHRcdFx0PC9kaXY+XG5cdFx0KVxuXHR9KTtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cImFydGlzdC1uYXZpZ2F0aW9uXCI+XG5cdFx0XHR7YXJ0aXN0c31cblx0XHQ8L2Rpdj5cblx0KVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtTY2VuZVV0aWxzfSBmcm9tIFwiLi4vY2xhc3Nlcy9zY2VuZS11dGlscy5jbGFzc1wiO1xuaW1wb3J0IHtTcGhlcmVzU2NlbmV9IGZyb20gXCIuLi9jbGFzc2VzL3NwaGVyZXMtc2NlbmUuY2xhc3NcIjtcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmFydGlzdCA9IHN0b3JlLmdldFN0YXRlKCkuYXJ0aXN0O1xuXHRcdHRoaXMubW91c2VEb3duID0gZmFsc2U7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgeyBhcnRpc3QgfSA9IHRoaXMucHJvcHM7XG5cdFx0aWYgKGFydGlzdC5pZCkge1xuXHRcdFx0dGhpcy5zY2VuZS5jb21wb3NlU2NlbmUoYXJ0aXN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3BoZXJlcy1zY2VuZVwiXG5cdFx0XHRcdCByZWY9e2VsZW0gPT4gdGhpcy5zY2VuZURvbSA9IGVsZW19XG5cdFx0XHQvPlxuXHRcdClcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuc2NlbmUgPSBuZXcgU3BoZXJlc1NjZW5lKHRoaXMuc2NlbmVEb20pO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLCB0cnVlKTtcblx0XHR0aGlzLnNjZW5lRG9tLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMsIHRydWUpO1xuXHRcdHRoaXMuc2NlbmVEb20uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgdHJ1ZSk7XG5cdFx0dGhpcy5zY2VuZURvbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcywgdHJ1ZSk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMsIGZhbHNlKTtcblx0fVxuXG5cdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0dGhpc1tldmVudC50eXBlXShldmVudCk7XG5cdH1cblxuXHRjbGljayhldmVudCkge1xuXHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlQ2xpY2soZXZlbnQpXG5cdH1cblxuXHRtb3VzZW1vdmUoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5tb3VzZURvd24pIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlRHJhZyhldmVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2NlbmUub25TY2VuZU1vdXNlSG92ZXIoZXZlbnQpO1xuXHRcdH1cblx0fVxuXG5cdG1vdXNlZG93bigpIHtcblx0XHR0aGlzLnNjZW5lLm1vdXNlSXNEb3duID0gdHJ1ZTtcblx0fVxuXG5cdG1vdXNldXAoKSB7XG5cdFx0dGhpcy5zY2VuZS5tb3VzZUlzRG93biA9IGZhbHNlO1xuXHR9XG5cblx0bW91c2V3aGVlbChldmVudCkge1xuXHRcdHN3aXRjaCAoU2NlbmVVdGlscy5zaWduKGV2ZW50LndoZWVsRGVsdGFZKSkge1xuXHRcdFx0Y2FzZSAtMTpcblx0XHRcdFx0dGhpcy5zY2VuZS56b29tKCdvdXQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRoaXMuc2NlbmUuem9vbSgnaW4nKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmVzaXplKCkge1xuXHRcdHRoaXMuc2NlbmUuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdHRoaXMuc2NlbmUudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHRcdHRoaXMuc2NlbmUucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VhcmNoSW5wdXRDb21wb25lbnQoe3NlYXJjaFRlcm0sIGhhbmRsZVNlYXJjaCwgaGFuZGxlU2VhcmNoVGVybVVwZGF0ZX0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlYXJjaC1mb3JtLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiYXJ0aXN0LXNlYXJjaFwiIG9uU3VibWl0PXsoZXZ0KSA9PiBoYW5kbGVTZWFyY2goZXZ0LCBzZWFyY2hUZXJtKX0+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJzZWFyY2gtaW5wdXRcIiBwbGFjZWhvbGRlcj1cImUuZy4gSmltaSBIZW5kcml4XCIgdmFsdWU9e3NlYXJjaFRlcm19IG9uQ2hhbmdlPXtoYW5kbGVTZWFyY2hUZXJtVXBkYXRlfSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9eyhldnQpID0+IGhhbmRsZVNlYXJjaChldnQsIHNlYXJjaFRlcm0pfT5HbzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gU3BvdGlmeVBsYXllckNvbXBvbmVudCh7YXJ0aXN0fSkge1xuXHRjb25zdCBlbWJlZFVybCA9ICdodHRwczovL29wZW4uc3BvdGlmeS5jb20vZW1iZWQvYXJ0aXN0Lyc7XG5cdGNvbnN0IGFydGlzdEVtYmVkVXJsID0gYCR7ZW1iZWRVcmx9JHthcnRpc3QuaWR9YDtcblx0bGV0IGlGcmFtZU1hcmt1cCA9ICcnO1xuXHRpZiAoYXJ0aXN0LmlkKSB7XG5cdFx0aUZyYW1lTWFya3VwID0gKFxuXHRcdFx0PGRpdiBpZD1cInNwb3RpZnktcGxheWVyXCI+XG5cdFx0XHRcdDxpZnJhbWUgc3JjPXthcnRpc3RFbWJlZFVybH0gd2lkdGg9XCIzMDBcIiBoZWlnaHQ9XCI4MFwiIC8+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYWxidW0tbmF2XCI+XG5cdFx0XHRcdFx0PGEgaHJlZj1cIiNcIj5QcmV2PC9hPlxuXHRcdFx0XHRcdDxhIGhyZWY9XCIjXCI+TmV4dDwvYT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpXG5cdH1cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cInNwb3RpZnktcGxheWVyLWNvbnRhaW5lclwiPlxuXHRcdFx0e2lGcmFtZU1hcmt1cH1cblx0XHQ8L2Rpdj5cblx0KVxufSIsImV4cG9ydCBjb25zdCBDb2xvdXJzID0ge1xuXHRiYWNrZ3JvdW5kOiAweDAwMzM2Nixcblx0cmVsYXRlZEFydGlzdDogMHhjYzMzMDAsXG5cdHJlbGF0ZWRBcnRpc3RIb3ZlcjogMHg5OWNjOTksXG5cdHJlbGF0ZWRMaW5lSm9pbjogMHhmZmZmY2MsXG5cdG1haW5BcnRpc3Q6IDB4ZmZjYzAwLFxuXHR0ZXh0T3V0ZXI6IDB4ZmZmZmNjLFxuXHR0ZXh0SW5uZXI6IDB4MDAwMDMzXG59OyIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdEluZm9Db21wb25lbnR9IGZyb20gJy4uL2NvbXBvbmVudHMvYXJ0aXN0LWluZm8uY29tcG9uZW50JztcblxuY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0YXJ0aXN0OiBzdGF0ZS5hcnRpc3Rcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0SW5mb0NvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RJbmZvQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0SW5mb0NvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge0FydGlzdExpc3RDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2FydGlzdC1saXN0LmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHR2aXNpdGVkQXJ0aXN0czogc3RhdGUudmlzaXRlZEFydGlzdHNcblx0fVxufTtcblxuY29uc3QgQXJ0aXN0TGlzdENvbnRhaW5lciA9IGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzKShBcnRpc3RMaXN0Q29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0TGlzdENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1NjZW5lQ29tcG9uZW50fSBmcm9tICcuLi9jb21wb25lbnRzL3NjZW5lLmNvbXBvbmVudCc7XG5cbmNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGFydGlzdDogc3RhdGUuYXJ0aXN0XG5cdH1cbn07XG5cbmNvbnN0IFNjZW5lQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNjZW5lQ29tcG9uZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVDb250YWluZXI7XG4iLCJpbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgU2VhcmNoSW5wdXRDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL3NlYXJjaC1pbnB1dC5jb21wb25lbnQuanN4JztcbmltcG9ydCB7IE11c2ljRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9tdXNpYy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgdXBkYXRlU2VhcmNoVGVybSB9IGZyb20gJy4uL3N0YXRlL2FjdGlvbnMnO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRzZWFyY2hUZXJtOiBzdGF0ZS5zZWFyY2hUZXJtXG5cdH1cbn07XG5cbmNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhbmRsZVNlYXJjaDogKGV2dCwgc2VhcmNoVGVybSkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNdXNpY0RhdGFTZXJ2aWNlLmdldE1haW5BcnRpc3REYXRhKHNlYXJjaFRlcm0pO1xuXHRcdH0sXG5cdFx0aGFuZGxlU2VhcmNoVGVybVVwZGF0ZTogKGV2dCkgPT4ge1xuXHRcdFx0ZGlzcGF0Y2godXBkYXRlU2VhcmNoVGVybShldnQudGFyZ2V0LnZhbHVlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5jb25zdCBTZWFyY2hDb250YWluZXIgPSBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShTZWFyY2hJbnB1dENvbXBvbmVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaENvbnRhaW5lcjtcbiIsImltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1Nwb3RpZnlQbGF5ZXJDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL3Nwb3RpZnktcGxheWVyLmNvbXBvbmVudFwiO1xuXG5jb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRhcnRpc3Q6IHN0YXRlLmFydGlzdFxuXHR9XG59O1xuXG5jb25zdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyID0gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMpKFNwb3RpZnlQbGF5ZXJDb21wb25lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBTcG90aWZ5UGxheWVyQ29udGFpbmVyO1xuIiwiaW1wb3J0IHtzdG9yZX0gZnJvbSAnLi4vc3RhdGUvc3RvcmUnO1xuaW1wb3J0IHtzZWFyY2hEb25lfSBmcm9tIFwiLi4vc3RhdGUvYWN0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTXVzaWNEYXRhU2VydmljZSB7XG5cdHN0YXRpYyBnZXRNYWluQXJ0aXN0RGF0YShhcnRpc3ROYW1lKSB7XG5cdFx0bGV0IHNlYXJjaFVSTCA9ICcvYXBpL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFydGlzdE5hbWUpO1xuXHRcdHJldHVybiB3aW5kb3cuZmV0Y2goc2VhcmNoVVJMLCB7XG5cdFx0XHRjcmVkZW50aWFsczogXCJzYW1lLW9yaWdpblwiXG5cdFx0fSlcblx0XHQudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG5cdFx0LnRoZW4oKGpzb24pID0+IHtcblx0XHRcdHJldHVybiBzdG9yZS5kaXNwYXRjaChzZWFyY2hEb25lKGpzb24pKTtcblx0XHR9KTtcblx0fVxufSIsImV4cG9ydCBjb25zdCBBUlRJU1RfU0VBUkNIX0RPTkUgPSAnQVJUSVNUX1NFQVJDSF9ET05FJztcbmV4cG9ydCBjb25zdCBTRUFSQ0hfVEVSTV9VUERBVEUgPSAnU0VBUkNIX1RFUk1fVVBEQVRFJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaERvbmUoZGF0YSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IEFSVElTVF9TRUFSQ0hfRE9ORSxcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlYXJjaFRlcm0oc2VhcmNoVGVybSkge1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFNFQVJDSF9URVJNX1VQREFURSxcblx0XHRzZWFyY2hUZXJtOiBzZWFyY2hUZXJtXG5cdH1cbn0iLCJpbXBvcnQge1NFQVJDSF9URVJNX1VQREFURSwgQVJUSVNUX1NFQVJDSF9ET05FfSBmcm9tICcuLi9hY3Rpb25zJ1xuXG5jb25zdCBpbml0aWFsU3RhdGUgPSB7XG5cdGFydGlzdDoge1xuXHRcdGlkOiAnJyxcblx0XHRuYW1lOiAnJyxcblx0XHRpbWdVcmw6ICcnLFxuXHRcdGdlbnJlczogW10sXG5cdFx0cG9wdWxhcml0eTogMCxcblx0XHRpbWFnZXM6IFtdXG5cdH0sXG5cdHNlYXJjaFRlcm06ICcnLFxuXHR2aXNpdGVkQXJ0aXN0czogW11cbn07XG5cbmNvbnN0IGFydGlzdFNlYXJjaCA9IChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSA9PiB7XG5cdHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblx0XHRjYXNlIFNFQVJDSF9URVJNX1VQREFURTpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRzZWFyY2hUZXJtOiBhY3Rpb24uc2VhcmNoVGVybSxcblx0XHRcdH07XG5cdFx0Y2FzZSBBUlRJU1RfU0VBUkNIX0RPTkU6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5zdGF0ZSxcblx0XHRcdFx0YXJ0aXN0OiBhY3Rpb24uZGF0YSxcblx0XHRcdFx0dmlzaXRlZEFydGlzdHM6IFtcblx0XHRcdFx0XHQuLi5zdGF0ZS52aXNpdGVkQXJ0aXN0cyxcblx0XHRcdFx0XHRhY3Rpb24uZGF0YVxuXHRcdFx0XHRdXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFydGlzdFNlYXJjaDsiLCJpbXBvcnQge2NyZWF0ZVN0b3JlfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgYXJ0aXN0U2VhcmNoIGZyb20gXCIuL3JlZHVjZXJzL2FydGlzdC1zZWFyY2hcIjtcblxuZXhwb3J0IGxldCBzdG9yZSA9IGNyZWF0ZVN0b3JlKFxuXHRhcnRpc3RTZWFyY2gsXG5cdHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fICYmIHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fKClcbik7XG5cblxuIl19
