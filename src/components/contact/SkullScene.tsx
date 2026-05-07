import { useEffect, useRef } from "react";

// Raymarched skull — brand recolor: black bg, blood-red (#C8102E) fresnel edges
// Ported from KΛTUR "Dull Skull – Prologue" (Shadertoy, CC BY-NC 4.0)
// helper set: Ellipsoid, Sphere, sMin — same primitives as original

const FRAG = `#version 300 es
precision highp float;
out vec4 O;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;

#define STEPS  32
#define MAX_D  12.0
#define EPS    0.004

// ── helpers ─────────────────────────────────────────────────────────────────

mat2 Rot(float a){
  float s=sin(a),c=cos(a);
  return mat2(c,-s,s,c);
}

float Sphere(vec3 p,float r){ return length(p)-r; }

// Approximated ellipsoid SDF (exact at boundary, slight underestimate away from it)
float Ellipsoid(vec3 p,vec3 r){
  float k0=length(p/r);
  float k1=length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float sMin(float a,float b,float k){
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}

vec3 GetRayDir(vec2 uv,vec3 ro,vec3 ta,float fl){
  vec3 f=normalize(ta-ro);
  vec3 r=normalize(cross(vec3(0,1,0),f));
  vec3 u=cross(f,r);
  return normalize(uv.x*r+uv.y*u+fl*f);
}

// ── skull SDF (object space) ─────────────────────────────────────────────────

float skull(vec3 p){
  // Cranium dome
  float d=Ellipsoid(p-vec3(0.,.18,0.),vec3(1.05,1.15,1.));

  // Cheekbones — smooth merge
  d=sMin(d,Ellipsoid(p-vec3(-.72,-.06,.32),vec3(.32,.18,.32)),.14);
  d=sMin(d,Ellipsoid(p-vec3( .72,-.06,.32),vec3(.32,.18,.32)),.14);

  // Jaw — smooth merge
  d=sMin(d,Ellipsoid(p-vec3(0.,-.82,0.),vec3(.62,.36,.58)),.14);

  // Clip flat back of skull
  d=max(d,p.z+.58);

  // Carve eye sockets
  d=max(d,-Sphere(p-vec3(-.37,.20,.82),.25));
  d=max(d,-Sphere(p-vec3( .37,.20,.82),.25));

  // Carve nasal cavity
  d=max(d,-Ellipsoid(p-vec3(0.,-.06,.92),vec3(.11,.14,.09)));

  return d;
}

// ── scene (world space — applies animation) ──────────────────────────────────

float scene(vec3 p){
  // Slow auto-rotation + mouse tilt
  p.xz=Rot(-u_time*.22)*p.xz;
  vec2 m=u_mouse-.5;
  p.yz=Rot( m.y*.50)*p.yz;
  p.xy=Rot(-m.x*.35)*p.xy;
  // Gentle breathing bob
  p.y+=sin(u_time*.45)*.035;
  return skull(p);
}

// ── surface normal (finite differences on scene) ─────────────────────────────

vec3 calcNormal(vec3 p){
  vec2 h=vec2(.001,0.);
  return normalize(vec3(
    scene(p+h.xyy)-scene(p-h.xyy),
    scene(p+h.yxy)-scene(p-h.yxy),
    scene(p+h.yyx)-scene(p-h.yyx)
  ));
}

// ── raymarcher ───────────────────────────────────────────────────────────────

float RM(vec3 ro,vec3 rd){
  float d=.08;
  for(int i=0;i<STEPS;i++){
    float s=scene(ro+rd*d);
    if(abs(s)<EPS)break;
    d+=s*.88;           // 0.88 step scale: safe for sMin-approximated SDF
    if(d>MAX_D)break;
  }
  return d;
}

// ── main ─────────────────────────────────────────────────────────────────────

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;

  vec3 ro=vec3(0.,0.,3.2);
  vec3 rd=GetRayDir(uv,ro,vec3(0.,-.08,0.),2.);

  float d=RM(ro,rd);

  // Brand palette
  vec3 blood=vec3(.784,.063,.180);   // #C8102E
  vec3 hot  =vec3(1.,.122,.122);     // #FF1F1F

  vec3 col=vec3(0.);                 // pure black background

  if(d<MAX_D){
    vec3 p=ro+rd*d;
    vec3 n=calcNormal(p);

    // Fresnel: brightest at silhouette / socket rims (surface ⟂ to view ray)
    float fres=pow(1.-abs(dot(rd,n)),2.4);

    // Very subtle key light so the skull reads in 3D
    float diff=max(0.,dot(n,normalize(vec3(.5,.9,-.3))));

    col =blood*fres*2.2;      // glowing red edges
    col+=blood*diff*.05;      // barely-there diffuse fill
    col+=hot*(fres*fres)*.4;  // hot-red specular bloom at sharpest edges
  }

  // Dark blood-tinted atmospheric fog
  float fog=1.-exp(-.00012*max(d-1.5,0.)*max(d-1.5,0.));
  col=mix(col,vec3(.022,.0,.006),fog);

  // Gamma correction
  col=pow(max(col,0.),vec3(.4545));

  O=vec4(col,1.);
}
`;

const VERT = `#version 300 es
precision highp float;
in vec2 a_pos;
void main(){ gl_Position=vec4(a_pos,0.,1.); }
`;

export default function SkullScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const t0Ref     = useRef(0);
  const mouseRef  = useRef<[number, number]>([0.5, 0.5]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    const compile = (src: string, type: number): WebGLShader | null => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };

    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(prog));
      return;
    }

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uRes   = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    // Cap pixel ratio for perf — raymarching is expensive per-pixel
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    const resize = () => {
      const w = Math.floor(canvas.clientWidth  * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = [
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      ];
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("resize", resize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e!.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        t0Ref.current = performance.now();
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    t0Ref.current = performance.now();

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      resize();
      gl.useProgram(prog);
      gl.uniform1f(uTime,  (now - t0Ref.current) / 1000);
      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
}
