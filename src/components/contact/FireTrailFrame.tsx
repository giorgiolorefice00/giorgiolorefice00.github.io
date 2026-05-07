import { useEffect, useRef } from "react";

// Fire trail traveling around a rounded rectangle perimeter
// Brand palette: blood red #C8102E core → #FF1F1F hot highlights

const FRAG = `#version 300 es
precision highp float;
out vec4 O;

uniform float u_time;
uniform vec2  u_resolution;

#define T u_time
#define R u_resolution

// ── noise ────────────────────────────────────────────────────────────────────

float rand(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(rand(i), rand(i + vec2(1,0)), u.x),
    mix(rand(i + vec2(0,1)), rand(i + 1.0), u.x),
    u.y
  );
}

// ── brand color ramp ──────────────────────────────────────────────────────────

vec3 ramp(float t) {
  t = max(t, 1e-4);
  vec3 core = vec3(0.04, 0.00, 0.00);   // near-black blood
  vec3 mid  = vec3(0.78, 0.06, 0.18);   // blood  #C8102E
  vec3 hot  = vec3(1.00, 0.12, 0.12);   // hot    #FF1F1F
  vec3 col;
  if      (t < 0.4) col = mix(core, mid, t / 0.4);
  else if (t < 0.8) col = mix(mid, hot, (t - 0.4) / 0.4);
  else               col = hot;
  return col / t;
}

// ── rounded-rect SDF ─────────────────────────────────────────────────────────

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// ── perimeter parameterization s∈[0,1] → position on rounded-rect boundary ──

vec2 perimeterPos(float s, vec2 half, float r) {
  // total perimeter: 4 straight edges + 4 quarter-circle corners
  float straight = 2.0 * (half.x - r) + 2.0 * (half.y - r);
  float curved   = 2.0 * 3.14159265 * r;
  float total    = 2.0 * straight + curved;

  // edge lengths in order: top, right, bottom, left (each half minus corner)
  float eTop   = (half.x - r) / total;
  float eRight = (half.y - r) / total;
  float eCrn   = (0.5 * 3.14159265 * r) / total;

  // map s → (edge, localT)
  // walk: top → top-right corner → right → bottom-right corner → bottom → bottom-left corner → left → top-left corner
  s = fract(s);

  vec2 pos;
  float acc = 0.0;

  // top edge: left→right at y=+half.y
  if (s < acc + eTop) {
    float lt = (s - acc) / eTop;
    pos = vec2(mix(-half.x + r, half.x - r, lt), half.y);
    return pos;
  } acc += eTop;

  // top-right corner
  if (s < acc + eCrn) {
    float lt = (s - acc) / eCrn;
    float a = mix(0.5 * 3.14159265, 0.0, lt);
    pos = vec2(half.x - r + cos(a) * r, half.y - r + sin(a) * r);
    return pos;
  } acc += eCrn;

  // right edge: top→bottom at x=+half.x
  if (s < acc + eRight) {
    float lt = (s - acc) / eRight;
    pos = vec2(half.x, mix(half.y - r, -half.y + r, lt));
    return pos;
  } acc += eRight;

  // bottom-right corner
  if (s < acc + eCrn) {
    float lt = (s - acc) / eCrn;
    float a = mix(0.0, -0.5 * 3.14159265, lt);
    pos = vec2(half.x - r + cos(a) * r, -half.y + r + sin(a) * r);
    return pos;
  } acc += eCrn;

  // bottom edge: right→left at y=-half.y
  if (s < acc + eTop) {
    float lt = (s - acc) / eTop;
    pos = vec2(mix(half.x - r, -half.x + r, lt), -half.y);
    return pos;
  } acc += eTop;

  // bottom-left corner
  if (s < acc + eCrn) {
    float lt = (s - acc) / eCrn;
    float a = mix(-0.5 * 3.14159265, -3.14159265, lt);
    pos = vec2(-half.x + r + cos(a) * r, -half.y + r + sin(a) * r);
    return pos;
  } acc += eCrn;

  // left edge: bottom→top at x=-half.x
  if (s < acc + eRight) {
    float lt = (s - acc) / eRight;
    pos = vec2(-half.x, mix(-half.y + r, half.y - r, lt));
    return pos;
  } acc += eRight;

  // top-left corner (remainder)
  {
    float lt = (s - acc) / eCrn;
    float a = mix(3.14159265, 0.5 * 3.14159265, lt);
    pos = vec2(-half.x + r + cos(a) * r, half.y - r + sin(a) * r);
    return pos;
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * R) / R.y;

  // Card geometry in UV space
  float aspect = R.x / R.y;
  vec2  half   = vec2(aspect * 0.48, 0.46);  // fills most of the canvas
  float radius = 0.04;

  // Distance to the rounded rect border
  float d = sdRoundBox(uv, half, radius);

  // Trail parameters
  float speed       = 0.28;           // full loop every ~3.5 s
  float trailLen    = 0.38;           // fraction of perimeter lit
  float thickness   = 0.018;          // border glow width
  float headGlow    = 0.055;          // extra glow at the trail head

  float headS = fract(T * speed);     // head position [0,1]

  // How far along the perimeter is this pixel? — approximate via atan2 around center
  // Exact parameterization is complex; use angular proxy + distance weighting
  vec2 dir = normalize(uv);
  float pixelAngle = atan(uv.y / half.y, uv.x / half.x); // normalized to box
  float pixelS = fract(pixelAngle / (2.0 * 3.14159265) + 0.5);

  // Distance in perimeter-parameter space (wrap-around)
  float ds = fract(headS - pixelS + 0.5) - 0.5; // signed, trail is behind head
  float trail = smoothstep(0.0, trailLen, ds + trailLen) *
                smoothstep(0.0, 0.02, -ds);       // sharp front

  // Only near the border
  float borderMask = smoothstep(thickness, 0.0, abs(d));

  // Head glow: bright spot at head position
  vec2  headPos    = perimeterPos(headS, half, radius);
  float headDist   = length(uv - headPos);
  float headFire   = exp(-headDist * headDist / (headGlow * headGlow));

  // Noise for organic flicker
  float flicker = 0.8 + 0.2 * noise(vec2(pixelS * 12.0, T * 3.0));

  // Combine
  float intensity = (trail * borderMask + headFire * 0.9) * flicker;

  // Faint inner glow inside the box
  float innerGlow = smoothstep(0.0, -0.08, d) * 0.06;
  intensity += innerGlow;

  vec3 col = ramp(clamp(intensity, 0.0, 1.0)) * intensity;

  // Gamma
  col = pow(max(col, 0.0), vec3(0.4545));

  O = vec4(col, intensity * 0.95 + innerGlow);
}
`;

const VERT = `#version 300 es
precision highp float;
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0., 1.); }
`;

export default function FireTrailFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const t0Ref     = useRef(0);

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
        console.error("FireTrailFrame shader error:", gl.getShaderInfoLog(sh));
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
      console.error("FireTrailFrame link error:", gl.getProgramInfoLog(prog));
      return;
    }

    // Enable alpha blending so the canvas is transparent where there's no fire
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_resolution");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const w = Math.floor(canvas.clientWidth  * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e!.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else { t0Ref.current = performance.now(); rafRef.current = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    t0Ref.current = performance.now();

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      resize();
      gl.useProgram(prog);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (now - t0Ref.current) / 1000);
      gl.uniform2f(uRes,  canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
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
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
