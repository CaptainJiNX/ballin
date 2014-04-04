require.config({
	baseUrl: 'scripts/app',
	shim: {
		'threeCore': { exports: 'THREE' },
		'physi': {
            exports: 'Physijs',
            deps: ['threeCore']
        }
	},
	paths: {
		threeCore: '../lib/three.min',
		physi: '../lib/physi'
	}
});

require(['app'], function(app) {
	app.init();
	app.animate();
});
