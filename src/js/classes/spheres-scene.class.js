import * as THREE from "three";
import {SceneUtils} from "./scene-utils.class";
import {Colours} from "../config/colours";
import MotionLab from "./motion-lab.class";
import {MusicDataService} from "../services/music-data.service";
import {Props} from './props';

/**
 * SpheresScene is designed to handle adding and removing entities from the scene,
 * and handling events.
 *
 * It aims to deal not with changes over time, only immediate changes in one frame.
 */
export class SpheresScene {
	constructor(container) {
		SceneUtils.init();
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
		const artistQuery = decodeURIComponent(window.location.hash.replace('#', ''));
		if (artistQuery) {
			MusicDataService.getMainArtistData(artistQuery);
		}
	}

	onSceneMouseHover(event) {
		let selected;
		const intersects = SceneUtils.getIntersectsFromMousePos(event, Props.graphContainer, Props.raycaster,
			Props.mouseVector, Props.camera, Props.renderer);
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
				selected.material.color.setHex(Colours.relatedArtistHover);
			}
		}
	}

	onSceneMouseDrag(event) {
		const dt = Props.t2 - Props.t1;
		Props.normalizedMousePos = new THREE.Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1);
		Props.mousePosXIncreased = (Props.normalizedMousePos.x > Props.oldNormalizedMousePos.x);
		Props.mousePosYIncreased = (Props.normalizedMousePos.y > Props.oldNormalizedMousePos.y);
		Props.mousePosDiffX = Math.abs(Math.abs(Props.normalizedMousePos.x) - Math.abs(Props.oldNormalizedMousePos.x));
		Props.mousePosDiffY = Math.abs(Math.abs(Props.normalizedMousePos.y) - Math.abs(Props.oldNormalizedMousePos.y));
		Props.speedX = ((1 + Props.mousePosDiffX) / dt);
		Props.speedY = ((1 + Props.mousePosDiffY) / dt);
		Props.oldNormalizedMousePos = Props.normalizedMousePos;
	}

	onSceneMouseClick(event) {
		const intersects = SceneUtils.getIntersectsFromMousePos(event, Props.graphContainer, Props.raycaster,
			Props.mouseVector, Props.camera, Props.renderer);
		if (intersects.length) {
			const selected = intersects[0].object;
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				this.startRelatedArtistSearch(selected);
			}
		}
	}

	composeScene(artist) {
		Props.mainArtistSphere = SceneUtils.createMainArtistSphere(artist);
		Props.relatedArtistSpheres = SceneUtils.createRelatedSpheres(artist, Props.mainArtistSphere);
		SceneUtils.appendObjectsToScene(Props.graphContainer, Props.mainArtistSphere, Props.relatedArtistSpheres);
	}

	startRelatedArtistSearch(selectedSphere) {
		this.clearGraph();
		SceneUtils.appendObjectsToScene(Props.graphContainer, selectedSphere);
		this.motionLab.trackObjectToCamera(selectedSphere, () => {
			this.clearGraph();
			MusicDataService.getMainArtistData(selectedSphere.artistObj.name);
			window.location.hash = encodeURIComponent(selectedSphere.artistObj.name);
		});
	}

	clearGraph() {
		const oldParent = Props.graphContainer.getObjectByName('parent');
		if (!oldParent) {
			Props.graphContainer.remove(oldParent);
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
}