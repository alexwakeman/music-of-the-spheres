import {Spline} from "three";
export default class MotionLab {
    constructor() { }

	init(renderer, scene, camera, defaultOp) {
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.defaultOp = defaultOp;
		this.t1 = 0.0; // previous frame tick
		this.t2 = 0.0; // current frame tick
		this.animate();
	}

	animate() {
		this.t1 = this.t2;
		this.t2 = performance.now();
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this.animate.bind(this));
	}

	addJob(job) {
		this.job = job;
		switch (this.job.jobType) {
			case 'translate':// requires a path and lookAt + object3D
				this.appendTranslateJob(job);
				break;
			case 'default':
				this.defaultOp();
		}
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
		this.job.jobTypeFunc = 'default';
		this.job.callback && this.job.callback();
	}

	appendTranslateJob(job) {
		job.startTime = this.t2;
		job.t = 0.0;
		job.currentTime = 0.0;
		job.path = new Spline([
			job.startPoint,
			job.endPoint
		]);
        this.job = job;
		this.job['translateTransitionObject']();
	}
}
