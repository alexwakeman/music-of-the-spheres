/**
 * MotionLab deals with controlling each tick of the animation frame sequence
 * It's aim is to isolate code that happens over a number of frames (i.e. motion)
 */
import {Props, TEXT_GEOMETRY} from './props';
import {SceneUtils} from "./scene-utils.class";
import * as THREE from "three";

const TRACK_CAM_TO_OBJ = 'TRACK_CAM_TO_OBJ';
const DEFAULT = 'DEFAULT';
const defaultJob = {
	type: DEFAULT
};

export class MotionLab {
    constructor() {
		this.job = defaultJob;
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
				this.translateTransitionObject();
				break;
			case DEFAULT:
				this.updateRotation();
				break;
		}
	}

	translateTransitionObject() {
		const shouldEnd = parseInt(this.job.currentTime) === 1;
		if (!shouldEnd) {
			this.followPath();
		}
		else {
			this.endAnimation();
		}
	}

	followPath() {
		const p = this.job.path.getPoint(this.job.currentTime);
		this.job.object3D.position.copy(p);
		this.job.currentTime += 0.01;
	}

	endAnimation() {
		this.job.callback && this.job.callback();
		this.job = defaultJob;
	}

	trackObjectToCamera(object3D, callback) {
    	this.job = {};
    	this.job.type = TRACK_CAM_TO_OBJ;
		this.job.t = 0.0;
		this.job.currentTime = 0.0;
		this.job.callback = callback;
		this.job.object3D = object3D;
		this.job.ended = false;
		this.job.path = new THREE.CatmullRomCurve3([
			object3D.position.clone(),
			Props.camera.position.clone()
		]);
	}

	/**
	 * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
	 * Rotation of camera is *inverse* of mouse movement direction
	 */
	updateRotation() {
		const camQuaternionUpdate = this.getNewCameraDirection();
		Props.camera.position.set(
			camQuaternionUpdate.x * Props.cameraDistance,
			camQuaternionUpdate.y * Props.cameraDistance,
			camQuaternionUpdate.z * Props.cameraDistance
		);
		Props.camera.lookAt(Props.cameraLookAt);
		// update rotation of text attached objects, to force them to look at camera
		// this makes them readable
		Props.graphContainer.traverse((obj) => {
			if (obj.type === TEXT_GEOMETRY) {
				let cameraNorm = Props.camera.position.clone().normalize();
				obj.position.set(
					cameraNorm.x * obj.parent.radius,
					cameraNorm.y * obj.parent.radius,
					cameraNorm.z * obj.parent.radius
				);
				obj.lookAt(Props.graphContainer.worldToLocal(Props.camera.position));
			}
		});
		this.reduceSpeed(0.0005);
	}

	getNewCameraDirection() {
		let camQuaternionUpdate;
		const yMoreThanXMouse = Props.mousePosDiffY >= Props.mousePosDiffX;
		const xMoreThanYMouse = !yMoreThanXMouse;
		if (Props.mousePosYIncreased && yMoreThanXMouse) {
			Props.cameraRotation.x -= Props.speedX;
		}
		else if (!Props.mousePosYIncreased && yMoreThanXMouse) {
			Props.cameraRotation.x += Props.speedX;
		}

		if (Props.mousePosXIncreased && xMoreThanYMouse) {
			Props.cameraRotation.y += Props.speedY;
		}
		else if (!Props.mousePosXIncreased && xMoreThanYMouse) {
			Props.cameraRotation.y -= Props.speedY;
		}
		camQuaternionUpdate = SceneUtils.renormalizeQuaternion(Props.camera);
		camQuaternionUpdate.setFromEuler(Props.cameraRotation);
		return camQuaternionUpdate;
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
