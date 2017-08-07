/**
 * SpheresScene is designed to handle adding and removing entities from the scene,
 * and handling events.
 *
 * It aims to deal not with changes over time, only immediate changes in one frame.
 */
import {SceneUtils} from "./scene-utils.class";
import {MotionLab} from "./motion-lab.class";
import {MusicDataService} from "../services/music-data.service";
import {
	MAIN_ARTIST_SPHERE, MAIN_ARTIST_TEXT, Props, RELATED_ARTIST_SPHERE, RELATED_ARTIST_TEXT,
	TEXT_GEOMETRY
} from './props';
import {store} from '../state/store';
import {hideRelated, relatedClick, showRelated} from "../state/actions";
import * as THREE from "three";

export class SpheresScene {
	constructor(container) {
		let artistId;
		this.motionLab = new MotionLab();
		this.hoveredSphere = {id: NaN}; // set to NaN as optimisation (NaN !== NaN) and simpler branching
		this.selectedSphere = {id: NaN};

		// attach to dom
		Props.renderer.setSize(window.innerWidth, window.innerHeight);
		Props.renderer.domElement.id = 'renderer';
		Props.container = container;
		Props.container.appendChild(Props.renderer.domElement);

		// init the scene
		Props.scene.add(Props.graphContainer);
		Props.scene.add(Props.camera);
		Props.camera.position.set(0, 250, Props.cameraDistance);
		Props.camera.lookAt(Props.scene.position);
		SceneUtils.lighting(Props.scene);
		Props.graphContainer.add(Props.parent);

		// check for query string
		artistId = decodeURIComponent(window.location.hash.replace('#', ''));
		if (artistId) {
			MusicDataService.getArtist(artistId);
		}
	}

	composeScene(artist, relatedArtistSphere = null) {
		window.location.hash = encodeURIComponent(artist.id);
		Props.mainArtistSphere = SceneUtils.createMainArtistSphere(artist, relatedArtistSphere);
		Props.relatedArtistSpheres = SceneUtils.createRelatedSpheres(artist, Props.mainArtistSphere);
		this.selectedSphere = Props.mainArtistSphere;
		SceneUtils.appendObjectsToScene(Props.mainArtistSphere, Props.relatedArtistSpheres);
	}

	onSceneMouseHover(event) {
		let selected;
		let intersects;
		let isOverRelated = false;
		Props.mouseVector = SceneUtils.getMouseVector(event);
		Props.mouseIsOverRelated = false;
		intersects = SceneUtils.getIntersectsFromMousePos();

		if (intersects.length) {
			selected = intersects[0].object;
			if (selected.id === this.hoveredSphere.id) {
				return;
			}
			switch (selected.type) {
				case MAIN_ARTIST_SPHERE:
				case RELATED_ARTIST_SPHERE:
					this.unHighlightHoveredSphere();
					this.hoveredSphere = selected;
					this.highlightHoveredSphere();
					isOverRelated = true;
					break;
				case MAIN_ARTIST_TEXT:
				case RELATED_ARTIST_TEXT:
					this.unHighlightHoveredSphere();
					this.hoveredSphere = selected.parent;
					this.highlightHoveredSphere();
					isOverRelated = true;
					break;
			}
		} else {
			this.unHighlightHoveredSphere();
		}
		Props.oldMouseVector = Props.mouseVector;
		return isOverRelated;
	}

	unHighlightHoveredSphere() {
		if (this.hoveredSphere.id && !this.hoveredSphereIsSelected()) {
			this.hoveredSphere.material.color.setHex(this.hoveredSphere.colours.default);
			this.hoveredSphere = {id: NaN};
			if (this.selectedSphere.type !== RELATED_ARTIST_SPHERE) {
				store.dispatch(hideRelated());
			}
		}
	}

	highlightHoveredSphere() {
		if (!this.hoveredSphereIsSelected()) {
			this.hoveredSphere.material.color.setHex(this.hoveredSphere.colours.hover);
			if (this.selectedSphere.type !== RELATED_ARTIST_SPHERE) {
				store.dispatch(showRelated(this.hoveredSphere.artistObj));
			}
		}
	}

	hoveredSphereIsSelected() {
		return this.hoveredSphere.id === this.selectedSphere.id;
	}

	onSceneMouseClick(event) {
		Props.mouseVector = SceneUtils.getMouseVector(event);
		let intersects = SceneUtils.getIntersectsFromMousePos();
		if (intersects.length) {
			const selected = intersects[0].object;
			if (this.selectedSphere && selected.id === this.selectedSphere.id) {
				return;
			}
			switch (selected.type) {
				case RELATED_ARTIST_SPHERE:
					this.resetClickedSphere();
					this.selectedSphere = selected;
					this.setupClickedSphere();
					store.dispatch(showRelated(this.selectedSphere.artistObj));
					break;
				case RELATED_ARTIST_TEXT:
					this.resetClickedSphere();
					this.selectedSphere = selected.parent;
					this.setupClickedSphere();
					store.dispatch(showRelated(this.selectedSphere.artistObj));
					break;
				case MAIN_ARTIST_SPHERE:
					this.resetClickedSphere();
					this.selectedSphere = selected;
					this.setupClickedSphere();
					store.dispatch(hideRelated());
					break;
				case MAIN_ARTIST_TEXT:
					this.resetClickedSphere();
					this.selectedSphere = selected.parent;
					this.setupClickedSphere();
					store.dispatch(hideRelated());
					break;
			}
		} else {
			this.resetClickedSphere();
			store.dispatch(hideRelated());
		}
	}

	setupClickedSphere() {
		this.selectedSphere.material.color.setHex(this.selectedSphere.colours.selected);
		MusicDataService.fetchDisplayAlbums(this.selectedSphere.artistObj);
	}

	resetClickedSphere() {
		if (!this.selectedSphere.id) {
			return;
		}
		this.selectedSphere.material.color.setHex(this.selectedSphere.colours.default);
		this.selectedSphere = {id: NaN};
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

	exploreSelectedArtist() {
		// remove the selectedSphere from the graph
		// replace it with duplicate as 'mainArtistSphere',
		// attach related artists to it (avoiding inverted direction norm)
		MusicDataService.getArtist(this.selectedSphere.artistObj.id)
			.then((artistObj) => {
				let clonedExploredSphere = this.selectedSphere.clone();
				delete Props.relatedArtistSpheres[this.selectedSphere.index];
				Props.parent.remove(this.selectedSphere);
				this.selectedSphere = {id: NaN};
				this.composeScene(artistObj, clonedExploredSphere);
			});
	}

	clearGraph() {
		Props.graphContainer.remove(Props.parent);
		Props.parent = new THREE.Object3D();
		Props.graphContainer.add(Props.parent);
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
