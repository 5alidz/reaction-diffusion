/* handy when you want to do... nothing */
export const noop: () => void = () => undefined;
export const constrain = (n: number, min: number, max: number) => (n >= max ? max : n <= min ? min : n);

export const laplace = (grid: { a: number; b: number }[][], component: 'a' | 'b', x: number, y: number) => {
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

export const presets = {
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
