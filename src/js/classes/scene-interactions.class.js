/**
 * SpheresScene is designed to handle adding and removing entities from the scene,
 * and handling events.
 *
 * It aims to deal not with changes over time, only immediate changes in one frame.
 */
import * as THREE from "three";
import {SceneUtils} from "./scene-utils.class";
import {MotionLab} from "./motion-lab.class";
import {MusicDataService} from "../services/music-data.service";
import {
    MAIN_ARTIST_SPHERE, MAIN_ARTIST_TEXT, Props, RELATED_ARTIST_SPHERE, RELATED_ARTIST_TEXT,
} from './props';
import {store} from '../state/store';
import {hideRelated, showRelated, showRelatedClick} from "../state/actions";

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
        Props.parent.add(Props.graphContainer);
        Props.parent.add(Props.textContainer);
        Props.parent.userData.graphContainer = Props.graphContainer;
        Props.parent.userData.textContainer = Props.textContainer;

        Props.scene.add(Props.camera);
        Props.scene.add(Props.parent);
        Props.camera.position.set(0, 250, Props.cameraDistance);
        Props.camera.lookAt(Props.scene.position);
        SceneUtils.lighting(Props.scene);

        // check for query string
        artistId = decodeURIComponent(window.location.hash.replace('#', ''));
        if (artistId) {
            MusicDataService.getArtist(artistId).then((artistObj) => {
                this.composeScene(artistObj.data);
            });
        }
    }

    composeScene(artist, relatedArtistSphere = null) {
        if (artist && artist.id) {
            window.location.hash = encodeURIComponent(artist.id);
            const mainArtist = SceneUtils.createMainArtistSphere(artist, relatedArtistSphere);
            const relatedArtists = SceneUtils.createRelatedSpheres(artist, mainArtist);
            SceneUtils.appendObjectsToScene(mainArtist, relatedArtists);
            this.motionLab.startGrowOut(relatedArtists, () => {
                this.motionLab.setDefaultJob();
            });
        }
    }

    onSceneMouseHover(event) {
        let selected;
        let intersects;
        let isOverRelated = false;
        Props.mouseVector = SceneUtils.getMouseVector(event);
        intersects = SceneUtils.getIntersectsFromMousePos();

        if (intersects.length) {
            selected = intersects[0].object;
            if (selected.id === this.hoveredSphere.id) {
                return true;
            }
            switch (selected.userData.type) {
                case MAIN_ARTIST_SPHERE:
                case RELATED_ARTIST_SPHERE:
                    this.unHighlightHoveredSphere();
                    this.hoveredSphere = selected;
                    this.highlightHoveredSphere();
                    isOverRelated = true;
                    break;
                case MAIN_ARTIST_TEXT:
                case RELATED_ARTIST_TEXT:
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
            this.hoveredSphere.material.color.setHex(this.hoveredSphere.userData.colours.default);
            this.hoveredSphere = {id: NaN};
            if (this.selectedSphere.id && this.selectedSphere.userData.type !== RELATED_ARTIST_SPHERE) {
                store.dispatch(hideRelated());
            }
        }
    }

    highlightHoveredSphere() {
        if (!this.hoveredSphereIsSelected()) {
            this.hoveredSphere.material.color.setHex(this.hoveredSphere.userData.colours.hover);
            if (this.selectedSphere.id && this.selectedSphere.userData.type !== RELATED_ARTIST_SPHERE) {
                store.dispatch(showRelated(this.hoveredSphere.userData.artistObj));
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
            switch (selected.userData.type) {
                case RELATED_ARTIST_SPHERE:
                    this.resetClickedSphere();
                    this.selectedSphere = selected;
                    this.setupClickedSphere();
                    store.dispatch(showRelatedClick(this.selectedSphere.userData.artistObj));
                    break;
                case RELATED_ARTIST_TEXT:
                    this.resetClickedSphere();
                    this.selectedSphere = selected.userData.parentSphere;
                    this.setupClickedSphere();
                    store.dispatch(showRelatedClick(this.selectedSphere.userData.artistObj));
                    break;
                case MAIN_ARTIST_SPHERE:
                    this.resetClickedSphere();
                    this.selectedSphere = selected;
                    this.setupClickedSphere();
                    store.dispatch(hideRelated());
                    break;
                case MAIN_ARTIST_TEXT:
                    this.resetClickedSphere();
                    this.selectedSphere = selected.userData.parentSphere;
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
        this.selectedSphere.material.color.setHex(this.selectedSphere.userData.colours.selected);
    }

    resetClickedSphere() {
        if (!this.selectedSphere.id) {
            return;
        }
        this.selectedSphere.material.color.setHex(this.selectedSphere.userData.colours.default);
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
        this.addSceneToBackList();
        this.motionLab.moveScene('DIRECTION_LEFT_OUT', () => {
            this.motionLab.setDefaultJob();
            MusicDataService.getArtist(this.selectedSphere.userData.artistObj.id)
                .then((artistObj) => {
                    let clonedExploredSphere = this.selectedSphere;
                    this.clearGraph();
                    this.composeScene(artistObj, clonedExploredSphere);
                    this.selectedSphere = {id: NaN};
                });
        });
    }

    navigateBack() {
        // remove from artist list too
        const backParent = Props.backNavList.pop();
        Props.forwardNavList.push(Props.parent);
        this.motionLab.moveScene('DIRECTION_RIGHT_OUT', () => {
            this.clearGraph();
            Props.parent = backParent;
            Props.scene.add(Props.parent);
            this.motionLab.moveScene('DIRECTION_LEFT_IN', () => {
                console.log('Move in done!');
                this.motionLab.setDefaultJob();
            });
        });
    }

    navigateBackFromList(artistId) {
        Props.forwardNavList = [];
        const backParent = Props.backNavList.find((parent) => {
            return parent.userData.graphContainer.userData.id === artistId;
        });
        this.motionLab.moveScene('DIRECTION_RIGHT_OUT', () => {
            this.clearGraph();
            Props.parent = backParent;
            Props.scene.add(Props.parent);
            this.motionLab.moveScene('DIRECTION_LEFT_IN', () => {
                console.log('Move in done!');
                this.motionLab.setDefaultJob();
            });
        });
    }

    addSceneToBackList() {
        Props.backNavList.push(Props.parent);
    }

    addSceneToForwardList() {
        Props.forwardNavList.push(Props.parent);
    }

    clearGraph() {
        Props.scene.remove(Props.parent);
        this.clearAddress();
        this.motionLab.setNullJob();
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
