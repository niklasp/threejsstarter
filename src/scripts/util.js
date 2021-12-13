import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * @param {Function} onRatioChange The callback when the scroll ratio changes
 */
 export const monitorScroll = onRatioChange => {
  const html = document.documentElement;
  const body = document.body;

  window.addEventListener('scroll', () => {
    onRatioChange(
      (html.scrollTop || body.scrollTop)
      /
      ((html.scrollHeight || body.scrollHeight) - html.clientHeight)
    );
  });
};

/**
 * Load models from glb / gltf
 * @param {*} onComplete 
 * @param {*} onLoad 
 * @param {*} onError 
 */
export const loadModels = ( model, onComplete = () => {}, onLoad = () => {}, onError = () => {}) => {
  const loader = new GLTFLoader();
  loader.load(
    // resource URL
    model,
    // called when the resource is loaded
    function ( gltf ) {
      onComplete( gltf );
    },
    // called while loading is progressing
    function ( xhr ) {
      onLoad( xhr );
    },
    // called when loading has errors
    function ( error ) {
      onError( error );
    }
  );
};

export class MouseTools {
  constructor( domEl, damping = 0.1 ) {
    this.domEl = domEl;
    this.damping = damping;
    this.width = this.domEl.offsetWidth;
    this.height = this.domEl.offsetHeight;

    this.mouse = {
      pos: new THREE.Vector2( 0.0, 0.0 ),
      oldPos: new THREE.Vector2( 0.0, 0.0 ),
      speed: new THREE.Vector2( 0.0, 0.0 ),
      oldSpeed: new THREE.Vector2( 0.0, 0.0 ),
      acc: new THREE.Vector2( 0.0, 0.0 ),
      dPos: new THREE.Vector2( 0.0, 0.0 ), // the dampened mouse position
      dSpeed: new THREE.Vector2( 0.0, 0.0 ), // the dampened mouse speed
    };

    domEl.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
  }

  onMouseMove( e ) {
    this.mouse.oldPos.set( this.mouse.pos.x, this.mouse.pos.y );
    this.mouse.pos.set( e.clientX / this.width , ( this.height - e.clientY ) / this.height );
    let tmpMouseX = this.mouse.pos.x - this.mouse.oldPos.x;
    let tmpMouseY = this.mouse.pos.y - this.mouse.oldPos.y;

    tmpMouseX = Math.abs( Math.min( tmpMouseX * 10, 1 ) );
    tmpMouseX = tmpMouseX > 1 ? 1.0 : tmpMouseX;

    tmpMouseY = Math.abs( Math.min( tmpMouseY * 10, 1 ) );
    tmpMouseY = tmpMouseY > 1 ? 1.0 : tmpMouseY;

    this.mouse.speed.set( tmpMouseX, tmpMouseY);
  }

  update() {
    //to be called in render
    this.mouse.dPos.x -= ( this.mouse.dPos.x - this.mouse.pos.x) * this.damping;
    this.mouse.dPos.y -= ( this.mouse.dPos.y - this.mouse.pos.y ) * this.damping;
    this.mouse.dSpeed.x = this.mouse.dPos.x - this.mouse.pos.x;
    this.mouse.dSpeed.y = this.mouse.dPos.y - this.mouse.pos.y;
  }
}


