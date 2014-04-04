require.config({
	baseUrl: 'scripts/app',
	shim: {
		'threeCore': { exports: 'THREE' }
	},
	paths: {
		threeCore: '../lib/three.min'
	}
});

require(['app'], function(app) {
	app.init();
	app.animate();
});