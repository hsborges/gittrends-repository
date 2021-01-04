/*
 *  Author: Hudson S. Borges
 */
export default interface Updater {
  update(): Promise<void>;
}
