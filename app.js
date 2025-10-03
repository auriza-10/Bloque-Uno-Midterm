///////// SCAFFOLD.
// 1. Importar librerías.
console.log(THREE);
console.log(gsap);

// 2. Configurar canvas.
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("rgba(0, 0, 0, 1)");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// 3.1 Configurar mesh.
const geo = new THREE.TorusGeometry(1.5, 0.5, 32, 100);

const material = new THREE.MeshStandardMaterial({
    color: "rgba(255, 255, 255, 1)",
});
const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
mesh.position.z = -7;

// 3.2 Crear luces.
const frontLight = new THREE.PointLight("rgba(223, 222, 222, 1)", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("rgba(0, 4, 255, 1)", 50, 100);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);

///////// EN CLASE.

//// A) Cargar múltiples texturas.
const manager = new THREE.LoadingManager();

manager.onLoad = function () {
   console.log('¡Todas las texturas cargadas!');
   createMaterial();
};
 
const loader = new THREE.TextureLoader(manager);

// Texturas
const lunaTex = {
   albedo: loader.load('./assets/texturas/luna/albedo.png'),
   metalness: loader.load('./assets/texturas/luna/metallic.png'),
   normal: loader.load('./assets/texturas/luna/normal.png'),
   roughness: loader.load('./assets/texturas/luna/roughness.png'),
   displacement: loader.load('./assets/texturas/luna/displacement.png'),
};

const alienTex = {
   albedo: loader.load('./assets/texturas/alien/albedo.png'),
   ao: loader.load('./assets/texturas/alien/ao.png'),
   metalness: loader.load('./assets/texturas/alien/metallic.png'),
   normal: loader.load('./assets/texturas/alien/normal.png'),
   displacement: loader.load('./assets/texturas/alien/displacement.png'),
};

const cuadradoTex = {
   albedo: loader.load('./assets/texturas/cuadrado/albedo.png'),
   ao: loader.load('./assets/texturas/cuadrado/ao.png'),
   metalness: loader.load('./assets/texturas/cuadrado/metallic.png'),
   normal: loader.load('./assets/texturas/cuadrado/normal.png'),
   displacement: loader.load('./assets/texturas/cuadrado/displacement.png'),
};

const metalTex = {
   albedo: loader.load('./assets/texturas/metal/albedo.png'),
   ao: loader.load('./assets/texturas/metal/ao.png'),
   metalness: loader.load('./assets/texturas/metal/metallic.png'),
   normal: loader.load('./assets/texturas/metal/normal.png'),
   roughness: loader.load('./assets/texturas/metal/roughness.png'),
};

// Variables globales para materiales
var cuadradosMaterial, lunaMaterial, alienMaterial, metalMaterial;

function createMaterial() {
   cuadradosMaterial = new THREE.MeshStandardMaterial({
       map: cuadradoTex.albedo,
       aoMap: cuadradoTex.ao,
       metalnessMap: cuadradoTex.metalness,
       normalMap: cuadradoTex.normal,
       displacementMap: cuadradoTex.displacement,
       displacementScale: 0.4,
       side: THREE.FrontSide,
   });

   lunaMaterial = new THREE.MeshStandardMaterial({
       map: lunaTex.albedo,
       metalnessMap: lunaTex.metalness,
       normalMap: lunaTex.normal,
       roughnessMap: lunaTex.roughness,
       displacementMap: lunaTex.displacement,
       displacementScale: 0.4,
       side: THREE.FrontSide,
   });

   alienMaterial = new THREE.MeshStandardMaterial({
       map: alienTex.albedo,
       aoMap: alienTex.ao,
       metalnessMap: alienTex.metalness,
       normalMap: alienTex.normal,
       displacementMap: alienTex.displacement,
       displacementScale: 0.4,
       side: THREE.FrontSide,
   });

   metalMaterial = new THREE.MeshStandardMaterial({
       map: metalTex.albedo,
       metalnessMap: metalTex.metalness,
       normalMap: metalTex.normal,
       roughnessMap: metalTex.roughness,
       metalness: 1,
       roughness: 1,
       side: THREE.DoubleSide,
   });

   // Material inicial
   mesh.material = cuadradosMaterial;
}

//// B) Rotación al scrollear.
var scroll = {
   y: 0,
   lerpedY: 0,
   speed: 0.005,
   cof: 0.07
};

function updateScrollData(eventData) {
   scroll.y += eventData.deltaX * scroll.speed;
}
window.addEventListener("wheel", updateScrollData);

function updateMeshRotation() {
   mesh.rotation.y = scroll.lerpedY;
}

function lerpScrollY() {
   scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
}

//// C) Movimiento de cámara con mouse
var mouse = {
   x: 0,
   y: 0,
   normalOffset: { x: 0, y: 0 },
   lerpNormalOffset: { x: 0, y: 0 },
   cof: 0.07,
   gazeRange: { x: 7, y: 3 }
};

function updateMouseData(eventData) {
   updateMousePosition(eventData);
   calculateNormalOffset();
}
function updateMousePosition(eventData) {
   mouse.x = eventData.clientX;
   mouse.y = eventData.clientY;
}
function calculateNormalOffset() {
   let windowCenter = { x: canvas.width / 2, y: canvas.height / 2 };
   mouse.normalOffset.x = ((mouse.x - windowCenter.x) / canvas.width) * 2;
   mouse.normalOffset.y = ((mouse.y - windowCenter.y) / canvas.height) * 2;
}
window.addEventListener("mousemove", updateMouseData);

function updateCameraPosition() {
   camera.position.x = mouse.normalOffset.x * mouse.gazeRange.x;
   camera.position.y = -mouse.normalOffset.y * mouse.gazeRange.y;
}

// Click en canvas
canvas.addEventListener("click", () => {
   gsap.to(mesh.scale, { x: 2, y: 2, z: 2, duration: 0.5, ease: "power1.out" });
   gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: 1, ease: "power1.out" });
});

// Wireframe con tecla W
window.addEventListener("keydown", (event) => {
   if (event.key === "w") {
       mesh.material.wireframe = !mesh.material.wireframe;
   }
});

// Botones
const cuadradosButton = document.getElementById("cuadrado");
cuadradosButton.addEventListener("mousedown", function() {
   mesh.material = cuadradosMaterial;
   mesh.material.needsUpdate = true;
});

const alienButton = document.getElementById("alien");
alienButton.addEventListener("mousedown", function() {
   mesh.material = alienMaterial;
   mesh.material.needsUpdate = true;
});

const lunaButton = document.getElementById("luna");
lunaButton.addEventListener("mousedown", function() {
   mesh.material = lunaMaterial;
   mesh.material.needsUpdate = true;
});

const metalButton = document.getElementById("metal");
metalButton.addEventListener("mousedown", function() {
   mesh.material = metalMaterial;
   mesh.material.needsUpdate = true;
});

///////// LOOP DE ANIMACIÓN
function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x -= 0.005;
    lerpScrollY();
    updateMeshRotation();
    updateCameraPosition();
    camera.lookAt(mesh.position);
    renderer.render(scene, camera);
}

animate();
