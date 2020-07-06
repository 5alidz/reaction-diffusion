import Canvas, { Sketch } from 'components/Canvas';
import { constrain } from 'lib/utils';

type GridItem = { a: number; b: number };

const laplace = (grid: GridItem[][], component: 'a' | 'b', x: number, y: number) => {
  let sum = 0;
  sum += grid[x][y][component] * -1;
  sum += grid[x - 1][y][component] * 0.2;
  sum += grid[x + 1][y][component] * 0.2;
  sum += grid[x][y + 1][component] * 0.2;
  sum += grid[x][y - 1][component] * 0.2;
  sum += grid[x - 1][y - 1][component] * 0.05;
  sum += grid[x + 1][y - 1][component] * 0.05;
  sum += grid[x + 1][y + 1][component] * 0.05;
  sum += grid[x - 1][y + 1][component] * 0.05;
  return sum;
};

const presets = {
  uSkate: { feedRate: 0.062, k: 0.061 },
  mitosis: { feedRate: 0.0367, k: 0.0649 },
  coralGrowth: { feedRate: 0.0545, k: 0.062 },
  coralGrowth2: { feedRate: 0.06, k: 0.0613 },
  pulseMitosis: { feedRate: 0.025, k: 0.06 },
  maze: { feedRate: 0.029, k: 0.057 },
  holes: { feedRate: 0.039, k: 0.058 },
  movingSpots: { feedRate: 0.014, k: 0.054 },
  exotic: { feedRate: 0.018, k: 0.051 },
  worms: { feedRate: 0.078, k: 0.061 },
} as const;

const sketch: Sketch = ({ ctx, canvas }) => {
  const { width, height } = canvas;
  const dA = 1;
  const dB = 0.5;
  const { feedRate, k } = presets.coralGrowth2;

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

  for (let i = 240; i < 260; i++) {
    for (let j = 240; j < 260; j++) {
      grid[i][j].b = 0.5;
    }
  }

  const getColorIndices = (x: number, y: number) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  };

  const pixels = ctx.createImageData(width, height);

  return () => {
    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < height - 1; y++) {
        const a = grid[x][y].a;
        const b = grid[x][y].b;
        const newA = a + dA * laplace(grid, 'a', x, y) - a * b * b + feedRate * (1 - a);
        const newB = b + dB * laplace(grid, 'b', x, y) + a * b * b - (k + feedRate) * b;
        next[x][y].a = newA;
        next[x][y].b = newB;
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
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

    // swap grids
    const _ = grid;
    grid = next;
    next = _;
  };
};

export default function Home() {
  return (
    <main className='flex items-center justify-center h-screen'>
      <Canvas sketch={sketch} density={1} width={500} height={500} className='rounded-lg border' />
    </main>
  );
}
