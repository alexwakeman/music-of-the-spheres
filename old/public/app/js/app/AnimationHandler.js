// Planet Echo Spot global - should be changed to users app
var PES = PES || {};

// Designed to handle different common animation requirements (translation + transition/easing)
// Uses separate easing library (JQuery easing)

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
		var that = this;
		//that.tDiff = that.t2 - that.t1;
		
		//debugger;
		
		// t: current time, b: beginning value, c: change In value, d: duration
		//var easedPoint = Easing.easeInQuad(that.job.currentTime, that.job.startPoint.x, that.job.endPoint.x, that.job.duration) / (that.job.endPoint.length() - that.job.startPoint.length());

		
		that.job.path = new THREE.Spline([
			that.job.startPoint,
			PES.View.camera.position.clone()
		]);
		
		var p = that.job.path.getPoint(that.job.currentTime);
		//var l = that.job.lookPath.getPoint(that.job.currentTime);
		that.job.object3D.position.copy(p);
		
		that.job.currentTime += 0.01;
		PES.View.updateRotation();
        //that.job.object3D.lookAt(l);
		
	},
		
	endAnimation: function() {
		// TODO: if theres an animation in the stack, play it
		var that = this;
		that.job.jobTypeFunc = 'noop';
		that.job.callback();
		return;
		
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