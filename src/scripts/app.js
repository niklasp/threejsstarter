import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { monitorScroll, loadModels, MouseTools } from './util';

//import shaders
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';
import shiftShader from '../shaders/shiftShader.glsl';

//import your models
import model from '../models/model.glb';
export default class Sketch {
  constructor( options ) {

    this.time = 0;
    this.container = options.dom;
    this.scrollPercentage = 0.0;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    const fov = 40;
    const near = 0.01;
    const far = 100;

    this.mouseTools = new MouseTools( this.container );

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( fov, this.width / this.height, near, far );
    this.camera.position.z = 25;

    // const gridHelper = new THREE.GridHelper( 100, 100 );
    // this.scene.add( gridHelper );

    this.renderer = new THREE.WebGLRenderer( {
      antialias: false,
      autoClear: true,
      powerPreference: "high-performance",
    } );

    this.renderer.setSize( this.width, this.height );
    this.renderer.setClearColor(0xeeeeee, 1);
    this.container.appendChild( this.renderer.domElement );

    this.composer = new EffectComposer( this.renderer );
    const renderPass = new RenderPass( this.scene, this.camera );
    this.composer.addPass( renderPass );
    this.composer.setSize ( this.width, this.height );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.setupListeners();
    this.addObjects();
    this.addComposerPass();
    this.render();
    this.resize();
  }

  setupListeners() {
    window.addEventListener( 'resize', this.resize.bind( this ) );
    monitorScroll(ratio => {
      this.scrollPercentage = (ratio).toFixed(3);
    });
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize( this.width, this.height );
    this.composer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addComposerPass() {
    this.shader = {
      uniforms: {
        u_time: { value: 0.0 },
        tDiffuse: { value: null },
      },
      vertexShader,
      fragmentShader: shiftShader,
    };
    this.shaderPass = new ShaderPass( this.shader );
    this.composer.addPass( this.shaderPass );
  }

  addObjects() {
    this.geometry = new THREE.BoxGeometry( 0.4, 0.4, 0.4 );

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
      },
      side: THREE.DoubleSide,
      fragmentShader,
      vertexShader,
    });

    // this.mesh = new THREE.Mesh( this.geometry, this.material );
    // this.scene.add( this.mesh );

    loadModels(
      model,
      ( gltf ) => {
        console.log( 'hello', gltf );
        this.scene.add( gltf.scene );
        gltf.scene.scale.set( 0.5, 0.5, 0.5 );

        gltf.scene.traverse( o => {
          if ( o.isMesh ) {
            o.geometry.center();
            o.material = this.material;
          }
        });
      }
    );
  }

  render() {
    this.time += 0.05;
    this.material.uniforms.u_time.value = this.time;
    this.mouseTools.update();
    // this.mesh.rotation.x = this.time / 20;
    // this.mesh.rotation.y = this.time / 10;
    if ( this.shaderPass ) {
      this.shaderPass.uniforms.u_time.value = this.time;
    }
    this.composer.render();
    window.requestAnimationFrame( this.render.bind( this ) );
  }
}