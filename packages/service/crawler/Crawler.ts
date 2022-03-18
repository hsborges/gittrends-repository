import EventEmitter from 'events';

/*
 *  Author: Hudson S. Borges
 */
export default interface Crawler extends EventEmitter {
  collect(): Promise<void>;
}
