/**
 * SpheresScene is designed to handle adding and removing entities from the scene,
 * and handling events.
 *
 * It aims to deal not with changes over time, only immediate changes in one frame.
 */
import {SceneUtils} from "./scene-utils.class";
import {Colours} from "../config/colours";
import {MotionLab} from "./motion-lab.class";
import {MusicDataService} from "../services/music-data.service";
import {Props} from './props';
import {store} from '../state/store';
import {relatedClick} from "../state/actions";

export class SpheresScene {
	constructor(container) {
		this.motionLab = new MotionLab();

		// attach to dom
		Props.renderer.setSize(window.innerWidth, window.innerHeight);
		Props.renderer.domElement.id = 'renderer';
		Props.container = container;
		Props.container.appendChild(Props.renderer.domElement);

		// init the scene
		Props.graphContainer.position.set(1, 5, 0);
		Props.scene.add(Props.graphContainer);
		Props.scene.add(Props.camera);
		Props.camera.position.set(0, 250, Props.cameraDistance);
		Props.camera.lookAt(Props.scene.position);
		SceneUtils.lighting(Props.scene);

		// check for query string
		const artistId = decodeURIComponent(window.location.hash.replace('#', ''));
		if (artistId) {
			MusicDataService.getArtist(artistId);
		}
	}

	composeScene(artist) {
		this.clearGraph();
		window.location.hash = encodeURIComponent(artist.id);
		Props.mainArtistSphere = SceneUtils.createMainArtistSphere(artist);
		Props.relatedArtistSpheres = SceneUtils.createRelatedSpheres(artist, Props.mainArtistSphere);
		SceneUtils.appendObjectsToScene(Props.graphContainer, Props.mainArtistSphere, Props.relatedArtistSpheres);
	}

	onSceneMouseHover(event) {
		let selected;
		let intersects;
		let isOverRelated = false;
		Props.mouseVector = SceneUtils.getMouseVector(event);
		intersects = SceneUtils.getIntersectsFromMousePos(Props.graphContainer, Props.raycaster, Props.camera);
		Props.mouseIsOverRelated = false;
		Props.graphContainer.traverse((obj) => {
			if (obj.hasOwnProperty('isRelatedArtistSphere')) { // reset the related sphere to red
				obj.material.color.setHex(Colours.relatedArtist);
			}
		});

		if (intersects.length) { // mouse is over a Mesh
			Props.mouseIsOverRelated = true;
			selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				isOverRelated = true;
				selected.material.color.setHex(Colours.relatedArtistHover);
			}
		}
		Props.oldMouseVector = Props.mouseVector;
		return isOverRelated;
	}

	onSceneMouseDrag(event) {
		const dt = Props.t2 - Props.t1;
		Props.mouseVector = SceneUtils.getMouseVector(event);
		Props.mousePosXIncreased = (Props.mouseVector.x > Props.oldMouseVector.x);
		Props.mousePosYIncreased = (Props.mouseVector.y > Props.oldMouseVector.y);
		Props.mousePosDiffX = Math.abs(Math.abs(Props.mouseVector.x) - Math.abs(Props.oldMouseVector.x));
		Props.mousePosDiffY = Math.abs(Math.abs(Props.mouseVector.y) - Math.abs(Props.oldMouseVector.y));
		Props.speedX = ((1 + Props.mousePosDiffX) / dt);
		Props.speedY = ((1 + Props.mousePosDiffY) / dt);
		Props.oldMouseVector = Props.mouseVector;
	}

	onSceneMouseClick(event) {
		Props.mouseVector = SceneUtils.getMouseVector(event);
		let intersects = SceneUtils.getIntersectsFromMousePos(Props.graphContainer, Props.raycaster, Props.camera);
		if (intersects.length) {
			const selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				store.dispatch(relatedClick());
				this.getRelatedArtist(selected);
			}
		}
	}

	getRelatedArtist(selectedSphere) {
		this.clearGraph();
		SceneUtils.appendObjectsToScene(Props.graphContainer, selectedSphere);
		this.motionLab.trackObjectToCamera(selectedSphere, () => {
			this.clearGraph();
			MusicDataService.getArtist(selectedSphere.artistObj.id);
		});
	}

	clearGraph() {
		const parent = Props.graphContainer.getObjectByName('parent');
		if (parent) {
			Props.graphContainer.remove(parent);
		}
	}

	zoom(direction) {
		switch (direction) {
			case 'in':
				Props.cameraDistance -= 35;
				break;
			case 'out':
				Props.cameraDistance += 35;
				break;
		}
	}

	updateCameraAspect() {
		Props.camera.aspect = window.innerWidth / window.innerHeight;
		Props.camera.updateProjectionMatrix();
		Props.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}