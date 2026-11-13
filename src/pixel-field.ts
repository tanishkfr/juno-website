/**
 * A field of grid-snapped pixels that lights up where the pointer travels and
 * fades behind it. Cells are anchored to the page (so they scroll with it) and
 * drawn on one fixed canvas. The loop only runs while something is fading.
 */
const CELL = 18;
const FADE_MS = 620;

type Cell = { x: number; y: number; life: number; size: number };

export type PixelField = {
  /** Light a cell at viewport coordinates. */
  spawn(clientX: number, clientY: number, life?: number): void;
  setColor(color: string): void;
};

export function createPixelField(reducedMotion: MediaQueryList): PixelField {
  const canvas = document.createElement("canvas");
  canvas.className = "pixel-field";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const context = canvas.getContext("2d")!;
  const cells = new Map<string, Cell>();
  let color = "#b84a3a";
  let running = false;
  let last = 0;
  let pointerX = -1;
  let pointerY = -1;
  let previousX = -1;
  let previousY = -1;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }

  function light(pageX: number, pageY: number, life: number, size = 1) {
    const x = Math.floor(pageX / CELL);
    const y = Math.floor(pageY / CELL);
    const key = `${x},${y}`;
    const existing = cells.get(key);
    if (existing) existing.life = Math.max(existing.life, life);
    else cells.set(key, { x, y, life, size });
  }

  function draw(elapsed: number) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    context.fillStyle = color;
    for (const [key, cell] of cells) {
      cell.life -= elapsed / FADE_MS;
      if (cell.life <= 0) {
        cells.delete(key);
        continue;
      }
      // Fade in four visible steps so the trail reads as pixels, not a blur.
      context.globalAlpha = (Math.ceil(cell.life * 4) / 4) * 0.5;
      const inset = cell.size < 1 ? (CELL * (1 - cell.size)) / 2 : 0;
      context.fillRect(
        cell.x * CELL - scrollX + inset,
        cell.y * CELL - scrollY + inset,
        CELL - inset * 2,
        CELL - inset * 2,
      );
    }
    if (pointerX >= 0) {
      // The cell under the pointer: a snapped reticle.
      context.globalAlpha = 0.9;
      context.strokeStyle = color;
      context.lineWidth = 2;
      const x = Math.floor((pointerX + scrollX) / CELL) * CELL - scrollX;
      const y = Math.floor((pointerY + scrollY) / CELL) * CELL - scrollY;
      context.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
    }
    context.globalAlpha = 1;
  }

  function frame(now: number) {
    const elapsed = Math.min(64, now - last);
    last = now;
    draw(elapsed);
    if (cells.size) requestAnimationFrame(frame);
    else running = false;
  }

  function wake() {
    if (running || reducedMotion.matches) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      const pageX = pointerX + window.scrollX;
      const pageY = pointerY + window.scrollY;
      if (previousX >= 0) {
        // Fill the path between events so a fast flick leaves no gaps, and
        // scatter a few half-size sparks that grow with speed.
        const distance = Math.hypot(pageX - previousX, pageY - previousY);
        const steps = Math.min(24, Math.ceil(distance / CELL));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          light(
            previousX + (pageX - previousX) * t,
            previousY + (pageY - previousY) * t,
            0.55 + 0.45 * t,
          );
        }
        const sparks = Math.min(4, Math.floor(distance / 26));
        for (let i = 0; i < sparks; i++)
          light(
            pageX + (Math.random() - 0.5) * CELL * 5,
            pageY + (Math.random() - 0.5) * CELL * 5,
            0.5 + Math.random() * 0.3,
            0.5,
          );
      }
      previousX = pageX;
      previousY = pageY;
      wake();
      if (!running) draw(0);
    },
    { passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const pageX = event.clientX + window.scrollX;
      const pageY = event.clientY + window.scrollY;
      for (const [dx, dy] of [
        [0, -2],
        [2, 0],
        [0, 2],
        [-2, 0],
        [1, -1],
        [1, 1],
        [-1, 1],
        [-1, -1],
      ])
        light(pageX + dx * CELL, pageY + dy * CELL, 1);
      wake();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    pointerX = pointerY = previousX = previousY = -1;
    if (!running) draw(0);
  });
  window.addEventListener(
    "scroll",
    () => {
      if (!running && (cells.size || pointerX >= 0)) draw(0);
    },
    { passive: true },
  );
  window.addEventListener("resize", resize);
  reducedMotion.addEventListener("change", () => {
    cells.clear();
    pointerX = -1;
    draw(0);
  });
  resize();

  return {
    spawn(clientX, clientY, life = 0.8) {
      if (reducedMotion.matches) return;
      light(clientX + window.scrollX, clientY + window.scrollY, life, 0.5);
      wake();
    },
    setColor(next) {
      color = next;
    },
  };
}
