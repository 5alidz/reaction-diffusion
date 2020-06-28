/* handy when you want to do... nothing */
export const noop: () => void = () => undefined;

/*
  merge classNames with support for conditional classNames.
  usage example:
    cls('px-4 py-2', [condition, 'apply-this', 'otherwise apply this'], [condition, 'apply-this']);
*/
export function cls(...classesToMerge: (null | undefined | string | [boolean, string, string?])[]): string {
  const classes: string[] = [];
  for (let i = 0; i < classesToMerge.length; i++) {
    const current = classesToMerge[i];
    if (Array.isArray(current)) {
      const [condition, className, fallbackClassName] = current;
      if (condition && className && typeof className === 'string') {
        classes.push(className.trim());
      } else if (!condition && fallbackClassName && typeof fallbackClassName === 'string') {
        classes.push(fallbackClassName.trim());
      }
    } else if (typeof current === 'string' && current.length > 0) {
      classes.push(current.trim());
    }
  }
  return classes.join(' ');
}
