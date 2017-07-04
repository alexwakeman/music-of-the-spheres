// Planet Echo Spot global - should be changed to users app
import {Spline} from "three";
var PES = PES || {};

// Designed to handle different common animation requirements (translation + transition/easing)

// pass an animation "job" to addJob(job) function, it will then
PES.MotionLab = function() {
	
}

PES.MotionLab.prototype = {
	
	cachedJobs: [],
	hasJob: false,
	t1: 0.0, // previous frame tick
	t2: 0.0, // current frame tick
	tDiff: 0.0,
	object: null,
	jobsCount: 0,
	
	translateTime: 0.0,
	
	startPoint: null, // vector of objects start position
	
	job : { 
		jobTypeFunc: 'noop'
	}, // assigned by controller code
	
	noop: function() {
		PES.View.updateRotation();
	},
	
	processAnimation: function(t2) {
		var that = this;
		that.t2 = t2;

		that[that.job.jobTypeFunc]();		
		
		that.t1 = that.t2;
	},
	
	translateTransitionObject: function() {
		var that = this;
		var isFinished = (that.job.currentTime >= 1.0);
		
		if (!isFinished) {
			that.followPath();
		}
		else {
			
			that.endAnimation();
			return;
		}
	},
	
	followPath: function() {
		this.job.path = new Spline([
			this.job.startPoint,
			PES.View.camera.position.clone()
		]);
		
		const p = this.job.path.getPoint(this.job.currentTime);
		this.job.object3D.position.copy(p);
		this.job.currentTime += 0.01;
		PES.View.updateRotation();
	},
		
	endAnimation: function() {
		// TODO: if theres an animation in the stack, play it
		this.job.jobTypeFunc = 'noop';
		this.job.callback();

	},
	
	appendTranslateJob: function(job) {
		var that = this;
		job.startTime = that.t2;
		job.t = 0.0;
		job.currentTime = 0.0;
		job.path = new THREE.Spline([
			job.startPoint,
			job.endPoint
        ]);
		
		job.lookPath = new THREE.Spline([
			job.startLookAt,
			job.endLookAt
		]);
		
		
		that.job = job;
		that.job.jobTypeFunc = 'translateTransitionObject'; // triggers the start of the animation
	},
	
	addJob: function(job) {
		var that = this;
		that.job = job;
		switch (that.job.jobType) {

			case 'translate':// requires a path and lookAt + object3D
				// TODO: validate job
				
				that.appendTranslateJob(job);
				break;
				
				
			default:
				return false;
		}
		return true;
	}
}