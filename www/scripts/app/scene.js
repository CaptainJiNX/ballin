define(['threeCore','physi'], function(THREE, Physijs) {

    Physijs.scripts.worker = '/scripts/lib/physijs_worker.js';
    Physijs.scripts.ammo = '/scripts/lib/ammo.js';

    var scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));

    return scene;
});
