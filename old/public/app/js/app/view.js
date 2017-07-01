var PES = PES || {};

PES.View = {
	container		  : null,
	renderer          : null,
    scene             : new THREE.Scene(),
    camera            : new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000),
	projector         : new THREE.Projector(),
	graphContainer    : new THREE.Object3D(),
	
	// 
	userInputElem     : $('#search-input'),
	player            : $('#spotify-player'),
	playerContainer   : $('#spotify-player-container'),
	artistNavigation  : $('.artist-navigation'),
	mainArtistInfoContainer  : $('.info-container.main-artist'),
	relatedArtistInfoContainer  : $('.info-container.related-artist'),

	mouseIsOverRelated: false, // true if mouse intersects a related artist sphere
	domOldMousePos    : null, // vec3 of previous mouse pos (mouse down)
	domCurrMousePos   : null, // vec3 of current mouse pos (mouse move)
	
	// maintain refs to spotify album list
	albumList         : [],
	albumIndex        : 0,
	
	cameraRotation    : new THREE.Euler(0, 0, 0),
	cameraLookAt      : new THREE.Vector3(1, 1, 1),
	cameraDistance    : 3900,
	
	t1                : 0.0,
	t2                : 0.0,
	diffX             : 0.0,
	diffY             : 0.0,
	speedX            : 0.005,
	speedY            : 0.005,
	xIsGreater        : false,
	yIsGreater        : false,
	mouseTimerInterval: 0, // reference for mouse not moving speed update interval

	motionLab: new PES.MotionLab(),
	selectedArtistSphere: null, // maintain reference to clicked related artist
	
	navigatedArtists: [],
	isNavigated: false,
	navIndex: 0,
	
	mainArtist: {}, // artist object for shared reference
	
	// TODO: 
	
	init : function() {
		
		this.container = document.getElementById('three-scene');
		this.graphContainer.position = new THREE.Vector3(1, 5, 0);
		this.scene.add(this.graphContainer);
		this.scene.add(this.camera);
		this.camera.position = new THREE.Vector3(0, 250, this.cameraDistance);
		this.camera.lookAt(this.scene.position);
		
		// start the renderer
		if (window.WebGLRenderingContext)
			this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
		
		// attach to dom
		this.renderer.domElement.id = 'renderer';
        this.container.appendChild(this.renderer.domElement);
		
		// add lights to scene
		this.lighting();
		
		// assign UI event callbacks
		this.assignEventHandlers();
		
		// begin render loop
		this.animate();
		
		// check for query string
		var artistQuery = this.getQueryVariable('artist');
		if (artistQuery) {
			PES.Functionality.runSearch(artistQuery);
		}
	},
	
	render : function() {
		this.t1 = this.t2;
		this.t2 = performance.now();
		
		///////// - critical section
		this.motionLab.processAnimation(this.t2);
		this.renderer.render(this.scene, this.camera);
		///////// - end critical section
	},
	
	animate : function() {
		var that = PES.View;
		window.requestAnimationFrame(that.animate);
		that.render();
	},
	
	startRelatedArtistSearch : function(selectedArtistSphere) {
		var that = PES.View;
		
		that.selectedArtistSphere = selectedArtistSphere;
		that.clearGraph();
		that.appendObjectsToScene(selectedArtistSphere);
		that.setSingleQueryVariable(selectedArtistSphere.artistObj.name);
		that.userInputElem.val(selectedArtistSphere.artistObj.name);
		that.mainArtistInfoContainer.hide();
		that.relatedArtistInfoContainer.hide();
		that.playerContainer.hide();
		
		var target = that.selectedArtistSphere.position.clone();
			
		that.motionLab.addJob({
			jobType: 'translate',
			startPoint: target,
			endPoint: that.camera.position.clone(), // somehwere close to the clicked artist

			object3D: that.selectedArtistSphere,
			duration: 2.0, // secs
			callback: function() {
				PES.View.clearGraph();
				
				PES.Functionality.runRelatedSearch(PES.View.selectedArtistSphere.artistObj);

			}
		});
		
	},
	
	startOver : function() {
		this.relatedArtists = [];
		this.albumList = [];
		this.albumIndex = 0;
	},
	
	showSpotifyAlbum : function(albumID) {
		$('#spotify-player-container').show();
		this.player.html('<iframe src="https://embed.spotify.com/?uri=' + albumID + '" width="300" height="80" frameborder="0" allowtransparency="true"></iframe>').show('fast');
	},
	
	prepDisplay: function(mainArtistSphere, relatedArtistsSphereArray) {
		var that = PES.View;
		// copy args to scope

		that.albumIndex = 0; // refresh current album index (Spotify player)
		
		if (!that.isNavigated) {
			that.appendArtistToNavigated(mainArtistSphere);
		}
		that.userInputElem.val(mainArtistSphere.artistObj.name);
		that.userInputElem.blur();
		that.isNavigated = false;
		that.appendObjectsToScene(mainArtistSphere, relatedArtistsSphereArray);
		that.relatedArtistInfoContainer.hide();
		that.mainArtist = mainArtistSphere.artistObj;
		that.appendMainArtistInfo(mainArtistSphere);
		that.setSingleQueryVariable(mainArtistSphere.artistObj.name);
	},
	
	appendObjectsToScene: function(mainArtistSphere, relatedArtistsSphereArray) {
		var that = PES.View;
		var parent = new THREE.Object3D();
		parent.name = 'parent';
		parent.add(mainArtistSphere);
		
		if (relatedArtistsSphereArray) {
			for (var i = 0; i < relatedArtistsSphereArray.length; i++) {
				parent.add(relatedArtistsSphereArray[i]);
			}
		}
		
		that.graphContainer.add(parent);
	},
	
	clearGraph: function() {
		var that = PES.View;
		var oldParent = that.graphContainer.getObjectByName('parent');
		if (oldParent != null) {
			that.graphContainer.remove(oldParent);
		}
	},
	
	updateRotation: function() {
		var that = PES.View;
		
		if (that.yIsGreater && that.diffY >= that.diffX) {

			that.cameraRotation.x -= that.speedX;
		}
		else if (!that.yIsGreater && that.diffY >= that.diffX) {

			that.cameraRotation.x += that.speedX;
		}

		if (that.xIsGreater && that.diffY <= that.diffX) {

			that.cameraRotation.y += that.speedY;
		}
		else if (!that.xIsGreater && that.diffY <= that.diffX) {

			that.cameraRotation.y -= that.speedY;
		}
		
		PES.Functionality.renomralizeQuaternion(that.camera);
		
		var camPosUpdate = that.camera.quaternion.clone();
		camPosUpdate.setFromEuler(that.cameraRotation);
		that.camera.position = new THREE.Vector3(camPosUpdate.x * that.cameraDistance, camPosUpdate.y * that.cameraDistance, camPosUpdate.z * that.cameraDistance)
		
		that.camera.lookAt(that.cameraLookAt);
		
		// update rortation of child objects to counter euler rortation of parent
		that.graphContainer.traverse(function(obj) {
				
			if (obj.hasOwnProperty('isText')) {
				obj.lookAt(that.graphContainer.worldToLocal(that.camera.position));

			}
		});
		
		that.reduceSpeed(0.0005);
	},
	
	reduceSpeed: function(amount) {
		var that = PES.View;
		if (that.speedX > 0.005) {
			that.speedX -= amount;
		} 
		
		if (that.speedY > 0.005) {
			that.speedY -= amount;
		} 
		
	},
	
	hoverRun: function(event) {
		event.preventDefault();
		
		var that = PES.View;
		that.onSceneMouseMove(event);
	},
	
	lighting: function() {
		// lighting
        var liA = new THREE.SpotLight(0x777777);
		liA.position.set(0, 0, 3000);
        this.scene.add(liA);
		
		liA = new THREE.SpotLight(0xEEEEEE);
		liA.position.set(0, 0, -3000);
        this.scene.add(liA);
		
		liA = new THREE.SpotLight(0x777777);
		liA.position.set(6000, 5000, -3000);
        this.scene.add(liA);
		
		liA = new THREE.SpotLight(0xEEEEEE);
		liA.position.set(-6000, -6500, 3000);
        this.scene.add(liA);
		
		liA = new THREE.SpotLight(0x777777);
		liA.position.set(0, 6500, 3000);
        this.scene.add(liA);
	},
	
	getGraph: function() {
		if (this.graphContainer.getObjectByName('parent')) {
			return this.graphContainer.getObjectByName('parent');
		}
	},
	
	
	
	appendArtistToNavigated: function(sphere) {
		
		var that = PES.View;
		var artistName = sphere.artistObj.name;
		var imgUrl = '';
		
		that.navIndex ++;
		
		sphere.artistObj.navIndex = that.navIndex;

		if (sphere.artistObj.hasOwnProperty('images') && sphere.artistObj.images.length > 0) {
			
			imgUrl = sphere.artistObj.images[0].url;
		}
		
		// format the artist markup template
		var artistTemplate = new String(PES.Templates.ArtistNavTemplate);
		artistTemplate = artistTemplate.replace('{{imgUrl}}', imgUrl);
		artistTemplate = artistTemplate.replace('{{name}}', artistName);
		artistTemplate = artistTemplate.replace('{{name}}', artistName);
		artistTemplate = artistTemplate.replace('{{id}}', sphere.artistObj.id);
		artistTemplate = artistTemplate.replace('{{navIndex}}', that.navIndex);
		that.artistNavigation.append(artistTemplate);
		
		// track all navigated artists at PES.View level
		that.navigatedArtists.push(sphere.artistObj);
		
		// scroll the artist nav div to the bottom
		var scrollHeight = Math.max(that.artistNavigation[0].scrollHeight, that.artistNavigation[0].clientHeight);
		that.artistNavigation[0].scrollTop = scrollHeight - that.artistNavigation[0].clientHeight;
	},
	
	clearNavigatedArtists: function() {
		
		var that = PES.View;
		that.navIndex = 0;
		that.artistNavigation.empty();
	},
	
	clickNavigatedArtist: function(event) {
		event.preventDefault();
		
		var that = PES.View;
		var clicked = $(event.currentTarget);
		
		var clickedNavArtistId = clicked.attr('id');
		var navIndex = clicked.data('navIndex');
		var navArtistArrayIndex = 0;
		
		// iterate over all previous artists, find inde of the one clicked
		that.navigatedArtists.forEach(function(obj, idx) {
			if (obj.id === clickedNavArtistId && obj.navIndex === navIndex) {
				that.isNavigated = true;
				navArtistArrayIndex = idx;
				that.clearGraph();
				PES.Functionality.runRelatedSearch(obj);
			}
		});
		
		// using the above index (navArtistArrayIndex), we now need to remove all navigated artists ahead of the clicked one
		that.navigatedArtists = that.navigatedArtists.slice(0, navArtistArrayIndex + 1);
		var name = that.navigatedArtists[navArtistArrayIndex].name;
		that.setSingleQueryVariable(name);
		
		var len = that.artistNavigation[0].children.length;
		for (var i = len - 1; i > navArtistArrayIndex; i--) {
			var elem = that.artistNavigation[0].children[i];
			elem.parentNode.removeChild(elem);
		}
	},
	
	
	// Note:- similarity is measured using a proportional measure of the number of years a related artist
	// was active at the same time as the main artist
	appendMainArtistInfo: function(sphere) {
		
		var that = PES.View;
		var artist = sphere.hasOwnProperty('artistObj') ? sphere.artistObj : {};
		
		var familiarity = '';
		var location = '';
		
		if (artist.artist_location) {
			if (artist.artist_location.hasOwnProperty('location')) {
				location = artist.artist_location.location;
			}
			else if (artist.artist_location.hasOwnProperty('country')) {
				location = artist.artist_location.country;
			}
		} else {
			location = 'Unknown';
		}
						
		var yearsActive = 'Unknown';

		// round off familiarity
		
		if (artist.hasOwnProperty('familiarity') && artist.familiarity > 0.0) {
			
			familiarity = (artist.familiarity * 100).toFixed(2) + '%';
		}
		
		
		if (artist.years_active.length > 0) {
			
			// reset string
			yearsActive = '';
			for (var i = 0; i < artist.years_active.length; i++) {

				var yearsObject = artist.years_active[i];

				if (yearsObject.hasOwnProperty('start') && yearsObject.hasOwnProperty('end')) {
					yearsActive += yearsObject.start + ' - ' + yearsObject.end + '  ';
				}

				if (yearsObject.hasOwnProperty('start') && !yearsObject.hasOwnProperty('end')) {
					yearsActive += yearsObject.start + ' - Present';
				}
			}
		}
		
			
		
		
		var artistTemplate = new String(PES.Templates.MainArtistInfoTemplate);
		
		artistTemplate = artistTemplate.replace('{{familiarity}}', familiarity);
		artistTemplate = artistTemplate.replace('{{yearsActive}}', yearsActive);
		artistTemplate = artistTemplate.replace('{{location}}', location);
		
		that.mainArtistInfoContainer.empty();
		that.mainArtistInfoContainer.append(artistTemplate);
		that.mainArtistInfoContainer.show();
	},
	
	
	appendRelatedArtistInfo: function(sphere) {
		var that = PES.View;
		var artist = sphere.hasOwnProperty('artistObj') ? sphere.artistObj : {};
		
		var name = '';
		var familiarity = '';
		var similarity = '100%';
		var location = '';
		
		if (artist.artist_location) {
			if (artist.artist_location.hasOwnProperty('location')) {
				location = artist.artist_location.location;
			}
			else if (artist.artist_location.hasOwnProperty('country')) {
				location = artist.artist_location.country;
			}
		} else {
			location = 'Unknown';
		}
						
		var yearsActive = 'Unknown';
		
		if (artist.hasOwnProperty('name')) {
			name = artist.name;
		}
		
		// round off familiarity
		
		if (artist.hasOwnProperty('familiarity') && artist.familiarity > 0.0) {
			
			familiarity = (artist.familiarity * 100).toFixed(2) + '%';
		}
		
		similarity = Math.min((artist.yearsShared / artist.range) * 100, 100).toFixed(2) + '%';

		
		if (artist.years_active.length === 0 || artist.yearsShared === 0) {
			
			similarity = 'Unknown';
		}
		
	
		if (artist.years_active.length > 0) {
			
			// reset string
			yearsActive = '';
			for (var i = 0; i < artist.years_active.length; i++) {

				var yearsObject = artist.years_active[i];

				if (yearsObject.hasOwnProperty('start') && yearsObject.hasOwnProperty('end')) {
					yearsActive += yearsObject.start + ' - ' + yearsObject.end + '  ';
				}

				if (yearsObject.hasOwnProperty('start') && !yearsObject.hasOwnProperty('end')) {
					yearsActive += yearsObject.start + ' - Present';
				}
			}
		}
			
		
		
		var artistTemplate = new String(PES.Templates.RelatedArtistInfoTemplate);
		
		artistTemplate = artistTemplate.replace('{{name}}', name);
		artistTemplate = artistTemplate.replace('{{mainArtistName}}', that.mainArtist.name);
		artistTemplate = artistTemplate.replace('{{familiarity}}', familiarity);
		artistTemplate = artistTemplate.replace('{{similarity}}', similarity);
		artistTemplate = artistTemplate.replace('{{yearsActive}}', yearsActive);
		artistTemplate = artistTemplate.replace('{{location}}', location);
		
		that.relatedArtistInfoContainer.empty();
		that.relatedArtistInfoContainer.append(artistTemplate);
		that.relatedArtistInfoContainer.show();
	},
	
	////////////
	// events //
	////////////
	
	assignEventHandlers : function() {
		
		var that = PES.View;
		
		$('#artist-search').on('submit', function(event) {
			event.preventDefault();
			that.onSearchInputSubmit();
		});
		
		$('#three-scene').on('click', that.onSceneMouseClick);
		
		$('#three-scene').on('mousemove', that.hoverRun);
		
		$('#three-scene').on('mousedown', function(event) {
			event.preventDefault();
			
			// rotation of graphContainer
			that.domOldMousePos = new THREE.Vector2(
				( event.clientX / window.innerWidth ) * 2 - 1,
				- ( event.clientY / window.innerHeight ) * 2 + 1);
			
			$('#three-scene').unbind('mousemove', that.hoverRun);
			$('#three-scene').on('mousemove', that.mouseDrag);
		});
		
		$('#three-scene').on('mouseup', function(event) {
			event.preventDefault();
			
			$('#three-scene').unbind('mousemove', that.mouseDrag);
			
			
			// re-init default events
			window.setTimeout(function() {
				$('#three-scene').on('mousemove', that.hoverRun);
				$('#three-scene').on('click', that.onSceneMouseClick);
			}, 500);
		});
		
		$(document).on('click', '.nav-artist-link', that.clickNavigatedArtist);
		
		$('.album-nav .prev').on('click', function(event) {
			that.getPrevAlbum();
		});
		$('.album-nav .next').on('click', function(event) {
			that.getNextAlbum();
		});
		
		document.getElementById('three-scene').addEventListener('mousewheel', function(event) { // not FF compat (?)
			
			// is wheelDeltaY positive or negative (up or down)?
			switch (Math.sign(event.wheelDeltaY)) {
				case -1: // mouse scroll down / zoom out 
					that.zoom('out');
					break;
				case 1: // mouse scroll up / zoom in 
					that.zoom('in');
					break;
				case 0:
					return false;
				default:
					
					break
			}
		}, true);
		
		window.addEventListener('resize', that.onWindowResize, false);
	},
	
	onWindowResize: function() {
		var that = PES.View;
		that.camera.aspect = window.innerWidth / window.innerHeight;
		that.camera.updateProjectionMatrix();

		that.renderer.setSize( window.innerWidth, window.innerHeight );
	},
	
	onSearchInputSubmit : function() {
		var that = PES.View;
		var artistNameSearch = that.getUserInput();
		that.searchUsingRelated = false;
		that.clearGraph();
		that.clearNavigatedArtists();
		that.mainArtistInfoContainer.hide();
		that.relatedArtistInfoContainer.hide();
		that.playerContainer.hide();
		PES.Functionality.runSearch(artistNameSearch);
	},
	
	onSceneMouseClick : function(event) {
		// pass selected sphere to handler
		event.preventDefault();
		var that = PES.View;
		var intersects = PES.Functionality.getIntersectsFromMousePos(event);
		that.mouseIsOverRelated = false;
		if (intersects.length > 0) {
			var selected = intersects[0].object;

			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				that.searchUsingRelated = true;
				that.startRelatedArtistSearch(selected);
			}
		}
	},
	
	onSceneMouseMove : function(event) {
		var that = PES.View;
		
		var intersects = PES.Functionality.getIntersectsFromMousePos(event);
		var selected;

		if (intersects.length > 0) { // mouse is over a Mesh

			selected = intersects[0].object;
			
			if (selected.hasOwnProperty('isRelatedArtistSphere')) {
				
				
				
				selected.material.color.setHex(PES.Colors.relatedArtistHover);
				$('#three-scene').css('cursor', 'pointer');
				that.appendRelatedArtistInfo(selected);
			}
		}
		else { // no mouse over mesh
			$('#three-scene').css('cursor', 'default');
			that.mouseIsOverRelated = false;
			
			that.graphContainer.traverse(function(obj) {
				if (obj.hasOwnProperty('isRelatedArtistSphere')) { // reset the related sphere to red
					obj.material.color.setHex(PES.Colors.relatedArtist);
				}
			});
		}
	},
	
	zoom : function(direction) {
		
		var that = PES.View;
		
		switch (direction) {
			case 'in':
				that.cameraDistance -= 35;
				break;
			case 'out':
				that.cameraDistance += 35;
				break;
		}
	},
	
	getUserInput : function() {
		return this.userInputElem.val();
	},
	
	getNextAlbum : function() {
		var that = PES.View;
		if (that.albumIndex < that.albumList.length - 1) {
			var nextAlbum = that.albumList[ ++ that.albumIndex];
			that.showSpotifyAlbum(nextAlbum.album.href);
		}
	},
	
	getPrevAlbum : function() {
		var that = PES.View;
		if (that.albumIndex > 0) {
			var nextAlbum = that.albumList[ -- that.albumIndex];
			that.showSpotifyAlbum(nextAlbum.album.href);
		}
	},

	mouseDrag: function(event) {
		var that = PES.View;
		var tDiff = 0.0;
		$('#three-scene').unbind('mousemove', that.hoverRun);			
		$('#three-scene').unbind('click', that.onSceneMouseClick);
		
		event.preventDefault();
		
		that.domCurrMousePos = new THREE.Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1);
				
		// ranges -1 to 1 for domCurrMousePos.x, y
		// find direction of drag to determine if rotation should be more x or y
		that.xIsGreater = (that.domCurrMousePos.x > that.domOldMousePos.x);
		that.yIsGreater = (that.domCurrMousePos.y > that.domOldMousePos.y);
		
		that.diffX = Math.abs(Math.abs(that.domCurrMousePos.x) - Math.abs(that.domOldMousePos.x));
		that.diffY = Math.abs(Math.abs(that.domCurrMousePos.y) - Math.abs(that.domOldMousePos.y));
		
		
		tDiff = that.t2 - that.t1;
		
		that.speedX = ((1 + that.diffX) / tDiff);
		that.speedY = ((1 + that.diffY) / tDiff);
		
		that.domOldMousePos = that.domCurrMousePos;
	},
	
	updateTimeSinceMouseDrag: function() {
		var that = PES.View;
		that.reduceSpeed(0.00025);
	},
	
	getQueryVariable: function (variable) {
		
		return decodeURIComponent(window.location.hash.replace('#', ''));
		
	},
	
	setSingleQueryVariable: function(value) {
		window.location.hash = encodeURIComponent(value);
	}
}