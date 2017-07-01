let PES = PES || {};
// the aim is to separate functionality from the UI, and passing messages between the View and here, treating it much like a static lib,
// although it references the view as a dependency, this needs fixing
PES.Functionality = {

	relatedArtistsSphereArray : [],
	relatedArtists : [],
	mainArtistSphere : {},
	artist : {},
	albums : [],

	runSearch : function(artistName) {
		let that = PES.Functionality;
		//debugger;
		PES.api.getMainArtistData(artistName)
			.then((data) => {
				// create formatted object
				that.artist = data;

				// create three.js objects
				that.mainArtistSphere = that.createMainArtistSphere();
				that.relatedArtistsSphereArray = that.createRelatedSpheres();
				PES.View.prepDisplay(that.mainArtistSphere, that.relatedArtistsSphereArray);
			})
	},

	createMainArtistSphere : function() {
		let that = PES.Functionality;
		let radius = that.artist.popularity * 10;
		let size = radius * 2;
		let geometry = new THREE.SphereGeometry(size, 35, 35);
		let sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
			color: PES.Colors.mainArtist
		}));
		sphere.artistObj = that.artist;
		sphere.radius = radius;
		sphere.isMainArtistSphere = true;
		sphere.isSphere = true;

		that.addText(that.artist.name, 34, sphere);

		return sphere;
	},

	createRelatedSpheres : function() {
		// size == familiarity

		let that = PES.Functionality;
		let relatedArtistsSphereArray = [];
		let relatedArtistObj = null;
		let sphereFaceIndex = 0; // references a well spaced face of the main artist sphere

		that.artist.relatedArtistsCount = that.artist.related.length;
		that.artist.facesCount = that.mainArtistSphere.geometry.faces.length - 1;
		that.artist.step = that.artist.facesCount / that.artist.relatedArtistsCount - 5;
		that.artist.mainArtistRadius = that.getArtistObjRadius(that.artist);


		// get the relatedness in years to main artist and attach to object
		that.appendRelatedness();

		// get an object which contains the total years shared, the min and max, used to calc final distance
		let totalsObj = that.getRelatednessTotalsMinMax();
		let range = that.artist.yearsShared;
		let totalYearsShared = totalsObj.totalYearsShared;
		let unitLength = (totalYearsShared / range) || 1;

		that.artist.unitLength = unitLength;
		that.artist.range = range;


		for (let i = 0, len = that.artist.relatedArtistsCount; i < len; i++) {

			relatedArtistObj = that.relatedArtists[i];
			let radius = that.getArtistObjRadius(relatedArtistObj); // size of this sphere
			let size = radius * 2;
			let geometry = new THREE.SphereGeometry(size, 35, 35);
			let sphere = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {
				color: PES.Colors.relatedArtist
			}));
			relatedArtistObj.unitLength = unitLength;
			relatedArtistObj.range = range;
			sphere.artistObj = relatedArtistObj;
			sphere.radius = radius;
			sphere.isRelatedArtistSphere = true;
			sphere.isSphere = true;
			sphere.yearsShared = relatedArtistObj.yearsShared;

			// this calculation positions the related artist so that the more similar in years shared, the nearer it is to main artist
			// also sets a minium distance of 250
			sphere.distance = Math.min(250 + ((range * unitLength) - ((relatedArtistObj.yearsShared * unitLength))) * 10, 900);


			sphereFaceIndex += that.artist.step;

			// need to distribute related artists relative to a face of the main artist sphere
			that.positionRelatedArtist(sphere, sphereFaceIndex, totalYearsShared);

			// attach a line from related artist to main artist spheres
			that.joinRelatedArtistSphereToMain(sphere);


			that.addText(relatedArtistObj.name, 20, sphere);
			relatedArtistsSphereArray.push(sphere);
		}
		return relatedArtistsSphereArray;
	},

	positionRelatedArtist: function(sphere, sphereFaceIndex, totalYearsShared) {

		let that = PES.Functionality;
		let v = that.mainArtistSphere.geometry.faces[Math.round(sphereFaceIndex)].normal.clone();
		let pos = v.multiply(new THREE.Vector3(
			sphere.distance, // add main artist obj radius * 2 to ensure they don't overlap'
			sphere.distance,
			sphere.distance
			)
		);
		sphere.position = pos;
	},

	appendRelatedness: function() {

		let that = PES.Functionality;
		let relatedArtistObj = null;

		for (let i = 0, len = that.relatedArtists.length; i < len; i++) {

			relatedArtistObj = that.relatedArtists[i];

			relatedArtistObj.yearsShared = that.calcRelatedness(that.artist, relatedArtistObj);
		}

		// equivalent to getting number of years shared
		that.artist.yearsShared = that.calcRelatedness(that.artist, that.artist);
	},

	getRelatednessTotalsMinMax: function() {

		let that = PES.Functionality;
		let relatedArtistObj = null;
		let totalYearsShared = 0;
		let min = 0, max = 0;

		for (let i = 0, len = that.relatedArtists.length; i < len; i++) {

			relatedArtistObj = that.relatedArtists[i];

			totalYearsShared += relatedArtistObj.yearsShared;

			min = Math.min(min, relatedArtistObj.yearsShared);
			max = Math.max(max, relatedArtistObj.yearsShared);
		}

		return {
			totalYearsShared: totalYearsShared,
			min: min,
			max: max
		}
	},

	calcRelatedness : function(mainArtist, comparisonArtistObj) {

		let that = PES.Functionality;

		// iterate over years_shared array
		let totalYearsShared = 0,
			yearsA = (mainArtist.hasOwnProperty('years_active') && mainArtist.years_active.length > 0) ? mainArtist.years_active : null,
			yearsB = (comparisonArtistObj.hasOwnProperty('years_active') && comparisonArtistObj.years_active.length > 0) ? comparisonArtistObj.years_active : null,
			startA, endA,
			startB, endB,
			rangeA, rangeB,
			present = new Date().getFullYear();

		if (yearsA && yearsB) {

			for (let i = 0; i < yearsA.length; i++) {
				rangeA = yearsA[i];
				startA = rangeA.start;
				endA = rangeA.hasOwnProperty('end') ? rangeA.end : present

				for (let j = 0; j < yearsB.length; j++) {
					rangeB = yearsB[j];
					startB = rangeB.start;
					endB = rangeB.hasOwnProperty('end') ? rangeB.end : present;
					totalYearsShared += that.overlappingYears(startA, endA, startB, endB);
				}
			}
		}
		return totalYearsShared;
	},

	overlappingYears: function(startA, endA, startB, endB) {

		let yearsShared = 0;
		//debugger;
		if (startA <= endB && startB <= endA) { // check if comparison dates are within bounds of main

			if (startA >= startB && endA <= endB) { // A lies wholly within B
				yearsShared = endA - startA;
			}
			else if (startA >= startB && endA > endB) { // A lies wholly within B
				yearsShared = endB - startA;
			}
			else if (startB >= startA && endB <= endA) { // A starts after B
				yearsShared = endB - startB;
			}
			else if (startB > startA && endB > endA) { // A starts after B
				yearsShared = endA - startB;
			}
			else {
				yearsShared = endA - startB;
			}

		}

		return yearsShared;
	},

	joinRelatedArtistSphereToMain : function(sphere) {
		let material = new THREE.LineBasicMaterial({
			color: PES.Colors.relatedlineJoin
		});
		let geometry = new THREE.Geometry();
		geometry.vertices.push(PES.View.scene.position.clone());
		geometry.vertices.push(sphere.position.clone());

		let line = new THREE.Line(geometry, material);
		this.mainArtistSphere.add(line); // positioning is just easier if we attach to center sphere
	},

	renomralizeQuaternion: function(object3D) {
		let q = object3D.quaternion;
		let magnitude = Math.sqrt(Math.pow(q.w, 2) + Math.pow(q.x, 2) + Math.pow(q.y, 2) + Math.pow(q.z, 2));
		q.w /= magnitude;
		q.x /= magnitude;
		q.y /= magnitude;
		q.z /= magnitude;
	},

	addText : function(label, size, sphere) {
		// add 3D text
		let materialFront = new THREE.MeshBasicMaterial( {
			color: PES.Colors.textOuter
		} );
		let materialSide = new THREE.MeshBasicMaterial( {
			color: PES.Colors.textInner
		} );
		let materialArray = [ materialFront, materialSide ];
		let textGeom = new THREE.TextGeometry(label,
			{
				size: size,
				height: 4,
				curveSegments: 5,
				font: "helvetiker",
				weight: "bold",
				style: "normal",
				bevelThickness: 0.5,
				bevelSize: 1,
				bevelEnabled: true,
				material: 0,
				extrudeMaterial: 1
			});

		let textMaterial = new THREE.MeshFaceMaterial(materialArray);
		let textMesh = new THREE.Mesh(textGeom, textMaterial );

		textMesh.geometry.computeBoundingBox();
		textMesh.position.set(-size,  sphere.radius * 2 + 20, 0 );
		textMesh.isText = true; // identity property

		sphere.add(textMesh);
	},

	getDomCoordsToWorldVec3 : function(event) {
		let vector = new THREE.Vector3(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		PES.View.projector.unprojectVector( vector, PES.View.camera );

		let dir = vector.sub( PES.View.camera.position ).normalize();

		let distance = - PES.View.camera.position.z / dir.z;

		let pos = PES.View.camera.position.clone().add( dir.multiplyScalar( distance ) );

		return pos;
	},

	getIntersectsFromMousePos : function(event) {
		let objects = PES.View.getGraph();
		let intersects = [];
		if (objects) {

			let vector = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5);
			PES.View.projector.unprojectVector(vector, PES.View.camera);
			let raycaster = new THREE.Raycaster(PES.View.camera.position, vector.sub(PES.View.camera.position).normalize());
			intersects = raycaster.intersectObjects(objects.children, true);
		}

		return intersects;
	},

	getArtistObjRadius : function(artistObj) {
		return 70 * artistObj.familiarity;
	}
};