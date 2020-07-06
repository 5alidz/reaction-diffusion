/* handy when you want to do... nothing */
export const noop: () => void = () => undefined;
export const constrain = (n: number, min: number, max: number) => (n >= max ? max : n <= min ? min : n);
