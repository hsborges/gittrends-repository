/*
 *  Author: Hudson S. Borges
 */
export default abstract class AbstractClass {
  constructor(object?: Record<string, any>) {
    Object.assign(this, object);
  }
}
