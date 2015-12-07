/**
 * TP three.js
 * Université Lille 1 - M2 IVI - RVI
 *
 * **/

window.addEventListener('load',main,false);

var renderer;
var canvas;
var camera;
var scene;

/* objet */
var box;

/* navigation */
var pitchIncUpdate, pitchDecUpdate, rollIncUpdate, rollDecUpdate, velocityIncUpdate, velocityDecUpdate=false;
var velocity;

/* evenement */
var mouseDown;
var mouseX;
var mouseY;
var isNewClick;
var offset;

function main(event) {
	init();
	loop();
}

function init() {
  /* mise en place de la scene */
	canvas = document.getElementById("webglCanvas");
  renderer = new THREE.WebGLRenderer({canvas : canvas});
  renderer.setClearColor(new THREE.Color(0xeeeeee),1.0); // couleur en héxa; alpha (opacité) = 1.0
  scene = new THREE.Scene();

  /* mise en place de la camera */
  camera = new THREE.PerspectiveCamera(45,1.0,0.1,1000);
  camera.position.z = 20;

  //Q1
  //addObject1();

  //Navigation
  addObject2();

  //ajout evenement
  velocity = 0.0;
  window.addEventListener("keyup",handleKeyUp,false);
  window.addEventListener("keydown",handleKeyDown,false);
  initEvent();

  //deplacement cube
  isNewClick = false;
  offset = new THREE.Vector3(0,0,0)
}

function addObject1() {
  /* ajout de la sphere */
  box = new THREE.Mesh(new THREE.BoxGeometry(1.0,1.0,1.0), // rayon, nombre de méridiens et parallèles
              new THREE.MeshLambertMaterial( { color : 0x00FF00})); // réflexion diffuse
  scene.add(box); // ajoute la sphère à la racine du graphe de scène
  box.translateOnAxis(new THREE.Vector3(1,0,0),0.5); // par exemple
  box.rotateOnAxis((new THREE.Vector3(0,1,0)).normalize(),0.6);

  /* ajout de la source de lumiere */
  var pointLight = new THREE.PointLight(0xFFFFFF); // couleur d'éclairement
  pointLight.position.z = 10; // pour la positionner
  scene.add(pointLight); // il faut l'ajouter à la scène (les light dérivent de Object3D).
}

function addObject2() {

  for(var i=0; i<1000; i++) {
    cube = new THREE.Mesh(new THREE.BoxGeometry(1.0,1.0,1.0), // rayon, nombre de méridiens et parallèles
                new THREE.MeshLambertMaterial( { color : Math.random()*0xFFFFFF})); // réflexion diffuse
    cube.position.set(Math.random()*40 - 20, Math.random()*40 - 20, Math.random()*40 - 20);
    scene.add(cube); // ajoute la sphère à la racine du graphe de scène
  }

  /* ajout de la source de lumiere */
  var pointLight = new THREE.PointLight(0xFFFFFF); // couleur d'éclairement
  pointLight.position.z = 10; // pour la positionner
  scene.add(pointLight); // il faut l'ajouter à la scène (les light dérivent de Object3D).
}

function updateData() {

  if (pitchIncUpdate) {
    camera.rotateOnAxis((new THREE.Vector3(-1,0,0)).normalize(), 0.01);
  }
  if (pitchDecUpdate) {
    camera.rotateOnAxis((new THREE.Vector3(1,0,0)).normalize(), 0.01);
  }
  if (rollIncUpdate) {
    camera.rotateOnAxis((new THREE.Vector3(0,0,1)).normalize(), 0.01);
  }
  if (rollDecUpdate) {
    camera.rotateOnAxis((new THREE.Vector3(0,0,-1)).normalize(), 0.01);
  }
  if (velocityDecUpdate) {
    velocity -= 0.001;
  }
  if (velocityIncUpdate) {
    velocity += 0.001;
  }
  camera.translateOnAxis(new THREE.Vector3(0,0,1), velocity);
}


function drawScene() {
  renderer.render(scene,camera);
}


function loop() {
	var raf=window.requestAnimationFrame || window.mozRequestAnimationFrame || webkitRequestAnimationFrame;
	drawScene();
	updateData();
	raf(loop);
}

function handleKeyUp(event) {
  switch (event.keyCode) {
    case 90 /* z */: pitchIncUpdate=false;break;
    case 83 /* s */: pitchDecUpdate=false;break;
    case 81 /* q */: rollIncUpdate=false;break;
    case 68 /* d */: rollDecUpdate=false;break;
    case 65 /* a */: velocityDecUpdate=false;break;
    case 69 /* e */: velocityIncUpdate=false;break;
  }
}

function handleKeyDown(event) {
  switch (event.keyCode) {
    case 90 /* z */: pitchIncUpdate=true;break;
    case 83 /* s */: pitchDecUpdate=true;break;
    case 81 /* q */: rollIncUpdate=true;break;
    case 68 /* d */: rollDecUpdate=true;break;
    case 65 /* a */: velocityDecUpdate=true;break;
    case 69 /* e */: velocityIncUpdate=true;break;
  }
}

function initEvent() {
  canvas.addEventListener("mousedown", handleMouseDown, false);
  canvas.addEventListener("mousemove", handleMouseMove, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);
  mouseDown = false;
	moveX=0.0;
	moveY=0.0;
}

function handleMouseDown(event) {

		mouseX = event.layerX - canvas.offsetLeft;
		mouseY = (canvas.height - 1.0) - (event.layerY - canvas.offsetTop);

    mouseDown = true;
    isNewClick = true;

}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {

    if(mouseDown) {
      mouseX = event.layerX - canvas.offsetLeft;
      mouseY = (canvas.height - 1.0) - (event.layerY - canvas.offsetTop);

		  posX = mouseX / canvas.width * 2 - 1;
		  posY = mouseY / canvas.height * 2 - 1;

			var ray = new THREE.Raycaster();
		  ray.setFromCamera(new THREE.Vector2(posX,posY),camera);
		  var arrayIntersect = ray.intersectObjects(scene.children);

		  if (arrayIntersect.length>0 && mouseDown) {
		    var first = arrayIntersect[0];

		    /* detection de l'intersection */
		    plane = new THREE.Plane(new THREE.Vector3(0,0,1), first.object.distance);
		    var intersect = ray.ray.intersectPlane(plane);

		    /* evite les decalage entre 2 click */
		    if(isNewClick) {
					//offset dans le repere monde
		      offset.x = first.point.x;// - first.object.position.x;
		      offset.y = first.point.y;// - first.object.position.y;
		      isNewClick = false;
		    }

		    /* application du delta parallelement à la camera */
		    //camera.worldToLocal(first.object.position);
		    first.object.position.x = intersect.x - offset.x;
		    first.object.position.y = intersect.y - offset.y;
		    //camera.localToWorld(first.object.position);

		  }
    }

}
