import Canvas, { Sketch } from 'components/Canvas';
import { MdInfo } from 'react-icons/md';
import {
  constrain,
  laplace,
  presets,
  getColorIndices,
  populateInitialState,
  dropComponentB,
  GridItem,
  createFlatGridPoints,
  Presets,
} from 'lib/utils';
import { useState, useMemo } from 'react';

// *****************************************************************************************************
// this is where the magic happens
// credits -> https://www.karlsims.com/rd.html
// A'= A + (dA * laplacianFunctionA - A * B * B + feedRate(1 - A))
// B'= A + (dB * laplacianFunctionB + A * B * B - (k + f) * B)
const CALCULATE_NEXT = (
  grid: GridItem[][],
  x: number,
  y: number,
  prevA: number,
  prevB: number,
  preset: keyof Presets
) => {
  // experiment constants
  const dA = 1;
  const dB = 0.5;
  const { feedRate, k } = presets[preset];
  const nextA = prevA + dA * laplace(grid, 'a', x, y) - prevA * prevB * prevB + feedRate * (1 - prevA);
  const nextB = prevB + dB * laplace(grid, 'b', x, y) + prevA * prevB * prevB - (k + feedRate) * prevB;
  return [nextA, nextB];
};
// *****************************************************************************************************

const withPreset = (preset: keyof Presets) => {
  const sketch: Sketch = ({ ctx, canvas, config }) => {
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

    config.cleanup = () => {
      console.log('cleaned up events');
      canvas.removeEventListener('touchstart', touchEnableDroppingComponentB, false);
      canvas.removeEventListener('touchend', touchDisableDroppingComponentB, false);
      canvas.removeEventListener('touchcancel', touchDisableDroppingComponentB, false);
      canvas.removeEventListener('touchmove', drawFromTouch, false);
      canvas.removeEventListener('mousedown', enableDroppingComponentB);
      canvas.removeEventListener('mouseup', disableDroppingComponentB);
      canvas.removeEventListener('mouseleave', disableDroppingComponentB);
      canvas.removeEventListener('click', drawFromMouse);
      canvas.removeEventListener('mousemove', drawFromMouse);
    };

    return () => {
      for (let i = 0; i < flatGridPoints.length; i++) {
        const [x, y] = flatGridPoints[i];
        // ignores edges when calculating nextA and nextB
        if (x < width - 1 && x > 0 && y < height - 1 && y > 0) {
          const [nextA, nextB] = CALCULATE_NEXT(grid, x, y, grid[x][y].a, grid[x][y].b, preset);
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
  return sketch;
};

export default function Home() {
  const [currentPreset, setCurrentPreset] = useState<keyof Presets>('exotic');
  const [size, setSize] = useState(200);

  const sketchWithPreset = useMemo(() => {
    return withPreset(currentPreset);
  }, [currentPreset]);

  return (
    <main className='font-sans'>
      <div className='w-full h-2 bg-gray-900'></div>
      <div className='max-w-4xl mx-auto'>
        <div className='grid gap-4 py-8 px-4'>
          <h1 className='font-bold text-2xl tracking-wide text-gray-800'>Reaction Diffusion Simulation</h1>
          <p className='text-gray-800'>
            Credits:{' '}
            <a
              href='https://www.karlsims.com/rd.html'
              target='_blank'
              rel='noopener noreferrer'
              className='underline text-blue-500'
            >
              Karl Sims Tutorial
            </a>
          </p>
          <p className='text-gray-800'>Click/Touch and drag across the canvas to add more spots</p>
          <div>
            <h3 className='font-bold tracking-wide text-gray-800 pb-2'>Canvas Size</h3>
            <input type='range' min={100} max={400} value={size} onChange={(e) => setSize(parseInt(e.target.value))} />
            <div className='flex items-center justify-start'>
              <div className='bg-teal-200 text-blue-900 flex items-center justify-start px-2 py-1 rounded-lg'>
                <div className='pr-2'>
                  <MdInfo />
                </div>
                <div className='font-bold text-sm'>Smaller is faster</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className='font-bold tracking-wide text-gray-800 pb-2'>Presets</h3>
            <select
              className='border px-4 py-1 rounded-lg bg-white focus:outline-none focus:shadow-outline capitalize'
              value={currentPreset}
              onChange={(e) => {
                const value = e.target.value;
                const keys = Object.keys(presets);
                if (keys.includes(value)) {
                  setCurrentPreset(value as keyof Presets);
                }
              }}
            >
              {Object.keys(presets).map((preset) => {
                return (
                  <option value={preset} className='capitalize' key={preset}>
                    {preset}
                  </option>
                );
              })}
            </select>
          </div>
          <Canvas sketch={sketchWithPreset} density={1} width={size} height={size} className='rounded-lg border' />
        </div>
      </div>
    </main>
  );
}
