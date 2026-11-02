'use strict';
const HUD = (() => {
  function heading(angle, width, left) {
    const total = Math.floor((angle & 65535) * 9 * width / 65536);
    const first = Math.floor(total / width);
    return {first, second: (first + 1) % 9, x: left - total % width};
  }
  function condition(damage) {
    const intact = ((256 - damage) * 100) >> 8;
    return intact >= 90 ? 0 : intact >= 74 ? 1 : intact >= 51 ? 2 : intact >= 1 ? 3 : 4;
  }
  function tint(damage, mode, key, colours) {
    const state = condition(damage);
    return [state, mode === 1 ? (state < 3 ? key : colours[state === 3 ? 6 : 17]) : colours[[12, 15, 20, 9, 18][state]]];
  }
  function recolour(pixels, width, rect, key, colour, mode, offset = [0, 0], block = [1, 1], background = 16) {
    const out = new Uint8Array(pixels);
    const [l, t, r, b] = rect.map((v, i) => v + offset[i % 2]);
    if (t < 0 || (mode === 0 || mode === 1) && key === colour) return out;
    const [bx, by] = block;
    for (let y = t; y <= b; y += by) for (let x = l; x <= r; x += bx) {
      const value = out[y * width + x];
      if (mode === 2 ? value === background : value !== key) continue;
      const result = mode === 2 ? (value + colour) & 255 : colour & 255;
      for (let yy = y; yy < y + by; ++yy) out.fill(result, yy * width + x, yy * width + x + bx);
    }
    return out;
  }
  function power(elapsed, kind, values) {
    if (kind === 'shield') return {shown: values.map(v => Math.min(elapsed | 0, v)), done: values.every(v => (elapsed | 0) >= v), dirty: 2};
    return {shown: elapsed > 50 ? values[0] : Math.min(elapsed * 25 | 0, values[0]), done: elapsed > 50};
  }
  return {heading, condition, tint, recolour, power};
})();
