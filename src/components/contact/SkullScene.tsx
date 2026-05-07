import { useEffect, useRef } from "react";

// Raymarched skull — brand recolor: black bg, blood-red (#C8102E) fresnel edges
// Ported from KΛTUR "Dull Skull – Prologue" (Shadertoy, CC BY-NC 4.0)
// Helpers: pModPolar from hg_sdf (Mercury), SDF primitives from Inigo Quilez

const FRAG = `#version 300 es
precision highp float;
out vec4 O;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;

#define STEPS  48
#define MAX_D  12.0
#define EPS    0.003
#define PI 3.141592

// ── verified helpers ─────────────────────────────────────────────────────────
// pModPolar: https://mercury.sexy/hg_sdf/
// all others: https://iquilezles.org/articles/distfunctions/

float pModPolar(inout vec2 p, float repetitions) {
    float angle = 2.*PI/repetitions,
          a = atan(p.y, p.x)+angle,
          r = length(p),
          c = floor(a / angle);
    a = mod(a, angle) - angle / 2.0;
    p = vec2(cos(a), sin(a)) * r;
    if (abs(c) >= (repetitions / 2.0)) c = abs(c);
    return c;
}

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float sMin( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float sMax( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float Sphere(vec3 p, float s){
    return length(p)-s;
}

float Ellipsoid( vec3 p, vec3 r ) {
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

float rBox( vec3 p, vec3 b, float r ) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float Capsule( vec3 p, vec3 a, vec3 b, float r ) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}

float HollowSphere( vec3 p, float r, float h, float t ) {
    float w = sqrt(r*r-h*h);
    vec2 q = vec2( length(p.xz), p.y );
    return ((h*q.x<w*q.y) ? length(q-vec2(w,h)) :
                            abs(length(q)-r) ) - t;
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3
        f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u;
    return normalize(i);
}

// ── skull SDF ────────────────────────────────────────────────────────────────

float skull(vec3 p) {

    // === CRANIUM — hollow dome ===
    float cranium = Ellipsoid(p - vec3(0., 0.22, -0.05), vec3(1.05, 1.14, 0.97));
    // Hollow interior (thin shell)
    cranium = max(cranium, -Ellipsoid(p - vec3(0., 0.18, -0.08), vec3(0.90, 0.99, 0.82)));
    // Flat back
    cranium = max(cranium, p.z - 0.36);

    // === FACE VOLUME ===
    // Brow ridge
    float brow = Ellipsoid(p - vec3(0., 0.32, 0.82), vec3(0.74, 0.14, 0.18));
    cranium = sMin(cranium, brow, 0.13);

    // Cheekbones
    float lCheek = Ellipsoid(p - vec3(-0.70, -0.08, 0.52), vec3(0.32, 0.20, 0.30));
    float rCheek = Ellipsoid(p - vec3( 0.70, -0.08, 0.52), vec3(0.32, 0.20, 0.30));
    cranium = sMin(cranium, lCheek, 0.18);
    cranium = sMin(cranium, rCheek, 0.18);

    // Upper jaw / maxilla
    float maxilla = Ellipsoid(p - vec3(0., -0.42, 0.55), vec3(0.62, 0.22, 0.54));
    cranium = sMin(cranium, maxilla, 0.14);

    // === MANDIBLE (lower jaw) ===
    float chin = Ellipsoid(p - vec3(0., -0.92, 0.28), vec3(0.40, 0.20, 0.36));
    float lRamus = Capsule(p, vec3(-0.60, -0.30, 0.08), vec3(-0.62, -0.88, 0.24), 0.20);
    float rRamus = Capsule(p, vec3( 0.60, -0.30, 0.08), vec3( 0.62, -0.88, 0.24), 0.20);
    float mandible = sMin(chin, lRamus, 0.10);
    mandible       = sMin(mandible, rRamus, 0.10);
    // Gap between jaws (don't fully merge)
    float skull = sMin(cranium, mandible, 0.04);

    // === EYE SOCKETS ===
    float lEye = Sphere(p - vec3(-0.34, 0.22, 0.84), 0.25);
    float rEye = Sphere(p - vec3( 0.34, 0.22, 0.84), 0.25);
    skull = max(skull, -lEye);
    skull = max(skull, -rEye);

    // === NASAL APERTURE ===
    float nose = Ellipsoid(p - vec3(0., -0.05, 0.94), vec3(0.13, 0.17, 0.10));
    skull = max(skull, -nose);

    // === TEETH — upper row (pModPolar for uniform spacing) ===
    {
        vec3 pt = p;
        // Bring into teeth-row space: lower front of maxilla
        pt -= vec3(0., -0.58, 0.12);
        // Tilt slightly so teeth point forward
        pt.yz = Rot(0.22) * pt.yz;

        vec2 ptXZ = pt.xz;
        pModPolar(ptXZ, 16.0);   // 16 sectors → 16 upper teeth
        pt.xz = ptXZ;

        // Each tooth: a small rounded box at radius ~0.55
        float tooth = rBox(pt - vec3(0.55, 0., 0.), vec3(0.055, 0.10, 0.045), 0.025);
        skull = sMin(skull, tooth, 0.015);
    }

    // === TEETH — lower row ===
    {
        vec3 pt = p;
        pt -= vec3(0., -0.82, 0.12);
        pt.yz = Rot(-0.10) * pt.yz;

        vec2 ptXZ = pt.xz;
        pModPolar(ptXZ, 16.0);
        pt.xz = ptXZ;

        float tooth = rBox(pt - vec3(0.50, 0., 0.), vec3(0.050, 0.09, 0.040), 0.022);
        skull = sMin(skull, tooth, 0.012);
    }

    return skull;
}

// ── scene (applies animation to world-space point) ───────────────────────────

float scene(vec3 p) {
    // Slow auto-rotation (Y) + mouse tilt
    p.xz = Rot(-u_time * 0.20) * p.xz;
    vec2 m = u_mouse - 0.5;
    p.yz = Rot( m.y * 0.50) * p.yz;
    p.xy = Rot(-m.x * 0.35) * p.xy;
    // Gentle bob
    p.y += sin(u_time * 0.45) * 0.03;
    return skull(p);
}

// ── normal (finite differences) ──────────────────────────────────────────────

vec3 calcNormal(vec3 p) {
    vec2 h = vec2(0.001, 0.0);
    return normalize(vec3(
        scene(p + h.xyy) - scene(p - h.xyy),
        scene(p + h.yxy) - scene(p - h.yxy),
        scene(p + h.yyx) - scene(p - h.yyx)
    ));
}

// ── raymarcher ───────────────────────────────────────────────────────────────

float RM(vec3 ro, vec3 rd) {
    float d = 0.05;
    for (int i = 0; i < STEPS; i++) {
        float s = scene(ro + rd * d);
        if (abs(s) < EPS) break;
        d += s * 0.85;
        if (d > MAX_D) break;
    }
    return d;
}

// ── main ─────────────────────────────────────────────────────────────────────

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    vec3 ro = vec3(0., 0., 3.4);
    vec3 rd = GetRayDir(uv, ro, vec3(0., -0.1, 0.), 2.0);

    float d = RM(ro, rd);

    // Brand palette
    vec3 blood = vec3(0.784, 0.063, 0.180);  // #C8102E
    vec3 hot   = vec3(1.000, 0.122, 0.122);  // #FF1F1F

    vec3 col = vec3(0.0);  // pure black background

    if (d < MAX_D) {
        vec3 p = ro + rd * d;
        vec3 n = calcNormal(p);

        // Fresnel: peaks at silhouette edges and socket rims
        float fres = pow(1.0 - abs(dot(rd, n)), 2.5);

        // Very faint diffuse so 3D form reads in dark areas
        float diff = max(0.0, dot(n, normalize(vec3(0.5, 0.9, -0.3))));

        col  = blood * fres * 2.2;       // glowing red silhouette
        col += blood * diff * 0.04;      // barely-there form fill
        col += hot   * fres * fres * 0.5; // hot-red bloom on sharpest edges
    }

    // Dark blood-tinted fog for atmosphere
    float fog = 1.0 - exp(-0.00015 * max(d - 1.5, 0.0) * max(d - 1.5, 0.0));
    col = mix(col, vec3(0.02, 0.0, 0.005), fog);

    // Gamma
    col = pow(max(col, 0.0), vec3(0.4545));

    O = vec4(col, 1.0);
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

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uRes   = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

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
