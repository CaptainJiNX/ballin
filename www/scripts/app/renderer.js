define(['threeCore', 'container'], function(THREE, container){
	container.innerHTML = '';
	var renderer = new THREE.WebGLRenderer({clearColor: 0x000000});
	renderer.sortObjects = true;
	renderer.autoClear = true;
	container.appendChild(renderer.domElement);

	var updateSize = function() {
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	window.addEventListener('resize', updateSize, false);
	updateSize();

	return renderer;
});