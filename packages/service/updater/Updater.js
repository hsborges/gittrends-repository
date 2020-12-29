/*
 *  Author: Hudson S. Borges
 */
module.exports = class Updater {
  async update() {
    throw new Error('Updater.run() must be override!');
  }
};
