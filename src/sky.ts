/**
 * The sky behind the whole page: one small WebGL canvas, drawn at one fragment
 * per on-screen "pixel" and scaled up crisp, so the dithered clouds cost almost
 * nothing. Scrolling moves the time of day — morning at the top of the page,
 * dusk, a starry night with an aurora, and dawn again at the bottom.
 *
 * Sections declare the hour they sit under with `data-hour`; the sky
 * interpolates between them from the scroll position.
 */

type Key = {
  hour: number;
  /** Five colours, darkest to lightest, that the clouds are dithered across. */
  palette: [string, string, string, string, string];
  base: number;
  cloud: number;
  gradient: number;
  stars: number;
  aurora: number;
  /** x, y in viewport fractions (y down), visibility. */
  sun: [number, number, number];
  moon: [number, number, number];
};

const NIGHT: Key["palette"] = ["#04060c", "#070c1c", "#0b1636", "#132658", "#27468f"];
const KEYS: Key[] = [
  {
    hour: 6.5,
    palette: ["#4874d2", "#648fe3", "#86a9ee", "#b4caf6", "#f5f8ff"],
    base: 0.4,
    cloud: 1,
    gradient: 0.05,
    stars: 0,
    aurora: 0,
    sun: [0.76, 0.22, 1],
    moon: [0.93, 0.2, 0],
  },
  {
    hour: 11.5,
    palette: ["#4470d0", "#5f8be1", "#7fa4ec", "#aac3f5", "#f1f6ff"],
    base: 0.37,
    cloud: 0.95,
    gradient: 0,
    stars: 0,
    aurora: 0,
    sun: [0.87, 0.14, 1],
    moon: [0.93, 0.2, 0],
  },
  {
    hour: 15.5,
    palette: ["#315cc1", "#4572d4", "#5f8ae1", "#86a8ee", "#dde8fc"],
    base: 0.32,
    cloud: 0.7,
    gradient: 0.1,
    stars: 0,
    aurora: 0,
    sun: [0.9, 0.34, 1],
    moon: [0.93, 0.2, 0],
  },
  {
    hour: 18.4,
    palette: ["#182f70", "#223f8f", "#2d54ae", "#4b74cf", "#b7ccf6"],
    base: 0.26,
    cloud: 0.5,
    gradient: 0.3,
    stars: 0.05,
    aurora: 0,
    sun: [0.85, 0.8, 1],
    moon: [0.93, 0.2, 0],
  },
  {
    hour: 20.3,
    palette: NIGHT,
    base: 0.24,
    cloud: 0.32,
    gradient: 0.42,
    stars: 1,
    aurora: 0,
    sun: [0.84, 1.15, 0],
    moon: [0.93, 0.22, 1],
  },
  {
    hour: 24.6,
    palette: NIGHT,
    base: 0.3,
    cloud: 0.3,
    gradient: 0.1,
    stars: 1,
    aurora: 0,
    sun: [0.84, 1.15, 0],
    moon: [0.93, 0.16, 1],
  },
  {
    hour: 26,
    palette: NIGHT,
    base: 0.2,
    cloud: 0.3,
    gradient: 0.1,
    stars: 1,
    aurora: 1,
    sun: [0.84, 1.15, 0],
    moon: [0.93, 0.14, 1],
  },
  {
    hour: 28.3,
    palette: NIGHT,
    base: 0.24,
    cloud: 0.3,
    gradient: 0.3,
    stars: 1,
    aurora: 0,
    sun: [0.84, 1.15, 0],
    moon: [0.92, 0.2, 1],
  },
  {
    hour: 29.6,
    palette: ["#0a1840", "#1a3684", "#2f58b8", "#4f7bd6", "#86a8ee"],
    base: 0.36,
    cloud: 0.16,
    gradient: 1.25,
    stars: 0.25,
    aurora: 0,
    sun: [0.84, 1.15, 0],
    moon: [0.9, 0.3, 0],
  },
  {
    hour: 30.4,
    palette: ["#0a1840", "#1a3684", "#2f58b8", "#4f7bd6", "#86a8ee"],
    base: 0.36,
    cloud: 0.16,
    gradient: 1.25,
    stars: 0.2,
    aurora: 0,
    sun: [0.84, 1.15, 0],
    moon: [0.9, 0.3, 0],
  },
];

const VERTEX = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time, u_scroll;
uniform vec3 u_pal[5];
uniform float u_base, u_cloud, u_grad, u_stars, u_aurora;
uniform vec3 u_sun, u_moon;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.3, 9.1); a *= .5; }
  return v;
}
float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float bayer4(vec2 a){ return bayer2(.5 * a) * .25 + bayer2(a); }
vec3 pal(float i){
  if (i < .5) return u_pal[0];
  if (i < 1.5) return u_pal[1];
  if (i < 2.5) return u_pal[2];
  if (i < 3.5) return u_pal[3];
  return u_pal[4];
}
float big(vec2 c){ return step(.9993, hash(c * 1.37 + 11.)); }

