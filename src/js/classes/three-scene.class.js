import {Object3D, PerspectiveCamera, Projector, Scene, WebGLRenderer} from "three";
import TrigUtils from "./trig-utils.class";
import Colours from "../config/colours.class";

export default class ThreeScene {
    renderer;
    scene;
    camera;
    projector;
    graphContainer;
    container;
    cameraDistance = 3500;
    colours = new Colours();
	mouseIsOverRelated = false;

    constructor() {
		this.renderer = new WebGLRenderer({antialias: true, alpha: true});
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000);
		this.projector = new Projector();
		this.graphContainer = new Object3D();
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

	onSceneMouseMove(event) {
		const intersects = TrigUtils.getIntersectsFromMousePos(event, this.graphContainer, this.projector);
		let selected;
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

	startRelatedArtistSearch(selectedSphere) {
		const target = selectedSphere.position.clone();
		this.clearGraph();
		this.appendObjectsToScene(selectedSphere);
		that.motionLab.addJob({
			jobType: 'translate',
			startPoint: target,
			endPoint: this.camera.position.clone(), // somehwere close to the clicked artist
			object3D: selectedSphere,
			duration: 2.0, // secs
			callback: function() {
				this.clearGraph();
				// TODO: trigger new search using selectedSphere.artistObj
			}
		});
		window.location.hash = encodeURIComponent(selectedSphere.artistObj.name);
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
}