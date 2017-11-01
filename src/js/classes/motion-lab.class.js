/**
 * MotionLab deals with controlling each tick of the animation frame sequence
 * It's aim is to isolate code that happens over a number of frames (i.e. motion)
 */
import {Props, MAIN_ARTIST_TEXT, RELATED_ARTIST_TEXT, RELATED_ARTIST_SPHERE} from './props';
import {SceneUtils} from "./scene-utils.class";
import * as THREE from "three";

const TRACK_CAM_TO_OBJ = 'TRACK_CAM_TO_OBJ';
const GROW_OUT_RELATED = 'GROW_OUT_RELATED';
const DEFAULT = 'DEFAULT';
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

	continueGrow() {
    	this.job.related.forEach((relatedSphere) => {
    		relatedSphere.position.copy(relatedSphere.target.clone().multiplyScalar(this.job.currentTime));
    		this.positionText(relatedSphere);
		});
		this.job.currentTime += 0.01;
	}

	updateRotation() {
		const artistPropsSetRotation = this.getNewArtistPropsRotation();
		let related = Props.artistPropsSet[Props.sceneSetIndex].relatedArtistSpheres;
		let main = Props.artistPropsSet[Props.sceneSetIndex].mainArtistSphere;
		let artistProps = Props.artistPropsSet[Props.sceneSetIndex].artistProps;
		artistProps.setRotationFromQuaternion(artistPropsSetRotation);
		related.forEach((obj) => this.positionText(obj));
		this.positionText(main);
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
		artistSceneQuaternionUpdate = SceneUtils.renormalizeQuaternion(Props.artistPropsSet[Props.sceneSetIndex].artistProps);
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
