import {Spline} from "three";
export default class MotionLab {
    constructor() {

    }

    animationTick() {
        window.requestAnimationFrame(() => this.animationTick());
    }

	t1 = 0.0; // previous frame tick
	t2 = 0.0; // current frame tick
	object = null;
	startPoint = null; // vector of objects start position
	job = {
		jobTypeFunc: 'noop'
	};

	processAnimation(t2) {
		this.t2 = t2;
		this[this.job.jobTypeFunc]();
		this.t1 = this.t2;
	}

	translateTransitionObject() {
		const isFinished = this.job.currentTime >= 1.0;

		if (!isFinished) {
			this.followPath();
		}
		else {
			this.endAnimation();
		}
	}

	followPath() {
		// t: current time, b: beginning value, c: change In value, d: duration

		this.job.path = new Spline([
			this.job.startPoint,
			this.job.endPoint
		]);

		const p = this.job.path.getPoint(this.job.currentTime);
		this.job.object3D.position.copy(p);
		this.job.currentTime += 0.01;
		PES.View.updateRotation();
	}

	endAnimation() {
		this.job.jobTypeFunc = 'noop';
		this.job.callback();
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
		this.job.jobTypeFunc = 'translateTransitionObject'; // triggers the start of the animation
	}

	addJob(job) {
		this.job = job;
		switch (this.job.jobType) {
			case 'translate':// requires a path and lookAt + object3D
				this.appendTranslateJob(job);
				break;
			default:
				return false;
		}
	}
}
