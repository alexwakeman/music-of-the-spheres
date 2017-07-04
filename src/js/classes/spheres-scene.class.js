import * as THREE from "three";
import {SceneUtils} from "./scene-utils.class";
import {Colours} from "../config/colours";
import MotionLab from "./motion-lab.class";
import {MusicDataService} from "../services/music-data.service";

export class SpheresScene {
	normalizedMousePos;
	oldNormalizedMousePos;

	artist;
	mainArtistSphere;

	constructor(container) {
		const artistQuery = decodeURIComponent(window.location.hash.replace('#', ''));
		SceneUtils.init();
		this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000);
		this.graphContainer = new THREE.Object3D();
		this.motionLab = new MotionLab();
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

		SceneUtils.lighting(this.scene);
		this.motionLab.init(this.renderer, this.scene, this.camera, this.updateRotation, this);

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
		const intersects = SceneUtils.getIntersectsFromMousePos(event, this.graphContainer, this.raycaster,
			this.mouseVector, this.camera, this.renderer);
		this.mouseIsOverRelated = false;
		this.graphContainer.traverse((obj) => {
			if (obj.hasOwnProperty('isRelatedArtistSphere')) { // reset the related sphere to red
				obj.material.color.setHex(Colours.relatedArtist);
			}
		});

		if (intersects.length) { // mouse is over a Mesh
			this.mouseIsOverRelated = true;
			selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				selected.material.color.setHex(Colours.relatedArtistHover);
			}
		}
	}

	onSceneMouseDrag(event) {
		const dt = this.t2 - this.t1;
		this.normalizedMousePos = new THREE.Vector2(
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
		const intersects = SceneUtils.getIntersectsFromMousePos(event, this.graphContainer, this.raycaster,
			this.mouseVector, this.camera, this.renderer);
		if (intersects.length) {
			const selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				this.startRelatedArtistSearch(selected);
			}
		}
	}

	composeScene(artist) {
		this.mainArtistSphere = SceneUtils.createMainArtistSphere(artist);
		this.relatedArtistSpheres = SceneUtils.createRelatedSpheres(artist, this.mainArtistSphere);
		SceneUtils.appendObjectsToScene(this.graphContainer, this.mainArtistSphere, this.relatedArtistSpheres);
	}

	startRelatedArtistSearch(selectedSphere) {
		const target = selectedSphere.position.clone();
		this.clearGraph();
		SceneUtils.appendObjectsToScene(this.graphContainer, selectedSphere);
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
		camQuaternionUpdate = SceneUtils.renormalizeQuaternion(this.camera);
		camQuaternionUpdate.setFromEuler(this.cameraRotation);

		this.camera.position.set(
			camQuaternionUpdate.x * this.cameraDistance,
			camQuaternionUpdate.y * this.cameraDistance,
			camQuaternionUpdate.z * this.cameraDistance
		);
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
}