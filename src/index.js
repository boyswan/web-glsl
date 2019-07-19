const glsl = x => x;
import { initContext, circle, render, rand, Polygon } from './utils';

initContext();

export const vert = glsl`
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform float uTime;
  vec4 pos;
  void main() {
    pos = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    pos.x -= sin(uTime + (aVertexPosition.y));
    pos.y += sin(uTime - (aVertexPosition.x));
    gl_Position = pos;
  }
`;

export const frag = glsl`
  precision highp float;
  uniform vec3 uColor;
  uniform float uTime;
  void main() { 
    gl_FragColor = vec4(uColor, 1.);
  }
`;

const foo = new Polygon({
  vert: vert,
  frag: frag,
  uniforms: ['uColor', 'uTime']
});

render(time => {
  foo.setPositions(circle(1000, 1, 0, 0));
  foo.setUniform('uColor', [255, 255, 255]);
  foo.setUniform('uTime', [time]);
}, 60);
