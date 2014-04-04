define(['threeCore', 'clock', 'camera', 'renderer', 'scene'], function(THREE, clock, camera, renderer, scene)  {

	var Ground = function(){
		var currentSegment;

		var addSegment = function(parts){
			parts = parts || [0,0,0,0,0,0,0,0];

			for(var x = 0; x <parts.length; x++){
				var geometry = new THREE.CubeGeometry( 1, 0.1, 1 );
				var material = new THREE.MeshLambertMaterial( {color: getColor(x + currentSegment)} );
				var iceCube = new THREE.Mesh( geometry, material );
				iceCube.position = new THREE.Vector3( x, 0, -currentSegment );
				scene.add( iceCube );
			}

			currentSegment++;
		};

		var getColor = function(blahonga) {
			return blahonga % 2 === 0 ? 0x8080ff : 0x0000ff;
		};

		currentSegment = 0;
		
		return {
			addSegment: addSegment
		};
	};

	var Mover = function(initialPosition) {
		var acceleration = new THREE.Vector3( 0, 0, 0 );
		var velocity = new THREE.Vector3( 0, 0, 0 );
		var maxVelocity = 10;

		var location = initialPosition || new THREE.Vector3( 0, 0, 0 );

		var update = function(delta) {
			velocity.add(acceleration);

			if(velocity.length() > maxVelocity) {
				velocity.normalize();
				velocity.multiplyScalar(maxVelocity);	
			}

			acceleration.multiplyScalar(0);
			location.add(velocity.clone().multiplyScalar(delta));
			velocity.multiplyScalar(0.99);
		};

		var addForce = function(force) {
			acceleration.add(force);
		};

		var getLocation = function() {
			return location;
		};

		return {
			update: update,
			addForce: addForce,
			getLocation: getLocation
		};
	};


	var Ball = function() {
		var geometry = new THREE.SphereGeometry( 0.4, 32, 32 );
		var material = new THREE.MeshPhongMaterial( {
					color: 0xFFFFFF,
					specular: 0x404040
				} );
		var ball = new THREE.Mesh( geometry, material );
		var ballPosition = new THREE.Vector3( 3.5, 0.4, -1 );
		var mover = new Mover(ballPosition);

		ball.position = mover.getLocation();

		scene.add( ball );

		return {
			mover: mover
		};
	};

	var addAmbientLight = function() {
		var ambientLight = new THREE.AmbientLight(0x020202);
		scene.add(ambientLight);
	};

	var addFrontLight = function() {
		var frontLight = new THREE.DirectionalLight('white', 1);
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

		for (var i = 0; i < 35; i++) {
			ground.addSegment();
		}

		var ball = new Ball();
		ball.mover.addForce(new THREE.Vector3( 1, 0, -1 ));

		updateFunctions.push(function(delta){
			ball.mover.addForce(new THREE.Vector3( 0, 0, -1 ));
		});

		updateFunctions.push(ball.mover.update);
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