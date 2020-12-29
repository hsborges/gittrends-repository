/*
 *  Author: Hudson S. Borges
 */
const { chunk } = require('lodash');
const { knex } = require('@gittrends/database-config');
const { actors: ActorsDAO, metadata: MetadataDAO } = require('./dao');
const { RetryableError } = require('../helpers/errors');

const Updater = require('./Updater');
const Query = require('../github/graphql/Query');
const ActorComponent = require('../github/graphql/components/ActorComponent');

module.exports = class ActorsUpdater extends Updater {
  constructor(id) {
    super();
    this.id = id;
  }

  async $update(ids) {
    await Query.create()
      .compose(...ids.map((id, index) => ActorComponent.create({ id, alias: `actor_${index}` })))
      .then(({ _, actors }) =>
        knex.transaction((trx) =>
          Promise.all([
            ActorsDAO.upsert(actors, trx),
            MetadataDAO.upsert(
              actors.map((actor) => ({
                id: actor.id,
                resource: 'actor',
                key: 'updatedAt',
                value: new Date().toISOString()
              })),
              trx
            )
          ])
        )
      )
      .catch((err) => {
        if (err instanceof RetryableError) {
          if (ids.length > 1) {
            return Promise.mapSeries(chunk(ids, Math.ceil(ids.length / 2)), (_ids) =>
              this.$update(_ids)
            );
          }

          const meta = { id: ids[0], resource: 'actor' };
          return MetadataDAO.upsert([
            { ...meta, key: 'error', value: err.message },
            { ...meta, key: 'updatedAt', value: new Date().toISOString() }
          ]);
        }

        throw err;
      });
  }

  async update() {
    return this.$update(Array.isArray(this.id) ? this.id : [this.id]);
  }
};
