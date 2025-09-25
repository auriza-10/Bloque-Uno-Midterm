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
renderer.setClearColor("#000000ff");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// 3.1 Configurar mesh.
//const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
//const geo = new THREE.SphereGeometry(1.5, 128, 128);
const geo = new THREE.TorusGeometry(1.5, 0.5, 32, 100);
//const geo = new THREE.CapsuleGeometry(1, 3, 32, 32);

const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
 //   wireframe: true,
});
const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
mesh.position.z = -7;

// 3.2 Crear luces.
const frontLight = new THREE.PointLight("#ffffff", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("#0066ff", 50, 100);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);



///////// EN CLASE.

//// A) Cargar múltiples texturas.
// 1. "Loading manager".
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
   console.log(`Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal})`);
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   console.log(`Cargando: ${url} (${itemsLoaded}/${itemsTotal})`);
};

manager.onLoad = function () {
   console.log('¡Todas las texturas cargadas!');
   createMaterial();
};

manager.onError = function (url) {
   console.error(` Error al cargar: ${url}`);
};
 
// 2. "Texture loader" para nuestros assets.
const loader = new THREE.TextureLoader(manager);

// 3. Cargamos texturas guardadas en el folder del proyecto.
const ladrillosTex = {
   albedo: loader.load('./assets/texturas/bricks/albedo.png'),
   ao: loader.load('./assets/texturas/bricks/ao.png'),
   metalness: loader.load('./assets/texturas/bricks/metallic.png'),
   normal: loader.load('./assets/texturas/bricks/normal.png'),
   roughness: loader.load('./assets/texturas/bricks/roughness.png'),
   displacement: loader.load('./assets/texturas/bricks/displacement.png'),
};

const alienTex = {
   albedo: loader.load('./assets/texturas/alien/albedo.png'),
   ao: loader.load('./assets/texturas/alien/ao.png'),
   metalness: loader.load('./assets/texturas/alien/metallic.png'),
   normal: loader.load('./assets/texturas/alien/normal.png'),
   roughness: loader.load('./assets/texturas/alien/roughness.png'),
   displacement: loader.load('./assets/texturas/alien/displacement.png'),
};

const verdetex = {
   albedo: loader.load('./assets/texturas/verde/albedo.png'),
   ao: loader.load('./assets/texturas/verde/ao.png'),
   metalness: loader.load('./assets/texturas/verde/metallic.png'),
   normal: loader.load('./assets/texturas/verde/normal.png'),
   roughness: loader.load('./assets/texturas/verde/roughness.png'),
   displacement: loader.load('./assets/texturas/verde/displacement.png'),
};

const metalTex = {
   albedo: loader.load('./assets/texturas/metal/albedo.png'),
   ao: loader.load('./assets/texturas/metal/ao.png'),
   metalness: loader.load('./assets/texturas/metal/metallic.png'),
   normal: loader.load('./assets/texturas/metal/normal.png'),
   roughness: loader.load('./assets/texturas/metal/roughness.png'),
   displacement: loader.load('./assets/texturas/metal/displacement.png'),
};

// 4. Definimos variables y la función que va a crear el material al cargar las texturas.
var ladrillosMaterial;

function createMaterial() {
   ladrilloMaterial = new THREE.MeshStandardMaterial({
       map: metalTex.albedo,
       aoMap: metalTex.ao,
       metalnessMap: metalTex.metalness,
       normalMap: metalTex.normal,
       roughnessMap: metalTex.roughness,
       displacementMap: metalTex.displacement,



       displacementScale: 0.4,
       side: THREE.FrontSide,
       // wireframe: true,
   });

   mesh.material = ladrilloMaterial;
}


//// B) Rotación al scrollear.
// 1. Crear un objeto con la data referente al SCROLL para ocuparla en todos lados.
var scroll = {
   y: 0,
   lerpedY: 0,
   speed: 0.005,
   cof: 0.07 // coeficiente de fricción.
};

// 2. Escuchar el evento scroll y actualizar el valor del scroll.
function updateScrollData(eventData) {
   scroll.y += eventData.deltaX * scroll.speed;
}

window.addEventListener("wheel", updateScrollData);

// 3. Aplicar el valor del scroll a la rotación del mesh. (en el loop de animación)
function updateMeshRotation() {
   mesh.rotation.y = scroll.lerpedY;
}

// 5. Vamos a suavizar un poco el valor de rotación para que los cambios de dirección sean menos bruscos.
function lerpScrollY() {
   scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
}


//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".

// 1. Crear un objeto con la data referente al MOUSE para ocuparla en todos lados.
var mouse = {
   x: 0,
   y: 0,
   normalOffset: {
       x: 0,
       y: 0
   },
   lerpNormalOffset: {
       x: 0,
       y: 0
   },

   cof: 0.07,
   gazeRange: {
       x: 7,
       y: 3
   }
}
// 2. Leer posición del mouse y calcular distancia del mouse al centro.
function updateMouseData(eventData) {
   updateMousePosition(eventData);
   calculateNormalOffset();
}
function updateMousePosition(eventData) {
   mouse.x = eventData.clientX;
   mouse.y = eventData.clientY;
}
function calculateNormalOffset() {
   let windowCenter = {
       x: canvas.width / 2,
       y: canvas.height / 2,
   }
   mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
   mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
}

window.addEventListener("mousemove", updateMouseData);

// 3. Aplicar valor calculado a la posición de la cámara. (en el loop de animación)
function updateCameraPosition() {
   camera.position.x = mouse.normalOffset.x * mouse.gazeRange.x;
   camera.position.y = -mouse.normalOffset.y * mouse.gazeRange.y;
}


// Configura un evento al hacer click sobre el canvas y usa GSAP para animar el mesh.

canvas.addEventListener("click", () => {
   gsap.to(mesh.scale, { x: 2, y: 2, z: 2, duration: 0.5, ease: "power1.out" });
   gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: 0.5, ease: "power1.out" }
   );
});


///////// FIN DE LA CLASE.


/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
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