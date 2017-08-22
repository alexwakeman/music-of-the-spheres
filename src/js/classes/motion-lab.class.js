/**
 * MotionLab deals with controlling each tick of the animation frame sequence
 * It's aim is to isolate code that happens over a number of frames (i.e. motion)
 */
import {Props, MAIN_ARTIST_TEXT, RELATED_ARTIST_TEXT} from './props';
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
		});
		this.job.currentTime += 0.01;
	}



	/**
	 * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
	 * Rotation of camera is *inverse* of mouse movement direction
	 */
	updateRotation() {
		const artistPropsSetRotation = this.getNewArtistPropsRotation();
		let artistProps = Props.artistPropsSet[Props.sceneSetIndex].artistProps;
		artistProps.setRotationFromQuaternion(artistPropsSetRotation);
		let ray = new THREE.Ray(Props.camera.position);
		let worldPos2 = new THREE.Vector3();


		artistProps.traverse((obj) => {
			switch (obj.type) {
				case MAIN_ARTIST_TEXT:
				case RELATED_ARTIST_TEXT:
					worldPos2.setFromMatrixPosition(obj.parent.matrixWorld);
					ray.lookAt(worldPos2);
					let pos = ray.intersectSphere(obj.parent.geometry.boundingSphere);
					if (pos) {
						obj.position.copy(pos);
					}
					break;
			}
		});
		this.reduceSpeed(0.0005);
	}

	lookAt(textObject, artistProps) {
		let m1 = textObject.matrixWorld.clone();
		textObject.matrixAutoUpdate = false;
		m1.lookAt(textObject.localToWorld(textObject.position), Props.camera.position, THREE.Object3D.DefaultUp);
		textObject.quaternion.setFromRotationMatrix(m1);
		textObject.matrixWorld.makeRotationFromQuaternion(textObject.quaternion);
		textObject.matrixWorldNeedsUpdate = true;
		textObject.updateMatrixWorld();
	}

	getNewArtistPropsRotation() {
		let artistSceneQuaternionUpdate;
		const yMoreThanXMouse = Props.mousePosDiffY >= Props.mousePosDiffX;
		const xMoreThanYMouse = !yMoreThanXMouse;
		if (Props.mousePosYIncreased && yMoreThanXMouse) {
			Props.artistSceneRotation.x -= Props.speedX;
		}
		else if (!Props.mousePosYIncreased && yMoreThanXMouse) {
			Props.artistSceneRotation.x += Props.speedX;
		}

		if (Props.mousePosXIncreased && xMoreThanYMouse) {
			Props.artistSceneRotation.y += Props.speedY;
		}
		else if (!Props.mousePosXIncreased && xMoreThanYMouse) {
			Props.artistSceneRotation.y -= Props.speedY;
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