void main(){
  vec2 cell = floor(gl_FragCoord.xy);
  cell.y = u_res.y - 1. - cell.y;
  vec2 uv = (cell + .5) / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float th = bayer4(cell);

  // Clouds: warped fractal noise, drifting slowly and sliding with the scroll.
  vec2 q = p * vec2(.95, 1.5) + vec2(u_time * .010, u_scroll * .42);
  float warp = fbm(q * 1.6 + vec2(0., u_time * .006));
  float n = fbm(q + warp * .7);
  float tone = u_base + (n - .5) * 2.7 * u_cloud + (uv.y - .5) * u_grad;

  vec2 sc = u_sun.xy * u_res;
  float sd = distance(cell, sc);
  float sr = max(5., u_res.y * .045);
  tone += u_sun.z * .75 * exp(-sd / (sr * 2.4));

  vec2 mc = u_moon.xy * u_res;
  float md = distance(cell, mc);
  float mr = max(4., u_res.y * .036);
  tone += u_moon.z * .5 * exp(-md / (mr * 2.6));

  float lv = clamp(tone, 0., .999) * 4.;
  float fi = floor(lv);
  vec3 col = pal(fi + step(th + .031, lv - fi));

  if (u_aurora > .001) {
    float band = .64 + .07 * sin(p.x * 1.1 + u_time * .05 + 1.)
               + .035 * sin(p.x * 2.9 - u_time * .04) + uv.x * .06;
    float dy = band - uv.y;
    float curtain = fbm(vec2(p.x * 9. + u_time * .05, u_time * .04));
    float a = dy > 0.
      ? exp(-dy * (7. + 22. * (1. - curtain))) * (.25 + .9 * curtain)
      : exp(dy * 45.);
    float al = clamp(a * u_aurora, 0., .999) * 3.;
    float ai = floor(al) + step(th + .031, al - floor(al));
    if (ai > .5)
      col = ai < 1.5 ? vec3(.05, .27, .30) : ai < 2.5 ? vec3(.13, .52, .48) : vec3(.36, .80, .62);
  }

  if (u_stars > .001) {
    vec2 s = cell + vec2(0., floor(u_scroll * u_res.y * .12));
    float h = hash(s * .731 + 3.1);
    float twinkle = .55 + .45 * sin(u_time * 1.6 + h * 90.);
    if (h > 1. - .0055 * u_stars) col = mix(col, vec3(.72, .82, 1.), twinkle * u_stars);
    float centre = big(s);
    float arms = big(s + vec2(1., 0.)) + big(s - vec2(1., 0.)) + big(s + vec2(0., 1.)) + big(s - vec2(0., 1.));
    if (centre > 0.) col = mix(col, vec3(1.), u_stars);
    else if (arms > 0.) col = mix(col, vec3(.62, .76, 1.), u_stars * (.5 + .5 * twinkle));
  }

  if (u_sun.z > .01) {
    if (sd < sr) col = mix(col, vec3(.96, .98, 1.), u_sun.z);
    // A thin streak of light running off to the right of the sun.
    float along = (cell.x - sc.x - sr) / max(1., u_res.x - sc.x - sr);
    if (abs(cell.y - floor(sc.y)) < .5 && along > .04) {
      float dash = hash(vec2(floor(cell.x / (1. + along * 3.)), 7.));
      if (dash > along * .85) col = mix(col, vec3(.96, .98, 1.), u_sun.z * .9);
    }
  }
  if (u_moon.z > .01 && md < mr && distance(cell, mc + vec2(-mr * .55, -mr * .18)) > mr * .95)
    col = mix(col, vec3(.86, .92, 1.), u_moon.z);

  gl_FragColor = vec4(col, 1.);
}`;

const rgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type Sky = {
  /** Tell the sky where the page is scrolled to. */
  update(scrollY: number): void;
};

export function createSky(
  reducedMotion: MediaQueryList,
  onHour: (hour: number, night: boolean) => void,
): Sky {
  const root = document.documentElement;
  const canvas = document.getElementById("sky") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
  });

  let anchors: { y: number; hour: number }[] = [];
  function measure() {
    const viewport = window.innerHeight;
    anchors = [...document.querySelectorAll<HTMLElement>("[data-hour]")]
      .map((element) => {
        const top = element.getBoundingClientRect().top + window.scrollY;
        return {
          y: Math.max(
            0,
            top + Math.min(element.offsetHeight, viewport) / 2 - viewport / 2,
          ),
          hour: Number(element.dataset.hour),
        };
      })
      .sort((a, b) => a.y - b.y);
  }
  function hourAt(y: number) {
    if (!anchors.length) return KEYS[0].hour;
    if (y <= anchors[0].y) return anchors[0].hour;
    for (let i = 1; i < anchors.length; i++) {
      const next = anchors[i];
      if (y > next.y) continue;
      const previous = anchors[i - 1];
      return mix(
        previous.hour,
        next.hour,
        (y - previous.y) / Math.max(1, next.y - previous.y),
      );
    }
    return anchors[anchors.length - 1].hour;
  }

  let scroll = window.scrollY;
  let lastHour = -1;
  function state() {
    const hour = hourAt(scroll);
    let index = 1;
    while (index < KEYS.length - 1 && KEYS[index].hour < hour) index++;
    const a = KEYS[index - 1];
    const b = KEYS[index];
    const t = Math.min(1, Math.max(0, (hour - a.hour) / (b.hour - a.hour)));
    const palette = a.palette.flatMap((colour, i) => {
      const from = rgb(colour);
      const to = rgb(b.palette[i]);
      return from.map((channel, c) => mix(channel, to[c], t));
    });
    if (hour !== lastHour) {
      lastHour = hour;
      onHour(hour, hour > 17.6 && hour < 29.3);
    }
    return {
      palette,
      base: mix(a.base, b.base, t),
      cloud: mix(a.cloud, b.cloud, t),
      gradient: mix(a.gradient, b.gradient, t),
      stars: mix(a.stars, b.stars, t),
      aurora: mix(a.aurora, b.aurora, t),
      sun: a.sun.map((value, i) => mix(value, b.sun[i], t)),
      moon: a.moon.map((value, i) => mix(value, b.moon[i], t)),
    };
  }

  if (!gl) {
    // No WebGL: the page keeps the painted gradient from the stylesheet.
    canvas.hidden = true;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return {
      update(y) {
        scroll = y;
        state();
      },
    };
  }

  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.hidden = true;
    return { update() {} };
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    res: uniform("u_res"),
    time: uniform("u_time"),
    scroll: uniform("u_scroll"),
    pal: uniform("u_pal"),
    base: uniform("u_base"),
    cloud: uniform("u_cloud"),
    grad: uniform("u_grad"),
    stars: uniform("u_stars"),
    aurora: uniform("u_aurora"),
    sun: uniform("u_sun"),
    moon: uniform("u_moon"),
  };

  let width = 0;
  let height = 0;
  function resize() {
    // Smaller sky pixels on small screens keep the texture in proportion.
    const cell = window.innerWidth < 700 ? 5 : 6;
    const nextWidth = Math.ceil(window.innerWidth / cell);
    const nextHeight = Math.ceil(window.innerHeight / cell);
    measure();
    // Ignore the small height changes of a mobile address bar.
    if (nextWidth === width && Math.abs(nextHeight - height) < 24) return;
    width = nextWidth;
    height = nextHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * cell}px`;
    canvas.style.height = `${height * cell}px`;
    gl!.viewport(0, 0, width, height);
  }

  const started = performance.now();
  function draw() {
    const s = state();
    const context = gl!;
    context.uniform2f(u.res, width, height);
    context.uniform1f(
      u.time,
      reducedMotion.matches ? 0 : (performance.now() - started) / 1000,
    );
    context.uniform1f(u.scroll, scroll / Math.max(1, window.innerHeight));
    context.uniform3fv(u.pal, new Float32Array(s.palette));
    context.uniform1f(u.base, s.base);
    context.uniform1f(u.cloud, s.cloud);
    context.uniform1f(u.grad, s.gradient);
    context.uniform1f(u.stars, s.stars);
    context.uniform1f(u.aurora, s.aurora);
    context.uniform3f(u.sun, s.sun[0], s.sun[1], s.sun[2]);
    context.uniform3f(u.moon, s.moon[0], s.moon[1], s.moon[2]);
    context.drawArrays(context.TRIANGLES, 0, 3);
  }

  // The clouds drift at a gentle 24fps; with reduced motion or a hidden tab the
  // sky only redraws when the page scrolls.
  let timer: ReturnType<typeof setInterval> | undefined;
  let pending = false;
  function request() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      draw();
    });
  }
  function sync() {
    clearInterval(timer);
    timer = undefined;
    if (!reducedMotion.matches && !document.hidden)
      timer = setInterval(request, 1000 / 24);
    request();
  }
  window.addEventListener("resize", () => {
    resize();
    request();
  });
  window.addEventListener("load", () => {
    measure();
    request();
  });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  canvas.addEventListener("webglcontextlost", (event) => event.preventDefault());
  resize();
  sync();
  root.classList.add("sky-on");

  return {
    update(y) {
      scroll = y;
      request();
    },
  };
}
