import { memoize } from './memoize';

const regexp = /-([a-z])/g;

export const camelCase = memoize((str = '') => {
  return str.replace(regexp, (g) => g[1].toUpperCase());
});

export const kebabize = (str: string) => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter;
    })
    .join('');
};
