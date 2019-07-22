const glsl = x => x;
import { initContext, render } from './utils';
import { Element } from './shape';

initContext();

const vert = glsl`
  attribute vec4 aVertexPosition;
  attribute vec4 aCoordinates;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform vec2 uMouse;
  uniform float uTime;
  vec4 pos;
  void main() {
    pos = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    pos.x -= sin(uTime + (aVertexPosition.y));
    pos.y += sin(uTime - (aVertexPosition.x));

    pos.x += uMouse.x;
    pos.y += uMouse.y;
    gl_Position = pos;
  }
`;

const frag = glsl`
  precision highp float;
  uniform vec3 uColor;
  uniform vec2 uMouse;
  uniform float uTime;
  vec3 color;
  void main() { 
    color = uColor;
    color.x -= (sin(uTime * 1.));
    color.y -= color.x;
    color.z -= color.x;
    gl_FragColor = vec4(color, 1.);
  }
`;

const foo = new Element({
  vert: vert,
  frag: frag,
  locations: ['uTime', 'uColor', 'uMouse'],
  type: gl.LINE_LOOP
});

render(({ time, mouse }) => {
  // prettier-ignore
  foo.setPositions([
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0
  ]);
  foo.setUniform('uColor', [0, 0, 255]);
  foo.setUniform('uTime', [time]);
  foo.setUniform('uMouse', mouse);
}, 60);
