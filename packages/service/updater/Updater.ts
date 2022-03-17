import EventEmitter from 'events';

/*
 *  Author: Hudson S. Borges
 */
export default interface Updater extends EventEmitter {
  update(): Promise<void>;
}
