import {Spline} from "three";
import {Props} from './props';
import {SceneUtils} from "./scene-utils.class";

const TRACK_CAM_TO_OBJ = 'TRACK_CAM_TO_OBJ';
const DEFAULT = 'DEFAULT';

/**
 * MotionLab deals with controlling each tick of the animation frame sequence
 * It's aim is to isolate code that happens over a number of frames (i.e. motion)
 */
export default class MotionLab {
    constructor() {
		this.t1 = 0.0; // previous frame tick
		this.t2 = 0.0; // current frame tick
		this.job = {
			type: DEFAULT
		};
		this.animate();
	}

	animate() {
		this.t1 = this.t2;
		this.t2 = performance.now();
		switch (this.job.type) {
			case TRACK_CAM_TO_OBJ:
				this.translateTransitionObject();
				break;
			case DEFAULT:
				this.updateRotation();
		}
		Props.renderer.render(Props.scene, Props.camera);
		window.requestAnimationFrame(this.animate.bind(this));
	}

	translateTransitionObject() {
		const isFinished = this.job.currentTime >= this.job.duration;
		if (!isFinished) {
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
		this.job.jobType = DEFAULT;
		this.job.callback && this.job.callback();
	}

	trackObjectToCamera(object3D, callback) {
    	this.job.type = TRACK_CAM_TO_OBJ;
		this.job.startTime = this.t2;
		this.job.t = 0.0;
		this.job.currentTime = 0.0;
		this.job.callback = callback;
		this.job.object3D = object3D;
		this.job.path = new Spline([
			object3D.position.clone(),
			this.spheresSceneInstance.camera.position.clone()
		]);
	}


	/**
	 * TODO: optimisation - only use updateRotation() if the mouse is dragging / speed is above default minimum
	 * Rotation of camera is *inverse* of mouse movement direction
	 */
	updateRotation() {
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

		Props.camera.position.set(
			camQuaternionUpdate.x * Props.cameraDistance,
			camQuaternionUpdate.y * Props.cameraDistance,
			camQuaternionUpdate.z * Props.cameraDistance
		);
		Props.camera.lookAt(Props.cameraLookAt);
		// update rotation of text attached objects, to force them to look at camera
		// this makes them readable
		Props.graphContainer.traverse((obj) => {
			if (obj.hasOwnProperty('isText')) {
				obj.lookAt(Props.graphContainer.worldToLocal(Props.camera.position));
			}
		});
		this.reduceSpeed(0.0005);
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
