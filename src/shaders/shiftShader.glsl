uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load
uniform sampler2D tDiffuse;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec2 newUv = vUv;
  newUv += 0.2 * mod( vUv, sin(u_time / 2.) );
  vec4 texel = texture2D( tDiffuse, newUv );
  gl_FragColor = texel;
}