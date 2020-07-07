export const noop: () => void = () => undefined;

export type GridItem = { a: number; b: number };

export const constrain = (n: number, min: number, max: number) => (n >= max ? max : n <= min ? min : n);

export const convMatrixFromGrid = (
  grid: { a: number; b: number }[][],
  sx: number,
  sy: number,
  callback: (item: GridItem | undefined) => void
) => {
  callback(grid[sx][sy]);
  callback(grid[sx - 1][sy]);
  callback(grid[sx + 1][sy]);
  callback(grid[sx][sy + 1]);
  callback(grid[sx][sy - 1]);
  callback(grid[sx - 1][sy - 1]);
  callback(grid[sx - 1][sy + 1]);
  callback(grid[sx + 1][sy - 1]);
  callback(grid[sx + 1][sy + 1]);
};

export const laplace = (grid: GridItem[][], component: 'a' | 'b', x: number, y: number) => {
  let sum = 0;
  sum += grid[x][y][component] * -1;
  sum += grid[x - 1][y][component] * 0.2;
  sum += grid[x + 1][y][component] * 0.2;
  sum += grid[x][y + 1][component] * 0.2;
  sum += grid[x][y - 1][component] * 0.2;
  sum += grid[x - 1][y - 1][component] * 0.05;
  sum += grid[x - 1][y + 1][component] * 0.05;
  sum += grid[x + 1][y - 1][component] * 0.05;
  sum += grid[x + 1][y + 1][component] * 0.05;
  return sum;
};

export type PresetConstants = { feedRate: number; k: number };

export type Presets = {
  uSkate: PresetConstants;
  mitosis: PresetConstants;
  coralGrowth: PresetConstants;
  coralGrowth2: PresetConstants;
  pulseMitosis: PresetConstants;
  maze: PresetConstants;
  holes: PresetConstants;
  movingSpots: PresetConstants;
  exotic: PresetConstants;
  worms: PresetConstants;
};

export const presets: Presets = Object.freeze({
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
} as const);

export const getColorIndices = (x: number, y: number, width: number) => {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
};

export const populateInitialState = (width: number, height: number) => {
  const grid: GridItem[][] = [];
  const next: GridItem[][] = [];
  const center = width / 2;

  // initial grid state
  for (let x = 0; x < width; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
      // populate small spot with component b
      if (x > center - 10 && x < center + 10 && y > center - 10 && y < center + 10) {
        grid[x][y].b = 0.5;
      }
    }
  }

  return [grid, next];
};

export const dropComponentB = (grid: GridItem[][], x: number, y: number) => {
  convMatrixFromGrid(grid, x, y, (item) => {
    if (item) {
      item.b = 0.5;
    }
  });
};

export const createFlatGridPoints = (gridWidth: number, gridHeight: number) => {
  const flatGridArray = [];
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      flatGridArray.push([x, y]);
    }
  }
  return flatGridArray;
};

/* trigger redeploy */
