define(['threeCore', 'clock', 'camera', 'renderer', 'scene'], function(THREE, clock, camera, renderer, scene)  {

	var Ground = function(){
		var segmentQueue = [];

		var currentSegment;

		var addSegment = function(parts){
			parts = parts || [0,0,0,0,0,0,0,0];
			var newSegment = [];
			
			for(var x = 0; x < parts.length; x++){
				if(parts[x] < 0) // Digging a hole
					continue;
				
				// 0 = normal ground, 1 = obstacle
				var pieceHeight = (parts[x] == 1 ? 1 : 0.1);
				
				var geometry = new THREE.CubeGeometry( 1, pieceHeight, 1 );
				var material = new THREE.MeshLambertMaterial( {color: getColor(x + currentSegment)} );
				var iceCube = new THREE.Mesh( geometry, material );
				iceCube.position = new THREE.Vector3( x, pieceHeight/2, -currentSegment );
				scene.add( iceCube );
				newSegment.push(iceCube);
			}

			segmentQueue.push(newSegment);
			currentSegment++;
		};

		var removeSegment = function(zValue) {
			var segmentToRemove = segmentQueue[0];
			// number of units between ball and screen, before removal
			var offset = 4;
			
			if (segmentToRemove[0].position.z-offset > zValue)
			{
				segmentQueue.shift();
				for(var i = 0; i < segmentToRemove.length; i++)
					scene.remove(segmentToRemove[i]);
			}
		};
		
		var getColor = function(blahonga) {
			return blahonga % 2 === 0 ? 0x8080ff : 0x0000ff;
		};

		var updateSegments = function(location) {
			// number of units from the ball and forward, until empty space
			var offset = 100;
			
			if (location.z-offset < -currentSegment)
				addSegment(generateSegment());
			removeSegment(location.z);
		};
		
		currentSegment = 0;
		
		return {
			addSegment: addSegment,
			updateSegments: updateSegments
		};
	};
	
	var BallMover = function(initialPosition) {
		var acceleration = new THREE.Vector3( 0, 0, 0 );
		var velocity = new THREE.Vector3( 0, 0, 0 );
		var maxVelocity = new THREE.Vector3( 9, 20, 15 );

		var location = initialPosition || new THREE.Vector3( 0, 0, 0 );
		var gravity = new THREE.Vector3( 0, -1, 0 );

		var update = function(delta) {
			addForce(gravity);

			velocity.add(acceleration);

			if(Math.abs(velocity.x) > maxVelocity.x) {
				if(velocity.x < 0) {
					velocity.x = -maxVelocity.x;
				} else {
					velocity.x = maxVelocity.x;
				}
			}
			if(Math.abs(velocity.y) > maxVelocity.y) {
				if(velocity.y < 0) {
					velocity.y = -maxVelocity.y;
				} else {
					velocity.y = maxVelocity.y;
				}
			}
			if(Math.abs(velocity.z) > maxVelocity.z) {
				if(velocity.z < 0) {
					velocity.z = -maxVelocity.z;
				} else {
					velocity.z = maxVelocity.z;
				}
			}

			acceleration.multiplyScalar(0);
			location.add(velocity.clone().multiplyScalar(delta));
				
			if(location.y < 0.3){
				location.y = 0.3;
			}			

			velocity.x *= 0.85;
			velocity.z *= 0.99;
		};

		var addForce = function(force) {			
			acceleration.add(force);
		};

		var getLocation = function() {
			return location;
		};

		var getVelocity = function() {
			return velocity;
		};

		return {
			update: update,
			addForce: addForce,
			getLocation: getLocation,
			getVelocity: getVelocity
		};
	};


	var Ball = function() {

		var geometry = new THREE.SphereGeometry( 0.3, 128, 128 );

		var texture = THREE.ImageUtils.loadTexture( "../gfx/ball.png" );
		texture.wrapT = THREE.RepeatWrapping; 
		texture.wrapS = THREE.RepeatWrapping;
		texture.repeat.set(2,2); 

		var material = new THREE.MeshPhongMaterial( {
					color: 0xFFFFFF,
					specular: 0x404040,
					map: texture

				} );


		var ball = new THREE.Mesh( geometry, material );
		var ballPosition = new THREE.Vector3( 3.5, 0.3, -1 );
		var mover = new BallMover(ballPosition);

		ball.position = mover.getLocation();

		scene.add( ball );

		return {
			mover: mover,
			mesh: ball
		};
	};

	var Lava = function() {

		var size = 200;

		var geometry = new THREE.PlaneGeometry(size,size);
		
		var texture = THREE.ImageUtils.loadTexture( "../gfx/lava.png" );
		texture.wrapT = THREE.RepeatWrapping; 
		texture.wrapS = THREE.RepeatWrapping;
		texture.repeat.set( size/2, size/2 ); 

		anim = new TextureAnimator( texture, 4, 1, 4, 150 ); // texture, #horiz, #vert, #total, duration.

		var material = new THREE.MeshPhongMaterial( {
			color: 0xFFFFFF,
			specular: 0x404040,
			map: texture
		} );

		var lava = new THREE.Mesh(geometry,material);
		lava.position = new THREE.Vector3( -0, -5, 0 );
        lava.rotation.x=-0.5*Math.PI; 

		var material2 = new THREE.MeshPhongMaterial( {
			color: 0xFFFFFF,
			specular: 0x404040,
			map: texture
		} );

		var lava2 = new THREE.Mesh(geometry,material2);
		lava2.position = new THREE.Vector3( -0, -5, -size );
        lava2.rotation.x=-0.5*Math.PI; 

		scene.add(lava);
		scene.add(lava2);

		return {
			update: function(delta) {

				anim.update(1000 * delta);

				var pos = camera.position.z;
				if(pos < lava.position.z - (size/2))
				{
					lava.position.z = lava2.position.z - size;
				}
				if(pos < lava2.position.z - (size/2))
				{
					lava2.position.z = lava.position.z - size;
				}
			}
		};
	};

	var SkyBox = function() {
		var imagePrefix = "../gfx/moondust-";
			var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
			var imageSuffix = ".png";
			var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );	

			var materialArray = [];
			for (var i = 0; i < 6; i++)
				materialArray.push( new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
					side: THREE.BackSide
				}));
			var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
			var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
			scene.add( skyBox );		
	};

	function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
	{
		this.tilesHorizontal = tilesHoriz;
		this.tilesVertical = tilesVert;
		this.numberOfTiles = numTiles;
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
		texture.repeat.set( 100, 100 );
		this.tileDisplayDuration = tileDispDuration;
		this.currentDisplayTime = 0;
		this.currentTile = 0;
		
		this.update = function( milliSec )
		{
			this.currentDisplayTime += milliSec;
			while (this.currentDisplayTime > this.tileDisplayDuration)
			{
				this.currentDisplayTime -= this.tileDisplayDuration;
				this.currentTile++;
				if (this.currentTile == this.numberOfTiles)
				{
					this.currentTile = 0;
				}
				var currentColumn = this.currentTile % this.tilesHorizontal;
				texture.offset.x = currentColumn / this.tilesHorizontal;
				var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
				texture.offset.y = currentRow / this.tilesVertical;
			}
		};
	}			

	var addAmbientLight = function() {
		var ambientLight = new THREE.AmbientLight(0x020202);
		scene.add(ambientLight);
	};

	var addFrontLight = function() {
		var frontLight = new THREE.DirectionalLight('white', 0.8);
		frontLight.position.set(8, 15, 10);
		scene.add(frontLight);
	};

	var addDefaultLights = function() {
		addAmbientLight();
		addFrontLight();
	};	

	var init = function() {
		addDefaultLights();

		var ground = new Ground();

		for (var i = 0; i < 100; i++) {
			ground.addSegment(generateSegment());
		}

		//var skybox = new SkyBox();
		var ball = new Ball();
		//ball.mover.addForce(new THREE.Vector3( 1, 0, -1 ));
		var lava = new Lava();
		var keyboardForce = new THREE.Vector3( 0,0,0);
		// Hook up kbd events.
		var applyKeyboardInputs = function(event) {
			event = event || window.event;
			event.preventDefault();

  			if(ball.mover.getLocation().y > 0.3) {
				return false;
			}

			switch (event.keyCode) {
				case 37: // Left
					keyboardForce = new THREE.Vector3( -7, 0, 0 );
					break;
				case 38: // Up
					keyboardForce = new THREE.Vector3( 0, 0, -0.5 );
					break;
				case 39: // Right
					keyboardForce = new THREE.Vector3( 7, 0, 0 );
					break;
				case 40: // Down
					keyboardForce = new THREE.Vector3( 0, 0, 0.1 );
					break;
				case 32: // Space
					keyboardForce = new THREE.Vector3( 0, 35, 0 );
			}
		};

		var clearKeyboardInput = function(event){
			event = event || window.event;
			event.preventDefault();
			keyboardForce = new THREE.Vector3( 0, 0, 0 );
		};

 		document.onkeydown = applyKeyboardInputs;
 		document.onkeyup = clearKeyboardInput;

		updateFunctions.push(function(){
			ball.mover.addForce( new THREE.Vector3( 0, 0, -0.5 ));
		});
		updateFunctions.push(function(){
			if(keyboardForce.length() > 0){
				ball.mover.addForce( keyboardForce.clone());
				keyboardForce.y = 0;

			}

		});

		updateFunctions.push(ball.mover.update);	
		updateFunctions.push(lava.update);

		updateFunctions.push(function(delta){
			var m = ball.mesh;
			var v = ball.mover.getVelocity();
			m.rotation.x += v.z * delta * 0.8;
		});

		var ballLocation = ball.mover.getLocation();

		updateFunctions.push(function(){
			ground.updateSegments(ballLocation.clone());
		});
		
		updateFunctions.push(function() {
			camera.lookAt(ballLocation.clone().add(new THREE.Vector3( 0, 0, -14 )));
			camera.position = ballLocation.clone().add(new THREE.Vector3( 0, 4, 10 ));
		});
	};

	var generateSegment = function() {
		var pieces = [0,0,0,0,0,0,0,0];
		for (var j = 0; j < 8; j++)
		{
			var piece = Math.floor((Math.random()*100)+1);
			if (piece < 5)
			{
				pieces[j] = -1;
			}
			else if (piece > 97)
			{
				pieces[j] = 1;
			}
		}

		return pieces;
	};

	var updateFunctions = [];

	var animate = function() {
		window.requestAnimationFrame(animate);
		var delta = clock.getDelta();

		updateFunctions.forEach(function(fn) {
			fn(delta);
		});

		renderer.render(scene, camera);
	};

	return {
		init: init,
		animate: animate
	};
});