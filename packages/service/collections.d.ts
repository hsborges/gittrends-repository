declare module 'collections/lfu-set' {
  export default class LfuSet<T = void> {
    has(value: T): boolean;
    get(value: T): T;
    add(value: T): void;

    constructor(
      values: [],
      capacity?: number,
      equals?: (a: T, b: T) => boolean,
      hash?: (a: t) => string
    );
  }
}
