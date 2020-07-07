import Canvas, { Sketch } from 'components/Canvas';
import {
  constrain,
  laplace,
  presets,
  getColorIndices,
  populateInitialState,
  dropComponentB,
  GridItem,
  createFlatGridPoints,
} from 'lib/utils';

// *****************************************************************************************************
// this is where the magic happens
// credits -> https://www.karlsims.com/rd.html
// A'= A + (dA * laplacianFunctionA - A * B * B + feedRate(1 - A))
// B'= A + (dB * laplacianFunctionB + A * B * B - (k + f) * B)
const CALCULATE_NEXT = (grid: GridItem[][], x: number, y: number, prevA: number, prevB: number) => {
  // experiment constants
  const dA = 1;
  const dB = 0.5;
  const { feedRate, k } = presets.exotic;
  const nextA = prevA + dA * laplace(grid, 'a', x, y) - prevA * prevB * prevB + feedRate * (1 - prevA);
  const nextB = prevB + dB * laplace(grid, 'b', x, y) + prevA * prevB * prevB - (k + feedRate) * prevB;
  return [nextA, nextB];
};
// *****************************************************************************************************

const sketch: Sketch = ({ ctx, canvas }) => {
  const { width, height } = canvas;

  // flatten grid loop for better perf O(n) instead of O(n^2)
  const flatGridPoints = createFlatGridPoints(width, height);

  // prepare canvas pixels
  const pixels = ctx.createImageData(width, height);

  // initialize state and state utils
  const state = { isPressing: false };
  const setIsPressing = (newState: boolean) => (state.isPressing = newState);
  const disableDroppingComponentB = () => setIsPressing(false);
  const enableDroppingComponentB = () => setIsPressing(true);

  // grid state, populates the grid initial state
  let [grid, next] = populateInitialState(width, height);
  const progressGridState = () => {
    let _: null | GridItem[][] = grid;
    grid = next;
    next = _;
    _ = null;
  };

  const draw = (x: number, y: number) => {
    const isValidSpot = x > 0 && y > 0 && x < width && y < height;
    if (state.isPressing && isValidSpot) {
      dropComponentB(grid, x, y);
    }
  };

  function drawFromTouch(e: TouchEvent) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    draw(Math.floor(e.touches[0].clientX - rect.left), Math.floor(e.touches[0].clientY - rect.top));
  }
  function drawFromMouse(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    draw(Math.floor(e.clientX - rect.left), Math.floor(e.clientY - rect.top));
  }
  function touchEnableDroppingComponentB(e: TouchEvent) {
    e.preventDefault();
    enableDroppingComponentB();
  }
  function touchDisableDroppingComponentB(e: TouchEvent) {
    e.preventDefault();
    disableDroppingComponentB();
  }

  // handle mobile touch events
  canvas.addEventListener('touchstart', touchEnableDroppingComponentB, false);
  canvas.addEventListener('touchend', touchDisableDroppingComponentB, false);
  canvas.addEventListener('touchcancel', touchDisableDroppingComponentB, false);
  canvas.addEventListener('touchmove', drawFromTouch, false);
  // handle mouse events
  canvas.addEventListener('mousedown', enableDroppingComponentB);
  canvas.addEventListener('mouseup', disableDroppingComponentB);
  canvas.addEventListener('mouseleave', disableDroppingComponentB);
  canvas.addEventListener('click', drawFromMouse);
  canvas.addEventListener('mousemove', drawFromMouse);

  return () => {
    for (let i = 0; i < flatGridPoints.length; i++) {
      const [x, y] = flatGridPoints[i];
      // ignores edges when calculating nextA and nextB
      if (x < width - 1 && x > 0 && y < height - 1 && y > 0) {
        const [nextA, nextB] = CALCULATE_NEXT(grid, x, y, grid[x][y].a, grid[x][y].b);
        next[x][y].a = nextA;
        next[x][y].b = nextB;
      }
      const a = next[x][y].a;
      const b = next[x][y].b;
      const color = constrain(Math.floor((a - b) * 255), 0, 255);
      const indecies = getColorIndices(x, y, width);
      /* Red   */ pixels.data[indecies[0]] = color;
      /* Green */ pixels.data[indecies[1]] = color;
      /* Blue  */ pixels.data[indecies[2]] = color;
      /* Alpha */ pixels.data[indecies[3]] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    progressGridState();
  };
};

export default function Home() {
  return (
    <main className='flex items-center justify-center h-screen'>
      <Canvas sketch={sketch} density={1} width={300} height={300} className='rounded-lg border' />
    </main>
  );
}
