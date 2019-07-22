const glsl = x => x;

export const vert = glsl`
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

export const frag = glsl`
  precision highp float;
  uniform vec3 uColor;
  void main() { 
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

export const fs = glsl`
//precision mediump float;
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
#define MAX_STEPS 250
#define MAX_DIST 30.
#define EPSILON .001
mat2 rotate(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}
float sphereSDF (vec3 p, vec3 c, float r) {
  return length(c - p) - r;
}
float cubeSDF (vec3 p, vec3 c, vec3 dimensions, float borderRoundness) {
  vec3 pos = abs(c - p) - dimensions;
  return length(max(pos, 0.)) - borderRoundness + min(max(pos.x, max(pos.y, pos.z)), 0.);
}
float sceneSDF (vec3 p) {
  float s1 = sphereSDF(p, vec3(0.), 1.);
  s1 += sin(cubeSDF(fract(p * 8. + cos(uTime * .08)) - .5, vec3(0.), vec3(4.), 1. * sin(uTime * .05)) * 8. + (sin(uTime * .3) * .5 + .6)) * .02;
  s1 += cos(dot(p.xy * 3., p.yx * 2.) * (sin(uTime * .5) * 2. + 3.)) * .002;
  s1 += abs(max(p.z * p.y, 0.)) * 2.8;
  s1 += (sin(p.x * 2. + dot(p.xy, p.yz) - (uTime * .5)) - cos(p.z + p.x * 2. - (uTime * .2))) * .2;
  return s1 * .4;
}
float raymarch (vec3 ro, vec3 rd) {
  float depth = 0.;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 ray = ro + rd * depth;
    float dist = sceneSDF(ray);
    if (dist < EPSILON) break;
    depth += dist;
    if (depth >= MAX_DIST) break;
  }
  return depth;
}
vec3 getNormal (vec3 p) {
  float d = sceneSDF(p);
  vec2 e = vec2(.01, 0.);
  return normalize(d - vec3(
    sceneSDF(p - e.xyy),
    sceneSDF(p - e.yxy),
    sceneSDF(p - e.yyx)));
}
struct Material {
  float ambient;
  float diffuse;
  float specular;
};
float getLight (vec3 lightPos, vec3 p, vec3 rd, float lightOcclusion, Material material) {
  // https://www.shadertoy.com/view/ll2GW1
  vec3 light = normalize(lightPos - p);
  vec3 normal = getNormal(p);
  // phong reflection
  float ambient = clamp(.5 + .5 * normal.y, 0., 1.);
  float diffuse = clamp(dot(normal, light), 0., 1.);
  vec3 half_way = normalize(-rd + light);
  float specular = pow(clamp(dot(half_way, normal), 0.0, 1.0), 16.);
  return (ambient * material.ambient * lightOcclusion) +
   (diffuse * material.diffuse * lightOcclusion) +
   (diffuse * specular * material.specular * lightOcclusion);
}
void main (void) {
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
  // camera
  vec3 ro = vec3(0., 0., -5.);
  ro.xz *= rotate(uTime * .2);
  vec3 rd = normalize(vec3(uv.x, uv.y, 3.));
  rd.xz *= rotate(uTime * .2);
  vec3 color = vec3(0.);
  float d = raymarch(ro, rd);
  vec3 ray = ro + rd * d;
  if (d < MAX_DIST) {
    vec3 light1 = vec3(2., 2., -4.);
    light1.xz *= rotate(uTime);
    float phong1 = getLight(light1, ray, rd, .8, Material(.7, .7, 1.2));
    color += phong1;
    vec3 light2 = vec3(5., 5., -8.);
    light2.yz *= rotate(uTime);
    float phong2 = getLight(light2, ray, rd, .5, Material(.3, .4, .4));
    color += phong2;
    color = mix(color, vec3(1.), .2);
    color += mix(color, vec3(uv.y * .4, ray.y * .2, .3), .5);
    color *= mix(color, vec3(uv.y * .4, ray.y * .2, .3), .8);
  } else {
    color = 1. - mix(color, vec3(1.), step(.8, max(abs(uv.x), abs(uv.y))));
    color *= vec3(uv.y * .4, uv.y * .2, .3) * sin(max(abs(uv.x), abs(uv.y)) * 100. + uTime) * 5.;
  }
  color += vec3(1. - length(uv) * 2.) * .2;
  gl_FragColor = vec4(color, 1.);
}
`;

export const vs = glsl`
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;
