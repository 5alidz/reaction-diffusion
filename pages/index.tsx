import Canvas, { Sketch } from 'components/Canvas';
import { constrain, laplace, presets } from 'lib/utils';

type GridItem = { a: number; b: number };

const sketch: Sketch = ({ ctx, canvas }) => {
  const { width, height } = canvas;
  const dA = 1;
  const dB = 0.5;
  const { feedRate, k } = presets.worms;

  let grid: GridItem[][] = [];
  let next: GridItem[][] = [];

  for (let x = 0; x < width; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }

  for (let i = 140; i < 160; i++) {
    for (let j = 140; j < 160; j++) {
      grid[i][j].b = 0.5;
    }
  }

  const getColorIndices = (x: number, y: number) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  };

  const pixels = ctx.createImageData(width, height);

  let isPressing = false;
  const draw = (x: number, y: number) => {
    if (isPressing && x > 0 && y > 0 && x < width && y < height) {
      grid[x][y].b = 1;
    }
  };
  canvas.addEventListener('mousedown', () => {
    isPressing = true;
  });
  canvas.addEventListener('mouseup', () => {
    isPressing = false;
  });
  canvas.addEventListener('mouseleave', () => {
    isPressing = false;
  });
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    draw(x, y);
  });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    draw(x, y);
  });

  return () => {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x < width - 1 && x > 0 && y < height - 1 && y > 0) {
          const a = grid[x][y].a;
          const b = grid[x][y].b;
          const newA = a + dA * laplace(grid, 'a', x, y) - a * b * b + feedRate * (1 - a);
          const newB = b + dB * laplace(grid, 'b', x, y) + a * b * b - (k + feedRate) * b;
          next[x][y].a = newA;
          next[x][y].b = newB;
        }
        const a = next[x][y].a;
        const b = next[x][y].b;
        const c = constrain(Math.floor((a - b) * 255), 0, 255);
        const indecies = getColorIndices(x, y);
        pixels.data[indecies[0]] = c;
        pixels.data[indecies[1]] = c;
        pixels.data[indecies[2]] = c;
        pixels.data[indecies[3]] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);

    const _ = grid;
    grid = next;
    next = _;
  };
};

export default function Home() {
  return (
    <main className='flex items-center justify-center h-screen'>
      <Canvas sketch={sketch} density={1} width={300} height={300} className='rounded-lg border' />
    </main>
  );
}
