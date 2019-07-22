import { initProgram, initBuffer, initAttrib } from './utils';

export class Element {
  constructor({ vert, frag, locations, type = gl.TRIANGLE_STRIP }) {
    const p = initProgram({ vert, frag, locations });
    this.type = type;
    this.program = p.program;
    this.shaderProgram = p.shaderProgram;
    gl.useProgram(p.shaderProgram);
  }

  setPositions(positions) {
    const vertices = positions;
    const indices = [3, 2, 1, 3, 1, 0];
    initBuffer(gl, new Float32Array(vertices), gl.ARRAY_BUFFER);
    initBuffer(gl, new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER);
    initAttrib(gl, this.program, 'aVertexPosition');
    gl.drawElements(this.type, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  setUniform(uniform = '', value) {
    const len = value.length;
    gl['uniform' + len + 'fv'](this.program[uniform], value);
  }
}

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
