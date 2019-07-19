import { mat4 } from 'gl-matrix';

export const initContext = () => {
  const canvas = document.querySelector('#glCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext('webgl');
  window.gl = gl;
  return gl;
};

export const initProgramInfo = (gl, shaderProgram, info) => {
  const location = v => {
    if (v[0] == 'a') return gl.getAttribLocation(shaderProgram, v);
    if (v[0] == 'u') return gl.getUniformLocation(shaderProgram, v);
  };
  return info
    .concat(['aVertexPosition', 'uProjectionMatrix', 'uModelViewMatrix'])
    .reduce((acc, v) => Object.assign(acc, { [v]: location(v) }), {});
};

export const initShaderProgram = (gl, vert, frag) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vert);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, frag);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  return shaderProgram;
};

export const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

export const initViewMatrices = (gl, shaderProgram, programInfo) => {
  clearCanvas(gl);
  const progProjecMatrix = programInfo.uProjectionMatrix;
  const progModelMatrix = programInfo.uModelViewMatrix;
  const modelViewMatrix = mat4.create();
  const projectionMatrix = mat4.create();
  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
  gl.useProgram(shaderProgram);
  gl.uniformMatrix4fv(progProjecMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(progModelMatrix, false, modelViewMatrix);
};

export const clearCanvas = gl => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

export const initBuffer = (gl, matrix, type) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, new Float32Array(matrix), gl.STATIC_DRAW);
  return buffer;
};

export const bindBuffer = (gl, programInfo, buffer, iter) => {
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  const offset = 0; // how many bytes inside the buffer to start from
  const vertPos = programInfo.aVertexPosition;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(vertPos, iter, type, normalize, stride, offset);
  gl.enableVertexAttribArray(vertPos);
};

export const line = (x, y) => [x, x, x, y];

export const circle = (points, radius, x, y) => {
  const acc = new Float32Array(points);
  const slice = (2 * Math.PI) / points;
  for (let i = 0; i < points; i += 2) {
    const angle = slice * i;
    acc[i] = x + radius * Math.cos(angle);
    acc[i + 1] = y + radius * Math.sin(angle);
  }
  return acc;
};

export const render = (cb, fps = 60) => {
  const loop = () => {
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, 1000 / fps);

    clearCanvas(gl);
    const time = performance.now() / 1000;
    cb(time);
  };
  loop();
};

export const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const polygon = ({ program, shaderProgram }, { positions, color }) => {
  const buffers = {
    position: initBuffer(gl, positions, gl.ARRAY_BUFFER)
  };
  const offset = 2;
  const count = positions.length / offset;
  gl.useProgram(shaderProgram);
  bindBuffer(gl, program, buffers.position, offset);
  gl.uniform3fv(program.uColor, color);
  gl.drawArrays(gl.LINE_LOOP, 0, count);
};

export const initProgram = ({ vert, frag, locations }) => {
  const shaderProgram = initShaderProgram(gl, vert, frag);
  const program = initProgramInfo(gl, shaderProgram, locations);
  initViewMatrices(gl, shaderProgram, program);
  return { program, shaderProgram };
};

export class Polygon {
  constructor({ vert, frag, uniforms = [], attributes = [] }) {
    const locations = [...uniforms, ...attributes];
    const p = initProgram({ vert, frag, locations });
    this.program = p.program;
    gl.useProgram(p.shaderProgram);
  }

  setPositions(positions) {
    const buffer = initBuffer(gl, positions, gl.ARRAY_BUFFER);
    bindBuffer(gl, this.program, buffer, 2);
    gl.drawArrays(gl.LINE_LOOP, 0, positions.length / 2);
  }

  setUniform(uniform = '', value) {
    const len = value.length;
    gl['uniform' + len + 'fv'](this.program[uniform], value);
  }
}

// export const polygon2 = ({ program, shaderProgram }, { positions, color }) => {
//   // prettier-ignore
//   var positions = new Float32Array([
//     // Triangle 1 vertices:
//     0.0,  0.5, 0.0,          // Vertex A (x,y,z)
//    -0.5, -0.5, 0.0,          // Vertex B (x,y,z)
//     0.5, -0.5, 0.0,          // Vertex C (x,y,z)
//     // Triangle 2 vertices:
//     0.05 + 0.0,  0.75, 0.0,  // Vertex A (x,y,z)
//     0.75 - 0.5, -0.75, 0.0,  // Vertex B (x,y,z)
//     0.15 + 0.5, -0.75, 0.0,  // Vertex C (x,y,z)
// ]);

//   // prettier-ignore
//   var color = new Float32Array([
//     // Triangle 1 vertex colors:
//     1.0, 0.0, 0.0,           // Vertex A (r,g,b) -- red
//     0.0, 1.0, 0.0,           // Vertex B (r,g,b) -- green
//     0.0, 0.0, 1.0,           // Vertex C (r,g,b) -- blue
//     // Triangle 2 vertex colors:
//     0.0, 0.0, 1.0,           // Vertex A (r,g,b) -- red
//     0.0, 1.0, 0.0,           // Vertex B (r,g,b) -- green
//     1.0, 0.0, 0.0            // Vertex C (r,g,b) -- blue
// ]);

//   const buffers = {
//     position: initBuffer(gl, positions, gl.ARRAY_BUFFER)
//   };
//   const offset = 2;
//   const count = positions.length / offset;
//   gl.useProgram(shaderProgram);
//   bindBuffer(gl, program, buffers.position, offset);
//   gl.uniform3fv(program.uColor, color);
//   // gl.drawArrays(gl.LINE_LOOP, 0, count);
//   var indices = [0, 1, 2, 3, 4, 5];
//   gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
// };
