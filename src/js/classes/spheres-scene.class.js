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
import {
	MAIN_ARTIST_SPHERE, MAIN_ARTIST_TEXT, Props, RELATED_ARTIST_SPHERE, RELATED_ARTIST_TEXT,
	TEXT_GEOMETRY
} from './props';
import {store} from '../state/store';
import {hideRelated, relatedClick, showRelated} from "../state/actions";

export class SpheresScene {
	constructor(container) {
		let artistId;
		this.motionLab = new MotionLab();
		this.hoveredSphere = null;

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
		artistId = decodeURIComponent(window.location.hash.replace('#', ''));
		if (artistId) {
			MusicDataService.getArtist(artistId);
		}
	}

	composeScene(artist) {
		this.clearGraph();
		window.location.hash = encodeURIComponent(artist.id);
		Props.mainArtistSphere = SceneUtils.createMainArtistSphere(artist);
		Props.relatedArtistSpheres = SceneUtils.createRelatedSpheres(artist, Props.mainArtistSphere);
		Props.selectedArtistSphere = Props.mainArtistSphere;
		SceneUtils.appendObjectsToScene(Props.graphContainer, Props.mainArtistSphere, Props.relatedArtistSpheres);
	}

	onSceneMouseHover(event) {
		let selected;
		let intersects;
		let isOverRelated = false;
		Props.mouseVector = SceneUtils.getMouseVector(event);
		Props.mouseIsOverRelated = false;
		intersects = SceneUtils.getIntersectsFromMousePos();
		this.unhighlightRelatedSphere();
		if (intersects.length) {
			selected = intersects[0].object;
			switch (selected.type) {
				case RELATED_ARTIST_SPHERE:
					isOverRelated = true;
					this.hoveredSphere = selected;
					this.highlightRelatedSphere(Colours.relatedArtistHover);
					break;
				case RELATED_ARTIST_TEXT:
					isOverRelated = true;
					this.hoveredSphere = selected.parent;
					this.highlightRelatedSphere(Colours.relatedArtistHover);
					break;
				case MAIN_ARTIST_TEXT:
				case MAIN_ARTIST_SPHERE:
					isOverRelated = true;
					this.hoveredSphere = selected;
					this.highlightRelatedSphere(Colours.mainArtistHover);
					break;
			}
		}
		Props.oldMouseVector = Props.mouseVector;
		return isOverRelated;
	}

	unhighlightRelatedSphere() {
		if (!this.hoveredSphereIsSelected()) {
			switch (this.hoveredSphere.type) {
				case RELATED_ARTIST_SPHERE:
					this.hoveredSphere.material.color.setHex(Colours.relatedArtist);
					break;
				case MAIN_ARTIST_SPHERE:
					this.hoveredSphere.material.color.setHex(Colours.mainArtist);
					break;
			}

			this.hoveredSphere = null;
			if (Props.selectedArtistSphere.type !== RELATED_ARTIST_SPHERE) {
				// only dispatch related artist hide panel event for un-selected
				store.dispatch(hideRelated());
			}
		}
	}

	highlightRelatedSphere(colour) {
		if (!this.hoveredSphereIsSelected()) {
			this.hoveredSphere.material.color.setHex(colour);
			if (Props.selectedArtistSphere.type !== RELATED_ARTIST_SPHERE) {
				store.dispatch(showRelated(this.hoveredSphere.artistObj));
			}
		}
	}

	hoveredSphereIsSelected() {
		return !(this.hoveredSphere && this.hoveredSphere.id !== Props.selectedArtistSphere.id);
	}

	onSceneMouseClick(event) {
		Props.mouseVector = SceneUtils.getMouseVector(event);
		let intersects = SceneUtils.getIntersectsFromMousePos();
		if (intersects.length) {
			const selected = intersects[0].object;
			if (Props.selectedArtistSphere && selected.id === Props.selectedArtistSphere.id) {
				return;
			}
			switch (selected.type) {
				case RELATED_ARTIST_SPHERE:
					this.resetClickedSphere();
					Props.selectedArtistSphere = selected;
					this.setupClickedSphere();
					break;
				case MAIN_ARTIST_SPHERE:
					this.resetClickedSphere();
					Props.selectedArtistSphere = selected;
					this.setupClickedSphere();
					break;
				case MAIN_ARTIST_TEXT:
				case RELATED_ARTIST_TEXT:
					this.resetClickedSphere();
					Props.selectedArtistSphere = selected.parent;
					this.setupClickedSphere();
					break;
			}
		} else {
			this.resetClickedSphere();
			store.dispatch(hideRelated());
		}
	}

	setupClickedSphere() {
		if (Props.selectedArtistSphere.type === MAIN_ARTIST_SPHERE) {
			store.dispatch(hideRelated());
			Props.selectedArtistSphere.material.color.setHex(Colours.mainArtist);
		} else {
			store.dispatch(showRelated(Props.selectedArtistSphere.artistObj));
			Props.selectedArtistSphere.material.color.setHex(Colours.relatedArtistClicked);
		}
		MusicDataService.fetchDisplayAlbums(Props.selectedArtistSphere.artistObj);
	}

	resetClickedSphere() {
		if (!Props.selectedArtistSphere.type) {
			return;
		}
		switch (Props.selectedArtistSphere.type) {
			case RELATED_ARTIST_SPHERE:
				Props.selectedArtistSphere.material.color.setHex(Colours.relatedArtist);
				break;
			case MAIN_ARTIST_SPHERE:
				Props.selectedArtistSphere.material.color.setHex(Colours.mainArtist);
				break;
		}
		Props.selectedArtistSphere = {id: 0};
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

	clearAddress() {
		window.location.hash = '';
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
