import {
	Euler, MeshLambertMaterial, Object3D, PerspectiveCamera, Projector, Scene, SphereGeometry, SpotLight, Vector2,
	Vector3, Geometry,
	WebGLRenderer, Mesh, MeshBasicMaterial, TextGeometry, MeshFaceMaterial, LineBasicMaterial, Line
} from "three";
import TrigUtils from "./trig-utils.class";
import Colours from "../config/colours.class";
import MotionLab from "./motion-lab.class";
import {MusicDataService} from "../services/music-data.service";

export default class ThreeScene {
	renderer = new WebGLRenderer({antialias: true, alpha: true});
	scene = new Scene();
	camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000);
	projector = new Projector();
	graphContainer = new Object3D();
	motionLab = new MotionLab();
	container;

	cameraRotation = new Euler(0, 0, 0);
	cameraLookAt = new Vector3(1, 1, 1);
	cameraDistance = 3500;

	colours = new Colours();

	t1 = 0.0; // old time
	t2 = 0.0; // now time

	speedX = 0.005;
	speedY = 0.005;
	mousePosDiffX = 0.0;
	mousePosDiffY = 0.0;
	mousePosXIncreased = false;
	mousePosYIncreased = false;
	mouseIsOverRelated = false;
	normalizedMousePos;
	oldNormalizedMousePos;
	mouseTimerInterval = 0; // reference for mouse not moving speed update interval

	artist;
	mainArtistSphere;
	relatedArtistSpheres = [];

	constructor(container) {
		const artistQuery = decodeURIComponent(window.location.hash.replace('#', ''));

		// attach to dom
		this.container = container;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.domElement.id = 'renderer';
		this.container.appendChild(this.renderer.domElement);

		this.graphContainer.position = new Vector3(1, 5, 0);
		this.scene.add(this.graphContainer);
		this.scene.add(this.camera);
		this.camera.position = new Vector3(0, 250, this.cameraDistance);
		this.camera.lookAt(this.scene.position);

		this.lighting();
		this.animate();

		// check for query string
		if (artistQuery) {
			MusicDataService.getMainArtistData(artistQuery);
		}
	}

	zoom(direction) {
		switch (direction) {
			case 'in':
				this.cameraDistance -= 35;
				break;
			case 'out':
				this.cameraDistance += 35;
				break;
		}
	}

	onSceneMouseHover(event) {
		let selected;
		const intersects = TrigUtils.getIntersectsFromMousePos(event, this.graphContainer, this.projector);
		this.mouseIsOverRelated = false;
		this.graphContainer.traverse((obj) => {
			if (obj.hasOwnProperty('isRelatedArtistSphere')) { // reset the related sphere to red
				obj.material.color.setHex(this.colours.relatedArtist);
			}
		});

		if (intersects.length > 0) { // mouse is over a Mesh
			this.mouseIsOverRelated = true;
			selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				selected.material.color.setHex(this.colours.relatedArtistHover);
			}
		}
	}

	onSceneMouseDrag(event) {
		const dt = this.t2 - this.t1;
		this.normalizedMousePos = new Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1);
		this.mousePosXIncreased = (this.normalizedMousePos.x > this.oldNormalizedMousePos.x);
		this.mousePosYIncreased = (this.normalizedMousePos.y > this.oldNormalizedMousePos.y);
		this.mousePosDiffX = Math.abs(Math.abs(this.normalizedMousePos.x) - Math.abs(this.oldNormalizedMousePos.x));
		this.mousePosDiffY = Math.abs(Math.abs(this.normalizedMousePos.y) - Math.abs(this.oldNormalizedMousePos.y));
		this.speedX = ((1 + this.mousePosDiffX) / dt);
		this.speedY = ((1 + this.mousePosDiffY) / dt);
		this.oldNormalizedMousePos = this.normalizedMousePos;
	}

	onSceneMouseClick(event) {
		const intersects = TrigUtils.getIntersectsFromMousePos(event, this.graphContainer, this.projector);
		this.mouseIsOverRelated = false;
		if (intersects.length > 0) {
			const selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				this.startRelatedArtistSearch(selected);
			}
		}
	}

	composeScene(artist) {
		this.mainArtistSphere = this.createMainArtistSphere(artist);
		this.relatedArtistSpheres = this.createRelatedSpheres(artist);
	}

	createMainArtistSphere(artist) {
		let radius = artist.popularity * 10;
		let size = radius * 2;
		let geometry = new SphereGeometry(size, 35, 35);
		let sphere = new Mesh(geometry, new MeshLambertMaterial({color: PES.Colors.mainArtist}));
		sphere.artistObj = artist;
		sphere.radius = radius;
		sphere.isMainArtistSphere = true;
		sphere.isSphere = true;
		TrigUtils.addText(artist.name, 34, sphere);
		return sphere;
	}

	// TODO: get stats for relatedness (genres union measure) - distance from main artist
	// TODO: clean up this code, remove the hard coded numbers
	createRelatedSpheres(artist) {
		let relatedArtistsSphereArray = [];
		let relatedArtistObj;
		let sphereFaceIndex = 0; // references a well spaced face of the main artist sphere
		let facesCount = this.mainArtistSphere.geometry.faces.length - 1;
		let step = facesCount / artist.related.length;

		for (let i = 0, len = artist.related.length; i < len; i++) {
			relatedArtistObj = artist.related[i];
			let radius = relatedArtistObj.followers; // size of this sphere
			let size = radius * 2;
			let geometry = new SphereGeometry(size, 35, 35);
			let sphere = new Mesh(geometry, new MeshLambertMaterial({color: Colours.relatedArtist}));
			relatedArtistObj.unitLength = 100;
			relatedArtistObj.range = 50;
			sphere.artistObj = relatedArtistObj;
			sphere.radius = radius;
			sphere.isRelatedArtistSphere = true;
			sphere.isSphere = true;
			sphere.yearsShared = relatedArtistObj.yearsShared;
			sphere.distance = 900; // will be union statistic
			sphereFaceIndex += step;
			TrigUtils.positionRelatedArtist(sphere, sphereFaceIndex);
			TrigUtils.joinRelatedArtistSphereToMain(sphere);
			TrigUtils.addText(relatedArtistObj.name, 20, sphere);
			relatedArtistsSphereArray.push(sphere);
		}
		return relatedArtistsSphereArray;
	}

	startRelatedArtistSearch(selectedSphere) {
		const target = selectedSphere.position.clone();
		this.clearGraph();
		this.appendObjectsToScene(selectedSphere);
		this.motionLab.addJob({
			jobType: 'translate',
			startPoint: target,
			endPoint: this.camera.position.clone(),
			object3D: selectedSphere,
			duration: 2.0, // secs
			callback: () => {
				this.clearGraph();
				MusicDataService.getMainArtistData(selectedSphere.artistObj.name);
				window.location.hash = encodeURIComponent(selectedSphere.artistObj.name);
			}
		});
	}

	clearGraph() {
		const oldParent = this.graphContainer.getObjectByName('parent');
		if (!oldParent) {
			this.graphContainer.remove(oldParent);
		}
	}

	appendObjectsToScene(artistSphere, relatedArtistsSphereArray) {
		const parent = new Object3D();
		parent.name = 'parent';
		parent.add(artistSphere);
		if (relatedArtistsSphereArray) {
			for (let i = 0; i < relatedArtistsSphereArray.length; i++) {
				parent.add(relatedArtistsSphereArray[i]);
			}
		}
		this.graphContainer.add(parent);
	}

	render() {
		this.t1 = this.t2;
		this.t2 = performance.now();

		///////// - critical section
		this.motionLab.processAnimation(this.t2);
		this.renderer.render(this.scene, this.camera);
		///////// - end critical section
	}

	animate() {
		window.requestAnimationFrame(this.animate);
		this.render();
	}

	/**
	 * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
	 * Rotation of camera is *inverse* of mouse movement direction
	 */
	updateRotation() {
		let camQuaternionUpdate;
		const yMoreThanXMouse = this.mousePosDiffY >= this.mousePosDiffX;
		const xMoreThanYMouse = !yMoreThanXMouse;
		if (this.mousePosYIncreased && yMoreThanXMouse) {
			this.cameraRotation.x -= this.speedX;
		}
		else if (!this.mousePosYIncreased && yMoreThanXMouse) {
			this.cameraRotation.x += this.speedX;
		}

		if (this.mousePosXIncreased && xMoreThanYMouse) {
			this.cameraRotation.y += this.speedY;
		}
		else if (!this.mousePosXIncreased && xMoreThanYMouse) {
			this.cameraRotation.y -= this.speedY;
		}
		camQuaternionUpdate = TrigUtils.renomralizeQuaternion(this.camera.quaternion);
		camQuaternionUpdate.setFromEuler(this.cameraRotation);

		this.camera.position = new Vector3(
			camQuaternionUpdate.x * this.cameraDistance,
			camQuaternionUpdate.y * this.cameraDistance,
			camQuaternionUpdate.z * this.cameraDistance);
		this.camera.lookAt(this.cameraLookAt);
		// update rotation of text attached objects, to force them to look at camera
		// this makes them readable
		this.graphContainer.traverse((obj) => {
			if (obj.hasOwnProperty('isText')) {
				obj.lookAt(this.graphContainer.worldToLocal(this.camera.position));
			}
		});

		this.reduceSpeed(0.0005);
	}

	reduceSpeed(amount) {
		if (this.speedX > 0.005) {
			this.speedX -= amount;
		}

		if (this.speedY > 0.005) {
			this.speedY -= amount;
		}
	}

	lighting() {
		let liA = new SpotLight(0x777777);
		liA.position.set(0, 0, 3000);
		this.scene.add(liA);

		liA = new SpotLight(0xEEEEEE);
		liA.position.set(0, 0, -3000);
		this.scene.add(liA);

		liA = new SpotLight(0x777777);
		liA.position.set(6000, 5000, -3000);
		this.scene.add(liA);

		liA = new SpotLight(0xEEEEEE);
		liA.position.set(-6000, -6500, 3000);
		this.scene.add(liA);

		liA = new SpotLight(0x777777);
		liA.position.set(0, 6500, 3000);
		this.scene.add(liA);
	}
}