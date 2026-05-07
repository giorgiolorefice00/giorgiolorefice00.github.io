import { useEffect, useRef } from "react";

// Animated fire trail orbiting the email card border
// Brand palette: blood red #C8102E → hot red #FF1F1F

const FRAG = `#version 300 es
precision highp float;
out vec4 O;

uniform float u_time;
uniform vec2  u_resolution;

#define T u_time
#define R u_resolution
#define PI 3.14159265359

// ── noise ─────────────────────────────────────────────────────────────────────

float rand(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(rand(i),          rand(i + vec2(1,0)), u.x),
    mix(rand(i+vec2(0,1)),rand(i + vec2(1,1)), u.x),
    u.y
  );
}

// ── brand color ramp ──────────────────────────────────────────────────────────

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 dark = vec3(0.10, 0.00, 0.00);
  vec3 mid  = vec3(0.78, 0.06, 0.18);  // #C8102E
  vec3 hot  = vec3(1.00, 0.12, 0.12);  // #FF1F1F
  if (t < 0.5) return mix(dark, mid, t * 2.0);
  else          return mix(mid, hot, (t - 0.5) * 2.0);
}

// ── rounded-rect SDF ──────────────────────────────────────────────────────────

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// ── perimeter parameterization: angle proxy mapped onto box ───────────────────
//
// Instead of an exact arc-length parameterization (which is complex and
// bug-prone for rounded rects), we use a box-normalized angle:
//   angle  = atan2(y/hy, x/hx)   — uniform in "box space"
//   s      = angle / (2*PI)       — maps perimeter to [0, 1)
//
// This is NOT arc-length uniform (corners feel slightly faster) but it
// is continuous, bijective, and visually convincing.

float toS(vec2 p, vec2 half) {
  return fract(atan(p.y / half.y, p.x / half.x) / (2.0 * PI) + 1.0);
}

// Head position: given s∈[0,1], find the matching point on the box border.
// We reverse the angle proxy: compute angle from s, then project the unit
// direction onto the nearest border face.
vec2 sToPos(float s, vec2 half) {
  float angle = (s - 0.5) * 2.0 * PI;  // s=0 → right, s=0.5 → left
  vec2 d = vec2(cos(angle), sin(angle));
  // Project onto rounded-rect: scale so the direction hits the border
  // Use the box projection: divide by the largest normalized component
  float scale = min(half.x / abs(d.x + 1e-6), half.y / abs(d.y + 1e-6));
  return d * scale;
}

// ── main ──────────────────────────────────────────────────────────────────────

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * R) / R.y;

  float aspect = R.x / R.y;
  vec2  half   = vec2(aspect * 0.46, 0.44);
  float radius = 0.04;

  // Signed distance to the rounded rect border
  float d = sdRoundBox(uv, half, radius);

  // Clip pixels far from the border (outside glow range AND far inside)
  if (d > 0.14 || d < -0.12) {
    O = vec4(0.0);
    return;
  }

  // ── perimeter parameters ──
  float speed    = 0.22;   // orbits/sec
  float trailLen = 0.42;   // fraction of perimeter behind head
  float thick    = 0.016;  // border glow half-width in UV units

  float headS  = fract(T * speed);
  float pixelS = toS(uv, half);

  // Signed distance along perimeter: positive = pixel is behind the head
  float ds = fract(headS - pixelS + 1.0) - 0.5;
  // ds > 0: behind head (trail)  |  ds < 0: ahead of head (no trail)
  // ds == 0: at head position

  // Trail mask — bright behind head, fades toward tail, sharp front cutoff
  float trailMask = smoothstep(trailLen, 0.0, ds)   // fade tail → 0
                  * smoothstep(-0.01, 0.02, ds);      // sharp front cutoff

  // Only show trail on the border band
  float borderMask = smoothstep(thick, 0.0, abs(d));

  float trail = trailMask * borderMask;

  // ── head glow: bright dot at the head position ──
  vec2  headPos  = sToPos(headS, half);
  float headDist = length(uv - headPos);
  float glow     = 0.06;
  float headFire = exp(-headDist * headDist / (glow * glow));

  // Organic flicker along the trail
  float flicker = 0.75 + 0.25 * noise(vec2(pixelS * 10.0 + T * 0.3, T * 2.5));

  // Combine trail + head glow
  float intensity = (trail * 0.85 + headFire * 1.1) * flicker;

  // Subtle inner glow fills the card interior with a faint hue
  float innerGlow = smoothstep(-0.01, -0.10, d) * 0.05;
  intensity = max(intensity, innerGlow);

  vec3 col = ramp(clamp(intensity * 1.3, 0.0, 1.0));
  col = pow(max(col, 0.0), vec3(0.4545));  // gamma

  // Alpha: fire pixels are opaque, background transparent
  float alpha = clamp(intensity * 1.1, 0.0, 1.0);

  O = vec4(col, alpha);
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
        console.error("FireTrailFrame:", gl.getShaderInfoLog(sh));
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
      console.error("FireTrailFrame link:", gl.getProgramInfoLog(prog));
      return;
    }

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

    // Fix bug 3: use ResizeObserver so canvas always has real dimensions,
    // even if clientWidth is 0 at the moment useEffect first runs.
    const resize = () => {
      const w = Math.floor(canvas.clientWidth  * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);
    resize(); // attempt immediately; ResizeObserver fires again when layout settles

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e!.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else { t0Ref.current = performance.now(); rafRef.current = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);

    t0Ref.current = performance.now();

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!visible || document.hidden || canvas.width === 0 || canvas.height === 0) return;
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
      ro.disconnect();
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
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
