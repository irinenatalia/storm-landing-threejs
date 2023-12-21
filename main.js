import './style.css'
import { Application } from '@splinetool/runtime';
import Lenis from '@studio-freight/lenis'
import { gsap, } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import * as THREE from 'three';
import {DRACOLoader} from 'https://unpkg.com/three@0.140.0/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.140.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://unpkg.com/three@0.140.0/examples/jsm/loaders/RGBELoader.js';

gsap.registerPlugin(ScrollTrigger);

import $ from 'jquery'


const lenis = new Lenis({
  // smoothWheel: true
})

lenis.on('scroll', ScrollTrigger.update)

const image = $('#logo')
const hero = $('#hero')
const obj = $('#canvas3d')
const event = $('#event')


gsap.timeline({
  scrollTrigger: {
    trigger: hero,
    start: "top top",
    end: "bottom top",
    scrub: true,
    // markers: true
  }
})
  .to(image, {
    ease: 'none',
    opacity: .3,
    scale: 0
  })

gsap.timeline({
  scrollTrigger: {
    trigger: event,
    start: "top top",
    end: "bottom top",
    scrub: 10,
    // markers: true
  }
})
  .from(event.find('img'), {
    ease: 'none',
    scale: 0,
  });

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

main();

function main() {
  //const gui = new dat.GUI();
const canvas = document.querySelector('#canvasthreejs');
const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor( 0x000000, 0 );

const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 0);

const loader = new THREE.CubeTextureLoader();
const envTexture = new THREE.CubeTextureLoader().load([
  './img/threejs/texture_01.jpg',
  './img/threejs/texture_02.jpg',
  './img/threejs/texture_03.jpg',
  './img/threejs/texture_04.jpg',
  './img/threejs/texture_05.jpg',
  './img/threejs/texture_06.jpg',
])
envTexture.mapping = THREE.CubeReflectionMapping;
  
const material = new THREE.MeshPhysicalMaterial( {
  map: null,
  color: 0xFFFFFF,
  metalness: 1,
  roughness: 0,
  opacity: 0.5,
  side: THREE.FrontSide,
  transparent: true,
  envMapIntensity: 6,
  premultipliedAlpha: true,
  reflectivity: 2.15,
  envMap: envTexture
} );
const scene = new THREE.Scene();
const ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambient );

const hemi = new THREE.HemisphereLight( 0xfe4543, 0x1b21b9, 3 );
scene.add( hemi );

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}
{
  const dracoLoader = new DRACOLoader();
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('/threejs/logocomplete.gltf', (gltf) => {
      const root = gltf.scene;
      let mesh = [];
      let meshCount = 0;
      const meshGroup = new THREE.Group();
      
      root.traverse((o) => {
          if (o.isMesh){
              o.material = material;
              o.castShadow = true;
              o.receiveShadow = true;
              mesh[meshCount] = o;
              meshCount++;
          }
      });
      meshGroup.add(root);
      scene.add(meshGroup);
/*
      const rgbeLoader = new RGBELoader();
      rgbeLoader.load( 'https://assets.codepen.io/439000/neon_photostudio_1k.hdr', ( texture ) => {

        texture.mapping = THREE.EquirectangularReflectionMapping;

        material.envMap = texture;
        material.needsUpdate = true;

      } );
*/
      gsap.set(scene.scale, {x: 0.27, y: 0.27, z: 0.27});
      gsap.set(scene.rotation, {x: 90});
      gsap.set(meshGroup.position, {
        y: -0.15
      });
      animateLogo(mesh, scene);

      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
      
  });
}
  function animateLogo(mesh, copyScene){
      var sectionDuration = 1;
      let delay = 0;
      let tl = new gsap.timeline({
          onUpdate: copyScene.render,
          scrollTrigger: {
          trigger: ".hero",
          scrub: true,
          start: "top top",
          end: "+=" + (window.innerHeight * 2)
          },
          defaults: {duration: sectionDuration, ease: 'power2.inOut'}
      });

      gsap.to(copyScene.scale, {duration: 1, x: 0.4, y: 0.4, z: 0.4, ease: 'power1.in'}, delay);
      
      delay = 0;
      mesh.forEach(function(meshItem,meshIndex){
          if(meshItem['name'] == 'Shape002'){
              tl.to(meshItem.position, {x: -2, y: 30, z:-20, ease: 'power1.in'}, delay);
          }
          else if(meshItem['name'] == 'Shape003'){
              tl.to(meshItem.position, {x: -10, y: 50, z:-2, ease: 'power1.in'}, delay);
          }
          else if(meshItem['name'] == 'Shape004'){
              tl.to(meshItem.position, {x: -10, y: 50, z:-10,  ease: 'power1.in'}, delay);
          }
          else if(meshItem['name'] == 'Shape008'){
              tl.to(meshItem.position, {x: 3, y: 20, z:-20, ease: 'power1.in'}, delay);
          }
          else if(meshItem['name'] == 'Shape009'){
              tl.to(meshItem.position, {x: 5, y: 10, ease: 'power1.in'}, delay);
          }
          else if(meshItem['name'] == 'Shape010'){
              tl.to(meshItem.position, {x: 2, y: 10, ease: 'power1.in'}, delay);
          }
          
      });
      
  }

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = $(window).width() > 1024? canvas.clientWidth : $('#canvasthreejs').width();
  const height = $(window).width() > 1024? canvas.clientHeight : $('#canvasthreejs').height();
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
}

