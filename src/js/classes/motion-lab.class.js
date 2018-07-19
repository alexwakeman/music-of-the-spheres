/**
 * MotionLab deals with controlling each tick of the animation frame sequence
 * It's aim is to isolate code that happens over a number of frames (i.e. motion)
 */
import {Props} from './props';
import {SceneUtils} from "./scene-utils.class";
import * as THREE from "three";

const TRACK_CAM_TO_OBJ = 'TRACK_CAM_TO_OBJ';
const GROW_OUT_RELATED = 'GROW_OUT_RELATED';
const MOVE_OLD_SCENE_OUT = 'MOVE_OLD_SCENE_OUT';
const DEFAULT = 'DEFAULT';
const DIRECTION_LEFT_OUT = 'DIRECTION_LEFT_OUT';
const DIRECTION_LEFT_IN = 'DIRECTION_LEFT_IN';
const DIRECTION_RIGHT_OUT = 'DIRECTION_RIGHT_OUT';
const DIRECTION_RIGHT_IN = 'DIRECTION_RIGHT_IN';

const nullJob = {
	type: null
};
const defaultJob = {
	type: DEFAULT
};

export class MotionLab {
    constructor() {
		this.job = nullJob;
		this.animate();
	}

	animate() {
		Props.t2 = Date.now();
		this.processScene();
		Props.renderer.render(Props.scene, Props.camera);
		window.requestAnimationFrame(() => {
			Props.t1 = Props.t2;
			this.animate.call(this);
		});
	}

	processScene() {
		switch (this.job.type) {
			case TRACK_CAM_TO_OBJ:
				this.processJob();
				break;
			case DEFAULT:
				this.updateRotation();
				break;
			case GROW_OUT_RELATED:
				this.processJob();
				break;
            case MOVE_OLD_SCENE_OUT:
                this.processJob();
                break;
			default:
				// null job (on init)
		}
	}

	processJob() {
		const shouldEnd = parseInt(this.job.currentTime) === 1;
		if (!shouldEnd) {
			this.job.function();
		}
		else {
			this.endAnimation();
		}
	}

	endAnimation() {
		this.job.callback && this.job.callback();
		this.job = defaultJob;
	}

	trackObjectToCamera(object3D, callback = () => {}) {
    	this.job = {};
    	this.job.type = TRACK_CAM_TO_OBJ;
		this.job.currentTime = 0.0;
		this.job.callback = callback;
		this.job.object3D = object3D;
		this.job.path = new THREE.CatmullRomCurve3([
			object3D.position.clone(),
			Props.camera.position.clone()
		]);
		this.job.function = this.followPath;
	}

	followPath() {
		const p = this.job.path.getPoint(this.job.currentTime);
		this.job.object3D.position.copy(p);
		this.job.currentTime += 0.01;
	}

	startGrowOut(related = [], callback = () => {}) {
    	this.job = {};
    	this.job.type = GROW_OUT_RELATED;
    	this.job.related = related;
		this.job.currentTime = 0.0;
		this.job.callback = callback;
		this.job.function = this.continueGrow.bind(this);
	}

	moveScene(direction = DIRECTION_OUT, callback = () => {}) {
        this.job = {};
        this.job.type = MOVE_OLD_SCENE_OUT;
        this.job.container = Props.graphContainer;
        this.job.currentTime = 0.0;
        this.job.outAmount = (window.innerWidth / 10);
        if (direction === DIRECTION_LEFT_OUT || direction === DIRECTION_RIGHT_IN) {
        	this.job.outAmount = -this.job.outAmount;
		}
        if (direction === DIRECTION_LEFT_IN || direction === DIRECTION_RIGHT_OUT) {
            this.job.outAmount = +this.job.outAmount;
        }
        this.job.callback = callback;
        this.job.function = this.processMoveOut.bind(this);
	}

	continueGrow() {
    	this.job.related.forEach((relatedSphere) => {
    		relatedSphere.position.copy(relatedSphere.target.clone().multiplyScalar(this.job.currentTime));
    		this.positionText(relatedSphere);
		});
        this.updateRotation();
		this.job.currentTime += 0.01;
	}

    processMoveOut() {
    	this.job.container.position.x += this.job.currentTime * this.job.outAmount;
        this.job.currentTime += 0.01;
        this.updateRotation();
	}

	updateRotation() {
		const artistPropsSetRotation = this.getNewArtistPropsRotation();
        Props.graphContainer.setRotationFromQuaternion(artistPropsSetRotation);
        Props.graphContainer.children.forEach((obj) => {
        	if (obj.textMesh) {
                this.positionText(obj);
            }
        });
		this.reduceSpeed(0.0005);
	}
	
	positionText(sphere) {
		let parentWorld = new THREE.Vector3();
		let diffV = new THREE.Vector3();
		let camPos = Props.camera.position.clone().normalize();
		let textMeshPos, radius, halfRadius;
		let box = new THREE.Box3().setFromObject(sphere.textMesh);
		let halfWidth = (box.max.x - box.min.x) / 2;
		textMeshPos = sphere.textMesh.position;
		radius = sphere.radius;
		halfRadius = radius / 2;
		diffV.setFromMatrixPosition(sphere.matrixWorld);
		diffV.normalize();
		diffV = camPos.clone().sub(diffV);
		diffV.multiplyScalar(halfRadius);
		parentWorld.setFromMatrixPosition(sphere.matrixWorld);
		textMeshPos.copy(parentWorld);
		textMeshPos.add(diffV);
		textMeshPos.setX(textMeshPos.x - halfWidth);
		textMeshPos.setZ(textMeshPos.z + 80);
	}

	getNewArtistPropsRotation() {
		let artistSceneQuaternionUpdate;
		const xMoreThanYMouse = Props.mousePosDiffX >= Props.mousePosDiffY;
		const yMoreThanXMouse = !xMoreThanYMouse;
		if (Props.mousePosYIncreased && yMoreThanXMouse) {
			Props.artistSceneRotation.x += Props.speedX;
		}
		else if (!Props.mousePosYIncreased && yMoreThanXMouse) {
			Props.artistSceneRotation.x -= Props.speedX;
		}

		if (Props.mousePosXIncreased && xMoreThanYMouse) {
			Props.artistSceneRotation.y -= Props.speedY;
		}
		else if (!Props.mousePosXIncreased && xMoreThanYMouse) {
			Props.artistSceneRotation.y += Props.speedY;
		}
		artistSceneQuaternionUpdate = SceneUtils.renormalizeQuaternion(Props.graphContainer);
		artistSceneQuaternionUpdate.setFromEuler(Props.artistSceneRotation);
		return artistSceneQuaternionUpdate;
	}

	reduceSpeed(amount) {
		if (Props.speedX > 0.005) {
			Props.speedX -= amount;
		}

		if (Props.speedY > 0.005) {
			Props.speedY -= amount;
		}
	}
}
