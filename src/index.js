const glsl = x => x;
import { initContext, circle, render, rand, Element, Polygon } from './utils';
import { fs, vs } from './shaders';
const gl = initContext();

// export const vert = glsl`
//   attribute vec4 aVertexPosition;
//   attribute vec4 aCoordinates;
//   uniform mat4 uModelViewMatrix;
//   uniform mat4 uProjectionMatrix;
//   uniform float uTime;
//   vec4 pos;
//   void main() {
//     // pos = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
//     // pos.x -= sin(uTime + (aVertexPosition.y));
//     // pos.y += sin(uTime - (aVertexPosition.x));
//     // gl_Position = pos;
//     gl_Position = vec4(aCoordinates, 1.0);' +

//   }
// `;

const vert = glsl`
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;  
  attribute vec4 aVertexPosition;
  void main(void) { 
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

export const frag = glsl`
  precision highp float;
  uniform vec3 uColor;
  uniform vec2 uMouse;
  uniform float uTime;
  vec3 color;
  void main() { 
    color = uColor;
    color.x -= (sin(uTime * 10.));
    color.y -= color.x;
    color.z -= color.x;
    // gl_FragColor = vec4(color, 1.);

    gl_FragColor = vec4(vec3(255.), 1.);
  }
`;

const foo = new Element({
  vert: vert,
  frag: frag,
  locations: ['uTime', 'uColor', 'uMouse']
});

render(({ time, mouse }) => {
  // foo.setPositions([-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]);
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
