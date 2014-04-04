define(['threeCore'], function(THREE) {
	var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	//camera.position = new THREE.Vector3( 3.5, -100, 100 );
	//camera.lookAt(new THREE.Vector3(3.5, 0, -15));

	var updateSize = function() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	};

	window.addEventListener('resize', updateSize, false);
	updateSize();

	return camera;
});